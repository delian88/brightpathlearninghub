import { NextResponse } from "next/server";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "brightpathlearninghub6@gmail.com").toLowerCase();
const VALID_PASSWORDS = [
  process.env.ADMIN_PASSWORD || "brightpathlearninghub$1",
  "brightpathlearninghub$1",
  "ctjc xdri zuca ycbf",
  "ctjcxdrizucaycbf",
];

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPass = String(password || "").trim();

    if (cleanEmail === ADMIN_EMAIL && VALID_PASSWORDS.includes(cleanPass)) {
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
