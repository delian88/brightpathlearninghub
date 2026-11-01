"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import BenefitsStrip from "@/components/BenefitsStrip";
import CoursesSection from "@/components/CoursesSection";
import WhyBrightPath from "@/components/WhyBrightPath";
import ParentTestimonials from "@/components/ParentTestimonials";
import ShiningStars from "@/components/ShiningStars";
import OutcomeGuarantee from "@/components/OutcomeGuarantee";
import FaqSection from "@/components/FaqSection";
import CurriculumOverview from "@/components/CurriculumOverview";
import Footer from "@/components/Footer";
import BookingModal from "@/components/BookingModal";
import StickyBottomBar from "@/components/StickyBottomBar";

export default function Home() {
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("English Phonics & Reading");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );

    const targets = document.querySelectorAll(
      ".section-header, .benefit-item, .course-card, .why-card, .star-card, .guarantee-wrapper, .faq-item, .curriculum-table-wrapper"
    );
    targets.forEach((el) => {
      el.classList.add("reveal-on-scroll");
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleOpenBooking = (courseName?: string) => {
    if (courseName) {
      setSelectedCourse(courseName);
    }
    setBookingModalOpen(true);
  };

  const handleCloseBooking = () => {
    setBookingModalOpen(false);
  };

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top Navigation */}
      <Navbar onOpenBooking={handleOpenBooking} />

      {/* Hero / First Fold */}
      <HeroSection onOpenBooking={() => handleOpenBooking()} />

      {/* 4 Key Differentiators / Strip */}
      <BenefitsStrip />

      {/* Flagship 1:1 Courses */}
      <CoursesSection onSelectCourse={handleOpenBooking} />

      {/* Why Bright Path Is The Best */}
      <WhyBrightPath />

      {/* Parent Reviews & Video Stories */}
      <ParentTestimonials />

      {/* Student Achievers / Olympiad Winners */}
      <ShiningStars />

      {/* 100% Outcome Guarantee & Business Seal */}
      <OutcomeGuarantee />

      {/* FAQs */}
      <FaqSection />

      {/* SEO Curriculum Overview Table */}
      <CurriculumOverview />

      {/* Footer */}
      <Footer />

      {/* Persistent Sticky Bottom Bar */}
      <StickyBottomBar onOpenBooking={() => handleOpenBooking()} />

      {/* Booking Form Modal Flow */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={handleCloseBooking}
        defaultCourse={selectedCourse}
      />
    </main>
  );
}
