"use client";

import React, { useState, useEffect } from "react";
import { Database, X, RefreshCw, Phone, User, Calendar, BookOpen, Clock } from "lucide-react";

export default function AdminLeadsDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"bookings" | "leads">("bookings");
  const [loading, setLoading] = useState(false);

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
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          bottom: "calc(64px + env(safe-area-inset-bottom, 12px) + 12px)",
          right: "14px",
          zIndex: 95,
          background: "var(--bp-navy-950)",
          color: "#ffffff",
          border: "1.5px solid var(--bp-gold-400)",
          borderRadius: "999px",
          padding: "6px 14px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "0.8rem",
          fontWeight: 700,
          boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
          cursor: "pointer",
        }}
        title="View live booking & inquiry records"
      >
        <Database size={15} color="var(--bp-gold-400)" />
        <span>Live Records ({bookings.length + leads.length})</span>
      </button>

      {/* Drawer */}
      {isOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setIsOpen(false)}
          style={{ zIndex: 1100, justifyContent: "flex-end", padding: 0 }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "460px",
              height: "100%",
              background: "#ffffff",
              boxShadow: "-8px 0 25px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              animation: "slideInRight 0.3s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid var(--border-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "var(--bp-navy-950)",
                color: "#ffffff",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Database size={18} color="var(--bp-gold-400)" />
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#ffffff" }}>
                    Live Enrollment & Inquiry Records
                  </h3>
                </div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                  Bright Path Learning Hub CRM
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  onClick={fetchData}
                  disabled={loading}
                  style={{
                    color: "#ffffff",
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: "50%",
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title="Refresh"
                >
                  <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    color: "#ffffff",
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: "50%",
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div
              style={{
                display: "flex",
                borderBottom: "1px solid var(--border-light)",
                background: "var(--bg-main)",
              }}
            >
              <button
                onClick={() => setActiveTab("bookings")}
                style={{
                  flex: 1,
                  padding: "12px",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  borderBottom: activeTab === "bookings" ? "2px solid var(--bp-navy-900)" : "none",
                  color: activeTab === "bookings" ? "var(--bp-navy-900)" : "var(--text-muted)",
                  background: activeTab === "bookings" ? "#ffffff" : "transparent",
                }}
              >
                Demo Bookings ({bookings.length})
              </button>
              <button
                onClick={() => setActiveTab("leads")}
                style={{
                  flex: 1,
                  padding: "12px",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  borderBottom: activeTab === "leads" ? "2px solid var(--bp-navy-900)" : "none",
                  color: activeTab === "leads" ? "var(--bp-navy-900)" : "var(--text-muted)",
                  background: activeTab === "leads" ? "#ffffff" : "transparent",
                }}
              >
                Quick Leads ({leads.length})
              </button>
            </div>

            {/* Content List */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
              {activeTab === "bookings" ? (
                bookings.length === 0 ? (
                  <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px 0" }}>
                    No bookings found yet. Submit one from the website!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {bookings.map((b) => (
                      <div
                        key={b.id}
                        style={{
                          background: "#ffffff",
                          border: "1px solid var(--border-light)",
                          borderRadius: "var(--radius-md)",
                          padding: "14px",
                          boxShadow: "var(--shadow-sm)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ fontWeight: 800, color: "var(--bp-navy-950)", fontSize: "0.95rem" }}>
                            {b.studentName} ({b.grade})
                          </span>
                          <span
                            style={{
                              background: "var(--bp-green-50)",
                              color: "var(--bp-green-600)",
                              padding: "2px 8px",
                              borderRadius: 999,
                              fontSize: "0.72rem",
                              fontWeight: 700,
                            }}
                          >
                            {b.status}
                          </span>
                        </div>

                        <div style={{ fontSize: "0.82rem", color: "var(--bp-navy-800)", fontWeight: 700, marginBottom: 6 }}>
                          <BookOpen size={13} style={{ display: "inline", marginRight: 4 }} />
                          {b.courseName}
                        </div>

                        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: 3 }}>
                          <div>
                            <User size={13} style={{ display: "inline", marginRight: 4 }} />
                            Parent: {b.parentName}
                          </div>
                          <div>
                            <Phone size={13} style={{ display: "inline", marginRight: 4 }} />
                            Phone: {b.phoneNumber}
                          </div>
                          <div>
                            <Clock size={13} style={{ display: "inline", marginRight: 4 }} />
                            Slot: {b.preferredTime}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : leads.length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px 0" }}>
                  No quick leads found yet.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {leads.map((l) => (
                    <div
                      key={l.id}
                      style={{
                        background: "#ffffff",
                        border: "1px solid var(--border-light)",
                        borderRadius: "var(--radius-md)",
                        padding: "12px 14px",
                        boxShadow: "var(--shadow-sm)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: "var(--bp-navy-950)", fontSize: "0.9rem" }}>
                          <Phone size={13} style={{ display: "inline", marginRight: 5, color: "#10b981" }} />
                          {l.countryCode} {l.phoneNumber}
                        </div>
                        <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: 2 }}>
                          Source: {l.source}
                        </div>
                      </div>
                      <a
                        href={`https://wa.me/${String(l.countryCode || "+234").replace("+", "")}${l.phoneNumber.replace(
                          /[^0-9]/g,
                          ""
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          color: "#059669",
                          background: "var(--bp-green-50)",
                          padding: "4px 8px",
                          borderRadius: 6,
                        }}
                      >
                        WhatsApp
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
