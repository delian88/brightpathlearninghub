import React from "react";
import { useSiteContent } from "@/context/SiteContentContext";

export default function CurriculumOverview() {
  const { content } = useSiteContent();
  const { curriculumSection } = content;

  return (
    <section className="section-padding" style={{ backgroundColor: "#ffffff", borderTop: "1px solid var(--border-light)" }}>
      <div className="container">
        <div className="section-header">
          <span className="section-pill">{curriculumSection.pill}</span>
          <h2 className="section-title">{curriculumSection.title}</h2>
          <p className="section-subtitle">{curriculumSection.subtitle}</p>
        </div>

        <div className="curriculum-table-wrapper">
          <table className="curriculum-table">
            <thead>
              <tr>
                <th>Course Name</th>
                <th>Grades Covered</th>
                <th>Core Focus & Pedagogy</th>
                <th>Learning Mode</th>
              </tr>
            </thead>
            <tbody>
              {curriculumSection.rows.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700, color: "var(--bp-navy-950)" }}>
                    {row.course}
                  </td>
                  <td>
                    <span
                      style={{
                        background: "var(--bp-navy-100)",
                        color: "var(--bp-navy-900)",
                        padding: "4px 8px",
                        borderRadius: 999,
                        fontSize: "0.82rem",
                        fontWeight: 700,
                      }}
                    >
                      {row.grades}
                    </span>
                  </td>
                  <td>{row.focus}</td>
                  <td style={{ fontWeight: 600, color: "var(--bp-green-600)" }}>
                    {row.mode}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
