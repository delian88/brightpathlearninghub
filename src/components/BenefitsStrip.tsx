import React from "react";
import { Users, BookOpen, Target, Award } from "lucide-react";
import { useSiteContent } from "@/context/SiteContentContext";

export default function BenefitsStrip() {
  const { content } = useSiteContent();
  const icons = [
    { icon: <Users size={24} color="#1d4ed8" />, bg: "#eff6ff" },
    { icon: <BookOpen size={24} color="#059669" />, bg: "#ecfdf5" },
    { icon: <Target size={24} color="#d97706" />, bg: "#fffbeb" },
    { icon: <Award size={24} color="#dc2626" />, bg: "#fef2f2" },
  ];

  return (
    <section className="benefits-strip" aria-label="Key Benefits">
      <div className="container">
        <div className="benefits-grid">
          {content.benefits.map((b, idx) => {
            const style = icons[idx % icons.length];
            return (
              <div key={idx} className="benefit-item">
                <div className="benefit-icon-wrapper" style={{ backgroundColor: style.bg }}>
                  {style.icon}
                </div>
                <div>
                  <div className="benefit-text-title">{b.title}</div>
                  <div className="benefit-text-sub">{b.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
