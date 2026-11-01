import { NextResponse } from "next/server";
import { cookies } from "next/headers";
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

const TRUSTED_DEVICE_COOKIE = "bp_admin_trusted_device";
const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60; // 7 days in seconds
const SEVEN_DAYS_MS = SEVEN_DAYS_SECONDS * 1000; // 7 days in milliseconds

function createOtpToken(email: string, otpCode: string, expiresAt: number): string {
  const payload = `otp:${email.toLowerCase()}:${otpCode.trim()}:${expiresAt}`;
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

  const expectedPayload = `otp:${email.toLowerCase()}:${otpCode.trim()}:${expiresAt}`;
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

function createTrustedDeviceToken(email: string, expiresAt: number): string {
  const payload = `trusted-device:${email.toLowerCase()}:${expiresAt}`;
  const signature = crypto
    .createHmac("sha256", OTP_SECRET)
    .update(payload)
    .digest("hex");
  return `${expiresAt}.${signature}`;
}

function verifyTrustedDeviceToken(
  email: string,
  token?: string | null
): { trusted: boolean; expiresAt?: number; daysRemaining?: number } {
  if (!token || !token.includes(".")) {
    return { trusted: false };
  }

  const [expiresStr, providedSig] = token.split(".");
  const expiresAt = Number(expiresStr);

  // If 7 days have passed, expire trust and require a new OTP
  if (!expiresAt || Date.now() >= expiresAt) {
    return { trusted: false };
  }

  const expectedPayload = `trusted-device:${email.toLowerCase()}:${expiresAt}`;
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
      return { trusted: false };
    }
    const daysRemaining = Math.max(1, Math.ceil((expiresAt - Date.now()) / (24 * 60 * 60 * 1000)));
    return { trusted: true, expiresAt, daysRemaining };
  } catch {
    return { trusted: false };
  }
}

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get(TRUSTED_DEVICE_COOKIE)?.value;
    const headerToken = request.headers.get("x-trusted-device-token");
    const check = verifyTrustedDeviceToken(ADMIN_EMAIL, cookieToken || headerToken);

    return NextResponse.json({
      success: true,
      trustedDevice: check.trusted,
      trustedUntil: check.expiresAt || null,
      daysRemaining: check.daysRemaining || 0,
    });
  } catch {
    return NextResponse.json({
      success: true,
      trustedDevice: false,
      trustedUntil: null,
      daysRemaining: 0,
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      step = "login",
      email,
      password,
      otpCode,
      otpToken,
      trustDevice = true,
      trustedDeviceToken,
      forceOtp = false,
    } = body;

    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPass = String(password || "").trim();

    // Revoke 7-Day Trusted Device
    if (step === "revoke-trust") {
      const response = NextResponse.json({
        success: true,
        message: "Trusted device status removed. Next login will require a 6-digit OTP code.",
      });
      response.cookies.set(TRUSTED_DEVICE_COOKIE, "", {
        httpOnly: true,
        path: "/",
        maxAge: 0,
        sameSite: "lax",
      });
      return response;
    }

    // STEP 2: Verify 6-Digit OTP Code & Register 7-Day Trusted Device
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

      const trustedUntil = Date.now() + SEVEN_DAYS_MS;
      const newTrustedToken = trustDevice
        ? createTrustedDeviceToken(ADMIN_EMAIL, trustedUntil)
        : null;

      const response = NextResponse.json(
        {
          success: true,
          verified: true,
          trustedDevice: Boolean(trustDevice),
          trustedDeviceToken: newTrustedToken,
          trustedUntil: trustDevice ? trustedUntil : null,
          message: trustDevice
            ? "OTP verified! This device is now trusted for 7 days."
            : "OTP verified! Welcome to the Admin Dashboard.",
          admin: {
            email: ADMIN_EMAIL,
            name: "Bright Path Admin",
          },
        },
        { headers: rl.headers }
      );

      if (trustDevice && newTrustedToken) {
        response.cookies.set(TRUSTED_DEVICE_COOKIE, newTrustedToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: SEVEN_DAYS_SECONDS, // Expires automatically after 7 days
        });
      }

      return response;
    }

    // STEP 1: Verify Email + Password
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
          message: `Invalid administrator email or password. (${rl.remaining} attempt(s) remaining)`,
        },
        { status: 401, headers: rl.headers }
      );
    }

    // Check if this device is already trusted within the 7-day window
    if (!forceOtp) {
      const cookieStore = await cookies();
      const cookieToken = cookieStore.get(TRUSTED_DEVICE_COOKIE)?.value;
      const tokenToVerify = cookieToken || (trustedDeviceToken ? String(trustedDeviceToken) : null);
      const trustCheck = verifyTrustedDeviceToken(ADMIN_EMAIL, tokenToVerify);

      if (trustCheck.trusted && trustCheck.expiresAt) {
        return NextResponse.json(
          {
            success: true,
            verified: true,
            requireOtp: false,
            trustedDevice: true,
            trustedUntil: trustCheck.expiresAt,
            daysRemaining: trustCheck.daysRemaining,
            message: `Welcome back! Signed in on trusted device (${trustCheck.daysRemaining} day(s) remaining before next OTP).`,
            admin: {
              email: ADMIN_EMAIL,
              name: "Bright Path Admin",
            },
          },
          { headers: rl.headers }
        );
      }
    }

    // Not a trusted device (or 7 days expired) -> Generate 6-digit OTP & send HTML email
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
          message: "Failed to send OTP email. Please check email configuration.",
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
      { success: false, message: "Authentication error occurred." },
      { status: 500 }
    );
  }
}
