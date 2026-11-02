import nodemailer from "nodemailer";
import type { DemoBooking, Lead, StudentAccount } from "@/db/schema";

const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = Number(process.env.SMTP_PORT || 465);
const smtpSecure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : smtpPort === 465;
const smtpUser = process.env.SMTP_USER || "brightpathlearninghub6@gmail.com";
const smtpPass = process.env.SMTP_PASS || "ctjc xdri zuca ycbf";
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

export async function sendDemoBookingEmails(
  booking: DemoBooking,
  isAdminConfirmation = false
) {
  const transporter = getTransporter();
  if (!transporter) return { sent: false, reason: "SMTP not configured" };

  const bookingRef = `#BP-${String(booking.id).padStart(5, "0")}`;
  const cleanPhone = booking.phoneNumber.replace(/[^0-9]/g, "");
  const whatsappLink = `https://wa.me/${cleanPhone}`;
  const badgeTitle = isAdminConfirmation
    ? `✅ Demo Booking Confirmed (${bookingRef})`
    : `🎉 New 1:1 Free Demo Booking (${bookingRef})`;

  // 1. Admin HTML Email
  const adminHtml = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background: #0a1931; color: #ffffff; padding: 24px;">
        <h2 style="margin: 0; font-size: 20px;">${badgeTitle}</h2>
        <p style="margin: 6px 0 0; color: #94a3b8; font-size: 14px;">Bright Path Learning Hub — Admin Notification</p>
      </div>
      <div style="padding: 24px; background: #ffffff; color: #1e293b;">
        <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; width: 40%;">Booking Reference:</td>
            <td style="padding: 8px 0; font-weight: 700;">${bookingRef}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Status:</td>
            <td style="padding: 8px 0; font-weight: 700; color: #059669; text-transform: uppercase;">${booking.status || "confirmed"}</td>
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
      subject: isAdminConfirmation
        ? `Confirmed Booking ${bookingRef}: ${booking.studentName} (${booking.courseName})`
        : `New Demo Booking ${bookingRef}: ${booking.studentName} (${booking.courseName})`,
      html: adminHtml,
    }),
  ];

  // 2. Parent Confirmation HTML Email
  if (booking.email && booking.email.includes("@")) {
    const parentHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: #0a1931; color: #ffffff; padding: 28px 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 22px; color: #fbbf24;">Bright Path Learning Hub</h1>
          <p style="margin: 8px 0 0; color: #e2e8f0; font-size: 15px;">Your 100% Free 1:1 Live Demo Class is Confirmed!</p>
        </div>
        <div style="padding: 24px; background: #ffffff; color: #1e293b; line-height: 1.6;">
          <p>Dear <strong>${booking.parentName}</strong>,</p>
          <p>Thank you for choosing <strong>Bright Path Learning Hub</strong>! We are pleased to confirm the 1-on-1 live session for <strong>${booking.studentName}</strong>.</p>
          
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin: 20px 0;">
            <p style="margin: 4px 0;"><strong>Booking Reference:</strong> ${bookingRef}</p>
            <p style="margin: 4px 0;"><strong>Status:</strong> <span style="color: #059669; font-weight: 700;">CONFIRMED</span></p>
            <p style="margin: 4px 0;"><strong>Student:</strong> ${booking.studentName} (${booking.grade})</p>
            <p style="margin: 4px 0;"><strong>Program:</strong> ${booking.courseName}</p>
            <p style="margin: 4px 0;"><strong>Scheduled Slot:</strong> ${booking.preferredTime}</p>
          </div>

          <p>Our academic counselor will connect with you on WhatsApp (<strong>${booking.phoneNumber}</strong>) with the live classroom link and assigned mentor details.</p>

          <div style="text-align: center; margin: 26px 0;">
            <a href="https://wa.me/2348063202616?text=Hi%20Bright%20Path!%20I%20received%20confirmation%20for%20Demo%20${encodeURIComponent(
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
        subject: `Booking Confirmed (${bookingRef}) — Bright Path Learning Hub`,
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

export async function sendStudentWelcomeEmail(
  account: StudentAccount,
  portalUrl: string
) {
  const transporter = getTransporter();
  if (!transporter) return { sent: false, reason: "SMTP not configured" };

  const userWelcomeHtml = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #0a1931 0%, #133e87 100%); color: #ffffff; padding: 30px 24px; text-align: center;">
        <div style="display: inline-block; background: rgba(251, 191, 36, 0.2); color: #fbbf24; padding: 4px 14px; border-radius: 999px; font-size: 12px; font-weight: 700; margin-bottom: 10px;">
          WELCOME TO BRIGHT PATH LEARNING HUB
        </div>
        <h1 style="margin: 0; font-size: 24px; color: #ffffff;">Enrollment Confirmed & Student Login Credentials</h1>
        <p style="margin: 8px 0 0; color: #cbd5e1; font-size: 14px;">1-on-1 Personalized Live Learning Portal (KG – Grade 8)</p>
      </div>

      <div style="padding: 28px 24px; background: #ffffff; color: #1e293b; line-height: 1.6;">
        <p>Dear <strong>${account.parentName}</strong>,</p>
        <p>Welcome to the <strong>Bright Path Learning Hub</strong> family! We are delighted to confirm <strong>${account.studentName}</strong>'s enrollment in <strong>${account.courseName}</strong> (${account.grade}).</p>
        <p>Below are your official <strong>Student Learning Portal Login Credentials</strong>:</p>

        <div style="background: #f8fafc; border: 2px solid #cbd5e1; border-radius: 12px; padding: 20px; margin: 22px 0;">
          <h3 style="margin: 0 0 12px; color: #0a1931; font-size: 16px;">🔐 Student Portal Access Details</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; width: 38%;">Student Name:</td>
              <td style="padding: 6px 0; font-weight: 700;">${account.studentName} (${account.grade})</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Enrolled Course:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #059669;">${account.courseName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Username / ID:</td>
              <td style="padding: 6px 0; font-family: monospace; font-size: 16px; font-weight: 700; color: #0f172a;">${account.username}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Password:</td>
              <td style="padding: 6px 0; font-family: monospace; font-size: 16px; font-weight: 700; color: #dc2626;">${account.password}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Portal Login URL:</td>
              <td style="padding: 6px 0;"><a href="${portalUrl}" style="color: #1d4ed8; font-weight: 700;">${portalUrl}</a></td>
            </tr>
            ${
              account.scheduleSlot
                ? `<tr>
                    <td style="padding: 6px 0; color: #64748b;">Preferred Slot:</td>
                    <td style="padding: 6px 0; font-weight: 600;">${account.scheduleSlot}</td>
                  </tr>`
                : ""
            }
          </table>
        </div>

        <div style="text-align: center; margin: 26px 0;">
          <a href="${portalUrl}" style="display: inline-block; background: #f59e0b; color: #0a1931; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 800; font-size: 15px;">
            Log In to Student Portal →
          </a>
        </div>

        <p style="font-size: 14px; color: #475569;">If you need any assistance logging in or scheduling your sessions, reply to this email or message our counselor directly on WhatsApp at <strong>+234 806 320 2616</strong>.</p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">
          Bright Path Learning Hub • Kubwa, Abuja • Govt. Reg. No. 9840276<br/>
          Phone/WhatsApp: +234 806 320 2616 • Email: brightpathlearninghub6@gmail.com
        </p>
      </div>
    </div>
  `;

  const adminCopyHtml = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background: #0a1931; color: #ffffff; padding: 20px 24px;">
        <h2 style="margin: 0; font-size: 18px;">🔑 Student Login Credentials Generated & Sent</h2>
        <p style="margin: 4px 0 0; color: #94a3b8; font-size: 13px;">Bright Path Learning Hub — Admin Audit Copy</p>
      </div>
      <div style="padding: 24px; background: #ffffff; color: #1e293b;">
        <p style="margin: 0 0 12px;">Login credentials have been generated and emailed to <strong>${account.parentName}</strong> (${account.email}):</p>
        <p style="margin: 4px 0;"><strong>Student:</strong> ${account.studentName} (${account.grade})</p>
        <p style="margin: 4px 0;"><strong>Course:</strong> ${account.courseName}</p>
        <p style="margin: 4px 0;"><strong>Username:</strong> <code>${account.username}</code></p>
        <p style="margin: 4px 0;"><strong>Password:</strong> <code>${account.password}</code></p>
        <p style="margin: 4px 0;"><strong>Portal URL:</strong> <a href="${portalUrl}">${portalUrl}</a></p>
      </div>
    </div>
  `;

  const tasks: Promise<any>[] = [
    transporter.sendMail({
      from: smtpFrom,
      to: adminEmail,
      subject: `Credentials Generated for ${account.studentName} (${account.username})`,
      html: adminCopyHtml,
    }),
  ];

  if (account.email && account.email.includes("@")) {
    tasks.unshift(
      transporter.sendMail({
        from: smtpFrom,
        to: account.email,
        subject: `Welcome to Bright Path Learning Hub! Login Credentials for ${account.studentName}`,
        html: userWelcomeHtml,
      })
    );
  }

  const results = await Promise.allSettled(tasks);
  return {
    sent: results.some((r) => r.status === "fulfilled"),
    userEmailSent: results[0]?.status === "fulfilled",
    adminEmailSent: results[results.length - 1]?.status === "fulfilled",
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

export async function sendAdminLoginOtpEmail(
  targetEmail: string,
  otpCode: string,
  clientIp: string,
  userAgent: string
) {
  const transporter = getTransporter();
  if (!transporter) return { sent: false, reason: "SMTP not configured" };

  const timestamp = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "medium",
  });

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 580px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06);">
      <div style="background: linear-gradient(135deg, #071527 0%, #133e87 100%); color: #ffffff; padding: 28px 24px; text-align: center;">
        <div style="display: inline-block; background: rgba(251, 191, 36, 0.2); color: #fbbf24; padding: 4px 14px; border-radius: 999px; font-size: 11px; font-weight: 800; letter-spacing: 0.06em; margin-bottom: 10px;">
          SECURITY VERIFICATION • 2-STEP AUTHENTICATION
        </div>
        <h1 style="margin: 0; font-size: 22px; color: #ffffff;">Admin Portal Login OTP Code</h1>
        <p style="margin: 6px 0 0; color: #cbd5e1; font-size: 13px;">Bright Path Learning Hub — Control Center</p>
      </div>

      <div style="padding: 28px 24px; background: #ffffff; color: #1e293b; line-height: 1.6;">
        <p style="margin: 0 0 14px;">Hello Administrator,</p>
        <p style="margin: 0 0 20px;">A sign-in attempt was initiated on the <strong>Bright Path Learning Hub Admin Dashboard</strong>. Enter the 6-digit One-Time Password (OTP) below to complete your sign-in:</p>

        <div style="background: #f8fafc; border: 2px dashed #0284c7; border-radius: 14px; padding: 22px; text-align: center; margin: 22px 0;">
          <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;">
            Your 6-Digit Verification Code
          </div>
          <div style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #071527;">
            ${otpCode}
          </div>
          <div style="font-size: 12px; color: #dc2626; font-weight: 700; margin-top: 8px;">
            ⏳ Valid for 10 minutes • Do not share this code
          </div>
        </div>

        <div style="background: #f1f5f9; border-radius: 10px; padding: 14px 16px; font-size: 13px; color: #475569; margin-top: 20px;">
          <div style="font-weight: 700; color: #0f172a; margin-bottom: 6px;">Login Request Details:</div>
          <div><strong>Time:</strong> ${timestamp}</div>
          <div><strong>IP Address:</strong> ${clientIp}</div>
          <div><strong>Device / Browser:</strong> ${userAgent.slice(0, 100)}</div>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">
          Bright Path Learning Hub • Kubwa, Abuja • Govt. Reg. No. 9840276<br/>
          Automated Security Alert — If you did not attempt to sign in, please ignore this email.
        </p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: smtpFrom,
    to: targetEmail || adminEmail,
    subject: `${otpCode} is your Bright Path Admin Login OTP Code`,
    html,
  });

  return { sent: true };
}

