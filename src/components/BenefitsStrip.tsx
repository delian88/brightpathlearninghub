import React from "react";
import { Users, BookOpen, Target, Award } from "lucide-react";

export default function BenefitsStrip() {
  const benefits = [
    {
      icon: <Users size={24} color="#1d4ed8" />,
      bg: "#eff6ff",
      title: "1:1 LIVE Classes",
      sub: "Dedicated teacher per child",
    },
    {
      icon: <BookOpen size={24} color="#059669" />,
      bg: "#ecfdf5",
      title: "Physical Worksheets",
      sub: "Delivered directly to doorstep",
    },
    {
      icon: <Target size={24} color="#d97706" />,
      bg: "#fffbeb",
      title: "Personalized Attention",
      sub: "Paced to your child's rhythm",
    },
    {
      icon: <Award size={24} color="#dc2626" />,
      bg: "#fef2f2",
      title: "Improvement Guarantee",
      sub: "100% measurable progress",
    },
  ];

  return (
    <section className="benefits-strip" aria-label="Key Benefits">
      <div className="container">
        <div className="benefits-grid">
          {benefits.map((b, idx) => (
            <div key={idx} className="benefit-item">
              <div className="benefit-icon-wrapper" style={{ backgroundColor: b.bg }}>
                {b.icon}
              </div>
              <div>
                <div className="benefit-text-title">{b.title}</div>
                <div className="benefit-text-sub">{b.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
