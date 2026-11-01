import { NextResponse } from "next/server";
import { saveLead, getLeads } from "@/db";
import { sendNewLeadEmail } from "@/lib/email";

export async function GET() {
  try {
    const leads = await getLeads();
    return NextResponse.json({ success: true, count: leads.length, data: leads });
  } catch (error: any) {
    console.error("GET /api/leads error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve leads", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber, countryCode = "+234", source = "hero_banner" } = body;

    if (!phoneNumber || String(phoneNumber).trim().length < 6) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid phone number." },
        { status: 400 }
      );
    }

    const lead = await saveLead({
      phoneNumber: String(phoneNumber).trim(),
      countryCode: String(countryCode).trim(),
      source: String(source).trim(),
    });

    let emailSent = false;
    try {
      const emailResult = await sendNewLeadEmail(lead);
      emailSent = emailResult.sent;
    } catch (emailErr) {
      console.error("Failed to send new lead email notification:", emailErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Thank you! Our counseling team will send details via WhatsApp shortly.",
        lead,
        emailSent,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/leads error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to record lead", error: error.message },
      { status: 500 }
    );
  }
}
