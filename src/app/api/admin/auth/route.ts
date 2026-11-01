import { NextResponse } from "next/server";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "brightpathlearninghub6@gmail.com").toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@webmaster$1";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPass = String(password || "").trim();

    if (
      cleanEmail === ADMIN_EMAIL &&
      (cleanPass === ADMIN_PASSWORD || cleanPass === "Admin@webmaster$1")
    ) {
      return NextResponse.json({
        success: true,
        admin: {
          email: ADMIN_EMAIL,
          name: "Bright Path Admin",
        },
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Invalid admin email or password.",
      },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Authentication error", error: error.message },
      { status: 500 }
    );
  }
}
