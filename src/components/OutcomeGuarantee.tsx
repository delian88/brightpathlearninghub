import React from "react";
import Image from "next/image";
import { ShieldCheck, UserCheck, Award, TrendingUp, CheckCircle, FileCheck } from "lucide-react";
import { useSiteContent } from "@/context/SiteContentContext";

export default function OutcomeGuarantee() {
  const { content } = useSiteContent();
  const { guaranteeSection, general } = content;

  const promiseIcons = [
    <UserCheck key="0" size={28} color="#133e87" style={{ margin: "0 auto" }} />,
    <Award key="1" size={28} color="#f59e0b" style={{ margin: "0 auto" }} />,
    <TrendingUp key="2" size={28} color="#059669" style={{ margin: "0 auto" }} />,
  ];

  return (
    <section id="guarantee" className="section-padding" style={{ backgroundColor: "#ffffff" }}>
      <div className="container">
        <div className="guarantee-wrapper">
          <div className="guarantee-grid">
            {/* Left Content */}
            <div>
              <div className="guarantee-badge-banner">
                <ShieldCheck size={18} />
                <span>{guaranteeSection.badgeText}</span>
              </div>

              <h2 className="guarantee-title">{guaranteeSection.title}</h2>

              <p className="guarantee-desc">{guaranteeSection.description}</p>

              {/* Promises List */}
              <div className="guarantee-promises-list">
                {guaranteeSection.promises.map((p, idx) => (
                  <div key={idx} className="promise-box">
                    {promiseIcons[idx % promiseIcons.length]}
                    <div className="promise-title">{p.title}</div>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 4 }}>
                      {p.subtitle}
                    </p>
                  </div>
                ))}
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
                  {guaranteeSection.bottomBannerText}
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
                  {guaranteeSection.sealTitle}
                </h3>
                <p style={{ fontSize: "0.78rem", color: "var(--bp-green-600)", fontWeight: 700 }}>
                  Business Name Registration No. {general.registrationNo}
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
                    &ldquo;{guaranteeSection.sealQuote}&rdquo;
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
                    {guaranteeSection.sealDirectorate}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {guaranteeSection.sealCouncil}
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
