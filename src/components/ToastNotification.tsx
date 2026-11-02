"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastData {
  id?: number;
  message: string;
  type?: ToastType;
}

interface ToastNotificationProps {
  toast: ToastData | null;
  onClose: () => void;
}

export default function ToastNotification({ toast, onClose }: ToastNotificationProps) {
  if (!toast || !toast.message) return null;

  const type = toast.type || "success";

  const config: Record<
    ToastType,
    { border: string; iconBg: string; iconColor: string; icon: React.ReactNode; label: string }
  > = {
    success: {
      border: "#10b981",
      iconBg: "rgba(16, 185, 129, 0.18)",
      iconColor: "#34d399",
      icon: <CheckCircle2 size={20} />,
      label: "Success",
    },
    error: {
      border: "#ef4444",
      iconBg: "rgba(239, 68, 68, 0.18)",
      iconColor: "#f87171",
      icon: <XCircle size={20} />,
      label: "Alert",
    },
    warning: {
      border: "#f59e0b",
      iconBg: "rgba(245, 158, 11, 0.18)",
      iconColor: "#fbbf24",
      icon: <AlertTriangle size={20} />,
      label: "Notice",
    },
    info: {
      border: "#3b82f6",
      iconBg: "rgba(59, 130, 246, 0.18)",
      iconColor: "#60a5fa",
      icon: <Info size={20} />,
      label: "Notification",
    },
  };

  const styleConfig = config[type];

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 10000,
        background: "#071527",
        color: "#ffffff",
        padding: "14px 18px",
        borderRadius: 14,
        boxShadow: "0 20px 45px rgba(0, 0, 0, 0.38)",
        borderLeft: `5px solid ${styleConfig.border}`,
        borderTop: "1px solid rgba(255,255,255,0.1)",
        borderRight: "1px solid rgba(255,255,255,0.1)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        maxWidth: 440,
        minWidth: 290,
        fontFamily: "var(--font-sans)",
        animation: "fadeIn 0.22s ease-out",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: styleConfig.iconBg,
          color: styleConfig.iconColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {styleConfig.icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "0.7rem",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: styleConfig.iconColor,
            marginBottom: 2,
          }}
        >
          {styleConfig.label}
        </div>
        <div
          style={{
            fontSize: "0.86rem",
            fontWeight: 600,
            color: "#f8fafc",
            lineHeight: 1.4,
            wordBreak: "break-word",
          }}
        >
          {toast.message}
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        style={{
          background: "rgba(255,255,255,0.08)",
          color: "#94a3b8",
          border: "none",
          borderRadius: 8,
          width: 28,
          height: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <X size={15} />
      </button>
    </div>
  );
}

