"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Database,
  RefreshCw,
  Phone,
  User,
  BookOpen,
  Clock,
  ArrowLeft,
  Mail,
  CheckCircle,
  Search,
  ExternalLink,
  Lock,
  Key,
  Copy,
  Check,
  Send,
  Edit3,
  Save,
  Plus,
  Trash2,
  LogOut,
} from "lucide-react";
import { defaultSiteContent, type SiteContentData } from "@/lib/defaultSiteContent";

export default function AdminDashboardPage() {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState("brightpathlearninghub6@gmail.com");
  const [loginPassword, setLoginPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Dashboard Data State
  const [bookings, setBookings] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [studentAccounts, setStudentAccounts] = useState<any[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContentData>(defaultSiteContent);

  const [activeTab, setActiveTab] = useState<"bookings" | "credentials" | "cms" | "leads">("bookings");
  const [cmsSection, setCmsSection] = useState<
    | "general"
    | "hero"
    | "benefits"
    | "courses"
    | "why"
    | "testimonials"
    | "stars"
    | "guarantee"
    | "faq"
    | "curriculum"
  >("general");

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [savingCms, setSavingCms] = useState(false);

  // Credential Generation Modal / Form State
  const [credModalOpen, setCredModalOpen] = useState(false);
  const [credForm, setCredForm] = useState({
    bookingId: null as number | null,
    parentName: "",
    studentName: "",
    email: "",
    phoneNumber: "",
    grade: "Grade 2",
    courseName: "English Phonics & Reading",
    username: "",
    password: "",
    scheduleSlot: "Weekday Evening (5 PM - 6 PM)",
    classLink: "",
  });
  const [generatingCred, setGeneratingCred] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 5000);
  };

  useEffect(() => {
    const savedAuth = sessionStorage.getItem("bp_admin_auth");
    if (savedAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resB, resL, resS, resC] = await Promise.all([
        fetch("/api/bookings", { cache: "no-store" }),
        fetch("/api/leads", { cache: "no-store" }),
        fetch("/api/student-accounts", { cache: "no-store" }),
        fetch("/api/site-content", { cache: "no-store" }),
      ]);
      const [dataB, dataL, dataS, dataC] = await Promise.all([
        resB.json(),
        resL.json(),
        resS.json(),
        resC.json(),
      ]);

      if (dataB.success) setBookings(dataB.data || []);
      if (dataL.success) setLeads(dataL.data || []);
      if (dataS.success) setStudentAccounts(dataS.data || []);
      if (dataC.success && dataC.content) {
        setSiteContent({ ...defaultSiteContent, ...dataC.content });
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem("bp_admin_auth", "true");
        setIsAuthenticated(true);
      } else {
        setAuthError(data.message || "Invalid admin credentials.");
      }
    } catch {
      setAuthError("Connection error. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("bp_admin_auth");
    setIsAuthenticated(false);
    setLoginPassword("");
  };

  const handleConfirmBooking = async (booking: any) => {
    setConfirmingId(booking.id);
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: booking.id,
          status: "confirmed",
          sendEmail: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          `✅ Booking #BP-${String(booking.id).padStart(5, "0")} confirmed & HTML emails sent to ${
            booking.email || "parent"
          } and Admin!`
        );
        fetchData();
      } else {
        showToast(`⚠️ ${data.message}`);
      }
    } catch {
      showToast("⚠️ Failed to confirm booking.");
    } finally {
      setConfirmingId(null);
    }
  };

  const openCredentialGenerator = (booking?: any) => {
    const cleanFirst = (booking?.studentName || "STUDENT")
      .trim()
      .split(/\s+/)[0]
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase();
    const randomUsername = `BP-${cleanFirst}-${Math.floor(1000 + Math.random() * 9000)}`;
    const randomPassword = `Bright@${Math.floor(1000 + Math.random() * 9000)}`;

    setCredForm({
      bookingId: booking?.id || null,
      parentName: booking?.parentName || "",
      studentName: booking?.studentName || "",
      email: booking?.email || "",
      phoneNumber: booking?.phoneNumber || "",
      grade: booking?.grade || "Grade 2",
      courseName: booking?.courseName || "English Phonics & Reading",
      username: randomUsername,
      password: randomPassword,
      scheduleSlot: booking?.preferredTime || "Weekday Evening (5 PM - 6 PM)",
      classLink: "",
    });
    setGeneratedResult(null);
    setCredModalOpen(true);
  };

  const handleGenerateCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingCred(true);
    try {
      const portalUrl = `${window.location.origin}/portal`;
      const res = await fetch("/api/student-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...credForm,
          portalUrl,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedResult({
          account: data.account,
          portalUrl: data.portalUrl,
        });
        showToast(
          `🎉 Credentials generated for ${data.account.studentName} & Welcome Email sent to ${data.account.email}!`
        );
        fetchData();
      } else {
        showToast(`⚠️ ${data.message}`);
      }
    } catch {
      showToast("⚠️ Error generating student credentials.");
    } finally {
      setGeneratingCred(false);
    }
  };

  const formatCredentialText = (acc: any) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://brightpathlearninghub.com";
    return `🌟 *Bright Path Learning Hub — Student Login Credentials*\n\n👨‍🎓 *Student:* ${acc.studentName} (${acc.grade})\n📚 *Course:* ${acc.courseName}\n🔐 *Username:* ${acc.username}\n🔑 *Password:* ${acc.password}\n🌐 *Student Portal:* ${origin}/portal\n\nWelcome aboard! You can log in anytime using the credentials above.`;
  };

  const copyCredentials = (acc: any, keyId: string) => {
    const text = formatCredentialText(acc);
    navigator.clipboard.writeText(text);
    setCopiedId(keyId);
    showToast("📋 Login credentials copied to clipboard!");
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleSaveSiteContent = async () => {
    setSavingCms(true);
    try {
      const res = await fetch("/api/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: siteContent }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("✅ Landing page & site content saved to database!");
      } else {
        showToast(`⚠️ ${data.message || "Failed to save changes"}`);
      }
    } catch {
      showToast("⚠️ Error saving site content.");
    } finally {
      setSavingCms(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      b.parentName?.toLowerCase().includes(q) ||
      b.studentName?.toLowerCase().includes(q) ||
      b.phoneNumber?.toLowerCase().includes(q) ||
      b.email?.toLowerCase().includes(q) ||
      b.courseName?.toLowerCase().includes(q) ||
      b.grade?.toLowerCase().includes(q)
    );
  });

  const filteredLeads = leads.filter((l) => {
    const q = searchQuery.toLowerCase();
    return l.phoneNumber?.toLowerCase().includes(q) || l.source?.toLowerCase().includes(q);
  });

  const cleanPhoneForWhatsApp = (phone: string) => (phone || "").replace(/[^0-9]/g, "");

  // Admin Login Gate
  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #071527 0%, #0b2545 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
          fontFamily: "var(--font-sans)",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 430,
            background: "#ffffff",
            borderRadius: 16,
            padding: "36px 30px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <Image
              src="/logo.png"
              alt="Bright Path Learning Hub"
              width={76}
              height={76}
              style={{ margin: "0 auto 12px", borderRadius: "50%" }}
            />
            <h1 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--bp-navy-950)", margin: 0 }}>
              Admin & Counselor Login
            </h1>
            <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: 6 }}>
              Bright Path Learning Hub • CMS & Booking Control
            </p>
          </div>

          {authError && (
            <div
              style={{
                background: "#fef2f2",
                color: "#dc2626",
                padding: "10px 14px",
                borderRadius: 8,
                fontSize: "0.84rem",
                marginBottom: 16,
                border: "1px solid #fecaca",
              }}
            >
              {authError}
            </div>
          )}

          <form onSubmit={handleAdminLogin}>
            <div className="form-group">
              <label className="form-label">Admin Email</label>
              <input
                type="email"
                className="form-input"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Admin Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter admin password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="btn btn-primary shining"
              style={{ width: "100%", padding: "13px", fontSize: "0.95rem", marginTop: 8 }}
            >
              <Lock size={17} />
              <span>{authLoading ? "Verifying..." : "Sign In to Admin Panel"}</span>
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 18 }}>
            <Link href="/" style={{ fontSize: "0.83rem", color: "#64748b", textDecoration: "none" }}>
              ← Return to Public Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", color: "var(--bp-navy-950)", fontFamily: "var(--font-sans)" }}>
      {/* Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "#0a1931",
            color: "#ffffff",
            padding: "14px 20px",
            borderRadius: 10,
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            borderLeft: "4px solid #10b981",
            zIndex: 9999,
            fontSize: "0.9rem",
            fontWeight: 700,
            maxWidth: 420,
          }}
        >
          {toastMsg}
        </div>
      )}

      {/* Top Header */}
      <header
        style={{
          background: "var(--bp-navy-950)",
          color: "#ffffff",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "2px solid var(--bp-gold-400)",
          position: "sticky",
          top: 0,
          zIndex: 100,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: "var(--bp-gold-400)",
              fontSize: "0.85rem",
              fontWeight: 700,
              textDecoration: "none",
              padding: "6px 12px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.06)",
            }}
          >
            <ArrowLeft size={16} />
            <span>Public Site</span>
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
              <h1 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0, color: "#ffffff" }}>
                Bright Path Learning Hub — Admin & CMS Control Center
              </h1>
              <p style={{ fontSize: "0.75rem", margin: 0, color: "#94a3b8" }}>
                Bookings • Student Credentials • Landing Page CMS • BN 9840276
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => openCredentialGenerator()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#10b981",
              color: "#ffffff",
              border: "none",
              padding: "8px 14px",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "0.83rem",
              cursor: "pointer",
            }}
          >
            <Key size={14} />
            <span>New Student Login</span>
          </button>

          <button
            onClick={fetchData}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "var(--bp-gold-400)",
              color: "var(--bp-navy-950)",
              border: "none",
              padding: "8px 14px",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "0.83rem",
              cursor: "pointer",
            }}
          >
            <RefreshCw size={14} />
            <span>{loading ? "Syncing..." : "Refresh"}</span>
          </button>

          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(239,68,68,0.2)",
              color: "#fca5a5",
              border: "1px solid rgba(239,68,68,0.4)",
              padding: "8px 12px",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "0.82rem",
              cursor: "pointer",
            }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: "1240px", margin: "0 auto", padding: "24px 20px" }}>
        {/* Metric Cards Strip */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div style={{ background: "#ffffff", borderRadius: 12, padding: 20, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: 600 }}>Demo Bookings</div>
            <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "var(--bp-navy-950)", marginTop: 4 }}>
              {bookings.length}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#10b981", marginTop: 4 }}>
              Confirm & send HTML emails
            </div>
          </div>

          <div style={{ background: "#ffffff", borderRadius: 12, padding: 20, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: 600 }}>Student Login Accounts</div>
            <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "#059669", marginTop: 4 }}>
              {studentAccounts.length}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 4 }}>
              Generated credentials & welcome emails
            </div>
          </div>

          <div style={{ background: "#ffffff", borderRadius: 12, padding: 20, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: 600 }}>Quick Phone Leads</div>
            <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "var(--bp-navy-950)", marginTop: 4 }}>
              {leads.length}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#6366f1", marginTop: 4 }}>
              Hero & WhatsApp inquiries
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            padding: "14px 18px",
            border: "1px solid #e2e8f0",
            marginBottom: 20,
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button
              onClick={() => setActiveTab("bookings")}
              style={{
                padding: "9px 16px",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "0.86rem",
                cursor: "pointer",
                border: "none",
                background: activeTab === "bookings" ? "var(--bp-navy-950)" : "#f1f5f9",
                color: activeTab === "bookings" ? "#ffffff" : "#475569",
              }}
            >
              📅 Demo Bookings ({bookings.length})
            </button>

            <button
              onClick={() => setActiveTab("credentials")}
              style={{
                padding: "9px 16px",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "0.86rem",
                cursor: "pointer",
                border: "none",
                background: activeTab === "credentials" ? "var(--bp-navy-950)" : "#f1f5f9",
                color: activeTab === "credentials" ? "#ffffff" : "#475569",
              }}
            >
              🔑 Student Login Credentials ({studentAccounts.length})
            </button>

            <button
              onClick={() => setActiveTab("cms")}
              style={{
                padding: "9px 16px",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "0.86rem",
                cursor: "pointer",
                border: "none",
                background: activeTab === "cms" ? "var(--bp-navy-950)" : "#f1f5f9",
                color: activeTab === "cms" ? "#ffffff" : "#475569",
              }}
            >
              ✏️ Edit Landing Page & Sections
            </button>

            <button
              onClick={() => setActiveTab("leads")}
              style={{
                padding: "9px 16px",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "0.86rem",
                cursor: "pointer",
                border: "none",
                background: activeTab === "leads" ? "var(--bp-navy-950)" : "#f1f5f9",
                color: activeTab === "leads" ? "#ffffff" : "#475569",
              }}
            >
              📲 Quick Phone Leads ({leads.length})
            </button>
          </div>

          {activeTab !== "cms" && (
            <div style={{ position: "relative", minWidth: "240px", flex: "1 1 240px", maxWidth: "360px" }}>
              <Search
                size={16}
                style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}
              />
              <input
                type="text"
                placeholder="Search student, parent, phone, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px 8px 36px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.85rem",
                  outline: "none",
                }}
              />
            </div>
          )}
        </div>

        {/* TAB 1: DEMO BOOKINGS */}
        {activeTab === "bookings" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filteredBookings.length === 0 ? (
              <div
                style={{
                  background: "#ffffff",
                  padding: "60px 20px",
                  borderRadius: 12,
                  textAlign: "center",
                  color: "#64748b",
                  border: "1px solid #e2e8f0",
                }}
              >
                <Database size={40} color="#94a3b8" style={{ marginBottom: 12 }} />
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>No Demo Bookings Found</h3>
              </div>
            ) : (
              filteredBookings.map((b) => (
                <div
                  key={b.id}
                  style={{
                    background: "#ffffff",
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    padding: 20,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#64748b" }}>
                          #BP-{String(b.id).padStart(5, "0")}
                        </span>
                        <span style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--bp-navy-950)" }}>
                          {b.studentName}
                        </span>
                        <span
                          style={{
                            background: "#e0f2fe",
                            color: "#0369a1",
                            padding: "3px 10px",
                            borderRadius: 999,
                            fontSize: "0.75rem",
                            fontWeight: 700,
                          }}
                        >
                          {b.grade}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "0.9rem",
                          fontWeight: 700,
                          color: "var(--bp-navy-800)",
                          marginTop: 4,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <BookOpen size={15} color="var(--bp-gold-600)" />
                        {b.courseName}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span
                        style={{
                          background: b.status === "confirmed" ? "#dcfce7" : "#fef3c7",
                          color: b.status === "confirmed" ? "#15803d" : "#b45309",
                          padding: "4px 12px",
                          borderRadius: 999,
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          textTransform: "uppercase",
                        }}
                      >
                        {b.status || "confirmed"}
                      </span>

                      <button
                        onClick={() => handleConfirmBooking(b)}
                        disabled={confirmingId === b.id}
                        style={{
                          background: "#0284c7",
                          color: "#ffffff",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: 6,
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <CheckCircle size={14} />
                        <span>
                          {confirmingId === b.id ? "Sending Confirmation..." : "Confirm & Send Confirmation Email"}
                        </span>
                      </button>

                      <button
                        onClick={() => openCredentialGenerator(b)}
                        style={{
                          background: "#059669",
                          color: "#ffffff",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: 6,
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <Key size={14} />
                        <span>Generate Login Credentials</span>
                      </button>
                    </div>
                  </div>

                  <hr style={{ border: "none", borderTop: "1px solid #f1f5f9", margin: 0 }} />

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: 12,
                      fontSize: "0.85rem",
                    }}
                  >
                    <div>
                      <div style={{ color: "#64748b", fontSize: "0.74rem", fontWeight: 600 }}>PARENT / GUARDIAN</div>
                      <div style={{ fontWeight: 700, marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                        <User size={14} color="#64748b" /> {b.parentName}
                      </div>
                    </div>

                    <div>
                      <div style={{ color: "#64748b", fontSize: "0.74rem", fontWeight: 600 }}>PHONE / WHATSAPP</div>
                      <div style={{ fontWeight: 700, marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                        <Phone size={14} color="#64748b" /> {b.phoneNumber}
                      </div>
                    </div>

                    <div>
                      <div style={{ color: "#64748b", fontSize: "0.74rem", fontWeight: 600 }}>EMAIL ADDRESS</div>
                      <div style={{ fontWeight: 600, marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                        <Mail size={14} color="#64748b" /> {b.email || "Not provided"}
                      </div>
                    </div>

                    <div>
                      <div style={{ color: "#64748b", fontSize: "0.74rem", fontWeight: 600 }}>PREFERRED TIME SLOT</div>
                      <div style={{ fontWeight: 600, marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                        <Clock size={14} color="#64748b" /> {b.preferredTime}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 10,
                      paddingTop: 8,
                      borderTop: "1px dashed #e2e8f0",
                    }}
                  >
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                      Booked on: {new Date(b.createdAt).toLocaleString()}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <a
                        href={`https://wa.me/${cleanPhoneForWhatsApp(b.phoneNumber)}?text=Hello%20${encodeURIComponent(
                          b.parentName
                        )},%20this%20is%20Bright%20Path%20Learning%20Hub%20confirming%20your%201:1%20demo%20booking%20for%20${encodeURIComponent(
                          b.studentName
                        )}.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: "#25d366",
                          color: "#ffffff",
                          padding: "6px 12px",
                          borderRadius: 6,
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <ExternalLink size={13} /> WhatsApp Parent
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: STUDENT LOGIN CREDENTIALS */}
        {activeTab === "credentials" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800 }}>
                  Generated Student Login Credentials
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: "0.84rem", color: "#64748b" }}>
                  Generate student login credentials, copy them in 1 click to share on WhatsApp, and automatically email a Welcome & Confirmation message.
                </p>
              </div>
              <button
                onClick={() => openCredentialGenerator()}
                className="btn btn-primary"
                style={{ padding: "10px 18px", fontSize: "0.86rem" }}
              >
                <Key size={16} />
                <span>Generate New User Credentials</span>
              </button>
            </div>

            {studentAccounts.length === 0 ? (
              <div
                style={{
                  background: "#ffffff",
                  padding: "50px 20px",
                  borderRadius: 12,
                  textAlign: "center",
                  border: "1px solid #e2e8f0",
                  color: "#64748b",
                }}
              >
                <Key size={38} color="#94a3b8" style={{ marginBottom: 10 }} />
                <h3 style={{ margin: 0, fontSize: "1.05rem", color: "var(--bp-navy-950)" }}>
                  No Student Credentials Generated Yet
                </h3>
                <p style={{ fontSize: "0.85rem", marginTop: 6 }}>
                  Click &ldquo;Generate Login Credentials&rdquo; on any booking or use the button above to create login credentials for a student.
                </p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16 }}>
                {studentAccounts.map((acc) => (
                  <div
                    key={acc.id}
                    style={{
                      background: "#ffffff",
                      borderRadius: 12,
                      border: "1px solid #cbd5e1",
                      padding: 20,
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--bp-navy-950)" }}>
                          {acc.studentName} ({acc.grade})
                        </div>
                        <div style={{ fontSize: "0.82rem", color: "#059669", fontWeight: 700 }}>
                          {acc.courseName}
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 2 }}>
                          Parent: {acc.parentName} • {acc.email}
                        </div>
                      </div>
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
                        ACTIVE
                      </span>
                    </div>

                    <div
                      style={{
                        background: "#f8fafc",
                        border: "1px dashed #94a3b8",
                        borderRadius: 8,
                        padding: "12px 14px",
                        fontFamily: "monospace",
                        fontSize: "0.85rem",
                      }}
                    >
                      <div>
                        <strong>Username:</strong> <span style={{ color: "#0f172a" }}>{acc.username}</span>
                      </div>
                      <div style={{ marginTop: 4 }}>
                        <strong>Password:</strong> <span style={{ color: "#dc2626" }}>{acc.password}</span>
                      </div>
                      <div style={{ marginTop: 4, fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "#475569" }}>
                        <strong>Portal:</strong> /portal
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button
                        onClick={() => copyCredentials(acc, `acc-${acc.id}`)}
                        style={{
                          flex: 1,
                          background: copiedId === `acc-${acc.id}` ? "#059669" : "var(--bp-navy-950)",
                          color: "#ffffff",
                          border: "none",
                          padding: "8px 12px",
                          borderRadius: 8,
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                      >
                        {copiedId === `acc-${acc.id}` ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copiedId === `acc-${acc.id}` ? "Copied!" : "Copy Credentials"}</span>
                      </button>

                      <a
                        href={`https://wa.me/${cleanPhoneForWhatsApp(acc.phoneNumber)}?text=${encodeURIComponent(
                          formatCredentialText(acc)
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: "#25D366",
                          color: "#ffffff",
                          padding: "8px 12px",
                          borderRadius: 8,
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <ExternalLink size={14} /> Send on WhatsApp
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LANDING PAGE & SITE CONTENT CMS EDITOR */}
        {activeTab === "cms" && (
          <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 20, alignItems: "start" }}>
            {/* Left Section Selector */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                padding: 12,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {[
                { id: "general", label: "1. General, Header & Footer" },
                { id: "hero", label: "2. Hero Banner Section" },
                { id: "benefits", label: "3. 4 Key Benefits Strip" },
                { id: "courses", label: "4. Flagship Courses" },
                { id: "why", label: "5. Why Bright Path" },
                { id: "testimonials", label: "6. Parent Testimonials" },
                { id: "stars", label: "7. Shining Stars" },
                { id: "guarantee", label: "8. 100% Outcome Guarantee" },
                { id: "faq", label: "9. FAQs Section" },
                { id: "curriculum", label: "10. Curriculum Table" },
              ].map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setCmsSection(sec.id as any)}
                  style={{
                    textAlign: "left",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "none",
                    fontWeight: 700,
                    fontSize: "0.83rem",
                    cursor: "pointer",
                    background: cmsSection === sec.id ? "var(--bp-navy-950)" : "transparent",
                    color: cmsSection === sec.id ? "#ffffff" : "#334155",
                  }}
                >
                  {sec.label}
                </button>
              ))}
            </div>

            {/* Right Section Editor Form */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                padding: 24,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                  paddingBottom: 14,
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <div>
                  <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800 }}>
                    Landing Page & Website Content Editor
                  </h2>
                  <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "#64748b" }}>
                    Changes saved here update the live landing page immediately.
                  </p>
                </div>

                <button
                  onClick={handleSaveSiteContent}
                  disabled={savingCms}
                  className="btn btn-primary shining"
                  style={{ padding: "10px 20px", fontSize: "0.88rem" }}
                >
                  <Save size={16} />
                  <span>{savingCms ? "Saving..." : "Save All Changes"}</span>
                </button>
              </div>

              {/* 1. GENERAL & FOOTER */}
              {cmsSection === "general" && (
                <div style={{ display: "grid", gap: 14 }}>
                  <div className="form-row-2col">
                    <div className="form-group">
                      <label className="form-label">Site / Brand Name</label>
                      <input
                        className="form-input"
                        value={siteContent.general.siteName}
                        onChange={(e) =>
                          setSiteContent({
                            ...siteContent,
                            general: { ...siteContent.general, siteName: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Business Registration No.</label>
                      <input
                        className="form-input"
                        value={siteContent.general.registrationNo}
                        onChange={(e) =>
                          setSiteContent({
                            ...siteContent,
                            general: { ...siteContent.general, registrationNo: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-row-2col">
                    <div className="form-group">
                      <label className="form-label">Phone Display Number</label>
                      <input
                        className="form-input"
                        value={siteContent.general.phone}
                        onChange={(e) =>
                          setSiteContent({
                            ...siteContent,
                            general: { ...siteContent.general, phone: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">WhatsApp Number (digits)</label>
                      <input
                        className="form-input"
                        value={siteContent.general.whatsapp}
                        onChange={(e) =>
                          setSiteContent({
                            ...siteContent,
                            general: { ...siteContent.general, whatsapp: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-row-2col">
                    <div className="form-group">
                      <label className="form-label">Official Email</label>
                      <input
                        className="form-input"
                        value={siteContent.general.email}
                        onChange={(e) =>
                          setSiteContent({
                            ...siteContent,
                            general: { ...siteContent.general, email: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Physical Address</label>
                      <input
                        className="form-input"
                        value={siteContent.general.address}
                        onChange={(e) =>
                          setSiteContent({
                            ...siteContent,
                            general: { ...siteContent.general, address: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-row-2col">
                    <div className="form-group">
                      <label className="form-label">Facebook Page URL</label>
                      <input
                        className="form-input"
                        value={siteContent.general.facebookUrl}
                        onChange={(e) =>
                          setSiteContent({
                            ...siteContent,
                            general: { ...siteContent.general, facebookUrl: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Operating Hours</label>
                      <input
                        className="form-input"
                        value={siteContent.general.workingHours}
                        onChange={(e) =>
                          setSiteContent({
                            ...siteContent,
                            general: { ...siteContent.general, workingHours: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Footer About Description</label>
                    <textarea
                      className="form-input"
                      rows={3}
                      value={siteContent.general.footerDescription}
                      onChange={(e) =>
                        setSiteContent({
                          ...siteContent,
                          general: { ...siteContent.general, footerDescription: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {/* 2. HERO SECTION */}
              {cmsSection === "hero" && (
                <div style={{ display: "grid", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Top Badge Pill Text</label>
                    <input
                      className="form-input"
                      value={siteContent.hero.badgeText}
                      onChange={(e) =>
                        setSiteContent({
                          ...siteContent,
                          hero: { ...siteContent.hero, badgeText: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div className="form-row-2col">
                    <div className="form-group">
                      <label className="form-label">Headline Line 1 Prefix</label>
                      <input
                        className="form-input"
                        value={siteContent.hero.titleLine1Prefix}
                        onChange={(e) =>
                          setSiteContent({
                            ...siteContent,
                            hero: { ...siteContent.hero, titleLine1Prefix: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Headline Line 1 Highlight (Gold)</label>
                      <input
                        className="form-input"
                        value={siteContent.hero.titleLine1Highlight}
                        onChange={(e) =>
                          setSiteContent({
                            ...siteContent,
                            hero: { ...siteContent.hero, titleLine1Highlight: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-row-2col">
                    <div className="form-group">
                      <label className="form-label">Headline Line 2 Prefix</label>
                      <input
                        className="form-input"
                        value={siteContent.hero.titleLine2Prefix}
                        onChange={(e) =>
                          setSiteContent({
                            ...siteContent,
                            hero: { ...siteContent.hero, titleLine2Prefix: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Headline Line 2 Highlight (Green)</label>
                      <input
                        className="form-input"
                        value={siteContent.hero.titleLine2Highlight}
                        onChange={(e) =>
                          setSiteContent({
                            ...siteContent,
                            hero: { ...siteContent.hero, titleLine2Highlight: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Rotating Animated Words (comma-separated)</label>
                    <input
                      className="form-input"
                      value={siteContent.hero.rotatingWords.join(", ")}
                      onChange={(e) =>
                        setSiteContent({
                          ...siteContent,
                          hero: {
                            ...siteContent.hero,
                            rotatingWords: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                          },
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Hero Subtitle</label>
                    <textarea
                      className="form-input"
                      rows={3}
                      value={siteContent.hero.subtitle}
                      onChange={(e) =>
                        setSiteContent({
                          ...siteContent,
                          hero: { ...siteContent.hero, subtitle: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div className="form-row-2col">
                    <div className="form-group">
                      <label className="form-label">Rating Text</label>
                      <input
                        className="form-input"
                        value={siteContent.hero.ratingText}
                        onChange={(e) =>
                          setSiteContent({
                            ...siteContent,
                            hero: { ...siteContent.hero, ratingText: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Lead Capture Card Prompt</label>
                      <input
                        className="form-input"
                        value={siteContent.hero.leadPrompt}
                        onChange={(e) =>
                          setSiteContent({
                            ...siteContent,
                            hero: { ...siteContent.hero, leadPrompt: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-row-2col">
                    <div className="form-group">
                      <label className="form-label">Right Seal Card Title</label>
                      <input
                        className="form-input"
                        value={siteContent.hero.sealTitle}
                        onChange={(e) =>
                          setSiteContent({
                            ...siteContent,
                            hero: { ...siteContent.hero, sealTitle: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Right Seal Badge</label>
                      <input
                        className="form-input"
                        value={siteContent.hero.sealBadge}
                        onChange={(e) =>
                          setSiteContent({
                            ...siteContent,
                            hero: { ...siteContent.hero, sealBadge: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 3. BENEFITS STRIP */}
              {cmsSection === "benefits" && (
                <div style={{ display: "grid", gap: 16 }}>
                  {siteContent.benefits.map((b, idx) => (
                    <div
                      key={idx}
                      style={{ padding: 14, border: "1px solid #e2e8f0", borderRadius: 10, background: "#f8fafc" }}
                    >
                      <div style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: 8 }}>
                        Benefit #{idx + 1}
                      </div>
                      <div className="form-row-2col">
                        <div className="form-group">
                          <label className="form-label">Title</label>
                          <input
                            className="form-input"
                            value={b.title}
                            onChange={(e) => {
                              const next = [...siteContent.benefits];
                              next[idx] = { ...next[idx], title: e.target.value };
                              setSiteContent({ ...siteContent, benefits: next });
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Subtitle</label>
                          <input
                            className="form-input"
                            value={b.sub}
                            onChange={(e) => {
                              const next = [...siteContent.benefits];
                              next[idx] = { ...next[idx], sub: e.target.value };
                              setSiteContent({ ...siteContent, benefits: next });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 4. FLAGSHIP COURSES */}
              {cmsSection === "courses" && (
                <div style={{ display: "grid", gap: 18 }}>
                  <div className="form-row-2col">
                    <div className="form-group">
                      <label className="form-label">Section Pill</label>
                      <input
                        className="form-input"
                        value={siteContent.coursesSection.pill}
                        onChange={(e) =>
                          setSiteContent({
                            ...siteContent,
                            coursesSection: { ...siteContent.coursesSection, pill: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Section Title</label>
                      <input
                        className="form-input"
                        value={siteContent.coursesSection.title}
                        onChange={(e) =>
                          setSiteContent({
                            ...siteContent,
                            coursesSection: { ...siteContent.coursesSection, title: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Section Subtitle</label>
                    <input
                      className="form-input"
                      value={siteContent.coursesSection.subtitle}
                      onChange={(e) =>
                        setSiteContent({
                          ...siteContent,
                          coursesSection: { ...siteContent.coursesSection, subtitle: e.target.value },
                        })
                      }
                    />
                  </div>

                  {siteContent.coursesSection.courses.map((course, idx) => (
                    <div
                      key={course.id}
                      style={{ padding: 16, border: "1px solid #cbd5e1", borderRadius: 10, background: "#f8fafc" }}
                    >
                      <div style={{ fontWeight: 800, marginBottom: 10, color: course.headerColor }}>
                        Course #{idx + 1}: {course.title}
                      </div>
                      <div className="form-row-2col">
                        <div className="form-group">
                          <label className="form-label">Course Title</label>
                          <input
                            className="form-input"
                            value={course.title}
                            onChange={(e) => {
                              const next = [...siteContent.coursesSection.courses];
                              next[idx] = { ...next[idx], title: e.target.value };
                              setSiteContent({
                                ...siteContent,
                                coursesSection: { ...siteContent.coursesSection, courses: next },
                              });
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Brand Label & Grades</label>
                          <div style={{ display: "flex", gap: 8 }}>
                            <input
                              className="form-input"
                              value={course.brandLabel}
                              onChange={(e) => {
                                const next = [...siteContent.coursesSection.courses];
                                next[idx] = { ...next[idx], brandLabel: e.target.value };
                                setSiteContent({
                                  ...siteContent,
                                  coursesSection: { ...siteContent.coursesSection, courses: next },
                                });
                              }}
                            />
                            <input
                              className="form-input"
                              value={course.grades}
                              onChange={(e) => {
                                const next = [...siteContent.coursesSection.courses];
                                next[idx] = { ...next[idx], grades: e.target.value };
                                setSiteContent({
                                  ...siteContent,
                                  coursesSection: { ...siteContent.coursesSection, courses: next },
                                });
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Tagline</label>
                        <input
                          className="form-input"
                          value={course.tagline}
                          onChange={(e) => {
                            const next = [...siteContent.coursesSection.courses];
                            next[idx] = { ...next[idx], tagline: e.target.value };
                            setSiteContent({
                              ...siteContent,
                              coursesSection: { ...siteContent.coursesSection, courses: next },
                            });
                          }}
                        />
                      </div>

                      <div className="form-row-2col">
                        <div className="form-group">
                          <label className="form-label">Hours Badge</label>
                          <input
                            className="form-input"
                            value={course.hours}
                            onChange={(e) => {
                              const next = [...siteContent.coursesSection.courses];
                              next[idx] = { ...next[idx], hours: e.target.value };
                              setSiteContent({
                                ...siteContent,
                                coursesSection: { ...siteContent.coursesSection, courses: next },
                              });
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Worksheets / Projects Badge</label>
                          <input
                            className="form-input"
                            value={course.worksheetsCount}
                            onChange={(e) => {
                              const next = [...siteContent.coursesSection.courses];
                              next[idx] = { ...next[idx], worksheetsCount: e.target.value };
                              setSiteContent({
                                ...siteContent,
                                coursesSection: { ...siteContent.coursesSection, courses: next },
                              });
                            }}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Bullet Highlights (one per line)</label>
                        <textarea
                          className="form-input"
                          rows={4}
                          value={course.highlights.join("\n")}
                          onChange={(e) => {
                            const next = [...siteContent.coursesSection.courses];
                            next[idx] = {
                              ...next[idx],
                              highlights: e.target.value.split("\n").filter((l) => l.trim().length > 0),
                            };
                            setSiteContent({
                              ...siteContent,
                              coursesSection: { ...siteContent.coursesSection, courses: next },
                            });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 5. WHY BRIGHT PATH */}
              {cmsSection === "why" && (
                <div style={{ display: "grid", gap: 16 }}>
                  <div className="form-row-2col">
                    <div className="form-group">
                      <label className="form-label">Section Pill</label>
                      <input
                        className="form-input"
                        value={siteContent.whySection.pill}
                        onChange={(e) =>
                          setSiteContent({
                            ...siteContent,
                            whySection: { ...siteContent.whySection, pill: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Section Title</label>
                      <input
                        className="form-input"
                        value={siteContent.whySection.title}
                        onChange={(e) =>
                          setSiteContent({
                            ...siteContent,
                            whySection: { ...siteContent.whySection, title: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Section Subtitle</label>
                    <input
                      className="form-input"
                      value={siteContent.whySection.subtitle}
                      onChange={(e) =>
                        setSiteContent({
                          ...siteContent,
                          whySection: { ...siteContent.whySection, subtitle: e.target.value },
                        })
                      }
                    />
                  </div>

                  {siteContent.whySection.points.map((pt, idx) => (
                    <div
                      key={idx}
                      style={{ padding: 14, border: "1px solid #e2e8f0", borderRadius: 10, background: "#f8fafc" }}
                    >
                      <div className="form-row-2col">
                        <div className="form-group">
                          <label className="form-label">Card #{idx + 1} Title</label>
                          <input
                            className="form-input"
                            value={pt.title}
                            onChange={(e) => {
                              const next = [...siteContent.whySection.points];
                              next[idx] = { ...next[idx], title: e.target.value };
                              setSiteContent({
                                ...siteContent,
                                whySection: { ...siteContent.whySection, points: next },
                              });
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Subtitle</label>
                          <input
                            className="form-input"
                            value={pt.subtitle}
                            onChange={(e) => {
                              const next = [...siteContent.whySection.points];
                              next[idx] = { ...next[idx], subtitle: e.target.value };
                              setSiteContent({
                                ...siteContent,
                                whySection: { ...siteContent.whySection, points: next },
                              });
                            }}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                          className="form-input"
                          rows={2}
                          value={pt.desc}
                          onChange={(e) => {
                            const next = [...siteContent.whySection.points];
                            next[idx] = { ...next[idx], desc: e.target.value };
                            setSiteContent({
                              ...siteContent,
                              whySection: { ...siteContent.whySection, points: next },
                            });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 6. PARENT TESTIMONIALS */}
              {cmsSection === "testimonials" && (
                <div style={{ display: "grid", gap: 16 }}>
                  <div className="form-row-2col">
                    <div className="form-group">
                      <label className="form-label">Section Title</label>
                      <input
                        className="form-input"
                        value={siteContent.testimonialsSection.title}
                        onChange={(e) =>
                          setSiteContent({
                            ...siteContent,
                            testimonialsSection: { ...siteContent.testimonialsSection, title: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">YouTube Embed URL</label>
                      <input
                        className="form-input"
                        value={siteContent.testimonialsSection.videoUrl}
                        onChange={(e) =>
                          setSiteContent({
                            ...siteContent,
                            testimonialsSection: { ...siteContent.testimonialsSection, videoUrl: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  {siteContent.testimonialsSection.items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{ padding: 14, border: "1px solid #e2e8f0", borderRadius: 10, background: "#f8fafc" }}
                    >
                      <div className="form-row-2col">
                        <div className="form-group">
                          <label className="form-label">Parent Name</label>
                          <input
                            className="form-input"
                            value={item.author}
                            onChange={(e) => {
                              const next = [...siteContent.testimonialsSection.items];
                              next[idx] = { ...next[idx], author: e.target.value };
                              setSiteContent({
                                ...siteContent,
                                testimonialsSection: { ...siteContent.testimonialsSection, items: next },
                              });
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Child & Program Relation</label>
                          <input
                            className="form-input"
                            value={item.relation}
                            onChange={(e) => {
                              const next = [...siteContent.testimonialsSection.items];
                              next[idx] = { ...next[idx], relation: e.target.value };
                              setSiteContent({
                                ...siteContent,
                                testimonialsSection: { ...siteContent.testimonialsSection, items: next },
                              });
                            }}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Testimonial Quote</label>
                        <textarea
                          className="form-input"
                          rows={2}
                          value={item.quote}
                          onChange={(e) => {
                            const next = [...siteContent.testimonialsSection.items];
                            next[idx] = { ...next[idx], quote: e.target.value };
                            setSiteContent({
                              ...siteContent,
                              testimonialsSection: { ...siteContent.testimonialsSection, items: next },
                            });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 7. SHINING STARS */}
              {cmsSection === "stars" && (
                <div style={{ display: "grid", gap: 16 }}>
                  <div className="form-row-2col">
                    <div className="form-group">
                      <label className="form-label">Section Title</label>
                      <input
                        className="form-input"
                        value={siteContent.shiningStarsSection.title}
                        onChange={(e) =>
                          setSiteContent({
                            ...siteContent,
                            shiningStarsSection: { ...siteContent.shiningStarsSection, title: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Section Subtitle</label>
                      <input
                        className="form-input"
                        value={siteContent.shiningStarsSection.subtitle}
                        onChange={(e) =>
                          setSiteContent({
                            ...siteContent,
                            shiningStarsSection: { ...siteContent.shiningStarsSection, subtitle: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  {siteContent.shiningStarsSection.stars.map((star, idx) => (
                    <div
                      key={idx}
                      style={{ padding: 14, border: "1px solid #e2e8f0", borderRadius: 10, background: "#f8fafc" }}
                    >
                      <div className="form-row-2col">
                        <div className="form-group">
                          <label className="form-label">Student Name</label>
                          <input
                            className="form-input"
                            value={star.name}
                            onChange={(e) => {
                              const next = [...siteContent.shiningStarsSection.stars];
                              next[idx] = { ...next[idx], name: e.target.value };
                              setSiteContent({
                                ...siteContent,
                                shiningStarsSection: { ...siteContent.shiningStarsSection, stars: next },
                              });
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Grade & Program</label>
                          <div style={{ display: "flex", gap: 8 }}>
                            <input
                              className="form-input"
                              value={star.grade}
                              onChange={(e) => {
                                const next = [...siteContent.shiningStarsSection.stars];
                                next[idx] = { ...next[idx], grade: e.target.value };
                                setSiteContent({
                                  ...siteContent,
                                  shiningStarsSection: { ...siteContent.shiningStarsSection, stars: next },
                                });
                              }}
                            />
                            <input
                              className="form-input"
                              value={star.program}
                              onChange={(e) => {
                                const next = [...siteContent.shiningStarsSection.stars];
                                next[idx] = { ...next[idx], program: e.target.value };
                                setSiteContent({
                                  ...siteContent,
                                  shiningStarsSection: { ...siteContent.shiningStarsSection, stars: next },
                                });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Achievements (one per line)</label>
                        <textarea
                          className="form-input"
                          rows={3}
                          value={star.achievements.join("\n")}
                          onChange={(e) => {
                            const next = [...siteContent.shiningStarsSection.stars];
                            next[idx] = {
                              ...next[idx],
                              achievements: e.target.value.split("\n").filter(Boolean),
                            };
                            setSiteContent({
                              ...siteContent,
                              shiningStarsSection: { ...siteContent.shiningStarsSection, stars: next },
                            });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 8. OUTCOME GUARANTEE */}
              {cmsSection === "guarantee" && (
                <div style={{ display: "grid", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Section Title</label>
                    <input
                      className="form-input"
                      value={siteContent.guaranteeSection.title}
                      onChange={(e) =>
                        setSiteContent({
                          ...siteContent,
                          guaranteeSection: { ...siteContent.guaranteeSection, title: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Guarantee Description</label>
                    <textarea
                      className="form-input"
                      rows={3}
                      value={siteContent.guaranteeSection.description}
                      onChange={(e) =>
                        setSiteContent({
                          ...siteContent,
                          guaranteeSection: { ...siteContent.guaranteeSection, description: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bottom Highlight Guarantee Note</label>
                    <input
                      className="form-input"
                      value={siteContent.guaranteeSection.bottomBannerText}
                      onChange={(e) =>
                        setSiteContent({
                          ...siteContent,
                          guaranteeSection: { ...siteContent.guaranteeSection, bottomBannerText: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {/* 9. FAQs SECTION */}
              {cmsSection === "faq" && (
                <div style={{ display: "grid", gap: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800 }}>
                      FAQ Questions ({siteContent.faqSection.faqs.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        setSiteContent({
                          ...siteContent,
                          faqSection: {
                            ...siteContent.faqSection,
                            faqs: [
                              ...siteContent.faqSection.faqs,
                              { q: "New Question?", a: "Enter answer here..." },
                            ],
                          },
                        })
                      }
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        background: "#059669",
                        color: "#ffffff",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: 6,
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      <Plus size={14} /> Add FAQ
                    </button>
                  </div>

                  {siteContent.faqSection.faqs.map((faq, idx) => (
                    <div
                      key={idx}
                      style={{ padding: 14, border: "1px solid #e2e8f0", borderRadius: 10, background: "#f8fafc" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <strong style={{ fontSize: "0.82rem" }}>FAQ #{idx + 1}</strong>
                        <button
                          type="button"
                          onClick={() => {
                            const next = siteContent.faqSection.faqs.filter((_, i) => i !== idx);
                            setSiteContent({
                              ...siteContent,
                              faqSection: { ...siteContent.faqSection, faqs: next },
                            });
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#dc2626",
                            cursor: "pointer",
                            fontSize: "0.78rem",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <Trash2 size={13} /> Remove
                        </button>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Question</label>
                        <input
                          className="form-input"
                          value={faq.q}
                          onChange={(e) => {
                            const next = [...siteContent.faqSection.faqs];
                            next[idx] = { ...next[idx], q: e.target.value };
                            setSiteContent({
                              ...siteContent,
                              faqSection: { ...siteContent.faqSection, faqs: next },
                            });
                          }}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Answer</label>
                        <textarea
                          className="form-input"
                          rows={2}
                          value={faq.a}
                          onChange={(e) => {
                            const next = [...siteContent.faqSection.faqs];
                            next[idx] = { ...next[idx], a: e.target.value };
                            setSiteContent({
                              ...siteContent,
                              faqSection: { ...siteContent.faqSection, faqs: next },
                            });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 10. CURRICULUM OVERVIEW TABLE */}
              {cmsSection === "curriculum" && (
                <div style={{ display: "grid", gap: 16 }}>
                  {siteContent.curriculumSection.rows.map((row, idx) => (
                    <div
                      key={idx}
                      style={{ padding: 14, border: "1px solid #e2e8f0", borderRadius: 10, background: "#f8fafc" }}
                    >
                      <div className="form-row-2col">
                        <div className="form-group">
                          <label className="form-label">Course Name</label>
                          <input
                            className="form-input"
                            value={row.course}
                            onChange={(e) => {
                              const next = [...siteContent.curriculumSection.rows];
                              next[idx] = { ...next[idx], course: e.target.value };
                              setSiteContent({
                                ...siteContent,
                                curriculumSection: { ...siteContent.curriculumSection, rows: next },
                              });
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Grades & Mode</label>
                          <div style={{ display: "flex", gap: 8 }}>
                            <input
                              className="form-input"
                              value={row.grades}
                              onChange={(e) => {
                                const next = [...siteContent.curriculumSection.rows];
                                next[idx] = { ...next[idx], grades: e.target.value };
                                setSiteContent({
                                  ...siteContent,
                                  curriculumSection: { ...siteContent.curriculumSection, rows: next },
                                });
                              }}
                            />
                            <input
                              className="form-input"
                              value={row.mode}
                              onChange={(e) => {
                                const next = [...siteContent.curriculumSection.rows];
                                next[idx] = { ...next[idx], mode: e.target.value };
                                setSiteContent({
                                  ...siteContent,
                                  curriculumSection: { ...siteContent.curriculumSection, rows: next },
                                });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Core Focus & Pedagogy</label>
                        <input
                          className="form-input"
                          value={row.focus}
                          onChange={(e) => {
                            const next = [...siteContent.curriculumSection.rows];
                            next[idx] = { ...next[idx], focus: e.target.value };
                            setSiteContent({
                              ...siteContent,
                              curriculumSection: { ...siteContent.curriculumSection, rows: next },
                            });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: QUICK PHONE LEADS */}
        {activeTab === "leads" && (
          <div style={{ background: "#ffffff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
                  <th style={{ padding: "14px 18px", color: "#64748b" }}>ID</th>
                  <th style={{ padding: "14px 18px", color: "#64748b" }}>Phone Number</th>
                  <th style={{ padding: "14px 18px", color: "#64748b" }}>Source</th>
                  <th style={{ padding: "14px 18px", color: "#64748b" }}>Captured At</th>
                  <th style={{ padding: "14px 18px", color: "#64748b", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((l) => (
                  <tr key={l.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "14px 18px", color: "#94a3b8", fontWeight: 700 }}>#{l.id}</td>
                    <td style={{ padding: "14px 18px", fontWeight: 700 }}>
                      {l.countryCode || ""} {l.phoneNumber}
                    </td>
                    <td style={{ padding: "14px 18px" }}>{l.source}</td>
                    <td style={{ padding: "14px 18px", color: "#64748b" }}>
                      {new Date(l.createdAt).toLocaleString()}
                    </td>
                    <td style={{ padding: "14px 18px", textAlign: "right" }}>
                      <a
                        href={`https://wa.me/${cleanPhoneForWhatsApp(
                          `${l.countryCode || "+234"}${l.phoneNumber}`
                        )}?text=Hello%20from%20Bright%20Path%20Learning%20Hub!`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: "#25d366",
                          color: "#ffffff",
                          padding: "5px 12px",
                          borderRadius: 6,
                          fontSize: "0.76rem",
                          fontWeight: 700,
                          textDecoration: "none",
                        }}
                      >
                        WhatsApp
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* CREDENTIAL GENERATOR MODAL */}
      {credModalOpen && (
        <div className="modal-backdrop" onClick={() => setCredModalOpen(false)}>
          <div
            className="modal-card"
            style={{ maxWidth: 540 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Key size={20} color="var(--bp-navy-800)" />
                <h2 className="modal-title">Generate Student Login Credentials</h2>
              </div>
              <button onClick={() => setCredModalOpen(false)} className="modal-close-btn">
                ✕
              </button>
            </div>

            <div className="modal-body">
              {generatedResult ? (
                <div>
                  <div
                    style={{
                      background: "#ecfdf5",
                      border: "1px solid #10b981",
                      color: "#065f46",
                      padding: "14px",
                      borderRadius: 10,
                      marginBottom: 16,
                      fontSize: "0.88rem",
                      fontWeight: 600,
                    }}
                  >
                    ✅ Login credentials generated! A Confirmation & Welcome HTML Email has been sent to{" "}
                    <strong>{generatedResult.account.email}</strong>.
                  </div>

                  <div
                    style={{
                      background: "#f8fafc",
                      border: "2px dashed #94a3b8",
                      borderRadius: 10,
                      padding: 16,
                      fontFamily: "monospace",
                      fontSize: "0.9rem",
                      marginBottom: 16,
                    }}
                  >
                    <div>
                      <strong>Student:</strong> {generatedResult.account.studentName} ({generatedResult.account.grade})
                    </div>
                    <div>
                      <strong>Course:</strong> {generatedResult.account.courseName}
                    </div>
                    <div>
                      <strong>Username:</strong> {generatedResult.account.username}
                    </div>
                    <div>
                      <strong>Password:</strong> <span style={{ color: "#dc2626" }}>{generatedResult.account.password}</span>
                    </div>
                    <div>
                      <strong>Portal URL:</strong> {generatedResult.portalUrl}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10, flexDirection: "column" }}>
                    <button
                      type="button"
                      onClick={() => copyCredentials(generatedResult.account, "modal-copy")}
                      className="btn btn-primary shining"
                      style={{ width: "100%", padding: "12px" }}
                    >
                      <Copy size={17} />
                      <span>
                        {copiedId === "modal-copy"
                          ? "Copied to Clipboard!"
                          : "Copy Credentials to Send to User"}
                      </span>
                    </button>

                    <a
                      href={`https://wa.me/${cleanPhoneForWhatsApp(
                        generatedResult.account.phoneNumber
                      )}?text=${encodeURIComponent(formatCredentialText(generatedResult.account))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-whatsapp"
                      style={{ width: "100%", padding: "12px", textDecoration: "none" }}
                    >
                      <ExternalLink size={17} />
                      <span>Send Credentials via WhatsApp</span>
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleGenerateCredentialsSubmit}>
                  <div className="form-row-2col">
                    <div className="form-group">
                      <label className="form-label">Student Name</label>
                      <input
                        className="form-input"
                        value={credForm.studentName}
                        onChange={(e) => setCredForm({ ...credForm, studentName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Grade</label>
                      <input
                        className="form-input"
                        value={credForm.grade}
                        onChange={(e) => setCredForm({ ...credForm, grade: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row-2col">
                    <div className="form-group">
                      <label className="form-label">Parent Name</label>
                      <input
                        className="form-input"
                        value={credForm.parentName}
                        onChange={(e) => setCredForm({ ...credForm, parentName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">User Email (for Welcome Email)</label>
                      <input
                        type="email"
                        className="form-input"
                        value={credForm.email}
                        onChange={(e) => setCredForm({ ...credForm, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row-2col">
                    <div className="form-group">
                      <label className="form-label">Phone / WhatsApp</label>
                      <input
                        className="form-input"
                        value={credForm.phoneNumber}
                        onChange={(e) => setCredForm({ ...credForm, phoneNumber: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Enrolled Course</label>
                      <input
                        className="form-input"
                        value={credForm.courseName}
                        onChange={(e) => setCredForm({ ...credForm, courseName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row-2col">
                    <div className="form-group">
                      <label className="form-label">Generated Username</label>
                      <input
                        className="form-input"
                        style={{ fontFamily: "monospace", fontWeight: 700 }}
                        value={credForm.username}
                        onChange={(e) => setCredForm({ ...credForm, username: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Generated Password</label>
                      <input
                        className="form-input"
                        style={{ fontFamily: "monospace", fontWeight: 700, color: "#dc2626" }}
                        value={credForm.password}
                        onChange={(e) => setCredForm({ ...credForm, password: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Live Classroom Link (Zoom / Google Meet - Optional)</label>
                    <input
                      className="form-input"
                      placeholder="https://meet.google.com/..."
                      value={credForm.classLink}
                      onChange={(e) => setCredForm({ ...credForm, classLink: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={generatingCred}
                    className="btn btn-primary shining"
                    style={{ width: "100%", padding: "13px", marginTop: 6 }}
                  >
                    <Send size={17} />
                    <span>
                      {generatingCred
                        ? "Generating & Sending Welcome Email..."
                        : "Generate Credentials & Send Welcome Email"}
                    </span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
