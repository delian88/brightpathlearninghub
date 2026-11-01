"use client";

import React, { useState } from "react";
import { Play, Quote, Star, UserCheck, X } from "lucide-react";

export default function ParentTestimonials() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  const testimonials = [
    {
      quote:
        "The teacher explained all the basic concepts to my child with such great patience. Now my daughter can spell and pronounce any word correctly and has become a confident English speaker in her class!",
      author: "Ritu Sengupta",
      relation: "Mother of Sharmistha (Grade 2, Phonics & Public Speaking)",
      rating: 5,
      city: "Bengaluru",
      videoUrl: "https://www.youtube.com/embed/Ha97Zv064VE",
    },
    {
      quote:
        "My son used to be terrified of math word problems. Within just 6 weeks at Bright Path, he started solving visual puzzles faster than anyone in his school class! The 1:1 attention makes a massive difference.",
      author: "Arjun Verma",
      relation: "Father of Kabir (Grade 4, Bright Math Program)",
      rating: 5,
      city: "Mumbai",
      videoUrl: "https://www.youtube.com/embed/Ha97Zv064VE",
    },
    {
      quote:
        "Finding an engaging coding teacher for an 8-year-old was difficult until we discovered Bright Path. Maya built her first interactive animated story in Scratch on week 3. She looks forward to every single session!",
      author: "Sarah Jenkins",
      relation: "Mother of Maya (Grade 3, Coding Classes)",
      rating: 5,
      city: "London / Global Online",
      videoUrl: "https://www.youtube.com/embed/Ha97Zv064VE",
    },
  ];

  const current = testimonials[activeTestimonial];

  return (
    <section id="testimonials" className="section-padding" style={{ backgroundColor: "#0b2545" }}>
      <div className="container">
        <div className="section-header" style={{ marginBottom: 40 }}>
          <span
            className="section-pill"
            style={{ background: "rgba(245, 158, 11, 0.2)", color: "#fbbf24" }}
          >
            Verified Parent Stories
          </span>
          <h2 className="section-title" style={{ color: "#ffffff" }}>
            Hear It From Our Parents
          </h2>
          <p className="section-subtitle" style={{ color: "#94a3b8" }}>
            Over 50,000 parents trust Bright Path Learning Hub to shape their children&#39;s
            communication, logic, and self-belief.
          </p>
        </div>

        {/* Main Highlight Card */}
        <div className="testimonial-card-main">
          {/* Left Text Part */}
          <div>
            <div className="quote-icon-decor">
              <Quote size={54} />
            </div>

            <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
              {[...Array(current.rating)].map((_, i) => (
                <Star key={i} size={20} fill="#f59e0b" color="#f59e0b" />
              ))}
            </div>

            <blockquote className="testimonial-quote">
              &ldquo;{current.quote}&rdquo;
            </blockquote>

            <div>
              <div className="testimonial-author-name">{current.author}</div>
              <div className="testimonial-author-role">{current.relation}</div>
            </div>

            {/* Selector Dots */}
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  style={{
                    width: activeTestimonial === i ? 32 : 12,
                    height: 12,
                    borderRadius: 999,
                    backgroundColor: activeTestimonial === i ? "#f59e0b" : "rgba(255,255,255,0.25)",
                    transition: "all 0.3s ease",
                  }}
                  aria-label={`View testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Right Video Trigger Placeholder */}
          <div>
            <div
              className="testimonial-video-placeholder"
              onClick={() => setVideoModalOpen(true)}
              title="Watch Parent Video Story"
            >
              <div className="video-thumb-overlay" />
              {/* Fallback image/backdrop */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(45deg, #071527 0%, #1e3a8a 100%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  padding: 24,
                  textAlign: "center",
                }}
              >
                <div style={{ color: "#ffffff", fontSize: "0.95rem", fontWeight: 700, zIndex: 1 }}>
                  Watch Sharmistha & Mother&#39;s Journey
                </div>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", zIndex: 1 }}>
                  2 min story • Phonics & Confidence
                </div>
              </div>

              <div className="play-button-circle">
                <Play size={28} fill="#ffffff" style={{ marginLeft: 4 }} />
              </div>
            </div>
          </div>
        </div>

        {/* Video Modal */}
        {videoModalOpen && (
          <div className="modal-backdrop" onClick={() => setVideoModalOpen(false)}>
            <div
              className="modal-card"
              style={{ maxWidth: 760, background: "#000000", padding: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px 18px",
                  background: "#111827",
                  color: "#ffffff",
                }}
              >
                <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                  Parent Review • Bright Path Early Learning
                </span>
                <button
                  onClick={() => setVideoModalOpen(false)}
                  style={{ color: "#ffffff", background: "none", border: "none", cursor: "pointer" }}
                >
                  <X size={20} />
                </button>
              </div>
              <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
                <iframe
                  src="https://www.youtube-nocookie.com/embed/Ha97Zv064VE?autoplay=1"
                  title="Parent Testimonial Video"
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
