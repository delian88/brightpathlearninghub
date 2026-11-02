import type { StudentReportCard, StudentCertificate } from "./lmsData";

export function downloadReportCardPdf(
  report: StudentReportCard,
  mode: "download" | "print" = "download"
) {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://brightpathlearninghub.vercel.app";

  const issuedDate = new Date(report.createdAt || Date.now()).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const inc = {
    attendance: report.includeSections?.attendance ?? true,
    homework: report.includeSections?.homework ?? true,
    assessments: report.includeSections?.assessments ?? true,
    aiProgress: report.includeSections?.aiProgress ?? true,
    strengthsWeaknesses: report.includeSections?.strengthsWeaknesses ?? true,
    recommendations: report.includeSections?.recommendations ?? true,
    teacherComments: report.includeSections?.teacherComments ?? true,
    adminComments: report.includeSections?.adminComments ?? true,
  };

  const dateRangeDisplay =
    report.dateRangeStart && report.dateRangeEnd
      ? `${report.dateRangeStart} to ${report.dateRangeEnd}`
      : report.dateRangeStart || report.dateRangeEnd || "Full Academic Term";

  const teacherNameDisplay = report.teacherName || "Bright Path Class Educator";
  const adminNameDisplay =
    report.adminName || report.issuedBy || "Bright Path Academic Director";
  const schoolRemarksDisplay =
    report.schoolRemarks ||
    `${report.studentName} continues to uphold the academic values of Bright Path Learning Hub. Keep up the dedication and curiosity!`;

  const recommendationsList =
    report.recommendations && report.recommendations.length > 0
      ? report.recommendations
      : [];

  const aiSummary = report.aiLearningSummary || {
    sessionsCompleted: 0,
    averageAiScore: report.readingProgress || report.overallScore || 85,
    readingProgress: report.readingProgress || 85,
    skillsPractised: [
      "Phonics & Reading Fluency",
      "Word Pronunciation",
      "Writing & Sentence Construction",
      "Interactive Math & Speaking",
    ],
    masteryHighlight: "Proficient Digital Companion Engagement",
  };

  const hwSummary = report.homeworkSummary || {
    completionRate: report.homeworkCompletionRate || 0,
    averageScore: report.overallScore || 0,
    totalSubmitted: 0,
    totalAssigned: 0,
  };

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Bright Path Academic Report Card - ${report.reportRef} - ${report.studentName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #f1f5f9;
      color: #0f172a;
      padding: 24px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .report-sheet {
      max-width: 860px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      border: 2px solid #0a1931;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(0,0,0,0.12);
    }
    .toolbar {
      max-width: 860px;
      margin: 0 auto 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      background: #071527;
      color: #fff;
      padding: 12px 20px;
      border-radius: 12px;
    }
    .toolbar-actions {
      display: flex;
      gap: 10px;
    }
    .btn-print {
      background: #10b981;
      color: #ffffff;
      border: none;
      padding: 10px 18px;
      border-radius: 8px;
      font-weight: 800;
      font-size: 13px;
      cursor: pointer;
    }
    .btn-secondary {
      background: #3b82f6;
      color: #ffffff;
      border: none;
      padding: 10px 18px;
      border-radius: 8px;
      font-weight: 800;
      font-size: 13px;
      cursor: pointer;
    }
    .header {
      background: linear-gradient(135deg, #071527 0%, #133e87 100%);
      color: #ffffff;
      padding: 26px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 4px solid #f59e0b;
    }
    .brand-row {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .brand-logo {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: #ffffff;
      padding: 4px;
      border: 2px solid #fbbf24;
      object-fit: contain;
    }
    .badge {
      display: inline-block;
      background: rgba(251, 191, 36, 0.2);
      color: #fbbf24;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.06em;
      margin-bottom: 6px;
    }
    .body { padding: 26px 32px; }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 16px 18px;
      margin-bottom: 20px;
      font-size: 13px;
    }
    .meta-label { color: #64748b; font-size: 10.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.03em; }
    .meta-val { color: #0f172a; font-weight: 800; font-size: 13.5px; margin-top: 2px; }
    .kpi-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 22px;
    }
    .kpi-box {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 13px;
      text-align: center;
      background: #ffffff;
    }
    .kpi-num { font-size: 22px; font-weight: 900; color: #071527; }
    .kpi-sub { font-size: 10.5px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-top: 3px; }
    .section-title {
      font-size: 13px;
      font-weight: 900;
      text-transform: uppercase;
      color: #0a1931;
      margin-bottom: 10px;
      letter-spacing: 0.04em;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 14px;
      font-size: 13px;
    }
    th {
      background: #0a1931;
      color: #ffffff;
      text-align: left;
      padding: 10px 13px;
      font-size: 11.5px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    td {
      padding: 10px 13px;
      border-bottom: 1px solid #e2e8f0;
    }
    .grading-scale {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 10px 14px;
      margin-bottom: 22px;
      font-size: 11.5px;
      color: #334155;
    }
    .scale-pill {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 3px 8px;
      font-weight: 700;
    }
    .ai-box {
      background: linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%);
      border: 1px solid #c7d2fe;
      border-radius: 12px;
      padding: 16px 18px;
      margin-bottom: 22px;
    }
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-bottom: 18px;
    }
    .card-box {
      border-radius: 12px;
      padding: 15px;
      font-size: 12.8px;
      line-height: 1.55;
    }
    .strengths-box {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
    }
    .improve-box {
      background: #fffbeb;
      border: 1px solid #fde68a;
    }
    .recommend-box {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 12px;
      padding: 15px 18px;
      margin-bottom: 18px;
      font-size: 12.8px;
      line-height: 1.55;
    }
    .remark-box {
      background: #f8fafc;
      border-left: 5px solid #133e87;
      padding: 14px 18px;
      border-radius: 10px;
      margin-bottom: 14px;
      font-size: 13px;
      line-height: 1.55;
    }
    .admin-remark-box {
      background: #fefce8;
      border-left: 5px solid #d97706;
      padding: 14px 18px;
      border-radius: 10px;
      margin-bottom: 22px;
      font-size: 13px;
      line-height: 1.55;
    }
    .footer-sign {
      display: grid;
      grid-template-columns: 1.4fr 1fr 1fr;
      gap: 20px;
      align-items: flex-end;
      padding-top: 18px;
      border-top: 2px solid #e2e8f0;
      font-size: 12px;
      color: #475569;
    }
    @media print {
      body { background: #ffffff; padding: 0; }
      .toolbar { display: none !important; }
      .report-sheet { box-shadow: none; border: 2px solid #0a1931; max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <div>
      <strong>Official Bright Path Report Card (${report.reportRef})</strong>
      <span style="font-size: 12px; color: #cbd5e1; margin-left: 10px;">
        Choose "Save as PDF" to download or select your printer to print
      </span>
    </div>
    <div class="toolbar-actions">
      <button class="btn-secondary" onclick="window.print()">🖨️ Print Report</button>
      <button class="btn-print" onclick="window.print()">📥 Save / Download PDF</button>
    </div>
  </div>

  <div class="report-sheet">
    <!-- Branded Header with Logo -->
    <div class="header">
      <div class="brand-row">
        <img src="${origin}/logo.png" alt="Bright Path Learning Hub Logo" class="brand-logo" />
        <div>
          <div class="badge">OFFICIAL ACADEMIC REPORT CARD • GOVT. REG. NO. 9840276</div>
          <h1 style="font-size: 22px; font-weight: 900;">Bright Path Learning Hub</h1>
          <p style="font-size: 12.5px; color: #cbd5e1; margin-top: 2px;">
            1-on-1 Personalized Live Learning & AI Companion Portal (KG – Grade 8)
          </p>
        </div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 11px; color: #fbbf24; font-weight: 800;">REPORT REFERENCE</div>
        <div style="font-size: 18px; font-weight: 900;">#${report.reportRef}</div>
        <div style="font-size: 11.5px; color: #cbd5e1; margin-top: 2px;">Issued: ${issuedDate}</div>
      </div>
    </div>

    <div class="body">
      <!-- Student, Class, Term, Date Range & Teacher Metadata -->
      <div class="meta-grid">
        <div>
          <div class="meta-label">Student Name</div>
          <div class="meta-val">${report.studentName}</div>
        </div>
        <div>
          <div class="meta-label">Student Portal ID</div>
          <div class="meta-val">${report.studentUsername}</div>
        </div>
        <div>
          <div class="meta-label">Class / Grade Level</div>
          <div class="meta-val">${report.grade}</div>
        </div>
        <div>
          <div class="meta-label">Enrolled Program / Class</div>
          <div class="meta-val" style="color: #059669;">${report.courseName}</div>
        </div>
        <div>
          <div class="meta-label">Academic Term</div>
          <div class="meta-val">${report.termPeriod}</div>
        </div>
        <div>
          <div class="meta-label">Reporting Date Range</div>
          <div class="meta-val">${dateRangeDisplay}</div>
        </div>
        <div>
          <div class="meta-label">Class Teacher</div>
          <div class="meta-val">${teacherNameDisplay}</div>
        </div>
        <div>
          <div class="meta-label">Parent / Guardian</div>
          <div class="meta-val">${report.parentName}</div>
        </div>
      </div>

      <!-- KPI Summary Row (Overall, Attendance, Homework, AI/Reading) -->
      <div class="kpi-row">
        <div class="kpi-box" style="background: #ecfdf5; border-color: #a7f3d0;">
          <div class="kpi-num" style="color: #059669;">${report.overallScore}% (${report.overallGrade})</div>
          <div class="kpi-sub">Overall Term Grade</div>
        </div>
        ${
          inc.attendance
            ? `<div class="kpi-box">
                <div class="kpi-num">${report.attendanceRate}%</div>
                <div class="kpi-sub">Attendance (${report.lessonsCompleted || 0} Lessons • ${report.learningHours || 0} hrs)</div>
              </div>`
            : `<div class="kpi-box">
                <div class="kpi-num">${report.lessonsCompleted || 0}</div>
                <div class="kpi-sub">Lessons Completed</div>
              </div>`
        }
        ${
          inc.homework
            ? `<div class="kpi-box">
                <div class="kpi-num">${report.homeworkCompletionRate}%</div>
                <div class="kpi-sub">Homework Performance</div>
              </div>`
            : `<div class="kpi-box">
                <div class="kpi-num">${report.learningHours || 0} hrs</div>
                <div class="kpi-sub">Active Study Hours</div>
              </div>`
        }
        <div class="kpi-box">
          <div class="kpi-num" style="color: #1d4ed8;">${report.readingProgress}%</div>
          <div class="kpi-sub">Reading & Phonics Mastery</div>
        </div>
      </div>

      <!-- Subject & Assessment Scores Table + Grading Scale -->
      ${
        inc.assessments
          ? `
      <div class="section-title">
        <span>📊 Subject & Assessment Scores</span>
        <span style="font-size: 11px; color: #64748b; font-weight: 700;">Cumulative Term Evaluation</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Subject / Competency Area</th>
            ${report.subjectScores.some((s) => s.beforeScore !== undefined) ? "<th>Baseline</th>" : ""}
            <th>Term Score</th>
            <th>Grade</th>
            <th>Teacher Assessment Remark</th>
          </tr>
        </thead>
        <tbody>
          ${report.subjectScores
            .map(
              (s) => `
            <tr>
              <td style="font-weight: 800; color: #0f172a;">${s.subject}</td>
              ${
                report.subjectScores.some((item) => item.beforeScore !== undefined)
                  ? `<td style="color: #64748b; font-weight: 700;">${
                      s.beforeScore !== undefined ? `${s.beforeScore}%` : "—"
                    }</td>`
                  : ""
              }
              <td style="font-weight: 900; color: #059669;">${s.score}%</td>
              <td>
                <span style="background: #eff6ff; color: #1d4ed8; padding: 3px 9px; border-radius: 999px; font-weight: 800; font-size: 11.5px;">
                  ${s.grade}
                </span>
              </td>
              <td style="color: #334155;">${s.remark || "Satisfactory progress demonstrated"}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>

      <!-- Official Grading Information Scale -->
      <div class="grading-scale">
        <strong style="color: #0f172a; margin-right: 4px;">Grading Scale Key:</strong>
        <span class="scale-pill" style="color: #047857;">A+ (90–100% Distinction)</span>
        <span class="scale-pill" style="color: #059669;">A (80–89% Excellent)</span>
        <span class="scale-pill" style="color: #1d4ed8;">B+ (70–79% Very Good)</span>
        <span class="scale-pill" style="color: #4338ca;">B (60–69% Good)</span>
        <span class="scale-pill" style="color: #b45309;">C (50–59% Developing)</span>
        <span class="scale-pill" style="color: #dc2626;">D (&lt;50% Needs Intervention)</span>
      </div>
      `
          : ""
      }

      <!-- Bright Buddy AI Learning Progress -->
      ${
        inc.aiProgress
          ? `
      <div class="ai-box">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div style="font-weight: 900; color: #312e81; font-size: 13.5px;">
            🤖 Bright Buddy AI Learning Progress & Companion Summary
          </div>
          <span style="background: #4f46e5; color: #ffffff; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 800;">
            AI Mastery Score: ${aiSummary.averageAiScore}%
          </span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; font-size: 12.5px; color: #1e1b4b;">
          <div>
            <strong>AI Practice Sessions:</strong> ${aiSummary.sessionsCompleted} completed
          </div>
          <div>
            <strong>Reading & Phonics Accuracy:</strong> ${aiSummary.readingProgress}%
          </div>
          <div>
            <strong>Standing:</strong> ${aiSummary.masteryHighlight}
          </div>
        </div>
        <div style="margin-top: 8px; font-size: 12px; color: #4338ca;">
          <strong>Skills Practised with Bright Buddy:</strong> ${
            (aiSummary.skillsPractised || []).join(" • ") || "Reading, Writing, Speaking & Math"
          }
        </div>
      </div>
      `
          : ""
      }

      <!-- Strengths & Weaknesses -->
      ${
        inc.strengthsWeaknesses
          ? `
      <div class="two-col">
        <div class="card-box strengths-box">
          <div style="font-weight: 900; color: #065f46; margin-bottom: 8px; font-size: 13.5px;">
            ✅ Observed Academic Strengths
          </div>
          <ul style="padding-left: 18px; color: #064e3b;">
            ${(report.strengths || [])
              .map((str) => `<li style="margin-bottom: 4px;">${str}</li>`)
              .join("")}
          </ul>
        </div>
        <div class="card-box improve-box">
          <div style="font-weight: 900; color: #92400e; margin-bottom: 8px; font-size: 13.5px;">
            🎯 Identified Weaknesses & Focus Areas
          </div>
          <ul style="padding-left: 18px; color: #78350f;">
            ${(report.areasForImprovement || [])
              .map((imp) => `<li style="margin-bottom: 4px;">${imp}</li>`)
              .join("")}
          </ul>
        </div>
      </div>
      `
          : ""
      }

      <!-- Recommendations -->
      ${
        inc.recommendations && recommendationsList.length > 0
          ? `
      <div class="recommend-box">
        <div style="font-weight: 900; color: #1e40af; margin-bottom: 6px; font-size: 13.5px;">
          💡 Personalized Academic Recommendations & Next Steps
        </div>
        <ul style="padding-left: 18px; color: #1e3a8a;">
          ${recommendationsList.map((rec) => `<li style="margin-bottom: 4px;">${rec}</li>`).join("")}
        </ul>
      </div>
      `
          : ""
      }

      <!-- Teacher's Comment -->
      ${
        inc.teacherComments
          ? `
      <div class="remark-box">
        <div style="font-weight: 900; color: #0a1931; margin-bottom: 4px;">
          👩‍🏫 Class Teacher's Comment (${teacherNameDisplay}):
        </div>
        <div>${report.teacherComment}</div>
      </div>
      `
          : ""
      }

      <!-- School Administrator / Principal Remarks -->
      ${
        inc.adminComments
          ? `
      <div class="admin-remark-box">
        <div style="font-weight: 900; color: #92400e; margin-bottom: 4px;">
          🏛️ School Administrator's Remarks (${adminNameDisplay}):
        </div>
        <div style="color: #78350f;">${schoolRemarksDisplay}</div>
      </div>
      `
          : ""
      }

      <!-- Signatures & School Stamp Footer -->
      <div class="footer-sign">
        <div>
          <strong style="color: #0f172a;">Bright Path Learning Hub</strong> • Kubwa, Abuja, Nigeria<br/>
          WhatsApp / Phone: +234 806 320 2616<br/>
          Email: brightpathlearninghub6@gmail.com
        </div>
        <div style="text-align: center;">
          <div style="border-bottom: 2px solid #0a1931; padding-bottom: 4px; font-weight: 800; color: #0a1931;">
            ${teacherNameDisplay}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Class Teacher Signature</div>
        </div>
        <div style="text-align: right;">
          <div style="border-bottom: 2px solid #0a1931; padding-bottom: 4px; font-weight: 800; color: #0a1931;">
            ${adminNameDisplay}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">School Administrator & Official Seal</div>
        </div>
      </div>
    </div>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 350);
    };
  </script>
</body>
</html>`;

  const printWin = window.open("", "_blank", "width=960,height=900");
  if (printWin) {
    printWin.document.open();
    printWin.document.write(htmlContent);
    printWin.document.close();
  } else {
    // Fallback direct download if popup blocked
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BrightPath-ReportCard-${report.reportRef}-${report.studentName.replace(
      /\s+/g,
      "_"
    )}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export function downloadCertificatePdf(cert: StudentCertificate) {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://brightpathlearninghub.vercel.app";

  const issuedDate = new Date(cert.issuedAt || Date.now()).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Bright Path Achievement Certificate - ${cert.studentName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      background: #f1f5f9;
      color: #0f172a;
      padding: 24px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .toolbar {
      max-width: 900px;
      margin: 0 auto 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: 'Segoe UI', Tahoma, sans-serif;
      background: #071527;
      color: #fff;
      padding: 12px 20px;
      border-radius: 12px;
    }
    .btn-print {
      background: #f59e0b;
      color: #0f172a;
      border: none;
      padding: 10px 18px;
      border-radius: 8px;
      font-weight: 800;
      font-size: 13px;
      cursor: pointer;
    }
    .cert-outer {
      max-width: 900px;
      margin: 0 auto;
      background: #fffbeb;
      padding: 18px;
      border: 6px solid #0a1931;
      border-radius: 18px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.14);
    }
    .cert-inner {
      background: #ffffff;
      border: 3px double #d97706;
      border-radius: 12px;
      padding: 44px 48px;
      text-align: center;
      position: relative;
    }
    .logo {
      width: 84px;
      height: 84px;
      border-radius: 50%;
      border: 3px solid #f59e0b;
      padding: 4px;
      background: #fff;
      object-fit: contain;
      margin-bottom: 12px;
    }
    .school-name {
      font-family: 'Segoe UI', Tahoma, sans-serif;
      font-size: 15px;
      font-weight: 900;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #1e3a8a;
      margin-bottom: 4px;
    }
    .cert-heading {
      font-size: 36px;
      font-weight: 800;
      color: #071527;
      margin: 8px 0;
    }
    .cert-sub {
      font-family: 'Segoe UI', Tahoma, sans-serif;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #b45309;
      font-weight: 800;
      margin-bottom: 22px;
    }
    .student-name {
      font-size: 34px;
      font-weight: 900;
      color: #047857;
      border-bottom: 2px solid #fbbf24;
      display: inline-block;
      padding: 0 28px 6px;
      margin: 10px 0 18px;
    }
    .cert-title {
      font-family: 'Segoe UI', Tahoma, sans-serif;
      font-size: 20px;
      font-weight: 900;
      color: #1e3a8a;
      margin-bottom: 12px;
    }
    .citation {
      font-size: 16px;
      line-height: 1.65;
      color: #334155;
      max-width: 680px;
      margin: 0 auto 32px;
    }
    .footer-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      font-family: 'Segoe UI', Tahoma, sans-serif;
      font-size: 12px;
      color: #475569;
    }
    .seal {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: #ffffff;
      width: 82px;
      height: 82px;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 10px;
      letter-spacing: 0.05em;
      border: 3px dashed #fde68a;
      margin: 0 auto;
    }
    @media print {
      body { background: #ffffff; padding: 0; }
      .toolbar { display: none !important; }
      .cert-outer { box-shadow: none; max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <div>
      <strong>Official Bright Path Certificate (${cert.certRef})</strong>
      <span style="font-size: 12px; color: #cbd5e1; margin-left: 10px;">
        Choose "Save as PDF" or print in Landscape/Portrait
      </span>
    </div>
    <button class="btn-print" onclick="window.print()">🖨️ Print / Save Certificate as PDF</button>
  </div>

  <div class="cert-outer">
    <div class="cert-inner">
      <img src="${origin}/logo.png" alt="Bright Path Learning Hub Logo" class="logo" />
      <div class="school-name">Bright Path Learning Hub • Govt. Reg. No. 9840276</div>
      <h1 class="cert-heading">Certificate of Achievement</h1>
      <div class="cert-sub">Proudly Presented To</div>
      <div class="student-name">${cert.studentName}</div>
      <div style="font-family: 'Segoe UI', sans-serif; font-size: 13px; font-weight: 700; color: #64748b; margin-bottom: 14px;">
        Class / Program: ${cert.grade} • ${cert.courseName}
      </div>
      <div class="cert-title">🏆 ${cert.title}</div>
      <p class="citation">${cert.citation}</p>

      <div class="footer-row">
        <div style="text-align: left;">
          <div style="font-weight: 800; color: #0f172a; font-size: 13px;">Date Issued: ${issuedDate}</div>
          <div style="color: #64748b; margin-top: 2px;">Certificate Ref: #${cert.certRef}</div>
        </div>
        <div class="seal">
          <span>BRIGHT PATH</span>
          <span style="font-size: 14px;">★</span>
          <span>VERIFIED</span>
        </div>
        <div style="text-align: right;">
          <div style="border-bottom: 2px solid #0a1931; padding-bottom: 4px; font-weight: 800; color: #0f172a; font-size: 13px;">
            ${cert.issuedBy || "Bright Path Academic Director"}
          </div>
          <div style="color: #64748b; margin-top: 4px;">Authorized Educator & Academic Director</div>
        </div>
      </div>
    </div>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 350);
    };
  </script>
</body>
</html>`;

  const printWin = window.open("", "_blank", "width=960,height=780");
  if (printWin) {
    printWin.document.open();
    printWin.document.write(htmlContent);
    printWin.document.close();
  } else {
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BrightPath-Certificate-${cert.certRef}-${cert.studentName.replace(
      /\s+/g,
      "_"
    )}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
