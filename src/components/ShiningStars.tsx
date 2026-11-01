import React from "react";
import { Medal } from "lucide-react";

export default function ShiningStars() {
  const stars = [
    {
      name: "Anika Bandhopadhyay",
      grade: "Grade 1",
      program: "English Phonics & Public Speaking",
      achievements: [
        "Trinity College London",
        "Bronze Young Performer Award",
        "Speech Fluency Top Rank",
      ],
      badgeColor: "#1d4ed8",
      initials: "AB",
    },
    {
      name: "Prisha Singh",
      grade: "SLEP - Grade 1",
      program: "English Superstar",
      achievements: [
        "SpellBee International Top Ranker",
        "Strategic Language Programme",
        "100% Phonics Word Mastery",
      ],
      badgeColor: "#059669",
      initials: "PS",
    },
    {
      name: "Penida Riyanshi",
      grade: "Grade 2",
      program: "English Superstar",
      achievements: [
        "International English Olympiad (IEO)",
        "Gold Medal of Distinction",
        "Certificate of Zonal Excellence",
      ],
      badgeColor: "#f59e0b",
      initials: "PR",
    },
    {
      name: "Reyansh Kulkarni",
      grade: "Grade 3",
      program: "Supercoders Track",
      achievements: [
        "National Junior Game Jam Winner",
        "Built 8 interactive Scratch games",
        "Algorithm Speed Distinction",
      ],
      badgeColor: "#dc2626",
      initials: "RK",
    },
    {
      name: "Aarav Patel",
      grade: "Grade 4",
      program: "Bright Math Program",
      achievements: [
        "International Math Olympiad (IMO) Rank 14",
        "Mental Math 2x Speed Champion",
        "Vedic Calculation Certified",
      ],
      badgeColor: "#7c3aed",
      initials: "AP",
    },
    {
      name: "Ananya Roy",
      grade: "Grade 2",
      program: "Superspeakers Track",
      achievements: [
        "Inter-School Storytelling Champion",
        "Fearless Stage Delivery Award",
        "Vocabulary Distinction",
      ],
      badgeColor: "#0284c7",
      initials: "AR",
    },
  ];

  return (
    <section id="achievers" className="section-padding">
      <div className="container">
        <div className="section-header">
          <span className="section-pill">Wall of Pride</span>
          <h2 className="section-title">Shining Stars of Bright Path</h2>
          <p className="section-subtitle">
            Celebrate the triumphs of our young learners winning international olympiads,
            prestigious speech certifications, and coding honors.
          </p>
        </div>

        <div className="stars-grid">
          {stars.map((star, idx) => (
            <div key={idx} className="star-card">
              <div className="star-header">
                <div
                  className="star-avatar"
                  style={{
                    backgroundColor: `${star.badgeColor}15`,
                    borderColor: star.badgeColor,
                    color: star.badgeColor,
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
                    <Medal size={16} className="star-medal-icon" style={{ color: star.badgeColor }} />
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
