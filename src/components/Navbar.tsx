"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Phone, MessageCircle, Calendar, Menu, X, Mail, UserCheck } from "lucide-react";
import { useSiteContent } from "@/context/SiteContentContext";

interface NavbarProps {
  onOpenBooking: (courseName?: string) => void;
}

export default function Navbar({ onOpenBooking }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { content } = useSiteContent();
  const { general } = content;

  return (
    <header className="site-header">
      <div className="container">
        <div className="header-inner">
          {/* Brand Logo & Title */}
          <Link href="/" className="brand-wrapper" title={general.siteName}>
            <div style={{ position: "relative", width: 50, height: 50 }}>
              <Image
                src="/logo.png"
                alt={`${general.siteName} Logo`}
                width={50}
                height={50}
                className="brand-logo-img"
                priority
              />
            </div>
            <div className="brand-text">
              <span className="brand-title">Bright Path</span>
              <span className="brand-badge">Learning Hub • Reg. #{general.registrationNo}</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="nav-links" aria-label="Main Navigation">
            <a href="#courses" className="nav-link">Flagship Courses</a>
            <a href="#why-us" className="nav-link">Why Bright Path</a>
            <a href="#testimonials" className="nav-link">Parent Stories</a>
            <a href="#achievers" className="nav-link">Shining Stars</a>
            <a href="#guarantee" className="nav-link">100% Guarantee</a>
            <a href="#faq" className="nav-link">FAQs</a>
          </nav>

          {/* Right Action CTAs */}
          <div className="header-actions">
            {/* Student Portal Login */}
            <Link
              href="/portal"
              className="btn btn-navy"
              style={{ padding: "8px 12px", fontSize: "0.8rem" }}
              title="Student & Parent Portal Login"
            >
              <UserCheck size={16} />
              <span className="nav-btn-label">Student Login</span>
            </Link>

            {/* WhatsApp Connect */}
            <a
              href={`https://wa.me/${general.whatsapp.replace(/[^0-9]/g, "")}?text=Hi%20Bright%20Path%20Learning%20Hub,%20I%20would%20like%20to%20know%20more%20about%20your%201:1%20kids%20classes.`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp shining"
              style={{ padding: "8px 12px", fontSize: "0.82rem" }}
              title="Connect on WhatsApp"
            >
              <MessageCircle size={18} />
              <span className="nav-btn-label">WhatsApp</span>
            </a>

            {/* Book Demo Button */}
            <button
              onClick={() => onOpenBooking()}
              className="btn btn-primary shining"
              style={{ padding: "8px 14px", fontSize: "0.82rem" }}
            >
              <Calendar size={17} />
              <span>Book Demo</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 8,
                background: "var(--bg-main)",
                borderRadius: "var(--radius-sm)",
              }}
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
            <Link href="/portal" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
              🔐 Student Portal Login
            </Link>
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
