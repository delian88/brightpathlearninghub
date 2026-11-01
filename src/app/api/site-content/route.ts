import { NextResponse } from "next/server";
import { getSiteContent, saveSiteContent } from "@/db";

export async function GET() {
  try {
    const content = await getSiteContent();
    return NextResponse.json({ success: true, content });
  } catch (error: any) {
    console.error("GET /api/site-content error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load site content", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const content = body.content || body;
    const saved = await saveSiteContent(content);
    return NextResponse.json({
      success: true,
      message: "Landing page and site content updated successfully!",
      content: saved,
    });
  } catch (error: any) {
    console.error("PUT /api/site-content error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save site content", error: error.message },
      { status: 500 }
    );
  }
}

