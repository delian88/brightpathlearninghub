import { NextResponse } from "next/server";
import { saveDemoBooking, getDemoBookings } from "@/db";

export async function GET() {
  try {
    const bookings = await getDemoBookings();
    return NextResponse.json({ success: true, count: bookings.length, data: bookings });
  } catch (error: any) {
    console.error("GET /api/bookings error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve bookings", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      parentName,
      phoneNumber,
      email,
      studentName,
      grade,
      courseId,
      courseName,
      preferredTime,
      notes,
    } = body;

    if (!parentName || !phoneNumber || !studentName || !grade) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide parent name, student name, grade, and contact phone number.",
        },
        { status: 400 }
      );
    }

    const booking = await saveDemoBooking({
      parentName: String(parentName).trim(),
      phoneNumber: String(phoneNumber).trim(),
      email: email ? String(email).trim() : null,
      studentName: String(studentName).trim(),
      grade: String(grade).trim(),
      courseId: String(courseId || "english-phonics"),
      courseName: String(courseName || "English Phonics & Reading"),
      preferredTime: String(preferredTime || "Weekday Evening (5 PM - 6 PM)"),
      status: "confirmed",
      notes: notes ? String(notes).trim() : null,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Demo class booked successfully! Our academic counselor will reach out shortly.",
        booking,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/bookings error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred while booking.", error: error.message },
      { status: 500 }
    );
  }
}
