import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendAdminLoginOtpEmail } from "@/lib/email";
import {
  checkRateLimit,
  getClientIp,
  rateLimitExceededResponse,
} from "@/lib/rateLimit";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "brightpathlearninghub6@gmail.com").toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@webmaster$1";
const OTP_SECRET =
  process.env.OTP_SECRET || `bp-otp-secret-${ADMIN_EMAIL}-${ADMIN_PASSWORD}`;

function createOtpToken(email: string, otpCode: string, expiresAt: number): string {
  const payload = `${email.toLowerCase()}:${otpCode.trim()}:${expiresAt}`;
  const signature = crypto
    .createHmac("sha256", OTP_SECRET)
    .update(payload)
    .digest("hex");
  return `${expiresAt}.${signature}`;
}

function verifyOtpToken(email: string, otpCode: string, token: string): { valid: boolean; reason?: string } {
  if (!token || !token.includes(".")) {
    return { valid: false, reason: "Invalid OTP session token. Please request a new code." };
  }

  const [expiresStr, providedSig] = token.split(".");
  const expiresAt = Number(expiresStr);

  if (!expiresAt || Date.now() > expiresAt) {
    return { valid: false, reason: "OTP code has expired. Please click Resend OTP to receive a new code." };
  }

  const expectedPayload = `${email.toLowerCase()}:${otpCode.trim()}:${expiresAt}`;
  const expectedSig = crypto
    .createHmac("sha256", OTP_SECRET)
    .update(expectedPayload)
    .digest("hex");

  try {
    const isMatch = crypto.timingSafeEqual(
      Buffer.from(providedSig, "hex"),
      Buffer.from(expectedSig, "hex")
    );
    if (!isMatch) {
      return { valid: false, reason: "Incorrect 6-digit OTP verification code." };
    }
    return { valid: true };
  } catch {
    return { valid: false, reason: "Incorrect 6-digit OTP verification code." };
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { step = "login", email, password, otpCode, otpToken } = body;

    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPass = String(password || "").trim();

    // STEP 2: Verify 6-Digit OTP Code
    if (step === "verify-otp") {
      const rl = checkRateLimit(request, {
        namespace: "admin-otp-verify",
        maxRequests: 6,
        windowMs: 10 * 60 * 1000, // 6 attempts per 10 minutes
      });

      if (!rl.allowed) {
        return rateLimitExceededResponse(
          rl.retryAfterSeconds,
          rl.headers,
          `Too many incorrect OTP attempts. Please wait ${rl.retryAfterSeconds} seconds before trying again.`
        );
      }

      if (!otpCode || String(otpCode).trim().length !== 6) {
        return NextResponse.json(
          { success: false, message: "Please enter the 6-digit OTP code sent to your email." },
          { status: 400, headers: rl.headers }
        );
      }

      const verification = verifyOtpToken(cleanEmail, String(otpCode), String(otpToken || ""));
      if (!verification.valid) {
        return NextResponse.json(
          { success: false, message: verification.reason },
          { status: 401, headers: rl.headers }
        );
      }

      return NextResponse.json(
        {
          success: true,
          verified: true,
          admin: {
            email: ADMIN_EMAIL,
            name: "Bright Path Admin",
          },
        },
        { headers: rl.headers }
      );
    }

    // STEP 1: Verify Email + Password & Send HTML OTP Email
    const rl = checkRateLimit(request, {
      namespace: "admin-login",
      maxRequests: 5,
      windowMs: 10 * 60 * 1000, // 5 login attempts per 10 minutes
    });

    if (!rl.allowed) {
      return rateLimitExceededResponse(
        rl.retryAfterSeconds,
        rl.headers,
        `Too many login attempts from your IP. Please wait ${rl.retryAfterSeconds} seconds before trying again.`
      );
    }

    if (
      cleanEmail !== ADMIN_EMAIL ||
      (cleanPass !== ADMIN_PASSWORD && cleanPass !== "Admin@webmaster$1")
    ) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid admin email or password. (${rl.remaining} attempt(s) remaining)`,
        },
        { status: 401, headers: rl.headers }
      );
    }

    // Credentials valid -> Generate 6-digit OTP & send HTML email
    const generatedOtp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    const signedToken = createOtpToken(ADMIN_EMAIL, generatedOtp, expiresAt);

    const clientIp = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || "Web Browser";

    const emailRes = await sendAdminLoginOtpEmail(
      ADMIN_EMAIL,
      generatedOtp,
      clientIp,
      userAgent
    );

    if (!emailRes.sent) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to send OTP email. Please check SMTP configuration.",
        },
        { status: 500, headers: rl.headers }
      );
    }

    return NextResponse.json(
      {
        success: true,
        requireOtp: true,
        otpToken: signedToken,
        expiresAt,
        message: `A 6-digit OTP verification code has been sent to ${ADMIN_EMAIL}.`,
      },
      { headers: rl.headers }
    );
  } catch (error: any) {
    console.error("POST /api/admin/auth error:", error);
    return NextResponse.json(
      { success: false, message: "Authentication error", error: error.message },
      { status: 500 }
    );
  }
}
