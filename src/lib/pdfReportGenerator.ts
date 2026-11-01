import type { StudentReportCard } from "./lmsData";

export function downloadReportCardPdf(report: StudentReportCard) {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://brightpathlearninghub.vercel.app";

  const issuedDate = new Date(report.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Report Card ${report.reportRef} - ${report.studentName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #f1f5f9;
      color: #0f172a;
      padding: 28px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .report-sheet {
      max-width: 820px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      border: 2px solid #0a1931;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(0,0,0,0.12);
    }
    .toolbar {
      max-width: 820px;
      margin: 0 auto 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #071527;
      color: #fff;
      padding: 12px 20px;
      border-radius: 12px;
    }
    .btn-print {
      background: #10b981;
      color: #ffffff;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 800;
      font-size: 14px;
      cursor: pointer;
    }
    .header {
      background: linear-gradient(135deg, #071527 0%, #133e87 100%);
      color: #ffffff;
      padding: 28px 32px;
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
      width: 68px;
      height: 68px;
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
    .body { padding: 28px 32px; }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 22px;
      font-size: 13px;
    }
    .meta-label { color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .meta-val { color: #0f172a; font-weight: 800; font-size: 14px; margin-top: 2px; }
    .kpi-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .kpi-box {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px;
      text-align: center;
      background: #ffffff;
    }
    .kpi-num { font-size: 24px; font-weight: 800; color: #071527; }
    .kpi-sub { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-top: 4px; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      font-size: 13.5px;
    }
    th {
      background: #0a1931;
      color: #ffffff;
      text-align: left;
      padding: 11px 14px;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    td {
      padding: 11px 14px;
      border-bottom: 1px solid #e2e8f0;
    }
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 22px;
    }
    .card-box {
      border-radius: 12px;
      padding: 16px;
      font-size: 13px;
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
    .remark-box {
      background: #f8fafc;
      border-left: 5px solid #133e87;
      padding: 16px 20px;
      border-radius: 10px;
      margin-bottom: 24px;
      font-size: 13.5px;
      line-height: 1.6;
    }
    .footer-sign {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 18px;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #475569;
    }
    @media print {
      body { background: #ffffff; padding: 0; }
      .toolbar { display: none !important; }
      .report-sheet { box-shadow: none; border: 2px solid #0a1931; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <div>
      <strong>Official Report Card PDF Preview (${report.reportRef})</strong>
      <span style="font-size: 12px; color: #cbd5e1; margin-left: 10px;">Select "Save as PDF" in your print dialog</span>
    </div>
    <button class="btn-print" onclick="window.print()">🖨️ Save / Download as PDF</button>
  </div>

  <div class="report-sheet">
    <div class="header">
      <div class="brand-row">
        <img src="${origin}/logo.png" alt="Bright Path Logo" class="brand-logo" />
        <div>
          <div class="badge">OFFICIAL ACADEMIC REPORT CARD • GOVT. REG. NO. 9840276</div>
          <h1 style="font-size: 22px; font-weight: 800;">Bright Path Learning Hub</h1>
          <p style="font-size: 13px; color: #cbd5e1; margin-top: 2px;">1-on-1 Personalized Live Learning Portal (KG – Grade 8)</p>
        </div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 12px; color: #fbbf24; font-weight: 800;">REPORT REF</div>
        <div style="font-size: 18px; font-weight: 800;">#${report.reportRef}</div>
        <div style="font-size: 12px; color: #cbd5e1; margin-top: 2px;">Issued: ${issuedDate}</div>
      </div>
    </div>

    <div class="body">
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
          <div class="meta-label">Grade / Level</div>
          <div class="meta-val">${report.grade}</div>
        </div>
        <div>
          <div class="meta-label">Enrolled Program</div>
          <div class="meta-val" style="color: #059669;">${report.courseName}</div>
        </div>
        <div>
          <div class="meta-label">Parent / Guardian</div>
          <div class="meta-val">${report.parentName}</div>
        </div>
        <div>
          <div class="meta-label">Academic Term</div>
          <div class="meta-val">${report.termPeriod}</div>
        </div>
      </div>

      <div class="kpi-row">
        <div class="kpi-box" style="background: #ecfdf5; border-color: #a7f3d0;">
          <div class="kpi-num" style="color: #059669;">${report.overallScore}% (${report.overallGrade})</div>
          <div class="kpi-sub">Overall Score</div>
        </div>
        <div class="kpi-box">
          <div class="kpi-num">${report.attendanceRate}%</div>
          <div class="kpi-sub">Attendance Rate</div>
        </div>
        <div class="kpi-box">
          <div class="kpi-num">${report.homeworkCompletionRate}%</div>
          <div class="kpi-sub">Homework Completion</div>
        </div>
        <div class="kpi-box">
          <div class="kpi-num" style="color: #1d4ed8;">${report.readingProgress}%</div>
          <div class="kpi-sub">Reading Progress</div>
        </div>
      </div>

      <h3 style="font-size: 14px; font-weight: 800; text-transform: uppercase; color: #0a1931; margin-bottom: 10px;">
        Subject & Skill Mastery Evaluation
      </h3>
      <table>
        <thead>
          <tr>
            <th>Subject / Competency Area</th>
            <th>Score</th>
            <th>Grade</th>
            <th>Educator Assessment Remark</th>
          </tr>
        </thead>
        <tbody>
          ${report.subjectScores
            .map(
              (s) => `
            <tr>
              <td style="font-weight: 700;">${s.subject}</td>
              <td style="font-weight: 800; color: #059669;">${s.score}%</td>
              <td><span style="background: #eff6ff; color: #1d4ed8; padding: 3px 9px; border-radius: 999px; font-weight: 800; font-size: 12px;">${s.grade}</span></td>
              <td style="color: #475569;">${s.remark}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>

      <div class="two-col">
        <div class="card-box strengths-box">
          <div style="font-weight: 800; color: #065f46; margin-bottom: 8px; font-size: 14px;">
            ✅ Key Academic Strengths
          </div>
          <ul style="padding-left: 18px; color: #064e3b;">
            ${report.strengths.map((str) => `<li style="margin-bottom: 4px;">${str}</li>`).join("")}
          </ul>
        </div>
        <div class="card-box improve-box">
          <div style="font-weight: 800; color: #92400e; margin-bottom: 8px; font-size: 14px;">
            🎯 Areas Identified for Improvement
          </div>
          <ul style="padding-left: 18px; color: #78350f;">
            ${report.areasForImprovement.map((imp) => `<li style="margin-bottom: 4px;">${imp}</li>`).join("")}
          </ul>
        </div>
      </div>

      <div class="remark-box">
        <div style="font-weight: 800; color: #0a1931; margin-bottom: 4px;">
          Educator & Academic Counselor's Overall Comment:
        </div>
        <div>${report.teacherComment}</div>
      </div>

      <div class="footer-sign">
        <div>
          <strong>Bright Path Learning Hub</strong> • Kubwa, Abuja, Nigeria<br/>
          WhatsApp / Phone: +234 806 320 2616 • Email: brightpathlearninghub6@gmail.com
        </div>
        <div style="text-align: right;">
          <div style="border-bottom: 2px solid #0a1931; padding-bottom: 4px; font-weight: 800; color: #0a1931;">
            ${report.issuedBy || "Bright Path Academic Director"}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Authorized Academic Seal & Signature</div>
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

  const printWin = window.open("", "_blank", "width=920,height=860");
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
    a.download = `BrightPath-ReportCard-${report.reportRef}-${report.studentName.replace(/\s+/g, "_")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

