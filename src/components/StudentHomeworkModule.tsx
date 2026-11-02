"use client";

import React, { useState, useRef, useEffect } from "react";
import type {
  HomeworkAssignment,
  HomeworkQuestion,
  HomeworkSubmission,
  StudentQuestionAnswer,
  AssignmentLifecycleStatus,
} from "@/lib/lmsData";

interface StudentHomeworkModuleProps {
  assignments: HomeworkAssignment[];
  submissions: HomeworkSubmission[];
  studentUsername: string;
  studentName: string;
  parentEmail?: string;
  grade: string;
  onRefreshData: () => Promise<void>;
  showToast: (message: string, type?: "success" | "error" | "info" | "warning") => void;
}

const QUESTION_TYPE_LABELS: Record<
  string,
  { label: string; markingBadge: string; badgeColor: string; badgeBg: string }
> = {
  "multiple-choice": {
    label: "Multiple Choice",
    markingBadge: "⚡ Automatic Marking",
    badgeColor: "#1d4ed8",
    badgeBg: "#dbeafe",
  },
  objective: {
    label: "Multiple Choice",
    markingBadge: "⚡ Automatic Marking",
    badgeColor: "#1d4ed8",
    badgeBg: "#dbeafe",
  },
  "true-false": {
    label: "True / False",
    markingBadge: "⚡ Automatic Marking",
    badgeColor: "#0369a1",
    badgeBg: "#e0f2fe",
  },
  matching: {
    label: "Matching Pairs",
    markingBadge: "⚡ Automatic Marking",
    badgeColor: "#4338ca",
    badgeBg: "#e0e7ff",
  },
  "fill-in-blank": {
    label: "Fill in the Blanks",
    markingBadge: "⚡ Auto (Accepted-Answer Rules)",
    badgeColor: "#047857",
    badgeBg: "#d1fae5",
  },
  spelling: {
    label: "Simple Spelling",
    markingBadge: "⚡ Automatic Marking",
    badgeColor: "#0f766e",
    badgeBg: "#ccfbf1",
  },
  "reading-comprehension": {
    label: "Reading Comprehension",
    markingBadge: "🤖 AI-Assisted + Teacher Review",
    badgeColor: "#7c3aed",
    badgeBg: "#ede9fe",
  },
  handwriting: {
    label: "Handwriting & Drawing",
    markingBadge: "✍️ AI-Assisted + Teacher Review",
    badgeColor: "#b45309",
    badgeBg: "#fef3c7",
  },
  "creative-writing": {
    label: "Essay & Creative Writing",
    markingBadge: "📝 Teacher Grading + AI Suggestions",
    badgeColor: "#be185d",
    badgeBg: "#fce7f3",
  },
  subjective: {
    label: "Essay & Written Response",
    markingBadge: "📝 Teacher Grading + AI Suggestions",
    badgeColor: "#be185d",
    badgeBg: "#fce7f3",
  },
  "recorded-reading": {
    label: "Recorded Voice Reading",
    markingBadge: "🎙️ AI Assessment + Teacher Review",
    badgeColor: "#c2410c",
    badgeBg: "#ffedd5",
  },
};

function getLifecycleBadgeStyle(status: AssignmentLifecycleStatus | string) {
  switch (status) {
    case "Graded":
    case "graded":
      return { bg: "#dcfce7", color: "#15803d", label: "✅ Graded" };
    case "Under Review":
    case "under-review":
    case "Submitted":
    case "submitted":
      return { bg: "#ede9fe", color: "#6d28d9", label: "🔍 Under Review" };
    case "Returned":
    case "returned":
      return { bg: "#fee2e2", color: "#b91c1c", label: "↩️ Returned for Revision" };
    case "In Progress":
    case "in-progress":
      return { bg: "#e0f2fe", color: "#0369a1", label: "💾 In Progress (Saved)" };
    default:
      return { bg: "#fef3c7", color: "#b45309", label: "⏳ Published (Pending)" };
  }
}

/**
 * Interactive HTML5 Canvas for Drawing or Writing Answers Online
 */
function HandwritingCanvasPad({
  value,
  onChange,
}: {
  value?: string;
  onChange: (dataUrl: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeColor, setStrokeColor] = useState("#0f172a");
  const [lineWidth, setLineWidth] = useState(4);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (!value) {
      // Draw subtle ruled handwriting guide lines
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1;
      for (let y = 45; y < canvas.height; y += 45) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }
  }, [value]);

  const getCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ("touches" in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = getCoords(e);
    setIsDrawing(true);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = getCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      onChange(canvas.toDataURL("image/png"));
    }
  };

  const clearPad = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    for (let y = 45; y < canvas.height; y += 45) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    onChange("");
  };

  return (
    <div
      style={{
        background: "#f8fafc",
        borderRadius: "14px",
        padding: "0.85rem",
        border: "1px solid #cbd5e1",
        marginTop: "0.6rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.5rem",
          marginBottom: "0.6rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#334155" }}>
            ✏️ Draw / Write on Pad:
          </span>
          {["#0f172a", "#1d4ed8", "#15803d", "#dc2626", "#7c3aed"].map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setStrokeColor(color)}
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                background: color,
                border: strokeColor === color ? "3px solid #f97316" : "2px solid #fff",
                cursor: "pointer",
              }}
            />
          ))}
          <select
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            style={{
              padding: "0.2rem 0.5rem",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              fontSize: "0.75rem",
              fontWeight: 700,
            }}
          >
            <option value={2}>Fine Pen</option>
            <option value={4}>Medium Pen</option>
            <option value={7}>Thick Marker</option>
          </select>
        </div>
        <button
          type="button"
          onClick={clearPad}
          style={{
            background: "#fee2e2",
            color: "#dc2626",
            border: "none",
            borderRadius: "8px",
            padding: "0.3rem 0.7rem",
            fontSize: "0.75rem",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          🗑️ Clear Pad
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={680}
        height={220}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
        style={{
          width: "100%",
          height: "200px",
          background: "#fff",
          borderRadius: "10px",
          border: "2px dashed #94a3b8",
          cursor: "crosshair",
          touchAction: "none",
        }}
      />
      {value && (
        <div style={{ marginTop: "0.45rem", fontSize: "0.75rem", color: "#15803d", fontWeight: 700 }}>
          ✓ Drawing / handwriting captured on canvas
        </div>
      )}
    </div>
  );
}

