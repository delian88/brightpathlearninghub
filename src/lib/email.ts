import nodemailer from "nodemailer";
import type { DemoBooking, Lead } from "@/db/schema";

const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = Number(process.env.SMTP_PORT || 465);
const smtpSecure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : smtpPort === 465;
const smtpUser = process.env.SMTP_USER || "brightpathlearninghub6@gmail.com";
const smtpPass = process.env.SMTP_PASS || "";
const smtpFrom =
  process.env.SMTP_FROM || `"Bright Path Learning Hub" <${smtpUser}>`;
const adminEmail = process.env.ADMIN_EMAIL || smtpUser;

export function getTransporter() {
  if (!smtpUser || !smtpPass) {
    console.warn("SMTP credentials (SMTP_USER / SMTP_PASS) are not fully configured.");
    return null;
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass.replace(/\s+/g, ""),
    },
  });
}

export async function verifySmtpConnection(): Promise<{ success: boolean; error?: string }> {
  const transporter = getTransporter();
  if (!transporter) {
    return { success: false, error: "SMTP transporter not configured" };
  }
  try {
    await transporter.verify();
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function sendDemoBookingEmails(booking: DemoBooking) {
  const transporter = getTransporter();
  if (!transporter) return { sent: false, reason: "SMTP not configured" };

  const bookingRef = `#BP-${String(booking.id).padStart(5, "0")}`;
  const cleanPhone = booking.phoneNumber.replace(/[^0-9]/g, "");
  const whatsappLink = `https://wa.me/${cleanPhone}`;

  // 1. Send Admin Notification Email
  const adminHtml = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background: #0a1931; color: #ffffff; padding: 24px;">
        <h2 style="margin: 0; font-size: 20px;">🎉 New 1:1 Free Demo Booking (${bookingRef})</h2>
        <p style="margin: 6px 0 0; color: #94a3b8; font-size: 14px;">Bright Path Learning Hub — Instant Lead Alert</p>
      </div>
      <div style="padding: 24px; background: #ffffff; color: #1e293b;">
        <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; width: 40%;">Booking Reference:</td>
            <td style="padding: 8px 0; font-weight: 700;">${bookingRef}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Parent Name:</td>
            <td style="padding: 8px 0; font-weight: 600;">${booking.parentName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Student Name:</td>
            <td style="padding: 8px 0; font-weight: 600;">${booking.studentName} (${booking.grade})</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Course Program:</td>
            <td style="padding: 8px 0; font-weight: 700; color: #059669;">${booking.courseName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Preferred Time Slot:</td>
            <td style="padding: 8px 0; font-weight: 600;">${booking.preferredTime}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Phone / WhatsApp:</td>
            <td style="padding: 8px 0; font-weight: 600;">
              <a href="${whatsappLink}" style="color: #0284c7; text-decoration: none;">${booking.phoneNumber}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Parent Email:</td>
            <td style="padding: 8px 0;">${booking.email || "Not provided"}</td>
          </tr>
          ${
            booking.notes
              ? `<tr>
                  <td style="padding: 8px 0; color: #64748b;">Notes:</td>
                  <td style="padding: 8px 0;">${booking.notes}</td>
                </tr>`
              : ""
          }
        </table>
        <div style="margin-top: 24px;">
          <a href="${whatsappLink}" style="display: inline-block; background: #25D366; color: #ffffff; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px;">
            Chat with Parent on WhatsApp
          </a>
        </div>
      </div>
    </div>
  `;

  const tasks: Promise<any>[] = [
    transporter.sendMail({
      from: smtpFrom,
      to: adminEmail,
      replyTo: booking.email || undefined,
      subject: `New Demo Booking ${bookingRef}: ${booking.studentName} (${booking.courseName})`,
      html: adminHtml,
    }),
  ];

  // 2. Send Parent Confirmation Email (if parent provided an email address)
  if (booking.email && booking.email.includes("@")) {
    const parentHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: #0a1931; color: #ffffff; padding: 28px 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 22px; color: #fbbf24;">Bright Path Learning Hub</h1>
          <p style="margin: 8px 0 0; color: #e2e8f0; font-size: 15px;">Your 100% Free 1:1 Live Demo Class is Confirmed!</p>
        </div>
        <div style="padding: 24px; background: #ffffff; color: #1e293b; line-height: 1.6;">
          <p>Dear <strong>${booking.parentName}</strong>,</p>
          <p>Thank you for choosing <strong>Bright Path Learning Hub</strong>! We are thrilled to confirm a complimentary 1-on-1 live trial session for <strong>${booking.studentName}</strong>.</p>
          
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin: 20px 0;">
            <p style="margin: 4px 0;"><strong>Booking Reference:</strong> ${bookingRef}</p>
            <p style="margin: 4px 0;"><strong>Student:</strong> ${booking.studentName} (${booking.grade})</p>
            <p style="margin: 4px 0;"><strong>Program:</strong> ${booking.courseName}</p>
            <p style="margin: 4px 0;"><strong>Preferred Time Slot:</strong> ${booking.preferredTime}</p>
          </div>

          <p>Our academic counselor will contact you shortly on WhatsApp (<strong>${booking.phoneNumber}</strong>) to share the class link and match ${booking.studentName} with a certified mentor.</p>

          <div style="text-align: center; margin: 26px 0;">
            <a href="https://wa.me/2348063202616?text=Hi%20Bright%20Path!%20I%20just%20booked%20Demo%20${encodeURIComponent(
              bookingRef
            )}%20for%20${encodeURIComponent(booking.studentName)}." style="display: inline-block; background: #10b981; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700;">
              Message Us on WhatsApp (+234 806 320 2616)
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">
            Bright Path Learning Hub • Kubwa, Abuja • Govt. Reg. No. 9840276<br/>
            Phone/WhatsApp: +234 806 320 2616 • Email: brightpathlearninghub6@gmail.com
          </p>
        </div>
      </div>
    `;

    tasks.push(
      transporter.sendMail({
        from: smtpFrom,
        to: booking.email,
        subject: `Demo Class Confirmed (${bookingRef}) — Bright Path Learning Hub`,
        html: parentHtml,
      })
    );
  }

  const results = await Promise.allSettled(tasks);
  results.forEach((res, idx) => {
    if (res.status === "rejected") {
      console.error(`Email send task #${idx + 1} failed:`, res.reason);
    }
  });

  return {
    sent: results.some((r) => r.status === "fulfilled"),
    adminEmailSent: results[0]?.status === "fulfilled",
    userEmailSent: results[1] ? results[1].status === "fulfilled" : false,
  };
}

export async function sendNewLeadEmail(lead: Lead) {
  const transporter = getTransporter();
  if (!transporter) return { sent: false, reason: "SMTP not configured" };

  const fullPhone = `${lead.countryCode || "+234"}${lead.phoneNumber.replace(/^0+/, "")}`;
  const cleanPhone = fullPhone.replace(/[^0-9]/g, "");
  const whatsappLink = `https://wa.me/${cleanPhone}`;

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background: #0a1931; color: #ffffff; padding: 20px 24px;">
        <h2 style="margin: 0; font-size: 18px;">📲 New Phone Lead Captured!</h2>
        <p style="margin: 4px 0 0; color: #94a3b8; font-size: 13px;">Bright Path Learning Hub — Website Lead</p>
      </div>
      <div style="padding: 24px; background: #ffffff; color: #1e293b;">
        <p style="margin: 0 0 12px;">A parent submitted their phone number on the website:</p>
        <p style="margin: 6px 0;"><strong>Phone Number:</strong> ${lead.countryCode || ""} ${lead.phoneNumber}</p>
        <p style="margin: 6px 0;"><strong>Source:</strong> ${lead.source}</p>
        <p style="margin: 6px 0;"><strong>Time:</strong> ${new Date(lead.createdAt).toLocaleString()}</p>
        <div style="margin-top: 20px;">
          <a href="${whatsappLink}" style="display: inline-block; background: #25D366; color: #ffffff; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px;">
            Follow Up on WhatsApp
          </a>
        </div>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: smtpFrom,
    to: adminEmail,
    subject: `New Website Lead: ${lead.countryCode || ""} ${lead.phoneNumber}`,
    html,
  });

  return { sent: true };
}

