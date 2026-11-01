"use client";

import React from "react";
import { Calendar, MessageCircle } from "lucide-react";

interface StickyBottomBarProps {
  onOpenBooking: () => void;
}

export default function StickyBottomBar({ onOpenBooking }: StickyBottomBarProps) {
  return (
    <aside className="sticky-bottom-bar" aria-label="Quick Actions">
      <div className="container">
        <div className="sticky-bar-inner">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="sticky-bar-text">
              Unlock your child&#39;s potential with LIVE 1:1 classes in Phonics, Math, Coding & Public Speaking!
            </span>
          </div>

          <div className="sticky-actions-wrap">
            <a
              href="https://wa.me/2348063202616?text=Hi%20Bright%20Path,%20I%20want%20to%20know%20more%20about%20your%201:1%20courses."
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp"
              style={{ flex: 1, padding: "9px 14px", fontSize: "0.85rem" }}
            >
              <MessageCircle size={17} />
              <span>WhatsApp</span>
            </a>

            <button
              onClick={onOpenBooking}
              className="btn btn-primary shining"
              style={{ flex: 1.2, padding: "9px 16px", fontSize: "0.85rem" }}
            >
              <Calendar size={17} />
              <span>Book Demo</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
