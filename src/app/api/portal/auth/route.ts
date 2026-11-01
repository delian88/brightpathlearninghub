import { NextResponse } from "next/server";
import { authenticateStudentAccount } from "@/db";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Please enter both your Username/Email and Password." },
        { status: 400 }
      );
    }

    const account = await authenticateStudentAccount(String(username), String(password));
    if (!account) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid login credentials. Please check the Username and Password sent to your email.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      account,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Portal login error", error: error.message },
      { status: 500 }
    );
  }
}
