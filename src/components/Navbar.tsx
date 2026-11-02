"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Phone, MessageCircle, Calendar, Menu, X, Mail, UserCheck, LayoutDashboard } from "lucide-react";
import { useSiteContent } from "@/context/SiteContentContext";

interface NavbarProps {
  onOpenBooking: (courseName?: string) => void;
}

export default function Navbar({ onOpenBooking }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeStudentName, setActiveStudentName] = useState<string | null>(null);
  const [isAdminActive, setIsAdminActive] = useState(false);
  const { content } = useSiteContent();
  const { general } = content;

  useEffect(() => {
    try {
      const savedStudent =
        localStorage.getItem("bp_student_account") ||
        sessionStorage.getItem("bp_student_account");
      if (savedStudent) {
        const parsed = JSON.parse(savedStudent);
        if (parsed?.studentName) {
          setActiveStudentName(parsed.studentName.split(" ")[0]);
        }
      }
      const savedAdmin =
        localStorage.getItem("bp_admin_auth") === "true" ||
        sessionStorage.getItem("bp_admin_auth") === "true";
      setIsAdminActive(savedAdmin);
    } catch {}
  }, []);

  return (
    <header className="site-header">
      <div className="container">
        <div className="header-inner">
          {/* Brand Logo & Website Name (Always Visible) */}
          <Link href="/" className="brand-wrapper" title={general.siteName}>
            <Image
              src="/logo.png"
              alt={`${general.siteName} Logo`}
              width={46}
              height={46}
              className="brand-logo-img"
              priority
            />
            <div className="brand-text">
              <span className="brand-title">{general.siteName || "Bright Path Learning Hub"}</span>
              <span className="brand-badge">Govt. Reg. #{general.registrationNo} • KG – Grade 8</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="nav-links" aria-label="Main Navigation">
            <a href="#courses" className="nav-link">Courses</a>
            <a href="#why-us" className="nav-link">Why Us</a>
            <a href="#testimonials" className="nav-link">Reviews</a>
            <a href="#achievers" className="nav-link">Achievers</a>
            <a href="#guarantee" className="nav-link">Guarantee</a>
            <a href="#faq" className="nav-link">FAQs</a>
          </nav>

          {/* Right Action CTAs */}
          <div className="header-actions">
            {isAdminActive && (
              <Link
                href="/admin"
                className="btn btn-navy header-btn-login"
                style={{ background: "#0f172a", border: "1px solid #f59e0b" }}
                title="Return to Active Admin Dashboard"
              >
                <LayoutDashboard size={15} color="#fbbf24" />
                <span className="header-action-label">Admin Panel</span>
              </Link>
            )}

            {/* Student Portal Login / Active Dashboard */}
            <Link
              href="/portal"
              className="btn btn-navy header-btn-login"
              title={activeStudentName ? `Return to ${activeStudentName}'s Dashboard` : "Student & Parent Portal Login"}
            >
              <UserCheck size={16} />
              <span className="header-action-label">
                {activeStudentName ? `${activeStudentName}'s Portal` : "Student Login"}
              </span>
            </Link>

            {/* WhatsApp Connect */}
            <a
              href={`https://wa.me/${general.whatsapp.replace(/[^0-9]/g, "")}?text=Hi%20Bright%20Path%20Learning%20Hub,%20I%20would%20like%20to%20know%20more%20about%20your%201:1%20kids%20classes.`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp shining header-btn-wa"
              title="Connect on WhatsApp"
            >
              <MessageCircle size={17} />
              <span className="header-action-label">WhatsApp</span>
            </a>

            {/* Book Demo Button */}
            <button
              onClick={() => onOpenBooking()}
              className="btn btn-primary shining header-btn-book"
            >
              <Calendar size={16} />
              <span>Book Demo</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
              className="mobile-toggle-btn"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div
            style={{
              padding: "16px 0 20px",
              borderTop: "1px solid var(--border-light)",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <a href="#courses" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
              Flagship Courses
            </a>
            <a href="#why-us" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
              Why Bright Path
            </a>
            <a href="#testimonials" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
              Parent Stories
            </a>
            <a href="#achievers" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
              Shining Stars
            </a>
            <a href="#guarantee" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
              100% Outcome Guarantee
            </a>
            <a href="#faq" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
              Frequently Asked Questions
            </a>
            <Link
              href="/portal"
              className="nav-link"
              style={{ color: "var(--bp-navy-800)", fontWeight: 700 }}
              onClick={() => setMobileMenuOpen(false)}
            >
              🔐 {activeStudentName ? `Return to ${activeStudentName}'s Portal` : "Student Portal Login"}
            </Link>
            {isAdminActive && (
              <Link
                href="/admin"
                className="nav-link"
                style={{ color: "#d97706", fontWeight: 800 }}
                onClick={() => setMobileMenuOpen(false)}
              >
                ⚡ Return to Admin Dashboard
              </Link>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8, paddingTop: 10, borderTop: "1px solid var(--border-light)" }}>
              <a
                href={`tel:${general.phone}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                }}
              >
                <Phone size={15} color="var(--bp-navy-800)" /> {general.phone}
              </a>

              <a
                href={`mailto:${general.email}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                  wordBreak: "break-all",
                }}
              >
                <Mail size={15} color="var(--bp-navy-800)" /> {general.email}
              </a>

              <a
                href={general.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: "0.85rem",
                  color: "#1877F2",
                  fontWeight: 600,
                }}
              >
                Facebook: {general.siteName}
              </a>

              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                📍 {general.address}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
