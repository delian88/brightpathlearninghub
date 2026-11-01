"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Star, MessageCircle, CheckCircle2, Trophy, ShieldCheck, ArrowRight } from "lucide-react";
import { useSiteContent } from "@/context/SiteContentContext";
import ToastNotification, { type ToastData, type ToastType } from "@/components/ToastNotification";

interface HeroSectionProps {
  onOpenBooking: () => void;
}

export default function HeroSection({ onOpenBooking }: HeroSectionProps) {
  const { content } = useSiteContent();
  const { hero, general } = content;

  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+234");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [toast, setToast] = useState<ToastData | null>(null);

  const showToast = (message: string, type: ToastType = "success") => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 5000);
  };

  const rotatingWords = hero.rotatingWords?.length
    ? hero.rotatingWords
    : ["life.", "public speaking.", "creative coding.", "reading fluency.", "conceptual math."];

  const [wordIndex, setWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = rotatingWords[wordIndex % rotatingWords.length];
    let timer: NodeJS.Timeout;

    if (isDeleting) {
      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText(currentWord.substring(0, displayText.length - 1));
        }, 40);
      } else {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % rotatingWords.length);
      }
    } else {
      if (displayText.length < currentWord.length) {
        timer = setTimeout(() => {
          setDisplayText(currentWord.substring(0, displayText.length + 1));
        }, 85);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2000);
      }
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, wordIndex, rotatingWords]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.trim().length < 7) {
      setErrorMsg("Please enter a valid phone number.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: phone,
          countryCode,
          source: "hero_banner",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        showToast(
          "Thank you! Connecting you with our academic counselor on WhatsApp.",
          "success"
        );
        const cleanNumber = phone.replace(/[^0-9]/g, "");
        const waDest = general.whatsapp.replace(/[^0-9]/g, "") || "2348063202616";
        const waUrl = `https://wa.me/${waDest}?text=Hello%20Bright%20Path%20Learning%20Hub!%20My%20phone%20is%20${countryCode}${cleanNumber}.%20I%20am%20interested%20in%20online%20classes%20for%20my%20child.`;
        window.open(waUrl, "_blank");
      } else {
        const msg = data.message || "Something went wrong.";
        setErrorMsg(msg);
        showToast(msg, "error");
      }
    } catch (err) {
      const msg = "Connection error. Please try again.";
      setErrorMsg(msg);
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="hero-section">
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
      <div className="container">
        <div className="hero-grid">
          {/* Left Content Column */}
          <div>
            {/* Pill */}
            <div className="hero-badge-pill">
              <span className="live-dot-pulse" aria-hidden="true" />
              <span>{hero.badgeText}</span>
            </div>

            {/* Main Title with Real-Time Typing Animation */}
            <h1 className="hero-title">
              {hero.titleLine1Prefix} <span className="highlight-gold">{hero.titleLine1Highlight}</span>
              <br />
              {hero.titleLine2Prefix} <span className="highlight-green">{hero.titleLine2Highlight}</span>
              <br />
              {hero.titleLine3Prefix}{" "}
              <span className="typed-phrase-wrapper">
                <span className="highlight-blue typed-word">
                  {displayText || rotatingWords[0]}
                </span>
                <span className="typing-cursor" aria-hidden="true" />
              </span>
            </h1>

            {/* Tagline */}
            <p className="hero-subtitle">{hero.subtitle}</p>

            {/* Trustpilot & Reviews */}
            <div className="hero-rating-box">
              <div className="rating-stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill="#10b981" color="#10b981" />
                ))}
              </div>
              <span className="rating-text">{hero.ratingText}</span>
            </div>

            {/* Lead Capture Card */}
            <div className="lead-capture-card">
              <div className="lead-capture-title">
                <MessageCircle size={18} color="#25d366" />
                <span>{hero.leadPrompt}</span>
              </div>

              {submitted ? (
                <div
                  style={{
                    padding: "16px",
                    background: "var(--bp-green-50)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--bp-green-500)",
                    textAlign: "center",
                  }}
                >
                  <CheckCircle2 size={32} color="var(--bp-green-600)" style={{ margin: "0 auto 8px" }} />
                  <p style={{ fontWeight: 700, color: "var(--bp-green-600)", fontSize: "0.95rem" }}>
                    Thank you! We have received your request.
                  </p>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: 4 }}>
                    Our academic counselor will reach out via WhatsApp with your child&#39;s personalized trial kit.
                  </p>
                </div>
              ) : (
                <form onSubmit={handlePhoneSubmit}>
                  <div className="phone-input-group">
                    <select
                      className="country-select"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      aria-label="Country Code"
                    >
                      <option value="+234">🇳🇬 +234 (NG)</option>
                      <option value="+1">🇺🇸 +1 (US)</option>
                      <option value="+44">🇬🇧 +44 (UK)</option>
                      <option value="+91">🇮🇳 +91 (IN)</option>
                      <option value="+971">🇦🇪 +971 (UAE)</option>
                      <option value="+65">🇸🇬 +65 (SG)</option>
                      <option value="+1">🇨🇦 +1 (CA)</option>
                    </select>

                    <input
                      type="tel"
                      className="phone-input"
                      placeholder="Enter Mobile Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      maxLength={15}
                      required
                      aria-label="Phone Number"
                    />
                  </div>

                  {errorMsg && (
                    <p style={{ color: "var(--bp-coral-600)", fontSize: "0.82rem", marginBottom: 8 }}>
                      {errorMsg}
                    </p>
                  )}

                  <div className="hero-form-btn-group">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn btn-whatsapp shining"
                      style={{ flex: 1, padding: "12px 18px" }}
                    >
                      <MessageCircle size={18} />
                      <span>{submitting ? "Connecting..." : "Submit on WhatsApp"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={onOpenBooking}
                      className="btn btn-primary shining"
                      style={{ padding: "12px 20px" }}
                    >
                      <span>Book Trial</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>

                  <p className="lead-note">
                    <ShieldCheck size={14} color="var(--bp-green-600)" />
                    <span>100% Free Demo Session • No credit card required</span>
                  </p>
                </form>
              )}
            </div>
          </div>

          {/* Right Visual Showcase */}
          <div className="hero-visual-wrapper">
            <div className="hero-main-card">
              {/* Floating Badge 1 */}
              <div className="hero-floating-badge badge-pos-1">
                <div
                  style={{
                    background: "var(--bp-green-50)",
                    padding: "6px",
                    borderRadius: "8px",
                    color: "var(--bp-green-600)",
                  }}
                >
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <div style={{ fontSize: "0.82rem", fontWeight: 800 }}>LIVE 1-on-1</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>100% Personal Attention</div>
                </div>
              </div>

              {/* Logo Presentation */}
              <div className="hero-logo-showcase" style={{ position: "relative" }}>
                <Image
                  src="/logo.png"
                  alt="Bright Path Learning Hub Official Seal"
                  width={180}
                  height={180}
                  style={{ objectFit: "contain", width: "100%", height: "100%" }}
                  priority
                />
              </div>

              <div style={{ marginTop: 12 }}>
                <h3 style={{ fontSize: "1.25rem", color: "var(--bp-navy-950)", fontWeight: 800 }}>
                  {hero.sealTitle}
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--bp-green-600)", fontWeight: 700 }}>
                  {hero.sealBadge}
                </p>
                <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginTop: 6 }}>
                  {hero.sealDescription}
                </p>
              </div>

              {/* Floating Badge 2 */}
              <div className="hero-floating-badge badge-pos-2">
                <div
                  style={{
                    background: "var(--bp-gold-50)",
                    padding: "6px",
                    borderRadius: "8px",
                    color: "var(--bp-gold-500)",
                  }}
                >
                  <Trophy size={18} />
                </div>
                <div>
                  <div style={{ fontSize: "0.82rem", fontWeight: 800 }}>Outcome Guarantee</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Measurable Progress</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
