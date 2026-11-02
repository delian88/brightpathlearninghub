"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Lock,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  LogOut,
  ArrowLeft,
  MessageCircle,
  Award,
  Video,
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  FileText,
  Download,
  Bell,
  TrendingUp,
  CheckSquare,
  Play,
  Send,
  UserCheck,
  AlertCircle,
  Star,
  HelpCircle,
  RefreshCw,
  PenTool,
  LayoutDashboard,
  Users,
  Menu,
  X,
} from "lucide-react";
import ToastNotification, { type ToastData, type ToastType } from "@/components/ToastNotification";
import StudentHomeworkModule from "@/components/StudentHomeworkModule";
import BrightBuddyModule from "@/components/BrightBuddyModule";
import StudentProgressModule from "@/components/StudentProgressModule";
import StudentRewardsModule from "@/components/StudentRewardsModule";
import PortalAdditionalModules from "@/components/PortalAdditionalModules";
import {
  DEFAULT_AVATARS,
  READING_PRACTICE_PASSAGES,
  PRONUNCIATION_WORDS,
  WRITING_PROMPTS,
  type HomeworkAssignment,
  type HomeworkSubmission,
  type StudentReportCard,
  type PortalNotification,
  type StudentProgressRecord,
  type AiPracticeLog,
  type BrightBuddyMode,
} from "@/lib/lmsData";
import { downloadReportCardPdf } from "@/lib/pdfReportGenerator";

type PortalTab =
  | "home"
  | "classes"
  | "homework"
  | "ai-buddy"
  | "progress"
  | "results"
  | "reports"
  | "badges"
  | "notifications"
  | "parent-monitor"
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

const ADDITIONAL_PORTAL_TABS: { id: PortalTab; label: string; title: string; subtitle: string }[] = [
  { id: "timetable", label: "My Timetable", title: "My Timetable", subtitle: "Class schedules and upcoming lessons." },
  { id: "attendance", label: "Attendance", title: "Attendance Records", subtitle: "Attendance records and absence history." },
  { id: "materials", label: "Learning Materials", title: "Learning Materials", subtitle: "Download worksheets, PDFs, videos and audio." },
  { id: "classroom", label: "Online Classroom", title: "Online Classroom", subtitle: "Join scheduled live lessons." },
  { id: "assessments", label: "Assessments", title: "Assessments", subtitle: "Tests, quizzes and examinations." },
  { id: "messages", label: "Messaging", title: "Teacher–Parent Messaging", subtitle: "Communicate with your teacher." },
  { id: "announcements", label: "Announcements", title: "Announcements", subtitle: "School-wide and class announcements." },
  { id: "certificates", label: "Certificates", title: "Certificates", subtitle: "Course completion certificates." },
  { id: "profile", label: "Student Profile", title: "Student Profile", subtitle: "Personal details, class, subjects and learning goals." },
  { id: "support", label: "Support Centre", title: "Support Centre", subtitle: "Help requests and technical support." },
  { id: "calendar", label: "Calendar", title: "Calendar", subtitle: "Homework deadlines, examinations and events." },
];

const DAILY_ACTIVITIES = [
  {
    id: "act-1",
    title: "15-Min Phonics & Sight Word Warmup",
    category: "AI Reading",
    duration: "15 mins",
    description: "Read 'The Golden Sunbird of Abuja' aloud with AI Learning Buddy.",
  },
  {
    id: "act-2",
    title: "Complete Weekly Course Homework Quiz",
    category: "Homework",
    duration: "20 mins",
    description: "Answer objective & written questions and submit online for grading.",
  },
  {
    id: "act-3",
    title: "Practise 5 Multi-Syllable Pronunciation Words",
    category: "Pronunciation",
    duration: "10 mins",
    description: "Listen and repeat target words with slow & normal voice playback.",
  },
  {
    id: "act-4",
    title: "Creative Paragraph Writing Practice",
    category: "Writing Practice",
    duration: "15 mins",
    description: "Write 3–5 sentences in the AI Writing Coach and check grammar.",
  },
  {
    id: "act-5",
    title: "Attend 1-on-1 Live Interactive Mentor Session",
    category: "Live Class",
    duration: "45 mins",
    description: "Join your scheduled live session with your dedicated Bright Path teacher.",
  },
];

