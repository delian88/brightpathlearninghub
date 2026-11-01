import React from "react";
import Image from "next/image";
import { ShieldCheck, UserCheck, Award, TrendingUp, CheckCircle, FileCheck } from "lucide-react";

export default function OutcomeGuarantee() {
  return (
    <section id="guarantee" className="section-padding" style={{ backgroundColor: "#ffffff" }}>
      <div className="container">
        <div className="guarantee-wrapper">
          <div className="guarantee-grid">
            {/* Left Content */}
            <div>
              <div className="guarantee-badge-banner">
                <ShieldCheck size={18} />
                <span>Zero Risk • Measurable Results</span>
              </div>

              <h2 className="guarantee-title">
                BRIGHT PATH’S 100% OUTCOME GUARANTEE
              </h2>

              <p className="guarantee-desc">
                At Bright Path Learning Hub, we believe in the transformative power of
                personalized education. If your child attends at least <strong>90% of their scheduled sessions</strong> and
                completes guided worksheets, we guarantee tangible, measurable improvement in their
                reading fluency, public speaking, mathematical problem solving, or coding reasoning.
              </p>

              {/* Promises List */}
              <div className="guarantee-promises-list">
                <div className="promise-box">
                  <UserCheck size={28} color="#133e87" style={{ margin: "0 auto" }} />
                  <div className="promise-title">Personalized Learning</div>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 4 }}>
                    Custom progression tailored to your child&#39;s speed
                  </p>
                </div>

                <div className="promise-box">
                  <Award size={28} color="#f59e0b" style={{ margin: "0 auto" }} />
                  <div className="promise-title">Expert-Led Classes</div>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 4 }}>
                    Top 1% vetted & background-checked educators
                  </p>
                </div>

                <div className="promise-box">
                  <TrendingUp size={28} color="#059669" style={{ margin: "0 auto" }} />
                  <div className="promise-title">Proven Outcomes</div>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 4 }}>
                    Standardized baseline & post-course assessment
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 18px",
                  background: "#ffffff",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid #fde68a",
                }}
              >
                <CheckCircle size={20} color="#10b981" />
                <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--bp-navy-950)" }}>
                  If you don&#39;t observe clear improvement, we provide complimentary extra 1:1 sessions until mastery is achieved.
                </span>
              </div>
            </div>

            {/* Right Seal & Certificate Card */}
            <div>
              <div className="guarantee-seal-card">
                <div style={{ position: "relative", width: 90, height: 90, margin: "0 auto 12px" }}>
                  <Image
                    src="/logo.png"
                    alt="Bright Path Learning Hub Official Seal"
                    width={90}
                    height={90}
                    style={{ objectFit: "contain" }}
                  />
                </div>

                <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--bp-navy-950)", marginBottom: 4 }}>
                  Official Academic Seal
                </h3>
                <p style={{ fontSize: "0.78rem", color: "var(--bp-green-600)", fontWeight: 700 }}>
                  Business Name Registration No. 9840276
                </p>

                <div
                  style={{
                    margin: "18px 0",
                    borderTop: "1px dashed var(--border-light)",
                    borderBottom: "1px dashed var(--border-light)",
                    padding: "12px 0",
                  }}
                >
                  <p style={{ fontStyle: "italic", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    &ldquo;We are committed to delivering results. We promise success. That is the Bright Path guarantee.&rdquo;
                  </p>
                  <div
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "1.2rem",
                      fontWeight: 800,
                      color: "var(--bp-navy-900)",
                      marginTop: 8,
                    }}
                  >
                    Academic Directorate
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Bright Path Learning Hub Academic Council
                  </div>
                </div>

                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.8rem", color: "#059669", fontWeight: 700 }}>
                  <FileCheck size={16} /> Verified Quality Assurance
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
