"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  CheckCircle2,
  Video,
  FileText,
  Download,
  Bell,
  Send,
  UserCheck,
  AlertCircle,
  HelpCircle,
  BookOpen,
  Award,
  Sparkles,
  Play,
  Volume2,
} from "lucide-react";
import {
  computeStudentRewardsAndAchievements,
  DEFAULT_AVATARS,
  type StudentProgressRecord,
  type HomeworkAssignment,
  type HomeworkSubmission,
  type AiPracticeLog,
  type PortalNotification,
  type TimetableSlot,
  type AttendanceLogEntry,
  type LearningMaterialResource,
  type PortalDirectMessage,
  type SupportTicketItem,
  type PortalCalendarEvent,
} from "@/lib/lmsData";
import { downloadCertificatePdf } from "@/lib/pdfReportGenerator";
import StudentHomeworkModule from "./StudentHomeworkModule";
import type { ToastType } from "./ToastNotification";

export type AdditionalModuleTab =
  | "timetable"
  | "attendance"
  | "materials"
  | "classroom"
  | "assessments"
  | "messages"
  | "announcements"
  | "certificates"
  | "profile"
  | "support"
  | "calendar";

interface PortalAdditionalModulesProps {
  activeModule: AdditionalModuleTab;
  studentAccount: any;
  progress: StudentProgressRecord | null;
  assignments: HomeworkAssignment[];
  submissions: HomeworkSubmission[];
  aiLogs: AiPracticeLog[];
  notifications: PortalNotification[];
  timetableSlots: TimetableSlot[];
  attendanceLogs: AttendanceLogEntry[];
  learningMaterials: LearningMaterialResource[];
  messages: PortalDirectMessage[];
  supportTickets: SupportTicketItem[];
  calendarEvents: PortalCalendarEvent[];
  portalRole: "student" | "parent";
  onRefresh: () => void;
  showToast: (msg: string, type?: ToastType) => void;
}