export async function sendReportCardEmail(
  report: {
    reportRef: string;
    studentName: string;
    studentUsername: string;
    parentName: string;
    parentEmail: string;
    grade: string;
    courseName: string;
    termPeriod: string;
    overallScore: number;
    overallGrade: string;
    attendanceRate: number;
    readingProgress: number;
    homeworkCompletionRate: number;
    strengths: string[];
    areasForImprovement: string[];
    teacherComment: string;
  },
  portalUrl: string
) {
  const transporter = getTransporter();
  if (!transporter) return { sent: false, reason: "SMTP not configured" };

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #071527 0%, #133e87 100%); color: #ffffff; padding: 30px 24px; text-align: center;">
        <div style="display: inline-block; background: rgba(251, 191, 36, 0.2); color: #fbbf24; padding: 4px 14px; border-radius: 999px; font-size: 11px; font-weight: 800; letter-spacing: 0.06em; margin-bottom: 10px;">
          OFFICIAL ACADEMIC PROGRESS REPORT • ${report.reportRef}
        </div>
        <h1 style="margin: 0; font-size: 22px; color: #ffffff;">${report.studentName}'s Academic Report Card</h1>
        <p style="margin: 6px 0 0; color: #cbd5e1; font-size: 14px;">${report.courseName} (${report.grade}) • ${report.termPeriod}</p>
      </div>

      <div style="padding: 26px 24px; background: #ffffff; color: #1e293b; line-height: 1.6;">
        <p>Dear <strong>${report.parentName}</strong>,</p>
        <p>Your child's latest academic development and performance report card for <strong>${report.studentName}</strong> has been prepared by the Bright Path Learning Hub academic team.</p>

        <div style="background: #f8fafc; border: 2px solid #cbd5e1; border-radius: 12px; padding: 18px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Overall Assessment Score:</td>
              <td style="padding: 6px 0; font-weight: 800; color: #059669; font-size: 16px;">${report.overallScore}% (Grade ${report.overallGrade})</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Attendance Rate:</td>
              <td style="padding: 6px 0; font-weight: 700;">${report.attendanceRate}%</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Homework Completion:</td>
              <td style="padding: 6px 0; font-weight: 700;">${report.homeworkCompletionRate}%</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Reading & Pronunciation Progress:</td>
              <td style="padding: 6px 0; font-weight: 700;">${report.readingProgress}%</td>
            </tr>
          </table>
        </div>

        <div style="margin: 16px 0;">
          <div style="font-weight: 800; color: #059669; margin-bottom: 6px;">✅ Key Strengths:</div>
          <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
            ${report.strengths.map((s) => `<li>${s}</li>`).join("")}
          </ul>
        </div>

        <div style="margin: 16px 0;">
          <div style="font-weight: 800; color: #d97706; margin-bottom: 6px;">🎯 Areas for Improvement:</div>
          <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
            ${report.areasForImprovement.map((s) => `<li>${s}</li>`).join("")}
          </ul>
        </div>

        <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px 16px; border-radius: 8px; margin: 18px 0; font-size: 14px;">
          <strong>Teacher's Remark:</strong><br/>
          ${report.teacherComment}
        </div>

        <div style="text-align: center; margin: 26px 0;">
          <a href="${portalUrl}" style="display: inline-block; background: #10b981; color: #ffffff; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 800; font-size: 15px;">
            View & Download PDF Report Card in Portal →
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

  const tasks: Promise<any>[] = [
    transporter.sendMail({
      from: smtpFrom,
      to: adminEmail,
      subject: `Report Card Issued (${report.reportRef}) — ${report.studentName}`,
      html,
    }),
  ];

  if (report.parentEmail && report.parentEmail.includes("@")) {
    tasks.unshift(
      transporter.sendMail({
        from: smtpFrom,
        to: report.parentEmail,
        subject: `${report.studentName}'s Academic Report Card (${report.reportRef}) — Bright Path Learning Hub`,
        html,
      })
    );
  }

  const results = await Promise.allSettled(tasks);
  return {
    sent: results.some((r) => r.status === "fulfilled"),
  };
}

