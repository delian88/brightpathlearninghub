"use client";

import React, { useState } from "react";
import {
  Plus,
  Trash2,
  CheckCircle2,
  FileText,
  Download,
  Send,
  Award,
  TrendingUp,
  Bell,
  BookOpen,
  User,
  Sparkles,
} from "lucide-react";
import {
  type LmsStateData,
  type HomeworkQuestion,
  type HomeworkSubmission,
  type StudentReportCard,
  getOrCreateStudentProgress,
} from "@/lib/lmsData";
import { downloadReportCardPdf } from "@/lib/pdfReportGenerator";
import type { ToastType } from "./ToastNotification";

interface AdminLmsManagerProps {
  activeSection: "lms-homework" | "lms-progress" | "lms-reports";
  lmsData: LmsStateData;
  studentAccounts: any[];
  onRefresh: () => void;
  showToast: (msg: string, type?: ToastType) => void;
}

export default function AdminLmsManager({
  activeSection,
  lmsData,
  studentAccounts,
  onRefresh,
  showToast,
}: AdminLmsManagerProps) {
  // 1. Create Homework State
  const [hwTitle, setHwTitle] = useState("");
  const [hwDescription, setHwDescription] = useState("");
  const [hwCourse, setHwCourse] = useState("English Phonics & Reading");
  const [hwGrade, setHwGrade] = useState("All Grades");
  const [hwTargetType, setHwTargetType] = useState<"all" | "course" | "student">("all");
  const [hwStudentUsername, setHwStudentUsername] = useState("");
  const [hwDueDate, setHwDueDate] = useState(
    new Date(Date.now() + 4 * 86400000).toISOString().split("T")[0]
  );
  const [hwQuestions, setHwQuestions] = useState<HomeworkQuestion[]>([
    {
      id: "q-1",
      type: "objective",
      prompt: "Which word has the correct spelling and phonics blend?",
      options: ["Brite", "Bright", "Bryte", "Briht"],
      correctAnswer: "Bright",
      points: 50,
      skillTag: "Phonics & Spelling",
    },
    {
      id: "q-2",
      type: "subjective",
      prompt: "Write 2 complete sentences using the word 'CONFIDENCE'.",
      points: 50,
      skillTag: "Sentence Writing",
    },
  ]);
  const [creatingHw, setCreatingHw] = useState(false);

  // 2. Manual Grading State
  const [gradingSub, setGradingSub] = useState<HomeworkSubmission | null>(null);
  const [gradeSubjectiveScore, setGradeSubjectiveScore] = useState(0);
  const [gradeFeedback, setGradeFeedback] = useState("");
  const [savingGrade, setSavingGrade] = useState(false);

  // 3. Student Academic Progress Editor State
  const [selectedStudentUser, setSelectedStudentUser] = useState<string>(
    studentAccounts[0]?.username || "BP-ZAINAB-1001"
  );
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMsg, setAnnouncementMsg] = useState("");
  const [sendingNotif, setSendingNotif] = useState(false);

  // 4. Report Card Generator State
  const [rcStudentUser, setRcStudentUser] = useState<string>(
    studentAccounts[0]?.username || "BP-ZAINAB-1001"
  );
  const [rcTerm, setRcTerm] = useState("First Academic Term • 2026");
  const [rcAttendance, setRcAttendance] = useState(96);
  const [rcReadingProgress, setRcReadingProgress] = useState(90);
  const [rcHomeworkRate, setRcHomeworkRate] = useState(95);
  const [rcStrengths, setRcStrengths] = useState(
    "Strong phonemic awareness and reading fluency\nActive participation in 1-on-1 live classes\nConsistent completion of homework assignments"
  );
  const [rcImprovements, setRcImprovements] = useState(
    "Practising multi-syllable word pronunciation aloud\nExpanding descriptive vocabulary in paragraph writing"
  );
  const [rcComment, setRcComment] = useState(
    "Has shown outstanding dedication during 1-on-1 live classes and interactive AI reading sessions. Keep up the wonderful momentum!"
  );
  const [rcSubjects, setRcSubjects] = useState([
    {
      subject: "English Phonics & Reading Fluency",
      score: 92,
      grade: "A+",
      remark: "Reads passages with clarity and strong comprehension",
    },
    {
      subject: "Word Pronunciation & Public Speaking",
      score: 88,
      grade: "A",
      remark: "Confident articulation and expressive voice projection",
    },
    {
      subject: "Creative Writing & Grammar",
      score: 85,
      grade: "A",
      remark: "Well-structured sentences and proper punctuation",
    },
    {
      subject: "Conceptual Math & Problem Solving",
      score: 90,
      grade: "A+",
      remark: "Excellent logical reasoning and mental math accuracy",
    },
  ]);
  const [generatingRc, setGeneratingRc] = useState(false);

  const addQuestion = (type: "objective" | "subjective") => {
    setHwQuestions((prev) => [
      ...prev,
      type === "objective"
        ? {
            id: `q-${Date.now()}`,
            type: "objective",
            prompt: "",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: "Option A",
            points: 25,
            skillTag: hwCourse,
          }
        : {
            id: `q-${Date.now()}`,
            type: "subjective",
            prompt: "",
            points: 25,
            skillTag: "Written Expression",
          },
    ]);
  };

  const removeQuestion = (idx: number) => {
    setHwQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCreateHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingHw(true);
    try {
      const targetStudent = studentAccounts.find(
        (s) => s.username?.toUpperCase() === hwStudentUsername.toUpperCase()
      );
      const res = await fetch("/api/lms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create-homework",
          title: hwTitle,
          description: hwDescription,
          courseName: hwCourse,
          grade: hwGrade,
          targetType: hwTargetType,
          assignedStudentUsername: hwTargetType === "student" ? hwStudentUsername : undefined,
          assignedStudentName: targetStudent?.studentName,
          dueDate: hwDueDate,
          questions: hwQuestions,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "Homework created & assigned!", "success");
        setHwTitle("");
        setHwDescription("");
        onRefresh();
      } else {
        showToast(data.message || "Could not create homework.", "error");
      }
    } catch {
      showToast("Error creating homework assignment.", "error");
    } finally {
      setCreatingHw(false);
    }
  };

  const handleDeleteHomework = async (id: string) => {
    try {
      const res = await fetch("/api/lms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete-homework", id }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Homework assignment removed.", "info");
        onRefresh();
      }
    } catch {
      showToast("Failed to delete homework.", "error");
    }
  };

  const handleSaveManualGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSub) return;
    setSavingGrade(true);
    try {
      const totalScore = Number(gradingSub.objectiveScore || 0) + Number(gradeSubjectiveScore || 0);
      const res = await fetch("/api/lms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "grade-submission",
          submissionId: gradingSub.id,
          subjectiveScore: Number(gradeSubjectiveScore),
          totalScore,
          teacherFeedback: gradeFeedback,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        setGradingSub(null);
        onRefresh();
      } else {
        showToast(data.message || "Failed to save grade.", "error");
      }
    } catch {
      showToast("Error saving grade.", "error");
    } finally {
      setSavingGrade(false);
    }
  };

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingNotif(true);
    try {
      const res = await fetch("/api/lms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "post-announcement",
          targetStudentUsername: "ALL",
          type: "announcement",
          title: announcementTitle,
          message: announcementMsg,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Announcement sent to all students & parents!", "success");
        setAnnouncementTitle("");
        setAnnouncementMsg("");
        onRefresh();
      }
    } catch {
      showToast("Error sending announcement.", "error");
    } finally {
      setSendingNotif(false);
    }
  };

  const handleGenerateReportCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingRc(true);
    try {
      const matchedAcc = studentAccounts.find(
        (s) => s.username?.toUpperCase() === rcStudentUser.toUpperCase()
      ) || {
        username: rcStudentUser || "BP-ZAINAB-1001",
        studentName: "Zainab Bello",
        parentName: "Amina Bello",
        email: "amina.bello@example.com",
        grade: "Grade 2",
        courseName: "English Phonics & Reading",
      };

      const res = await fetch("/api/lms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate-report-card",
          studentUsername: matchedAcc.username,
          studentName: matchedAcc.studentName,
          parentName: matchedAcc.parentName,
          parentEmail: matchedAcc.email,
          grade: matchedAcc.grade,
          courseName: matchedAcc.courseName,
          termPeriod: rcTerm,
          attendanceRate: rcAttendance,
          readingProgress: rcReadingProgress,
          homeworkCompletionRate: rcHomeworkRate,
          subjectScores: rcSubjects,
          strengths: rcStrengths
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
          areasForImprovement: rcImprovements
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
          teacherComment: rcComment,
          portalUrl: `${window.location.origin}/portal`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        onRefresh();
      } else {
        showToast(data.message || "Failed to generate report card.", "error");
      }
    } catch {
      showToast("Error generating report card.", "error");
    } finally {
      setGeneratingRc(false);
    }
  };

  // ==========================================================================
  // SECTION 1: HOMEWORK ASSIGNMENT BUILDER & SUBMISSIONS GRADING
  // ==========================================================================
  if (activeSection === "lms-homework") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Create & Assign Homework Form */}
        <div className="admin-panel-card" style={{ padding: 24 }}>
          <h2 style={{ margin: "0 0 6px", fontSize: "1.15rem", fontWeight: 800 }}>
            📝 Create & Assign Homework (Individual Student or Entire Class)
          </h2>
          <p style={{ margin: "0 0 18px", fontSize: "0.84rem", color: "#64748b" }}>
            Objective multiple-choice questions are automatically graded when students submit. Written questions can be manually graded below.
          </p>

          <form onSubmit={handleCreateHomework}>
            <div className="form-row-2col" style={{ marginBottom: 14 }}>
              <div className="form-group">
                <label className="form-label">Homework Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Week 4 Phonics Blending & Vocabulary Quiz"
                  value={hwTitle}
                  onChange={(e) => setHwTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Course / Class Program</label>
                <select
                  className="form-select"
                  value={hwCourse}
                  onChange={(e) => setHwCourse(e.target.value)}
                >
                  <option value="English Phonics & Reading">English Phonics & Reading</option>
                  <option value="Public Speaking & Communication">Public Speaking & Communication</option>
                  <option value="Coding Classes for Kids">Coding Classes for Kids</option>
                  <option value="Bright Math - Conceptual Mathematics">Bright Math - Conceptual Mathematics</option>
                </select>
              </div>
            </div>

            <div className="form-row-2col" style={{ marginBottom: 14 }}>
              <div className="form-group">
                <label className="form-label">Assign To</label>
                <select
                  className="form-select"
                  value={hwTargetType}
                  onChange={(e) => setHwTargetType(e.target.value as any)}
                >
                  <option value="all">Entire School / All Enrolled Students</option>
                  <option value="course">Entire Course Class ({hwCourse})</option>
                  <option value="student">Individual Student Only</option>
                </select>
              </div>

              {hwTargetType === "student" ? (
                <div className="form-group">
                  <label className="form-label">Select Individual Student</label>
                  <select
                    className="form-select"
                    value={hwStudentUsername}
                    onChange={(e) => setHwStudentUsername(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Student --</option>
                    <option value="BP-ZAINAB-1001">Zainab Bello (BP-ZAINAB-1001 • Grade 2)</option>
                    {studentAccounts.map((s) => (
                      <option key={s.id} value={s.username}>
                        {s.studentName} ({s.username} • {s.grade})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={hwDueDate}
                    onChange={(e) => setHwDueDate(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Instructions for Students</label>
              <input
                type="text"
                className="form-input"
                placeholder="Complete all objective multiple-choice questions and write clear sentences."
                value={hwDescription}
                onChange={(e) => setHwDescription(e.target.value)}
              />
            </div>

            {/* Questions Builder */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <label className="form-label" style={{ margin: 0 }}>
                  Homework Questions ({hwQuestions.length})
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => addQuestion("objective")}
                    style={{
                      background: "#eff6ff",
                      color: "#1d4ed8",
                      border: "1px solid #bfdbfe",
                      padding: "6px 12px",
                      borderRadius: 8,
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    + Add Auto-Graded Objective Question
                  </button>
                  <button
                    type="button"
                    onClick={() => addQuestion("subjective")}
                    style={{
                      background: "#f5f3ff",
                      color: "#7c3aed",
                      border: "1px solid #ddd6fe",
                      padding: "6px 12px",
                      borderRadius: 8,
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    + Add Written Question (Manual Grade)
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {hwQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #cbd5e1",
                      borderRadius: 12,
                      padding: 16,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          color: q.type === "objective" ? "#1d4ed8" : "#7c3aed",
                        }}
                      >
                        Q{idx + 1}: {q.type === "objective" ? "OBJECTIVE (AUTO-GRADED)" : "SUBJECTIVE (TEACHER GRADED)"}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: "0.76rem", fontWeight: 700 }}>Points:</span>
                        <input
                          type="number"
                          value={q.points}
                          onChange={(e) => {
                            const updated = [...hwQuestions];
                            updated[idx].points = Number(e.target.value);
                            setHwQuestions(updated);
                          }}
                          style={{ width: 64, padding: "4px 8px", borderRadius: 6, border: "1px solid #cbd5e1" }}
                        />
                        {hwQuestions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeQuestion(idx)}
                            style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: 6, borderRadius: 6, cursor: "pointer" }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter question prompt..."
                      value={q.prompt}
                      onChange={(e) => {
                        const updated = [...hwQuestions];
                        updated[idx].prompt = e.target.value;
                        setHwQuestions(updated);
                      }}
                      required
                      style={{ marginBottom: 10, background: "#fff" }}
                    />

                    {q.type === "objective" && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        {(q.options || ["", "", "", ""]).map((opt, oIdx) => (
                          <input
                            key={oIdx}
                            type="text"
                            className="form-input"
                            placeholder={`Option ${oIdx + 1}`}
                            value={opt}
                            onChange={(e) => {
                              const updated = [...hwQuestions];
                              const opts = [...(updated[idx].options || [])];
                              opts[oIdx] = e.target.value;
                              updated[idx].options = opts;
                              setHwQuestions(updated);
                            }}
                            style={{ background: "#fff", padding: "8px 10px", fontSize: "0.82rem" }}
                          />
                        ))}
                        <div style={{ gridColumn: "span 2", marginTop: 4 }}>
                          <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#059669" }}>
                            Correct Answer (must match one option above for auto-grading):
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            value={q.correctAnswer || ""}
                            onChange={(e) => {
                              const updated = [...hwQuestions];
                              updated[idx].correctAnswer = e.target.value;
                              setHwQuestions(updated);
                            }}
                            style={{ background: "#ecfdf5", borderColor: "#10b981", marginTop: 4 }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={creatingHw}
              className="btn btn-primary shining"
              style={{ padding: "12px 24px" }}
            >
              <Plus size={17} />
              <span>{creatingHw ? "Assigning Homework..." : "Publish & Assign Homework"}</span>
            </button>
          </form>
        </div>

        {/* Student Submissions & Manual Teacher Grading */}
        <div className="admin-panel-card" style={{ padding: 24 }}>
          <h2 style={{ margin: "0 0 6px", fontSize: "1.15rem", fontWeight: 800 }}>
            ✅ Student Submissions — Auto-Graded Objective & Manual Teacher Grading ({lmsData.submissions.length})
          </h2>
          <p style={{ margin: "0 0 16px", fontSize: "0.84rem", color: "#64748b" }}>
            Review submitted homework, inspect student answers, adjust written scores, and send teacher feedback.
          </p>

          {gradingSub && (
            <form
              onSubmit={handleSaveManualGrade}
              style={{
                background: "#f5f3ff",
                border: "2px solid #7c3aed",
                borderRadius: 14,
                padding: 20,
                marginBottom: 20,
              }}
            >
              <h3 style={{ margin: "0 0 8px", fontSize: "1.05rem", fontWeight: 800 }}>
                Grading: {gradingSub.studentName} ({gradingSub.homeworkTitle})
              </h3>
              <p style={{ fontSize: "0.82rem", color: "#475569", marginBottom: 12 }}>
                Auto-Graded Objective Score: <strong>{gradingSub.objectiveScore} pts</strong>
              </p>

              <div style={{ background: "#ffffff", padding: 14, borderRadius: 10, marginBottom: 14, fontSize: "0.84rem" }}>
                <strong>Student&#39;s Submitted Answers:</strong>
                <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
                  {Object.entries(gradingSub.answers || {}).map(([qId, ans]) => (
                    <li key={qId}>
                      <strong>{qId}:</strong> {ans}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="form-row-2col" style={{ marginBottom: 12 }}>
                <div className="form-group">
                  <label className="form-label">Manual Score for Written Questions</label>
                  <input
                    type="number"
                    className="form-input"
                    value={gradeSubjectiveScore}
                    onChange={(e) => setGradeSubjectiveScore(Number(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Teacher Feedback to Student & Parent</label>
                  <input
                    type="text"
                    className="form-input"
                    value={gradeFeedback}
                    onChange={(e) => setGradeFeedback(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" disabled={savingGrade} className="btn btn-primary" style={{ padding: "8px 18px" }}>
                  {savingGrade ? "Saving Grade..." : "Save Grade & Notify Student"}
                </button>
                <button
                  type="button"
                  onClick={() => setGradingSub(null)}
                  style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {lmsData.submissions.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "#64748b", background: "#f8fafc", borderRadius: 12 }}>
              No homework submissions yet. When a student submits homework in <code>/portal</code>, it appears here immediately.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {lmsData.submissions.map((sub) => (
                <div
                  key={sub.id}
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>
                      {sub.studentName} ({sub.studentUsername}) — {sub.homeworkTitle}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: 2 }}>
                      Auto Objective: {sub.objectiveScore} pts • Written: {sub.subjectiveScore} pts •{" "}
                      <strong style={{ color: "#059669" }}>
                        Total: {sub.totalScore}/{sub.maxPoints} ({sub.percentage}%)
                      </strong>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#334155", marginTop: 4 }}>
                      Feedback: &ldquo;{sub.teacherFeedback}&rdquo;
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setGradingSub(sub);
                      setGradeSubjectiveScore(sub.subjectiveScore);
                      setGradeFeedback(sub.teacherFeedback);
                    }}
                    style={{
                      background: "#0a1931",
                      color: "#ffffff",
                      border: "none",
                      padding: "8px 14px",
                      borderRadius: 8,
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      cursor: "pointer",
                    }}
                  >
                    ✏️ Grade / Edit Feedback
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Homework List */}
        <div className="admin-panel-card" style={{ padding: 24 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: "1.05rem", fontWeight: 800 }}>
            📚 Active Assigned Homework ({lmsData.assignments.length})
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {lmsData.assignments.map((hw) => (
              <div
                key={hw.id}
                style={{
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: "0.9rem" }}>{hw.title}</div>
                  <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                    {hw.courseName} • Target: {hw.targetType.toUpperCase()}{" "}
                    {hw.assignedStudentUsername ? `(${hw.assignedStudentUsername})` : ""} •{" "}
                    {hw.questions.length} questions ({hw.totalPoints} pts) • Due: {hw.dueDate}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteHomework(hw.id)}
                  style={{
                    background: "#fef2f2",
                    color: "#dc2626",
                    border: "1px solid #fecaca",
                    padding: "6px 10px",
                    borderRadius: 8,
                    fontSize: "0.76rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // SECTION 2: ACADEMIC PROGRESS TRACKER, AI LOGS & ANNOUNCEMENTS
  // ==========================================================================
  if (activeSection === "lms-progress") {
    const selectedProg = getOrCreateStudentProgress(
      lmsData,
      selectedStudentUser,
      studentAccounts.find((s) => s.username === selectedStudentUser)?.studentName || "Zainab Bello"
    );

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div className="admin-panel-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800 }}>
                📈 Student Academic Development & Areas Needing Improvement
              </h2>
              <p style={{ margin: "2px 0 0", fontSize: "0.84rem", color: "#64748b" }}>
                Track each child&#39;s reading progress, homework completion, AI buddy practice logs, and diagnostic areas.
              </p>
            </div>

            <select
              className="form-select"
              style={{ maxWidth: 320 }}
              value={selectedStudentUser}
              onChange={(e) => setSelectedStudentUser(e.target.value)}
            >
              <option value="BP-ZAINAB-1001">Zainab Bello (BP-ZAINAB-1001 • Grade 2)</option>
              {studentAccounts.map((s) => (
                <option key={s.id} value={s.username}>
                  {s.studentName} ({s.username} • {s.grade})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 20 }}>
            <div style={{ padding: 14, borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#64748b" }}>LESSONS COMPLETED</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1d4ed8" }}>
                {selectedProg.lessonsCompleted} / {selectedProg.totalLessons}
              </div>
            </div>
            <div style={{ padding: 14, borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#64748b" }}>READING PROGRESS</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#059669" }}>
                {selectedProg.readingProgress}%
              </div>
            </div>
            <div style={{ padding: 14, borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#64748b" }}>ATTENDANCE RATE</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#10b981" }}>
                {selectedProg.attendanceRate}%
              </div>
            </div>
            <div style={{ padding: 14, borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#64748b" }}>LEARNING HOURS</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#d97706" }}>
                {selectedProg.learningHours} hrs
              </div>
            </div>
          </div>

          <div className="form-row-2col">
            <div style={{ background: "#ecfdf5", padding: 16, borderRadius: 12, border: "1px solid #a7f3d0" }}>
              <div style={{ fontWeight: 800, color: "#065f46", marginBottom: 8 }}>
                ✅ Identified Strengths:
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.85rem", color: "#064e3b" }}>
                {selectedProg.customStrengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div style={{ background: "#fffbeb", padding: 16, borderRadius: 12, border: "1px solid #fde68a" }}>
              <div style={{ fontWeight: 800, color: "#92400e", marginBottom: 8 }}>
                🎯 Identified Areas Needing Improvement:
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.85rem", color: "#78350f" }}>
                {selectedProg.customImprovements.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* AI Learning Buddy Practice Logs */}
        <div className="admin-panel-card" style={{ padding: 24 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: "1.05rem", fontWeight: 800 }}>
            🤖 Recent AI Learning Buddy Sessions (Reading, Pronunciation & Writing)
          </h3>
          {lmsData.aiLogs.length === 0 ? (
            <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
              No AI practice sessions recorded yet. When students read aloud, practise pronunciation, or submit writing in the AI Learning Buddy, their scores and detected improvement areas appear here.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {lmsData.aiLogs.slice(0, 10).map((log) => (
                <div
                  key={log.id}
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    fontSize: "0.84rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800 }}>
                    <span>
                      {log.studentName} ({log.studentUsername}) — {log.topic}
                    </span>
                    <span style={{ color: "#059669" }}>Score: {log.score}%</span>
                  </div>
                  <div style={{ color: "#475569", marginTop: 4 }}>{log.feedback}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Broadcast Announcement / Reminder to Students & Parents */}
        <div className="admin-panel-card" style={{ padding: 24 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: "1.05rem", fontWeight: 800 }}>
            🔔 Send Portal Notification / Reminder to Students & Parents
          </h3>
          <form onSubmit={handlePostAnnouncement}>
            <div className="form-row-2col" style={{ marginBottom: 12 }}>
              <input
                type="text"
                className="form-input"
                placeholder="Notification Title (e.g. Weekend Public Speaking Workshop)"
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                required
              />
              <input
                type="text"
                className="form-input"
                placeholder="Message details..."
                value={announcementMsg}
                onChange={(e) => setAnnouncementMsg(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={sendingNotif} className="btn btn-primary" style={{ padding: "10px 20px" }}>
              <Bell size={16} />
              <span>{sendingNotif ? "Sending..." : "Post Announcement to Student Portals"}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // SECTION 3: GENERATE & SEND DOWNLOADABLE PDF REPORT CARDS TO PARENTS
  // ==========================================================================
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div className="admin-panel-card" style={{ padding: 24 }}>
        <h2 style={{ margin: "0 0 6px", fontSize: "1.15rem", fontWeight: 800 }}>
          📄 Generate & Send Downloadable PDF Report Card to Parents
        </h2>
        <p style={{ margin: "0 0 18px", fontSize: "0.84rem", color: "#64748b" }}>
          Prepare an official academic report card, email it directly to the parent, and publish it for one-click PDF download in the Student & Parent Portal.
        </p>

        <form onSubmit={handleGenerateReportCard}>
          <div className="form-row-2col" style={{ marginBottom: 14 }}>
            <div className="form-group">
              <label className="form-label">Select Student Account</label>
              <select
                className="form-select"
                value={rcStudentUser}
                onChange={(e) => setRcStudentUser(e.target.value)}
              >
                <option value="BP-ZAINAB-1001">Zainab Bello (BP-ZAINAB-1001 • Grade 2)</option>
                {studentAccounts.map((s) => (
                  <option key={s.id} value={s.username}>
                    {s.studentName} ({s.username} • {s.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Academic Term / Period</label>
              <input
                type="text"
                className="form-input"
                value={rcTerm}
                onChange={(e) => setRcTerm(e.target.value)}
                required
              />
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div className="form-group">
              <label className="form-label">Attendance Rate (%)</label>
              <input
                type="number"
                className="form-input"
                value={rcAttendance}
                onChange={(e) => setRcAttendance(Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Homework Completion (%)</label>
              <input
                type="number"
                className="form-input"
                value={rcHomeworkRate}
                onChange={(e) => setRcHomeworkRate(Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Reading & Phonics Progress (%)</label>
              <input
                type="number"
                className="form-input"
                value={rcReadingProgress}
                onChange={(e) => setRcReadingProgress(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Subject Scores Table Editor */}
          <div style={{ marginBottom: 16 }}>
            <label className="form-label">Subject Evaluations</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {rcSubjects.map((subj, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 90px 80px 2fr",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <input
                    type="text"
                    className="form-input"
                    value={subj.subject}
                    onChange={(e) => {
                      const updated = [...rcSubjects];
                      updated[idx].subject = e.target.value;
                      setRcSubjects(updated);
                    }}
                  />
                  <input
                    type="number"
                    className="form-input"
                    value={subj.score}
                    onChange={(e) => {
                      const updated = [...rcSubjects];
                      const sc = Number(e.target.value);
                      updated[idx].score = sc;
                      updated[idx].grade = sc >= 90 ? "A+" : sc >= 80 ? "A" : sc >= 70 ? "B+" : "B";
                      setRcSubjects(updated);
                    }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    value={subj.grade}
                    onChange={(e) => {
                      const updated = [...rcSubjects];
                      updated[idx].grade = e.target.value;
                      setRcSubjects(updated);
                    }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    value={subj.remark}
                    onChange={(e) => {
                      const updated = [...rcSubjects];
                      updated[idx].remark = e.target.value;
                      setRcSubjects(updated);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="form-row-2col" style={{ marginBottom: 14 }}>
            <div className="form-group">
              <label className="form-label">Key Strengths (One per line)</label>
              <textarea
                rows={3}
                className="form-input"
                value={rcStrengths}
                onChange={(e) => setRcStrengths(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Areas Needing Improvement (One per line)</label>
              <textarea
                rows={3}
                className="form-input"
                value={rcImprovements}
                onChange={(e) => setRcImprovements(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 18 }}>
            <label className="form-label">Teacher&#39;s Overall Remark</label>
            <textarea
              rows={2}
              className="form-input"
              value={rcComment}
              onChange={(e) => setRcComment(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={generatingRc}
            className="btn btn-primary shining"
            style={{ padding: "12px 24px" }}
          >
            <Send size={17} />
            <span>
              {generatingRc
                ? "Generating & Emailing Report Card..."
                : "Generate Report Card & Send HTML Email to Parent"}
            </span>
          </button>
        </form>
      </div>

      {/* Issued Report Cards List */}
      <div className="admin-panel-card" style={{ padding: 24 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: "1.05rem", fontWeight: 800 }}>
          📚 Issued Student Report Cards ({lmsData.reportCards.length})
        </h3>
        {lmsData.reportCards.length === 0 ? (
          <p style={{ fontSize: "0.84rem", color: "#64748b" }}>
            No report cards generated yet. Use the form above to generate and email your first PDF Report Card!
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {lmsData.reportCards.map((rc) => (
              <div
                key={rc.id}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>
                    #{rc.reportRef} — {rc.studentName} ({rc.studentUsername}) • Grade {rc.overallGrade} ({rc.overallScore}%)
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: 2 }}>
                    Parent: {rc.parentName} ({rc.parentEmail || "Portal Access"}) • {rc.termPeriod}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => downloadReportCardPdf(rc)}
                  style={{
                    background: "#1d4ed8",
                    color: "#ffffff",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Download size={15} /> Download PDF Report Card
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