const DEFAULT_TIMETABLE_TEMPLATE = (courseName: string): TimetableSlot[] => [
  {
    id: "def-tt-1",
    targetStudentUsername: "ALL",
    dayOfWeek: "Monday",
    startTime: "16:00",
    endTime: "16:45",
    subject: courseName || "English Phonics & Reading",
    topic: "1-on-1 Live Phonics, Blending & Guided Reading",
    teacherName: "Bright Path Senior Literacy Educator",
    meetingUrl: "https://meet.google.com/new",
    createdAt: new Date().toISOString(),
  },
  {
    id: "def-tt-2",
    targetStudentUsername: "ALL",
    dayOfWeek: "Wednesday",
    startTime: "16:00",
    endTime: "16:45",
    subject: "Creative Writing & Grammar",
    topic: "Sentence Construction, Spelling & Vocabulary Practice",
    teacherName: "Bright Path Writing Specialist",
    meetingUrl: "https://meet.google.com/new",
    createdAt: new Date().toISOString(),
  },
  {
    id: "def-tt-3",
    targetStudentUsername: "ALL",
    dayOfWeek: "Friday",
    startTime: "16:00",
    endTime: "16:45",
    subject: "Mathematics & SuperSpeakers Oratory",
    topic: "Problem Solving & Confidence-Building Public Speaking",
    teacherName: "Bright Path STEM & Oratory Coach",
    meetingUrl: "https://meet.google.com/new",
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_LEARNING_MATERIALS: LearningMaterialResource[] = [
  {
    id: "def-mat-1",
    title: "Phonics Sounds, Digraphs & Blending Master Worksheet",
    description: "Printable & interactive phonics practice sheet covering sh, ch, th, ph, and vowel teams.",
    subject: "English / Phonics",
    grade: "All Grades",
    category: "PDF Worksheet",
    fileUrl: "#printable-worksheet-phonics",
    targetStudentUsername: "ALL",
    uploadedBy: "Bright Path Curriculum Team",
    createdAt: new Date().toISOString(),
  },
  {
    id: "def-mat-2",
    title: "Sight Words & Sentence Writing Practice Pack",
    description: "Guided handwriting, capitalization, and creative story starter templates.",
    subject: "Writing",
    grade: "All Grades",
    category: "PDF Worksheet",
    fileUrl: "#printable-worksheet-writing",
    targetStudentUsername: "ALL",
    uploadedBy: "Bright Path Curriculum Team",
    createdAt: new Date().toISOString(),
  },
  {
    id: "def-mat-3",
    title: "Mental Math, Multiplication & Word Problems Guide",
    description: "Step-by-step visual guide for addition, subtraction, multiplication tables, and word problems.",
    subject: "Mathematics",
    grade: "All Grades",
    category: "Study Guide",
    fileUrl: "#printable-worksheet-math",
    targetStudentUsername: "ALL",
    uploadedBy: "Bright Path STEM Team",
    createdAt: new Date().toISOString(),
  },
  {
    id: "def-mat-4",
    title: "SuperSpeakers Audio Pronunciation & Storytelling Drill",
    description: "Listen aloud to clear British/International English articulation and storytelling cadence.",
    subject: "Public Speaking",
    grade: "All Grades",
    category: "Audio Phonics / Story",
    fileUrl: "#audio-pronunciation-drill",
    targetStudentUsername: "ALL",
    uploadedBy: "Bright Path Oratory Coach",
    createdAt: new Date().toISOString(),
  },
];

export default function PortalAdditionalModules({
  activeModule,
  studentAccount,
  progress,
  assignments,
  submissions,
  aiLogs,
  notifications,
  timetableSlots,
  attendanceLogs,
  learningMaterials,
  messages,
  supportTickets,
  calendarEvents,
  portalRole,
  onRefresh,
  showToast,
}: PortalAdditionalModulesProps) {
  // Messaging State
  const [msgSubject, setMsgSubject] = useState("Question for Class Teacher");
  const [msgBody, setMsgBody] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);

  // Support Ticket State
  const [tktCategory, setTktCategory] = useState<
    "Technical Support" | "Class Reschedule" | "Academic / Homework Help" | "Account & Portal"
  >("Technical Support");
  const [tktSubject, setTktSubject] = useState("");
  const [tktDesc, setTktDesc] = useState("");
  const [submittingTkt, setSubmittingTkt] = useState(false);

  // Student Profile State
  const [profSubjects, setProfSubjects] = useState<string>(
    (
      progress?.enrolledSubjects || [
        studentAccount.courseName || "English Phonics & Reading",
        "Creative Writing & Grammar",
        "Mathematics & Problem Solving",
        "Public Speaking (SuperSpeakers)",
      ]
    ).join(", ")
  );
  const [profGoals, setProfGoals] = useState<string>(
    (
      progress?.learningGoals || [
        "Read storybooks aloud fluently with 90%+ pronunciation accuracy",
        "Complete all weekly homework assignments on time",
        "Speak with confidence and expressive vocabulary in 1-on-1 live classes",
      ]
    ).join("\n")
  );
  const [profBio, setProfBio] = useState<string>(
    progress?.bioNote ||
      `Enthusiastic ${studentAccount.grade || "Bright Path"} scholar learning ${
        studentAccount.courseName || "English Phonics & Reading"
      }.`
  );
  const [savingProfile, setSavingProfile] = useState(false);

  // Learning Materials Filter
  const [matCategoryFilter, setMatCategoryFilter] = useState<string>("ALL");

  // Online Classroom Scratchpad
  const [classNotes, setClassNotes] = useState("");
  const [audioCheckPassed, setAudioCheckPassed] = useState(false);

  const handleDownloadPrintableWorksheet = (mat: LearningMaterialResource) => {
    if (mat.fileUrl && !mat.fileUrl.startsWith("#printable") && !mat.fileUrl.startsWith("#audio")) {
      window.open(mat.fileUrl, "_blank");
      return;
    }
    if (mat.fileUrl === "#audio-pronunciation-drill") {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(
          "Welcome to Bright Path SuperSpeakers Audio Practice. Repeat after me: Confidence, Articulation, Magnificent, Imagination, Perseverance. Speak clearly and proudly!"
        );
        u.rate = 0.88;
        window.speechSynthesis.speak(u);
        showToast("Playing audio pronunciation drill aloud!", "info");
      }
      return;
    }

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>${mat.title} - Bright Path Learning Hub</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; padding: 32px; color: #0f172a; max-width: 800px; margin: 0 auto; }
    .hdr { border-bottom: 3px solid #0a1931; padding-bottom: 14px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
    .box { border: 1px solid #cbd5e1; border-radius: 12px; padding: 18px; margin-bottom: 16px; background: #f8fafc; }
    .line { border-bottom: 1px dashed #94a3b8; height: 32px; margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="hdr">
    <div>
      <h1 style="margin:0;font-size:22px;">Bright Path Learning Hub — Official Study Worksheet</h1>
      <p style="margin:4px 0 0;color:#475569;font-size:13px;">Subject: ${mat.subject} • Student: ${studentAccount.studentName} (${studentAccount.grade || "All Grades"})</p>
    </div>
    <button onclick="window.print()" style="background:#059669;color:#fff;border:none;padding:9px 16px;border-radius:8px;font-weight:800;cursor:pointer;">🖨️ Print / Save PDF</button>
  </div>
  <h2>${mat.title}</h2>
  <p style="color:#334155;margin-bottom:20px;">${mat.description}</p>
  <div class="box">
    <h3>Part 1: Key Concepts & Guided Practice</h3>
    <p>Read each word or problem aloud carefully before writing your response below:</p>
    <div class="line"></div>
    <div class="line"></div>
    <div class="line"></div>
  </div>
  <div class="box">
    <h3>Part 2: Sentence Construction / Problem Solving</h3>
    <div class="line"></div>
    <div class="line"></div>
    <div class="line"></div>
    <div class="line"></div>
  </div>
</body>
</html>`;
    const win = window.open("", "_blank", "width=850,height=800");
    if (win) {
      win.document.open();
      win.document.write(html);
      win.document.close();
    }
  };

  const handleSendDirectMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgBody.trim()) return;
    setSendingMsg(true);
    try {
      const res = await fetch("/api/lms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send-portal-message",
          studentUsername: studentAccount.username,
          studentName: studentAccount.studentName,
          parentName: studentAccount.parentName || "Parent / Guardian",
          senderRole: portalRole,
          senderName:
            portalRole === "parent"
              ? `${studentAccount.parentName || "Parent"} (Parent)`
              : `${studentAccount.studentName} (Student)`,
          subject: msgSubject,
          message: msgBody.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        setMsgBody("");
        onRefresh();
      }
    } catch {
      showToast("Could not send message.", "error");
    } finally {
      setSendingMsg(false);
    }
  };

  const handleCreateSupportTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tktSubject.trim() || !tktDesc.trim()) return;
    setSubmittingTkt(true);
    try {
      const res = await fetch("/api/lms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create-support-ticket",
          studentUsername: studentAccount.username,
          studentName: studentAccount.studentName,
          category: tktCategory,
          subject: tktSubject.trim(),
          description: tktDesc.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        setTktSubject("");
        setTktDesc("");
        onRefresh();
      }
    } catch {
      showToast("Error submitting support request.", "error");
    } finally {
      setSubmittingTkt(false);
    }
  };

  const handleSaveStudentProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch("/api/lms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-student-profile",
          studentUsername: studentAccount.username,
          studentName: studentAccount.studentName,
          enrolledSubjects: profSubjects
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          learningGoals: profGoals
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
          bioNote: profBio.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Student profile, subjects & learning goals updated!", "success");
        onRefresh();
      }
    } catch {
      showToast("Error saving profile.", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  // =========================================================================
  // 1. MY TIMETABLE: Class Schedules & Upcoming Lessons
  // =========================================================================
  if (activeModule === "timetable") {
    const activeSlots =
      timetableSlots.length > 0
        ? timetableSlots
        : DEFAULT_TIMETABLE_TEMPLATE(studentAccount.courseName);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ background: "#ffffff", borderRadius: 18, padding: 24, border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
            <div>
              <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#1d4ed8", textTransform: "uppercase" }}>
                MY TIMETABLE • WEEKLY SCHEDULE & UPCOMING LESSONS
              </span>
              <h2 style={{ margin: "4px 0", fontSize: "1.25rem", fontWeight: 900, color: "#0f172a" }}>
                🗓️ {studentAccount.studentName}&#39;s 1-on-1 Class Timetable
              </h2>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
                View your weekly class schedule, subject topics, assigned teachers, and direct links to join live lessons.
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 16 }}>
            {activeSlots.map((slot) => (
              <div
                key={slot.id}
                style={{
                  background: "#f8fafc",
                  borderRadius: 16,
                  padding: 18,
                  border: "1px solid #cbd5e1",
                  borderLeft: "5px solid #1d4ed8",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span
                      style={{
                        background: "#dbeafe",
                        color: "#1e40af",
                        padding: "3px 10px",
                        borderRadius: 999,
                        fontSize: "0.74rem",
                        fontWeight: 900,
                      }}
                    >
                      📅 {slot.dayOfWeek}
                    </span>
                    <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#059669" }}>
                      ⏰ {slot.startTime} – {slot.endTime}
                    </span>
                  </div>
                  <h3 style={{ margin: "4px 0", fontSize: "1.02rem", fontWeight: 900, color: "#0f172a" }}>
                    {slot.subject}
                  </h3>
                  <p style={{ margin: "2px 0 8px", fontSize: "0.82rem", color: "#475569" }}>
                    {slot.topic}
                  </p>
                  <div style={{ fontSize: "0.76rem", fontWeight: 700, color: "#64748b" }}>
                    👩‍🏫 Teacher: {slot.teacherName}
                  </div>
                </div>

                <a
                  href={slot.meetingUrl || "https://meet.google.com/new"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{
                    padding: "9px 14px",
                    fontSize: "0.8rem",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <Video size={15} /> Join Scheduled Live Lesson
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. ATTENDANCE: Attendance Records & Absence History
  // =========================================================================
  if (activeModule === "attendance") {
    const rate = progress?.attendanceRate ?? 100;
    const presentCount = attendanceLogs.filter((a) => a.status === "Present").length;
    const lateCount = attendanceLogs.filter((a) => a.status === "Late").length;
    const absentCount = attendanceLogs.filter((a) => a.status === "Absent" || a.status === "Excused").length;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ background: "#ffffff", borderRadius: 18, padding: 24, border: "1px solid #e2e8f0" }}>
          <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#059669", textTransform: "uppercase" }}>
            ATTENDANCE • RECORDS & ABSENCE HISTORY
          </span>
          <h2 style={{ margin: "4px 0 16px", fontSize: "1.25rem", fontWeight: 900, color: "#0f172a" }}>
            📅 {studentAccount.studentName}&#39;s Attendance & Punctuality Log
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 22 }}>
            <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 14, padding: 16 }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#047857" }}>OVERALL ATTENDANCE RATE</div>
              <div style={{ fontSize: "1.9rem", fontWeight: 900, color: "#059669" }}>{rate}%</div>
            </div>
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 14, padding: 16 }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#475569" }}>LESSONS COMPLETED</div>
              <div style={{ fontSize: "1.9rem", fontWeight: 900, color: "#0f172a" }}>
                {progress?.lessonsCompleted || Math.max(presentCount, 1)}
              </div>
            </div>
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 14, padding: 16 }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#b45309" }}>LATE ARRIVALS</div>
              <div style={{ fontSize: "1.9rem", fontWeight: 900, color: "#d97706" }}>{lateCount}</div>
            </div>
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 14, padding: 16 }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#b91c1c" }}>RECORDED ABSENCES</div>
              <div style={{ fontSize: "1.9rem", fontWeight: 900, color: "#dc2626" }}>{absentCount}</div>
            </div>
          </div>

          {attendanceLogs.length === 0 ? (
            <div style={{ padding: 20, background: "#f8fafc", borderRadius: 14, border: "1px solid #e2e8f0", fontSize: "0.86rem", color: "#334155" }}>
              ✅ <strong>100% Attendance Standing:</strong> No absences have been recorded for {studentAccount.studentName}. Every daily attendance log recorded by your teacher will appear here with date, subject, status, and any absence notes.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {attendanceLogs.map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    padding: "14px 18px",
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 10,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 900, fontSize: "0.92rem", color: "#0f172a" }}>
                      📅 {entry.date} — {entry.subject}
                    </div>
                    {(entry.absenceReason || entry.teacherNote) && (
                      <div style={{ fontSize: "0.8rem", color: "#475569", marginTop: 2 }}>
                        {entry.absenceReason ? `Reason: ${entry.absenceReason} • ` : ""}
                        {entry.teacherNote ? `Teacher Note: ${entry.teacherNote}` : ""}
                      </div>
                    )}
                  </div>
                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: 999,
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      background:
                        entry.status === "Present"
                          ? "#dcfce7"
                          : entry.status === "Late"
                          ? "#fef3c7"
                          : "#fee2e2",
                      color:
                        entry.status === "Present"
                          ? "#15803d"
                          : entry.status === "Late"
                          ? "#b45309"
                          : "#dc2626",
                    }}
                  >
                    {entry.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. LEARNING MATERIALS: Download Worksheets, PDFs, Videos & Audio
  // =========================================================================
  if (activeModule === "materials") {
    const allMats = [...learningMaterials, ...DEFAULT_LEARNING_MATERIALS];
    const filteredMats =
      matCategoryFilter === "ALL"
        ? allMats
        : allMats.filter((m) => m.category === matCategoryFilter);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ background: "#ffffff", borderRadius: 18, padding: 24, border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
            <div>
              <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#7c3aed", textTransform: "uppercase" }}>
                LEARNING MATERIALS • WORKSHEETS, PDFS, VIDEOS & AUDIO
              </span>
              <h2 style={{ margin: "4px 0", fontSize: "1.25rem", fontWeight: 900, color: "#0f172a" }}>
                📚 Digital Library & Printable Study Materials
              </h2>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
                Download PDF worksheets, watch video lessons, and listen to phonics & storytelling audio resources.
              </p>
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["ALL", "PDF Worksheet", "Video Lesson", "Audio Phonics / Story", "Study Guide"].map(
                (cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setMatCategoryFilter(cat)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 999,
                      border: matCategoryFilter === cat ? "none" : "1px solid #cbd5e1",
                      background: matCategoryFilter === cat ? "#0f172a" : "#f8fafc",
                      color: matCategoryFilter === cat ? "#ffffff" : "#334155",
                      fontSize: "0.76rem",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    {cat === "ALL" ? "All Materials" : cat}
                  </button>
                )
              )}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 16 }}>
            {filteredMats.map((mat) => (
              <div
                key={mat.id}
                style={{
                  background: "#f8fafc",
                  borderRadius: 16,
                  padding: 18,
                  border: "1px solid #cbd5e1",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 14,
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span
                      style={{
                        background: "#ede9fe",
                        color: "#6d28d9",
                        padding: "3px 10px",
                        borderRadius: 999,
                        fontSize: "0.7rem",
                        fontWeight: 800,
                      }}
                    >
                      {mat.category}
                    </span>
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b" }}>
                      {mat.subject}
                    </span>
                  </div>
                  <h3 style={{ margin: "4px 0 6px", fontSize: "1rem", fontWeight: 900, color: "#0f172a" }}>
                    {mat.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: "0.82rem", color: "#475569", lineHeight: 1.5 }}>
                    {mat.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDownloadPrintableWorksheet(mat)}
                  className="btn btn-primary"
                  style={{ padding: "9px 14px", fontSize: "0.8rem" }}
                >
                  <Download size={15} />{" "}
                  {mat.category.includes("Audio")
                    ? "Listen to Audio Resource"
                    : mat.category.includes("Video")
                    ? "Open Video Lesson"
                    : "Download / Print Worksheet (PDF)"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. ONLINE CLASSROOM: Join Scheduled Live Lessons
  // =========================================================================
  if (activeModule === "classroom") {
    const liveUrl =
      progress?.liveClassroomUrl ||
      timetableSlots[0]?.meetingUrl ||
      "https://meet.google.com/new";

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div
          style={{
            background: "linear-gradient(135deg, #071527 0%, #1e3a8a 100%)",
            color: "#ffffff",
            borderRadius: 20,
            padding: 28,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 20,
          }}
        >
          <div>
            <span
              style={{
                background: "rgba(16, 185, 129, 0.25)",
                color: "#34d399",
                padding: "4px 12px",
                borderRadius: 999,
                fontSize: "0.72rem",
                fontWeight: 900,
              }}
            >
              🟢 LIVE 1-ON-1 VIRTUAL CLASSROOM READY
            </span>
            <h2 style={{ margin: "8px 0 4px", fontSize: "1.4rem", fontWeight: 900 }}>
              🎥 {studentAccount.courseName} — Live Online Classroom
            </h2>
            <p style={{ margin: 0, fontSize: "0.88rem", color: "#cbd5e1", maxWidth: 580 }}>
              Connect face-to-face with your dedicated Bright Path educator for interactive phonics, reading, math, and public speaking sessions.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => {
                setAudioCheckPassed(true);
                if (typeof window !== "undefined" && "speechSynthesis" in window) {
                  window.speechSynthesis.cancel();
                  window.speechSynthesis.speak(
                    new SpeechSynthesisUtterance(
                      `Audio check successful! You are ready to join your live class, ${studentAccount.studentName}.`
                    )
                  );
                }
                showToast("Speaker & microphone readiness check passed!", "success");
              }}
              style={{
                background: audioCheckPassed ? "#059669" : "rgba(255,255,255,0.14)",
                color: "#ffffff",
                border: "1px solid rgba(255,255,255,0.25)",
                padding: "12px 18px",
                borderRadius: 12,
                fontWeight: 800,
                fontSize: "0.84rem",
                cursor: "pointer",
              }}
            >
              🔊 {audioCheckPassed ? "✓ Audio Ready" : "Test Speaker & Audio"}
            </button>

            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "#f97316",
                color: "#ffffff",
                padding: "12px 22px",
                borderRadius: 12,
                fontWeight: 900,
                fontSize: "0.9rem",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Video size={18} /> Launch 1-on-1 Live Classroom
            </a>
          </div>
        </div>

        {/* Live Classroom Scratchpad & Pre-Class Checklist */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))", gap: 18 }}>
          <div style={{ background: "#ffffff", borderRadius: 18, padding: 22, border: "1px solid #e2e8f0" }}>
            <h3 style={{ margin: "0 0 10px", fontSize: "1.05rem", fontWeight: 900 }}>
              📝 Live Lesson Student Scratchpad & Vocabulary Notes
            </h3>
            <textarea
              rows={5}
              className="form-input"
              placeholder="Type new words, math workings, or teacher instructions during your live class here..."
              value={classNotes}
              onChange={(e) => setClassNotes(e.target.value)}
            />
          </div>

          <div style={{ background: "#ffffff", borderRadius: 18, padding: 22, border: "1px solid #e2e8f0" }}>
            <h3 style={{ margin: "0 0 10px", fontSize: "1.05rem", fontWeight: 900 }}>
              ✅ Before Joining Your Live Class
            </h3>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.86rem", color: "#334155", lineHeight: 1.75 }}>
              <li>Sit in a quiet, well-lit study space with your notebook and pencil.</li>
              <li>Click <strong>Test Speaker & Audio</strong> above to make sure you can hear your teacher.</li>
              <li>Have your completed homework and reading passage ready for review.</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 5. ASSESSMENTS: Tests, Quizzes & Examinations
  // =========================================================================
  if (activeModule === "assessments") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div
          style={{
            background: "linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)",
            color: "#ffffff",
            borderRadius: 18,
            padding: 22,
          }}
        >
          <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#c7d2fe", textTransform: "uppercase" }}>
            ASSESSMENTS • TESTS, QUIZZES & EXAMINATIONS
          </span>
          <h2 style={{ margin: "4px 0", fontSize: "1.3rem", fontWeight: 900 }}>
            🧪 Online Quizzes, Subject Tests & Termly Examinations
          </h2>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#e0e7ff" }}>
            Complete timed quizzes, topic tests, and termly assessments online with instant automatic & teacher-reviewed grading.
          </p>
        </div>

        <StudentHomeworkModule
          assignments={assignments}
          submissions={submissions}
          studentUsername={studentAccount.username}
          studentName={studentAccount.studentName}
          parentEmail={studentAccount.email}
          grade={studentAccount.grade || "All Grades"}
          onRefreshData={async () => onRefresh()}
          showToast={showToast}
        />
      </div>
    );
  }

  // =========================================================================
  // 6. MESSAGING: Teacher–Parent / Student Communication
  // =========================================================================
  if (activeModule === "messages") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ background: "#ffffff", borderRadius: 18, padding: 24, border: "1px solid #e2e8f0" }}>
          <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#2563eb", textTransform: "uppercase" }}>
            MESSAGING • DIRECT TEACHER–PARENT COMMUNICATION
          </span>
          <h2 style={{ margin: "4px 0 14px", fontSize: "1.22rem", fontWeight: 900, color: "#0f172a" }}>
            💬 Direct Messages with Class Teacher & Academic Team
          </h2>

          <form
            onSubmit={handleSendDirectMessage}
            style={{
              background: "#f8fafc",
              borderRadius: 14,
              padding: 18,
              border: "1px solid #cbd5e1",
              marginBottom: 20,
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10, marginBottom: 12 }}>
              <input
                type="text"
                className="form-input"
                placeholder="Message Subject (e.g. Question about this week's phonics homework)"
                value={msgSubject}
                onChange={(e) => setMsgSubject(e.target.value)}
                required
                style={{ background: "#fff" }}
              />
              <textarea
                rows={3}
                className="form-input"
                placeholder="Write your message to your Bright Path teacher..."
                value={msgBody}
                onChange={(e) => setMsgBody(e.target.value)}
                required
                style={{ background: "#fff" }}
              />
            </div>
            <button type="submit" disabled={sendingMsg} className="btn btn-primary" style={{ padding: "10px 18px" }}>
              <Send size={15} /> <span>{sendingMsg ? "Sending..." : "Send Message to Teacher"}</span>
            </button>
          </form>

          <h3 style={{ margin: "0 0 12px", fontSize: "1rem", fontWeight: 900 }}>
            📨 Message History ({messages.length})
          </h3>
          {messages.length === 0 ? (
            <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>
              No direct messages yet. Send a message above to start a conversation with your teacher!
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {messages.map((m) => {
                const isFromTeacher = m.senderRole === "teacher";
                return (
                  <div
                    key={m.id}
                    style={{
                      padding: 16,
                      borderRadius: 14,
                      background: isFromTeacher ? "#eff6ff" : "#f8fafc",
                      border: isFromTeacher ? "1px solid #bfdbfe" : "1px solid #e2e8f0",
                      borderLeft: isFromTeacher ? "4px solid #1d4ed8" : "4px solid #10b981",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: "0.78rem" }}>
                      <strong style={{ color: isFromTeacher ? "#1e40af" : "#047857" }}>
                        {isFromTeacher ? `👩‍🏫 ${m.senderName} (Teacher)` : `👤 ${m.senderName}`} — {m.subject}
                      </strong>
                      <span style={{ color: "#64748b" }}>{new Date(m.createdAt).toLocaleString()}</span>
                    </div>
                    <div style={{ fontSize: "0.86rem", color: "#0f172a", lineHeight: 1.5 }}>{m.message}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 7. ANNOUNCEMENTS: School-Wide and Class Announcements
  // =========================================================================
  if (activeModule === "announcements") {
    return (
      <div style={{ background: "#ffffff", borderRadius: 18, padding: 24, border: "1px solid #e2e8f0" }}>
        <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#d97706", textTransform: "uppercase" }}>
          ANNOUNCEMENTS • SCHOOL-WIDE & CLASS BULLETINS
        </span>
        <h2 style={{ margin: "4px 0 16px", fontSize: "1.22rem", fontWeight: 900, color: "#0f172a" }}>
          📢 School-Wide & Class Announcements ({notifications.length})
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              style={{
                padding: 16,
                borderRadius: 14,
                background: "#f8fafc",
                borderLeft: "4px solid #1d4ed8",
                border: "1px solid #e2e8f0",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontWeight: 900, fontSize: "0.94rem", color: "#0f172a" }}>{n.title}</span>
                <span style={{ fontSize: "0.74rem", color: "#64748b" }}>
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div style={{ fontSize: "0.85rem", color: "#475569" }}>{n.message}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 8. CERTIFICATES: Automatically Generated Course Completion Certificates
  // =========================================================================
  if (activeModule === "certificates") {
    const rewards = computeStudentRewardsAndAchievements(
      progress,
      submissions,
      aiLogs,
      studentAccount.studentName,
      studentAccount.username,
      studentAccount.grade || "All Grades",
      studentAccount.courseName || "English Phonics & Reading"
    );

    return (
      <div style={{ background: "#ffffff", borderRadius: 18, padding: 24, border: "1px solid #e2e8f0" }}>
        <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#d97706", textTransform: "uppercase" }}>
          CERTIFICATES • AUTOMATIC COURSE COMPLETION & SUBJECT AWARDS
        </span>
        <h2 style={{ margin: "4px 0 6px", fontSize: "1.25rem", fontWeight: 900, color: "#0f172a" }}>
          🎓 {studentAccount.studentName}&#39;s Official Course Completion & Achievement Certificates
        </h2>
        <p style={{ margin: "0 0 18px", fontSize: "0.85rem", color: "#64748b" }}>
          Includes your automatically generated Course Completion Certificate for <strong>{studentAccount.courseName}</strong> and all earned subject & teacher certificates.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))", gap: 16 }}>
          {rewards.certificates.map((cert) => (
            <div
              key={cert.id}
              style={{
                background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
                border: "2px solid #f59e0b",
                borderRadius: 16,
                padding: 20,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 14,
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span
                    style={{
                      background: "#071527",
                      color: "#fbbf24",
                      padding: "3px 10px",
                      borderRadius: 999,
                      fontSize: "0.7rem",
                      fontWeight: 800,
                    }}
                  >
                    REF #{cert.certRef}
                  </span>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#92400e" }}>
                    {new Date(cert.issuedAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 style={{ margin: "10px 0 6px", fontSize: "1.06rem", fontWeight: 900, color: "#0f172a" }}>
                  🏆 {cert.title}
                </h3>
                <p style={{ margin: 0, fontSize: "0.82rem", color: "#78350f", lineHeight: 1.5 }}>
                  {cert.citation}
                </p>
              </div>

              <button
                type="button"
                onClick={() => downloadCertificatePdf(cert)}
                style={{
                  background: "#071527",
                  color: "#ffffff",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: 10,
                  fontSize: "0.8rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <Download size={15} /> Print / Download Official Certificate PDF
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 9. STUDENT PROFILE: Personal Details, Class, Subjects & Learning Goals
  // =========================================================================
  if (activeModule === "profile") {
    return (
      <div style={{ background: "#ffffff", borderRadius: 18, padding: 24, border: "1px solid #e2e8f0" }}>
        <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#4f46e5", textTransform: "uppercase" }}>
          STUDENT PROFILE • PERSONAL DETAILS, CLASS, SUBJECTS & LEARNING GOALS
        </span>
        <h2 style={{ margin: "4px 0 16px", fontSize: "1.25rem", fontWeight: 900, color: "#0f172a" }}>
          👤 {studentAccount.studentName}&#39;s Scholar Profile & Learning Goals
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 12,
            background: "#f8fafc",
            padding: 16,
            borderRadius: 14,
            border: "1px solid #cbd5e1",
            marginBottom: 20,
          }}
        >
          <div>
            <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#64748b" }}>STUDENT NAME</div>
            <div style={{ fontWeight: 900, fontSize: "0.95rem", color: "#0f172a" }}>{studentAccount.studentName}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#64748b" }}>PORTAL ID</div>
            <div style={{ fontWeight: 900, fontSize: "0.95rem", color: "#1d4ed8" }}>{studentAccount.username}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#64748b" }}>CLASS / GRADE</div>
            <div style={{ fontWeight: 900, fontSize: "0.95rem", color: "#059669" }}>
              {studentAccount.grade || "All Grades"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#64748b" }}>PARENT / GUARDIAN</div>
            <div style={{ fontWeight: 900, fontSize: "0.95rem", color: "#0f172a" }}>
              {studentAccount.parentName || "Parent / Guardian"}
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveStudentProfile}>
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">Enrolled Subjects (Comma-separated)</label>
            <input
              type="text"
              className="form-input"
              value={profSubjects}
              onChange={(e) => setProfSubjects(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">About Me / Scholar Bio</label>
            <input
              type="text"
              className="form-input"
              value={profBio}
              onChange={(e) => setProfBio(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">🎯 My Personal Learning Goals (One goal per line)</label>
            <textarea
              rows={4}
              className="form-input"
              value={profGoals}
              onChange={(e) => setProfGoals(e.target.value)}
            />
          </div>

          <button type="submit" disabled={savingProfile} className="btn btn-primary" style={{ padding: "10px 20px" }}>
            <span>{savingProfile ? "Saving Profile..." : "Save Student Profile & Learning Goals"}</span>
          </button>
        </form>
      </div>
    );
  }

  // =========================================================================
  // 10. SUPPORT CENTRE: Help Requests & Technical Support
  // =========================================================================
  if (activeModule === "support") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ background: "#ffffff", borderRadius: 18, padding: 24, border: "1px solid #e2e8f0" }}>
          <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#059669", textTransform: "uppercase" }}>
            SUPPORT CENTRE • HELP REQUESTS & TECHNICAL SUPPORT
          </span>
          <h2 style={{ margin: "4px 0 6px", fontSize: "1.22rem", fontWeight: 900, color: "#0f172a" }}>
            🛠️ Bright Path Help Desk & Technical Support Centre
          </h2>
          <p style={{ margin: "0 0 16px", fontSize: "0.85rem", color: "#64748b" }}>
            Need help with a live class link, rescheduling a session, or a technical issue? Submit a support ticket below or reach us directly on WhatsApp (+234 806 320 2616).
          </p>

          <form
            onSubmit={handleCreateSupportTicket}
            style={{
              background: "#f8fafc",
              borderRadius: 14,
              padding: 18,
              border: "1px solid #cbd5e1",
              marginBottom: 20,
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 12 }}>
              <div>
                <label className="form-label">Support Category</label>
                <select
                  className="form-select"
                  value={tktCategory}
                  onChange={(e) => setTktCategory(e.target.value as any)}
                  style={{ background: "#fff" }}
                >
                  <option value="Technical Support">💻 Technical Support</option>
                  <option value="Class Reschedule">🗓️ Class Reschedule Request</option>
                  <option value="Academic / Homework Help">📚 Academic / Homework Help</option>
                  <option value="Account & Portal">🔐 Account & Portal Access</option>
                </select>
              </div>
              <div>
                <label className="form-label">Subject / Brief Summary</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Request to move Friday's class to Saturday 11 AM"
                  value={tktSubject}
                  onChange={(e) => setTktSubject(e.target.value)}
                  required
                  style={{ background: "#fff" }}
                />
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label className="form-label">How can our team help you?</label>
              <textarea
                rows={3}
                className="form-input"
                placeholder="Describe your question or technical issue..."
                value={tktDesc}
                onChange={(e) => setTktDesc(e.target.value)}
                required
                style={{ background: "#fff" }}
              />
            </div>
            <button type="submit" disabled={submittingTkt} className="btn btn-primary" style={{ padding: "10px 18px" }}>
              <Send size={15} /> <span>{submittingTkt ? "Submitting..." : "Submit Support Request"}</span>
            </button>
          </form>

          <h3 style={{ margin: "0 0 12px", fontSize: "1rem", fontWeight: 900 }}>
            🎫 My Support Tickets ({supportTickets.length})
          </h3>
          {supportTickets.length === 0 ? (
            <p style={{ fontSize: "0.84rem", color: "#64748b", margin: 0 }}>
              No support tickets submitted yet.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {supportTickets.map((t) => (
                <div
                  key={t.id}
                  style={{
                    padding: 16,
                    borderRadius: 14,
                    background: "#f8fafc",
                    border: "1px solid #cbd5e1",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                    <span style={{ fontWeight: 900, fontSize: "0.92rem", color: "#0f172a" }}>
                      #{t.ticketRef} • [{t.category}] {t.subject}
                    </span>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: 999,
                        fontSize: "0.72rem",
                        fontWeight: 800,
                        background: t.status === "Resolved" ? "#dcfce7" : "#fef3c7",
                        color: t.status === "Resolved" ? "#15803d" : "#b45309",
                      }}
                    >
                      {t.status}
                    </span>
                  </div>
                  <p style={{ margin: "6px 0 0", fontSize: "0.84rem", color: "#334155" }}>{t.description}</p>
                  {t.adminReply && (
                    <div
                      style={{
                        marginTop: 10,
                        padding: 12,
                        borderRadius: 10,
                        background: "#ecfdf5",
                        borderLeft: "4px solid #059669",
                        fontSize: "0.83rem",
                        color: "#064e3b",
                      }}
                    >
                      <strong>Support Team Response:</strong> {t.adminReply}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 11. CALENDAR: Homework Deadlines, Examinations & School Events
  // =========================================================================
  const hwEvents: PortalCalendarEvent[] = assignments.map((hw) => ({
    id: `cal-hw-${hw.id}`,
    title: `${
      hw.assessmentCategory === "examination"
        ? "🧪 Examination"
        : hw.assessmentCategory === "test"
        ? "📋 Topic Test"
        : hw.assessmentCategory === "quiz"
        ? "⚡ Quick Quiz"
        : "📝 Homework Due"
    }: ${hw.title}`,
    date: hw.dueDate,
    category:
      hw.assessmentCategory && hw.assessmentCategory !== "homework"
        ? "Examination / Assessment"
        : "Homework Deadline",
    description: `${hw.subject || hw.courseName} • ${hw.questions.length} questions (${hw.totalPoints} pts)`,
    targetStudentUsername: studentAccount.username,
    createdAt: hw.createdAt,
  }));

  const mergedEvents = [...calendarEvents, ...hwEvents].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  return (
    <div style={{ background: "#ffffff", borderRadius: 18, padding: 24, border: "1px solid #e2e8f0" }}>
      <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#1d4ed8", textTransform: "uppercase" }}>
        ACADEMIC CALENDAR • HOMEWORK DEADLINES, EXAMINATIONS & EVENTS
      </span>
      <h2 style={{ margin: "4px 0 6px", fontSize: "1.25rem", fontWeight: 900, color: "#0f172a" }}>
        🗓️ Academic Calendar & Upcoming Deadlines ({mergedEvents.length})
      </h2>
      <p style={{ margin: "0 0 18px", fontSize: "0.85rem", color: "#64748b" }}>
        Tracks all upcoming homework submission deadlines, scheduled tests & examinations, live class milestones, and school events.
      </p>

      {mergedEvents.length === 0 ? (
        <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>
          No upcoming deadlines or events scheduled right now.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mergedEvents.map((ev) => (
            <div
              key={ev.id}
              style={{
                padding: 16,
                borderRadius: 14,
                background: "#f8fafc",
                border: "1px solid #cbd5e1",
                borderLeft:
                  ev.category === "Examination / Assessment"
                    ? "5px solid #dc2626"
                    : ev.category === "Homework Deadline"
                    ? "5px solid #f59e0b"
                    : "5px solid #2563eb",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 900, fontSize: "0.95rem", color: "#0f172a" }}>{ev.title}</div>
                <div style={{ fontSize: "0.82rem", color: "#475569", marginTop: 2 }}>{ev.description}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span
                  style={{
                    background: "#eff6ff",
                    color: "#1e40af",
                    padding: "4px 12px",
                    borderRadius: 999,
                    fontSize: "0.76rem",
                    fontWeight: 900,
                  }}
                >
                  📅 {ev.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

