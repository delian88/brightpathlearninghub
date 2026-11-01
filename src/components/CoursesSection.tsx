"use client";

import React from "react";
import { BookOpen, Mic, Code, Calculator, Check, ArrowRight, Clock, Layers } from "lucide-react";
import { useSiteContent } from "@/context/SiteContentContext";

interface CoursesSectionProps {
  onSelectCourse: (courseName: string) => void;
}

export default function CoursesSection({ onSelectCourse }: CoursesSectionProps) {
  const { content } = useSiteContent();
  const { coursesSection } = content;

  const getIcon = (id: string) => {
    switch (id) {
      case "english-phonics":
        return <BookOpen size={48} />;
      case "public-speaking":
        return <Mic size={48} />;
      case "coding":
        return <Code size={48} />;
      case "v-math":
        return <Calculator size={48} />;
      default:
        return <BookOpen size={48} />;
    }
  };

  return (
    <section id="courses" className="section-padding">
      <div className="container">
        <div className="section-header">
          <span className="section-pill">{coursesSection.pill}</span>
          <h2 className="section-title">{coursesSection.title}</h2>
          <p className="section-subtitle">{coursesSection.subtitle}</p>
        </div>

        <div className="courses-grid">
          {coursesSection.courses.map((course) => (
            <div key={course.id} className="course-card">
              {/* Card Header */}
              <div
                className="course-card-header"
                style={{ backgroundColor: course.headerColor }}
              >
                <div>
                  <span
                    className="course-grades-badge"
                    style={{ color: course.headerColor }}
                  >
                    {course.grades}
                  </span>
                  <div className="course-brand-label">{course.brandLabel}</div>
                </div>

                <div className="course-icon-float">
                  {getIcon(course.id)}
                </div>
              </div>

              {/* Card Body */}
              <div className="course-card-body">
                <h3 className="course-card-title">{course.title}</h3>
                <p className="course-card-desc">{course.tagline}</p>

                {/* Feature Highlights */}
                <ul className="course-feature-list">
                  {course.highlights.map((h, i) => (
                    <li key={i} className="course-feature-item">
                      <Check size={16} className="course-feature-icon" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>

                {/* Meta details */}
                <div className="course-meta-pills">
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <Clock size={14} />
                    {course.hours}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <Layers size={14} />
                    {course.worksheetsCount}
                  </span>
                </div>

                {/* Explore & Book Button */}
                <button
                  onClick={() => onSelectCourse(course.title)}
                  className="btn btn-primary shining"
                  style={{ width: "100%", marginTop: "auto" }}
                >
                  <span>Book Free Trial</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
