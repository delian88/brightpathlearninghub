"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Lock,
  User,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  ExternalLink,
  LogOut,
  ArrowLeft,
  MessageCircle,
  Award,
  Video,
} from "lucide-react";

export default function StudentPortalPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [studentAccount, setStudentAccount] = useState<any | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("bp_student_account");
    if (saved) {
      try {
        setStudentAccount(JSON.parse(saved));
      } catch {}
    }
  }, []);

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
        setStudentAccount(data.account);
        sessionStorage.setItem("bp_student_account", JSON.stringify(data.account));
      } else {
        setError(data.message || "Invalid username or password.");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("bp_student_account");
    setStudentAccount(null);
    setUsername("");
    setPassword("");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "var(--font-sans)" }}>
      {/* Top Bar */}
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
                Bright Path Learning Hub — Student Portal
              </div>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                1-on-1 Live Interactive Classroom Hub
              </div>
            </div>
          </div>
        </div>

        {studentAccount && (
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(239,68,68,0.18)",
              color: "#fca5a5",
              border: "1px solid rgba(239,68,68,0.4)",
              padding: "8px 14px",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: "0.82rem",
              cursor: "pointer",
            }}
          >
            <LogOut size={15} /> Sign Out
          </button>
        )}
      </header>

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 20px" }}>
        {!studentAccount ? (
          <div
            style={{
              maxWidth: 440,
              margin: "30px auto",
              background: "#ffffff",
              borderRadius: 16,
              padding: "32px 28px",
              boxShadow: "0 10px 30px rgba(10, 25, 49, 0.08)",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <Image
                src="/logo.png"
                alt="Bright Path Logo"
                width={72}
                height={72}
                style={{ margin: "0 auto 12px", borderRadius: "50%" }}
              />
              <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--bp-navy-950)", margin: 0 }}>
                Student & Parent Login
              </h1>
              <p style={{ fontSize: "0.88rem", color: "#64748b", marginTop: 6 }}>
                Enter the login credentials sent to your email or WhatsApp.
              </p>
            </div>

            {error && (
              <div
                style={{
                  background: "#fef2f2",
                  color: "#dc2626",
                  padding: "10px 14px",
                  borderRadius: 8,
                  fontSize: "0.85rem",
                  marginBottom: 16,
                  border: "1px solid #fecaca",
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Student Username or Email</label>
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
                <span>{loading ? "Signing In..." : "Access Student Portal"}</span>
              </button>
            </form>
          </div>
        ) : (
          <div>
            {/* Welcome Banner */}
            <div
              style={{
                background: "linear-gradient(135deg, #0a1931 0%, #133e87 100%)",
                color: "#ffffff",
                borderRadius: 16,
                padding: "28px",
                marginBottom: 24,
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div>
                <span
                  style={{
                    background: "rgba(16, 185, 129, 0.2)",
                    color: "#34d399",
                    padding: "4px 12px",
                    borderRadius: 999,
                    fontSize: "0.75rem",
                    fontWeight: 700,
                  }}
                >
                  ACTIVE STUDENT ACCOUNT • {studentAccount.username}
                </span>
                <h2 style={{ fontSize: "1.6rem", fontWeight: 800, margin: "10px 0 4px", color: "#ffffff" }}>
                  Welcome, {studentAccount.studentName}!
                </h2>
                <p style={{ margin: 0, color: "#cbd5e1", fontSize: "0.92rem" }}>
                  Parent/Guardian: {studentAccount.parentName} • Grade: {studentAccount.grade}
                </p>
              </div>

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
                style={{ padding: "12px 22px" }}
              >
                <Video size={18} />
                <span>Join 1:1 Live Classroom</span>
              </a>
            </div>

            {/* Course & Schedule Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 20,
              }}
            >
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: 14,
                  padding: 24,
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <BookOpen size={22} color="#059669" />
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800 }}>Enrolled Program</h3>
                </div>
                <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--bp-navy-950)", marginBottom: 6 }}>
                  {studentAccount.courseName}
                </div>
                <p style={{ fontSize: "0.86rem", color: "#64748b", margin: 0 }}>
                  1-on-1 Personalized Live Curriculum tailored for {studentAccount.grade}.
                </p>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  borderRadius: 14,
                  padding: 24,
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <Clock size={22} color="#f59e0b" />
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800 }}>Scheduled Time Slot</h3>
                </div>
                <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--bp-navy-950)", marginBottom: 6 }}>
                  {studentAccount.scheduleSlot || "Flexible 1:1 Slot (Confirmed with Counselor)"}
                </div>
                <p style={{ fontSize: "0.86rem", color: "#64748b", margin: 0 }}>
                  Dedicated mentor assigned • Physical worksheets included.
                </p>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  borderRadius: 14,
                  padding: 24,
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <MessageCircle size={22} color="#25D366" />
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800 }}>Academic Support</h3>
                </div>
                <p style={{ fontSize: "0.86rem", color: "#64748b", marginBottom: 14 }}>
                  Need to reschedule a class or speak with your child&#39;s academic counselor?
                </p>
                <a
                  href={`https://wa.me/2348063202616?text=Hello%20Bright%20Path,%20I%20am%20logged%20into%20the%20portal%20for%20${encodeURIComponent(
                    studentAccount.studentName
                  )}%20(${encodeURIComponent(studentAccount.username)}).`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp"
                  style={{ width: "100%", padding: "10px 16px", fontSize: "0.85rem" }}
                >
                  <MessageCircle size={16} /> Chat with Counselor on WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

