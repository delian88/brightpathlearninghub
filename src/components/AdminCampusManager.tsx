"use client";

import React, { useState } from "react";
import type { LmsStateData } from "@/lib/lmsData";
import type { ToastType } from "./ToastNotification";

export type CampusTab = "profiles" | "announcements" | "timetable" | "attendance" | "materials" | "messages" | "support" | "calendar";

interface Props {
  section: CampusTab;
  lmsData: LmsStateData;
  students: { username: string; studentName: string }[];
  onRefresh: () => void;
  showToast: (msg: string, type?: ToastType) => void;
}

export const CAMPUS_TABS: { id: CampusTab; label: string }[] = [
  { id: "profiles", label: "Student Profiles & Classroom" },
  { id: "announcements", label: "Announcements" },
  { id: "timetable", label: "Timetable" },
  { id: "attendance", label: "Attendance" },
  { id: "materials", label: "Learning Materials" },
  { id: "messages", label: "Parent Messages" },
  { id: "support", label: "Support Tickets" },
  { id: "calendar", label: "Calendar Events" },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  padding: 20,
};
const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 12,
  marginBottom: 12,
};
const row: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
  padding: "10px 12px",
  border: "1px solid #e2e8f0",
  borderRadius: 10,
  background: "#f8fafc",
  fontSize: "0.84rem",
};

