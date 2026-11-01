"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "What is Bright Path Learning Hub?",
      a: "Bright Path Learning Hub is a comprehensive online education platform offering 1-on-1 live interactive classes for kids from KG to Grade 8. It delivers structured early childhood education courses designed to build essential skills that go far beyond standard school curricula to make students confident and future-ready.",
    },
    {
      q: "Which age group are these online classes suitable for?",
      a: "These online classes are specially designed for children aged 4 to 14 years (LKG through Grade 8), featuring age-appropriate interactive content, customized worksheets, and personalized learning paths for every stage of child development.",
    },
    {
      q: "What courses are included in Bright Path Learning Hub?",
      a: "Bright Path Learning Hub offers four core flagship programs: English Phonics & Reading, Public Speaking & Speech Communication, Coding Classes for Kids, and Bright Math (Conceptual Mathematics). These courses focus on language fluency, communication confidence, logical thinking, creativity, and numeracy.",
    },
    {
      q: "Are these online classes personalized?",
      a: "Yes, absolutely. All courses are conducted via LIVE 1-on-1 sessions, ensuring dedicated individual attention from our certified instructors. Each child learns at their own pace without peer pressure.",
    },
    {
      q: "How are these classes different from school learning?",
      a: "Our programs go beyond traditional school rote memorization. They focus on foundational mastery, practical speaking fluency, interactive computational logic, and hands-on physical worksheets delivered to your home.",
    },
    {
      q: "Do these courses include interactive activity classes for kids?",
      a: "Yes! Every single class incorporates hands-on activities, such as story decoding games, extempore speech exercises, interactive block coding projects, and visual math manipulatives that make learning deeply enjoyable.",
    },
    {
      q: "Why should parents choose Bright Path Learning Hub over other platforms?",
      a: "Bright Path Learning Hub stands out due to our vetted 'Teachers by Choice', live 1-on-1 interaction, physical worksheets delivered home, 100% Outcome Guarantee, and a registered academic framework (Business Reg. #9840276) dedicated to measurable student progress.",
    },
    {
      q: "Are these early education courses suitable for beginners?",
      a: "Yes! All courses are welcoming to complete beginners. Every learner begins with an introductory baseline diagnostic session so our educators can tailor the starting module to the child's exact current level.",
    },
  ];

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="section-padding" style={{ backgroundColor: "var(--bg-main)" }}>
      <div className="container">
        <div className="section-header">
          <span className="section-pill">Got Questions?</span>
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">
            Everything you need to know about our 1:1 online sessions, curriculum, worksheets, and enrollment.
          </p>
        </div>

        <div className="faq-container">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="faq-item">
                <button
                  type="button"
                  className="faq-trigger"
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={20}
                    className={`faq-icon-arrow ${isOpen ? "open" : ""}`}
                  />
                </button>
                {isOpen && <div className="faq-content">{faq.a}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
