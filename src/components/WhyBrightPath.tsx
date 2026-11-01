import React from "react";
import { GraduationCap, Gamepad2, Repeat } from "lucide-react";
import { useSiteContent } from "@/context/SiteContentContext";

export default function WhyBrightPath() {
  const { content } = useSiteContent();
  const { whySection } = content;

  const icons = [
    <GraduationCap key="0" size={32} color="#133e87" />,
    <Gamepad2 key="1" size={32} color="#f59e0b" />,
    <Repeat key="2" size={32} color="#10b981" />,
  ];

  return (
    <section id="why-us" className="section-padding why-section">
      <div className="container">
        <div className="section-header">
          <span className="section-pill">{whySection.pill}</span>
          <h2 className="section-title">{whySection.title}</h2>
          <p className="section-subtitle">{whySection.subtitle}</p>
        </div>

        <div className="why-cards-grid">
          {whySection.points.map((pt, idx) => (
            <div key={idx} className="why-card">
              <div className="why-icon-box" style={{ backgroundColor: pt.bg || "#eff6ff" }}>
                {icons[idx % icons.length]}
              </div>
              <h3 className="why-card-title">{pt.title}</h3>
              <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--bp-navy-800)", marginBottom: 10 }}>
                {pt.subtitle}
              </p>
              <p className="why-card-desc">{pt.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
