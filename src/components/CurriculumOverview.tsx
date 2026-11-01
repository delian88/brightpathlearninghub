import React from "react";

export default function CurriculumOverview() {
  const tableData = [
    {
      course: "ENGLISH SUPERSTAR – English Phonics & Reading",
      grades: "LKG – Grade 8",
      focus: "Phonics-based reading, blending, accent neutralization, and vocabulary comprehension",
      mode: "1:1 Live Interactive + 48 Physical Storybooks",
    },
    {
      course: "SUPERSPEAKERS – Public Speaking & Oratory",
      grades: "LKG – Grade 8",
      focus: "Spoken English fluency, overcoming stage fear, voice modulation, and debate mastery",
      mode: "1:1 Live Speech Labs + Trinity College Prep",
    },
    {
      course: "SUPERCODERS – Coding & AI Classes for Kids",
      grades: "Grade 1 – Grade 8",
      focus: "Computational thinking, Scratch animation, game logic, Python syntax, and AI fundamentals",
      mode: "1:1 Live Coding IDE + 12 Hands-on Projects",
    },
    {
      course: "SUPERMATH – Bright Math Conceptual Program",
      grades: "KG – Grade 8",
      focus: "Concept-first mathematics, Vedic speed tricks, visual geometry, and Olympiad problem-solving",
      mode: "1:1 Live Whiteboard + 60 Physical Worksheets",
    },
  ];

  return (
    <section className="section-padding" style={{ backgroundColor: "#ffffff", borderTop: "1px solid var(--border-light)" }}>
      <div className="container">
        <div className="section-header">
          <span className="section-pill">Curriculum Blueprint</span>
          <h2 className="section-title">Program Overview for Young Learners</h2>
          <p className="section-subtitle">
            A comprehensive, grade-aligned framework engineered to accelerate foundational skills 2x faster than traditional schooling.
          </p>
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
              {tableData.map((row, idx) => (
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
