"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  Award,
  AlertCircle,
  CheckCircle2,
  Calendar,
  BookOpen,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import {
  analyzeStudentProgressAndAlerts,
  type StudentProgressRecord,
  type HomeworkSubmission,
  type AiPracticeLog,
} from "@/lib/lmsData";

interface StudentProgressModuleProps {
  studentName: string;
  studentUsername: string;
  grade: string;
  courseName: string;
  progress: StudentProgressRecord | null;
  submissions: HomeworkSubmission[];
  aiLogs: AiPracticeLog[];
}

export default function StudentProgressModule({
  studentName,
  studentUsername,
  grade,
  courseName,
  progress,
  submissions,
  aiLogs,
}: StudentProgressModuleProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<
    "daily" | "weekly" | "monthly" | "termly"
  >("weekly");

  const analysis = analyzeStudentProgressAndAlerts(progress, submissions, aiLogs);
  const {
    subjectTracks,
    periodSummaries,
    weaknesses,
    recommendations,
    isStruggling,
    strugglingReasons,
  } = analysis;

  const activePeriodObj = periodSummaries[selectedPeriod];
  const observations = progress?.teacherObservations || [];
  const strengths = progress?.customStrengths || [];

  const SUBJECT_COLORS: Record<string, { main: string; bg: string; border: string }> = {
    english_phonics: { main: "#0284c7", bg: "#e0f2fe", border: "#bae6fd" },
    writing: { main: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
    mathematics: { main: "#d97706", bg: "#fffbeb", border: "#fde68a" },
    public_speaking: { main: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
    coding: { main: "#4f46e5", bg: "#eef2ff", border: "#c7d2fe" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* =====================================================================
          EARLY WARNING / TEACHER ATTENTION BANNER (If student is struggling)
          ===================================================================== */}
      {isStruggling && (
        <div
          style={{
            background: "linear-gradient(135deg, #fffbeb 0%, #fef2f2 100%)",
            border: "2px solid #f59e0b",
            borderRadius: 18,
            padding: "18px 22px",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <AlertCircle size={24} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: "0.74rem", fontWeight: 800, color: "#b45309", textTransform: "uppercase" }}>
                🚩 Priority Academic Support Flagged for Teacher Attention
              </div>
              <div style={{ fontSize: "1.05rem", fontWeight: 900, color: "#0f172a", marginTop: 2 }}>
                Extra 1-on-1 Coaching Recommended for {studentName}
              </div>
              <ul style={{ margin: "6px 0 0", paddingLeft: 18, fontSize: "0.84rem", color: "#78350f" }}>
                {strugglingReasons.map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
          <span
            style={{
              background: "#fef3c7",
              color: "#b45309",
              border: "1px solid #fcd34d",
              padding: "6px 14px",
              borderRadius: 999,
              fontSize: "0.76rem",
              fontWeight: 800,
            }}
          >
            👩‍🏫 Teacher Notified
          </span>
        </div>
      )}

      {/* =====================================================================
          1. DAILY, WEEKLY, MONTHLY & TERMLY PROGRESS TRACKER
          ===================================================================== */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: 20,
          padding: 24,
          border: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 18,
          }}
        >
          <div>
            <span style={{ fontSize: "0.73rem", fontWeight: 800, color: "#1d4ed8", textTransform: "uppercase" }}>
              Module D • Multi-Horizon Academic Tracking
            </span>
            <h2 style={{ margin: "2px 0 0", fontSize: "1.25rem", fontWeight: 900, color: "#0f172a" }}>
              📅 Daily, Weekly, Monthly & Termly Progress
            </h2>
          </div>

          <div
            style={{
              display: "inline-flex",
              background: "#f1f5f9",
              padding: 4,
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              gap: 4,
              flexWrap: "wrap",
            }}
          >
            {(["daily", "weekly", "monthly", "termly"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setSelectedPeriod(p)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 9,
                  border: "none",
                  background: selectedPeriod === p ? "#0f172a" : "transparent",
                  color: selectedPeriod === p ? "#ffffff" : "#475569",
                  fontWeight: 800,
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {p} Progress
              </button>
            ))}
          </div>
        </div>

        {/* 4 Period Summary Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 14,
            marginBottom: 16,
          }}
        >
          {(["daily", "weekly", "monthly", "termly"] as const).map((pKey) => {
            const pObj = periodSummaries[pKey];
            const isSelected = selectedPeriod === pKey;
            const pct =
              pObj.targetLessons > 0
                ? Math.min(100, Math.round((pObj.lessonsDone / pObj.targetLessons) * 100))
                : 0;
            return (
              <div
                key={pKey}
                onClick={() => setSelectedPeriod(pKey)}
                style={{
                  background: isSelected ? "#eff6ff" : "#f8fafc",
                  border: isSelected ? "2px solid #2563eb" : "1px solid #e2e8f0",
                  borderRadius: 14,
                  padding: 16,
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, color: isSelected ? "#1d4ed8" : "#64748b", textTransform: "uppercase" }}>
                    {pObj.label}
                  </span>
                  <span
                    style={{
                      background: "#ffffff",
                      border: "1px solid #cbd5e1",
                      padding: "2px 8px",
                      borderRadius: 999,
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      color: "#0f172a",
                    }}
                  >
                    Avg: {pObj.avgScore}%
                  </span>
                </div>

                <div style={{ fontSize: "1.35rem", fontWeight: 900, color: "#0f172a" }}>
                  {pObj.lessonsDone} / {pObj.targetLessons} Lessons
                </div>
                <div style={{ fontSize: "0.76rem", color: "#475569", margin: "4px 0 8px" }}>
                  ⏱️ {pObj.practiceMinutes} mins active practice
                </div>

                <div style={{ height: 8, background: "#e2e8f0", borderRadius: 999, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${pct}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #2563eb, #10b981)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            background: "#f8fafc",
            borderRadius: 12,
            padding: "12px 16px",
            border: "1px solid #e2e8f0",
            fontSize: "0.84rem",
            color: "#334155",
          }}
        >
          <strong>{activePeriodObj.label} Focus:</strong> {activePeriodObj.summaryNote}
        </div>
      </div>

      {/* =====================================================================
          2. SUBJECT-BY-SUBJECT SKILL MASTERY & BEFORE/AFTER ASSESSMENTS
          ===================================================================== */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: 20,
          padding: 24,
          border: "1px solid #e2e8f0",
        }}
      >
        <div style={{ marginBottom: 18 }}>
          <span style={{ fontSize: "0.73rem", fontWeight: 800, color: "#059669", textTransform: "uppercase" }}>
            5 Core Subjects • 18 Measured Sub-Skills
          </span>
          <h2 style={{ margin: "2px 0 4px", fontSize: "1.25rem", fontWeight: 900, color: "#0f172a" }}>
            🎯 Subject Mastery Percentages & Sub-Skill Breakdown
          </h2>
          <p style={{ margin: 0, fontSize: "0.84rem", color: "#64748b" }}>
            Tracks progress across English/Phonics, Writing, Mathematics, Public Speaking, and Coding.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))",
            gap: 18,
          }}
        >
          {subjectTracks.map((track) => {
            const theme = SUBJECT_COLORS[track.subjectKey] || SUBJECT_COLORS.english_phonics;
            const growth = track.afterScore - track.beforeScore;
            return (
              <div
                key={track.subjectKey}
                style={{
                  background: "#ffffff",
                  borderRadius: 16,
                  padding: 20,
                  border: `1.5px solid ${theme.border}`,
                  boxShadow: "0 4px 14px rgba(15, 23, 42, 0.03)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "1.08rem", fontWeight: 900, color: "#0f172a" }}>
                        {track.subjectLabel}
                      </h3>
                      <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 2 }}>
                        Measures: {track.whatToMeasure}
                      </div>
                    </div>
                    <span
                      style={{
                        background: theme.bg,
                        color: theme.main,
                        padding: "4px 10px",
                        borderRadius: 999,
                        fontSize: "0.78rem",
                        fontWeight: 900,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {track.afterScore}% Mastery
                    </span>
                  </div>

                  {/* Before vs After Assessment Strip */}
                  <div
                    style={{
                      background: "#f8fafc",
                      borderRadius: 10,
                      padding: "10px 12px",
                      border: "1px solid #e2e8f0",
                      marginBottom: 14,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "0.78rem",
                    }}
                  >
                    <div>
                      <span style={{ color: "#64748b", fontWeight: 700 }}>Before Assessment: </span>
                      <strong style={{ color: "#0f172a" }}>{track.beforeScore}%</strong>
                    </div>
                    <div>
                      <span style={{ color: "#64748b", fontWeight: 700 }}>After / Current: </span>
                      <strong style={{ color: theme.main }}>{track.afterScore}%</strong>
                    </div>
                    <span
                      style={{
                        background: growth >= 0 ? "#dcfce7" : "#fee2e2",
                        color: growth >= 0 ? "#15803d" : "#b91c1c",
                        padding: "2px 8px",
                        borderRadius: 999,
                        fontWeight: 800,
                        fontSize: "0.72rem",
                      }}
                    >
                      {growth >= 0 ? `+${growth}% Growth` : `${growth}%`}
                    </span>
                  </div>

                  {/* Individual Sub-Skills */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {track.skills.map((sk) => {
                      const low = sk.mastery > 0 && sk.mastery < 65;
                      return (
                        <div key={sk.id}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              marginBottom: 4,
                            }}
                          >
                            <span style={{ color: "#334155" }}>
                              {sk.label} {low && <span style={{ color: "#d97706" }}>(Needs Practice)</span>}
                            </span>
                            <span style={{ color: low ? "#d97706" : theme.main, fontWeight: 800 }}>
                              {sk.mastery}%
                            </span>
                          </div>
                          <div style={{ height: 8, background: "#f1f5f9", borderRadius: 999, overflow: "hidden" }}>
                            <div
                              style={{
                                width: `${sk.mastery}%`,
                                height: "100%",
                                background: low ? "#f59e0b" : theme.main,
                                borderRadius: 999,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =====================================================================
          3. BEFORE-AND-AFTER ASSESSMENT COMPARISON TABLE
          ===================================================================== */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: 20,
          padding: 24,
          border: "1px solid #e2e8f0",
        }}
      >
        <h3 style={{ margin: "0 0 12px", fontSize: "1.12rem", fontWeight: 900, color: "#0f172a" }}>
          📊 Before-and-After Diagnostic Assessment Comparison
        </h3>
        <div className="curriculum-table-wrapper" style={{ marginTop: 0 }}>
          <table className="curriculum-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>What Is Measured</th>
                <th>Before Assessment (Baseline)</th>
                <th>After Assessment (Current)</th>
                <th>Net Improvement</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {subjectTracks.map((t) => {
                const diff = t.afterScore - t.beforeScore;
                const statusLabel =
                  t.afterScore >= 85
                    ? "Mastered"
                    : t.afterScore >= 70
                    ? "On Track"
                    : t.afterScore > 0
                    ? "Needs Support"
                    : "Awaiting Baseline";
                return (
                  <tr key={t.subjectKey}>
                    <td style={{ fontWeight: 800, color: "#0f172a" }}>{t.subjectLabel}</td>
                    <td>{t.whatToMeasure}</td>
                    <td style={{ fontWeight: 700 }}>{t.beforeScore}%</td>
                    <td style={{ fontWeight: 800, color: "#0284c7" }}>{t.afterScore}%</td>
                    <td style={{ fontWeight: 800, color: diff >= 0 ? "#059669" : "#dc2626" }}>
                      {diff >= 0 ? `+${diff}%` : `${diff}%`}
                    </td>
                    <td>
                      <span
                        style={{
                          padding: "3px 10px",
                          borderRadius: 999,
                          fontSize: "0.72rem",
                          fontWeight: 800,
                          background:
                            statusLabel === "Mastered"
                              ? "#dcfce7"
                              : statusLabel === "On Track"
                              ? "#e0f2fe"
                              : statusLabel === "Needs Support"
                              ? "#fef3c7"
                              : "#f1f5f9",
                          color:
                            statusLabel === "Mastered"
                              ? "#15803d"
                              : statusLabel === "On Track"
                              ? "#0369a1"
                              : statusLabel === "Needs Support"
                              ? "#b45309"
                              : "#64748b",
                        }}
                      >
                        {statusLabel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================================
          4. WEAKNESS IDENTIFICATION, IMPROVEMENT RECOMMENDATIONS & STRENGTHS
          ===================================================================== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))",
          gap: 18,
        }}
      >
        {/* Key Strengths */}
        <div
          style={{
            background: "#ecfdf5",
            borderRadius: 18,
            padding: 20,
            border: "1px solid #a7f3d0",
          }}
        >
          <h3 style={{ margin: "0 0 10px", fontSize: "1.02rem", fontWeight: 900, color: "#065f46" }}>
            ✅ Observed Strengths & Achievements
          </h3>
          {strengths.length === 0 ? (
            <p style={{ margin: 0, fontSize: "0.84rem", color: "#047857" }}>
              Complete online homework or Bright Buddy sessions to automatically record key academic strengths.
            </p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18, color: "#064e3b", fontSize: "0.85rem", lineHeight: 1.65 }}>
              {strengths.map((s, idx) => (
                <li key={idx}>{s}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Weakness Identification */}
        <div
          style={{
            background: "#fffbeb",
            borderRadius: 18,
            padding: 20,
            border: "1px solid #fde68a",
          }}
        >
          <h3 style={{ margin: "0 0 10px", fontSize: "1.02rem", fontWeight: 900, color: "#92400e" }}>
            🎯 Weakness Identification (Focus Areas)
          </h3>
          {weaknesses.length === 0 ? (
            <p style={{ margin: 0, fontSize: "0.84rem", color: "#78350f" }}>
              No skill weaknesses flagged yet. Skills below 65% or missed homework/reading words are automatically listed here.
            </p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18, color: "#78350f", fontSize: "0.85rem", lineHeight: 1.65 }}>
              {weaknesses.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Actionable Improvement Recommendations */}
        <div
          style={{
            background: "#eff6ff",
            borderRadius: 18,
            padding: 20,
            border: "1px solid #bfdbfe",
          }}
        >
          <h3 style={{ margin: "0 0 10px", fontSize: "1.02rem", fontWeight: 900, color: "#1e3a8a" }}>
            💡 Personalized Improvement Recommendations
          </h3>
          {recommendations.length === 0 ? (
            <p style={{ margin: 0, fontSize: "0.84rem", color: "#1e40af" }}>
              Continue daily 15-minute Bright Buddy reading, phonics, and math practice to unlock tailored next-step recommendations.
            </p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18, color: "#1e3a8a", fontSize: "0.85rem", lineHeight: 1.65 }}>
              {recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* =====================================================================
          5. TEACHER OBSERVATIONS LOG
          ===================================================================== */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: 20,
          padding: 24,
          border: "1px solid #e2e8f0",
        }}
      >
        <h3 style={{ margin: "0 0 12px", fontSize: "1.1rem", fontWeight: 900, color: "#0f172a" }}>
          👩‍🏫 Teacher Observations & 1-on-1 Class Notes ({observations.length})
        </h3>
        {observations.length === 0 ? (
          <div style={{ padding: 16, borderRadius: 12, background: "#f8fafc", color: "#64748b", fontSize: "0.85rem" }}>
            No teacher observation notes posted yet. After 1-on-1 live classes or assessments, your teacher’s observations and recommendations appear here.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {observations.map((obs) => (
              <div
                key={obs.id}
                style={{
                  padding: 16,
                  borderRadius: 14,
                  background: "#f8fafc",
                  border: "1px solid #cbd5e1",
                  borderLeft: "4px solid #4f46e5",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontWeight: 800, fontSize: "0.86rem", color: "#4338ca" }}>
                    📌 {obs.subject} • {obs.teacherName || "Bright Path Educator"}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                    {new Date(obs.createdAt).toLocaleString()}
                  </span>
                </div>
                <div style={{ fontSize: "0.88rem", color: "#0f172a", lineHeight: 1.55 }}>
                  {obs.observation}
                </div>
                {obs.recommendation && (
                  <div style={{ marginTop: 6, fontSize: "0.82rem", fontWeight: 700, color: "#059669" }}>
                    👉 Recommended Action: {obs.recommendation}
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

