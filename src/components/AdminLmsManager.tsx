"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Plus,
  Trash2,
  Download,
  Send,
  Bell,
  UserCheck,
  Users,
  Save,
} from "lucide-react";
import {
  type LmsStateData,
  type HomeworkQuestion,
  type HomeworkSubmission,
  type HomeworkAttachment,
  type QuestionType,
  type AssignmentLifecycleStatus,
  type SubjectProgressTrack,
  type PeriodProgressSummary,
  type TeacherObservationNote,
  getOrCreateStudentProgress,
  createDefaultSubjectTracks,
  createDefaultPeriodSummaries,
  analyzeStudentProgressAndAlerts,
} from "@/lib/lmsData";
import { downloadReportCardPdf } from "@/lib/pdfReportGenerator";
import type { ToastType } from "./ToastNotification";

interface AdminLmsManagerProps {
  activeSection: "lms-homework" | "lms-progress" | "lms-reports";
  lmsData: LmsStateData;
  studentAccounts: any[];
  bookings?: any[];
  preselectedStudent?: {
    username: string;
    studentName: string;
    courseName?: string;
    grade?: string;
  } | null;
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

const createEmptyQuestion = (subject = "General"): HomeworkQuestion => ({
  id: `q-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  type: "multiple-choice",
  markingMethod: "automatic",
  prompt: "",
  options: ["", "", "", ""],
  correctAnswer: "",
  points: 20,
  skillTag: subject,
});

export default function AdminLmsManager({
  activeSection,
  lmsData,
  studentAccounts,
  bookings = [],
  preselectedStudent = null,
  onRefresh,
  showToast,
}: AdminLmsManagerProps) {
  // Build a unified, deduplicated directory of real students from Student Accounts + Bookings
  const allRealStudents = useMemo(() => {
    const map = new Map<
      string,
      {
        username: string;
        studentName: string;
        parentName: string;
        email: string;
        grade: string;
        courseName: string;
        source: "account" | "booking";
      }
    >();

    for (const acc of studentAccounts) {
      if (!acc?.username) continue;
      const key = String(acc.username).trim().toUpperCase();
      map.set(key, {
        username: key,
        studentName: acc.studentName || acc.username,
        parentName: acc.parentName || "",
        email: acc.email || "",
        grade: acc.grade || "",
        courseName: acc.courseName || "English Phonics & Reading",
        source: "account",
      });
    }

    for (const b of bookings) {
      if (!b?.studentName) continue;
      // Check if this booking student already has a student account by name/email
      const alreadyExists = Array.from(map.values()).some(
        (existing) =>
          existing.studentName.toLowerCase() === String(b.studentName).trim().toLowerCase()
      );
      if (!alreadyExists) {
        const cleanFirst = String(b.studentName)
          .trim()
          .split(/\s+/)[0]
          .replace(/[^a-zA-Z0-9]/g, "")
          .toUpperCase();
        const syntheticUsername = `BP-${cleanFirst}-${String(b.id || 100).padStart(4, "0")}`;
        map.set(syntheticUsername, {
          username: syntheticUsername,
          studentName: b.studentName,
          parentName: b.parentName || "",
          email: b.email || "",
          grade: b.grade || "",
          courseName: b.courseName || "English Phonics & Reading",
          source: "booking",
        });
      }
    }

    return Array.from(map.values());
  }, [studentAccounts, bookings]);

  // ==========================================================================
  // 1. MODULE B: TEACHER HOMEWORK & ASSIGNMENT BUILDER STATE (No hardcoded demo data)
  // ==========================================================================
  const [hwTitle, setHwTitle] = useState("");
  const [hwDescription, setHwDescription] = useState("");
  const [hwCourse, setHwCourse] = useState("English Phonics & Reading");
  const [hwSubject, setHwSubject] = useState("English Phonics & Reading");
  const [hwTopic, setHwTopic] = useState("");
  const [hwGrade, setHwGrade] = useState("All Grades");
  const [hwTargetType, setHwTargetType] = useState<"student" | "course" | "group" | "all">(
    preselectedStudent ? "student" : "student"
  );
  const [hwTargetGroupName, setHwTargetGroupName] = useState("");
  const [hwStudentUsername, setHwStudentUsername] = useState(
    preselectedStudent?.username || ""
  );
  const [hwCustomStudentName, setHwCustomStudentName] = useState(
    preselectedStudent?.studentName || ""
  );
  const [hwPassingScore, setHwPassingScore] = useState(60);
  const [hwDueDate, setHwDueDate] = useState(
    new Date(Date.now() + 4 * 86400000).toISOString().split("T")[0]
  );
  const [hwScheduledDate, setHwScheduledDate] = useState("");
  const [hwStatus, setHwStatus] = useState<"Published" | "Draft">("Published");
  const [hwAllowLate, setHwAllowLate] = useState(true);
  const [hwAllowResubmit, setHwAllowResubmit] = useState(true);

  const [hwAudioText, setHwAudioText] = useState("");
  const [hwAudioUrl, setHwAudioUrl] = useState<string>("");
  const [isRecordingAudioInstr, setIsRecordingAudioInstr] = useState(false);
  const instrRecorderRef = useRef<MediaRecorder | null>(null);
  const instrChunksRef = useRef<Blob[]>([]);

  const [hwAttachments, setHwAttachments] = useState<HomeworkAttachment[]>([]);
  const [hwQuestions, setHwQuestions] = useState<HomeworkQuestion[]>([
    createEmptyQuestion("English Phonics & Reading"),
  ]);
  const [creatingHw, setCreatingHw] = useState(false);

  // Sync preselected student when navigating from Student Credentials / Bookings
  useEffect(() => {
    if (preselectedStudent?.username) {
      setHwTargetType("student");
      setHwStudentUsername(preselectedStudent.username);
      setHwCustomStudentName(preselectedStudent.studentName || "");
      if (preselectedStudent.courseName) {
        setHwSubject(preselectedStudent.courseName);
        setHwCourse(preselectedStudent.courseName);
      }
      if (preselectedStudent.grade) {
        setHwGrade(preselectedStudent.grade);
      }
    } else if (!hwStudentUsername && allRealStudents.length > 0) {
      setHwStudentUsername(allRealStudents[0].username);
      setHwCustomStudentName(allRealStudents[0].studentName);
    }
  }, [preselectedStudent, allRealStudents, hwStudentUsername]);

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
  // 3. STUDENT ACADEMIC PROGRESS EDITOR & ANNOUNCEMENTS STATE (Module D)
  // ==========================================================================
  const [selectedStudentUser, setSelectedStudentUser] = useState<string>("");
  const [editLessonsCompleted, setEditLessonsCompleted] = useState<number>(0);
  const [editReadingProgress, setEditReadingProgress] = useState<number>(0);
  const [editAttendanceRate, setEditAttendanceRate] = useState<number>(100);
  const [editLearningHours, setEditLearningHours] = useState<number>(0);
  const [editStrengthsText, setEditStrengthsText] = useState<string>("");
  const [editImprovementsText, setEditImprovementsText] = useState<string>("");
  const [editRecommendationsText, setEditRecommendationsText] = useState<string>("");
  const [editSubjectTracks, setEditSubjectTracks] = useState<SubjectProgressTrack[]>(
    createDefaultSubjectTracks()
  );
  const [editPeriodSummaries, setEditPeriodSummaries] = useState<
    Record<"daily" | "weekly" | "monthly" | "termly", PeriodProgressSummary>
  >(createDefaultPeriodSummaries());
  const [editFlaggedForAttention, setEditFlaggedForAttention] = useState<boolean>(false);
  const [editFlagReason, setEditFlagReason] = useState<string>("");
  const [editTeacherObservations, setEditTeacherObservations] = useState<
    TeacherObservationNote[]
  >([]);
  const [newObsSubject, setNewObsSubject] = useState<string>("English / Phonics");
  const [newObsNote, setNewObsNote] = useState<string>("");
  const [newObsAction, setNewObsAction] = useState<string>("");
  const [savingProgressProfile, setSavingProgressProfile] = useState(false);

  const [announcementTarget, setAnnouncementTarget] = useState<string>("ALL");
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMsg, setAnnouncementMsg] = useState("");
  const [sendingNotif, setSendingNotif] = useState(false);

  // ==========================================================================
  // 4. REPORT CARD GENERATOR STATE (Populated dynamically per student)
  // ==========================================================================
  const [rcStudentUser, setRcStudentUser] = useState<string>("");
  const [rcTerm, setRcTerm] = useState("");
  const [rcAttendance, setRcAttendance] = useState(100);
  const [rcReadingProgress, setRcReadingProgress] = useState(0);
  const [rcHomeworkRate, setRcHomeworkRate] = useState(0);
  const [rcStrengths, setRcStrengths] = useState("");
  const [rcImprovements, setRcImprovements] = useState("");
  const [rcComment, setRcComment] = useState("");
  const [rcSubjects, setRcSubjects] = useState<
    Array<{ subject: string; score: number; grade: string; remark: string }>
  >([{ subject: "", score: 0, grade: "", remark: "" }]);
  const [generatingRc, setGeneratingRc] = useState(false);

  // Initialize selected student for Progress & Report Cards when real students load
  useEffect(() => {
    if (allRealStudents.length > 0) {
      if (!selectedStudentUser) {
        setSelectedStudentUser(allRealStudents[0].username);
      }
      if (!rcStudentUser) {
        setRcStudentUser(allRealStudents[0].username);
      }
    }
  }, [allRealStudents, selectedStudentUser, rcStudentUser]);

  // Sync progress editor inputs when selectedStudentUser changes
  useEffect(() => {
    if (!selectedStudentUser) return;
    const stu = allRealStudents.find(
      (s) => s.username.toUpperCase() === selectedStudentUser.toUpperCase()
    );
    const prog = getOrCreateStudentProgress(
      lmsData,
      selectedStudentUser,
      stu?.studentName || selectedStudentUser
    );
    const analyzed = analyzeStudentProgressAndAlerts(
      prog,
      lmsData.submissions,
      lmsData.aiLogs
    );

    setEditLessonsCompleted(prog.lessonsCompleted || 0);
    setEditReadingProgress(prog.readingProgress || 0);
    setEditAttendanceRate(prog.attendanceRate ?? 100);
    setEditLearningHours(prog.learningHours || 0);
    setEditStrengthsText((prog.customStrengths || []).join("\n"));
    setEditImprovementsText((prog.customImprovements || []).join("\n"));
    setEditRecommendationsText(
      (prog.improvementRecommendations || analyzed.recommendations || []).join("\n")
    );
    setEditSubjectTracks(analyzed.subjectTracks);
    setEditPeriodSummaries(analyzed.periodSummaries);
    setEditFlaggedForAttention(Boolean(prog.flaggedForAttention));
    setEditFlagReason(prog.flagReason || "");
    setEditTeacherObservations(prog.teacherObservations || []);
  }, [selectedStudentUser, lmsData, allRealStudents]);

  // Sync Report Card inputs from the student's actual progress & submissions when rcStudentUser changes
  useEffect(() => {
    if (!rcStudentUser) return;
    const stu = allRealStudents.find(
      (s) => s.username.toUpperCase() === rcStudentUser.toUpperCase()
    );
    const prog = getOrCreateStudentProgress(
      lmsData,
      rcStudentUser,
      stu?.studentName || rcStudentUser
    );
    const studentSubs = lmsData.submissions.filter(
      (s) => s.studentUsername.toUpperCase() === rcStudentUser.toUpperCase()
    );

    const assignedToStudent = lmsData.assignments.filter(
      (a) =>
        a.targetType === "all" ||
        (a.targetType === "student" &&
          a.assignedStudentUsername?.toUpperCase() === rcStudentUser.toUpperCase()) ||
        (a.targetType === "course" && a.courseName === stu?.courseName)
    );

    const computedHwRate =
      assignedToStudent.length > 0
        ? Math.min(100, Math.round((studentSubs.length / assignedToStudent.length) * 100))
        : studentSubs.length > 0
        ? 100
        : 0;

    setRcAttendance(prog.attendanceRate ?? 100);
    setRcReadingProgress(prog.readingProgress || 0);
    setRcHomeworkRate(computedHwRate);
    setRcStrengths((prog.customStrengths || []).join("\n"));
    setRcImprovements((prog.customImprovements || []).join("\n"));

    if (studentSubs.length > 0) {
      const bySubject = studentSubs.map((s) => {
        const sc = s.percentage || 0;
        return {
          subject: s.subject || s.courseName || s.homeworkTitle,
          score: sc,
          grade: sc >= 90 ? "A+" : sc >= 80 ? "A" : sc >= 70 ? "B+" : sc >= 60 ? "B" : "C",
          remark: s.teacherFeedback || "",
        };
      });
      setRcSubjects(bySubject);
    } else if (stu?.courseName) {
      setRcSubjects([
        {
          subject: stu.courseName,
          score: 0,
          grade: "",
          remark: "",
        },
      ]);
    }
  }, [rcStudentUser, lmsData, allRealStudents]);

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
      baseQuestion.options = ["", "", "", ""];
      baseQuestion.correctAnswer = "";
    } else if (qType === "true-false") {
      baseQuestion.options = ["True", "False"];
      baseQuestion.correctAnswer = "True";
    } else if (qType === "matching") {
      baseQuestion.matchingPairs = [
        { left: "", right: "" },
        { left: "", right: "" },
      ];
    } else if (qType === "fill-in-blank") {
      baseQuestion.correctAnswer = "";
      baseQuestion.acceptedAnswers = [];
    } else if (qType === "spelling") {
      baseQuestion.correctAnswer = "";
    } else if (qType === "reading-comprehension" || qType === "recorded-reading") {
      baseQuestion.readingPassage = "";
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
      showToast(
        "Microphone access unavailable. Students can still use the Text-to-Speech voice reader!",
        "warning"
      );
    }
  };

  const handleCreateHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hwTargetType === "student" && !hwStudentUsername.trim() && !hwCustomStudentName.trim()) {
      showToast("Please select or enter the specific student to assign this homework to.", "warning");
      return;
    }

    setCreatingHw(true);
    try {
      const targetStudent = allRealStudents.find(
        (s) => s.username.toUpperCase() === hwStudentUsername.trim().toUpperCase()
      );
      const resolvedUsername =
        hwTargetType === "student"
          ? (hwStudentUsername.trim() || `BP-${hwCustomStudentName.trim().split(/\s+/)[0]?.toUpperCase() || "STUDENT"}`).toUpperCase()
          : undefined;
      const resolvedStudentName =
        hwTargetType === "student"
          ? targetStudent?.studentName || hwCustomStudentName.trim() || resolvedUsername
          : undefined;

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
          assignedStudentUsername: resolvedUsername,
          assignedStudentName: resolvedStudentName,
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
        showToast(
          hwTargetType === "student"
            ? `Homework assigned specifically to ${resolvedStudentName} (${resolvedUsername})!`
            : data.message || "Homework saved!",
          "success"
        );
        setHwTitle("");
        setHwDescription("");
        setHwTopic("");
        setHwAudioText("");
        setHwAudioUrl("");
        setHwAttachments([]);
        setHwQuestions([createEmptyQuestion(hwSubject)]);
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

  const handleSaveStudentProgressProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentUser) {
      showToast("Please select a student first.", "warning");
      return;
    }
    setSavingProgressProfile(true);
    try {
      const stu = allRealStudents.find(
        (s) => s.username.toUpperCase() === selectedStudentUser.toUpperCase()
      );
      const res = await fetch("/api/lms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-student-profile",
          studentUsername: selectedStudentUser,
          studentName: stu?.studentName || selectedStudentUser,
          lessonsCompleted: editLessonsCompleted,
          readingProgress: editReadingProgress,
          attendanceRate: editAttendanceRate,
          learningHours: editLearningHours,
          customStrengths: editStrengthsText
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
          customImprovements: editImprovementsText
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
          improvementRecommendations: editRecommendationsText
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
          subjectTracks: editSubjectTracks,
          periodSummaries: editPeriodSummaries,
          flaggedForAttention: editFlaggedForAttention,
          flagReason: editFlagReason,
          teacherObservations: editTeacherObservations,
          newObservation: newObsNote.trim()
            ? {
                subject: newObsSubject,
                observation: newObsNote.trim(),
                recommendation: newObsAction.trim(),
                teacherName: "Bright Path Teacher",
              }
            : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          `Academic progress, subject mastery & observations saved for ${
            stu?.studentName || selectedStudentUser
          }!`,
          "success"
        );
        setNewObsNote("");
        setNewObsAction("");
        onRefresh();
      } else {
        showToast(data.message || "Could not update progress.", "error");
      }
    } catch {
      showToast("Error updating student progress.", "error");
    } finally {
      setSavingProgressProfile(false);
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
          targetStudentUsername: announcementTarget || "ALL",
          type: "announcement",
          title: announcementTitle,
          message: announcementMsg,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Notification sent to student portal!", "success");
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
    if (!rcStudentUser) {
      showToast("Please select a student account to issue a report card.", "warning");
      return;
    }
    const validSubjects = rcSubjects.filter((s) => s.subject.trim() !== "");
    if (validSubjects.length === 0) {
      showToast("Please add at least one subject evaluation.", "warning");
      return;
    }

    setGeneratingRc(true);
    try {
      const matchedAcc = allRealStudents.find(
        (s) => s.username.toUpperCase() === rcStudentUser.toUpperCase()
      );

      const res = await fetch("/api/lms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate-report-card",
          studentUsername: matchedAcc?.username || rcStudentUser,
          studentName: matchedAcc?.studentName || rcStudentUser,
          parentName: matchedAcc?.parentName || "Parent / Guardian",
          parentEmail: matchedAcc?.email || "",
          grade: matchedAcc?.grade || "All Grades",
          courseName: matchedAcc?.courseName || "English Phonics & Reading",
          termPeriod: rcTerm || `Academic Term • ${new Date().getFullYear()}`,
          attendanceRate: rcAttendance,
          readingProgress: rcReadingProgress,
          homeworkCompletionRate: rcHomeworkRate,
          subjectScores: validSubjects,
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
  // SECTION 1: MODULE B — HOMEWORK & ASSIGNMENT MANAGEMENT (/admin/homework)
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
              Dedicated Page • /admin/homework
            </div>
            <div style={{ fontSize: "1.15rem", fontWeight: 900, marginTop: 2 }}>
              Draft → Published → In Progress → Submitted → Under Review → Graded → Returned
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: "0.75rem", fontWeight: 800 }}>
            <span style={{ background: "rgba(255,255,255,0.12)", padding: "5px 10px", borderRadius: 999 }}>
              Active Assignments: {lmsData.assignments.length}
            </span>
            <span style={{ background: "rgba(16,185,129,0.22)", color: "#a7f3d0", padding: "5px 10px", borderRadius: 999 }}>
              Student Submissions: {lmsData.submissions.length}
            </span>
          </div>
        </div>

        {/* Create & Assign Homework Form */}
        <div className="admin-panel-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
            <div>
              <h2 style={{ margin: "0 0 4px", fontSize: "1.18rem", fontWeight: 800 }}>
                📝 Create & Assign Homework (Specific Student or Class)
              </h2>
              <p style={{ margin: 0, fontSize: "0.84rem", color: "#64748b" }}>
                Choose whether to assign to a specific student or a class, add instructions/worksheets, and build your questions.
              </p>
            </div>
            <div style={{ background: "#eff6ff", color: "#1d4ed8", padding: "6px 14px", borderRadius: 999, fontWeight: 800, fontSize: "0.82rem" }}>
              Total Marks: {totalBuilderMarks} pts • Pass Mark: {hwPassingScore}%
            </div>
          </div>

          <form onSubmit={handleCreateHomework}>
            {/* STEP 1: Prominent Target Selector (Specific Student vs Class/Group/All) */}
            <div
              style={{
                background: "#f8fafc",
                border: "2px solid #e2e8f0",
                borderRadius: 14,
                padding: 16,
                marginBottom: 18,
              }}
            >
              <label className="form-label" style={{ marginBottom: 10, display: "block", fontSize: "0.85rem" }}>
                1. Who do you want to assign this homework to?
              </label>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(195px, 1fr))",
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                {[
                  {
                    id: "student",
                    title: "👤 Specific Student",
                    desc: "Assign to 1 individual child",
                  },
                  {
                    id: "course",
                    title: "🏫 Entire Course Class",
                    desc: `All students in ${hwSubject}`,
                  },
                  {
                    id: "group",
                    title: "👥 Specific Study Group",
                    desc: "Assign to a custom group",
                  },
                  {
                    id: "all",
                    title: "🌍 All Enrolled Students",
                    desc: "Assign across entire hub",
                  },
                ].map((opt) => {
                  const active = hwTargetType === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setHwTargetType(opt.id as any)}
                      style={{
                        textAlign: "left",
                        padding: "12px 14px",
                        borderRadius: 12,
                        border: active ? "2px solid #4f46e5" : "1px solid #cbd5e1",
                        background: active ? "#eef2ff" : "#ffffff",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontWeight: 900, fontSize: "0.88rem", color: active ? "#312e81" : "#0f172a" }}>
                        {opt.title}
                      </div>
                      <div style={{ fontSize: "0.74rem", color: "#64748b", marginTop: 2 }}>
                        {opt.desc}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Specific Student Picker */}
              {hwTargetType === "student" && (
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #c7d2fe",
                    borderRadius: 12,
                    padding: 14,
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: 12,
                  }}
                >
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">
                      Select Registered Student ({allRealStudents.length} available)
                    </label>
                    <select
                      className="form-select"
                      value={hwStudentUsername}
                      onChange={(e) => {
                        const val = e.target.value;
                        setHwStudentUsername(val);
                        const found = allRealStudents.find((s) => s.username === val);
                        if (found) {
                          setHwCustomStudentName(found.studentName);
                          if (found.courseName) {
                            setHwSubject(found.courseName);
                            setHwCourse(found.courseName);
                          }
                          if (found.grade) setHwGrade(found.grade);
                        }
                      }}
                    >
                      <option value="">-- Choose a Student from Portal / Bookings --</option>
                      {allRealStudents.map((s) => (
                        <option key={s.username} value={s.username}>
                          {s.studentName} ({s.username} • {s.grade || "Student"} • {s.courseName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Student Username / Portal ID</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. BP-CHIDUBEM-4821"
                      value={hwStudentUsername}
                      onChange={(e) => setHwStudentUsername(e.target.value.toUpperCase())}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Student Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter student's name"
                      value={hwCustomStudentName}
                      onChange={(e) => setHwCustomStudentName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              {hwTargetType === "group" && (
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Enter Study Group Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={hwTargetGroupName}
                    onChange={(e) => setHwTargetGroupName(e.target.value)}
                    placeholder="e.g. Grade 2 Phonics Group A"
                    required
                  />
                </div>
              )}
            </div>

            {/* Row 1: Title, Subject, Topic, Grade */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12, marginBottom: 14 }}>
              <div className="form-group">
                <label className="form-label">Homework Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter homework title..."
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
                <label className="form-label">Topic</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter lesson topic..."
                  value={hwTopic}
                  onChange={(e) => setHwTopic(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Grade Level</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Grade 2 or All Grades"
                  value={hwGrade}
                  onChange={(e) => setHwGrade(e.target.value)}
                />
              </div>
            </div>

            {/* Row 2: Deadline, Scheduled Publish Date, Passing Score %, Lifecycle Status */}
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
                  <option value="Published">🟢 Published (Visible to Student)</option>
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
                  placeholder="Write step-by-step instructions for the student..."
                  value={hwDescription}
                  onChange={(e) => setHwDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">🔊 Audio Instructions (Spoken TTS Script or Recorded Voice)</label>
                <textarea
                  rows={2}
                  className="form-input"
                  placeholder="Optional text to read aloud when the student clicks 'Listen to Instructions'..."
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
                  🖼️ + Upload Image / Material
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
                    {att.type.toUpperCase()}: {att.title || att.name}{" "}
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
                                updated[idx].options = ["", "", "", ""];
                                updated[idx].correctAnswer = "";
                              } else if (nextType === "matching" && !updated[idx].matchingPairs) {
                                updated[idx].matchingPairs = [
                                  { left: "", right: "" },
                                  { left: "", right: "" },
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
                              placeholder="Enter the exact option that is correct"
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
                              ? "Accepted Answers (Comma-separated rules):"
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
                                ? "Enter the word to spell"
                                : "Enter accepted answer(s), separated by commas"
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
                  : hwTargetType === "student"
                  ? `Publish & Assign to ${hwCustomStudentName || hwStudentUsername || "Selected Student"}`
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
                Inspect student work (including handwriting drawings, uploaded photos & voice recordings) and override any AI-generated or automatic score.
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
              No homework submissions yet.
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
            📚 Created Homework Assignments ({lmsData.assignments.length})
          </h3>
          {lmsData.assignments.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: "#64748b", background: "#f8fafc", borderRadius: 12 }}>
              No homework assignments created yet. Use the form above to assign homework to a specific student or class.
            </div>
          ) : (
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
                        <span
                          style={{
                            background: hw.targetType === "student" ? "#eef2ff" : "#f1f5f9",
                            color: hw.targetType === "student" ? "#4338ca" : "#334155",
                            padding: "2px 9px",
                            borderRadius: 999,
                            fontSize: "0.72rem",
                            fontWeight: 800,
                          }}
                        >
                          {hw.targetType === "student"
                            ? `👤 Assigned to: ${hw.assignedStudentName || hw.assignedStudentUsername}`
                            : hw.targetType === "group"
                            ? `👥 Group: ${hw.targetGroupName}`
                            : hw.targetType === "course"
                            ? `🏫 Class: ${hw.courseName}`
                            : "🌍 All Students"}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 3 }}>
                        Subject: {hw.subject || hw.courseName} {hw.topic ? `(${hw.topic})` : ""} •{" "}
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
          )}
        </div>
      </div>
    );
  }

  // ==========================================================================
  // SECTION 2: MODULE D — DEDICATED STUDENT PROGRESS TRACKING (/admin/progress)
  // ==========================================================================
  if (activeSection === "lms-progress") {
    // Evaluate all students to identify anyone struggling or flagged for teacher attention
    const strugglingStudentsAlertList = allRealStudents
      .map((stu) => {
        const prog = getOrCreateStudentProgress(
          lmsData,
          stu.username,
          stu.studentName
        );
        const analysis = analyzeStudentProgressAndAlerts(
          prog,
          lmsData.submissions,
          lmsData.aiLogs
        );
        return {
          student: stu,
          progress: prog,
          analysis,
        };
      })
      .filter((item) => item.analysis.isStruggling);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* =================================================================
            1. EARLY-WARNING RADAR: STUDENTS STRUGGLING / FLAGGED FOR ATTENTION
            ================================================================= */}
        <div
          className="admin-panel-card"
          style={{
            padding: 22,
            border:
              strugglingStudentsAlertList.length > 0
                ? "2px solid #fca5a5"
                : "1px solid #a7f3d0",
            background:
              strugglingStudentsAlertList.length > 0
                ? "linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%)"
                : "linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: strugglingStudentsAlertList.length > 0 ? 14 : 0,
            }}
          >
            <div>
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  color:
                    strugglingStudentsAlertList.length > 0 ? "#dc2626" : "#059669",
                  textTransform: "uppercase",
                }}
              >
                {strugglingStudentsAlertList.length > 0
                  ? `🚨 Early-Warning Intervention Radar • ${strugglingStudentsAlertList.length} Student(s) Flagged`
                  : "✅ Early-Warning Intervention Radar • All Students On Track"}
              </span>
              <h3
                style={{
                  margin: "2px 0 0",
                  fontSize: "1.1rem",
                  fontWeight: 900,
                  color: "#0f172a",
                }}
              >
                {strugglingStudentsAlertList.length > 0
                  ? "Students Identified as Struggling & Flagged for Teacher Attention"
                  : "No Students Currently Flagged for Urgent Academic Intervention"}
              </h3>
              <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#475569" }}>
                Automatically flags students when any sub-skill mastery drops below 60%, homework or AI scores are low, attendance drops below 75%, or when manually flagged by a teacher.
              </p>
            </div>
          </div>

          {strugglingStudentsAlertList.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
                gap: 12,
              }}
            >
              {strugglingStudentsAlertList.map(({ student, analysis }) => (
                <div
                  key={student.username}
                  style={{
                    background: "#ffffff",
                    borderRadius: 14,
                    padding: 16,
                    border: "1px solid #fecaca",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span style={{ fontWeight: 900, fontSize: "0.95rem", color: "#991b1b" }}>
                        🚩 {student.studentName}
                      </span>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 800,
                          background: "#fee2e2",
                          color: "#dc2626",
                          padding: "2px 8px",
                          borderRadius: 999,
                        }}
                      >
                        {student.username}
                      </span>
                    </div>
                    <ul
                      style={{
                        margin: "8px 0 0",
                        paddingLeft: 18,
                        fontSize: "0.79rem",
                        color: "#7f1d1d",
                        lineHeight: 1.5,
                      }}
                    >
                      {analysis.strugglingReasons.map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedStudentUser(student.username)}
                    style={{
                      alignSelf: "flex-start",
                      background: "#dc2626",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: 8,
                      padding: "7px 13px",
                      fontSize: "0.76rem",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    Inspect & Intervene ➔
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* =================================================================
            2. DEDICATED STUDENT PROGRESS & SUBJECT MASTERY EDITOR
            ================================================================= */}
        <div className="admin-panel-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
            <div>
              <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#4f46e5", textTransform: "uppercase" }}>
                Dedicated Page • /admin/progress
              </span>
              <h2 style={{ margin: "2px 0 0", fontSize: "1.18rem", fontWeight: 800 }}>
                📈 Dedicated Student Progress Tracking (Subject Mastery, Assessments & Observations)
              </h2>
              <p style={{ margin: "2px 0 0", fontSize: "0.84rem", color: "#64748b" }}>
                Track and update Daily/Weekly/Monthly/Termly progress, Before-and-After assessments, 5-subject sub-skill mastery, weakness identification, and teacher observations.
              </p>
            </div>

            <select
              className="form-select"
              style={{ maxWidth: 340 }}
              value={selectedStudentUser}
              onChange={(e) => setSelectedStudentUser(e.target.value)}
            >
              <option value="">-- Select Student --</option>
              {allRealStudents.map((s) => (
                <option key={s.username} value={s.username}>
                  {s.studentName} ({s.username} • {s.grade || s.courseName})
                </option>
              ))}
            </select>
          </div>

          {allRealStudents.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "#64748b", background: "#f8fafc", borderRadius: 12 }}>
              No students registered yet. Generate a student login in <code>/admin/credentials</code> or confirm a booking in <code>/admin/bookings</code> first.
            </div>
          ) : (
            <form onSubmit={handleSaveStudentProgressProfile}>
              {/* Core Attendance & Study Metrics */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 20 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Lessons Completed</label>
                  <input
                    type="number"
                    min={0}
                    className="form-input"
                    value={editLessonsCompleted}
                    onChange={(e) => setEditLessonsCompleted(Number(e.target.value))}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Reading Progress (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="form-input"
                    value={editReadingProgress}
                    onChange={(e) => setEditReadingProgress(Number(e.target.value))}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Attendance Rate (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="form-input"
                    value={editAttendanceRate}
                    onChange={(e) => setEditAttendanceRate(Number(e.target.value))}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Learning Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    min={0}
                    className="form-input"
                    value={editLearningHours}
                    onChange={(e) => setEditLearningHours(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Manual Teacher Attention Flag */}
              <div
                style={{
                  background: editFlaggedForAttention ? "#fef2f2" : "#f8fafc",
                  border: editFlaggedForAttention ? "1px solid #fca5a5" : "1px solid #e2e8f0",
                  borderRadius: 14,
                  padding: 16,
                  marginBottom: 22,
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: 16,
                  alignItems: "center",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontWeight: 800,
                    fontSize: "0.86rem",
                    color: editFlaggedForAttention ? "#dc2626" : "#0f172a",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={editFlaggedForAttention}
                    onChange={(e) => setEditFlaggedForAttention(e.target.checked)}
                    style={{ width: 18, height: 18 }}
                  />
                  🚩 Flag Student for Teacher Attention
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Reason for flagging (e.g., Struggling with consonant blends and vowel digraphs — schedule extra 1:1 phonics drill)"
                  value={editFlagReason}
                  onChange={(e) => setEditFlagReason(e.target.value)}
                  style={{ background: "#ffffff" }}
                />
              </div>

              {/* 5 Subject Tracks: Before & After Assessments + Sub-Skill Mastery Percentages */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ margin: "0 0 6px", fontSize: "1.02rem", fontWeight: 900, color: "#0f172a" }}>
                  📚 Subject-by-Subject Skill Mastery & Before/After Diagnostic Assessments
                </h3>
                <p style={{ margin: "0 0 14px", fontSize: "0.8rem", color: "#64748b" }}>
                  Update each subject’s Baseline (Before) Assessment %, Current (After) Assessment %, and individual sub-skill mastery percentages. Any skill below 60% automatically triggers a weakness alert.
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))",
                    gap: 16,
                  }}
                >
                  {editSubjectTracks.map((track, tIdx) => (
                    <div
                      key={track.subjectKey}
                      style={{
                        background: "#f8fafc",
                        borderRadius: 16,
                        padding: 16,
                        border: "1px solid #cbd5e1",
                        borderTop: "4px solid #4f46e5",
                      }}
                    >
                      <div style={{ fontWeight: 900, fontSize: "0.95rem", color: "#0f172a", marginBottom: 4 }}>
                        {track.subjectLabel}
                      </div>
                      <div style={{ fontSize: "0.73rem", color: "#64748b", marginBottom: 10 }}>
                        Measures: {track.whatToMeasure}
                      </div>

                      {/* Before & After Assessment Inputs */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                        <div>
                          <label style={{ fontSize: "0.72rem", fontWeight: 800, color: "#64748b" }}>
                            Before Assessment (%)
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            className="form-input"
                            value={track.beforeScore}
                            onChange={(e) => {
                              const updated = [...editSubjectTracks];
                              updated[tIdx] = {
                                ...updated[tIdx],
                                beforeScore: Number(e.target.value),
                              };
                              setEditSubjectTracks(updated);
                            }}
                            style={{ background: "#fff", padding: "6px 10px" }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: "0.72rem", fontWeight: 800, color: "#047857" }}>
                            After Assessment (%)
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            className="form-input"
                            value={track.afterScore}
                            onChange={(e) => {
                              const updated = [...editSubjectTracks];
                              updated[tIdx] = {
                                ...updated[tIdx],
                                afterScore: Number(e.target.value),
                              };
                              setEditSubjectTracks(updated);
                            }}
                            style={{ background: "#ecfdf5", padding: "6px 10px", fontWeight: 800 }}
                          />
                        </div>
                      </div>

                      {/* Sub-skills */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {track.skills.map((sk, sIdx) => (
                          <div
                            key={sk.id}
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 78px",
                              alignItems: "center",
                              gap: 8,
                              background: "#ffffff",
                              padding: "6px 10px",
                              borderRadius: 8,
                              border: "1px solid #e2e8f0",
                            }}
                          >
                            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#334155" }}>
                              {sk.label}
                            </span>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              className="form-input"
                              value={sk.mastery}
                              onChange={(e) => {
                                const val = Math.max(0, Math.min(100, Number(e.target.value)));
                                const updated = [...editSubjectTracks];
                                const newSkills = [...updated[tIdx].skills];
                                newSkills[sIdx] = { ...newSkills[sIdx], mastery: val };
                                const avgAfter = Math.round(
                                  newSkills.reduce((acc, item) => acc + item.mastery, 0) /
                                    newSkills.length
                                );
                                updated[tIdx] = {
                                  ...updated[tIdx],
                                  skills: newSkills,
                                  afterScore: avgAfter,
                                };
                                setEditSubjectTracks(updated);
                              }}
                              style={{ padding: "4px 8px", fontSize: "0.8rem", textAlign: "right" }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily, Weekly, Monthly & Termly Progress Editor */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ margin: "0 0 6px", fontSize: "1.02rem", fontWeight: 900, color: "#0f172a" }}>
                  🗓️ Daily, Weekly, Monthly & Termly Progress Milestones
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
                    gap: 12,
                  }}
                >
                  {(["daily", "weekly", "monthly", "termly"] as const).map((periodKey) => {
                    const ps = editPeriodSummaries[periodKey];
                    if (!ps) return null;
                    return (
                      <div
                        key={ps.period}
                        style={{
                          background: "#f8fafc",
                          borderRadius: 12,
                          padding: 14,
                          border: "1px solid #cbd5e1",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 900,
                            fontSize: "0.84rem",
                            color: "#1e40af",
                            textTransform: "uppercase",
                            marginBottom: 8,
                          }}
                        >
                          {ps.period} — {ps.label}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                          <div>
                            <label style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b" }}>
                              Lessons Done / Target
                            </label>
                            <div style={{ display: "flex", gap: 4 }}>
                              <input
                                type="number"
                                min={0}
                                className="form-input"
                                value={ps.lessonsDone}
                                onChange={(e) => {
                                  setEditPeriodSummaries((prev) => ({
                                    ...prev,
                                    [periodKey]: {
                                      ...prev[periodKey],
                                      lessonsDone: Number(e.target.value),
                                    },
                                  }));
                                }}
                                style={{ padding: "4px 6px", background: "#fff" }}
                              />
                              <input
                                type="number"
                                min={1}
                                className="form-input"
                                value={ps.targetLessons}
                                onChange={(e) => {
                                  setEditPeriodSummaries((prev) => ({
                                    ...prev,
                                    [periodKey]: {
                                      ...prev[periodKey],
                                      targetLessons: Number(e.target.value),
                                    },
                                  }));
                                }}
                                style={{ padding: "4px 6px", background: "#fff" }}
                              />
                            </div>
                          </div>
                          <div>
                            <label style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b" }}>
                              Avg Score (%)
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              className="form-input"
                              value={ps.avgScore}
                              onChange={(e) => {
                                setEditPeriodSummaries((prev) => ({
                                  ...prev,
                                  [periodKey]: {
                                    ...prev[periodKey],
                                    avgScore: Number(e.target.value),
                                  },
                                }));
                              }}
                              style={{ padding: "4px 8px", background: "#fff" }}
                            />
                          </div>
                        </div>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Summary note for this period..."
                          value={ps.summaryNote}
                          onChange={(e) => {
                            setEditPeriodSummaries((prev) => ({
                              ...prev,
                              [periodKey]: {
                                ...prev[periodKey],
                                summaryNote: e.target.value,
                              },
                            }));
                          }}
                          style={{ padding: "6px 8px", fontSize: "0.78rem", background: "#fff" }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Strengths, Weakness Identification & Improvement Recommendations */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: 14,
                  marginBottom: 20,
                }}
              >
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">✅ Observed Strengths (One per line)</label>
                  <textarea
                    rows={3}
                    className="form-input"
                    placeholder="Enter observed strengths for this student..."
                    value={editStrengthsText}
                    onChange={(e) => setEditStrengthsText(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">🎯 Weakness Identification (One per line)</label>
                  <textarea
                    rows={3}
                    className="form-input"
                    placeholder="Enter specific weaknesses identified..."
                    value={editImprovementsText}
                    onChange={(e) => setEditImprovementsText(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">💡 Improvement Recommendations (One per line)</label>
                  <textarea
                    rows={3}
                    className="form-input"
                    placeholder="Enter actionable improvement steps for student & parent..."
                    value={editRecommendationsText}
                    onChange={(e) => setEditRecommendationsText(e.target.value)}
                  />
                </div>
              </div>

              {/* Teacher Observations Log */}
              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: 16,
                  padding: 18,
                  border: "1px solid #cbd5e1",
                  marginBottom: 20,
                }}
              >
                <h4 style={{ margin: "0 0 10px", fontSize: "0.95rem", fontWeight: 900, color: "#0f172a" }}>
                  👩‍🏫 Add New Teacher Observation Note
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 10,
                    marginBottom: editTeacherObservations.length > 0 ? 14 : 0,
                  }}
                >
                  <select
                    className="form-select"
                    value={newObsSubject}
                    onChange={(e) => setNewObsSubject(e.target.value)}
                    style={{ background: "#fff" }}
                  >
                    <option value="English / Phonics">📖 English / Phonics</option>
                    <option value="Writing">✍️ Writing</option>
                    <option value="Mathematics">🔢 Mathematics</option>
                    <option value="Public Speaking">🎙️ Public Speaking</option>
                    <option value="Coding">💻 Coding</option>
                  </select>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Classroom observation note..."
                    value={newObsNote}
                    onChange={(e) => setNewObsNote(e.target.value)}
                    style={{ background: "#fff" }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Recommended follow-up action..."
                    value={newObsAction}
                    onChange={(e) => setNewObsAction(e.target.value)}
                    style={{ background: "#fff" }}
                  />
                </div>

                {editTeacherObservations.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {editTeacherObservations.map((obs) => (
                      <div
                        key={obs.id}
                        style={{
                          background: "#ffffff",
                          padding: "10px 14px",
                          borderRadius: 10,
                          border: "1px solid #e2e8f0",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 10,
                          fontSize: "0.82rem",
                        }}
                      >
                        <div>
                          <strong>[{obs.subject}]</strong> {obs.observation}
                          {obs.recommendation && (
                            <span style={{ color: "#047857", fontWeight: 700, marginLeft: 8 }}>
                              • Action: {obs.recommendation}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setEditTeacherObservations((prev) =>
                              prev.filter((item) => item.id !== obs.id)
                            )
                          }
                          style={{
                            background: "#fee2e2",
                            color: "#dc2626",
                            border: "none",
                            borderRadius: 6,
                            padding: "4px 8px",
                            fontSize: "0.72rem",
                            fontWeight: 800,
                            cursor: "pointer",
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={savingProgressProfile}
                className="btn btn-primary shining"
                style={{ padding: "12px 24px" }}
              >
                <Save size={16} />
                <span>
                  {savingProgressProfile
                    ? "Saving Complete Progress Record..."
                    : "Save Subject Mastery, Assessments & Teacher Observations"}
                </span>
              </button>
            </form>
          )}
        </div>

        {/* Complete Bright Buddy AI Learning Assessment History */}
        <div className="admin-panel-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.08rem", fontWeight: 900 }}>
                🤖 Bright Buddy — Complete AI Learning Assessment History ({lmsData.aiLogs.length})
              </h3>
              <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#64748b" }}>
                Tracks every child’s skills practised, questions attempted, correct/incorrect answers, words pronounced correctly, words needing improvement, time spent learning, mastery level, and recommended next activity.
              </p>
            </div>
            {selectedStudentUser && (
              <span
                style={{
                  background: "#eef2ff",
                  color: "#4338ca",
                  padding: "4px 12px",
                  borderRadius: 999,
                  fontSize: "0.76rem",
                  fontWeight: 800,
                }}
              >
                Showing All Sessions (Highlighting {selectedStudentUser})
              </span>
            )}
          </div>

          {lmsData.aiLogs.length === 0 ? (
            <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>
              No Bright Buddy AI learning sessions recorded yet. When students practise Reading, Writing, Speaking (SuperSpeakers), or Mathematics with Bright Buddy, their complete assessment logs appear here.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {lmsData.aiLogs.map((log) => {
                const isSelectedStudent =
                  selectedStudentUser &&
                  log.studentUsername.toUpperCase() === selectedStudentUser.toUpperCase();
                return (
                  <div
                    key={log.id}
                    style={{
                      padding: 16,
                      borderRadius: 14,
                      border: isSelectedStudent ? "2px solid #4f46e5" : "1px solid #cbd5e1",
                      background: isSelectedStudent ? "#eef2ff" : "#f8fafc",
                      fontSize: "0.84rem",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                      <div style={{ fontWeight: 900, fontSize: "0.94rem", color: "#0f172a" }}>
                        👤 {log.studentName} ({log.studentUsername}) — {log.topic}
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <span
                          style={{
                            background: "#dcfce7",
                            color: "#15803d",
                            padding: "3px 10px",
                            borderRadius: 999,
                            fontSize: "0.74rem",
                            fontWeight: 800,
                          }}
                        >
                          Mastery: {log.masteryLevel || "Proficient"} ({log.score}%)
                        </span>
                        <span
                          style={{
                            background: "#e0f2fe",
                            color: "#0369a1",
                            padding: "3px 10px",
                            borderRadius: 999,
                            fontSize: "0.74rem",
                            fontWeight: 800,
                          }}
                        >
                          ⏱️ Time Spent: {log.timeSpentMinutes || 5} min
                        </span>
                        <span style={{ color: "#64748b", fontSize: "0.74rem", fontWeight: 700 }}>
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: 8,
                        background: "#ffffff",
                        padding: 12,
                        borderRadius: 10,
                        border: "1px solid #e2e8f0",
                        marginBottom: 8,
                      }}
                    >
                      <div>
                        <strong style={{ color: "#475569", fontSize: "0.74rem" }}>Skills Practised:</strong>
                        <div style={{ fontWeight: 700, color: "#0f172a" }}>
                          {log.skillsPractised && log.skillsPractised.length > 0
                            ? log.skillsPractised.join(", ")
                            : log.mode.toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <strong style={{ color: "#475569", fontSize: "0.74rem" }}>Questions & Answers:</strong>
                        <div style={{ fontWeight: 700, color: "#0f172a" }}>
                          Attempted: {log.questionsAttempted ?? 0} •{" "}
                          <span style={{ color: "#059669" }}>Correct: {log.correctAnswers ?? 0}</span> •{" "}
                          <span style={{ color: "#dc2626" }}>Incorrect: {log.incorrectAnswers ?? 0}</span>
                        </div>
                      </div>
                      <div>
                        <strong style={{ color: "#475569", fontSize: "0.74rem" }}>Words Pronounced Correctly:</strong>
                        <div style={{ fontWeight: 700, color: "#059669" }}>
                          {log.wordsPronouncedCorrectly && log.wordsPronouncedCorrectly.length > 0
                            ? log.wordsPronouncedCorrectly.join(", ")
                            : "—"}
                        </div>
                      </div>
                      <div>
                        <strong style={{ color: "#475569", fontSize: "0.74rem" }}>Words Needing Improvement:</strong>
                        <div style={{ fontWeight: 700, color: "#d97706" }}>
                          {log.wordsNeedingImprovement && log.wordsNeedingImprovement.length > 0
                            ? log.wordsNeedingImprovement.join(", ")
                            : "None"}
                          {log.wordsImprovedOnRetry && log.wordsImprovedOnRetry.length > 0 && (
                            <span style={{ color: "#059669", marginLeft: 6 }}>
                              (✓ Improved on retry: {log.wordsImprovedOnRetry.join(", ")})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, fontSize: "0.8rem" }}>
                      <div style={{ color: "#334155" }}>
                        <strong>Assessment Summary:</strong> {log.feedback}
                      </div>
                      {log.recommendedNextActivity && (
                        <div style={{ color: "#047857", fontWeight: 800 }}>
                          👉 Recommended Next Activity: {log.recommendedNextActivity}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Broadcast or Targeted Notification to Students & Parents */}
        <div className="admin-panel-card" style={{ padding: 24 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: "1.05rem", fontWeight: 800 }}>
            🔔 Send Portal Notification / Reminder to Specific Student or All Students
          </h3>
          <form onSubmit={handlePostAnnouncement}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 12 }}>
              <select
                className="form-select"
                value={announcementTarget}
                onChange={(e) => setAnnouncementTarget(e.target.value)}
              >
                <option value="ALL">🌍 All Students & Parents</option>
                {allRealStudents.map((s) => (
                  <option key={s.username} value={s.username}>
                    👤 {s.studentName} ({s.username})
                  </option>
                ))}
              </select>
              <input
                type="text"
                className="form-input"
                placeholder="Notification Title"
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
              <span>{sendingNotif ? "Sending..." : "Send Notification"}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // SECTION 3: GENERATE & SEND DOWNLOADABLE PDF REPORT CARDS (/admin/reports)
  // ==========================================================================
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div className="admin-panel-card" style={{ padding: 24 }}>
        <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#4f46e5", textTransform: "uppercase" }}>
          Dedicated Page • /admin/reports
        </span>
        <h2 style={{ margin: "2px 0 6px", fontSize: "1.15rem", fontWeight: 800 }}>
          📄 Generate & Send Downloadable PDF Report Card to Parents
        </h2>
        <p style={{ margin: "0 0 18px", fontSize: "0.84rem", color: "#64748b" }}>
          Select a student, review or customize their subject evaluations, and generate an official PDF Report Card.
        </p>

        <form onSubmit={handleGenerateReportCard}>
          <div className="form-row-2col" style={{ marginBottom: 14 }}>
            <div className="form-group">
              <label className="form-label">Select Student</label>
              <select
                className="form-select"
                value={rcStudentUser}
                onChange={(e) => setRcStudentUser(e.target.value)}
                required
              >
                <option value="">-- Select Student --</option>
                {allRealStudents.map((s) => (
                  <option key={s.username} value={s.username}>
                    {s.studentName} ({s.username} • {s.email || s.grade})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Academic Term / Period</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. First Term Assessment • 2026"
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <label className="form-label" style={{ margin: 0 }}>
                Subject Evaluations ({rcSubjects.length})
              </label>
              <button
                type="button"
                onClick={() =>
                  setRcSubjects((prev) => [
                    ...prev,
                    { subject: "", score: 0, grade: "", remark: "" },
                  ])
                }
                style={{
                  background: "#eff6ff",
                  color: "#1d4ed8",
                  border: "1px solid #bfdbfe",
                  padding: "4px 10px",
                  borderRadius: 6,
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                + Add Subject Row
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {rcSubjects.map((subj, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 90px 80px 2fr auto",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Subject name"
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
                    placeholder="Score"
                    value={subj.score}
                    onChange={(e) => {
                      const updated = [...rcSubjects];
                      const sc = Number(e.target.value);
                      updated[idx].score = sc;
                      updated[idx].grade = sc >= 90 ? "A+" : sc >= 80 ? "A" : sc >= 70 ? "B+" : sc >= 60 ? "B" : "C";
                      setRcSubjects(updated);
                    }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Grade"
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
                    placeholder="Teacher remark for this subject"
                    value={subj.remark}
                    onChange={(e) => {
                      const updated = [...rcSubjects];
                      updated[idx].remark = e.target.value;
                      setRcSubjects(updated);
                    }}
                  />
                  {rcSubjects.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setRcSubjects((prev) => prev.filter((_, i) => i !== idx))
                      }
                      style={{
                        background: "#fee2e2",
                        color: "#dc2626",
                        border: "none",
                        borderRadius: 6,
                        padding: "8px 10px",
                        cursor: "pointer",
                      }}
                    >
                      ×
                    </button>
                  )}
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
                placeholder="Enter student's key strengths..."
                value={rcStrengths}
                onChange={(e) => setRcStrengths(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Areas Needing Improvement (One per line)</label>
              <textarea
                rows={3}
                className="form-input"
                placeholder="Enter areas needing improvement..."
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
              placeholder="Write overall term remark for the student and parent..."
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
          <p style={{ fontSize: "0.84rem", color: "#64748b", margin: 0 }}>
            No report cards generated yet.
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