export default function StudentHomeworkModule({
  assignments,
  submissions,
  studentUsername,
  studentName,
  parentEmail,
  grade,
  onRefreshData,
  showToast,
}: StudentHomeworkModuleProps) {
  const [filterTab, setFilterTab] = useState<"all" | "pending" | "submitted" | "graded">("all");
  const [activeHomeworkId, setActiveHomeworkId] = useState<string | null>(null);
  const [revisingHomeworkId, setRevisingHomeworkId] = useState<string | null>(null);

  // Answers state per homework
  const [hwAnswers, setHwAnswers] = useState<Record<string, Record<string, string>>>({});
  const [hwRichAnswers, setHwRichAnswers] = useState<
    Record<string, Record<string, StudentQuestionAnswer>>
  >({});

  const [savingDraftId, setSavingDraftId] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  // Voice recording state for "recorded-reading" questions
  const [recordingQuestionId, setRecordingQuestionId] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const speechRecRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Initialize saved answers from existing "In Progress" or "Returned" submissions
  useEffect(() => {
    const initialAnswers: Record<string, Record<string, string>> = {};
    const initialRich: Record<string, Record<string, StudentQuestionAnswer>> = {};
    for (const sub of submissions) {
      if (sub.answers) {
        initialAnswers[sub.homeworkId] = { ...sub.answers };
      }
      if (sub.richAnswers) {
        initialRich[sub.homeworkId] = { ...sub.richAnswers };
      }
    }
    setHwAnswers((prev) => ({ ...initialAnswers, ...prev }));
    setHwRichAnswers((prev) => ({ ...initialRich, ...prev }));
  }, [submissions]);

  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      showToast("Voice playback is not supported in this browser.", "warning");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  };

  const updateTextAnswer = (hwId: string, qId: string, val: string) => {
    setHwAnswers((prev) => ({
      ...prev,
      [hwId]: { ...(prev[hwId] || {}), [qId]: val },
    }));
    setHwRichAnswers((prev) => ({
      ...prev,
      [hwId]: {
        ...(prev[hwId] || {}),
        [qId]: { ...(prev[hwId]?.[qId] || { questionId: qId }), questionId: qId, textAnswer: val },
      },
    }));
  };

  const updateRichField = (
    hwId: string,
    qId: string,
    patch: Partial<StudentQuestionAnswer>
  ) => {
    setHwRichAnswers((prev) => ({
      ...prev,
      [hwId]: {
        ...(prev[hwId] || {}),
        [qId]: {
          ...(prev[hwId]?.[qId] || { questionId: qId }),
          questionId: qId,
          ...patch,
        },
      },
    }));
  };

  const handleUploadHandwrittenPhoto = (
    hwId: string,
    qId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      showToast("Please choose an image smaller than 3MB.", "warning");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateRichField(hwId, qId, {
          uploadedImageUrl: reader.result,
          uploadedFileName: file.name,
        });
        showToast(`Uploaded "${file.name}" for handwritten work!`, "success");
      }
    };
    reader.readAsDataURL(file);
  };

  const startVoiceRecording = async (hwId: string, q: HomeworkQuestion) => {
    if (recordingQuestionId === q.id) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (speechRecRef.current) {
        try {
          speechRecRef.current.stop();
        } catch {}
      }
      setRecordingQuestionId(null);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) {
          audioChunksRef.current.push(ev.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            updateRichField(hwId, q.id, {
              voiceRecordingUrl: reader.result,
            });
            showToast("Voice reading recording captured!", "success");
          }
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecordingQuestionId(q.id);

      // Also start live speech recognition if available to capture reading transcript
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.onresult = (event: any) => {
          let fullTranscript = "";
          for (let i = 0; i < event.results.length; i++) {
            fullTranscript += event.results[i][0].transcript + " ";
          }
          const clean = fullTranscript.trim();
          if (clean) {
            updateTextAnswer(hwId, q.id, clean);
            updateRichField(hwId, q.id, { voiceTranscript: clean, textAnswer: clean });
          }
        };
        try {
          recognition.start();
          speechRecRef.current = recognition;
        } catch {}
      }
    } catch (err) {
      showToast(
        "Microphone access wasn't granted. You can also type or paste your reading transcript below.",
        "warning"
      );
    }
  };

  const handleSaveUnfinishedWork = async (hw: HomeworkAssignment) => {
    setSavingDraftId(hw.id);
    try {
      const res = await fetch("/api/lms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save-homework-progress",
          homeworkId: hw.id,
          studentUsername,
          studentName,
          parentEmail,
          grade,
          answers: hwAnswers[hw.id] || {},
          richAnswers: hwRichAnswers[hw.id] || {},
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message || "Unfinished work saved!", "info");
        await onRefreshData();
      } else {
        showToast(json.message || "Could not save progress.", "error");
      }
    } catch {
      showToast("Network error while saving progress.", "error");
    } finally {
      setSavingDraftId(null);
    }
  };

  const handleSubmitHomework = async (hw: HomeworkAssignment) => {
    const currentTextAnswers = hwAnswers[hw.id] || {};
    const currentRichAnswers = hwRichAnswers[hw.id] || {};

    // Check if at least one question has been answered
    const hasAnyAnswer = hw.questions.some((q) => {
      const txt = currentTextAnswers[q.id]?.trim();
      const rich = currentRichAnswers[q.id];
      return (
        Boolean(txt) ||
        Boolean(rich?.drawingDataUrl) ||
        Boolean(rich?.uploadedImageUrl) ||
        Boolean(rich?.voiceRecordingUrl) ||
        Boolean(rich?.matchingAnswers && Object.keys(rich.matchingAnswers).length > 0)
      );
    });

    if (!hasAnyAnswer) {
      showToast("Please answer at least one question before submitting.", "warning");
      return;
    }

    setSubmittingId(hw.id);
    try {
      const res = await fetch("/api/lms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit-homework",
          homeworkId: hw.id,
          studentUsername,
          studentName,
          parentEmail,
          grade,
          answers: currentTextAnswers,
          richAnswers: currentRichAnswers,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message || "Homework submitted successfully!", "success");
        setRevisingHomeworkId(null);
        await onRefreshData();
      } else {
        showToast(json.message || "Could not submit homework.", "error");
      }
    } catch {
      showToast("Network error while submitting homework.", "error");
    } finally {
      setSubmittingId(null);
    }
  };

  // Filter assignments according to selected tab
  const filteredAssignments = assignments.filter((hw) => {
    const sub = submissions.find((s) => s.homeworkId === hw.id);
    const lStatus = sub?.lifecycleStatus || (sub ? sub.status : "Published");

    if (filterTab === "pending") {
      return !sub || lStatus === "In Progress" || lStatus === "in-progress" || lStatus === "Returned" || lStatus === "returned";
    }
    if (filterTab === "submitted") {
      return lStatus === "Submitted" || lStatus === "submitted" || lStatus === "Under Review" || lStatus === "under-review";
    }
    if (filterTab === "graded") {
      return lStatus === "Graded" || lStatus === "graded";
    }
    return true;
  });

  const todayIso = new Date().toISOString().split("T")[0];

  return (
    <div>
      {/* Header & Lifecycle Pipeline Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
          borderRadius: "20px",
          padding: "1.4rem 1.75rem",
          color: "#fff",
          marginBottom: "1.25rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <span
            style={{
              background: "rgba(249,115,22,0.22)",
              color: "#fdba74",
              padding: "0.25rem 0.7rem",
              borderRadius: "999px",
              fontSize: "0.72rem",
              fontWeight: 800,
              textTransform: "uppercase",
            }}
          >
            Module B • Interactive Homework & Assessment Center
          </span>
          <h3 style={{ margin: "0.45rem 0 0.25rem", fontSize: "1.35rem", fontWeight: 900 }}>
            📝 My Homework, Worksheets & Voice Assignments
          </h3>
          <p style={{ margin: 0, color: "#cbd5e1", fontSize: "0.85rem" }}>
            Listen to instructions, type answers, draw on the handwriting pad, upload photos of your notebook, or record your reading aloud!
          </p>
        </div>

        {/* Status Filter Pills */}
        <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
          {[
            { id: "all", label: `All (${assignments.length})` },
            { id: "pending", label: "⏳ To Do / In Progress" },
            { id: "submitted", label: "🔍 Under Review" },
            { id: "graded", label: "✅ Graded" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilterTab(t.id as any)}
              style={{
                padding: "0.5rem 0.9rem",
                borderRadius: "10px",
                border: "none",
                background: filterTab === t.id ? "#f97316" : "rgba(255,255,255,0.1)",
                color: "#fff",
                fontWeight: 800,
                fontSize: "0.8rem",
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Assignment Cards */}
      {filteredAssignments.length === 0 ? (
        <div
          style={{
            background: "#fff",
            borderRadius: "20px",
            padding: "2.5rem",
            textAlign: "center",
            border: "1px solid #e2e8f0",
            color: "#64748b",
          }}
        >
          No homework assignments match this filter right now.
        </div>
      ) : (
        filteredAssignments.map((hw) => {
          const sub = submissions.find((s) => s.homeworkId === hw.id);
          const lifecycle = sub?.lifecycleStatus || (sub?.status === "graded" ? "Graded" : sub?.status === "submitted" ? "Under Review" : "Published");
          const badge = getLifecycleBadgeStyle(lifecycle);
          const isOverdue = Boolean(hw.dueDate && todayIso > hw.dueDate && (!sub || lifecycle === "In Progress"));
          const isSubmittedOrGraded =
            sub &&
            lifecycle !== "In Progress" &&
            revisingHomeworkId !== hw.id;
          const isOpen = activeHomeworkId === hw.id || assignments.length === 1;

          return (
            <div
              key={hw.id}
              style={{
                background: "#fff",
                borderRadius: "20px",
                padding: "1.5rem",
                border: isOpen ? "2px solid #6366f1" : "1px solid #e2e8f0",
                marginBottom: "1.25rem",
                boxShadow: "0 6px 20px rgba(15,23,42,0.04)",
              }}
            >
              {/* Top Summary Bar */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: "260px" }}>
                  <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap", alignItems: "center", marginBottom: "0.45rem" }}>
                    <span
                      style={{
                        background: "#eff6ff",
                        color: "#1d4ed8",
                        padding: "0.22rem 0.65rem",
                        borderRadius: "999px",
                        fontSize: "0.73rem",
                        fontWeight: 800,
                      }}
                    >
                      📚 {hw.subject || hw.courseName}
                    </span>
                    {hw.topic && (
                      <span
                        style={{
                          background: "#f1f5f9",
                          color: "#334155",
                          padding: "0.22rem 0.65rem",
                          borderRadius: "999px",
                          fontSize: "0.73rem",
                          fontWeight: 800,
                        }}
                      >
                        🎯 Topic: {hw.topic}
                      </span>
                    )}
                    <span
                      style={{
                        background: isOverdue ? "#fee2e2" : "#f8fafc",
                        color: isOverdue ? "#dc2626" : "#475569",
                        padding: "0.22rem 0.65rem",
                        borderRadius: "999px",
                        fontSize: "0.73rem",
                        fontWeight: 800,
                      }}
                    >
                      📅 Due: {hw.dueDate} {isOverdue ? "(Past Deadline - Late Allowed)" : ""}
                    </span>
                    <span
                      style={{
                        background: "#f0fdf4",
                        color: "#15803d",
                        padding: "0.22rem 0.65rem",
                        borderRadius: "999px",
                        fontSize: "0.73rem",
                        fontWeight: 800,
                      }}
                    >
                      🏆 {hw.totalPoints} Marks (Pass: {hw.passingScore || 60}%)
                    </span>
                    {sub?.isLate && (
                      <span
                        style={{
                          background: "#fef3c7",
                          color: "#b45309",
                          padding: "0.22rem 0.65rem",
                          borderRadius: "999px",
                          fontSize: "0.72rem",
                          fontWeight: 800,
                        }}
                      >
                        ⏰ Late Submission
                      </span>
                    )}
                    {(sub?.resubmissionCount || 0) > 0 && (
                      <span
                        style={{
                          background: "#e0e7ff",
                          color: "#4338ca",
                          padding: "0.22rem 0.65rem",
                          borderRadius: "999px",
                          fontSize: "0.72rem",
                          fontWeight: 800,
                        }}
                      >
                        🔄 Resubmission #{sub?.resubmissionCount}
                      </span>
                    )}
                  </div>

                  <h4 style={{ margin: "0 0 0.35rem", fontSize: "1.18rem", fontWeight: 900, color: "#0f172a" }}>
                    {hw.title}
                  </h4>
                  <p style={{ margin: 0, color: "#475569", fontSize: "0.9rem", lineHeight: 1.55 }}>
                    {hw.description}
                  </p>
                </div>

                {/* Status Badge & Open/Close Toggle */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
                  <span
                    style={{
                      background: badge.bg,
                      color: badge.color,
                      padding: "0.4rem 0.9rem",
                      borderRadius: "999px",
                      fontSize: "0.8rem",
                      fontWeight: 900,
                    }}
                  >
                    {badge.label}
                    {sub && lifecycle !== "In Progress" ? ` • ${sub.percentage}%` : ""}
                  </span>

                  <button
                    type="button"
                    onClick={() => setActiveHomeworkId(activeHomeworkId === hw.id ? null : hw.id)}
                    style={{
                      background: isOpen ? "#f1f5f9" : "linear-gradient(135deg, #4f46e5, #7c3aed)",
                      color: isOpen ? "#334155" : "#fff",
                      border: "none",
                      borderRadius: "10px",
                      padding: "0.5rem 1rem",
                      fontWeight: 800,
                      fontSize: "0.82rem",
                      cursor: "pointer",
                    }}
                  >
                    {isOpen
                      ? "▲ Minimize Assignment"
                      : isSubmittedOrGraded
                      ? "📊 View Marks & Feedback"
                      : lifecycle === "In Progress"
                      ? "▶️ Continue Saved Work"
                      : "📖 Open Assigned Homework"}
                  </button>
                </div>
              </div>

              {/* Audio Instructions & Downloadable Worksheets / Learning Materials */}
              <div
                style={{
                  display: "flex",
                  gap: "0.65rem",
                  flexWrap: "wrap",
                  alignItems: "center",
                  marginTop: "0.9rem",
                  paddingTop: "0.85rem",
                  borderTop: "1px dashed #e2e8f0",
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    speakText(
                      hw.audioInstructionText ||
                        `${hw.title}. ${hw.description}. Complete all ${hw.questions.length} questions carefully.`
                    )
                  }
                  style={{
                    background: "#eff6ff",
                    color: "#1d4ed8",
                    border: "1px solid #bfdbfe",
                    borderRadius: "10px",
                    padding: "0.45rem 0.85rem",
                    fontSize: "0.8rem",
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  🔊 Listen to Teacher Instructions
                </button>

                {hw.audioInstructionUrl && (
                  <audio
                    controls
                    src={hw.audioInstructionUrl}
                    style={{ height: "34px", maxWidth: "240px" }}
                  />
                )}

                {hw.attachments &&
                  hw.attachments.map((att) => (
                    <a
                      key={att.id}
                      href={att.url}
                      download={att.fileName || `${att.title || att.name || "worksheet"}.pdf`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        background: att.type === "pdf" ? "#fef2f2" : "#f0fdf4",
                        color: att.type === "pdf" ? "#dc2626" : "#15803d",
                        border: `1px solid ${att.type === "pdf" ? "#fecaca" : "#bbf7d0"}`,
                        borderRadius: "10px",
                        padding: "0.42rem 0.85rem",
                        fontSize: "0.78rem",
                        fontWeight: 800,
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                      }}
                    >
                      {att.type === "pdf" ? "📄 PDF Worksheet:" : "🖼️ Learning Material:"} {att.title || att.name}
                    </a>
                  ))}
              </div>

              {/* Expanded Workspace: Either Graded Results View OR Interactive Question Builder */}
              {isOpen && (
                <div style={{ marginTop: "1.25rem" }}>
                  {isSubmittedOrGraded && sub ? (
                    /* ================= GRADED / SUBMITTED REVIEW PANEL ================= */
                    <div
                      style={{
                        background: "#f8fafc",
                        borderRadius: "16px",
                        padding: "1.25rem",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: "0.75rem",
                          paddingBottom: "1rem",
                          borderBottom: "1px solid #e2e8f0",
                          marginBottom: "1rem",
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>
                            Official Homework Result • Status: {sub.lifecycleStatus || sub.status}
                          </div>
                          <div style={{ fontSize: "1.35rem", fontWeight: 950, color: "#0f172a", marginTop: "0.2rem" }}>
                            Score: {sub.totalScore} / {sub.maxPoints} ({sub.percentage}%){" "}
                            <span
                              style={{
                                fontSize: "0.82rem",
                                padding: "0.22rem 0.65rem",
                                borderRadius: "999px",
                                background: sub.passed !== false ? "#dcfce7" : "#fee2e2",
                                color: sub.passed !== false ? "#15803d" : "#dc2626",
                                marginLeft: "0.4rem",
                              }}
                            >
                              {sub.passed !== false
                                ? `✓ Passed (Pass Mark: ${sub.passingScore || hw.passingScore || 60}%)`
                                : `Needs Revision (Pass Mark: ${sub.passingScore || hw.passingScore || 60}%)`}
                            </span>
                          </div>
                          <div style={{ fontSize: "0.82rem", color: "#475569", marginTop: "0.25rem" }}>
                            ⚡ Automatic Marks: <strong>{sub.objectiveScore} pts</strong> • 🤖/👩‍🏫 AI & Teacher Marks:{" "}
                            <strong>{sub.subjectiveScore} pts</strong>
                          </div>
                        </div>

                        {(sub.lifecycleStatus === "Returned" ||
                          sub.allowResubmission ||
                          hw.allowResubmission) && (
                          <button
                            type="button"
                            onClick={() => setRevisingHomeworkId(hw.id)}
                            style={{
                              background: "linear-gradient(135deg, #f97316, #ea580c)",
                              color: "#fff",
                              border: "none",
                              borderRadius: "12px",
                              padding: "0.65rem 1.15rem",
                              fontWeight: 900,
                              fontSize: "0.84rem",
                              cursor: "pointer",
                            }}
                          >
                            🔄 Revise & Resubmit Homework
                          </button>
                        )}
                      </div>

                      {/* Teacher Overall Feedback Box */}
                      <div
                        style={{
                          background: "#eff6ff",
                          borderRadius: "12px",
                          padding: "0.9rem 1.1rem",
                          border: "1px solid #bfdbfe",
                          marginBottom: "1rem",
                        }}
                      >
                        <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "#1d4ed8", marginBottom: "0.25rem" }}>
                          👩‍🏫 Teacher & AI Assessment Feedback
                        </div>
                        <div style={{ fontSize: "0.9rem", color: "#1e3a8a", fontWeight: 600 }}>
                          &ldquo;{sub.teacherFeedback}&rdquo;
                        </div>
                      </div>

                      {/* Per-Question Breakdown */}
                      <div style={{ display: "grid", gap: "0.75rem" }}>
                        {hw.questions.map((q, idx) => {
                          const evalItem = sub.questionEvaluations?.[q.id];
                          const richAns = sub.richAnswers?.[q.id];
                          const txtAns = sub.answers?.[q.id] || richAns?.textAnswer || "";
                          const typeInfo = QUESTION_TYPE_LABELS[q.type] || QUESTION_TYPE_LABELS["multiple-choice"];

                          return (
                            <div
                              key={q.id}
                              style={{
                                background: "#fff",
                                borderRadius: "12px",
                                padding: "0.9rem 1rem",
                                border: "1px solid #e2e8f0",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  flexWrap: "wrap",
                                  gap: "0.5rem",
                                  marginBottom: "0.35rem",
                                }}
                              >
                                <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "#0f172a" }}>
                                  Q{idx + 1}. {q.prompt}
                                </span>
                                <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                                  <span
                                    style={{
                                      background: typeInfo.badgeBg,
                                      color: typeInfo.badgeColor,
                                      padding: "0.18rem 0.55rem",
                                      borderRadius: "999px",
                                      fontSize: "0.7rem",
                                      fontWeight: 800,
                                    }}
                                  >
                                    {typeInfo.label}
                                  </span>
                                  <span
                                    style={{
                                      background: "#f1f5f9",
                                      color: "#0f172a",
                                      padding: "0.2rem 0.65rem",
                                      borderRadius: "999px",
                                      fontSize: "0.78rem",
                                      fontWeight: 900,
                                    }}
                                  >
                                    {evalItem ? `${evalItem.finalScore} / ${q.points} pts` : `${q.points} pts`}
                                    {evalItem?.teacherOverrideScore !== undefined ? " (Teacher Override)" : ""}
                                  </span>
                                </div>
                              </div>

                              {txtAns && (
                                <div style={{ fontSize: "0.84rem", color: "#334155", marginTop: "0.25rem" }}>
                                  <strong>Your Answer:</strong> {txtAns}
                                </div>
                              )}

                              {richAns?.matchingAnswers && (
                                <div style={{ fontSize: "0.82rem", color: "#334155", marginTop: "0.25rem" }}>
                                  <strong>Matched Pairs:</strong>{" "}
                                  {Object.entries(richAns.matchingAnswers)
                                    .map(([l, r]) => `${l} → ${r}`)
                                    .join(" | ")}
                                </div>
                              )}

                              {(richAns?.drawingDataUrl || richAns?.uploadedImageUrl) && (
                                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                                  {richAns.drawingDataUrl && (
                                    <img
                                      src={richAns.drawingDataUrl}
                                      alt="Canvas Handwriting"
                                      style={{
                                        maxHeight: "110px",
                                        borderRadius: "8px",
                                        border: "1px solid #cbd5e1",
                                        background: "#fff",
                                      }}
                                    />
                                  )}
                                  {richAns.uploadedImageUrl && (
                                    <img
                                      src={richAns.uploadedImageUrl}
                                      alt="Uploaded Handwritten Work"
                                      style={{
                                        maxHeight: "110px",
                                        borderRadius: "8px",
                                        border: "1px solid #cbd5e1",
                                      }}
                                    />
                                  )}
                                </div>
                              )}

                              {richAns?.voiceRecordingUrl && (
                                <div style={{ marginTop: "0.45rem" }}>
                                  <audio controls src={richAns.voiceRecordingUrl} style={{ height: "32px" }} />
                                </div>
                              )}

                              {evalItem?.aiSuggestionFeedback && (
                                <div
                                  style={{
                                    marginTop: "0.45rem",
                                    fontSize: "0.78rem",
                                    color: "#475569",
                                    background: "#f8fafc",
                                    padding: "0.4rem 0.65rem",
                                    borderRadius: "8px",
                                  }}
                                >
                                  💡 {evalItem.aiSuggestionFeedback}
                                </div>
                              )}

                              {evalItem?.teacherComment && (
                                <div
                                  style={{
                                    marginTop: "0.35rem",
                                    fontSize: "0.8rem",
                                    color: "#15803d",
                                    fontWeight: 700,
                                  }}
                                >
                                  👩‍🏫 Teacher Note: {evalItem.teacherComment}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* ================= INTERACTIVE ONLINE HOMEWORK WORKSPACE ================= */
                    <div style={{ display: "grid", gap: "1rem" }}>
                      {hw.questions.map((q, qIdx) => {
                        const typeMeta =
                          QUESTION_TYPE_LABELS[q.type] || QUESTION_TYPE_LABELS["multiple-choice"];
                        const currentTxt = hwAnswers[hw.id]?.[q.id] || "";
                        const currentRich = hwRichAnswers[hw.id]?.[q.id];

                        return (
                          <div
                            key={q.id}
                            style={{
                              background: "#f8fafc",
                              borderRadius: "16px",
                              padding: "1.15rem",
                              border: "1px solid #e2e8f0",
                            }}
                          >
                            {/* Question Header */}
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                flexWrap: "wrap",
                                gap: "0.5rem",
                                marginBottom: "0.65rem",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                                <span
                                  style={{
                                    background: "#0f172a",
                                    color: "#fff",
                                    padding: "0.2rem 0.6rem",
                                    borderRadius: "8px",
                                    fontSize: "0.78rem",
                                    fontWeight: 900,
                                  }}
                                >
                                  Q{qIdx + 1}
                                </span>
                                <span
                                  style={{
                                    background: typeMeta.badgeBg,
                                    color: typeMeta.badgeColor,
                                    padding: "0.22rem 0.65rem",
                                    borderRadius: "999px",
                                    fontSize: "0.73rem",
                                    fontWeight: 800,
                                  }}
                                >
                                  {typeMeta.label} • {typeMeta.markingBadge}
                                </span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <button
                                  type="button"
                                  onClick={() =>
                                    speakText(
                                      (q.readingPassage || q.passageText)
                                        ? `${q.prompt}. Passage: ${q.readingPassage || q.passageText}`
                                        : q.prompt
                                    )
                                  }
                                  style={{
                                    background: "#fff",
                                    color: "#334155",
                                    border: "1px solid #cbd5e1",
                                    borderRadius: "8px",
                                    padding: "0.25rem 0.6rem",
                                    fontSize: "0.74rem",
                                    fontWeight: 800,
                                    cursor: "pointer",
                                  }}
                                >
                                  🔊 Read Question
                                </button>
                                <span style={{ fontSize: "0.8rem", fontWeight: 900, color: "#4f46e5" }}>
                                  {q.points} Marks
                                </span>
                              </div>
                            </div>

                            <div
                              style={{
                                fontWeight: 800,
                                color: "#0f172a",
                                fontSize: "0.98rem",
                                marginBottom: "0.75rem",
                                lineHeight: 1.5,
                              }}
                            >
                              {q.prompt}
                            </div>

                            {/* Reading Passage Box (if reading comprehension or recorded reading) */}
                            {(q.readingPassage || q.passageText) && (
                              <div
                                style={{
                                  background: "#fffbeb",
                                  border: "1px solid #fde68a",
                                  borderRadius: "12px",
                                  padding: "0.95rem 1.1rem",
                                  marginBottom: "0.85rem",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "0.35rem",
                                  }}
                                >
                                  <span style={{ fontSize: "0.75rem", fontWeight: 900, color: "#b45309", textTransform: "uppercase" }}>
                                    📖 Reading Passage
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => speakText((q.readingPassage || q.passageText)!)}
                                    style={{
                                      background: "#fef3c7",
                                      color: "#92400e",
                                      border: "none",
                                      borderRadius: "8px",
                                      padding: "0.25rem 0.65rem",
                                      fontSize: "0.74rem",
                                      fontWeight: 800,
                                      cursor: "pointer",
                                    }}
                                  >
                                    🔊 Listen to Passage
                                  </button>
                                </div>
                                <div style={{ fontSize: "0.95rem", color: "#1e293b", lineHeight: 1.65, fontWeight: 600 }}>
                                  &ldquo;{q.readingPassage || q.passageText}&rdquo;
                                </div>
                              </div>
                            )}

                            {/* 1. MULTIPLE CHOICE */}
                            {(q.type === "multiple-choice" || q.type === "objective") && (
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
                                  gap: "0.55rem",
                                }}
                              >
                                {(q.options || []).map((opt) => {
                                  const selected = currentTxt === opt;
                                  return (
                                    <button
                                      key={opt}
                                      type="button"
                                      onClick={() => updateTextAnswer(hw.id, q.id, opt)}
                                      style={{
                                        padding: "0.75rem 0.95rem",
                                        borderRadius: "12px",
                                        border: selected ? "2px solid #4f46e5" : "1px solid #cbd5e1",
                                        background: selected ? "#eef2ff" : "#fff",
                                        color: selected ? "#312e81" : "#334155",
                                        fontWeight: 800,
                                        fontSize: "0.88rem",
                                        cursor: "pointer",
                                        textAlign: "left",
                                      }}
                                    >
                                      {selected ? "🔘 " : "⚪ "}
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                            {/* 2. TRUE / FALSE */}
                            {q.type === "true-false" && (
                              <div style={{ display: "flex", gap: "0.75rem" }}>
                                {["True", "False"].map((tf) => {
                                  const selected = currentTxt.toLowerCase() === tf.toLowerCase();
                                  return (
                                    <button
                                      key={tf}
                                      type="button"
                                      onClick={() => updateTextAnswer(hw.id, q.id, tf)}
                                      style={{
                                        flex: 1,
                                        padding: "0.8rem",
                                        borderRadius: "12px",
                                        border: selected ? "2px solid #0284c7" : "1px solid #cbd5e1",
                                        background: selected ? "#e0f2fe" : "#fff",
                                        color: selected ? "#0369a1" : "#334155",
                                        fontWeight: 900,
                                        fontSize: "0.92rem",
                                        cursor: "pointer",
                                      }}
                                    >
                                      {tf === "True" ? "✅ True" : "❌ False"}
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                            {/* 3. MATCHING QUESTIONS */}
                            {q.type === "matching" && q.matchingPairs && (
                              <div style={{ display: "grid", gap: "0.55rem" }}>
                                {q.matchingPairs.map((pair, pIdx) => {
                                  const allRightOptions = q.matchingPairs!.map((p) => p.right);
                                  const chosen = currentRich?.matchingAnswers?.[pair.left] || "";
                                  return (
                                    <div
                                      key={pIdx}
                                      style={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr auto 1fr",
                                        alignItems: "center",
                                        gap: "0.75rem",
                                        background: "#fff",
                                        padding: "0.65rem 0.9rem",
                                        borderRadius: "10px",
                                        border: "1px solid #cbd5e1",
                                      }}
                                    >
                                      <span style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.88rem" }}>
                                        {pair.left}
                                      </span>
                                      <span style={{ color: "#64748b", fontWeight: 900 }}>➔</span>
                                      <select
                                        value={chosen}
                                        onChange={(e) => {
                                          const nextMap = {
                                            ...(currentRich?.matchingAnswers || {}),
                                            [pair.left]: e.target.value,
                                          };
                                          updateRichField(hw.id, q.id, { matchingAnswers: nextMap });
                                        }}
                                        style={{
                                          padding: "0.5rem 0.7rem",
                                          borderRadius: "8px",
                                          border: "1px solid #94a3b8",
                                          fontWeight: 700,
                                          fontSize: "0.85rem",
                                        }}
                                      >
                                        <option value="">-- Select Match --</option>
                                        {allRightOptions.map((rOpt) => (
                                          <option key={rOpt} value={rOpt}>
                                            {rOpt}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* 4. FILL IN THE BLANKS & 5. SIMPLE SPELLING */}
                            {(q.type === "fill-in-blank" || q.type === "spelling") && (
                              <div>
                                {q.type === "spelling" && q.correctAnswer && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      speakText(
                                        `Spell the word: ${q.correctAnswer}. Again, the word is ${q.correctAnswer}.`
                                      )
                                    }
                                    style={{
                                      background: "#0f766e",
                                      color: "#fff",
                                      border: "none",
                                      borderRadius: "10px",
                                      padding: "0.5rem 0.95rem",
                                      fontSize: "0.82rem",
                                      fontWeight: 800,
                                      cursor: "pointer",
                                      marginBottom: "0.6rem",
                                    }}
                                  >
                                    🔊 Hear Target Spelling Word Aloud
                                  </button>
                                )}
                                <input
                                  type="text"
                                  value={currentTxt}
                                  onChange={(e) => updateTextAnswer(hw.id, q.id, e.target.value)}
                                  placeholder={
                                    q.type === "spelling"
                                      ? "Type the exact spelling here..."
                                      : "Type the missing word or phrase to fill in the gap..."
                                  }
                                  style={{
                                    width: "100%",
                                    padding: "0.75rem 1rem",
                                    borderRadius: "12px",
                                    border: "1px solid #cbd5e1",
                                    fontSize: "0.95rem",
                                    fontWeight: 700,
                                    boxSizing: "border-box",
                                  }}
                                />
                              </div>
                            )}

                            {/* 6. READING COMPREHENSION & 8. CREATIVE WRITING / ESSAYS */}
                            {(q.type === "reading-comprehension" ||
                              q.type === "creative-writing" ||
                              q.type === "subjective") && (
                              <div>
                                <textarea
                                  rows={q.type === "creative-writing" ? 5 : 3}
                                  value={currentTxt}
                                  onChange={(e) => updateTextAnswer(hw.id, q.id, e.target.value)}
                                  placeholder={
                                    q.type === "creative-writing"
                                      ? "Write your creative story or essay here in complete sentences..."
                                      : "Type your reading comprehension answer in complete sentences..."
                                  }
                                  style={{
                                    width: "100%",
                                    padding: "0.8rem 1rem",
                                    borderRadius: "12px",
                                    border: "1px solid #cbd5e1",
                                    fontSize: "0.92rem",
                                    fontFamily: "inherit",
                                    boxSizing: "border-box",
                                  }}
                                />
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    flexWrap: "wrap",
                                    gap: "0.5rem",
                                    marginTop: "0.45rem",
                                  }}
                                >
                                  <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700 }}>
                                    Word count:{" "}
                                    {currentTxt.trim() ? currentTxt.trim().split(/\s+/).length : 0} words
                                  </span>
                                  <label
                                    style={{
                                      fontSize: "0.76rem",
                                      fontWeight: 800,
                                      color: "#4f46e5",
                                      cursor: "pointer",
                                      background: "#eef2ff",
                                      padding: "0.3rem 0.7rem",
                                      borderRadius: "8px",
                                    }}
                                  >
                                    📷 Or Upload Picture of Handwritten Work
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleUploadHandwrittenPhoto(hw.id, q.id, e)}
                                      style={{ display: "none" }}
                                    />
                                  </label>
                                </div>
                                {currentRich?.uploadedImageUrl && (
                                  <div style={{ marginTop: "0.5rem" }}>
                                    <img
                                      src={currentRich.uploadedImageUrl}
                                      alt="Uploaded Handwritten Page"
                                      style={{
                                        maxHeight: "120px",
                                        borderRadius: "10px",
                                        border: "1px solid #cbd5e1",
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            )}

                            {/* 7. HANDWRITING & DRAWING QUESTION */}
                            {q.type === "handwriting" && (
                              <div>
                                <HandwritingCanvasPad
                                  value={currentRich?.drawingDataUrl}
                                  onChange={(dataUrl) =>
                                    updateRichField(hw.id, q.id, { drawingDataUrl: dataUrl })
                                  }
                                />

                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    flexWrap: "wrap",
                                    gap: "0.75rem",
                                    marginTop: "0.75rem",
                                  }}
                                >
                                  <label
                                    style={{
                                      background: "#fef3c7",
                                      color: "#92400e",
                                      border: "1px solid #fde68a",
                                      padding: "0.5rem 0.95rem",
                                      borderRadius: "10px",
                                      fontSize: "0.8rem",
                                      fontWeight: 800,
                                      cursor: "pointer",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "0.4rem",
                                    }}
                                  >
                                    📷 Upload Picture of Handwritten Notebook Page
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleUploadHandwrittenPhoto(hw.id, q.id, e)}
                                      style={{ display: "none" }}
                                    />
                                  </label>

                                  <input
                                    type="text"
                                    value={currentTxt}
                                    onChange={(e) => updateTextAnswer(hw.id, q.id, e.target.value)}
                                    placeholder="Optional: Also type the sentence you wrote..."
                                    style={{
                                      flex: 1,
                                      minWidth: "220px",
                                      padding: "0.55rem 0.85rem",
                                      borderRadius: "10px",
                                      border: "1px solid #cbd5e1",
                                      fontSize: "0.84rem",
                                    }}
                                  />
                                </div>

                                {currentRich?.uploadedImageUrl && (
                                  <div style={{ marginTop: "0.6rem" }}>
                                    <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#15803d", marginBottom: "0.25rem" }}>
                                      ✓ Uploaded Handwritten Photo ({currentRich.uploadedFileName || "Image"}):
                                    </div>
                                    <img
                                      src={currentRich.uploadedImageUrl}
                                      alt="Handwritten work"
                                      style={{
                                        maxHeight: "140px",
                                        borderRadius: "10px",
                                        border: "2px solid #10b981",
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            )}

                            {/* 9. RECORDED VOICE READING QUESTION */}
                            {q.type === "recorded-reading" && (
                              <div
                                style={{
                                  background: "#fff",
                                  borderRadius: "12px",
                                  padding: "0.95rem",
                                  border: "1px solid #fed7aa",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.75rem",
                                    flexWrap: "wrap",
                                    marginBottom: "0.65rem",
                                  }}
                                >
                                  <button
                                    type="button"
                                    onClick={() => startVoiceRecording(hw.id, q)}
                                    style={{
                                      background:
                                        recordingQuestionId === q.id
                                          ? "#dc2626"
                                          : "linear-gradient(135deg, #ea580c, #f97316)",
                                      color: "#fff",
                                      border: "none",
                                      borderRadius: "10px",
                                      padding: "0.6rem 1.1rem",
                                      fontWeight: 900,
                                      fontSize: "0.84rem",
                                      cursor: "pointer",
                                    }}
                                  >
                                    {recordingQuestionId === q.id
                                      ? "⏹️ Stop Recording Reading"
                                      : "🎙️ Record Your Voice Reading Aloud"}
                                  </button>

                                  {currentRich?.voiceRecordingUrl && (
                                    <audio
                                      controls
                                      src={currentRich.voiceRecordingUrl}
                                      style={{ height: "36px" }}
                                    />
                                  )}
                                </div>

                                <input
                                  type="text"
                                  value={currentTxt}
                                  onChange={(e) => {
                                    updateTextAnswer(hw.id, q.id, e.target.value);
                                    updateRichField(hw.id, q.id, { voiceTranscript: e.target.value });
                                  }}
                                  placeholder="Live speech transcript appears here (or type the passage words you read aloud)..."
                                  style={{
                                    width: "100%",
                                    padding: "0.65rem 0.9rem",
                                    borderRadius: "10px",
                                    border: "1px solid #cbd5e1",
                                    fontSize: "0.85rem",
                                    boxSizing: "border-box",
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Bottom Action Bar: Save Unfinished Work ("In Progress") & Submit Homework */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: "0.75rem",
                          paddingTop: "0.5rem",
                        }}
                      >
                        <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap" }}>
                          <button
                            type="button"
                            disabled={savingDraftId === hw.id}
                            onClick={() => handleSaveUnfinishedWork(hw)}
                            style={{
                              padding: "0.8rem 1.35rem",
                              borderRadius: "12px",
                              border: "1px solid #0284c7",
                              background: "#e0f2fe",
                              color: "#0369a1",
                              fontWeight: 900,
                              fontSize: "0.88rem",
                              cursor: "pointer",
                            }}
                          >
                            {savingDraftId === hw.id
                              ? "Saving..."
                              : "💾 Save Unfinished Work (In Progress)"}
                          </button>

                          {revisingHomeworkId === hw.id && (
                            <button
                              type="button"
                              onClick={() => setRevisingHomeworkId(null)}
                              style={{
                                padding: "0.8rem 1.1rem",
                                borderRadius: "12px",
                                border: "1px solid #cbd5e1",
                                background: "#fff",
                                color: "#475569",
                                fontWeight: 800,
                                fontSize: "0.85rem",
                                cursor: "pointer",
                              }}
                            >
                              Cancel Revision
                            </button>
                          )}
                        </div>

                        <button
                          type="button"
                          disabled={submittingId === hw.id}
                          onClick={() => handleSubmitHomework(hw)}
                          style={{
                            padding: "0.85rem 1.75rem",
                            borderRadius: "12px",
                            border: "none",
                            background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                            color: "#fff",
                            fontWeight: 900,
                            fontSize: "0.92rem",
                            cursor: "pointer",
                            boxShadow: "0 8px 20px rgba(79,70,229,0.28)",
                          }}
                        >
                          {submittingId === hw.id
                            ? "Submitting & Evaluating..."
                            : revisingHomeworkId === hw.id
                            ? "🚀 Submit Revised Homework"
                            : "✅ Submit Homework Online"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

