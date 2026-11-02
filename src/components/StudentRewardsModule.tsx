"use client";

import React, { useState } from "react";
import { Download, Award, Sparkles, Shield, Flame, Star, CheckCircle2 } from "lucide-react";
import {
  computeStudentRewardsAndAchievements,
  analyzeStudentProgressAndAlerts,
  type StudentProgressRecord,
  type HomeworkSubmission,
  type AiPracticeLog,
  type BadgeCategory,
  type LeaderboardGlobalSettings,
} from "@/lib/lmsData";
import { downloadCertificatePdf } from "@/lib/pdfReportGenerator";
import type { ToastType } from "./ToastNotification";

interface LeaderboardRow {
  rank: number;
  studentUsername: string;
  displayName: string;
  avatarUrl: string;
  totalPoints: number;
  homeworkPoints: number;
  streakDays: number;
  badgesCount: number;
  starLevelTitle: string;
  isCurrentUser: boolean;
}

interface StudentRewardsModuleProps {
  studentName: string;
  studentUsername: string;
  grade: string;
  courseName: string;
  progress: StudentProgressRecord | null;
  submissions: HomeworkSubmission[];
  aiLogs: AiPracticeLog[];
  leaderboard?: LeaderboardRow[];
  leaderboardSettings?: LeaderboardGlobalSettings;
  onProfileUpdated: () => void;
  showToast: (msg: string, type?: ToastType) => void;
}

