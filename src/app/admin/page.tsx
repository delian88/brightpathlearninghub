"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Database,
  RefreshCw,
  Phone,
  User,
  Calendar,
  BookOpen,
  Clock,
  ArrowLeft,
  Mail,
  CheckCircle,
  FileText,
  Search,
  ExternalLink,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"bookings" | "leads">("bookings");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resB, resL] = await Promise.all([
        fetch("/api/bookings"),
        fetch("/api/leads"),
      ]);
      const dataB = await resB.json();
      const dataL = await resL.json();

      if (dataB.success) setBookings(dataB.data || []);
      if (dataL.success) setLeads(dataL.data || []);
    } catch (err) {
      console.error("Failed to load admin leads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      b.parentName?.toLowerCase().includes(q) ||
      b.studentName?.toLowerCase().includes(q) ||
      b.phoneNumber?.toLowerCase().includes(q) ||
      b.courseName?.toLowerCase().includes(q) ||
      b.grade?.toLowerCase().includes(q)
    );
  });

  const filteredLeads = leads.filter((l) => {
    const q = searchQuery.toLowerCase();
    return (
      l.phoneNumber?.toLowerCase().includes(q) ||
      l.source?.toLowerCase().includes(q)
    );
  });

  const cleanPhoneForWhatsApp = (phone: string) => {
    return phone.replace(/[^0-9]/g, "");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", color: "var(--bp-navy-950)", fontFamily: "var(--font-sans)" }}>
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
              width={34}
              height={34}
              style={{ borderRadius: "50%", border: "1.5px solid var(--bp-gold-400)" }}
            />
            <div>
              <h1 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0, color: "#ffffff" }}>
                Bright Path Learning Hub — Counselor & Admin Portal
              </h1>
              <p style={{ fontSize: "0.75rem", margin: 0, color: "#94a3b8" }}>
                Internal Record Management (Drizzle ORM & Supabase) • BN 9840276
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={fetchData}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "var(--bp-gold-400)",
              color: "var(--bp-navy-950)",
              border: "none",
              padding: "8px 16px",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>{loading ? "Refreshing..." : "Refresh Records"}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px 20px" }}>
        {/* Metric Cards Strip */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600 }}>Total Demo Bookings</div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--bp-navy-950)", marginTop: 6 }}>
              {bookings.length}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#10b981", marginTop: 4 }}>1:1 Sessions scheduled</div>
          </div>

          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600 }}>Quick Phone Leads</div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--bp-navy-950)", marginTop: 6 }}>
              {leads.length}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#6366f1", marginTop: 4 }}>Hero & WhatsApp click captures</div>
          </div>

          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600 }}>Total Inquiries & Leads</div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--bp-gold-600)", marginTop: 6 }}>
              {bookings.length + leads.length}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 4 }}>Combined student prospects</div>
          </div>
        </div>

        {/* Search & Tabs Controls */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            padding: "16px 20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            border: "1px solid #e2e8f0",
            marginBottom: 20,
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Tabs */}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setActiveTab("bookings")}
              style={{
                padding: "8px 18px",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: "pointer",
                border: "none",
                background: activeTab === "bookings" ? "var(--bp-navy-950)" : "#f1f5f9",
                color: activeTab === "bookings" ? "#ffffff" : "#475569",
                transition: "all 0.2s ease",
              }}
            >
              Demo Bookings ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab("leads")}
              style={{
                padding: "8px 18px",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: "pointer",
                border: "none",
                background: activeTab === "leads" ? "var(--bp-navy-950)" : "#f1f5f9",
                color: activeTab === "leads" ? "#ffffff" : "#475569",
                transition: "all 0.2s ease",
              }}
            >
              Quick Leads ({leads.length})
            </button>
          </div>

          {/* Search Box */}
          <div
            style={{
              position: "relative",
              minWidth: "260px",
              flex: "1 1 260px",
              maxWidth: "400px",
            }}
          >
            <Search
              size={16}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
              }}
            />
            <input
              type="text"
              placeholder="Search by student, parent, phone, course..."
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
        </div>

        {/* Records Content */}
        {activeTab === "bookings" ? (
          filteredBookings.length === 0 ? (
            <div
              style={{
                background: "#ffffff",
                padding: "60px 20px",
                borderRadius: "12px",
                textAlign: "center",
                color: "#64748b",
                border: "1px solid #e2e8f0",
              }}
            >
              <Database size={40} color="#94a3b8" style={{ marginBottom: 12 }} />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--bp-navy-950)" }}>
                No Demo Bookings Found
              </h3>
              <p style={{ fontSize: "0.85rem" }}>
                {searchQuery ? "Try refining your search filter." : "New demo bookings will appear here."}
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {filteredBookings.map((b) => (
                <div
                  key={b.id}
                  style={{
                    background: "#ffffff",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    padding: "20px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--bp-navy-950)" }}>
                          {b.studentName}
                        </span>
                        <span
                          style={{
                            background: "#e0f2fe",
                            color: "#0369a1",
                            padding: "3px 10px",
                            borderRadius: "999px",
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

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span
                        style={{
                          background: "#dcfce7",
                          color: "#15803d",
                          padding: "4px 12px",
                          borderRadius: "999px",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                        }}
                      >
                        {b.status || "confirmed"}
                      </span>
                    </div>
                  </div>

                  <hr style={{ border: "none", borderTop: "1px solid #f1f5f9" }} />

                  {/* Details Grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: 12,
                      fontSize: "0.85rem",
                      color: "#334155",
                    }}
                  >
                    <div>
                      <div style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 600 }}>PARENT / GUARDIAN</div>
                      <div style={{ fontWeight: 700, marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                        <User size={14} color="#64748b" />
                        {b.parentName}
                      </div>
                    </div>

                    <div>
                      <div style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 600 }}>PHONE NUMBER</div>
                      <div style={{ fontWeight: 700, marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                        <Phone size={14} color="#64748b" />
                        <a href={`tel:${b.phoneNumber}`} style={{ color: "var(--bp-navy-950)", textDecoration: "none" }}>
                          {b.phoneNumber}
                        </a>
                      </div>
                    </div>

                    {b.email && (
                      <div>
                        <div style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 600 }}>EMAIL ADDRESS</div>
                        <div style={{ fontWeight: 600, marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                          <Mail size={14} color="#64748b" />
                          <a href={`mailto:${b.email}`} style={{ color: "var(--bp-navy-950)", textDecoration: "none" }}>
                            {b.email}
                          </a>
                        </div>
                      </div>
                    )}

                    <div>
                      <div style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 600 }}>PREFERRED TIME SLOT</div>
                      <div style={{ fontWeight: 600, marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                        <Clock size={14} color="#64748b" />
                        {b.preferredTime}
                      </div>
                    </div>
                  </div>

                  {b.notes && (
                    <div
                      style={{
                        background: "#f8fafc",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        fontSize: "0.8rem",
                        color: "#475569",
                        borderLeft: "3px solid var(--bp-gold-400)",
                      }}
                    >
                      <strong>Parent Notes:</strong> {b.notes}
                    </div>
                  )}

                  {/* Actions Strip */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 10,
                      marginTop: 4,
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
                        )},%20this%20is%20Bright%20Path%20Learning%20Hub%20following%20up%20on%20your%201:1%20demo%20booking%20for%20${encodeURIComponent(
                          b.studentName
                        )}.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: "#25d366",
                          color: "#ffffff",
                          padding: "6px 14px",
                          borderRadius: "6px",
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <ExternalLink size={13} />
                        WhatsApp Parent
                      </a>

                      <a
                        href={`tel:${b.phoneNumber}`}
                        style={{
                          background: "var(--bp-navy-950)",
                          color: "#ffffff",
                          padding: "6px 14px",
                          borderRadius: "6px",
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Phone size={13} />
                        Call
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : filteredLeads.length === 0 ? (
          <div
            style={{
              background: "#ffffff",
              padding: "60px 20px",
              borderRadius: "12px",
              textAlign: "center",
              color: "#64748b",
              border: "1px solid #e2e8f0",
            }}
          >
            <Phone size={40} color="#94a3b8" style={{ marginBottom: 12 }} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--bp-navy-950)" }}>
              No Quick Leads Found
            </h3>
            <p style={{ fontSize: "0.85rem" }}>
              {searchQuery ? "Try refining your search filter." : "Phone numbers submitted on the hero strip appear here."}
            </p>
          </div>
        ) : (
          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
                  <th style={{ padding: "14px 18px", color: "#64748b", fontWeight: 700 }}>ID</th>
                  <th style={{ padding: "14px 18px", color: "#64748b", fontWeight: 700 }}>Phone Number</th>
                  <th style={{ padding: "14px 18px", color: "#64748b", fontWeight: 700 }}>Source</th>
                  <th style={{ padding: "14px 18px", color: "#64748b", fontWeight: 700 }}>Captured At</th>
                  <th style={{ padding: "14px 18px", color: "#64748b", fontWeight: 700, textAlign: "right" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((l) => (
                  <tr key={l.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "14px 18px", color: "#94a3b8", fontWeight: 700 }}>#{l.id}</td>
                    <td style={{ padding: "14px 18px", fontWeight: 700, color: "var(--bp-navy-950)" }}>
                      {l.phoneNumber}
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <span
                        style={{
                          background: "#ede9fe",
                          color: "#6d28d9",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                        }}
                      >
                        {l.source}
                      </span>
                    </td>
                    <td style={{ padding: "14px 18px", color: "#64748b" }}>
                      {new Date(l.createdAt).toLocaleString()}
                    </td>
                    <td style={{ padding: "14px 18px", textAlign: "right" }}>
                      <a
                        href={`https://wa.me/${cleanPhoneForWhatsApp(
                          l.phoneNumber
                        )}?text=Hello%20from%20Bright%20Path%20Learning%20Hub!%20We%20saw%20your%20interest%20on%20our%20website.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: "#25d366",
                          color: "#ffffff",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
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
    </div>
  );
}
