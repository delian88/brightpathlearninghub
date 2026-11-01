import React from "react";
import { Medal } from "lucide-react";
import { useSiteContent } from "@/context/SiteContentContext";

export default function ShiningStars() {
  const { content } = useSiteContent();
  const { shiningStarsSection } = content;

  return (
    <section id="achievers" className="section-padding">
      <div className="container">
        <div className="section-header">
          <span className="section-pill">{shiningStarsSection.pill}</span>
          <h2 className="section-title">{shiningStarsSection.title}</h2>
          <p className="section-subtitle">{shiningStarsSection.subtitle}</p>
        </div>

        <div className="stars-grid">
          {shiningStarsSection.stars.map((star, idx) => (
            <div key={idx} className="star-card">
              <div className="star-header">
                <div
                  className="star-avatar"
                  style={{
                    backgroundColor: `${star.badgeColor || "#1d4ed8"}15`,
                    borderColor: star.badgeColor || "#1d4ed8",
                    color: star.badgeColor || "#1d4ed8",
                    fontWeight: 800,
                    fontSize: "1.1rem",
                  }}
                >
                  {star.initials}
                </div>
                <div>
                  <h3 className="star-name">{star.name}</h3>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 4 }}>
                    <span className="star-grade">{star.grade}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {star.program}
                    </span>
                  </div>
                </div>
              </div>

              <ul className="star-achievements">
                {star.achievements.map((ach, i) => (
                  <li key={i} className="star-achievement-item">
                    <Medal size={16} className="star-medal-icon" style={{ color: star.badgeColor || "#1d4ed8" }} />
                    <span>{ach}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
