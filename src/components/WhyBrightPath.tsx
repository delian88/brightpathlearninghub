import React from "react";
import { GraduationCap, Gamepad2, Repeat, CheckCircle } from "lucide-react";

export default function WhyBrightPath() {
  const points = [
    {
      icon: <GraduationCap size={32} color="#133e87" />,
      bg: "#eff6ff",
      title: "High Quality 'Teachers by Choice'",
      subtitle: "Selected through rigorous 5-stage screening",
      desc: "Our educators are not teachers by accident, but by passion. Vetted by senior pedagogical leaders and trained continuously in modern child psychology and interactive teaching methodologies.",
    },
    {
      icon: <Gamepad2 size={32} color="#f59e0b" />,
      bg: "#fffbeb",
      title: "Interactive & Engaging Live Classes",
      subtitle: "Learning through play, stories & puzzles",
      desc: "Every single session is an immersive adventure. With animated storytelling, gamified coding challenges, and interactive math boards, children stay deeply invested from minute one.",
    },
    {
      icon: <Repeat size={32} color="#10b981" />,
      bg: "#ecfdf5",
      title: "Learn, Practise, Master, Repeat",
      subtitle: "Structured mastery framework",
      desc: "We ditch rote memorization. Through physical hands-on worksheets, live doubt solving, and structured revision cycles, concepts transition effortlessly into long-term cognitive skills.",
    },
  ];

  return (
    <section id="why-us" className="section-padding why-section">
      <div className="container">
        <div className="section-header">
          <span className="section-pill">The Bright Path Edge</span>
          <h2 className="section-title">Why Bright Path is the Best for Your Child</h2>
          <p className="section-subtitle">
            We believe that early childhood is the most fertile window for developing
            creative problem-solving, fearless expression, and foundational excellence.
          </p>
        </div>

        <div className="why-cards-grid">
          {points.map((pt, idx) => (
            <div key={idx} className="why-card">
              <div className="why-icon-box" style={{ backgroundColor: pt.bg }}>
                {pt.icon}
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
