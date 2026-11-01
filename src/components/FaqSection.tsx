"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useSiteContent } from "@/context/SiteContentContext";

export default function FaqSection() {
  const { content } = useSiteContent();
  const { faqSection } = content;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="section-padding" style={{ backgroundColor: "var(--bg-main)" }}>
      <div className="container">
        <div className="section-header">
          <span className="section-pill">{faqSection.pill}</span>
          <h2 className="section-title">{faqSection.title}</h2>
          <p className="section-subtitle">{faqSection.subtitle}</p>
        </div>

        <div className="faq-container">
          {faqSection.faqs.map((faq, idx) => {
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