export default function AdminCampusManager({ section, lmsData, students, onRefresh, showToast }: Props) {
  const tab = section;
  const [fileName, setFileName] = useState("");
  const [pfSubjects, setPfSubjects] = useState("");
  const [pfGoals, setPfGoals] = useState("");
  const [pfBio, setPfBio] = useState("");
  const [pfLive, setPfLive] = useState("");
  const [busy, setBusy] = useState(false);

  // shared target student ("ALL" or username)
  const [target, setTarget] = useState("ALL");
  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");
  const [text2, setText2] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [day, setDay] = useState("Monday");
  const [start, setStart] = useState("16:00");
  const [end, setEnd] = useState("16:45");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("Present");
  const [sendCalendarEmail, setSendCalendarEmail] = useState(true);
  const [calendarViewMode, setCalendarViewMode] = useState<"calendar" | "list">("calendar");
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(() => new Date());
  const [replies, setReplies] = useState<Record<string, string>>({});

  const nameOf = (u: string) => students.find((s) => s.username === u)?.studentName || u;

  const post = async (payload: Record<string, any>, reset = true) => {
    setBusy(true);
    try {
      const res = await fetch("/api/lms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "Saved!", "success");
        if (reset) {
          setText("");
          setText2("");
          setUrl("");
          setFileName("");
        }
        onRefresh();
      } else {
        showToast(data.message || "Action failed.", "error");
      }
    } catch {
      showToast("Connection error. Please try again.", "error");
    } finally {
      setBusy(false);
    }
  };

  const targetSelect = (allowAll: boolean) => (
    <div className="form-group">
      <label className="form-label">Student</label>
      <select className="form-select" value={target} onChange={(e) => setTarget(e.target.value)}>
        {allowAll && <option value="ALL">All students</option>}
        {!allowAll && <option value="">Select a student…</option>}
        {students.map((s) => (
          <option key={s.username} value={s.username}>
            {s.studentName} ({s.username})
          </option>
        ))}
      </select>
    </div>
  );

  const input = (label: string, value: string, set: (v: string) => void, type = "text", ph = "") => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input type={type} className="form-input" value={value} placeholder={ph} onChange={(e) => set(e.target.value)} />
    </div>
  );

  const needStudent = () => {
    if (!target || target === "ALL") {
      showToast("Please select a specific student.", "warning");
      return true;
    }
    return false;
  };

  const del = (action: string, key: string, id: string) => (
    <button
      type="button"
      className="btn btn-outline"
      style={{ padding: "4px 10px", fontSize: "0.75rem", color: "#dc2626" }}
      onClick={() => post({ action, [key]: id }, false)}
    >
      Delete
    </button>
  );

  const empty = (msg: string) => <div style={{ color: "#64748b", fontSize: "0.85rem" }}>{msg}</div>;

  return (
    <div style={card}>
      <h2 style={{ margin: "0 0 14px", fontSize: "1.15rem", fontWeight: 800 }}>
        {CAMPUS_TABS.find((t) => t.id === tab)?.label}
      </h2>

      {tab === "profiles" && (
        <>
          <div style={grid}>
            <div className="form-group">
              <label className="form-label">Student</label>
              <select
                className="form-select"
                value={target}
                onChange={(e) => {
                  const u = e.target.value;
                  setTarget(u);
                  const rec: any = (lmsData as any).progressRecords?.[u.toUpperCase()];
                  setPfSubjects((rec?.enrolledSubjects || []).join(", "));
                  setPfGoals((rec?.learningGoals || []).join("\n"));
                  setPfBio(rec?.bioNote || "");
                  setPfLive(rec?.liveClassroomUrl || "");
                }}
              >
                <option value="ALL">Select a student…</option>
                {students.map((s) => (
                  <option key={s.username} value={s.username}>
                    {s.studentName} ({s.username})
                  </option>
                ))}
              </select>
            </div>
            {input("Enrolled subjects (comma separated)", pfSubjects, setPfSubjects)}
            {input("Live classroom link", pfLive, setPfLive, "url", "https://…")}
          </div>
          <div className="form-group">
            <label className="form-label">Learning goals (one per line)</label>
            <textarea className="form-input" rows={3} value={pfGoals} onChange={(e) => setPfGoals(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Profile note</label>
            <textarea className="form-input" rows={2} value={pfBio} onChange={(e) => setPfBio(e.target.value)} />
          </div>
          <button
            className="btn btn-primary"
            disabled={busy}
            onClick={() => {
              if (needStudent()) return;
              post(
                {
                  action: "update-student-profile",
                  studentUsername: target,
                  studentName: nameOf(target),
                  enrolledSubjects: pfSubjects.split(",").map((s) => s.trim()).filter(Boolean),
                  learningGoals: pfGoals.split("\n").map((s) => s.trim()).filter(Boolean),
                  bioNote: pfBio,
                  liveClassroomUrl: pfLive,
                },
                false
              );
            }}
          >
            Save Student Profile
          </button>
        </>
      )}

      {tab === "announcements" && (
        <>
          <div style={grid}>
            {targetSelect(true)}
            {input("Title", text, setText)}
          </div>
          <div className="form-group">
            <label className="form-label">Message (All students = school-wide)</label>
            <textarea className="form-input" rows={3} value={text2} onChange={(e) => setText2(e.target.value)} />
          </div>
          <button
            className="btn btn-primary"
            disabled={busy}
            onClick={() => {
              if (!text.trim() || !text2.trim()) {
                showToast("Enter a title and message.", "warning");
                return;
              }
              post({
                action: "post-announcement",
                targetStudentUsername: target,
                type: "announcement",
                title: text,
                message: text2,
              });
            }}
          >
            Post Announcement
          </button>
          <div style={{ display: "grid", gap: 8, marginTop: 16 }}>
            {(lmsData.notifications || []).length === 0 && empty("No announcements yet.")}
            {(lmsData.notifications || []).slice(0, 20).map((n) => (
              <div key={n.id} style={{ ...row, flexDirection: "column", alignItems: "flex-start" }}>
                <span>
                  <b>{n.title}</b> ·{" "}
                  {n.targetStudentUsername === "ALL" ? "School-wide" : nameOf(n.targetStudentUsername)}
                </span>
                <span style={{ color: "#475569" }}>{n.message}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "timetable" && (
        <>
          <div style={grid}>
            {targetSelect(true)}
            <div className="form-group">
              <label className="form-label">Day</label>
              <select className="form-select" value={day} onChange={(e) => setDay(e.target.value)}>
                {DAYS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            {input("Start", start, setStart, "time")}
            {input("End", end, setEnd, "time")}
            {input("Subject", subject, setSubject)}
            {input("Topic", text, setText)}
            {input("Teacher", text2, setText2)}
            {input("Meeting URL", url, setUrl, "url", "https://…")}
          </div>
          <button
            className="btn btn-primary"
            disabled={busy}
            onClick={() =>
              post({
                action: "save-timetable-slot",
                targetStudentUsername: target,
                dayOfWeek: day,
                startTime: start,
                endTime: end,
                subject: subject || undefined,
                topic: text || undefined,
                teacherName: text2 || undefined,
                meetingUrl: url || undefined,
              })
            }
          >
            Add Timetable Slot
          </button>
          <div style={{ display: "grid", gap: 8, marginTop: 16 }}>
            {(lmsData.timetableSlots || []).length === 0 && empty("No timetable slots yet.")}
            {(lmsData.timetableSlots || []).map((s) => (
              <div key={s.id} style={row}>
                <span>
                  <b>{s.dayOfWeek}</b> {s.startTime}–{s.endTime} · {s.subject} · {s.topic} ·{" "}
                  {s.targetStudentUsername === "ALL" ? "All students" : nameOf(s.targetStudentUsername)}
                </span>
                {del("delete-timetable-slot", "slotId", s.id)}
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "attendance" && (
        <>
          <div style={grid}>
            {targetSelect(false)}
            {input("Date", date, setDate, "date")}
            {input("Subject", subject, setSubject)}
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option>Present</option>
                <option>Late</option>
                <option>Excused</option>
                <option>Absent</option>
              </select>
            </div>
            {input("Absence reason", text, setText)}
            {input("Teacher note", text2, setText2)}
          </div>
          <button
            className="btn btn-primary"
            disabled={busy}
            onClick={() => {
              if (needStudent()) return;
              post({
                action: "record-attendance",
                studentUsername: target,
                studentName: nameOf(target),
                date,
                subject: subject || undefined,
                status,
                absenceReason: text,
                teacherNote: text2,
              });
            }}
          >
            Record Attendance
          </button>
          <div style={{ display: "grid", gap: 8, marginTop: 16 }}>
            {(lmsData.attendanceLogs || []).length === 0 && empty("No attendance records yet.")}
            {(lmsData.attendanceLogs || []).slice(0, 30).map((a) => (
              <div key={a.id} style={row}>
                <span>
                  {a.date} · <b>{a.studentName}</b> · {a.subject} · {a.status}
                  {a.absenceReason ? ` (${a.absenceReason})` : ""}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "materials" && (
        <>
          <div style={grid}>
            {targetSelect(true)}
            {input("Title", text, setText)}
            {input("Subject", subject, setSubject)}
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="PDF Worksheet">PDF Worksheet</option>
                <option value="Video Lesson">Video Lesson</option>
                <option value="Audio Phonics / Story">Audio Phonics / Story</option>
                <option value="Study Guide">Study Guide</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Upload from your computer (max 3 MB)</label>
              <input
                type="file"
                className="form-input"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.mp3,.wav,.m4a,.mp4,.webm"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  if (f.size > 3 * 1024 * 1024) {
                    showToast("File is too large. Please use a file under 3 MB or paste a link instead.", "warning");
                    e.target.value = "";
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = () => {
                    setUrl(String(reader.result));
                    setFileName(f.name);
                    if (!text.trim()) setText(f.name.replace(/\.[^.]+$/, ""));
                    if (f.type.startsWith("video/")) setCategory("Video Lesson");
                    else if (f.type.startsWith("audio/")) setCategory("Audio Phonics / Story");
                    else if (f.type === "application/pdf") setCategory("PDF Worksheet");
                  };
                  reader.readAsDataURL(f);
                }}
              />
              {fileName && <div style={{ fontSize: "0.75rem", color: "#059669", marginTop: 4 }}>Selected: {fileName}</div>}
            </div>
            {fileName ? null : input("...or paste a file / video link", url, setUrl, "url", "https://…")}
            {input("Description", text2, setText2)}
          </div>
          <button
            className="btn btn-primary"
            disabled={busy}
            onClick={() => {
              if (!text.trim() || !url.trim()) {
                showToast("Upload a file or paste a link, and enter a title.", "warning");
                return;
              }
              post({
                action: "save-learning-material",
                title: text,
                description: text2,
                subject: subject || undefined,
                category: category || "PDF Worksheet",
                fileUrl: url,
                fileName: fileName || undefined,
                targetStudentUsername: target,
              });
            }}
          >
            Publish Material
          </button>
          <div style={{ display: "grid", gap: 8, marginTop: 16 }}>
            {(lmsData.learningMaterials || []).length === 0 && empty("No materials published yet.")}
            {(lmsData.learningMaterials || []).map((m) => (
              <div key={m.id} style={row}>
                <span>
                  <b>{m.title}</b> · {m.category} ·{" "}
                  {m.targetStudentUsername === "ALL" ? "All students" : nameOf(m.targetStudentUsername)}
                </span>
                {del("delete-learning-material", "materialId", m.id)}
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "messages" && (
        <>
          <div style={grid}>
            {targetSelect(false)}
            {input("Subject", subject, setSubject)}
          </div>
          <div className="form-group">
            <label className="form-label">Message to parent</label>
            <textarea className="form-input" rows={3} value={text} onChange={(e) => setText(e.target.value)} />
          </div>
          <button
            className="btn btn-primary"
            disabled={busy}
            onClick={() => {
              if (needStudent()) return;
              post({
                action: "send-portal-message",
                studentUsername: target,
                studentName: nameOf(target),
                senderRole: "teacher",
                senderName: "Bright Path Teacher",
                subject: subject || "Academic Update",
                message: text,
              });
            }}
          >
            Send Message
          </button>
          <div style={{ display: "grid", gap: 8, marginTop: 16 }}>
            {(lmsData.messages || []).length === 0 && empty("No messages yet.")}
            {(lmsData.messages || []).slice(0, 30).map((m) => (
              <div key={m.id} style={{ ...row, flexDirection: "column", alignItems: "flex-start" }}>
                <span>
                  <b>{m.senderName}</b> ({m.senderRole}) · re {m.studentName} · {m.subject}
                </span>
                <span style={{ color: "#475569" }}>{m.message}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "support" && (
        <div style={{ display: "grid", gap: 10 }}>
          {(lmsData.supportTickets || []).length === 0 && empty("No support tickets yet.")}
          {(lmsData.supportTickets || []).map((t) => (
            <div key={t.id} style={{ ...row, flexDirection: "column", alignItems: "stretch" }}>
              <div>
                <b>#{t.ticketRef}</b> · {t.studentName} · {t.category} · <b>{t.status}</b>
              </div>
              <div>
                <b>{t.subject}</b>: {t.description}
              </div>
              {t.adminReply && <div style={{ color: "#059669" }}>Reply: {t.adminReply}</div>}
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  className="form-input"
                  placeholder="Write a reply…"
                  value={replies[t.id] || ""}
                  onChange={(e) => setReplies({ ...replies, [t.id]: e.target.value })}
                />
                <button
                  className="btn btn-primary"
                  disabled={busy}
                  onClick={() =>
                    post(
                      {
                        action: "resolve-support-ticket",
                        ticketId: t.id,
                        adminReply: replies[t.id] || "",
                        status: "Resolved",
                      },
                      false
                    )
                  }
                >
                  Resolve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "calendar" && (
        <>
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 14, padding: 18, marginBottom: 20 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: "0.98rem", fontWeight: 800, color: "#0f172a" }}>
              🗓️ Schedule New Event & Email Alert
            </h3>
            <div style={grid}>
              {targetSelect(true)}
              {input("Title", text, setText, "text", "e.g. End of Term Phonics Assessment")}
              {input("Date", date, setDate, "date")}
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="School Event">School Event</option>
                  <option value="Homework Deadline">Homework Deadline</option>
                  <option value="Examination / Assessment">Examination / Assessment</option>
                  <option value="Live Class">Live Class</option>
                </select>
              </div>
              {input("Description / Notes", text2, setText2, "text", "Optional details sent in email alert")}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "10px 0 14px" }}>
              <input
                type="checkbox"
                id="sendCalendarEmailCheckbox"
                checked={sendCalendarEmail}
                onChange={(e) => setSendCalendarEmail(e.target.checked)}
                style={{ width: 17, height: 17, cursor: "pointer", accentColor: "#0284c7" }}
              />
              <label htmlFor="sendCalendarEmailCheckbox" style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1e293b", cursor: "pointer" }}>
                📧 Send automatic email notification to {target === "ALL" ? "all student parent emails" : `${nameOf(target)}'s parent`} & admin
              </label>
            </div>

            <button
              className="btn btn-primary"
              disabled={busy}
              onClick={() => {
                if (!text.trim()) {
                  showToast("Enter an event title.", "warning");
                  return;
                }
                post({
                  action: "save-calendar-event",
                  title: text,
                  date,
                  category: category || "School Event",
                  description: text2,
                  targetStudentUsername: target,
                  sendEmailNotification: sendCalendarEmail,
                });
              }}
            >
              {sendCalendarEmail ? "Schedule Event & Send Email Alerts" : "Schedule Event"}
            </button>
          </div>

          {/* Interactive Monthly Visual Calendar Grid */}
          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 18, marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ padding: "4px 12px", fontSize: "0.8rem" }}
                  onClick={() => {
                    const prev = new Date(currentCalendarMonth);
                    prev.setMonth(prev.getMonth() - 1);
                    setCurrentCalendarMonth(prev);
                  }}
                >
                  ← Prev Month
                </button>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
                  {currentCalendarMonth.toLocaleString("default", { month: "long", year: "numeric" })}
                </h3>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ padding: "4px 12px", fontSize: "0.8rem" }}
                  onClick={() => {
                    const next = new Date(currentCalendarMonth);
                    next.setMonth(next.getMonth() + 1);
                    setCurrentCalendarMonth(next);
                  }}
                >
                  Next Month →
                </button>
              </div>

              <div style={{ display: "flex", gap: 6 }}>
                <button
                  type="button"
                  onClick={() => setCalendarViewMode("calendar")}
                  className={calendarViewMode === "calendar" ? "btn btn-primary" : "btn btn-outline"}
                  style={{ padding: "4px 12px", fontSize: "0.78rem" }}
                >
                  📅 Monthly Grid
                </button>
                <button
                  type="button"
                  onClick={() => setCalendarViewMode("list")}
                  className={calendarViewMode === "list" ? "btn btn-primary" : "btn btn-outline"}
                  style={{ padding: "4px 12px", fontSize: "0.78rem" }}
                >
                  📋 List View ({lmsData.calendarEvents?.length || 0})
                </button>
              </div>
            </div>

            {calendarViewMode === "calendar" ? (
              (() => {
                const year = currentCalendarMonth.getFullYear();
                const month = currentCalendarMonth.getMonth();
                const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sun
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const todayStr = new Date().toISOString().split("T")[0];

                const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                const calendarCells = [];

                // Empty padding days before day 1
                for (let i = 0; i < firstDayOfMonth; i++) {
                  calendarCells.push(<div key={`empty-${i}`} style={{ minHeight: 90, background: "#f8fafc", border: "1px solid #f1f5f9", borderRadius: 8 }} />);
                }

                // Days of current month
                for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
                  const dayString = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                  const dayEvents = (lmsData.calendarEvents || []).filter((e) => e.date === dayString);
                  const isToday = dayString === todayStr;

                  calendarCells.push(
                    <div
                      key={`day-${dayNum}`}
                      onClick={() => setDate(dayString)}
                      style={{
                        minHeight: 90,
                        background: isToday ? "#eff6ff" : "#ffffff",
                        border: isToday ? "2px solid #0284c7" : "1px solid #e2e8f0",
                        borderRadius: 8,
                        padding: 6,
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 800, fontSize: "0.82rem", color: isToday ? "#0284c7" : "#334155" }}>
                          {dayNum}
                        </span>
                        {isToday && (
                          <span style={{ fontSize: "0.65rem", fontWeight: 800, background: "#0284c7", color: "#ffffff", padding: "1px 5px", borderRadius: 999 }}>
                            TODAY
                          </span>
                        )}
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 3, overflowY: "auto", maxHeight: 75 }}>
                        {dayEvents.map((ev) => {
                          const badgeColor =
                            ev.category === "Examination / Assessment"
                              ? "#ef4444"
                              : ev.category === "Homework Deadline"
                              ? "#f59e0b"
                              : ev.category === "Live Class"
                              ? "#10b981"
                              : "#6366f1";
                          return (
                            <div
                              key={ev.id}
                              title={`${ev.title} (${ev.category}) - ${ev.description || ""}`}
                              style={{
                                background: `${badgeColor}15`,
                                borderLeft: `3px solid ${badgeColor}`,
                                padding: "2px 5px",
                                borderRadius: 4,
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                color: "#0f172a",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {ev.title}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                return (
                  <div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 6, textAlign: "center" }}>
                      {dayLabels.map((lbl) => (
                        <div key={lbl} style={{ fontWeight: 800, fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase" }}>
                          {lbl}
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
                      {calendarCells}
                    </div>
                  </div>
                );
              })()
            ) : null}
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <h4 style={{ margin: "10px 0 4px", fontSize: "0.95rem", fontWeight: 800, color: "#0f172a" }}>
              📋 All Scheduled Events ({lmsData.calendarEvents?.length || 0})
            </h4>
            {(lmsData.calendarEvents || []).length === 0 && empty("No calendar events scheduled yet.")}
            {(lmsData.calendarEvents || []).map((e) => (
              <div key={e.id} style={row}>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 800, color: "#0f172a" }}>{e.title}</span>
                    <span style={{ background: "#e0f2fe", color: "#0369a1", fontSize: "0.7rem", fontWeight: 800, padding: "2px 8px", borderRadius: 999 }}>
                      {e.category}
                    </span>
                    <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                      📅 {e.date}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 700 }}>
                      👤 {e.targetStudentUsername === "ALL" ? "All students & parents" : nameOf(e.targetStudentUsername)}
                    </span>
                    {e.emailNotificationSent && (
                      <span style={{ fontSize: "0.7rem", background: "#ecfdf5", color: "#059669", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>
                        ✉️ Email Sent
                      </span>
                    )}
                  </div>
                  {e.description && (
                    <div style={{ fontSize: "0.78rem", color: "#475569", marginTop: 2 }}>
                      {e.description}
                    </div>
                  )}
                </div>
                {del("delete-calendar-event", "eventId", e.id)}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