export default function StudentPortalPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [studentAccount, setStudentAccount] = useState<any | null>(null);
  const [authHydrated, setAuthHydrated] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  // Navigation & Portal Mode
  const [activeTab, setActiveTab] = useState<PortalTab>("home");
  const [portalRole, setPortalRole] = useState<"student" | "parent">("student");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // LMS State for logged-in student
  const [assignments, setAssignments] = useState<HomeworkAssignment[]>([]);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [reportCards, setReportCards] = useState<StudentReportCard[]>([]);
  const [selectedReportTermFilter, setSelectedReportTermFilter] = useState<string>("ALL");
  const [viewingReportCardId, setViewingReportCardId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [progress, setProgress] = useState<StudentProgressRecord | null>(null);
  const [aiLogs, setAiLogs] = useState<AiPracticeLog[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [leaderboardSettings, setLeaderboardSettings] = useState<any>({
    enabled: true,
    anonymizeNames: true,
    hideForEarlyYears: true,
  });
  const [syncingLms, setSyncingLms] = useState(false);
  const [timetableSlots, setTimetableSlots] = useState<any[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [learningMaterials, setLearningMaterials] = useState<any[]>([]);
  const [portalMessages, setPortalMessages] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);

  // Homework Taking State
  const [activeHomework, setActiveHomework] = useState<HomeworkAssignment | null>(null);
  const [hwAnswers, setHwAnswers] = useState<Record<string, string>>({});
  const [submittingHw, setSubmittingHw] = useState(false);

  // AI Learning Buddy State
  const [aiMode, setAiMode] = useState<BrightBuddyMode>("reading");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // 1. AI Chat State
  const [chatMessages, setChatMessages] = useState<
    { sender: "ai" | "child"; text: string }[]
  >([
    {
      sender: "ai",
      text: "Hello young scholar! 👋 I am your Bright Path AI Learning Buddy. Click the speaker button to hear me talk, or ask me to help you read, pronounce a tricky word, solve a math puzzle, or practise writing!",
    },
  ]);
  const [chatInput, setChatInput] = useState("");

  // 2. AI Reading Aloud State
  const [selectedPassageIdx, setSelectedPassageIdx] = useState(0);
  const [spokenTranscript, setSpokenTranscript] = useState("");
  const [readingScore, setReadingScore] = useState<number | null>(null);
  const [readingFeedback, setReadingFeedback] = useState("");
  const [missedReadingWords, setMissedReadingWords] = useState<string[]>([]);

  // 3. AI Pronunciation State
  const [selectedWordIdx, setSelectedWordIdx] = useState(0);
  const [pronunciationResult, setPronunciationResult] = useState<{
    spoken: string;
    score: number;
    feedback: string;
  } | null>(null);

  // 4. AI Writing Practice State
  const [selectedPromptIdx, setSelectedPromptIdx] = useState(0);
  const [writingText, setWritingText] = useState("");
  const [writingEvaluation, setWritingEvaluation] = useState<{
    score: number;
    wordCount: number;
    sentenceCount: number;
    feedback: string;
    improvements: string[];
  } | null>(null);

  const recognitionRef = useRef<any>(null);

  const showToast = (message: string, type: ToastType = "success") => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 5000);
  };

  useEffect(() => {
    const saved =
      localStorage.getItem("bp_student_account") ||
      sessionStorage.getItem("bp_student_account");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        localStorage.setItem("bp_student_account", saved);
        sessionStorage.setItem("bp_student_account", saved);
        setStudentAccount(parsed);
      } catch {}
    }
    setAuthHydrated(true);
  }, []);

  const fetchStudentLmsData = async (acc: any) => {
    if (!acc?.username) return;
    setSyncingLms(true);
    try {
      const params = new URLSearchParams({
        studentUsername: acc.username,
        studentName: acc.studentName || "Bright Scholar",
        courseName: acc.courseName || "English Phonics & Reading",
      });
      const res = await fetch(`/api/lms?${params.toString()}`, { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setAssignments(data.assignments || []);
        setSubmissions(data.submissions || []);
        setReportCards(data.reportCards || []);
        setNotifications(data.notifications || []);
        setProgress(data.progress || null);
        setAiLogs(data.aiLogs || []);
        setTimetableSlots(data.timetableSlots || []);
        setAttendanceLogs(data.attendanceLogs || []);
        setLearningMaterials(data.learningMaterials || []);
        setPortalMessages(data.messages || []);
        setSupportTickets(data.supportTickets || []);
        setCalendarEvents(data.calendarEvents || []);
        if (Array.isArray(data.leaderboard)) setLeaderboard(data.leaderboard);
        if (data.leaderboardSettings) setLeaderboardSettings(data.leaderboardSettings);
      }
    } catch (err) {
      console.error("Failed to fetch student LMS data:", err);
    } finally {
      setSyncingLms(false);
    }
  };

  useEffect(() => {
    if (studentAccount) {
      fetchStudentLmsData(studentAccount);
    }
  }, [studentAccount]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/portal/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success && data.account) {
        const serialized = JSON.stringify(data.account);
        setStudentAccount(data.account);
        localStorage.setItem("bp_student_account", serialized);
        sessionStorage.setItem("bp_student_account", serialized);
        showToast(`Welcome back, ${data.account.studentName}!`, "success");
      } else {
        const errMsg = data.message || "Invalid username or password.";
        setError(errMsg);
        showToast(errMsg, "error");
      }
    } catch {
      const errMsg = "Connection error. Please try again.";
      setError(errMsg);
      showToast(errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoQuickAccess = () => {
    const demoAcc = {
      id: 999,
      parentName: "Amina Bello",
      studentName: "Zainab Bello",
      email: "amina.bello@example.com",
      phoneNumber: "+234 803 123 4567",
      grade: "Grade 2",
      courseName: "English Phonics & Reading",
      username: "BP-ZAINAB-1001",
      scheduleSlot: "Weekday Evening (5 PM - 6 PM)",
      status: "active",
    };
    const serialized = JSON.stringify(demoAcc);
    setStudentAccount(demoAcc);
    localStorage.setItem("bp_student_account", serialized);
    sessionStorage.setItem("bp_student_account", serialized);
    showToast("Signed in to Demo Student & Parent Learning Hub!", "success");
  };

  const handleLogout = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    localStorage.removeItem("bp_student_account");
    sessionStorage.removeItem("bp_student_account");
    setStudentAccount(null);
    setUsername("");
    setPassword("");
    showToast("You have been signed out of the Student Portal.", "info");
  };

  // ============================================================================
  // VOICE SYNTHESIS & SPEECH RECOGNITION HELPERS (AI LEARNING BUDDY)
  // ============================================================================
  const speakText = (text: string, rate = 0.95) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      showToast("Voice playback is not supported on this browser.", "warning");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1.08;
    utterance.lang = "en-US";
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const startListeningForReading = () => {
    if (typeof window === "undefined") return;
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      showToast(
        "Microphone speech recognition requires Chrome, Edge, or Safari. You can also type or click 'Evaluate Reading' below!",
        "info"
      );
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRec();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      showToast("🎤 Listening... Read the passage aloud clearly!", "info");
    };

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + " ";
      }
      setSpokenTranscript(transcript.trim());
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const evaluateReadingPassage = async (customTranscript?: string) => {
    const passage = READING_PRACTICE_PASSAGES[selectedPassageIdx];
    const textToEvaluate = (customTranscript ?? spokenTranscript).trim();
    if (!textToEvaluate) {
      showToast("Please click 'Read Aloud with Mic' or type the words you read first!", "warning");
      return;
    }

    const targetWords = passage.text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter(Boolean);
    const childWords = textToEvaluate
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter(Boolean);

    let matched = 0;
    const missed: string[] = [];
    targetWords.forEach((w) => {
      if (childWords.includes(w)) {
        matched++;
      } else if (w.length > 4 && !missed.includes(w)) {
        missed.push(w);
      }
    });

    const accuracy = Math.min(100, Math.max(45, Math.round((matched / targetWords.length) * 100)));
    setReadingScore(accuracy);
    setMissedReadingWords(missed.slice(0, 5));

    const feedbackMsg =
      accuracy >= 88
        ? `Wonderful reading, ${studentAccount.studentName}! You read "${passage.title}" with ${accuracy}% accuracy and clear pronunciation!`
        : `Good effort, ${studentAccount.studentName}! You scored ${accuracy}% on "${passage.title}". Let's practise pronouncing: ${
            missed.slice(0, 4).join(", ") || "the focus words"
          }.`;

    setReadingFeedback(feedbackMsg);
    speakText(feedbackMsg, 0.95);

    try {
      await fetch("/api/lms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "log-ai-practice",
          studentUsername: studentAccount.username,
          studentName: studentAccount.studentName,
          mode: "reading",
          topic: `Reading Aloud: ${passage.title}`,
          score: accuracy,
          feedback: feedbackMsg,
          improvementArea:
            missed.length > 0
              ? `Reading & pronouncing words like "${missed.slice(0, 3).join(", ")}"`
              : undefined,
        }),
      });
      fetchStudentLmsData(studentAccount);
    } catch {}
  };

  const practicePronunciationWithMic = () => {
    const targetObj = PRONUNCIATION_WORDS[selectedWordIdx];
    const SpeechRec =
      typeof window !== "undefined"
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (!SpeechRec) {
      // Simulate guided pronunciation check when browser speech recognition API is unavailable
      const msg = `Great job practising the word "${targetObj.word}" (${targetObj.phonetic})! Remember to break it into syllables: ${targetObj.syllables}.`;
      setPronunciationResult({
        spoken: targetObj.word,
        score: 95,
        feedback: msg,
      });
      speakText(msg, 0.92);
      return;
    }

    const recognition = new SpeechRec();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      showToast(`🎤 Say the word "${targetObj.word}" clearly now!`, "info");
    };

    recognition.onresult = async (event: any) => {
      const spoken = String(event.results[0][0].transcript || "").trim();
      const isExact = spoken.toLowerCase().includes(targetObj.word.toLowerCase());
      const score = isExact ? 98 : 76;
      const fb = isExact
        ? ` Spot on! You pronounced "${targetObj.word}" clearly and accurately!`
        : `Good try! I heard "${spoken}". Listen to the slow syllables (${targetObj.syllables}) and try saying "${targetObj.word}" once more!`;

      setPronunciationResult({ spoken, score, feedback: fb });
      speakText(fb, 0.95);

      await fetch("/api/lms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "log-ai-practice",
          studentUsername: studentAccount.username,
          studentName: studentAccount.studentName,
          mode: "pronunciation",
          topic: `Word Pronunciation: ${targetObj.word}`,
          score,
          feedback: fb,
          improvementArea: !isExact
            ? `Syllable articulation for "${targetObj.word}" (${targetObj.phonetic})`
            : undefined,
        }),
      });
      fetchStudentLmsData(studentAccount);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const evaluateChildWriting = async () => {
    const promptObj = WRITING_PROMPTS[selectedPromptIdx];
    const clean = writingText.trim();
    if (!clean) {
      showToast("Please write at least 2 sentences before checking with AI Buddy!", "warning");
      return;
    }

    const words = clean.split(/\s+/).filter(Boolean);
    const sentences = clean
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const usedKeywords = promptObj.keywords.filter((kw) =>
      clean.toLowerCase().includes(kw.toLowerCase())
    );
    const startsWithCapital = /^[A-Z]/.test(clean);
    const endsWithPunctuation = /[.!?]$/.test(clean);

    const improvements: string[] = [];
    let score = 70;

    if (words.length >= 20) score += 12;
    else improvements.push("Write longer, more descriptive sentences (aim for 25+ words)");

    if (sentences.length >= 3) score += 8;
    else improvements.push("Organize your thoughts into at least 3 complete sentences");

    if (startsWithCapital && endsWithPunctuation) score += 5;
    else improvements.push("Remember to start every sentence with a capital letter and end with a full stop");

    if (usedKeywords.length >= 2) score += 5;
    else
      improvements.push(
        `Try using vocabulary words like: ${promptObj.keywords.slice(0, 3).join(", ")}`
      );

    score = Math.min(100, score);

    const feedback =
      score >= 88
        ? `Fantastic writing, ${studentAccount.studentName}! You wrote ${words.length} words across ${sentences.length} sentences and used strong vocabulary (${
            usedKeywords.join(", ") || "great expression"
          })!`
        : `Good writing effort, ${studentAccount.studentName}! You wrote ${words.length} words. ${
            improvements[0] || "Keep practising your descriptive sentences!"
          }`;

    setWritingEvaluation({
      score,
      wordCount: words.length,
      sentenceCount: sentences.length,
      feedback,
      improvements,
    });

    speakText(feedback, 0.95);

    try {
      await fetch("/api/lms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "log-ai-practice",
          studentUsername: studentAccount.username,
          studentName: studentAccount.studentName,
          mode: "writing",
          topic: `Writing Practice: ${promptObj.title}`,
          score,
          feedback,
          improvementArea: improvements[0],
        }),
      });
      fetchStudentLmsData(studentAccount);
    } catch {}
  };

  const handleSendAiChat = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = chatInput.trim();
    if (!q) return;

    const updated = [...chatMessages, { sender: "child" as const, text: q }];
    setChatMessages(updated);
    setChatInput("");

    const lower = q.toLowerCase();
    let reply = "";

    if (lower.includes("pronounce") || lower.includes("say ") || lower.includes("sound")) {
      reply =
        "To pronounce a big word, clap your hands for each syllable! For example, MAG-NIF-I-CENT has 4 syllables. Switch to the 'Word Pronunciation' tab above and I will say any word slowly for you!";
    } else if (lower.includes("read") || lower.includes("story") || lower.includes("phonics")) {
      reply =
        "Reading aloud every day builds superpower fluency! Remember to sound out vowel blends like 'EA', 'OO', and 'AI'. Let's read 'The Golden Sunbird of Abuja' together in the Reading Aloud tab!";
    } else if (lower.includes("write") || lower.includes("sentence") || lower.includes("essay")) {
      reply =
        "A strong paragraph has 3 parts: a Topic Sentence that introduces your idea, 2 Detail Sentences with 'because' or 'for example', and a Closing Sentence! Always check for capital letters and full stops.";
    } else if (lower.includes("math") || lower.includes("multiply") || lower.includes("fraction")) {
      reply =
        "In Conceptual Math, we visualize numbers! For example, 6 × 4 means 6 groups of 4, which equals 24. Would you like another mental math riddle?";
    } else {
      reply = `That is a great question, ${studentAccount.studentName}! Keep up your curiosity. Remember: practise reading aloud for 10 minutes today, check your pending homework, and ask me whenever you want to hear a word pronounced!`;
    }

    setTimeout(() => {
      setChatMessages((prev) => [...prev, { sender: "ai", text: reply }]);
      speakText(reply, 0.95);
    }, 300);
  };

  // ============================================================================
  // HOMEWORK SUBMISSION & DAILY ACTIVITY HANDLERS
  // ============================================================================
  const handleSubmitHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeHomework || !studentAccount) return;

    setSubmittingHw(true);
    try {
      const res = await fetch("/api/lms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit-homework",
          homeworkId: activeHomework.id,
          studentUsername: studentAccount.username,
          studentName: studentAccount.studentName,
          parentEmail: studentAccount.email,
          grade: studentAccount.grade,
          answers: hwAnswers,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        speakText(data.message, 0.95);
        setActiveHomework(null);
        setHwAnswers({});
        fetchStudentLmsData(studentAccount);
      } else {
        showToast(data.message || "Failed to submit homework.", "error");
      }
    } catch {
      showToast("Error submitting homework.", "error");
    } finally {
      setSubmittingHw(false);
    }
  };

  const handleToggleActivity = async (activityId: string) => {
    if (!studentAccount) return;
    try {
      const res = await fetch("/api/lms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-student-profile",
          studentUsername: studentAccount.username,
          studentName: studentAccount.studentName,
          completedActivityId: activityId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProgress(data.progress);
        showToast("Daily learning progress updated!", "success");
      }
    } catch {}
  };

  const handleSelectAvatar = async (avatarId: string) => {
    if (!studentAccount) return;
    try {
      const res = await fetch("/api/lms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-student-profile",
          studentUsername: studentAccount.username,
          studentName: studentAccount.studentName,
          avatarUrl: avatarId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProgress(data.progress);
        showToast("Profile avatar updated!", "success");
      }
    } catch {}
  };

  // ============================================================================
  // COMPUTED DASHBOARD STATISTICS
  // ============================================================================
  const currentAvatar =
    DEFAULT_AVATARS.find((a) => a.id === progress?.avatarUrl) || DEFAULT_AVATARS[0];

  const completedHwIds = new Set(submissions.map((s) => s.homeworkId));
  const pendingHomework = assignments.filter((a) => !completedHwIds.has(a.id));
  const submittedHomework = submissions.filter((s) => s.status === "submitted");
  const gradedHomework = submissions.filter((s) => s.status === "graded");

  const totalAssignedCount = assignments.length;
  const hwCompletionRate =
    totalAssignedCount > 0 && submissions.length > 0
      ? Math.min(100, Math.round((submissions.length / totalAssignedCount) * 100))
      : 0;

  const avgAssessmentScore =
    submissions.length > 0
      ? Math.round(
          submissions.reduce((acc, s) => acc + (s.percentage || 0), 0) / submissions.length
        )
      : 0;

  const lessonsCompleted = progress?.lessonsCompleted ?? 0;
  const readingProgress = progress?.readingProgress ?? 0;
  const attendanceRate = progress?.attendanceRate ?? 100;
  const learningHours = progress?.learningHours ?? 0;
  const badgesList = progress?.badges || [];

  // ============================================================================
  // UNAUTHENTICATED LOGIN VIEW
  // ============================================================================
  if (!authHydrated) {
    return <div style={{ minHeight: "100vh", background: "#f8fafc" }} />;
  }

  if (!studentAccount) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "var(--font-sans)" }}>
        <ToastNotification toast={toast} onClose={() => setToast(null)} />
        <header
          style={{
            background: "var(--bp-navy-950)",
            color: "#ffffff",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "2px solid var(--bp-gold-400)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                color: "var(--bp-gold-400)",
                textDecoration: "none",
                fontSize: "0.85rem",
                fontWeight: 700,
                padding: "6px 12px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.08)",
              }}
            >
              <ArrowLeft size={16} /> Back to Website
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Image
                src="/logo.png"
                alt="Bright Path Learning Hub"
                width={36}
                height={36}
                style={{ borderRadius: "50%", border: "1.5px solid var(--bp-gold-400)" }}
              />
              <div>
                <div style={{ fontWeight: 800, fontSize: "1.05rem" }}>
                  Bright Path Learning Hub — Student & Parent Portal
                </div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                  1-on-1 Live Classroom • Homework • AI Learning Buddy • Report Cards
                </div>
              </div>
            </div>
          </div>
        </header>

        <main style={{ maxWidth: 460, margin: "45px auto", padding: "0 20px" }}>
          <div
            style={{
              background: "#ffffff",
              borderRadius: 20,
              padding: "36px 30px",
              boxShadow: "0 15px 40px rgba(10, 25, 49, 0.08)",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <Image
                src="/logo.png"
                alt="Bright Path Logo"
                width={74}
                height={74}
                style={{ margin: "0 auto 12px", borderRadius: "50%" }}
              />
              <span
                style={{
                  display: "inline-block",
                  background: "#ecfdf5",
                  color: "#059669",
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  padding: "4px 12px",
                  borderRadius: 999,
                  marginBottom: 8,
                }}
              >
                STUDENT & PARENT LEARNING HUB
              </span>
              <h1 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--bp-navy-950)", margin: 0 }}>
                Student & Parent Login
              </h1>
              <p style={{ fontSize: "0.86rem", color: "#64748b", marginTop: 6 }}>
                Enter your Student Portal ID/Email and Password to access classes, homework, AI Learning Buddy, and PDF report cards.
              </p>
            </div>

            {error && (
              <div
                style={{
                  background: "#fef2f2",
                  color: "#dc2626",
                  padding: "10px 14px",
                  borderRadius: 10,
                  fontSize: "0.85rem",
                  marginBottom: 16,
                  border: "1px solid #fecaca",
                  fontWeight: 600,
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Student Username or Parent Email</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. BP-ZAINAB-4821 or parent@example.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary shining"
                style={{ width: "100%", padding: "13px", fontSize: "0.95rem", marginTop: 8 }}
              >
                <Lock size={17} />
                <span>{loading ? "Signing In..." : "Access Student & Parent Dashboard"}</span>
              </button>
            </form>

            <div
              style={{
                marginTop: 20,
                paddingTop: 18,
                borderTop: "1px dashed #cbd5e1",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "0.78rem", color: "#64748b", marginBottom: 10 }}>
                Want to preview the full Student & Parent Dashboard right now?
              </div>
              <button
                type="button"
                onClick={handleDemoQuickAccess}
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  borderRadius: 10,
                  background: "#eff6ff",
                  color: "#1d4ed8",
                  border: "1px solid #bfdbfe",
                  fontWeight: 800,
                  fontSize: "0.84rem",
                  cursor: "pointer",
                }}
              >
                Launch Interactive Demo Student Account (Zainab • Grade 2)
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ============================================================================
  // AUTHENTICATED STUDENT & PARENT DASHBOARD (PROFESSIONAL SIDEBAR + TOP NAVBAR)
  // ============================================================================
  const TAB_META: Record<string, { title: string; subtitle: string }> = {
    home: {
      title: "Student Learning Dashboard",
      subtitle: "Overview of your classes, daily learning activities, homework, and Bright Buddy AI tutor.",
    },
    classes: {
      title: "My Enrolled Classes & Today's Plan",
      subtitle: "Join your 1-on-1 live classroom and track your daily learning checklist.",
    },
    homework: {
      title: "Homework & Online Assessments",
      subtitle: "Complete assigned homework online, draw or upload handwritten work, and view teacher feedback.",
    },
    "ai-buddy": {
      title: "Bright Buddy — AI Voice Learning Companion",
      subtitle: "Practise reading stories aloud, letter tracing, SuperSpeakers conversation, and interactive math.",
    },
    progress: {
      title: "Academic Development & Competency Tracker",
      subtitle: "Monitor reading fluency, subject mastery, key strengths, and focus areas.",
    },
    results: {
      title: "My Graded Homework & Assessment Results",
      subtitle: "Review automatic and teacher-graded scores and detailed question feedback.",
    },
    reports: {
      title: "Official PDF Academic Report Cards",
      subtitle: "View and download official termly PDF report cards issued by your teacher.",
    },
    badges: {
      title: "Rewards, Achievements & Scholar Badges",
      subtitle: "Celebrate learning milestones earned from homework, live classes, and Bright Buddy.",
    },
    notifications: {
      title: "Announcements, Reminders & Alerts",
      subtitle: "Stay updated on new homework assignments, graded work, and teacher messages.",
    },
    "parent-monitor": {
      title: "Parent & Guardian Academic Monitor",
      subtitle: `Track ${studentAccount.studentName}'s attendance, AI practice sessions, homework scores, and teacher diagnostics.`,
    },
    ...(Object.fromEntries(
      ADDITIONAL_PORTAL_TABS.map((t) => [t.id, { title: t.title, subtitle: t.subtitle }])
    ) as Record<string, { title: string; subtitle: string }>),
  };

  const selectPortalTab = (tab: PortalTab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
    if (tab === "parent-monitor") {
      setPortalRole("parent");
    }
  };

  return (
    <div className="admin-shell">
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      {/* Mobile Sidebar Backdrop */}
      <div
        className={`admin-sidebar-backdrop ${sidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* =====================================================================
          LEFT SIDEBAR NAVIGATION
          ===================================================================== */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* Brand Header */}
        <div
          style={{
            padding: "20px 18px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 11,
              textDecoration: "none",
              color: "#ffffff",
            }}
          >
            <Image
              src="/logo.png"
              alt="Bright Path Learning Hub"
              width={40}
              height={40}
              style={{
                borderRadius: "50%",
                background: "#ffffff",
                padding: 2,
                border: "2px solid #f59e0b",
                flexShrink: 0,
              }}
            />
            <div>
              <div style={{ fontWeight: 800, fontSize: "0.95rem", lineHeight: 1.2 }}>
                Bright Path Hub
              </div>
              <div
                style={{
                  fontSize: "0.68rem",
                  color: "#34d399",
                  fontWeight: 700,
                  marginTop: 2,
                  letterSpacing: "0.03em",
                }}
              >
                {portalRole === "parent" ? "PARENT MONITOR HUB" : "STUDENT LEARNING HUB"}
              </div>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="admin-mobile-menu-btn"
            style={{
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
              border: "none",
              width: 32,
              height: 32,
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Student Profile Summary Card in Sidebar */}
        <div
          style={{
            margin: "14px 12px 6px",
            padding: "12px 14px",
            borderRadius: 14,
            background: "rgba(255, 255, 255, 0.06)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: currentAvatar.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.45rem",
              border: "2px solid #fbbf24",
              flexShrink: 0,
            }}
          >
            {currentAvatar.emoji}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontWeight: 800,
                fontSize: "0.88rem",
                color: "#ffffff",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {studentAccount.studentName}
            </div>
            <div style={{ fontSize: "0.7rem", color: "#fbbf24", fontWeight: 700 }}>
              {studentAccount.username} • {studentAccount.grade}
            </div>
            <div
              style={{
                fontSize: "0.68rem",
                color: "#94a3b8",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {studentAccount.courseName}
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ flex: 1, paddingBottom: 16 }}>
          <div className="admin-nav-section-label">Learning Overview</div>
          <button
            type="button"
            onClick={() => selectPortalTab("home")}
            className={`admin-nav-item ${activeTab === "home" ? "active" : ""}`}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <LayoutDashboard size={17} />
              <span>Dashboard Home</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => selectPortalTab("classes")}
            className={`admin-nav-item ${activeTab === "classes" ? "active" : ""}`}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <BookOpen size={17} />
              <span>My Classes & Plan</span>
            </span>
            <span className="admin-nav-badge">
              {(progress?.completedActivityIds || []).length}/{DAILY_ACTIVITIES.length}
            </span>
          </button>

          <div className="admin-nav-section-label">Homework & AI Tutor</div>
          <button
            type="button"
            onClick={() => selectPortalTab("homework")}
            className={`admin-nav-item ${activeTab === "homework" ? "active" : ""}`}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <FileText size={17} />
              <span>Homework & Quizzes</span>
            </span>
            <span className="admin-nav-badge">{pendingHomework.length}</span>
          </button>

          <button
            type="button"
            onClick={() => selectPortalTab("ai-buddy")}
            className={`admin-nav-item ${activeTab === "ai-buddy" ? "active" : ""}`}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Mic size={17} />
              <span>Bright Buddy AI Tutor</span>
            </span>
            <span
              className="admin-nav-badge"
              style={{ background: "#10b981", color: "#ffffff" }}
            >
              VOICE
            </span>
          </button>

          <button
            type="button"
            onClick={() => selectPortalTab("progress")}
            className={`admin-nav-item ${activeTab === "progress" ? "active" : ""}`}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <TrendingUp size={17} />
              <span>My Progress</span>
            </span>
            <span className="admin-nav-badge">{readingProgress}%</span>
          </button>

          <div className="admin-nav-section-label">Results, Reports & Badges</div>
          <button
            type="button"
            onClick={() => selectPortalTab("results")}
            className={`admin-nav-item ${activeTab === "results" ? "active" : ""}`}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <CheckCircle2 size={17} />
              <span>My Results</span>
            </span>
            <span className="admin-nav-badge">{submissions.length}</span>
          </button>

          <button
            type="button"
            onClick={() => selectPortalTab("reports")}
            className={`admin-nav-item ${activeTab === "reports" ? "active" : ""}`}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Download size={17} />
              <span>PDF Report Cards</span>
            </span>
            <span className="admin-nav-badge">{reportCards.length}</span>
          </button>

          <button
            type="button"
            onClick={() => selectPortalTab("badges")}
            className={`admin-nav-item ${activeTab === "badges" ? "active" : ""}`}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Award size={17} />
              <span>Rewards & Badges</span>
            </span>
            <span className="admin-nav-badge">{badgesList.length}</span>
          </button>

          <div className="admin-nav-section-label">Family & Updates</div>
          <button
            type="button"
            onClick={() => selectPortalTab("notifications")}
            className={`admin-nav-item ${activeTab === "notifications" ? "active" : ""}`}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Bell size={17} />
              <span>Notifications</span>
            </span>
            <span className="admin-nav-badge">{notifications.length}</span>
          </button>

          <button
            type="button"
            onClick={() => selectPortalTab("parent-monitor")}
            className={`admin-nav-item ${activeTab === "parent-monitor" ? "active" : ""}`}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Users size={17} />
              <span>Parent Monitor</span>
            </span>
          </button>

          <div className="admin-nav-section-label">School Campus</div>
          {ADDITIONAL_PORTAL_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => selectPortalTab(t.id)}
              className={`admin-nav-item ${activeTab === t.id ? "active" : ""}`}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <LayoutDashboard size={17} />
                <span>{t.label}</span>
              </span>
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div
          style={{
            padding: "14px 16px 18px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "9px 12px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.08)",
              color: "#e2e8f0",
              textDecoration: "none",
              fontSize: "0.8rem",
              fontWeight: 700,
            }}
          >
            <ArrowLeft size={15} /> Back to Public Website
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "9px 12px",
              borderRadius: 10,
              background: "rgba(239, 68, 68, 0.18)",
              color: "#fca5a5",
              border: "1px solid rgba(239, 68, 68, 0.35)",
              fontSize: "0.8rem",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            <LogOut size={15} /> Sign Out of Portal
          </button>
        </div>
      </aside>

      {/* =====================================================================
          MAIN CONTENT WRAPPER + STICKY TOP NAVIGATION BAR (NAVBAR)
          ===================================================================== */}
      <div className="admin-main-wrapper">
        <header className="admin-topbar">
          {/* Left: Mobile Menu Button + Current Page Title */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="admin-mobile-menu-btn"
              aria-label="Open Navigation Menu"
            >
              <Menu size={20} />
            </button>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h1 style={{ margin: 0, fontSize: "1.12rem", fontWeight: 900, color: "#0f172a" }}>
                  {TAB_META[activeTab].title}
                </h1>
                <span
                  style={{
                    background: portalRole === "parent" ? "#fef3c7" : "#ecfdf5",
                    color: portalRole === "parent" ? "#b45309" : "#059669",
                    padding: "2px 9px",
                    borderRadius: 999,
                    fontSize: "0.68rem",
                    fontWeight: 800,
                  }}
                >
                  {portalRole === "parent" ? "PARENT MODE" : "STUDENT MODE"}
                </span>
              </div>
              <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "#64748b" }}>
                {TAB_META[activeTab].subtitle}
              </p>
            </div>
          </div>

          {/* Center/Right: Top Navbar Quick Links + Role Switcher + Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {/* Top Navbar Quick Links */}
            <nav
              aria-label="Portal Top Navigation"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                background: "#f1f5f9",
                padding: 4,
                borderRadius: 10,
                border: "1px solid #e2e8f0",
              }}
            >
              {[
                { id: "home", label: "Overview" },
                { id: "homework", label: `Homework (${pendingHomework.length})` },
                { id: "ai-buddy", label: "Bright Buddy AI" },
                { id: "reports", label: "Reports" },
              ].map((navItem) => {
                const isAct = activeTab === navItem.id;
                return (
                  <button
                    key={navItem.id}
                    type="button"
                    onClick={() => selectPortalTab(navItem.id as PortalTab)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      border: "none",
                      background: isAct ? "#0f172a" : "transparent",
                      color: isAct ? "#ffffff" : "#475569",
                      fontSize: "0.76rem",
                      fontWeight: 800,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {navItem.label}
                  </button>
                );
              })}
            </nav>

            {/* Student vs Parent Role Switcher */}
            <div
              style={{
                display: "inline-flex",
                background: "#f1f5f9",
                padding: 4,
                borderRadius: 10,
                border: "1px solid #e2e8f0",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setPortalRole("student");
                  setActiveTab("home");
                  showToast("Switched to Student Learning Dashboard", "info");
                }}
                style={{
                  padding: "6px 11px",
                  borderRadius: 7,
                  border: "none",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  background: portalRole === "student" ? "#10b981" : "transparent",
                  color: portalRole === "student" ? "#ffffff" : "#475569",
                }}
              >
                👨‍🎓 Student
              </button>
              <button
                type="button"
                onClick={() => {
                  setPortalRole("parent");
                  setActiveTab("parent-monitor");
                  showToast("Switched to Parent Progress Monitor", "info");
                }}
                style={{
                  padding: "6px 11px",
                  borderRadius: 7,
                  border: "none",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  background: portalRole === "parent" ? "#f59e0b" : "transparent",
                  color: portalRole === "parent" ? "#071527" : "#475569",
                }}
              >
                👪 Parent
              </button>
            </div>

            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => selectPortalTab("notifications")}
              title="Notifications"
              style={{
                position: "relative",
                background: "#f8fafc",
                border: "1px solid #cbd5e1",
                borderRadius: 10,
                width: 36,
                height: 36,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#0f172a",
              }}
            >
              <Bell size={16} />
              {notifications.length > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    background: "#ef4444",
                    color: "#fff",
                    fontSize: "0.62rem",
                    fontWeight: 900,
                    width: 17,
                    height: 17,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Sync Button */}
            <button
              type="button"
              onClick={() => fetchStudentLmsData(studentAccount)}
              disabled={syncingLms}
              style={{
                background: "#f8fafc",
                color: "#0f172a",
                border: "1px solid #cbd5e1",
                padding: "7px 12px",
                borderRadius: 10,
                fontSize: "0.76rem",
                fontWeight: 800,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <RefreshCw size={14} />
              <span>{syncingLms ? "Syncing..." : "Sync"}</span>
            </button>

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={handleLogout}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "#fef2f2",
                color: "#dc2626",
                border: "1px solid #fecaca",
                padding: "7px 12px",
                borderRadius: 10,
                fontWeight: 800,
                fontSize: "0.76rem",
                cursor: "pointer",
              }}
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </header>

        {/* Main Content Container */}
        <main style={{ maxWidth: 1320, width: "100%", margin: "0 auto", padding: "24px 24px 60px" }}>
          {/* ===================================================================
              1. WELCOME HERO BANNER
              =================================================================== */}
          <div
            style={{
              background: "linear-gradient(135deg, #071527 0%, #133e87 65%, #0f766e 100%)",
              color: "#ffffff",
              borderRadius: 20,
              padding: "24px 28px",
              marginBottom: 22,
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 20,
              boxShadow: "0 14px 32px rgba(7, 21, 39, 0.15)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
              {/* Student Profile Picture / Avatar */}
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    width: 74,
                    height: 74,
                    borderRadius: "50%",
                    background: currentAvatar.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2.3rem",
                    border: "3px solid #fbbf24",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
                  }}
                >
                  {currentAvatar.emoji}
                </div>
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span
                    style={{
                      background: "rgba(16, 185, 129, 0.22)",
                      color: "#6ee7b7",
                      border: "1px solid rgba(16, 185, 129, 0.35)",
                      padding: "3px 11px",
                      borderRadius: 999,
                      fontSize: "0.71rem",
                      fontWeight: 800,
                    }}
                  >
                    ID: {studentAccount.username}
                  </span>
                  <span
                    style={{
                      background: "rgba(251, 191, 36, 0.2)",
                      color: "#fde68a",
                      border: "1px solid rgba(251, 191, 36, 0.35)",
                      padding: "3px 11px",
                      borderRadius: 999,
                      fontSize: "0.71rem",
                      fontWeight: 800,
                    }}
                  >
                    {studentAccount.grade} • {currentAvatar.label}
                  </span>
                </div>

                <h2 style={{ fontSize: "1.55rem", fontWeight: 900, margin: "6px 0 4px", color: "#ffffff" }}>
                  Welcome back, {studentAccount.studentName}! 👋
                </h2>
                <p style={{ margin: 0, color: "#e2e8f0", fontSize: "0.86rem" }}>
                  Enrolled Course: <strong style={{ color: "#fbbf24" }}>{studentAccount.courseName}</strong> • Parent/Guardian: {studentAccount.parentName}
                </p>

                {/* Quick Avatar Switcher */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
                  <span style={{ fontSize: "0.72rem", color: "#cbd5e1", fontWeight: 700 }}>
                    Choose Avatar:
                  </span>
                  {DEFAULT_AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => handleSelectAvatar(av.id)}
                      title={av.label}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        border:
                          currentAvatar.id === av.id
                            ? "2px solid #fbbf24"
                            : "1px solid rgba(255,255,255,0.2)",
                        background: av.bg,
                        cursor: "pointer",
                        fontSize: "0.95rem",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {av.emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => selectPortalTab("ai-buddy")}
                style={{
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "#ffffff",
                  border: "none",
                  padding: "11px 18px",
                  borderRadius: 12,
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 8px 20px rgba(16, 185, 129, 0.3)",
                }}
              >
                <Mic size={17} />
                <span>Open Bright Buddy AI</span>
              </button>

              <a
                href={
                  studentAccount.classLink ||
                  `https://wa.me/2348063202616?text=Hi%20Bright%20Path!%20Student%20${encodeURIComponent(
                    studentAccount.studentName
                  )}%20(${encodeURIComponent(studentAccount.username)})%20is%20ready%20for%20the%20live%201:1%20session.`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary shining"
                style={{ padding: "11px 18px", borderRadius: 12, fontSize: "0.85rem" }}
              >
                <Video size={17} />
                <span>Join 1:1 Live Class</span>
              </a>
            </div>
          </div>

          {/* ===================================================================
              DASHBOARD STATISTICS (7 Professional KPI Cards)
              =================================================================== */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
              gap: 14,
              marginBottom: 24,
            }}
          >
            {[
              {
                label: "Total Lessons Completed",
                value: `${lessonsCompleted} / ${progress?.totalLessons || 24}`,
                sub: "1-on-1 Live & AI Modules",
                color: "#1d4ed8",
                bg: "#eff6ff",
                border: "#bfdbfe",
              },
              {
                label: "Homework Completion",
                value: `${hwCompletionRate}%`,
                sub: `${submissions.length} of ${assignments.length} Submitted`,
                color: "#059669",
                bg: "#ecfdf5",
                border: "#a7f3d0",
              },
              {
                label: "Average Assessment Score",
                value: `${avgAssessmentScore}%`,
                sub: "Auto & Teacher Graded",
                color: "#7c3aed",
                bg: "#f5f3ff",
                border: "#ddd6fe",
              },
              {
                label: "Reading Progress",
                value: `${readingProgress}%`,
                sub: "Phonics & Pronunciation",
                color: "#0284c7",
                bg: "#e0f2fe",
                border: "#bae6fd",
              },
              {
                label: "Attendance Rate",
                value: `${attendanceRate}%`,
                sub: "1:1 Live Classroom",
                color: "#047857",
                bg: "#d1fae5",
                border: "#6ee7b7",
              },
              {
                label: "Learning Hours",
                value: `${learningHours} hrs`,
                sub: "Active Study Time",
                color: "#d97706",
                bg: "#fef3c7",
                border: "#fde68a",
              },
              {
                label: "Badges Earned",
                value: `${badgesList.length}`,
                sub: "Academic Rewards",
                color: "#e11d48",
                bg: "#ffe4e6",
                border: "#fecdd3",
              },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="admin-kpi-card"
                style={{
                  padding: "16px 18px",
                  flexDirection: "column",
                  gap: 6,
                  borderTop: `3px solid ${stat.color}`,
                }}
              >
                <div
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 800,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  {stat.label}
                </div>
                <div
                  style={{
                    fontSize: "1.6rem",
                    fontWeight: 900,
                    color: stat.color,
                    lineHeight: 1.15,
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    display: "inline-block",
                    background: stat.bg,
                    color: stat.color,
                    border: `1px solid ${stat.border}`,
                    fontSize: "0.69rem",
                    fontWeight: 800,
                    padding: "2px 9px",
                    borderRadius: 999,
                    width: "fit-content",
                  }}
                >
                  {stat.sub}
                </div>
              </div>
            ))}
          </div>

        {/* ===================================================================
            TAB: HOME OVERVIEW (Shows all 10 Dashboard Components in one view)
            =================================================================== */}
        {activeTab === "home" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {/* Row 1: My Classes + Today's Learning */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                gap: 20,
              }}
            >
              {/* Component: My Classes */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: 18,
                  padding: 22,
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 14,
                  }}
                >
                  <h2 style={{ margin: 0, fontSize: "1.08rem", fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
                    <BookOpen size={20} color="#059669" /> My Enrolled Classes
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab("classes")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#1d4ed8",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      cursor: "pointer",
                    }}
                  >
                    View Details →
                  </button>
                </div>

                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #cbd5e1",
                    borderRadius: 14,
                    padding: 16,
                    marginBottom: 12,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span
                      style={{
                        background: "#ecfdf5",
                        color: "#059669",
                        fontSize: "0.72rem",
                        fontWeight: 800,
                        padding: "3px 10px",
                        borderRadius: 999,
                      }}
                    >
                      PRIMARY 1:1 LIVE COURSE
                    </span>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569" }}>
                      {studentAccount.grade}
                    </span>
                  </div>
                  <h3 style={{ margin: "8px 0 4px", fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
                    {studentAccount.courseName}
                  </h3>
                  <p style={{ margin: "0 0 10px", fontSize: "0.82rem", color: "#64748b" }}>
                    Schedule: <strong>{studentAccount.scheduleSlot || "Flexible 1:1 Slot"}</strong>
                  </p>
                  <div style={{ background: "#e2e8f0", height: 8, borderRadius: 999, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${Math.min(100, Math.round((lessonsCompleted / 24) * 100))}%`,
                        background: "linear-gradient(90deg, #10b981, #3b82f6)",
                        height: "100%",
                      }}
                    />
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#475569", marginTop: 6, fontWeight: 600 }}>
                    {lessonsCompleted} of 24 Personalized Modules Completed
                  </div>
                </div>

                <div
                  style={{
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    borderRadius: 12,
                    padding: "12px 14px",
                    fontSize: "0.82rem",
                    color: "#1e3a8a",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>🤖 Complimentary AI Reading, Speech & Writing Lab</span>
                  <span style={{ fontWeight: 800 }}>Included</span>
                </div>
              </div>

              {/* Component: Today's Learning */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: 18,
                  padding: 22,
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 14,
                  }}
                >
                  <h2 style={{ margin: 0, fontSize: "1.08rem", fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckSquare size={20} color="#f59e0b" /> Today&#39;s Learning Activities
                  </h2>
                  <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "#059669" }}>
                    {(progress?.completedActivityIds || []).length}/{DAILY_ACTIVITIES.length} Done
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {DAILY_ACTIVITIES.slice(0, 4).map((act) => {
                    const isDone = (progress?.completedActivityIds || []).includes(act.id);
                    return (
                      <div
                        key={act.id}
                        onClick={() => handleToggleActivity(act.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 10,
                          padding: "10px 12px",
                          borderRadius: 12,
                          border: isDone ? "1px solid #a7f3d0" : "1px solid #e2e8f0",
                          background: isDone ? "#ecfdf5" : "#f8fafc",
                          cursor: "pointer",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <input
                            type="checkbox"
                            checked={isDone}
                            onChange={() => {}}
                            style={{ width: 17, height: 17, accentColor: "#10b981", cursor: "pointer" }}
                          />
                          <div>
                            <div
                              style={{
                                fontSize: "0.85rem",
                                fontWeight: 700,
                                color: "#0f172a",
                                textDecoration: isDone ? "line-through" : "none",
                              }}
                            >
                              {act.title}
                            </div>
                            <div style={{ fontSize: "0.73rem", color: "#64748b" }}>
                              {act.category} • {act.duration}
                            </div>
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: 800,
                            padding: "3px 8px",
                            borderRadius: 999,
                            background: isDone ? "#10b981" : "#e2e8f0",
                            color: isDone ? "#ffffff" : "#475569",
                          }}
                        >
                          {isDone ? "Done ✓" : "Start"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Row 2: Homework Summary + AI Learning Buddy Quick Launch */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                gap: 20,
              }}
            >
              {/* Component: Homework (Pending, Submitted & Graded) */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: 18,
                  padding: 22,
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 14,
                  }}
                >
                  <h2 style={{ margin: 0, fontSize: "1.08rem", fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
                    <FileText size={20} color="#7c3aed" /> Homework Center
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab("homework")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#1d4ed8",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      cursor: "pointer",
                    }}
                  >
                    Open All Homework →
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 14 }}>
                  <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: 10, textAlign: "center" }}>
                    <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#d97706" }}>{pendingHomework.length}</div>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#92400e" }}>Pending</div>
                  </div>
                  <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: 10, textAlign: "center" }}>
                    <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#1d4ed8" }}>{submittedHomework.length}</div>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#1e40af" }}>Submitted</div>
                  </div>
                  <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 12, padding: 10, textAlign: "center" }}>
                    <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#059669" }}>{gradedHomework.length}</div>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#065f46" }}>Graded</div>
                  </div>
                </div>

                {assignments.slice(0, 2).map((hw) => {
                  const sub = submissions.find((s) => s.homeworkId === hw.id);
                  return (
                    <div
                      key={hw.id}
                      style={{
                        padding: "12px 14px",
                        borderRadius: 12,
                        border: "1px solid #e2e8f0",
                        marginBottom: 8,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, fontSize: "0.86rem", color: "#0f172a" }}>{hw.title}</div>
                        <div style={{ fontSize: "0.74rem", color: "#64748b" }}>
                          {hw.courseName} • Due: {hw.dueDate}
                        </div>
                      </div>
                      {sub ? (
                        <span
                          style={{
                            background: "#ecfdf5",
                            color: "#059669",
                            padding: "4px 10px",
                            borderRadius: 999,
                            fontSize: "0.74rem",
                            fontWeight: 800,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {sub.percentage}% ({sub.status})
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveHomework(hw);
                            setHwAnswers({});
                            setActiveTab("homework");
                          }}
                          style={{
                            background: "#7c3aed",
                            color: "#ffffff",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: 8,
                            fontSize: "0.76rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Start Quiz →
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Component: AI Learning Buddy Card */}
              <div
                style={{
                  background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
                  color: "#ffffff",
                  borderRadius: 18,
                  padding: 22,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <span
                    style={{
                      display: "inline-block",
                      background: "rgba(52, 211, 153, 0.2)",
                      color: "#34d399",
                      padding: "4px 10px",
                      borderRadius: 999,
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      marginBottom: 10,
                    }}
                  >
                    🎙️ BRIGHT BUDDY • VOICE AI COMPANION
                  </span>
                  <h2 style={{ margin: "0 0 8px", fontSize: "1.2rem", fontWeight: 800, color: "#ffffff" }}>
                    Bright Buddy — Reading, Writing, Speaking & Math
                  </h2>
                  <p style={{ margin: "0 0 16px", fontSize: "0.84rem", color: "#cbd5e1", lineHeight: 1.55 }}>
                    Say “Bright Buddy, I want to read a story!” Your patient AI learning companion listens to you read sentence-by-sentence, teaches phonics & letter tracing, builds SuperSpeakers confidence, and explains math step-by-step.
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { mode: "reading", label: "📖 1. AI Reading Buddy" },
                    { mode: "writing", label: "✍️ 2. AI Writing & Tracing" },
                    { mode: "speaking", label: "🎙️ 3. SuperSpeakers AI" },
                    { mode: "math", label: "🧮 4. AI Mathematics" },
                  ].map((item) => (
                    <button
                      key={item.mode}
                      type="button"
                      onClick={() => {
                        setAiMode(item.mode as BrightBuddyMode);
                        setActiveTab("ai-buddy");
                      }}
                      style={{
                        background: "rgba(255,255,255,0.12)",
                        color: "#ffffff",
                        border: "1px solid rgba(255,255,255,0.2)",
                        padding: "10px 12px",
                        borderRadius: 10,
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 3: My Progress + My Results & My Reports */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                gap: 20,
              }}
            >
              {/* Component: My Progress & Areas Needing Improvement */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: 18,
                  padding: 22,
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h2 style={{ margin: 0, fontSize: "1.08rem", fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
                    <TrendingUp size={20} color="#0284c7" /> My Progress & Focus Areas
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab("progress")}
                    style={{ background: "none", border: "none", color: "#1d4ed8", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}
                  >
                    Full Analysis →
                  </button>
                </div>

                <div
                  style={{
                    background: "#ecfdf5",
                    border: "1px solid #a7f3d0",
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 10,
                    fontSize: "0.82rem",
                  }}
                >
                  <div style={{ fontWeight: 800, color: "#065f46", marginBottom: 4 }}>
                    ✅ Key Academic Strengths:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, color: "#064e3b" }}>
                    {(progress?.customStrengths || []).slice(0, 2).map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div
                  style={{
                    background: "#fffbeb",
                    border: "1px solid #fde68a",
                    borderRadius: 12,
                    padding: 12,
                    fontSize: "0.82rem",
                  }}
                >
                  <div style={{ fontWeight: 800, color: "#92400e", marginBottom: 4 }}>
                    🎯 Identified Areas Needing Improvement:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, color: "#78350f" }}>
                    {(progress?.customImprovements || []).slice(0, 3).map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Component: My Results & My Reports */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: 18,
                  padding: 22,
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h2 style={{ margin: 0, fontSize: "1.08rem", fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
                    <Award size={20} color="#10b981" /> My Results & PDF Reports
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab("reports")}
                    style={{ background: "none", border: "none", color: "#1d4ed8", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}
                  >
                    View Reports ({reportCards.length}) →
                  </button>
                </div>

                {submissions.length > 0 ? (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: "0.76rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: 6 }}>
                      Latest Graded Homework Result
                    </div>
                    <div
                      style={{
                        padding: 12,
                        borderRadius: 12,
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "0.88rem" }}>
                        <span>{submissions[0].homeworkTitle}</span>
                        <span style={{ color: "#059669" }}>{submissions[0].percentage}%</span>
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#475569", marginTop: 4 }}>
                        Teacher Feedback: &ldquo;{submissions[0].teacherFeedback}&rdquo;
                      </div>
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: "0.82rem", color: "#64748b", marginBottom: 14 }}>
                    Complete your first online homework quiz to see instant auto-graded scores and teacher feedback here!
                  </p>
                )}

                {reportCards.length > 0 ? (
                  <div
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      background: "#eff6ff",
                      border: "1px solid #bfdbfe",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "0.85rem", color: "#1e3a8a" }}>
                        Report Card #{reportCards[0].reportRef} ({reportCards[0].overallGrade})
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#1d4ed8" }}>
                        {reportCards[0].termPeriod}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => downloadReportCardPdf(reportCards[0])}
                      style={{
                        background: "#1d4ed8",
                        color: "#ffffff",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: 8,
                        fontSize: "0.76rem",
                        fontWeight: 800,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Download size={14} /> PDF
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      background: "#f8fafc",
                      border: "1px dashed #cbd5e1",
                      fontSize: "0.8rem",
                      color: "#64748b",
                    }}
                  >
                    📄 Official PDF Report Cards issued by your teacher will appear here for instant download.
                  </div>
                )}
              </div>
            </div>

            {/* Row 4: Rewards & Badges + Notifications */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                gap: 20,
              }}
            >
              {/* Component: Rewards & Badges */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: 18,
                  padding: 22,
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <h2 style={{ margin: 0, fontSize: "1.08rem", fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
                    <Star size={20} color="#f59e0b" /> Rewards & Badges ({badgesList.length})
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab("badges")}
                    style={{ background: "none", border: "none", color: "#1d4ed8", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}
                  >
                    All Badges →
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
                  {badgesList.slice(0, 4).map((b) => (
                    <div
                      key={b.id}
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: 12,
                        padding: 12,
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: "1.8rem", marginBottom: 4 }}>{b.icon}</div>
                      <div style={{ fontWeight: 800, fontSize: "0.82rem", color: "#0f172a" }}>{b.title}</div>
                      <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: 2 }}>{b.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Component: Notifications */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: 18,
                  padding: 22,
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <h2 style={{ margin: 0, fontSize: "1.08rem", fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
                    <Bell size={20} color="#e11d48" /> Announcements & Reminders
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab("notifications")}
                    style={{ background: "none", border: "none", color: "#1d4ed8", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}
                  >
                    View All →
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {notifications.slice(0, 3).map((n) => (
                    <div
                      key={n.id}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 12,
                        background: "#f8fafc",
                        borderLeft: "4px solid #3b82f6",
                        fontSize: "0.82rem",
                      }}
                    >
                      <div style={{ fontWeight: 800, color: "#0f172a" }}>{n.title}</div>
                      <div style={{ color: "#475569", fontSize: "0.78rem", marginTop: 2 }}>{n.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB: MY CLASSES & TODAY'S LEARNING
            =================================================================== */}
        {activeTab === "classes" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 22 }}>
            <div style={{ background: "#ffffff", borderRadius: 18, padding: 24, border: "1px solid #e2e8f0" }}>
              <h2 style={{ margin: "0 0 14px", fontSize: "1.2rem", fontWeight: 800 }}>
                📚 My Enrolled Courses
              </h2>
              <div
                style={{
                  background: "linear-gradient(135deg, #0a1931 0%, #133e87 100%)",
                  color: "#ffffff",
                  borderRadius: 16,
                  padding: 22,
                  marginBottom: 16,
                }}
              >
                <span style={{ background: "#10b981", color: "#fff", padding: "3px 10px", borderRadius: 999, fontSize: "0.72rem", fontWeight: 800 }}>
                  ACTIVE 1-ON-1 PROGRAM
                </span>
                <h3 style={{ margin: "10px 0 6px", fontSize: "1.3rem", fontWeight: 800, color: "#fff" }}>
                  {studentAccount.courseName}
                </h3>
                <p style={{ margin: "0 0 14px", fontSize: "0.86rem", color: "#cbd5e1" }}>
                  Grade Level: {studentAccount.grade} • Scheduled Slot: {studentAccount.scheduleSlot || "Flexible 1:1 Slot"}
                </p>
                <a
                  href={
                    studentAccount.classLink ||
                    `https://wa.me/2348063202616?text=Hi%20Bright%20Path!%20Student%20${encodeURIComponent(
                      studentAccount.studentName
                    )}%20is%20ready%20for%20class.`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary shining"
                  style={{ padding: "10px 18px", fontSize: "0.85rem" }}
                >
                  <Video size={16} /> Join Live Classroom
                </a>
              </div>

              <div style={{ fontSize: "0.85rem", color: "#475569", lineHeight: 1.6 }}>
                <strong>Included Learning Modules:</strong>
                <ul style={{ paddingLeft: 20, marginTop: 6 }}>
                  <li>1-on-1 Live Personalized Video Sessions with Certified Educator</li>
                  <li>Interactive Weekly Homework & Auto-Graded Assessments</li>
                  <li>24/7 Voice-Enabled AI Reading, Pronunciation & Writing Buddy</li>
                  <li>Downloadable Termly PDF Report Cards for Parents</li>
                </ul>
              </div>
            </div>

            <div style={{ background: "#ffffff", borderRadius: 18, padding: 24, border: "1px solid #e2e8f0" }}>
              <h2 style={{ margin: "0 0 6px", fontSize: "1.2rem", fontWeight: 800 }}>
                ☀️ Today&#39;s Learning Checklist
              </h2>
              <p style={{ margin: "0 0 16px", fontSize: "0.84rem", color: "#64748b" }}>
                Click any activity below to mark it completed and add to your learning hours!
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {DAILY_ACTIVITIES.map((act) => {
                  const isDone = (progress?.completedActivityIds || []).includes(act.id);
                  return (
                    <div
                      key={act.id}
                      onClick={() => handleToggleActivity(act.id)}
                      style={{
                        padding: "14px 16px",
                        borderRadius: 14,
                        border: isDone ? "2px solid #10b981" : "1px solid #cbd5e1",
                        background: isDone ? "#ecfdf5" : "#ffffff",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, fontSize: "0.92rem", color: "#0f172a" }}>
                          {isDone ? "✅ " : "⬜ "} {act.title}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "#475569", marginTop: 4 }}>
                          {act.description}
                        </div>
                      </div>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: 999,
                          background: isDone ? "#10b981" : "#f1f5f9",
                          color: isDone ? "#fff" : "#334155",
                          fontSize: "0.74rem",
                          fontWeight: 800,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {act.duration}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB: HOMEWORK (Module B: Complete Homework Online, Canvas, Audio & Auto/Teacher Grades)
            =================================================================== */}
        {activeTab === "homework" && (
          <StudentHomeworkModule
            assignments={assignments}
            submissions={submissions}
            studentUsername={studentAccount.username}
            studentName={studentAccount.studentName}
            parentEmail={studentAccount.email}
            grade={studentAccount.grade}
            onRefreshData={() => fetchStudentLmsData(studentAccount)}
            showToast={showToast}
          />
        )}

        {/* ===================================================================
            TAB: BRIGHT BUDDY – AI VOICE LEARNING COMPANION
            (1. Reading, 2. Writing, 3. Speaking, 4. Mathematics, 5. Assessment)
            =================================================================== */}
        {activeTab === "ai-buddy" && (
          <BrightBuddyModule
            studentUsername={studentAccount.username}
            studentName={studentAccount.studentName}
            aiLogs={aiLogs}
            initialMode={aiMode}
            onSessionSaved={() => fetchStudentLmsData(studentAccount)}
            showToast={showToast}
          />
        )}

        {/* ===================================================================
            TAB: MY PROGRESS (Module D: Dedicated Student Progress Tracking)
            =================================================================== */}
        {activeTab === "progress" && (
          <StudentProgressModule
            studentName={studentAccount.studentName}
            studentUsername={studentAccount.username}
            grade={studentAccount.grade || "All Grades"}
            courseName={studentAccount.courseName || "English Phonics & Reading"}
            progress={progress}
            submissions={submissions}
            aiLogs={aiLogs}
          />
        )}

        {/* ===================================================================
            TAB: MY RESULTS (Scores & Teacher Feedback)
            =================================================================== */}
        {activeTab === "results" && (
          <div style={{ background: "#ffffff", borderRadius: 18, padding: 24, border: "1px solid #e2e8f0" }}>
            <h2 style={{ margin: "0 0 6px", fontSize: "1.2rem", fontWeight: 800 }}>
              🎯 My Assessment Results & Teacher Feedback
            </h2>
            <p style={{ margin: "0 0 18px", fontSize: "0.85rem", color: "#64748b" }}>
              View your auto-graded objective scores, manual teacher grades, and personalized remarks.
            </p>

            {submissions.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "#64748b" }}>
                No homework results yet. Complete an assignment in the <strong>Homework</strong> tab!
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    style={{
                      padding: 18,
                      borderRadius: 14,
                      border: "1px solid #e2e8f0",
                      background: "#f8fafc",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                      <div>
                        <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "#7c3aed" }}>
                          {sub.courseName}
                        </span>
                        <h3 style={{ margin: "2px 0", fontSize: "1.05rem", fontWeight: 800 }}>
                          {sub.homeworkTitle}
                        </h3>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "1.35rem", fontWeight: 900, color: "#059669" }}>
                          {sub.totalScore}/{sub.maxPoints} ({sub.percentage}%)
                        </div>
                        <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b" }}>
                          Objective Auto-Score: {sub.objectiveScore} pts • Status: {sub.status.toUpperCase()}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: 12,
                        padding: 12,
                        background: "#ffffff",
                        borderRadius: 10,
                        borderLeft: "4px solid #10b981",
                        fontSize: "0.85rem",
                      }}
                    >
                      <strong>Teacher Feedback:</strong> {sub.teacherFeedback}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            TAB: MY REPORTS (View, Print & Download Official Branded PDF Reports)
            =================================================================== */}
        {activeTab === "reports" && (() => {
          const publishedReports = reportCards.filter((rc) => rc.published !== false);
          const availableTerms = Array.from(
            new Set(publishedReports.map((rc) => rc.termPeriod).filter(Boolean))
          );
          const filteredReports =
            selectedReportTermFilter === "ALL"
              ? publishedReports
              : publishedReports.filter((rc) => rc.termPeriod === selectedReportTermFilter);
          const activePreviewReport =
            filteredReports.find((rc) => rc.id === viewingReportCardId) ||
            filteredReports[0] ||
            null;

          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Top Header & Term Filter Bar (View Current & Previous Terms' Reports) */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: 18,
                  padding: 24,
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 14,
                }}
              >
                <div>
                  <h2 style={{ margin: "0 0 4px", fontSize: "1.22rem", fontWeight: 900, color: "#0f172a" }}>
                    📄 Academic Reports & Branded PDF Downloads
                  </h2>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
                    View your official termly academic report cards, browse previous terms, print reports, or download branded PDFs.
                  </p>
                </div>

                {/* Term Filter for Viewing Previous Terms' Reports */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#475569" }}>
                    Academic Term:
                  </span>
                  <select
                    value={selectedReportTermFilter}
                    onChange={(e) => {
                      setSelectedReportTermFilter(e.target.value);
                      setViewingReportCardId(null);
                    }}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 10,
                      border: "1px solid #cbd5e1",
                      background: "#f8fafc",
                      fontSize: "0.82rem",
                      fontWeight: 800,
                      color: "#0f172a",
                    }}
                  >
                    <option value="ALL">All Academic Terms ({publishedReports.length})</option>
                    {availableTerms.map((term) => (
                      <option key={term} value={term}>
                        {term}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {filteredReports.length === 0 ? (
                <div
                  style={{
                    padding: "36px 24px",
                    borderRadius: 18,
                    background: "#ffffff",
                    border: "1px dashed #cbd5e1",
                    textAlign: "center",
                  }}
                >
                  <p style={{ fontWeight: 800, fontSize: "1rem", color: "#0f172a", marginBottom: 6 }}>
                    No published report cards yet for {studentAccount.studentName}.
                  </p>
                  <p style={{ fontSize: "0.84rem", color: "#64748b", marginBottom: 16 }}>
                    You can still preview, print, or download a live progress report card below while your teacher prepares the official term report.
                  </p>
                  <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() =>
                        downloadReportCardPdf(
                          {
                            id: "sample-rc",
                            reportRef: "BPRC-LIVE",
                            studentUsername: studentAccount.username,
                            studentName: studentAccount.studentName,
                            parentName: studentAccount.parentName,
                            parentEmail: studentAccount.email || "",
                            grade: studentAccount.grade,
                            courseName: studentAccount.courseName,
                            termPeriod: "First Term • 2026",
                            dateRangeStart: new Date(Date.now() - 45 * 86400000)
                              .toISOString()
                              .split("T")[0],
                            dateRangeEnd: new Date().toISOString().split("T")[0],
                            attendanceRate,
                            lessonsCompleted,
                            learningHours,
                            homeworkCompletionRate: hwCompletionRate,
                            overallScore: avgAssessmentScore,
                            overallGrade: avgAssessmentScore >= 90 ? "A+" : "A",
                            readingProgress,
                            subjectScores: [
                              {
                                subject: "English Phonics & Reading Fluency",
                                score: readingProgress,
                                grade: "A",
                                remark: "Consistent progress in phonemic decoding and reading aloud",
                              },
                              {
                                subject: "Word Pronunciation & Public Speaking",
                                score: 88,
                                grade: "A",
                                remark: "Clear articulation and growing confidence",
                              },
                              {
                                subject: "Creative Writing & Grammar",
                                score: 84,
                                grade: "A",
                                remark: "Good sentence formation and punctuation",
                              },
                            ],
                            strengths: progress?.customStrengths || [
                              "Enthusiastic learner in 1-on-1 classes",
                            ],
                            areasForImprovement: progress?.customImprovements || [
                              "Continue daily 10-minute reading aloud practice",
                            ],
                            recommendations: progress?.improvementRecommendations || [
                              "Practise daily reading aloud with Bright Buddy for 15 minutes",
                            ],
                            teacherName: "Bright Path Class Educator",
                            teacherComment: `${studentAccount.studentName} is making commendable progress in ${studentAccount.courseName}.`,
                            adminName: "Bright Path Academic Director",
                            schoolRemarks: `${studentAccount.studentName} demonstrates strong curiosity and commitment to learning.`,
                            issuedBy: "Bright Path Academic Director",
                            createdAt: new Date().toISOString(),
                          },
                          "download"
                        )
                      }
                      className="btn btn-primary"
                      style={{ padding: "10px 18px", fontSize: "0.85rem" }}
                    >
                      <Download size={16} /> Download Live Progress Report (PDF)
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* List of Available & Previous Term Reports */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {filteredReports.map((rc) => {
                      const isSelected = activePreviewReport?.id === rc.id;
                      return (
                        <div
                          key={rc.id}
                          style={{
                            padding: 20,
                            borderRadius: 16,
                            border: isSelected ? "2px solid #1d4ed8" : "1px solid #cbd5e1",
                            background: isSelected ? "#eff6ff" : "#ffffff",
                            display: "flex",
                            flexWrap: "wrap",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 16,
                          }}
                        >
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                              <span
                                style={{
                                  background: "#1e3a8a",
                                  color: "#ffffff",
                                  padding: "3px 10px",
                                  borderRadius: 999,
                                  fontSize: "0.72rem",
                                  fontWeight: 800,
                                }}
                              >
                                REF #{rc.reportRef} • {rc.termPeriod}
                              </span>
                              {rc.dateRangeStart && rc.dateRangeEnd && (
                                <span
                                  style={{
                                    background: "#f1f5f9",
                                    color: "#475569",
                                    padding: "3px 10px",
                                    borderRadius: 999,
                                    fontSize: "0.72rem",
                                    fontWeight: 700,
                                  }}
                                >
                                  📅 {rc.dateRangeStart} to {rc.dateRangeEnd}
                                </span>
                              )}
                              <span
                                style={{
                                  background: "#dcfce7",
                                  color: "#15803d",
                                  padding: "3px 10px",
                                  borderRadius: 999,
                                  fontSize: "0.72rem",
                                  fontWeight: 800,
                                }}
                              >
                                Overall Grade: {rc.overallGrade} ({rc.overallScore}%)
                              </span>
                            </div>
                            <h3 style={{ margin: "6px 0 4px", fontSize: "1.08rem", fontWeight: 900, color: "#0f172a" }}>
                              {rc.studentName} — {rc.grade} ({rc.courseName})
                            </h3>
                            <p style={{ margin: 0, fontSize: "0.83rem", color: "#475569" }}>
                              Teacher ({rc.teacherName || "Bright Path Educator"}): &ldquo;{rc.teacherComment}&rdquo;
                            </p>
                          </div>

                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <button
                              type="button"
                              onClick={() => setViewingReportCardId(rc.id)}
                              style={{
                                background: isSelected ? "#1d4ed8" : "#ffffff",
                                color: isSelected ? "#ffffff" : "#1d4ed8",
                                border: "1px solid #1d4ed8",
                                padding: "9px 14px",
                                borderRadius: 9,
                                fontSize: "0.8rem",
                                fontWeight: 800,
                                cursor: "pointer",
                              }}
                            >
                              👁️ {isSelected ? "Viewing Below" : "View Report"}
                            </button>
                            <button
                              type="button"
                              onClick={() => downloadReportCardPdf(rc, "print")}
                              style={{
                                background: "#f8fafc",
                                color: "#0f172a",
                                border: "1px solid #cbd5e1",
                                padding: "9px 14px",
                                borderRadius: 9,
                                fontSize: "0.8rem",
                                fontWeight: 800,
                                cursor: "pointer",
                              }}
                            >
                              🖨️ Print Report
                            </button>
                            <button
                              type="button"
                              onClick={() => downloadReportCardPdf(rc, "download")}
                              className="btn btn-primary shining"
                              style={{ padding: "9px 16px", fontSize: "0.82rem" }}
                            >
                              <Download size={15} /> Download PDF
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Inline Branded Report Card Preview Sheet */}
                  {activePreviewReport && (
                    <div
                      style={{
                        background: "#ffffff",
                        borderRadius: 18,
                        border: "2px solid #0a1931",
                        overflow: "hidden",
                        boxShadow: "0 12px 32px rgba(15, 23, 42, 0.08)",
                      }}
                    >
                      {/* Branded Header with Logo */}
                      <div
                        style={{
                          background: "linear-gradient(135deg, #071527 0%, #133e87 100%)",
                          color: "#ffffff",
                          padding: "22px 26px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 14,
                          borderBottom: "4px solid #f59e0b",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                          <Image
                            src="/logo.png"
                            alt="Bright Path Learning Hub Logo"
                            width={60}
                            height={60}
                            style={{
                              borderRadius: "50%",
                              background: "#ffffff",
                              padding: 4,
                              border: "2px solid #fbbf24",
                              objectFit: "contain",
                            }}
                          />
                          <div>
                            <div
                              style={{
                                display: "inline-block",
                                background: "rgba(251, 191, 36, 0.2)",
                                color: "#fbbf24",
                                padding: "3px 10px",
                                borderRadius: 999,
                                fontSize: "0.68rem",
                                fontWeight: 800,
                                marginBottom: 4,
                              }}
                            >
                              OFFICIAL ACADEMIC REPORT CARD • GOVT. REG. NO. 9840276
                            </div>
                            <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 900 }}>
                              Bright Path Learning Hub
                            </h3>
                            <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "#cbd5e1" }}>
                              1-on-1 Personalized Live Learning & AI Companion Portal
                            </p>
                          </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "0.7rem", color: "#fbbf24", fontWeight: 800 }}>
                            REPORT REF #{activePreviewReport.reportRef}
                          </div>
                          <div style={{ fontSize: "1rem", fontWeight: 900 }}>
                            {activePreviewReport.termPeriod}
                          </div>
                          <div style={{ fontSize: "0.74rem", color: "#cbd5e1" }}>
                            Issued: {new Date(activePreviewReport.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div style={{ padding: 24 }}>
                        {/* Student, Class, Term, Date Range & Teacher Metadata */}
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))",
                            gap: 12,
                            background: "#f8fafc",
                            border: "1px solid #cbd5e1",
                            borderRadius: 12,
                            padding: 16,
                            marginBottom: 18,
                            fontSize: "0.82rem",
                          }}
                        >
                          <div>
                            <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>
                              Student Name
                            </div>
                            <div style={{ fontWeight: 900, color: "#0f172a" }}>
                              {activePreviewReport.studentName}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>
                              Class / Program
                            </div>
                            <div style={{ fontWeight: 900, color: "#059669" }}>
                              {activePreviewReport.grade} • {activePreviewReport.courseName}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>
                              Academic Term & Date Range
                            </div>
                            <div style={{ fontWeight: 800, color: "#0f172a" }}>
                              {activePreviewReport.termPeriod}
                              {activePreviewReport.dateRangeStart && activePreviewReport.dateRangeEnd
                                ? ` (${activePreviewReport.dateRangeStart} – ${activePreviewReport.dateRangeEnd})`
                                : ""}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>
                              Class Teacher
                            </div>
                            <div style={{ fontWeight: 800, color: "#0f172a" }}>
                              {activePreviewReport.teacherName || "Bright Path Class Educator"}
                            </div>
                          </div>
                        </div>

                        {/* Subject Evaluations Table */}
                        <div style={{ overflowX: "auto", marginBottom: 16 }}>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem" }}>
                            <thead>
                              <tr style={{ background: "#0a1931", color: "#ffffff", textAlign: "left" }}>
                                <th style={{ padding: "10px 12px" }}>Subject / Competency</th>
                                <th style={{ padding: "10px 12px" }}>Score</th>
                                <th style={{ padding: "10px 12px" }}>Grade</th>
                                <th style={{ padding: "10px 12px" }}>Teacher Assessment Remark</th>
                              </tr>
                            </thead>
                            <tbody>
                              {activePreviewReport.subjectScores.map((s, idx) => (
                                <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                                  <td style={{ padding: "10px 12px", fontWeight: 800 }}>{s.subject}</td>
                                  <td style={{ padding: "10px 12px", fontWeight: 900, color: "#059669" }}>
                                    {s.score}%
                                  </td>
                                  <td style={{ padding: "10px 12px" }}>
                                    <span
                                      style={{
                                        background: "#eff6ff",
                                        color: "#1d4ed8",
                                        padding: "2px 9px",
                                        borderRadius: 999,
                                        fontWeight: 800,
                                        fontSize: "0.75rem",
                                      }}
                                    >
                                      {s.grade}
                                    </span>
                                  </td>
                                  <td style={{ padding: "10px 12px", color: "#475569" }}>{s.remark}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Grading Scale Key */}
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 8,
                            background: "#f8fafc",
                            padding: "10px 14px",
                            borderRadius: 10,
                            border: "1px solid #e2e8f0",
                            fontSize: "0.74rem",
                            fontWeight: 700,
                            marginBottom: 18,
                          }}
                        >
                          <strong>Grading Information:</strong>
                          <span style={{ color: "#047857" }}>A+ (90–100% Distinction)</span> •
                          <span style={{ color: "#059669" }}>A (80–89% Excellent)</span> •
                          <span style={{ color: "#1d4ed8" }}>B+ (70–79% Very Good)</span> •
                          <span style={{ color: "#4338ca" }}>B (60–69% Good)</span> •
                          <span style={{ color: "#b45309" }}>C (50–59% Developing)</span> •
                          <span style={{ color: "#dc2626" }}>D (&lt;50% Needs Support)</span>
                        </div>

                        {/* Teacher & School Administrator Remarks */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
                          <div
                            style={{
                              background: "#f8fafc",
                              borderLeft: "4px solid #133e87",
                              padding: 14,
                              borderRadius: 10,
                              fontSize: "0.84rem",
                            }}
                          >
                            <div style={{ fontWeight: 900, color: "#0f172a", marginBottom: 4 }}>
                              👩‍🏫 Teacher&#39;s Comment ({activePreviewReport.teacherName || "Bright Path Educator"}):
                            </div>
                            <div style={{ color: "#334155" }}>{activePreviewReport.teacherComment}</div>
                          </div>

                          <div
                            style={{
                              background: "#fefce8",
                              borderLeft: "4px solid #d97706",
                              padding: 14,
                              borderRadius: 10,
                              fontSize: "0.84rem",
                            }}
                          >
                            <div style={{ fontWeight: 900, color: "#92400e", marginBottom: 4 }}>
                              🏛️ School Remarks ({activePreviewReport.adminName || activePreviewReport.issuedBy || "Academic Director"}):
                            </div>
                            <div style={{ color: "#78350f" }}>
                              {activePreviewReport.schoolRemarks ||
                                `${activePreviewReport.studentName} continues to uphold the learning standards of Bright Path Learning Hub.`}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })()}

        {/* ===================================================================
            TAB: REWARDS & BADGES (Module F: Points, Badges, Streaks, Certificates & Leaderboard)
            =================================================================== */}
        {activeTab === "badges" && (
          <StudentRewardsModule
            studentName={studentAccount.studentName}
            studentUsername={studentAccount.username}
            grade={studentAccount.grade || "All Grades"}
            courseName={studentAccount.courseName || "English Phonics & Reading"}
            progress={progress}
            submissions={submissions}
            aiLogs={aiLogs}
            leaderboard={leaderboard}
            leaderboardSettings={leaderboardSettings}
            onProfileUpdated={() => fetchStudentLmsData(studentAccount)}
            showToast={showToast}
          />
        )}

        {ADDITIONAL_PORTAL_TABS.some((t) => t.id === activeTab) && (
          <PortalAdditionalModules
            activeModule={activeTab as any}
            studentAccount={studentAccount}
            progress={progress}
            assignments={assignments}
            submissions={submissions}
            aiLogs={aiLogs}
            notifications={notifications}
            timetableSlots={timetableSlots}
            attendanceLogs={attendanceLogs}
            learningMaterials={learningMaterials}
            messages={portalMessages}
            supportTickets={supportTickets}
            calendarEvents={calendarEvents}
            portalRole={portalRole}
            onRefresh={() => fetchStudentLmsData(studentAccount)}
            showToast={showToast}
          />
        )}

        {/* ===================================================================
            TAB: NOTIFICATIONS
            =================================================================== */}
        {activeTab === "notifications" && (
          <div style={{ background: "#ffffff", borderRadius: 18, padding: 24, border: "1px solid #e2e8f0" }}>
            <h2 style={{ margin: "0 0 16px", fontSize: "1.2rem", fontWeight: 800 }}>
              🔔 Announcements, New Homework & Reminders
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
                    <span style={{ fontWeight: 800, fontSize: "0.92rem", color: "#0f172a" }}>{n.title}</span>
                    <span style={{ fontSize: "0.74rem", color: "#64748b" }}>
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.84rem", color: "#475569" }}>{n.message}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB: PARENT ACTIVITY & PROGRESS MONITOR
            =================================================================== */}
        {activeTab === "parent-monitor" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              style={{
                background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
                border: "1px solid #fcd34d",
                borderRadius: 18,
                padding: 22,
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div>
                <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#b45309", textTransform: "uppercase" }}>
                  👪 PARENT & GUARDIAN MONITORING HUB
                </span>
                <h2 style={{ margin: "4px 0", fontSize: "1.3rem", fontWeight: 800, color: "#0f172a" }}>
                  Monitoring {studentAccount.studentName}&#39;s Learning & Academic Development
                </h2>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#475569" }}>
                  Track completed lessons, homework scores, AI reading & writing practice sessions, and areas needing improvement.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab("reports")}
                className="btn btn-primary"
                style={{ padding: "10px 18px", fontSize: "0.84rem" }}
              >
                <Download size={16} /> View / Download PDF Report Cards
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20 }}>
              {/* AI Practice & Reading Activity Log */}
              <div style={{ background: "#ffffff", borderRadius: 18, padding: 22, border: "1px solid #e2e8f0" }}>
                <h3 style={{ margin: "0 0 14px", fontSize: "1.05rem", fontWeight: 800 }}>
                  🤖 Recent AI Reading, Pronunciation & Writing Sessions
                </h3>
                {aiLogs.length === 0 ? (
                  <p style={{ fontSize: "0.84rem", color: "#64748b" }}>
                    No AI practice logs recorded yet today. When {studentAccount.studentName} reads aloud or practises writing with AI Learning Buddy, every session is logged here for you.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {aiLogs.slice(0, 6).map((log) => (
                      <div
                        key={log.id}
                        style={{
                          padding: 12,
                          borderRadius: 12,
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          fontSize: "0.82rem",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800 }}>
                          <span>{log.topic}</span>
                          <span style={{ color: "#059669" }}>{log.score}%</span>
                        </div>
                        <div style={{ color: "#475569", marginTop: 4 }}>{log.feedback}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Strengths & Areas Needing Improvement */}
              <div style={{ background: "#ffffff", borderRadius: 18, padding: 22, border: "1px solid #e2e8f0" }}>
                <h3 style={{ margin: "0 0 14px", fontSize: "1.05rem", fontWeight: 800 }}>
                  📊 Academic Development & Diagnostic Summary
                </h3>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontWeight: 800, color: "#059669", fontSize: "0.85rem", marginBottom: 6 }}>
                    ✅ Observed Strengths:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.84rem", color: "#334155", lineHeight: 1.6 }}>
                    {(progress?.customStrengths || []).map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div style={{ fontWeight: 800, color: "#d97706", fontSize: "0.85rem", marginBottom: 6 }}>
                    🎯 Areas Where {studentAccount.studentName} Needs Extra Support:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.84rem", color: "#334155", lineHeight: 1.6 }}>
                    {(progress?.customImprovements || []).map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Full Dedicated Subject Progress & Diagnostic Module inside Parent Monitor */}
            <StudentProgressModule
              studentName={studentAccount.studentName}
              studentUsername={studentAccount.username}
              grade={studentAccount.grade || "All Grades"}
              courseName={studentAccount.courseName || "English Phonics & Reading"}
              progress={progress}
              submissions={submissions}
              aiLogs={aiLogs}
            />
          </div>
        )}
      </main>
      </div>
    </div>
  );
}