export default function StudentRewardsModule({
  studentName,
  studentUsername,
  grade,
  courseName,
  progress,
  submissions,
  aiLogs,
  leaderboard = [],
  leaderboardSettings = {
    enabled: true,
    anonymizeNames: true,
    hideForEarlyYears: true,
  },
  onProfileUpdated,
  showToast,
}: StudentRewardsModuleProps) {
  const [badgeFilter, setBadgeFilter] = useState<string>("all");
  const [savingPrivacy, setSavingPrivacy] = useState(false);

  const rewards = computeStudentRewardsAndAchievements(
    progress,
    submissions,
    aiLogs,
    studentName,
    studentUsername,
    grade,
    courseName
  );

  const subjectAnalysis = analyzeStudentProgressAndAlerts(
    progress,
    submissions,
    aiLogs
  );

  const currentPrivacy = progress?.leaderboardPrivacy || "initials";
  const isEarlyYearsMode = rewards.earlyYears;

  const filteredBadges = rewards.allBadges.filter((b) => {
    if (badgeFilter === "all") return true;
    return (b.category || "general") === badgeFilter;
  });

  const handleUpdatePrivacyOrMode = async (
    nextPrivacy: "public" | "initials" | "private",
    nextEarlyYearsMode?: boolean
  ) => {
    setSavingPrivacy(true);
    try {
      const res = await fetch("/api/lms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-student-profile",
          studentUsername,
          studentName,
          leaderboardPrivacy: nextPrivacy,
          earlyYearsFocusMode:
            typeof nextEarlyYearsMode === "boolean"
              ? nextEarlyYearsMode
              : progress?.earlyYearsFocusMode,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Rewards & privacy preference saved!", "success");
        onProfileUpdated();
      }
    } catch {
      showToast("Could not update privacy setting.", "error");
    } finally {
      setSavingPrivacy(false);
    }
  };

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* =====================================================================
          1. MOTIVATIONAL POINTS & STAR LEVEL PROGRESSION HERO
          ===================================================================== */}
      <div
        style={{
          background: "linear-gradient(135deg, #071527 0%, #1e3a8a 60%, #312e81 100%)",
          color: "#ffffff",
          borderRadius: 20,
          padding: "24px 28px",
          border: "2px solid rgba(251, 191, 36, 0.35)",
          boxShadow: "0 16px 36px rgba(15, 23, 42, 0.14)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 18,
            marginBottom: 20,
          }}
        >
          <div>
            <span
              style={{
                background: "rgba(251, 191, 36, 0.2)",
                color: "#fbbf24",
                padding: "4px 12px",
                borderRadius: 999,
                fontSize: "0.72rem",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              🌟 Level {rewards.starLevel.level} • {rewards.starLevel.title}
            </span>
            <h2 style={{ margin: "8px 0 4px", fontSize: "1.45rem", fontWeight: 900 }}>
              🏅 {studentName}&#39;s Rewards, Badges & Learning Achievements
            </h2>
            <p style={{ margin: 0, fontSize: "0.86rem", color: "#cbd5e1" }}>
              Earn points for completing homework, reading aloud to Bright Buddy, attending live classes, and unlocking teacher awards!
            </p>
          </div>

          <div
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(251, 191, 36, 0.45)",
              borderRadius: 16,
              padding: "14px 22px",
              textAlign: "center",
              minWidth: 165,
            }}
          >
            <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#fbbf24", textTransform: "uppercase" }}>
              TOTAL STAR POINTS
            </div>
            <div style={{ fontSize: "2.1rem", fontWeight: 900, color: "#ffffff", lineHeight: 1.15 }}>
              {rewards.totalPoints} <span style={{ fontSize: "1rem", color: "#fbbf24" }}>pts</span>
            </div>
            <div style={{ fontSize: "0.72rem", color: "#cbd5e1", marginTop: 2 }}>
              Next milestone: {rewards.starLevel.nextAt} pts
            </div>
          </div>
        </div>

        {/* Points Breakdown Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(185px, 1fr))",
            gap: 12,
          }}
        >
          <div
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              borderRadius: 14,
              padding: "12px 16px",
              border: "1px solid rgba(255, 255, 255, 0.14)",
            }}
          >
            <div style={{ fontSize: "0.72rem", color: "#cbd5e1", fontWeight: 700 }}>
              📝 Homework Completion Points
            </div>
            <div style={{ fontSize: "1.35rem", fontWeight: 900, color: "#fbbf24", marginTop: 2 }}>
              +{rewards.homeworkPoints} pts
            </div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
              +50 pts per homework + high-score bonus
            </div>
          </div>

          <div
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              borderRadius: 14,
              padding: "12px 16px",
              border: "1px solid rgba(255, 255, 255, 0.14)",
            }}
          >
            <div style={{ fontSize: "0.72rem", color: "#cbd5e1", fontWeight: 700 }}>
              🤖 Bright Buddy AI Points
            </div>
            <div style={{ fontSize: "1.35rem", fontWeight: 900, color: "#38bdf8", marginTop: 2 }}>
              +{rewards.aiPracticePoints} pts
            </div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
              +30 pts per Reading, Math or Writing session
            </div>
          </div>

          <div
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              borderRadius: 14,
              padding: "12px 16px",
              border: "1px solid rgba(255, 255, 255, 0.14)",
            }}
          >
            <div style={{ fontSize: "0.72rem", color: "#cbd5e1", fontWeight: 700 }}>
              📅 Attendance & Live Lessons
            </div>
            <div style={{ fontSize: "1.35rem", fontWeight: 900, color: "#34d399", marginTop: 2 }}>
              +{rewards.attendanceLessonPoints} pts
            </div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
              +20 pts per lesson & punctuality bonus
            </div>
          </div>

          <div
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              borderRadius: 14,
              padding: "12px 16px",
              border: "1px solid rgba(255, 255, 255, 0.14)",
            }}
          >
            <div style={{ fontSize: "0.72rem", color: "#cbd5e1", fontWeight: 700 }}>
              🌟 Teacher-Awarded Bonus
            </div>
            <div style={{ fontSize: "1.35rem", fontWeight: 900, color: "#f472b6", marginTop: 2 }}>
              +{rewards.teacherBonusPoints + (progress?.badges || []).reduce((a, b) => a + (b.pointsValue || 0), 0)} pts
            </div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
              Special teacher commendations
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          2. WEEKLY LEARNING STREAK TRACKER (MON – SUN)
          ===================================================================== */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: 18,
          padding: 22,
          border: "1px solid #fed7aa",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 18,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "linear-gradient(135deg, #f97316 0%, #ef4444 100%)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.75rem",
              boxShadow: "0 8px 18px rgba(239, 68, 68, 0.25)",
            }}
          >
            🔥
          </div>
          <div>
            <div style={{ fontSize: "0.73rem", fontWeight: 900, color: "#ea580c", textTransform: "uppercase" }}>
              WEEKLY LEARNING STREAK
            </div>
            <h3 style={{ margin: "2px 0", fontSize: "1.2rem", fontWeight: 900, color: "#0f172a" }}>
              {rewards.streakDays}-Day Active Learning Streak!
            </h3>
            <p style={{ margin: 0, fontSize: "0.82rem", color: "#64748b" }}>
              Practise reading, math, or complete homework each day to keep your weekly streak glowing!
            </p>
          </div>
        </div>

        {/* 7-Day Mon–Sun Strip */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {dayNames.map((day) => {
            const isActive = rewards.activeDaysOfWeek.includes(day);
            return (
              <div
                key={day}
                style={{
                  width: 50,
                  padding: "8px 4px",
                  borderRadius: 12,
                  textAlign: "center",
                  background: isActive ? "#fff7ed" : "#f8fafc",
                  border: isActive ? "2px solid #f97316" : "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 800,
                    color: isActive ? "#ea580c" : "#64748b",
                  }}
                >
                  {day}
                </div>
                <div style={{ fontSize: "1.1rem", marginTop: 4 }}>
                  {isActive ? "🔥" : "⚪"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =====================================================================
          3. EARLY-YEARS INDIVIDUAL IMPROVEMENT FOCUS (NO PEER PRESSURE)
          ===================================================================== */}
      {isEarlyYearsMode && (
        <div
          style={{
            background: "linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)",
            border: "2px solid #6ee7b7",
            borderRadius: 18,
            padding: 22,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
            <div>
              <span
                style={{
                  background: "#059669",
                  color: "#ffffff",
                  padding: "3px 10px",
                  borderRadius: 999,
                  fontSize: "0.7rem",
                  fontWeight: 900,
                  textTransform: "uppercase",
                }}
              >
                🌱 Early-Years Personal Growth Mode Active
              </span>
              <h3 style={{ margin: "6px 0 2px", fontSize: "1.15rem", fontWeight: 900, color: "#064e3b" }}>
                Celebrating {studentName}&#39;s Individual Improvement Journey!
              </h3>
              <p style={{ margin: 0, fontSize: "0.84rem", color: "#047857" }}>
                For early-years learners, we focus on how much <strong>you</strong> have grown compared to where you started—not comparing you against other children.
              </p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              gap: 12,
            }}
          >
            {subjectAnalysis.subjectTracks.map((tr) => {
              const gain = Math.max(0, tr.afterScore - tr.beforeScore);
              return (
                <div
                  key={tr.subjectKey}
                  style={{
                    background: "#ffffff",
                    borderRadius: 14,
                    padding: 14,
                    border: "1px solid #a7f3d0",
                  }}
                >
                  <div style={{ fontWeight: 900, fontSize: "0.88rem", color: "#0f172a" }}>
                    🌟 {tr.subjectLabel}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, fontSize: "0.8rem" }}>
                    <span style={{ color: "#64748b" }}>Started: {tr.beforeScore}%</span>
                    <span style={{ fontWeight: 900, color: "#059669" }}>Now: {tr.afterScore}%</span>
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      background: "#ecfdf5",
                      color: "#047857",
                      padding: "4px 8px",
                      borderRadius: 8,
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      textAlign: "center",
                    }}
                  >
                    🎉 +{gain}% Personal Improvement!
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          4. CATEGORIZED BADGES GALLERY (READING, MATH, ATTENDANCE, HOMEWORK, TEACHER)
          ===================================================================== */}
      <div style={{ background: "#ffffff", borderRadius: 18, padding: 24, border: "1px solid #e2e8f0" }}>
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
            <h3 style={{ margin: "0 0 4px", fontSize: "1.15rem", fontWeight: 900, color: "#0f172a" }}>
              🏅 Achievement Badges Collection ({rewards.unlockedBadges.length} Unlocked of {rewards.allBadges.length})
            </h3>
            <p style={{ margin: 0, fontSize: "0.84rem", color: "#64748b" }}>
              Includes Reading badges, Mathematics badges, Attendance badges, Homework & Streak badges, and Teacher-Awarded achievements.
            </p>
          </div>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[
              { id: "all", label: "All Badges" },
              { id: "reading", label: "📖 Reading" },
              { id: "mathematics", label: "🔢 Mathematics" },
              { id: "attendance", label: "📅 Attendance" },
              { id: "homework", label: "📝 Homework" },
              { id: "streak", label: "🔥 Streaks" },
              { id: "teacher-award", label: "🌟 Teacher Awards" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setBadgeFilter(tab.id)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 999,
                  border: badgeFilter === tab.id ? "none" : "1px solid #cbd5e1",
                  background: badgeFilter === tab.id ? "#0f172a" : "#f8fafc",
                  color: badgeFilter === tab.id ? "#ffffff" : "#334155",
                  fontSize: "0.76rem",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(225px, 1fr))",
            gap: 16,
          }}
        >
          {filteredBadges.map((b) => (
            <div
              key={b.id}
              style={{
                borderRadius: 16,
                padding: 18,
                background: b.unlocked ? "#f8fafc" : "#f1f5f9",
                border: b.unlocked ? `2px solid ${b.color || "#f59e0b"}` : "1px dashed #cbd5e1",
                opacity: b.unlocked ? 1 : 0.78,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ fontSize: "2.35rem" }}>{b.icon}</div>
                  <span
                    style={{
                      background: b.unlocked ? "#dcfce7" : "#e2e8f0",
                      color: b.unlocked ? "#15803d" : "#475569",
                      padding: "2px 9px",
                      borderRadius: 999,
                      fontSize: "0.68rem",
                      fontWeight: 800,
                      textTransform: "uppercase",
                    }}
                  >
                    {b.unlocked ? "✓ Unlocked" : "🔒 In Progress"}
                  </span>
                </div>
                <div style={{ fontWeight: 900, fontSize: "0.96rem", color: "#0f172a", marginTop: 8 }}>
                  {b.title}
                </div>
                <p style={{ fontSize: "0.8rem", color: "#475569", margin: "4px 0 0", lineHeight: 1.45 }}>
                  {b.description}
                </p>
              </div>

              <div>
                {b.awardedBy && (
                  <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#7c3aed", marginBottom: 4 }}>
                    🌟 {b.requirementText}
                  </div>
                )}
                {!b.unlocked && (
                  <>
                    <div style={{ fontSize: "0.7rem", color: "#64748b", marginBottom: 4 }}>
                      Goal: {b.requirementText}
                    </div>
                    <div style={{ height: 7, background: "#e2e8f0", borderRadius: 999, overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${b.progressPercent}%`,
                          height: "100%",
                          background: b.color || "#3b82f6",
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =====================================================================
          5. OFFICIAL PRINTABLE & DOWNLOADABLE CERTIFICATES CABINET
          ===================================================================== */}
      <div style={{ background: "#ffffff", borderRadius: 18, padding: 24, border: "1px solid #e2e8f0" }}>
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ margin: "0 0 4px", fontSize: "1.15rem", fontWeight: 900, color: "#0f172a" }}>
            🎓 Official Bright Path Achievement Certificates ({rewards.certificates.length})
          </h3>
          <p style={{ margin: 0, fontSize: "0.84rem", color: "#64748b" }}>
            Download or print your official gold-bordered Bright Path Learning Hub achievement certificates!
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 16,
          }}
        >
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      background: "#071527",
                      color: "#fbbf24",
                      padding: "3px 10px",
                      borderRadius: 999,
                      fontSize: "0.68rem",
                      fontWeight: 800,
                    }}
                  >
                    REF #{cert.certRef}
                  </span>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#92400e" }}>
                    {new Date(cert.issuedAt).toLocaleDateString()}
                  </span>
                </div>
                <h4 style={{ margin: "10px 0 6px", fontSize: "1.05rem", fontWeight: 900, color: "#0f172a" }}>
                  🏆 {cert.title}
                </h4>
                <p style={{ margin: 0, fontSize: "0.82rem", color: "#78350f", lineHeight: 1.5 }}>
                  {cert.citation}
                </p>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "#b45309" }}>
                  Signed: {cert.issuedBy}
                </span>
                <button
                  type="button"
                  onClick={() => downloadCertificatePdf(cert)}
                  style={{
                    background: "#071527",
                    color: "#ffffff",
                    border: "none",
                    padding: "8px 14px",
                    borderRadius: 8,
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Download size={14} /> Print / Download Certificate PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =====================================================================
          6. OPTIONAL & PRIVACY-CONTROLLED STUDENT LEADERBOARD
          ===================================================================== */}
      <div style={{ background: "#ffffff", borderRadius: 18, padding: 24, border: "1px solid #e2e8f0" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 14,
            marginBottom: 16,
          }}
        >
          <div>
            <h3 style={{ margin: "0 0 4px", fontSize: "1.15rem", fontWeight: 900, color: "#0f172a" }}>
              🏆 Bright Path Scholar Community & Privacy Controls
            </h3>
            <p style={{ margin: 0, fontSize: "0.83rem", color: "#64748b" }}>
              Optional and privacy-controlled. Choose how your profile appears—or switch to Personal Growth Focus at any time.
            </p>
          </div>

          {/* Privacy & Early-Years Mode Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <select
              value={currentPrivacy}
              disabled={savingPrivacy}
              onChange={(e) =>
                handleUpdatePrivacyOrMode(
                  e.target.value as "public" | "initials" | "private"
                )
              }
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: "1px solid #cbd5e1",
                background: "#f8fafc",
                fontSize: "0.8rem",
                fontWeight: 800,
                color: "#0f172a",
              }}
            >
              <option value="initials">🔒 Privacy: Show Initials Only (Recommended)</option>
              <option value="public">🌍 Show First & Last Name</option>
              <option value="private">🛡️ Private: Hide Me from Leaderboard</option>
            </select>

            <button
              type="button"
              disabled={savingPrivacy}
              onClick={() => handleUpdatePrivacyOrMode(currentPrivacy, !isEarlyYearsMode)}
              style={{
                padding: "8px 14px",
                borderRadius: 10,
                border: "1px solid #6ee7b7",
                background: isEarlyYearsMode ? "#059669" : "#ecfdf5",
                color: isEarlyYearsMode ? "#ffffff" : "#065f46",
                fontSize: "0.78rem",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              🌱 {isEarlyYearsMode ? "Early-Years Personal Focus: ON" : "Switch to Personal Focus Mode"}
            </button>
          </div>
        </div>

        {!leaderboardSettings.enabled ? (
          <div
            style={{
              padding: 20,
              borderRadius: 14,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              color: "#475569",
              fontSize: "0.85rem",
            }}
          >
            🌱 Your teacher has set the learning portal to <strong>Individual Improvement Mode</strong> for all students so everyone focuses on beating their own personal best!
          </div>
        ) : isEarlyYearsMode && leaderboardSettings.hideForEarlyYears ? (
          <div
            style={{
              padding: 20,
              borderRadius: 14,
              background: "#ecfdf5",
              border: "1px solid #a7f3d0",
              color: "#065f46",
              fontSize: "0.86rem",
            }}
          >
            🌱 <strong>Early-Years Individual Improvement Focus:</strong> To nurture confidence without peer pressure, competitive rankings are hidden in Early-Years Mode. Keep collecting stars, streaks, and stickers on your personal journey above!
          </div>
        ) : currentPrivacy === "private" ? (
          <div
            style={{
              padding: 20,
              borderRadius: 14,
              background: "#f8fafc",
              border: "1px solid #cbd5e1",
              color: "#334155",
              fontSize: "0.85rem",
            }}
          >
            🛡️ <strong>Privacy Mode Active:</strong> Your profile is hidden from the community leaderboard. You can still earn all points, streaks, badges, and official certificates privately!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {leaderboard.slice(0, 10).map((row) => (
              <div
                key={row.studentUsername}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 10,
                  padding: "12px 16px",
                  borderRadius: 12,
                  background: row.isCurrentUser ? "#eff6ff" : "#f8fafc",
                  border: row.isCurrentUser ? "2px solid #2563eb" : "1px solid #e2e8f0",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background:
                        row.rank === 1
                          ? "#f59e0b"
                          : row.rank === 2
                          ? "#94a3b8"
                          : row.rank === 3
                          ? "#d97706"
                          : "#e2e8f0",
                      color: row.rank <= 3 ? "#ffffff" : "#334155",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                      fontSize: "0.8rem",
                    }}
                  >
                    #{row.rank}
                  </span>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: "0.9rem", color: "#0f172a" }}>
                      {row.displayName}
                    </div>
                    <div style={{ fontSize: "0.74rem", color: "#64748b" }}>
                      {row.starLevelTitle} • 🔥 {row.streakDays}-day streak • 🏅 {row.badgesCount} badges
                    </div>
                  </div>
                </div>

                <div style={{ fontWeight: 900, fontSize: "1rem", color: "#1d4ed8" }}>
                  {row.totalPoints} pts
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

