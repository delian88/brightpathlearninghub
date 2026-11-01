"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle2, Calendar, Clock, User, Phone, Mail, BookOpen, MessageCircle } from "lucide-react";
import ToastNotification, { type ToastData, type ToastType } from "@/components/ToastNotification";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCourse?: string;
}

export default function BookingModal({
  isOpen,
  onClose,
  defaultCourse = "English Phonics & Reading",
}: BookingModalProps) {
  const [parentName, setParentName] = useState("");
  const [studentName, setStudentName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [grade, setGrade] = useState("Grade 2");
  const [courseName, setCourseName] = useState(defaultCourse);
  const [preferredTime, setPreferredTime] = useState("Weekday Evening (5 PM - 6 PM)");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [toast, setToast] = useState<ToastData | null>(null);

  const showToast = (message: string, type: ToastType = "success") => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 5000);
  };

  useEffect(() => {
    if (defaultCourse) {
      setCourseName(defaultCourse);
    }
  }, [defaultCourse]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    let courseId = "english-phonics";
    if (courseName.toLowerCase().includes("speaking")) courseId = "public-speaking";
    if (courseName.toLowerCase().includes("coding")) courseId = "coding";
    if (courseName.toLowerCase().includes("math")) courseId = "v-math";

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentName,
          studentName,
          phoneNumber,
          email,
          grade,
          courseId,
          courseName,
          preferredTime,
          notes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessData(data.booking);
        showToast(
          `Demo class booked for ${data.booking.studentName}! Confirmation email sent.`,
          "success"
        );
      } else {
        const msg = data.message || "Failed to submit booking. Please try again.";
        setErrorMsg(msg);
        showToast(msg, "error");
      }
    } catch (err: any) {
      const msg = "Connection error. Please try again.";
      setErrorMsg(msg);
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccessData(null);
    setParentName("");
    setStudentName("");
    setPhoneNumber("");
    setEmail("");
    setNotes("");
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Calendar size={22} color="var(--bp-navy-800)" />
            <h2 className="modal-title">Book a 100% Free 1:1 Live Demo</h2>
          </div>
          <button
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {successData ? (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "var(--bp-green-50)",
                  color: "var(--bp-green-600)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <CheckCircle2 size={40} />
              </div>

              <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--bp-navy-950)", marginBottom: 8 }}>
                Demo Class Confirmed!
              </h3>

              <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", marginBottom: 18 }}>
                Thank you, <strong>{successData.parentName}</strong>! We have reserved a complimentary
                1-on-1 session for <strong>{successData.studentName}</strong> in{" "}
                <strong>{successData.courseName}</strong> ({successData.grade}).
                {successData.email && (
                  <>
                    <br />
                    <span style={{ fontSize: "0.84rem", color: "var(--bp-green-600)", fontWeight: 600 }}>
                      ✉️ A confirmation email has been sent to {successData.email}.
                    </span>
                  </>
                )}
              </p>

              <div
                style={{
                  background: "var(--bg-main)",
                  borderRadius: "var(--radius-md)",
                  padding: "16px",
                  textAlign: "left",
                  fontSize: "0.85rem",
                  marginBottom: 20,
                  border: "1px solid var(--border-light)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: "var(--text-muted)" }}>Booking Ref:</span>
                  <span style={{ fontWeight: 800, color: "var(--bp-navy-900)" }}>
                    #BP-{String(successData.id).padStart(5, "0")}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: "var(--text-muted)" }}>Preferred Slot:</span>
                  <span style={{ fontWeight: 700 }}>{successData.preferredTime}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Contact Number:</span>
                  <span style={{ fontWeight: 700 }}>{successData.phoneNumber}</span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <a
                  href={`https://wa.me/2348063202616?text=Hi%20Bright%20Path!%20I%20just%20booked%20Demo%20#BP-${successData.id}%20for%20my%20child%20${encodeURIComponent(
                    successData.studentName
                  )}%20in%20${encodeURIComponent(successData.courseName)}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp shining"
                  style={{ width: "100%", padding: "12px 20px" }}
                >
                  <MessageCircle size={18} />
                  <span>Chat with Academic Counselor on WhatsApp</span>
                </a>

                <button
                  onClick={handleReset}
                  className="btn btn-navy"
                  style={{ width: "100%", padding: "10px 20px" }}
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {errorMsg && (
                <div
                  style={{
                    background: "var(--bp-coral-50)",
                    color: "var(--bp-coral-600)",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.85rem",
                    marginBottom: 16,
                  }}
                >
                  {errorMsg}
                </div>
              )}

              {/* Course Selection */}
              <div className="form-group">
                <label className="form-label">Select Course Program</label>
                <select
                  className="form-select"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  required
                >
                  <option value="English Phonics & Reading">
                    English Phonics & Reading (LKG - Grade 8)
                  </option>
                  <option value="Public Speaking & Communication">
                    Public Speaking & Communication (LKG - Grade 8)
                  </option>
                  <option value="Coding Classes for Kids">
                    Coding Classes for Kids (Grade 1 - 8)
                  </option>
                  <option value="Bright Math - Conceptual Mathematics">
                    Bright Math - Conceptual Mathematics (KG - Grade 8)
                  </option>
                </select>
              </div>

              {/* Student Name & Grade */}
              <div className="form-row-2col">
                <div className="form-group">
                  <label className="form-label">Child&#39;s Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Chidubem"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Grade / Class</label>
                  <select
                    className="form-select"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    required
                  >
                    <option value="LKG">LKG / Pre-K</option>
                    <option value="UKG">UKG / KG</option>
                    <option value="Grade 1">Grade 1</option>
                    <option value="Grade 2">Grade 2</option>
                    <option value="Grade 3">Grade 3</option>
                    <option value="Grade 4">Grade 4</option>
                    <option value="Grade 5">Grade 5</option>
                    <option value="Grade 6">Grade 6</option>
                    <option value="Grade 7">Grade 7</option>
                    <option value="Grade 8">Grade 8</option>
                  </select>
                </div>
              </div>

              {/* Parent Name */}
              <div className="form-group">
                <label className="form-label">Parent&#39;s Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Amina Bello"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  required
                />
              </div>

              {/* Contact Phone & Email */}
              <div className="form-row-2col equal">
                <div className="form-group">
                  <label className="form-label">WhatsApp Mobile No.</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+234 806 320 2616"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="parent@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Preferred Slot */}
              <div className="form-group">
                <label className="form-label">Preferred Demo Time Slot</label>
                <select
                  className="form-select"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                >
                  <option value="Weekday Morning (10 AM - 12 PM)">
                    Weekday Morning (10 AM - 12 PM)
                  </option>
                  <option value="Weekday Afternoon (2 PM - 4 PM)">
                    Weekday Afternoon (2 PM - 4 PM)
                  </option>
                  <option value="Weekday Evening (5 PM - 7 PM)">
                    Weekday Evening (5 PM - 7 PM)
                  </option>
                  <option value="Weekend Morning (10 AM - 1 PM)">
                    Weekend Morning (10 AM - 1 PM)
                  </option>
                  <option value="Weekend Evening (4 PM - 7 PM)">
                    Weekend Evening (4 PM - 7 PM)
                  </option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary shining"
                style={{ width: "100%", padding: "14px", fontSize: "1rem", marginTop: 8 }}
              >
                <span>{submitting ? "Booking Your Free Demo..." : "Confirm Free 1:1 Live Demo"}</span>
              </button>

              <p
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text-muted)",
                  textAlign: "center",
                  marginTop: 10,
                }}
              >
                🔒 Guaranteed 100% Free • Certified Teacher Assigned • No Obligation
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
