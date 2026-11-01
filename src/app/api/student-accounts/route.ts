import { NextResponse } from "next/server";
import {
  createStudentAccount,
  getStudentAccounts,
  updateDemoBookingStatus,
} from "@/db";
import { sendStudentWelcomeEmail } from "@/lib/email";

function generateUsername(studentName: string) {
  const clean = studentName
    .trim()
    .split(/\s+/)[0]
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase() || "STUDENT";
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `BP-${clean}-${rand}`;
}

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `Bright@${suffix}${Math.floor(10 + Math.random() * 89)}`;
}

export async function GET() {
  try {
    const accounts = await getStudentAccounts();
    return NextResponse.json({
      success: true,
      count: accounts.length,
      data: accounts,
    });
  } catch (error: any) {
    console.error("GET /api/student-accounts error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve student accounts", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      bookingId,
      parentName,
      studentName,
      email,
      phoneNumber,
      grade = "Grade 2",
      courseName = "English Phonics & Reading",
      username,
      password,
      classLink,
      scheduleSlot,
      portalUrl,
    } = body;

    if (!parentName || !studentName || !email) {
      return NextResponse.json(
        {
          success: false,
          message: "Parent name, student name, and email address are required to generate credentials and send welcome email.",
        },
        { status: 400 }
      );
    }

    const finalUsername = username ? String(username).trim() : generateUsername(studentName);
    const finalPassword = password ? String(password).trim() : generatePassword();

    const origin =
      portalUrl ||
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://brightpathlearninghub.com";
    const resolvedPortalUrl = origin.endsWith("/portal")
      ? origin
      : `${origin.replace(/\/$/, "")}/portal`;

    const account = await createStudentAccount({
      bookingId: bookingId ? Number(bookingId) : null,
      parentName: String(parentName).trim(),
      studentName: String(studentName).trim(),
      email: String(email).trim(),
      phoneNumber: String(phoneNumber || "+234 806 320 2616").trim(),
      grade: String(grade).trim(),
      courseName: String(courseName).trim(),
      username: finalUsername,
      password: finalPassword,
      classLink: classLink ? String(classLink).trim() : null,
      scheduleSlot: scheduleSlot ? String(scheduleSlot).trim() : null,
      status: "active",
    });

    if (bookingId) {
      await updateDemoBookingStatus(Number(bookingId), "confirmed");
    }

    let emailResult: any = { sent: false };
    try {
      emailResult = await sendStudentWelcomeEmail(account, resolvedPortalUrl);
    } catch (emailErr) {
      console.error("Failed to send student welcome email:", emailErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Login credentials generated and Confirmation & Welcome Email sent to the user!",
        account,
        portalUrl: resolvedPortalUrl,
        emailResult,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/student-accounts error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate student credentials", error: error.message },
      { status: 500 }
    );
  }
}