export async function sendCalendarEventEmail(eventData: {
  title: string;
  date: string;
  category: string;
  description?: string;
  targetStudentUsername?: string;
  targetStudentName?: string;
  recipientEmails: string[];
}) {
  const transporter = getTransporter();
  if (!transporter) return { sent: false, reason: "SMTP not configured" };

  const recipients = Array.from(new Set(eventData.recipientEmails.filter(e => e && e.includes("@"))));
  if (recipients.length === 0) {
    recipients.push(adminEmail);
  }

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="background: linear-gradient(135deg, #071527 0%, #133e87 100%); color: #ffffff; padding: 26px 22px; text-align: center;">
        <div style="display: inline-block; background: rgba(251, 191, 36, 0.2); color: #fbbf24; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 800; letter-spacing: 0.05em; margin-bottom: 8px;">
          ACADEMIC CALENDAR & EVENT NOTIFICATION
        </div>
        <h1 style="margin: 0; font-size: 20px; color: #ffffff;">${eventData.title}</h1>
        <p style="margin: 6px 0 0; color: #cbd5e1; font-size: 13px;">${eventData.category} • Scheduled for ${eventData.date}</p>
      </div>

      <div style="padding: 24px 20px; background: #ffffff; color: #1e293b; line-height: 1.6;">
        <p style="margin: 0 0 14px;">Hello from <strong>Bright Path Learning Hub</strong>,</p>
        <p style="margin: 0 0 16px;">A new academic event or deadline has been scheduled on the calendar:</p>

        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 18px; margin: 18px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; width: 35%;">Event Title:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">${eventData.title}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Event Date:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #059669;">${eventData.date}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Category:</td>
              <td style="padding: 6px 0; font-weight: 600;">${eventData.category}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Target Audience:</td>
              <td style="padding: 6px 0; font-weight: 600;">${eventData.targetStudentName ? `${eventData.targetStudentName} (${eventData.targetStudentUsername})` : "All Students & Parents"}</td>
            </tr>
          </table>
          ${eventData.description ? `
            <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed #cbd5e1; font-size: 13px; color: #334155;">
              <strong>Details / Instructions:</strong><br/>
              ${eventData.description}
            </div>
          ` : ""}
        </div>

        <div style="text-align: center; margin: 24px 0 16px;">
          <a href="https://brightpathlearninghub.vercel.app/portal" style="display: inline-block; background: #0284c7; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px;">
            Open Learning Hub Portal →
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">
          Bright Path Learning Hub • Kubwa, Abuja • Govt. Reg. No. 9840276<br/>
          Phone/WhatsApp: +234 806 320 2616 • Email: brightpathlearninghub6@gmail.com
        </p>
      </div>
    </div>
  `;

  const tasks = recipients.map(email =>
    transporter.sendMail({
      from: smtpFrom,
      to: email,
      subject: `Calendar Notification: ${eventData.title} (${eventData.date})`,
      html,
    })
  );

  const results = await Promise.allSettled(tasks);
  return {
    sent: results.some((r) => r.status === "fulfilled"),
    recipientsCount: recipients.length,
  };
}

