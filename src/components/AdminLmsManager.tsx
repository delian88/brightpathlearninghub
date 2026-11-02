"use client";

import React, { useState, useRef } from "react";
import {
  Plus,
  Trash2,
  Download,
  Send,
  Bell,
} from "lucide-react";
import {
  type LmsStateData,
  type HomeworkQuestion,
  type HomeworkSubmission,
  type HomeworkAttachment,
  type QuestionType,
  type AssignmentLifecycleStatus,
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

const QUESTION_TYPE_CATALOG: Array<{
  type: QuestionType;
  label: string;
  markingMethod: "automatic" | "ai-teacher-review" | "teacher-ai-suggestions";
  markingLabel: string;
}> = [
  {
    type: "multiple-choice",
    label: "Multiple Choice",
    markingMethod: "automatic",
    markingLabel: "Automatic",
  },
  {
    type: "true-false",
    label: "True / False",
    markingMethod: "automatic",
    markingLabel: "Automatic",
  },
  {
    type: "matching",
    label: "Matching Questions",
    markingMethod: "automatic",
    markingLabel: "Automatic",
  },
  {
    type: "fill-in-blank",
    label: "Fill in the Blanks",
    markingMethod: "automatic",
    markingLabel: "Automatic (Accepted-Answer Rules)",
  },
  {
    type: "spelling",
    label: "Simple Spelling",
    markingMethod: "automatic",
    markingLabel: "Automatic",
  },
  {
    type: "reading-comprehension",
    label: "Reading Comprehension",
    markingMethod: "ai-teacher-review",
    markingLabel: "AI-Assisted + Teacher Review",
  },
  {
    type: "handwriting",
    label: "Handwriting / Draw Answer",
    markingMethod: "ai-teacher-review",
    markingLabel: "AI-Assisted + Teacher Review",
  },
  {
    type: "creative-writing",
    label: "Essays & Creative Writing",
    markingMethod: "teacher-ai-suggestions",
    markingLabel: "Teacher Grading with AI Suggestions",
  },
  {
    type: "recorded-reading",
    label: "Recorded Voice Reading",
    markingMethod: "ai-teacher-review",
    markingLabel: "AI-Assisted Assessment + Teacher Review",
  },
];

export default function AdminLmsManager({
  activeSection,
  lmsData,
  studentAccounts,
  onRefresh,
  showToast,
}: AdminLmsManagerProps) {
  // ==========================================================================
  // 1. MODULE B: TEACHER HOMEWORK & ASSIGNMENT BUILDER STATE
  // ==========================================================================
  const [hwTitle, setHwTitle] = useState("");
  const [hwDescription, setHwDescription] = useState("");
  const [hwCourse, setHwCourse] = useState("English Phonics & Reading");
  const [hwSubject, setHwSubject] = useState("English Phonics & Reading");
  const [hwTopic, setHwTopic] = useState("Phonics Blends, Comprehension & Handwriting");
  const [hwGrade, setHwGrade] = useState("All Grades");
  const [hwTargetType, setHwTargetType] = useState<"all" | "course" | "group" | "student">("all");
  const [hwTargetGroupName, setHwTargetGroupName] = useState("Grade 1-3 Reading Group A");
  const [hwStudentUsername, setHwStudentUsername] = useState("");
  const [hwPassingScore, setHwPassingScore] = useState(60);
  const [hwDueDate, setHwDueDate] = useState(
    new Date(Date.now() + 4 * 86400000).toISOString().split("T")[0]
  );
  const [hwScheduledDate, setHwScheduledDate] = useState("");
  const [hwStatus, setHwStatus] = useState<"Published" | "Draft">("Published");
  const [hwAllowLate, setHwAllowLate] = useState(true);
  const [hwAllowResubmit, setHwAllowResubmit] = useState(true);

  // Audio instructions & Attachments (PDF worksheets, images, learning materials)
  const [hwAudioText, setHwAudioText] = useState(
    "Hello Bright Scholar! Listen carefully to each question, complete the worksheet activities, and submit your answers online."
  );
  const [hwAudioUrl, setHwAudioUrl] = useState<string>("");
  const [isRecordingAudioInstr, setIsRecordingAudioInstr] = useState(false);
  const instrRecorderRef = useRef<MediaRecorder | null>(null);
  const instrChunksRef = useRef<Blob[]>([]);

  const [hwAttachments, setHwAttachments] = useState<HomeworkAttachment[]>([]);

  const [hwQuestions, setHwQuestions] = useState<HomeworkQuestion[]>([
    {
      id: "q-1",
      type: "multiple-choice",
      markingMethod: "automatic",
      prompt: "Which word contains the long 'igh' vowel sound?",
      options: ["Bright", "Brick", "Bring", "Brush"],
      correctAnswer: "Bright",
      points: 20,
      skillTag: "Phonics Blends",
    },
    {
      id: "q-2",
      type: "fill-in-blank",
      markingMethod: "automatic",
      prompt: "Fill in the gap: The sun shines _____ in the morning sky.",
      correctAnswer: "brightly",
      acceptedAnswers: ["brightly", "bright", "warmly"],
      points: 20,
      skillTag: "Vocabulary & Context",
    },
    {
      id: "q-3",
      type: "handwriting",
      markingMethod: "ai-teacher-review",
      prompt: "Draw or write the sentence 'Reading makes me a confident leader' on the handwriting pad or upload a picture of your notebook.",
      points: 30,
      skillTag: "Handwriting Neatness",
    },
    {
      id: "q-4",
      type: "recorded-reading",
      markingMethod: "ai-teacher-review",
      prompt: "Record your voice reading the passage aloud with clear pronunciation.",
      readingPassage: "Every morning, Zainab opens her favourite storybook and reads aloud with confidence and joy.",
      points: 30,
      skillTag: "Oral Reading Fluency",
    },
  ]);
  const [creatingHw, setCreatingHw] = useState(false);

  // ==========================================================================
  // 2. MODULE B: TEACHER GRADING, AI SUGGESTIONS & SCORE OVERRIDE STATE
  // ==========================================================================
  const [submissionFilter, setSubmissionFilter] = useState<string>("all");
  const [gradingSub, setGradingSub] = useState<HomeworkSubmission | null>(null);
  const [questionOverrides, setQuestionOverrides] = useState<
    Record<string, { score: number; comment: string }>
  >({});
  const [gradeLifecycleStatus, setGradeLifecycleStatus] =
    useState<AssignmentLifecycleStatus>("Graded");
  const [gradeFeedback, setGradeFeedback] = useState("");
  const [savingGrade, setSavingGrade] = useState(false);

  // ==========================================================================
  // 3. STUDENT ACADEMIC PROGRESS & ANNOUNCEMENTS STATE
  // ==========================================================================
  const [selectedStudentUser, setSelectedStudentUser] = useState<string>(
    studentAccounts[0]?.username || "BP-ZAINAB-1001"
  );
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMsg, setAnnouncementMsg] = useState("");
  const [sendingNotif, setSendingNotif] = useState(false);

  // ==========================================================================
  // 4. REPORT CARD GENERATOR STATE
  // ==========================================================================
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

  // ==========================================================================
  // HELPER FUNCTIONS FOR MODULE B HOMEWORK BUILDER
  // ==========================================================================
  const handleAddQuestionByType = (qType: QuestionType) => {
    const meta =
      QUESTION_TYPE_CATALOG.find((c) => c.type === qType) || QUESTION_TYPE_CATALOG[0];

    const baseQuestion: HomeworkQuestion = {
      id: `q-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: qType,
      markingMethod: meta.markingMethod,
      prompt: "",
      points: 20,
      skillTag: hwTopic || hwSubject,
    };

    if (qType === "multiple-choice") {
      baseQuestion.options = ["Option A", "Option B", "Option C", "Option D"];
      baseQuestion.correctAnswer = "Option A";
    } else if (qType === "true-false") {
      baseQuestion.options = ["True", "False"];
      baseQuestion.correctAnswer = "True";
    } else if (qType === "matching") {
      baseQuestion.matchingPairs = [
        { left: " Word 1", right: "Meaning A" },
        { left: "Word 2", right: "Meaning B" },
      ];
    } else if (qType === "fill-in-blank") {
      baseQuestion.correctAnswer = "";
      baseQuestion.acceptedAnswers = [];
    } else if (qType === "spelling") {
      baseQuestion.correctAnswer = "Confidence";
    } else if (qType === "reading-comprehension" || qType === "recorded-reading") {
      baseQuestion.readingPassage =
        "Enter the short reading passage here for the student to read and respond to.";
      baseQuestion.acceptedAnswers = [];
    }

    setHwQuestions((prev) => [...prev, baseQuestion]);
  };

  const removeQuestion = (idx: number) => {
    setHwQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUploadAttachment = (
    attType: "pdf" | "image" | "material",
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      showToast("Please select a file smaller than 4MB.", "warning");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        const newAtt: HomeworkAttachment = {
          id: `att-${Date.now()}`,
          title: file.name.replace(/\.[^/.]+$/, ""),
          type: attType,
          url: reader.result,
          fileName: file.name,
        };
        setHwAttachments((prev) => [...prev, newAtt]);
        showToast(`Attached ${attType.toUpperCase()}: ${file.name}`, "success");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRecordAudioInstructions = async () => {
    if (isRecordingAudioInstr) {
      if (instrRecorderRef.current && instrRecorderRef.current.state !== "inactive") {
        instrRecorderRef.current.stop();
      }
      setIsRecordingAudioInstr(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      instrChunksRef.current = [];
      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) instrChunksRef.current.push(ev.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(instrChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            setHwAudioUrl(reader.result);
            showToast("Recorded teacher audio instructions!", "success");
          }
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      instrRecorderRef.current = recorder;
      setIsRecordingAudioInstr(true);
    } catch {
      showToast("Microphone access unavailable. Students can still use the Text-to-Speech voice reader!", "warning");
    }
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
          subject: hwSubject,
          topic: hwTopic,
          grade: hwGrade,
          targetType: hwTargetType,
          targetGroupName: hwTargetType === "group" ? hwTargetGroupName : undefined,
          assignedStudentUsername: hwTargetType === "student" ? hwStudentUsername : undefined,
          assignedStudentName: targetStudent?.studentName,
          audioInstructionText: hwAudioText,
          audioInstructionUrl: hwAudioUrl || undefined,
          attachments: hwAttachments,
          passingScore: hwPassingScore,
          dueDate: hwDueDate,
          scheduledPublishDate: hwScheduledDate || undefined,
          assignmentStatus: hwStatus,
          allowLateSubmission: hwAllowLate,
          allowResubmission: hwAllowResubmit,
          questions: hwQuestions,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "Homework saved!", "success");
        setHwTitle("");
        setHwDescription("");
        setHwAttachments([]);
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

  const handleToggleHomeworkStatus = async (id: string, currentStatus?: string) => {
    const nextStatus = currentStatus === "Draft" ? "Published" : "Draft";
    try {
      const res = await fetch("/api/lms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle-homework-status",
          id,
          assignmentStatus: nextStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        onRefresh();
      }
    } catch {
      showToast("Could not update homework status.", "error");
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

  const openGradingDrawer = (sub: HomeworkSubmission) => {
    setGradingSub(sub);
    setGradeFeedback(sub.teacherFeedback || "");
    setGradeLifecycleStatus(
      sub.lifecycleStatus === "Returned" ? "Returned" : "Graded"
    );

    const hw = lmsData.assignments.find((a) => a.id === sub.homeworkId);
    const initialOverrides: Record<string, { score: number; comment: string }> = {};
    for (const q of hw?.questions || []) {
      const ev = sub.questionEvaluations?.[q.id];
      initialOverrides[q.id] = {
        score: ev ? ev.finalScore : 0,
        comment: ev?.teacherComment || "",
      };
    }
    setQuestionOverrides(initialOverrides);
  };

  const handleSaveManualGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSub) return;
    setSavingGrade(true);
    try {
      const res = await fetch("/api/lms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "grade-submission",
          submissionId: gradingSub.id,
          questionOverrides,
          lifecycleStatus: gradeLifecycleStatus,
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
  // SECTION 1: MODULE B — HOMEWORK & ASSIGNMENT MANAGEMENT
  // ==========================================================================
  if (activeSection === "lms-homework") {
    const totalBuilderMarks = hwQuestions.reduce((acc, q) => acc + Number(q.points || 0), 0);

    const filteredSubmissions = lmsData.submissions.filter((sub) => {
      if (submissionFilter === "all") return true;
      const st = sub.lifecycleStatus || sub.status;
      return st.toLowerCase() === submissionFilter.toLowerCase();
    });

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Lifecycle Status Pipeline Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
            color: "#fff",
            borderRadius: 18,
            padding: "18px 22px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#93c5fd", textTransform: "uppercase" }}>
              Module B • Homework & Assignment Lifecycle Management
            </div>
            <div style={{ fontSize: "1.15rem", fontWeight: 900, marginTop: 2 }}>
              Draft → Published → In Progress → Submitted → Under Review → Graded → Returned
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: "0.75rem", fontWeight: 800 }}>
            <span style={{ background: "rgba(255,255,255,0.12)", padding: "5px 10px", borderRadius: 999 }}>
              ⚡ Auto-Mark: MC, True/False, Matching, Fill-Blanks, Spelling
            </span>
            <span style={{ background: "rgba(16,185,129,0.22)", color: "#a7f3d0", padding: "5px 10px", borderRadius: 999 }}>
              🤖/👩‍🏫 AI + Teacher Override: Comprehension, Handwriting, Essays, Voice Reading
            </span>
          </div>
        </div>

        {/* Create & Assign Homework Form */}
        <div className="admin-panel-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
            <div>
              <h2 style={{ margin: "0 0 4px", fontSize: "1.18rem", fontWeight: 800 }}>
                📝 Create, Schedule & Assign Homework
              </h2>
              <p style={{ margin: 0, fontSize: "0.84rem", color: "#64748b" }}>
                Assign to an individual student, class, or group. Attach PDF worksheets, images, audio instructions, and 9 interactive question types.
              </p>
            </div>
            <div style={{ background: "#eff6ff", color: "#1d4ed8", padding: "6px 14px", borderRadius: 999, fontWeight: 800, fontSize: "0.82rem" }}>
              Total Marks: {totalBuilderMarks} pts • Pass Mark: {hwPassingScore}%
            </div>
          </div>

          <form onSubmit={handleCreateHomework}>
            {/* Row 1: Title, Subject, Topic */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 14 }}>
              <div className="form-group">
                <label className="form-label">Homework Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Week 5 Phonics, Comprehension & Voice Reading"
                  value={hwTitle}
                  onChange={(e) => setHwTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Subject / Course Program</label>
                <select
                  className="form-select"
                  value={hwSubject}
                  onChange={(e) => {
                    setHwSubject(e.target.value);
                    setHwCourse(e.target.value);
                  }}
                >
                  <option value="English Phonics & Reading">English Phonics & Reading</option>
                  <option value="Public Speaking & Communication">Public Speaking & Communication</option>
                  <option value="Creative Writing & Grammar">Creative Writing & Grammar</option>
                  <option value="Coding Classes for Kids">Coding Classes for Kids</option>
                  <option value="Bright Math - Conceptual Mathematics">Bright Math - Conceptual Mathematics</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Specific Topic</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Long Vowel Blends & Story Writing"
                  value={hwTopic}
                  onChange={(e) => setHwTopic(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Row 2: Target Audience, Student/Group selector, Grade */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12, marginBottom: 14 }}>
              <div className="form-group">
                <label className="form-label">Assign To</label>
                <select
                  className="form-select"
                  value={hwTargetType}
                  onChange={(e) => setHwTargetType(e.target.value as any)}
                >
                  <option value="all">Entire School / All Students</option>
                  <option value="course">Entire Class ({hwSubject})</option>
                  <option value="group">Specific Study Group</option>
                  <option value="student">Individual Student Only</option>
                </select>
              </div>

              {hwTargetType === "student" && (
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
              )}

              {hwTargetType === "group" && (
                <div className="form-group">
                  <label className="form-label">Class / Group Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={hwTargetGroupName}
                    onChange={(e) => setHwTargetGroupName(e.target.value)}
                    placeholder="e.g. Grade 2 Advanced Readers"
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Grade Level</label>
                <select
                  className="form-select"
                  value={hwGrade}
                  onChange={(e) => setHwGrade(e.target.value)}
                >
                  <option value="All Grades">All Grades (LKG – Grade 8)</option>
                  <option value="LKG / UKG">LKG / UKG</option>
                  <option value="Grade 1 - 2">Grade 1 – Grade 2</option>
                  <option value="Grade 3 - 5">Grade 3 – Grade 5</option>
                  <option value="Grade 6 - 8">Grade 6 – Grade 8</option>
                </select>
              </div>
            </div>

            {/* Row 3: Deadline, Scheduled Publish Date, Passing Score %, Lifecycle Status */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 14 }}>
              <div className="form-group">
                <label className="form-label">Submission Deadline</label>
                <input
                  type="date"
                  className="form-input"
                  value={hwDueDate}
                  onChange={(e) => setHwDueDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Schedule for Future Date (Optional)</label>
                <input
                  type="date"
                  className="form-input"
                  value={hwScheduledDate}
                  onChange={(e) => setHwScheduledDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Passing Score (%)</label>
                <input
                  type="number"
                  min={10}
                  max={100}
                  className="form-input"
                  value={hwPassingScore}
                  onChange={(e) => setHwPassingScore(Number(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Assignment Status</label>
                <select
                  className="form-select"
                  value={hwStatus}
                  onChange={(e) => setHwStatus(e.target.value as "Published" | "Draft")}
                >
                  <option value="Published">🟢 Published (Visible to Students)</option>
                  <option value="Draft">📝 Save as Draft (Hidden until Published)</option>
                </select>
              </div>
            </div>

            {/* Written & Audio Instructions */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginBottom: 14 }}>
              <div className="form-group">
                <label className="form-label">Written Assignment Instructions</label>
                <textarea
                  rows={2}
                  className="form-input"
                  placeholder="Write step-by-step instructions for students and parents..."
                  value={hwDescription}
                  onChange={(e) => setHwDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">🔊 Audio Instructions (Spoken TTS Script or Recorded Voice)</label>
                <textarea
                  rows={2}
                  className="form-input"
                  placeholder="Text that the student's 'Listen to Instructions' button will read aloud..."
                  value={hwAudioText}
                  onChange={(e) => setHwAudioText(e.target.value)}
                />
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={handleRecordAudioInstructions}
                    style={{
                      background: isRecordingAudioInstr ? "#dc2626" : "#eff6ff",
                      color: isRecordingAudioInstr ? "#fff" : "#1d4ed8",
                      border: "1px solid #bfdbfe",
                      padding: "5px 12px",
                      borderRadius: 8,
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    {isRecordingAudioInstr ? "⏹️ Stop Recording Voice" : "🎙️ Record Teacher Voice Instructions"}
                  </button>
                  {hwAudioUrl && (
                    <audio controls src={hwAudioUrl} style={{ height: 28, maxWidth: 200 }} />
                  )}
                </div>
              </div>
            </div>

            {/* Upload PDF Worksheets, Images & Learning Materials + Late/Resubmit Toggles */}
            <div
              style={{
                background: "#f8fafc",
                border: "1px dashed #cbd5e1",
                borderRadius: 12,
                padding: 14,
                marginBottom: 18,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#334155" }}>
                  📎 Upload Worksheets & Materials:
                </span>
                <label
                  style={{
                    background: "#fef2f2",
                    color: "#dc2626",
                    border: "1px solid #fecaca",
                    padding: "6px 12px",
                    borderRadius: 8,
                    fontSize: "0.76rem",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  📄 + Upload PDF Worksheet
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => handleUploadAttachment("pdf", e)}
                    style={{ display: "none" }}
                  />
                </label>

                <label
                  style={{
                    background: "#f0fdf4",
                    color: "#15803d",
                    border: "1px solid #bbf7d0",
                    padding: "6px 12px",
                    borderRadius: 8,
                    fontSize: "0.76rem",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  🖼️ + Upload Image / Diagram
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUploadAttachment("image", e)}
                    style={{ display: "none" }}
                  />
                </label>

                {hwAttachments.map((att) => (
                  <span
                    key={att.id}
                    style={{
                      background: "#e0e7ff",
                      color: "#3730a3",
                      padding: "4px 10px",
                      borderRadius: 999,
                      fontSize: "0.74rem",
                      fontWeight: 800,
                    }}
                  >
                    {att.type.toUpperCase()}: {att.title}{" "}
                    <button
                      type="button"
                      onClick={() =>
                        setHwAttachments((prev) => prev.filter((a) => a.id !== att.id))
                      }
                      style={{
                        border: "none",
                        background: "transparent",
                        color: "#dc2626",
                        fontWeight: 900,
                        cursor: "pointer",
                        marginLeft: 4,
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div style={{ display: "flex", gap: 14, fontSize: "0.8rem", fontWeight: 700 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={hwAllowLate}
                    onChange={(e) => setHwAllowLate(e.target.checked)}
                  />
                  Allow Late Submissions
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={hwAllowResubmit}
                    onChange={(e) => setHwAllowResubmit(e.target.checked)}
                  />
                  Allow Student Resubmission
                </label>
              </div>
            </div>

            {/* 9 Question Types Builder Bar */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ marginBottom: 10 }}>
                <label className="form-label" style={{ marginBottom: 6, display: "block" }}>
                  ➕ Add Question by Homework Type ({hwQuestions.length} Questions • {totalBuilderMarks} Marks)
                </label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {QUESTION_TYPE_CATALOG.map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => handleAddQuestionByType(item.type)}
                      style={{
                        background:
                          item.markingMethod === "automatic" ? "#eff6ff" : "#f5f3ff",
                        color:
                          item.markingMethod === "automatic" ? "#1d4ed8" : "#6d28d9",
                        border: `1px solid ${
                          item.markingMethod === "automatic" ? "#bfdbfe" : "#ddd6fe"
                        }`,
                        padding: "6px 11px",
                        borderRadius: 8,
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      + {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Questions List */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {hwQuestions.map((q, idx) => {
                  const cat =
                    QUESTION_TYPE_CATALOG.find((c) => c.type === q.type) ||
                    QUESTION_TYPE_CATALOG[0];

                  return (
                    <div
                      key={q.id}
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #cbd5e1",
                        borderRadius: 12,
                        padding: 16,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 8,
                          marginBottom: 10,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span
                            style={{
                              background: "#0f172a",
                              color: "#fff",
                              padding: "3px 9px",
                              borderRadius: 6,
                              fontSize: "0.75rem",
                              fontWeight: 900,
                            }}
                          >
                            Q{idx + 1}
                          </span>
                          <select
                            value={q.type}
                            onChange={(e) => {
                              const nextType = e.target.value as QuestionType;
                              const nextCat =
                                QUESTION_TYPE_CATALOG.find((c) => c.type === nextType) ||
                                QUESTION_TYPE_CATALOG[0];
                              const updated = [...hwQuestions];
                              updated[idx] = {
                                ...updated[idx],
                                type: nextType,
                                markingMethod: nextCat.markingMethod,
                              };
                              if (nextType === "true-false") {
                                updated[idx].options = ["True", "False"];
                                updated[idx].correctAnswer = "True";
                              } else if (nextType === "multiple-choice" && !updated[idx].options) {
                                updated[idx].options = ["Option A", "Option B", "Option C", "Option D"];
                                updated[idx].correctAnswer = "Option A";
                              } else if (nextType === "matching" && !updated[idx].matchingPairs) {
                                updated[idx].matchingPairs = [
                                  { left: "Item 1", right: "Match A" },
                                  { left: "Item 2", right: "Match B" },
                                ];
                              }
                              setHwQuestions(updated);
                            }}
                            style={{
                              padding: "4px 8px",
                              borderRadius: 6,
                              border: "1px solid #94a3b8",
                              fontWeight: 800,
                              fontSize: "0.78rem",
                            }}
                          >
                            {QUESTION_TYPE_CATALOG.map((c) => (
                              <option key={c.type} value={c.type}>
                                {c.label} ({c.markingLabel})
                              </option>
                            ))}
                          </select>
                          <span
                            style={{
                              fontSize: "0.72rem",
                              fontWeight: 800,
                              color: cat.markingMethod === "automatic" ? "#059669" : "#7c3aed",
                            }}
                          >
                            • Marking: {cat.markingLabel}
                          </span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: "0.76rem", fontWeight: 700 }}>Marks:</span>
                          <input
                            type="number"
                            value={q.points}
                            onChange={(e) => {
                              const updated = [...hwQuestions];
                              updated[idx].points = Number(e.target.value);
                              setHwQuestions(updated);
                            }}
                            style={{
                              width: 64,
                              padding: "4px 8px",
                              borderRadius: 6,
                              border: "1px solid #cbd5e1",
                            }}
                          />
                          {hwQuestions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeQuestion(idx)}
                              style={{
                                background: "#fee2e2",
                                color: "#dc2626",
                                border: "none",
                                padding: 6,
                                borderRadius: 6,
                                cursor: "pointer",
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Question Prompt */}
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Enter question prompt or instruction..."
                        value={q.prompt}
                        onChange={(e) => {
                          const updated = [...hwQuestions];
                          updated[idx].prompt = e.target.value;
                          setHwQuestions(updated);
                        }}
                        required
                        style={{ marginBottom: 10, background: "#fff" }}
                      />

                      {/* Reading Passage Input (for Reading Comprehension or Recorded Reading) */}
                      {(q.type === "reading-comprehension" || q.type === "recorded-reading") && (
                        <div style={{ marginBottom: 10 }}>
                          <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#b45309" }}>
                            📖 Reading Passage (Students can read & listen to this passage):
                          </label>
                          <textarea
                            rows={2}
                            className="form-input"
                            value={q.readingPassage || ""}
                            onChange={(e) => {
                              const updated = [...hwQuestions];
                              updated[idx].readingPassage = e.target.value;
                              setHwQuestions(updated);
                            }}
                            placeholder="Paste the reading comprehension or voice reading passage here..."
                            style={{ background: "#fffbeb", marginTop: 4 }}
                          />
                        </div>
                      )}

                      {/* Multiple Choice Options */}
                      {(q.type === "multiple-choice" || q.type === "objective") && (
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
                              Correct Answer (for automatic marking):
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

                      {/* True / False Correct Answer */}
                      {q.type === "true-false" && (
                        <div>
                          <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#059669" }}>
                            Correct Answer:
                          </label>
                          <select
                            className="form-select"
                            value={q.correctAnswer || "True"}
                            onChange={(e) => {
                              const updated = [...hwQuestions];
                              updated[idx].correctAnswer = e.target.value;
                              setHwQuestions(updated);
                            }}
                            style={{ maxWidth: 200, marginTop: 4, background: "#ecfdf5" }}
                          >
                            <option value="True">True</option>
                            <option value="False">False</option>
                          </select>
                        </div>
                      )}

                      {/* Matching Pairs Editor */}
                      {q.type === "matching" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#4338ca" }}>
                            Matching Pairs (Left Item ➔ Correct Right Match):
                          </label>
                          {(q.matchingPairs || []).map((pair, pIdx) => (
                            <div
                              key={pIdx}
                              style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8 }}
                            >
                              <input
                                type="text"
                                className="form-input"
                                placeholder="Left item"
                                value={pair.left}
                                onChange={(e) => {
                                  const updated = [...hwQuestions];
                                  const pairs = [...(updated[idx].matchingPairs || [])];
                                  pairs[pIdx] = { ...pairs[pIdx], left: e.target.value };
                                  updated[idx].matchingPairs = pairs;
                                  setHwQuestions(updated);
                                }}
                                style={{ background: "#fff", padding: "6px 10px" }}
                              />
                              <input
                                type="text"
                                className="form-input"
                                placeholder="Right match"
                                value={pair.right}
                                onChange={(e) => {
                                  const updated = [...hwQuestions];
                                  const pairs = [...(updated[idx].matchingPairs || [])];
                                  pairs[pIdx] = { ...pairs[pIdx], right: e.target.value };
                                  updated[idx].matchingPairs = pairs;
                                  setHwQuestions(updated);
                                }}
                                style={{ background: "#fff", padding: "6px 10px" }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...hwQuestions];
                                  updated[idx].matchingPairs = (
                                    updated[idx].matchingPairs || []
                                  ).filter((_, i) => i !== pIdx);
                                  setHwQuestions(updated);
                                }}
                                style={{
                                  border: "none",
                                  background: "#fee2e2",
                                  color: "#dc2626",
                                  borderRadius: 6,
                                  padding: "0 10px",
                                  cursor: "pointer",
                                }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...hwQuestions];
                              updated[idx].matchingPairs = [
                                ...(updated[idx].matchingPairs || []),
                                { left: "", right: "" },
                              ];
                              setHwQuestions(updated);
                            }}
                            style={{
                              alignSelf: "flex-start",
                              background: "#e0e7ff",
                              color: "#4338ca",
                              border: "none",
                              padding: "4px 10px",
                              borderRadius: 6,
                              fontSize: "0.75rem",
                              fontWeight: 800,
                              cursor: "pointer",
                            }}
                          >
                            + Add Matching Pair
                          </button>
                        </div>
                      )}

                      {/* Fill in the Blanks (with Accepted-Answer Rules) OR Simple Spelling OR Reading Comprehension Keywords */}
                      {(q.type === "fill-in-blank" ||
                        q.type === "spelling" ||
                        q.type === "reading-comprehension") && (
                        <div>
                          <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#059669" }}>
                            {q.type === "spelling"
                              ? "Target Spelling Word (Automatic Exact Match):"
                              : q.type === "fill-in-blank"
                              ? "Accepted Answers (Comma-separated rules, e.g. brightly, bright, warmly):"
                              : "Optional Key Concepts / Keywords for AI-Assisted Comprehension Check (Comma-separated):"}
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            value={
                              q.type === "spelling"
                                ? q.correctAnswer || ""
                                : (q.acceptedAnswers || []).join(", ") || q.correctAnswer || ""
                            }
                            onChange={(e) => {
                              const val = e.target.value;
                              const updated = [...hwQuestions];
                              if (q.type === "spelling") {
                                updated[idx].correctAnswer = val.trim();
                              } else {
                                const list = val
                                  .split(",")
                                  .map((s) => s.trim())
                                  .filter(Boolean);
                                updated[idx].acceptedAnswers = list;
                                updated[idx].correctAnswer = list[0] || val.trim();
                              }
                              setHwQuestions(updated);
                            }}
                            placeholder={
                              q.type === "spelling"
                                ? "e.g. Magnificent"
                                : "e.g. brightly, bright, shining"
                            }
                            style={{ background: "#ecfdf5", borderColor: "#10b981", marginTop: 4 }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={creatingHw}
              className="btn btn-primary shining"
              style={{ padding: "12px 24px" }}
            >
              <Plus size={17} />
              <span>
                {creatingHw
                  ? "Saving Assignment..."
                  : hwStatus === "Draft"
                  ? "Save Homework as Draft"
                  : "Publish & Assign Homework"}
              </span>
            </button>
          </form>
        </div>

        {/* =====================================================================
            STUDENT SUBMISSIONS: AI-ASSISTED GRADING & TEACHER SCORE OVERRIDE
            ===================================================================== */}
        <div className="admin-panel-card" style={{ padding: 24 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div>
              <h2 style={{ margin: "0 0 4px", fontSize: "1.15rem", fontWeight: 800 }}>
                ✅ Student Submissions — Automatic, AI-Assisted & Teacher Override Grading ({lmsData.submissions.length})
              </h2>
              <p style={{ margin: 0, fontSize: "0.84rem", color: "#64748b" }}>
                Teachers can inspect student work (including handwriting drawings, uploaded photos & voice recordings) and override any AI-generated or automatic score.
              </p>
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["all", "In Progress", "Under Review", "Graded", "Returned"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSubmissionFilter(st)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                    background: submissionFilter === st ? "#0f172a" : "#fff",
                    color: submissionFilter === st ? "#fff" : "#334155",
                    fontSize: "0.76rem",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  {st === "all" ? "All Statuses" : st}
                </button>
              ))}
            </div>
          </div>

          {/* Teacher Score Override & Detailed Review Drawer */}
          {gradingSub && (
            <form
              onSubmit={handleSaveManualGrade}
              style={{
                background: "#f5f3ff",
                border: "2px solid #7c3aed",
                borderRadius: 16,
                padding: 20,
                marginBottom: 20,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 900, color: "#0f172a" }}>
                    👩‍🏫 Teacher Review & Score Override: {gradingSub.studentName} ({gradingSub.homeworkTitle})
                  </h3>
                  <div style={{ fontSize: "0.82rem", color: "#475569", marginTop: 2 }}>
                    Current Auto Score: <strong>{gradingSub.objectiveScore} pts</strong> • Current AI/Teacher Score:{" "}
                    <strong>{gradingSub.subjectiveScore} pts</strong> • Total:{" "}
                    <strong>
                      {gradingSub.totalScore}/{gradingSub.maxPoints} ({gradingSub.percentage}%)
                    </strong>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <label style={{ fontSize: "0.78rem", fontWeight: 800 }}>Set Status:</label>
                  <select
                    className="form-select"
                    value={gradeLifecycleStatus}
                    onChange={(e) =>
                      setGradeLifecycleStatus(e.target.value as AssignmentLifecycleStatus)
                    }
                    style={{ width: 210, background: "#fff", fontWeight: 800 }}
                  >
                    <option value="Graded">✅ Graded (Finalized)</option>
                    <option value="Under Review">🔍 Under Review</option>
                    <option value="Returned">↩️ Returned (Request Resubmission)</option>
                  </select>
                </div>
              </div>

              {/* Per-Question Answers, Media & Teacher Score Override Inputs */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                {(
                  lmsData.assignments.find((a) => a.id === gradingSub.homeworkId)?.questions || []
                ).map((q, qIdx) => {
                  const ev = gradingSub.questionEvaluations?.[q.id];
                  const rich = gradingSub.richAnswers?.[q.id];
                  const txt = gradingSub.answers?.[q.id] || rich?.textAnswer || "";
                  const overrideVal = questionOverrides[q.id]?.score ?? (ev ? ev.finalScore : 0);

                  return (
                    <div
                      key={q.id}
                      style={{
                        background: "#ffffff",
                        padding: 14,
                        borderRadius: 12,
                        border: "1px solid #cbd5e1",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: 12,
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 240 }}>
                          <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a" }}>
                            Q{qIdx + 1} ({q.type} • Max {q.points} pts): {q.prompt}
                          </div>
                          {txt && (
                            <div style={{ fontSize: "0.84rem", color: "#334155", marginTop: 4 }}>
                              <strong>Student Answer:</strong> {txt}
                            </div>
                          )}
                          {rich?.matchingAnswers && (
                            <div style={{ fontSize: "0.82rem", color: "#334155", marginTop: 4 }}>
                              <strong>Matched Pairs:</strong>{" "}
                              {Object.entries(rich.matchingAnswers)
                                .map(([l, r]) => `${l} → ${r}`)
                                .join(" | ")}
                            </div>
                          )}

                          {/* Show Canvas Handwriting or Uploaded Photo if present */}
                          {(rich?.drawingDataUrl || rich?.uploadedImageUrl) && (
                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
                              {rich.drawingDataUrl && (
                                <div>
                                  <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#64748b" }}>
                                    Canvas Handwriting:
                                  </div>
                                  <img
                                    src={rich.drawingDataUrl}
                                    alt="Student Canvas Drawing"
                                    style={{
                                      maxHeight: 110,
                                      borderRadius: 8,
                                      border: "1px solid #cbd5e1",
                                    }}
                                  />
                                </div>
                              )}
                              {rich.uploadedImageUrl && (
                                <div>
                                  <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#64748b" }}>
                                    Uploaded Handwritten Work:
                                  </div>
                                  <img
                                    src={rich.uploadedImageUrl}
                                    alt="Uploaded Notebook"
                                    style={{
                                      maxHeight: 110,
                                      borderRadius: 8,
                                      border: "1px solid #cbd5e1",
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          )}

                          {/* Show Voice Recording Player if present */}
                          {rich?.voiceRecordingUrl && (
                            <div style={{ marginTop: 8 }}>
                              <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#ea580c" }}>
                                🎙️ Student Recorded Reading Audio:
                              </div>
                              <audio
                                controls
                                src={rich.voiceRecordingUrl}
                                style={{ height: 32, marginTop: 4 }}
                              />
                            </div>
                          )}

                          {ev?.aiSuggestionFeedback && (
                            <div
                              style={{
                                marginTop: 6,
                                fontSize: "0.78rem",
                                color: "#6d28d9",
                                background: "#f5f3ff",
                                padding: "4px 8px",
                                borderRadius: 6,
                              }}
                            >
                              🤖 <strong>Auto/AI Assessment ({ev.autoOrAiScore}/{q.points} pts):</strong>{" "}
                              {ev.aiSuggestionFeedback}
                            </div>
                          )}
                        </div>

                        {/* Teacher Override Score Input */}
                        <div style={{ minWidth: 210 }}>
                          <label style={{ fontSize: "0.74rem", fontWeight: 800, color: "#0f172a", display: "block" }}>
                            Teacher Final Score (Override / {q.points}):
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={q.points}
                            value={overrideVal}
                            onChange={(e) =>
                              setQuestionOverrides((prev) => ({
                                ...prev,
                                [q.id]: {
                                  score: Number(e.target.value),
                                  comment: prev[q.id]?.comment || "",
                                },
                              }))
                            }
                            style={{
                              width: "100%",
                              padding: "6px 10px",
                              borderRadius: 8,
                              border: "2px solid #7c3aed",
                              fontWeight: 900,
                              marginTop: 4,
                            }}
                          />
                          <input
                            type="text"
                            placeholder="Optional question comment..."
                            value={questionOverrides[q.id]?.comment || ""}
                            onChange={(e) =>
                              setQuestionOverrides((prev) => ({
                                ...prev,
                                [q.id]: {
                                  score: prev[q.id]?.score ?? overrideVal,
                                  comment: e.target.value,
                                },
                              }))
                            }
                            style={{
                              width: "100%",
                              padding: "5px 8px",
                              borderRadius: 6,
                              border: "1px solid #cbd5e1",
                              fontSize: "0.76rem",
                              marginTop: 6,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label">Overall Teacher Feedback to Student & Parent</label>
                <input
                  type="text"
                  className="form-input"
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  required
                  style={{ background: "#fff" }}
                />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" disabled={savingGrade} className="btn btn-primary" style={{ padding: "10px 20px" }}>
                  {savingGrade
                    ? "Saving..."
                    : gradeLifecycleStatus === "Returned"
                    ? "↩️ Return to Student for Revision & Resubmission"
                    : "✅ Save Teacher Overrides & Finalize Grade"}
                </button>
                <button
                  type="button"
                  onClick={() => setGradingSub(null)}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                    background: "#fff",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {filteredSubmissions.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "#64748b", background: "#f8fafc", borderRadius: 12 }}>
              No homework submissions match this status filter yet.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filteredSubmissions.map((sub) => {
                const lStatus = sub.lifecycleStatus || sub.status;
                return (
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
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 800, fontSize: "0.95rem" }}>
                          {sub.studentName} ({sub.studentUsername}) — {sub.homeworkTitle}
                        </span>
                        <span
                          style={{
                            background:
                              lStatus === "Graded"
                                ? "#dcfce7"
                                : lStatus === "Returned"
                                ? "#fee2e2"
                                : "#ede9fe",
                            color:
                              lStatus === "Graded"
                                ? "#15803d"
                                : lStatus === "Returned"
                                ? "#b91c1c"
                                : "#6d28d9",
                            padding: "2px 10px",
                            borderRadius: 999,
                            fontSize: "0.72rem",
                            fontWeight: 800,
                          }}
                        >
                          {lStatus}
                        </span>
                        {sub.isLate && (
                          <span
                            style={{
                              background: "#fef3c7",
                              color: "#b45309",
                              padding: "2px 8px",
                              borderRadius: 999,
                              fontSize: "0.7rem",
                              fontWeight: 800,
                            }}
                          >
                            ⏰ Late Submission
                          </span>
                        )}
                        {(sub.resubmissionCount || 0) > 0 && (
                          <span
                            style={{
                              background: "#e0e7ff",
                              color: "#4338ca",
                              padding: "2px 8px",
                              borderRadius: 999,
                              fontSize: "0.7rem",
                              fontWeight: 800,
                            }}
                          >
                            🔄 Resubmission #{sub.resubmissionCount}
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: 4 }}>
                        ⚡ Automatic: {sub.objectiveScore} pts • 🤖/👩‍🏫 AI & Teacher: {sub.subjectiveScore} pts •{" "}
                        <strong style={{ color: "#059669" }}>
                          Total: {sub.totalScore}/{sub.maxPoints} ({sub.percentage}% •{" "}
                          {sub.passed !== false ? "Passed" : "Below Pass Mark"})
                        </strong>
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#334155", marginTop: 4 }}>
                        Feedback: &ldquo;{sub.teacherFeedback}&rdquo;
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => openGradingDrawer(sub)}
                      style={{
                        background: "#0a1931",
                        color: "#ffffff",
                        border: "none",
                        padding: "9px 15px",
                        borderRadius: 8,
                        fontWeight: 800,
                        fontSize: "0.8rem",
                        cursor: "pointer",
                      }}
                    >
                      ✏️ Inspect Work & Override Scores
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Active & Draft Homework List */}
        <div className="admin-panel-card" style={{ padding: 24 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: "1.05rem", fontWeight: 800 }}>
            📚 All Created Homework Assignments — Published, Scheduled & Drafts ({lmsData.assignments.length})
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {lmsData.assignments.map((hw) => {
              const isDraft = hw.assignmentStatus === "Draft";
              return (
                <div
                  key={hw.id}
                  style={{
                    padding: "12px 16px",
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 10,
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 800, fontSize: "0.92rem" }}>{hw.title}</span>
                      <span
                        style={{
                          background: isDraft ? "#fef3c7" : "#dcfce7",
                          color: isDraft ? "#b45309" : "#15803d",
                          padding: "2px 9px",
                          borderRadius: 999,
                          fontSize: "0.7rem",
                          fontWeight: 800,
                        }}
                      >
                        {isDraft ? "📝 Draft" : "🟢 Published"}
                      </span>
                      {hw.scheduledPublishDate && (
                        <span
                          style={{
                            background: "#e0f2fe",
                            color: "#0369a1",
                            padding: "2px 9px",
                            borderRadius: 999,
                            fontSize: "0.7rem",
                            fontWeight: 800,
                          }}
                        >
                          🗓️ Scheduled: {hw.scheduledPublishDate}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 3 }}>
                      Subject: {hw.subject || hw.courseName} {hw.topic ? `(${hw.topic})` : ""} • Target:{" "}
                      {hw.targetType.toUpperCase()}{" "}
                      {hw.assignedStudentUsername ? `(${hw.assignedStudentUsername})` : ""} •{" "}
                      {hw.questions.length} questions ({hw.totalPoints} pts • Pass: {hw.passingScore || 60}%) • Due:{" "}
                      {hw.dueDate}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => handleToggleHomeworkStatus(hw.id, hw.assignmentStatus)}
                      style={{
                        background: isDraft ? "#ecfdf5" : "#f8fafc",
                        color: isDraft ? "#059669" : "#475569",
                        border: "1px solid #cbd5e1",
                        padding: "6px 12px",
                        borderRadius: 8,
                        fontSize: "0.76rem",
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      {isDraft ? "🚀 Publish Now" : "Switch to Draft"}
                    </button>
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
                </div>
              );
            })}
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
