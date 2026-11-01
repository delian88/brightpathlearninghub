import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, Clock, ShieldCheck, MapPin, MessageCircle } from "lucide-react";

const FacebookIcon = ({ size = 15, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ color, display: "inline-block", verticalAlign: "middle" }}
    aria-hidden="true"
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top-grid">
          {/* Col 1: About */}
          <div>
            <div className="footer-about-logo">
              <div style={{ position: "relative", width: 48, height: 48 }}>
                <Image
                  src="/logo.png"
                  alt="Bright Path Learning Hub Logo"
                  width={48}
                  height={48}
                  className="footer-logo-img"
                />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: "1.15rem", color: "#ffffff" }}>
                  Bright Path Learning Hub
                </div>
                <div style={{ fontSize: "0.74rem", color: "var(--bp-green-400)", fontWeight: 700 }}>
                  Business Name Reg. No. 9840276
                </div>
              </div>
            </div>

            <p className="footer-desc">
              Bright Path Learning Hub offers expert-led 1:1 online programs in English Phonics,
              Public Speaking, Coding, and Conceptual Math for children from LKG to Grade 8.
              Personalized learning designed for your child’s holistic growth!
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 18 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  background: "rgba(255, 255, 255, 0.08)",
                  borderRadius: 999,
                  fontSize: "0.78rem",
                  color: "#e2e8f0",
                }}
              >
                <ShieldCheck size={14} color="#10b981" /> 100% Outcome Guarantee
              </div>

              {/* Facebook Page Pill */}
              <a
                href="https://web.facebook.com/profile.php?id=61594197483487"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  background: "#1877F2",
                  borderRadius: 999,
                  fontSize: "0.78rem",
                  color: "#ffffff",
                  fontWeight: 700,
                  transition: "opacity 0.2s ease",
                }}
                title="Follow Bright Path on Facebook"
              >
                <FacebookIcon size={14} color="#ffffff" /> Follow us on Facebook
              </a>
            </div>
          </div>

          {/* Col 2: Programs */}
          <div>
            <h4 className="footer-col-title">Our Programs</h4>
            <ul className="footer-links-list">
              <li className="footer-link-item">
                <a href="#courses">English Phonics & Reading (LKG – Grade 8)</a>
              </li>
              <li className="footer-link-item">
                <a href="#courses">Public Speaking & Communication (LKG – Grade 8)</a>
              </li>
              <li className="footer-link-item">
                <a href="#courses">Coding & AI for Kids (Grade 1 – Grade 8)</a>
              </li>
              <li className="footer-link-item">
                <a href="#courses">Bright Math Conceptual Learning (KG – Grade 8)</a>
              </li>
              <li className="footer-link-item">
                <a href="#guarantee">100% Outcome Guarantee Policy</a>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact & Address */}
          <div>
            <h4 className="footer-col-title">Contact & Address</h4>

            {/* Address */}
            <div className="footer-contact-item">
              <MapPin size={16} color="var(--bp-gold-400)" style={{ flexShrink: 0 }} />
              <div>
                <strong>Address:</strong> Kubwa, Abuja
              </div>
            </div>

            {/* Phone & WhatsApp */}
            <div className="footer-contact-item">
              <Phone size={16} color="var(--bp-gold-400)" style={{ flexShrink: 0 }} />
              <div>
                <strong>Phone / Call:</strong>{" "}
                <a href="tel:+2348063202616" className="footer-contact-link">
                  +234 806 320 2616
                </a>
              </div>
            </div>

            <div className="footer-contact-item">
              <MessageCircle size={16} color="#25D366" style={{ flexShrink: 0 }} />
              <div>
                <strong>WhatsApp:</strong>{" "}
                <a
                  href="https://wa.me/2348063202616?text=Hi%20Bright%20Path%20Learning%20Hub,%20I%20would%20like%20to%20inquire%20about%20your%20classes."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-contact-link"
                >
                  +234 806 320 2616
                </a>
              </div>
            </div>

            {/* Email Address */}
            <div className="footer-contact-item">
              <Mail size={16} color="var(--bp-gold-400)" style={{ flexShrink: 0 }} />
              <div>
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:brightpathlearninghub6@gmail.com"
                  className="footer-contact-link"
                  style={{ wordBreak: "break-all" }}
                >
                  brightpathlearninghub6@gmail.com
                </a>
              </div>
            </div>

            {/* Facebook Page Link */}
            <div className="footer-contact-item">
              <FacebookIcon size={16} color="#38bdf8" />
              <div>
                <strong>Facebook:</strong>{" "}
                <a
                  href="https://web.facebook.com/profile.php?id=61594197483487"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-contact-link"
                >
                  Bright Path Learning Hub
                </a>
              </div>
            </div>

            {/* Hours */}
            <div className="footer-contact-item">
              <Clock size={16} color="var(--bp-gold-400)" style={{ flexShrink: 0 }} />
              <div>Mon-Sat: 10 AM - 9 PM | Sun: 10 AM - 7 PM</div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div>
            © 2026 Bright Path Learning Hub • Kubwa, Abuja • Reg. #9840276. All rights reserved.
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <a
              href="https://web.facebook.com/profile.php?id=61594197483487"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#38bdf8", display: "inline-flex", alignItems: "center", gap: 4 }}
            >
              <FacebookIcon size={14} /> Facebook
            </a>
            <a href="#faq" style={{ color: "#94a3b8" }}>FAQs</a>
            <a href="#courses" style={{ color: "#94a3b8" }}>Courses</a>
            <a href="#guarantee" style={{ color: "#94a3b8" }}>Guarantee</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
