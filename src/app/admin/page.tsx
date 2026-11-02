"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Key,
  PhoneCall,
  Globe,
  Sparkles,
  Award,
  BookOpen,
  MessageSquareQuote,
  Star,
  ShieldCheck,
  HelpCircle,
  Table,
  RefreshCw,
  Phone,
  User,
  Clock,
  ArrowLeft,
  Mail,
  CheckCircle,
  Search,
  ExternalLink,
  Lock,
  Copy,
  Check,
  Send,
  Save,
  Plus,
  Trash2,
  LogOut,
  Menu,
  X,
  Users,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  TrendingUp,
} from "lucide-react";
import { defaultSiteContent, type SiteContentData } from "@/lib/defaultSiteContent";
import { defaultLmsData, type LmsStateData } from "@/lib/lmsData";
import ToastNotification, { type ToastData, type ToastType } from "@/components/ToastNotification";
import AdminLmsManager from "@/components/AdminLmsManager";
import AdminCampusManager, { CAMPUS_TABS, type CampusTab } from "@/components/AdminCampusManager";
import AdminUserManagement from "@/components/AdminUserManagement";

type ActiveView =
  | "overview"
  | "users"
  | "bookings"
  | "credentials"
  | "leads"
  | "lms-homework"
  | "lms-progress"
  | "lms-reports"
  | "campus-profiles"
  | "campus-announcements"
  | "campus-timetable"
  | "campus-attendance"
  | "campus-materials"
  | "campus-messages"
  | "campus-support"
  | "campus-calendar"
  | "cms-general"
  | "cms-hero"
  | "cms-benefits"
  | "cms-courses"
  | "cms-why"
  | "cms-testimonials"
  | "cms-stars"
  | "cms-guarantee"
  | "cms-faq"
  | "cms-curriculum";

const VIEW_TO_PATH: Record<ActiveView, string> = {
  overview: "/admin",
  users: "/admin/users",
  bookings: "/admin/bookings",
  credentials: "/admin/credentials",
  leads: "/admin/leads",
  "lms-homework": "/admin/homework",
  "lms-progress": "/admin/progress",
  "lms-reports": "/admin/reports",
  "campus-profiles": "/admin/campus-profiles",
  "campus-announcements": "/admin/campus-announcements",
  "campus-timetable": "/admin/campus-timetable",
  "campus-attendance": "/admin/campus-attendance",
  "campus-materials": "/admin/campus-materials",
  "campus-messages": "/admin/campus-messages",
  "campus-support": "/admin/campus-support",
  "campus-calendar": "/admin/campus-calendar",
  "cms-general": "/admin/cms-general",
  "cms-hero": "/admin/cms-hero",
  "cms-benefits": "/admin/cms-benefits",
  "cms-courses": "/admin/cms-courses",
  "cms-why": "/admin/cms-why",
  "cms-testimonials": "/admin/cms-testimonials",
  "cms-stars": "/admin/cms-stars",
  "cms-guarantee": "/admin/cms-guarantee",
  "cms-faq": "/admin/cms-faq",
  "cms-curriculum": "/admin/cms-curriculum",
};

const SLUG_TO_VIEW: Record<string, ActiveView> = {
  overview: "overview",
  users: "users",
  "admin-users": "users",
  bookings: "bookings",
  credentials: "credentials",
  leads: "leads",
  homework: "lms-homework",
  "lms-homework": "lms-homework",
  progress: "lms-progress",
  "lms-progress": "lms-progress",
  reports: "lms-reports",
  "lms-reports": "lms-reports",
  "campus-profiles": "campus-profiles",
  "campus-announcements": "campus-announcements",
  "campus-timetable": "campus-timetable",
  "campus-attendance": "campus-attendance",
  "campus-materials": "campus-materials",
  "campus-messages": "campus-messages",
  "campus-support": "campus-support",
  "campus-calendar": "campus-calendar",
  "cms-general": "cms-general",
  "cms-hero": "cms-hero",
  "cms-benefits": "cms-benefits",
  "cms-courses": "cms-courses",
  "cms-why": "cms-why",
  "cms-testimonials": "cms-testimonials",
  "cms-stars": "cms-stars",
  "cms-guarantee": "cms-guarantee",
  "cms-faq": "cms-faq",
  "cms-curriculum": "cms-curriculum",
};

function AdminDashboardInner() {
  const router = useRouter();
  const pathname = usePathname();

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authHydrated, setAuthHydrated] = useState(false);
  const [authStep, setAuthStep] = useState<"credentials" | "otp">("credentials");
  const [loginEmail, setLoginEmail] = useState("brightpathlearninghub6@gmail.com");
  const [loginPassword, setLoginPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [otpSuccessMsg, setOtpSuccessMsg] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // 7-Day Trusted Device State
  const [trustDeviceChecked, setTrustDeviceChecked] = useState(true);
  const [isDeviceTrusted, setIsDeviceTrusted] = useState(false);
  const [trustedDaysRemaining, setTrustedDaysRemaining] = useState(0);

  // Navigation & Sidebar State
  const initialSegment = pathname ? pathname.replace(/^\/admin\/?/, "").split("/")[0] : "";
  const resolvedInitialView: ActiveView =
    (initialSegment && SLUG_TO_VIEW[initialSegment]) || "overview";
  const [activeView, setActiveView] = useState<ActiveView>(resolvedInitialView);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookingFilter, setBookingFilter] = useState<"all" | "confirmed" | "pending">("all");
  const [preselectedStudent, setPreselectedStudent] = useState<{
    username: string;
    studentName: string;
    courseName?: string;
    grade?: string;
  } | null>(null);

  useEffect(() => {
    if (pathname) {
      const segment = pathname.replace(/^\/admin\/?/, "").split("/")[0];
      if (!segment) {
        setActiveView("overview");
      } else if (SLUG_TO_VIEW[segment]) {
        setActiveView(SLUG_TO_VIEW[segment]);
      }
    }
  }, [pathname]);

  // Dashboard Data State
  const [bookings, setBookings] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [studentAccounts, setStudentAccounts] = useState<any[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContentData>(defaultSiteContent);
  const [lmsData, setLmsData] = useState<LmsStateData>(defaultLmsData);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<ToastData | null>(null);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [savingCms, setSavingCms] = useState(false);

  // Credential Generation Modal State
  const [credModalOpen, setCredModalOpen] = useState(false);
  const [credForm, setCredForm] = useState({
    bookingId: null as number | null,
    parentName: "",
    studentName: "",
    email: "",
    phoneNumber: "",
    grade: "Grade 2",
    courseName: "English Phonics & Reading",
    username: "",
    password: "",
    scheduleSlot: "Weekday Evening (5 PM - 6 PM)",
    classLink: "",
  });
  const [generatingCred, setGeneratingCred] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const showToast = (message: string, type: ToastType = "success") => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 5000);
  };

  useEffect(() => {
    // Immediately restore persistent admin session until explicit Sign Out
    const savedAuth =
      localStorage.getItem("bp_admin_auth") === "true" ||
      sessionStorage.getItem("bp_admin_auth") === "true";

    if (savedAuth) {
      localStorage.setItem("bp_admin_auth", "true");
      sessionStorage.setItem("bp_admin_auth", "true");
      setIsAuthenticated(true);
    }
    setAuthHydrated(true);

    const checkDeviceAndSession = async () => {
      const localToken = localStorage.getItem("bp_admin_trusted_device_token") || "";
      const localUntil = Number(localStorage.getItem("bp_admin_trusted_until") || "0");

      // If 7 days have passed, clear stored trusted device token so next login requires OTP
      if (localUntil && Date.now() >= localUntil) {
        localStorage.removeItem("bp_admin_trusted_device_token");
        localStorage.removeItem("bp_admin_trusted_until");
        setIsDeviceTrusted(false);
        setTrustedDaysRemaining(0);
        return;
      }

      try {
        const res = await fetch("/api/admin/auth", {
          headers: localToken ? { "x-trusted-device-token": localToken } : {},
          cache: "no-store",
        });
        const data = await res.json();
        if (data.trustedDevice) {
          setIsDeviceTrusted(true);
          setTrustedDaysRemaining(data.daysRemaining || 7);
        } else {
          localStorage.removeItem("bp_admin_trusted_device_token");
          localStorage.removeItem("bp_admin_trusted_until");
          setIsDeviceTrusted(false);
          setTrustedDaysRemaining(0);
        }
      } catch {
        // Ignore network check error
      }
    };

    checkDeviceAndSession();
  }, []);

  const fetchData = async (notify = false) => {
    setLoading(true);
    try {
      const [resB, resL, resS, resC, resLms] = await Promise.all([
        fetch("/api/bookings", { cache: "no-store" }),
        fetch("/api/leads", { cache: "no-store" }),
        fetch("/api/student-accounts", { cache: "no-store" }),
        fetch("/api/site-content", { cache: "no-store" }),
        fetch("/api/lms", { cache: "no-store" }),
      ]);
      const [dataB, dataL, dataS, dataC, dataLms] = await Promise.all([
        resB.json(),
        resL.json(),
        resS.json(),
        resC.json(),
        resLms.json(),
      ]);

      if (dataB.success) setBookings(dataB.data || []);
      if (dataL.success) setLeads(dataL.data || []);
      if (dataS.success) setStudentAccounts(dataS.data || []);
      if (dataC.success && dataC.content) {
        setSiteContent({ ...defaultSiteContent, ...dataC.content });
      }
      if (dataLms.success && dataLms.data) {
        setLmsData(dataLms.data);
      }
      if (notify) {
        showToast("Dashboard records refreshed successfully.", "info");
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
      if (notify) {
        showToast("Unable to refresh records. Please check your connection.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData(false);
    }
  }, [isAuthenticated]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    setOtpSuccessMsg("");
    try {
      const storedTrustedToken = localStorage.getItem("bp_admin_trusted_device_token") || "";
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: "login",
          email: loginEmail,
          password: loginPassword,
          trustedDeviceToken: storedTrustedToken,
        }),
      });
      const data = await res.json();
      if (data.success && data.requireOtp) {
        setOtpToken(data.otpToken);
        setOtpCode("");
        setAuthStep("otp");
        const msg =
          data.message || "A 6-digit OTP verification code has been sent to your email.";
        setOtpSuccessMsg(msg);
        showToast(msg, "info");
      } else if (data.success && data.verified) {
        localStorage.setItem("bp_admin_auth", "true");
        sessionStorage.setItem("bp_admin_auth", "true");
        if (data.trustedDevice) {
          setIsDeviceTrusted(true);
          setTrustedDaysRemaining(data.daysRemaining || 7);
        }
        setIsAuthenticated(true);
        showToast(
          data.message || "Signed in via 7-day trusted device verification!",
          "success"
        );
      } else {
        const errMsg = data.message || "Invalid administrator credentials.";
        setAuthError(errMsg);
        showToast(errMsg, "error");
      }
    } catch {
      const errMsg = "Connection error. Please try again.";
      setAuthError(errMsg);
      showToast(errMsg, "error");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: "verify-otp",
          email: loginEmail,
          otpCode,
          otpToken,
          trustDevice: trustDeviceChecked,
        }),
      });
      const data = await res.json();
      if (data.success && data.verified) {
        localStorage.setItem("bp_admin_auth", "true");
        sessionStorage.setItem("bp_admin_auth", "true");
        if (data.trustedDevice && data.trustedDeviceToken && data.trustedUntil) {
          localStorage.setItem("bp_admin_trusted_device_token", data.trustedDeviceToken);
          localStorage.setItem("bp_admin_trusted_until", String(data.trustedUntil));
          setIsDeviceTrusted(true);
          setTrustedDaysRemaining(7);
        } else {
          localStorage.removeItem("bp_admin_trusted_device_token");
          localStorage.removeItem("bp_admin_trusted_until");
          setIsDeviceTrusted(false);
          setTrustedDaysRemaining(0);
        }
        setIsAuthenticated(true);
        showToast(
          data.message ||
            (trustDeviceChecked
              ? "OTP verified! This device is now trusted for 7 days."
              : "OTP verified! Welcome to the Admin Dashboard."),
          "success"
        );
      } else {
        const errMsg = data.message || "Invalid OTP code.";
        setAuthError(errMsg);
        showToast(errMsg, "error");
      }
    } catch {
      const errMsg = "Connection error while verifying OTP.";
      setAuthError(errMsg);
      showToast(errMsg, "error");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setAuthLoading(true);
    setAuthError("");
    setOtpSuccessMsg("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: "login",
          email: loginEmail,
          password: loginPassword,
          forceOtp: true,
        }),
      });
      const data = await res.json();
      if (data.success && data.requireOtp) {
        setOtpToken(data.otpToken);
        setOtpCode("");
        const msg = "A new 6-digit OTP code has been sent to your email.";
        setOtpSuccessMsg(msg);
        showToast(msg, "info");
      } else {
        const errMsg = data.message || "Could not resend OTP.";
        setAuthError(errMsg);
        showToast(errMsg, "error");
      }
    } catch {
      const errMsg = "Connection error while resending OTP.";
      setAuthError(errMsg);
      showToast(errMsg, "error");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRevokeTrustedDevice = async () => {
    try {
      await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "revoke-trust" }),
      });
      localStorage.removeItem("bp_admin_trusted_device_token");
      localStorage.removeItem("bp_admin_trusted_until");
      setIsDeviceTrusted(false);
      setTrustedDaysRemaining(0);
      showToast(
        "7-day trusted device removed. A new OTP will be required on next login.",
        "warning"
      );
    } catch {
      showToast("Failed to update trusted device settings.", "error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("bp_admin_auth");
    sessionStorage.removeItem("bp_admin_auth");
    setIsAuthenticated(false);
    setAuthStep("credentials");
    setLoginPassword("");
    setOtpCode("");
    setOtpToken("");
    showToast("You have been signed out of the Admin Dashboard.", "info");
  };

  const handleConfirmBooking = async (booking: any) => {
    setConfirmingId(booking.id);
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: booking.id,
          status: "confirmed",
          sendEmail: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          `Booking #BP-${String(booking.id).padStart(5, "0")} confirmed & HTML emails sent to ${
            booking.email || "parent"
          } and Admin!`,
          "success"
        );
        fetchData(false);
      } else {
        showToast(data.message || "Could not confirm booking.", "error");
      }
    } catch {
      showToast("Failed to confirm booking. Please try again.", "error");
    } finally {
      setConfirmingId(null);
    }
  };

  const openCredentialGenerator = (booking?: any) => {
    const cleanFirst = (booking?.studentName || "STUDENT")
      .trim()
      .split(/\s+/)[0]
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase();
    const randomUsername = `BP-${cleanFirst}-${Math.floor(1000 + Math.random() * 9000)}`;
    const randomPassword = `Bright@${Math.floor(1000 + Math.random() * 9000)}`;

    setCredForm({
      bookingId: booking?.id || null,
      parentName: booking?.parentName || "",
      studentName: booking?.studentName || "",
      email: booking?.email || "",
      phoneNumber: booking?.phoneNumber || "",
      grade: booking?.grade || "Grade 2",
      courseName: booking?.courseName || "English Phonics & Reading",
      username: randomUsername,
      password: randomPassword,
      scheduleSlot: booking?.preferredTime || "Weekday Evening (5 PM - 6 PM)",
      classLink: "",
    });
    setGeneratedResult(null);
    setCredModalOpen(true);
  };

  const handleGenerateCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingCred(true);
    try {
      const portalUrl = `${window.location.origin}/portal`;
      const res = await fetch("/api/student-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...credForm,
          portalUrl,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedResult({
          account: data.account,
          portalUrl: data.portalUrl,
        });
        showToast(
          `Credentials generated for ${data.account.studentName} & Welcome Email sent to ${data.account.email}!`,
          "success"
        );
        fetchData(false);
      } else {
        showToast(data.message || "Could not generate student credentials.", "error");
      }
    } catch {
      showToast("Error generating student credentials.", "error");
    } finally {
      setGeneratingCred(false);
    }
  };

  const formatCredentialText = (acc: any) => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "https://brightpathlearninghub.vercel.app";
    return `🌟 *Bright Path Learning Hub — Student Login Credentials*\n\n👨‍🎓 *Student:* ${acc.studentName} (${acc.grade})\n📚 *Course:* ${acc.courseName}\n🔐 *Username:* ${acc.username}\n🔑 *Password:* ${acc.password}\n🌐 *Student Portal:* ${origin}/portal\n\nWelcome aboard! You can log in anytime using the credentials above.`;
  };

  const copyCredentials = (acc: any, keyId: string) => {
    const text = formatCredentialText(acc);
    navigator.clipboard.writeText(text);
    setCopiedId(keyId);
    showToast("Login credentials copied to clipboard!", "info");
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleSaveSiteContent = async () => {
    setSavingCms(true);
    try {
      const res = await fetch("/api/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: siteContent }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Landing page & website content published successfully!", "success");
      } else {
        showToast(data.message || "Failed to save changes.", "error");
      }
    } catch {
      showToast("Error saving website content.", "error");
    } finally {
      setSavingCms(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter !== "all" && (b.status || "confirmed") !== bookingFilter) return false;
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      b.parentName?.toLowerCase().includes(q) ||
      b.studentName?.toLowerCase().includes(q) ||
      b.phoneNumber?.toLowerCase().includes(q) ||
      b.email?.toLowerCase().includes(q) ||
      b.courseName?.toLowerCase().includes(q) ||
      b.grade?.toLowerCase().includes(q)
    );
  });

  const filteredLeads = leads.filter((l) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return l.phoneNumber?.toLowerCase().includes(q) || l.source?.toLowerCase().includes(q);
  });

  const filteredCredentials = studentAccounts.filter((acc) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      acc.studentName?.toLowerCase().includes(q) ||
      acc.parentName?.toLowerCase().includes(q) ||
      acc.username?.toLowerCase().includes(q) ||
      acc.email?.toLowerCase().includes(q) ||
      acc.courseName?.toLowerCase().includes(q)
    );
  });

  const cleanPhoneForWhatsApp = (phone: string) => (phone || "").replace(/[^0-9]/g, "");

  const isCmsView = activeView.startsWith("cms-");

  const viewTitles: Record<ActiveView, { title: string; subtitle: string }> = {
    overview: {
      title: "Executive Dashboard Overview",
      subtitle: "Real-time summary of demo bookings, student credentials, leads, and website CMS.",
    },
    users: {
      title: "User Management & Role Permissions",
      subtitle: "Add and manage teachers, staff, administrators and configure granular permissions.",
    },
    bookings: {
      title: "1:1 Demo Class Bookings",
      subtitle: "Review bookings, confirm sessions, send HTML confirmation emails, and generate student accounts.",
    },
    credentials: {
      title: "Student Login Credentials Manager",
      subtitle: "Generate student portal accounts, copy credentials for WhatsApp, and send Welcome HTML emails.",
    },
    leads: {
      title: "Quick Phone & WhatsApp Leads",
      subtitle: "Instant phone leads captured from the landing page hero banner.",
    },
    "lms-homework": {
      title: "Teacher Hub • Homework Builder & Submissions Grading",
      subtitle: "Create homework for individual students or entire classes, review auto-graded quizzes, and manually grade written answers.",
    },
    "lms-progress": {
      title: "Teacher Hub • Student Academic Development & AI Practice Logs",
      subtitle: "Track each child's reading fluency, learning hours, AI Learning Buddy sessions, strengths, and areas needing improvement.",
    },
    "lms-reports": {
      title: "Teacher Hub • Downloadable PDF Report Cards Generator",
      subtitle: "Generate official PDF report cards, email them to parents, and publish them to the Student & Parent Portal.",
    },
    "campus-profiles": {
      title: "Campus Hub - " + (CAMPUS_TABS.find((c) => c.id === "profiles")?.label || "") + "",
      subtitle: "Manage this module for the Student & Parent Portal.",
    },
    "campus-announcements": {
      title: "Campus Hub - " + (CAMPUS_TABS.find((c) => c.id === "announcements")?.label || "") + "",
      subtitle: "Manage this module for the Student & Parent Portal.",
    },
    "campus-timetable": {
      title: "Campus Hub - " + (CAMPUS_TABS.find((c) => c.id === "timetable")?.label || "") + "",
      subtitle: "Manage this module for the Student & Parent Portal.",
    },
    "campus-attendance": {
      title: "Campus Hub - " + (CAMPUS_TABS.find((c) => c.id === "attendance")?.label || "") + "",
      subtitle: "Manage this module for the Student & Parent Portal.",
    },
    "campus-materials": {
      title: "Campus Hub - " + (CAMPUS_TABS.find((c) => c.id === "materials")?.label || "") + "",
      subtitle: "Manage this module for the Student & Parent Portal.",
    },
    "campus-messages": {
      title: "Campus Hub - " + (CAMPUS_TABS.find((c) => c.id === "messages")?.label || "") + "",
      subtitle: "Manage this module for the Student & Parent Portal.",
    },
    "campus-support": {
      title: "Campus Hub - " + (CAMPUS_TABS.find((c) => c.id === "support")?.label || "") + "",
      subtitle: "Manage this module for the Student & Parent Portal.",
    },
    "campus-calendar": {
      title: "Campus Hub - " + (CAMPUS_TABS.find((c) => c.id === "calendar")?.label || "") + "",
      subtitle: "Manage this module for the Student & Parent Portal.",
    },
    "cms-general": {
      title: "CMS • General, Header & Footer Settings",
      subtitle: "Update brand name, registration number, phone, WhatsApp, email, address, and footer content.",
    },
    "cms-hero": {
      title: "CMS • Hero Banner Section",
      subtitle: "Customize headlines, animated rotating skill words, rating text, and official seal.",
    },
    "cms-benefits": {
      title: "CMS • Key Benefits Strip",
      subtitle: "Edit the 4 core differentiators displayed below the hero fold.",
    },
    "cms-courses": {
      title: "CMS • Flagship 1-on-1 Courses",
      subtitle: "Update course titles, grade ranges, taglines, hours, worksheets, and feature bullets.",
    },
    "cms-why": {
      title: "CMS • Why Bright Path Section",
      subtitle: "Edit the pedagogical pillars and educator highlights.",
    },
    "cms-testimonials": {
      title: "CMS • Parent Stories & Video Review",
      subtitle: "Manage parent quotes, ratings, and the featured YouTube video story.",
    },
    "cms-stars": {
      title: "CMS • Shining Stars Achievers",
      subtitle: "Update student Olympiad winners, speech distinctions, and coding champions.",
    },
    "cms-guarantee": {
      title: "CMS • 100% Outcome Guarantee",
      subtitle: "Customize guarantee terms, promises, and academic seal text.",
    },
    "cms-faq": {
      title: "CMS • Frequently Asked Questions",
      subtitle: "Add, edit, or remove FAQ items displayed on the landing page.",
    },
    "cms-curriculum": {
      title: "CMS • Curriculum Overview Table",
      subtitle: "Edit the SEO program comparison matrix at the bottom of the landing page.",
    },
  };

  // ============================================================================
  // LOGIN SCREEN (UNAUTHENTICATED)
  // ============================================================================
  if (!authHydrated) {
    return <div style={{ minHeight: "100vh", background: "#f8fafc" }} />;
  }

  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "radial-gradient(circle at 20% 20%, #133e87 0%, #071527 70%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
          fontFamily: "var(--font-sans)",
        }}
      >
        <ToastNotification toast={toast} onClose={() => setToast(null)} />

        <div
          style={{
            width: "100%",
            maxWidth: 440,
            background: "#ffffff",
            borderRadius: 24,
            padding: "40px 34px",
            boxShadow: "0 25px 60px rgba(0,0,0,0.45)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div
              style={{
                width: 82,
                height: 82,
                margin: "0 auto 14px",
                borderRadius: "50%",
                padding: 4,
                background: "linear-gradient(135deg, #f59e0b, #10b981)",
                boxShadow: "0 8px 20px rgba(245, 158, 11, 0.25)",
              }}
            >
              <Image
                src="/logo.png"
                alt="Bright Path Learning Hub"
                width={74}
                height={74}
                style={{ borderRadius: "50%", background: "#fff", width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
            <span
              style={{
                display: "inline-block",
                background: "#eff6ff",
                color: "#1d4ed8",
                fontSize: "0.72rem",
                fontWeight: 800,
                padding: "4px 12px",
                borderRadius: 999,
                letterSpacing: "0.05em",
                marginBottom: 8,
              }}
            >
              {authStep === "otp" ? "2-STEP OTP VERIFICATION" : "ADMINISTRATION PORTAL"}
            </span>
            <h1 style={{ fontSize: "1.45rem", fontWeight: 800, color: "#071527", margin: 0 }}>
              {authStep === "otp" ? "Enter Email OTP Code" : "Bright Path Control Center"}
            </h1>
            <p style={{ fontSize: "0.86rem", color: "#64748b", marginTop: 6 }}>
              {authStep === "otp"
                ? `We sent a 6-digit confirmation code to ${loginEmail}`
                : isDeviceTrusted
                ? `Trusted device active (${trustedDaysRemaining} day(s) remaining before next OTP).`
                : "Sign in with your administrator credentials to receive your 6-digit login OTP."}
            </p>
          </div>

          {isDeviceTrusted && authStep === "credentials" && (
            <div
              style={{
                background: "#ecfdf5",
                color: "#065f46",
                padding: "10px 14px",
                borderRadius: 12,
                fontSize: "0.8rem",
                fontWeight: 700,
                marginBottom: 16,
                border: "1px solid #a7f3d0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <ShieldCheck size={16} /> 7-Day Trusted Device ({trustedDaysRemaining}d left)
              </span>
              <button
                type="button"
                onClick={handleRevokeTrustedDevice}
                style={{
                  background: "none",
                  border: "none",
                  color: "#047857",
                  textDecoration: "underline",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Require OTP
              </button>
            </div>
          )}

          {otpSuccessMsg && authStep === "otp" && (
            <div
              style={{
                background: "#ecfdf5",
                color: "#065f46",
                padding: "12px 14px",
                borderRadius: 12,
                fontSize: "0.84rem",
                fontWeight: 600,
                marginBottom: 18,
                border: "1px solid #a7f3d0",
              }}
            >
              ✉️ {otpSuccessMsg}
            </div>
          )}

          {authError && (
            <div
              style={{
                background: "#fef2f2",
                color: "#dc2626",
                padding: "12px 14px",
                borderRadius: 12,
                fontSize: "0.84rem",
                fontWeight: 600,
                marginBottom: 18,
                border: "1px solid #fecaca",
              }}
            >
              {authError}
            </div>
          )}

          {authStep === "credentials" ? (
            <form onSubmit={handleAdminLogin}>
              <div className="form-group">
                <label className="form-label">Administrator Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="brightpathlearninghub6@gmail.com"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPass ? "text" : "password"}
                    className="form-input"
                    style={{ paddingRight: 42 }}
                    placeholder="Enter admin password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#64748b",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                    aria-label="Toggle password visibility"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="btn btn-primary shining"
                style={{ width: "100%", padding: "14px", fontSize: "0.96rem", marginTop: 10 }}
              >
                <Lock size={17} />
                <span>
                  {authLoading
                    ? isDeviceTrusted
                      ? "Signing In..."
                      : "Sending OTP Email..."
                    : isDeviceTrusted
                    ? "Sign In (Trusted Device)"
                    : "Continue & Send OTP Email"}
                </span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <div className="form-group">
                <label className="form-label" style={{ textAlign: "center" }}>
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="form-input"
                  style={{
                    textAlign: "center",
                    fontSize: "1.65rem",
                    fontWeight: 800,
                    letterSpacing: "10px",
                    fontFamily: "monospace",
                    padding: "14px",
                  }}
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ""))}
                  required
                  autoFocus
                />
              </div>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  background: "#f8fafc",
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "#334155",
                  cursor: "pointer",
                  marginBottom: 14,
                }}
              >
                <input
                  type="checkbox"
                  checked={trustDeviceChecked}
                  onChange={(e) => setTrustDeviceChecked(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: "#10b981", cursor: "pointer" }}
                />
                <span>Trust this device for 7 days (request new OTP after 7 days)</span>
              </label>

              <button
                type="submit"
                disabled={authLoading || otpCode.length !== 6}
                className="btn btn-primary shining"
                style={{ width: "100%", padding: "14px", fontSize: "0.96rem", marginTop: 4 }}
              >
                <ShieldCheck size={18} />
                <span>{authLoading ? "Verifying OTP..." : "Verify OTP & Enter Dashboard"}</span>
              </button>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 16,
                  fontSize: "0.82rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setAuthStep("credentials");
                    setAuthError("");
                    setOtpSuccessMsg("");
                  }}
                  style={{
                    color: "#64748b",
                    fontWeight: 600,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  ← Back to Login
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={authLoading}
                  style={{
                    color: "#1d4ed8",
                    fontWeight: 700,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Resend OTP Code
                </button>
              </div>
            </form>
          )}

          <div
            style={{
              marginTop: 22,
              paddingTop: 16,
              borderTop: "1px solid #f1f5f9",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.82rem",
            }}
          >
            <Link href="/" style={{ color: "#475569", fontWeight: 600, textDecoration: "none" }}>
              ← Public Website
            </Link>
            <Link href="/portal" style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>
              Student Portal →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const switchView = (view: ActiveView) => {
    setActiveView(view);
    setSidebarOpen(false);
    const targetPath = VIEW_TO_PATH[view] || "/admin";
    if (pathname !== targetPath) {
      router.push(targetPath);
    }
  };

  const assignHomeworkToStudent = (stu: {
    username: string;
    studentName: string;
    courseName?: string;
    grade?: string;
  }) => {
    setPreselectedStudent(stu);
    switchView("lms-homework");
    showToast(`Assigning homework specifically to ${stu.studentName} (${stu.username})`, "info");
  };

  // ============================================================================
  // AUTHENTICATED MODERN DASHBOARD SHELL
  // ============================================================================
  return (
    <div className="admin-shell">
      {/* Toast Notification */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      {/* Mobile Sidebar Backdrop */}
      <div
        className={`admin-sidebar-backdrop ${sidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* Brand Header */}
        <div
          style={{
            padding: "20px 18px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Image
              src="/logo.png"
              alt="Bright Path Logo"
              width={42}
              height={42}
              style={{
                borderRadius: "50%",
                background: "#ffffff",
                padding: 2,
                border: "2px solid #fbbf24",
                flexShrink: 0,
              }}
            />
            <div>
              <div style={{ fontWeight: 800, fontSize: "1rem", color: "#ffffff", lineHeight: 1.2 }}>
                Bright Path Hub
              </div>
              <div style={{ fontSize: "0.7rem", color: "#34d399", fontWeight: 700, marginTop: 2 }}>
                ADMIN & CMS PORTAL
              </div>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="admin-mobile-menu-btn"
            style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "none" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Groups */}
        <div style={{ flex: 1, paddingBottom: 16 }}>
          <div className="admin-nav-section-label">CRM & Operations</div>

          <button
            onClick={() => switchView("overview")}
            className={`admin-nav-item ${activeView === "overview" ? "active" : ""}`}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <LayoutDashboard size={17} /> Dashboard Overview
            </span>
          </button>

          <button
            onClick={() => switchView("users")}
            className={`admin-nav-item ${activeView === "users" ? "active" : ""}`}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Users size={17} /> Users & Roles
            </span>
            <span className="admin-nav-badge">{lmsData.adminUsers?.length || 2}</span>
          </button>

          <button
            onClick={() => switchView("bookings")}
            className={`admin-nav-item ${activeView === "bookings" ? "active" : ""}`}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Calendar size={17} /> Demo Bookings
            </span>
            <span className="admin-nav-badge">{bookings.length}</span>
          </button>

          <button
            onClick={() => switchView("credentials")}
            className={`admin-nav-item ${activeView === "credentials" ? "active" : ""}`}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Key size={17} /> Student Credentials
            </span>
            <span className="admin-nav-badge">{studentAccounts.length}</span>
          </button>

          <button
            onClick={() => switchView("leads")}
            className={`admin-nav-item ${activeView === "leads" ? "active" : ""}`}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <PhoneCall size={17} /> Quick Phone Leads
            </span>
            <span className="admin-nav-badge">{leads.length}</span>
          </button>

          <div className="admin-nav-section-label" style={{ marginTop: 8 }}>
            Teacher & Learning Hub
          </div>

          <button
            onClick={() => switchView("lms-homework")}
            className={`admin-nav-item ${activeView === "lms-homework" ? "active" : ""}`}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <FileText size={16} /> Homework & Grading
            </span>
            <span className="admin-nav-badge">{lmsData.assignments.length}</span>
          </button>

          <button
            onClick={() => switchView("lms-progress")}
            className={`admin-nav-item ${activeView === "lms-progress" ? "active" : ""}`}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <TrendingUp size={16} /> Student Progress & AI
            </span>
          </button>

          <button
            onClick={() => switchView("lms-reports")}
            className={`admin-nav-item ${activeView === "lms-reports" ? "active" : ""}`}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Award size={16} /> PDF Report Cards
            </span>
            <span className="admin-nav-badge">{lmsData.reportCards.length}</span>
          </button>


          <div className="admin-nav-section-label" style={{ marginTop: 8 }}>
            Campus & Portal Modules
          </div>
          {CAMPUS_TABS.map((c) => (
            <button
              key={c.id}
              onClick={() => switchView((`campus-${c.id}`) as ActiveView)}
              className={`admin-nav-item ${activeView === `campus-${c.id}` ? "active" : ""}`}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <LayoutDashboard size={16} /> {c.label}
              </span>
            </button>
          ))}
          <div className="admin-nav-section-label" style={{ marginTop: 8 }}>
            Landing Page CMS Editor
          </div>

          {[
            { id: "cms-general", label: "General & Footer", icon: <Globe size={16} /> },
            { id: "cms-hero", label: "Hero Banner", icon: <LayoutDashboard size={16} /> },
            { id: "cms-benefits", label: "4 Key Benefits", icon: <Award size={16} /> },
            { id: "cms-courses", label: "Flagship Courses", icon: <BookOpen size={16} /> },
            { id: "cms-why", label: "Why Bright Path", icon: <CheckCircle2 size={16} /> },
            { id: "cms-testimonials", label: "Parent Stories", icon: <MessageSquareQuote size={16} /> },
            { id: "cms-stars", label: "Shining Stars", icon: <Star size={16} /> },
            { id: "cms-guarantee", label: "100% Guarantee", icon: <ShieldCheck size={16} /> },
            { id: "cms-faq", label: "FAQs Manager", icon: <HelpCircle size={16} /> },
            { id: "cms-curriculum", label: "Curriculum Table", icon: <Table size={16} /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => switchView(item.id as ActiveView)}
              className={`admin-nav-item ${activeView === item.id ? "active" : ""}`}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {item.icon} {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* Sidebar Footer / Quick Links & Admin Info */}
        <div
          style={{
            padding: "16px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(0,0,0,0.2)",
          }}
        >
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <Link
              href="/"
              target="_blank"
              style={{
                flex: 1,
                padding: "8px 10px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.08)",
                color: "#e2e8f0",
                fontSize: "0.76rem",
                fontWeight: 700,
                textAlign: "center",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
              }}
            >
              <ExternalLink size={13} /> Live Site
            </Link>
            <Link
              href="/portal"
              target="_blank"
              style={{
                flex: 1,
                padding: "8px 10px",
                borderRadius: 8,
                background: "rgba(56, 189, 248, 0.14)",
                color: "#38bdf8",
                fontSize: "0.76rem",
                fontWeight: 700,
                textAlign: "center",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
              }}
            >
              <Users size={13} /> Portal
            </Link>
          </div>

          {isDeviceTrusted && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "rgba(16, 185, 129, 0.14)",
                color: "#34d399",
                padding: "6px 10px",
                borderRadius: 8,
                fontSize: "0.7rem",
                fontWeight: 700,
                marginBottom: 10,
              }}
            >
              <span>🛡️ Trusted Device ({trustedDaysRemaining}d)</span>
              <button
                type="button"
                onClick={handleRevokeTrustedDevice}
                style={{
                  background: "none",
                  border: "none",
                  color: "#fcd34d",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Reset
              </button>
            </div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#ffffff" }}>Administrator</div>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "#94a3b8",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                brightpathlearninghub6@gmail.com
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              style={{
                padding: "8px",
                borderRadius: 8,
                background: "rgba(239, 68, 68, 0.18)",
                color: "#fca5a5",
                border: "none",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="admin-main-wrapper">
        {/* TOP STICKY BAR */}
        <header className="admin-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setSidebarOpen(true)}
              className="admin-mobile-menu-btn"
              aria-label="Open navigation sidebar"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 style={{ fontSize: "1.18rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                {viewTitles[activeView].title}
              </h1>
              <p style={{ fontSize: "0.78rem", color: "#64748b", margin: "2px 0 0" }}>
                {viewTitles[activeView].subtitle}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {!isCmsView && (
              <div style={{ position: "relative", minWidth: 230 }}>
                <Search
                  size={15}
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                  }}
                />
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px 8px 34px",
                    borderRadius: 10,
                    border: "1px solid #cbd5e1",
                    background: "#f8fafc",
                    fontSize: "0.83rem",
                    outline: "none",
                  }}
                />
              </div>
            )}

            {isCmsView ? (
              <button
                onClick={handleSaveSiteContent}
                disabled={savingCms}
                className="btn btn-primary shining"
                style={{ padding: "8px 18px", minHeight: 38, fontSize: "0.84rem" }}
              >
                <Save size={15} />
                <span>{savingCms ? "Saving..." : "Save Section Changes"}</span>
              </button>
            ) : (
              <button
                onClick={() => openCredentialGenerator()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "#ffffff",
                  padding: "8px 14px",
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)",
                }}
              >
                <Key size={15} />
                <span>+ Generate Student Login</span>
              </button>
            )}

            <button
              onClick={() => fetchData(true)}
              disabled={loading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "#f1f5f9",
                color: "#334155",
                padding: "8px 12px",
                borderRadius: 10,
                fontWeight: 700,
                fontSize: "0.82rem",
                border: "1px solid #e2e8f0",
                cursor: "pointer",
              }}
            >
              <RefreshCw size={14} />
              <span>{loading ? "Syncing..." : "Refresh"}</span>
            </button>
          </div>
        </header>

        {/* WORKSPACE BODY */}
        <main style={{ padding: "24px", maxWidth: 1320, width: "100%", margin: "0 auto" }}>
          {/* =================================================================
              VIEW 1: EXECUTIVE OVERVIEW
              ================================================================= */}
          {activeView === "overview" && (
            <div>
              {/* 4 KPI Stat Cards */}
              <div className="admin-kpi-grid">
                <div className="admin-kpi-card" onClick={() => setActiveView("bookings")} style={{ cursor: "pointer" }}>
                  <div>
                    <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                      Demo Bookings
                    </div>
                    <div style={{ fontSize: "2.1rem", fontWeight: 800, color: "#0f172a", margin: "6px 0 4px" }}>
                      {bookings.length}
                    </div>
                    <div style={{ fontSize: "0.76rem", color: "#059669", fontWeight: 600 }}>
                      Click to confirm & email →
                    </div>
                  </div>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: "#eff6ff",
                      color: "#1d4ed8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Calendar size={24} />
                  </div>
                </div>

                <div
                  className="admin-kpi-card"
                  onClick={() => setActiveView("credentials")}
                  style={{ cursor: "pointer" }}
                >
                  <div>
                    <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                      Student Accounts
                    </div>
                    <div style={{ fontSize: "2.1rem", fontWeight: 800, color: "#059669", margin: "6px 0 4px" }}>
                      {studentAccounts.length}
                    </div>
                    <div style={{ fontSize: "0.76rem", color: "#64748b", fontWeight: 600 }}>
                      Active portal credentials →
                    </div>
                  </div>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: "#ecfdf5",
                      color: "#059669",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Key size={24} />
                  </div>
                </div>

                <div className="admin-kpi-card" onClick={() => setActiveView("leads")} style={{ cursor: "pointer" }}>
                  <div>
                    <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                      Quick Phone Leads
                    </div>
                    <div style={{ fontSize: "2.1rem", fontWeight: 800, color: "#0f172a", margin: "6px 0 4px" }}>
                      {leads.length}
                    </div>
                    <div style={{ fontSize: "0.76rem", color: "#6366f1", fontWeight: 600 }}>
                      Hero & WhatsApp captures →
                    </div>
                  </div>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: "#eef2ff",
                      color: "#4f46e5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <PhoneCall size={24} />
                  </div>
                </div>

                <div
                  className="admin-kpi-card"
                  onClick={() => setActiveView("cms-general")}
                  style={{ cursor: "pointer" }}
                >
                  <div>
                    <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                      Website CMS Sections
                    </div>
                    <div style={{ fontSize: "2.1rem", fontWeight: 800, color: "#d97706", margin: "6px 0 4px" }}>
                      10
                    </div>
                    <div style={{ fontSize: "0.76rem", color: "#d97706", fontWeight: 600 }}>
                      Edit landing page live →
                    </div>
                  </div>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: "#fffbeb",
                      color: "#d97706",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Globe size={24} />
                  </div>
                </div>
              </div>

              {/* Recent Demo Bookings Panel */}
              <div className="admin-panel-card" style={{ marginBottom: 24 }}>
                <div
                  style={{
                    padding: "18px 22px",
                    borderBottom: "1px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 10,
                  }}
                >
                  <div>
                    <h2 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800 }}>
                      Recent 1:1 Demo Bookings
                    </h2>
                    <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#64748b" }}>
                      Confirm bookings to trigger HTML emails to both the parent and admin, or generate student login credentials.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveView("bookings")}
                    style={{
                      background: "#f1f5f9",
                      color: "#0f172a",
                      padding: "7px 14px",
                      borderRadius: 8,
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    View All Bookings ({bookings.length}) →
                  </button>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
                        <th style={{ padding: "12px 18px", color: "#64748b" }}>Ref</th>
                        <th style={{ padding: "12px 18px", color: "#64748b" }}>Student & Grade</th>
                        <th style={{ padding: "12px 18px", color: "#64748b" }}>Course Program</th>
                        <th style={{ padding: "12px 18px", color: "#64748b" }}>Parent & Contact</th>
                        <th style={{ padding: "12px 18px", color: "#64748b" }}>Status</th>
                        <th style={{ padding: "12px 18px", color: "#64748b", textAlign: "right" }}>Quick Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.slice(0, 5).map((b) => (
                        <tr key={b.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "14px 18px", fontWeight: 800, color: "#475569" }}>
                            #BP-{String(b.id).padStart(5, "0")}
                          </td>
                          <td style={{ padding: "14px 18px" }}>
                            <div style={{ fontWeight: 800, color: "#0f172a" }}>{b.studentName}</div>
                            <div style={{ fontSize: "0.75rem", color: "#0284c7", fontWeight: 700 }}>{b.grade}</div>
                          </td>
                          <td style={{ padding: "14px 18px", fontWeight: 700, color: "#059669" }}>
                            {b.courseName}
                            <div style={{ fontSize: "0.74rem", color: "#64748b", fontWeight: 500 }}>
                              {b.preferredTime}
                            </div>
                          </td>
                          <td style={{ padding: "14px 18px" }}>
                            <div style={{ fontWeight: 700 }}>{b.parentName}</div>
                            <div style={{ fontSize: "0.76rem", color: "#64748b" }}>
                              {b.phoneNumber} {b.email ? `• ${b.email}` : ""}
                            </div>
                          </td>
                          <td style={{ padding: "14px 18px" }}>
                            <span
                              style={{
                                background: b.status === "confirmed" ? "#dcfce7" : "#fef3c7",
                                color: b.status === "confirmed" ? "#15803d" : "#b45309",
                                padding: "4px 10px",
                                borderRadius: 999,
                                fontSize: "0.72rem",
                                fontWeight: 800,
                                textTransform: "uppercase",
                              }}
                            >
                              {b.status || "confirmed"}
                            </span>
                          </td>
                          <td style={{ padding: "14px 18px", textAlign: "right" }}>
                            <div style={{ display: "inline-flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                              <button
                                onClick={() => handleConfirmBooking(b)}
                                disabled={confirmingId === b.id}
                                style={{
                                  background: "#0284c7",
                                  color: "#fff",
                                  border: "none",
                                  padding: "6px 10px",
                                  borderRadius: 6,
                                  fontSize: "0.75rem",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                }}
                                title="Confirm booking and send HTML confirmation emails to user & admin"
                              >
                                {confirmingId === b.id ? "Sending..." : "✓ Confirm & Email"}
                              </button>
                              <button
                                onClick={() => openCredentialGenerator(b)}
                                style={{
                                  background: "#059669",
                                  color: "#fff",
                                  border: "none",
                                  padding: "6px 10px",
                                  borderRadius: 6,
                                  fontSize: "0.75rem",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                }}
                                title="Generate Student Login Credentials & Send Welcome Email"
                              >
                                🔑 Generate Login
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quick CMS Section Jump Grid */}
              <div className="admin-panel-card" style={{ padding: 22 }}>
                <h2 style={{ margin: "0 0 6px", fontSize: "1.05rem", fontWeight: 800 }}>
                  Landing Page CMS Quick Editor
                </h2>
                <p style={{ margin: "0 0 16px", fontSize: "0.8rem", color: "#64748b" }}>
                  Select any section of the landing page below to customize its text, courses, FAQs, or contact details.
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: 12,
                  }}
                >
                  {[
                    { id: "cms-general", title: "General & Footer", desc: "Phone, Email, Address, Social" },
                    { id: "cms-hero", title: "Hero Banner", desc: "Headlines & Rotating Skills" },
                    { id: "cms-benefits", title: "4 Benefits Strip", desc: "Key Value Props" },
                    { id: "cms-courses", title: "Flagship Courses", desc: "All 4 Course Cards" },
                    { id: "cms-why", title: "Why Bright Path", desc: "3 Core Pedagogy Cards" },
                    { id: "cms-testimonials", title: "Parent Testimonials", desc: "Reviews & Video URL" },
                    { id: "cms-stars", title: "Shining Stars", desc: "Student Olympiad Winners" },
                    { id: "cms-guarantee", title: "100% Guarantee", desc: "Outcome Policy & Seal" },
                    { id: "cms-faq", title: "FAQs Section", desc: "Add / Edit Questions" },
                    { id: "cms-curriculum", title: "Curriculum Table", desc: "Course Matrix Rows" },
                  ].map((sec) => (
                    <button
                      key={sec.id}
                      onClick={() => switchView(sec.id as ActiveView)}
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: 12,
                        padding: "14px",
                        textAlign: "left",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div style={{ fontWeight: 800, fontSize: "0.88rem", color: "#0f172a" }}>{sec.title}</div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 3 }}>{sec.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              USER MANAGEMENT & ROLE PERMISSIONS
              ================================================================= */}
          {activeView === "users" && (
            <AdminUserManagement
              lmsData={lmsData}
              onRefresh={() => fetchData(false)}
              showToast={showToast}
            />
          )}

          {/* =================================================================
              VIEW 2: DEMO BOOKINGS
              ================================================================= */}
          {activeView === "bookings" && (
            <div>
              {/* Filter Pills */}
              <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
                {[
                  { id: "all", label: `All Bookings (${bookings.length})` },
                  {
                    id: "confirmed",
                    label: `Confirmed (${bookings.filter((b) => (b.status || "confirmed") === "confirmed").length})`,
                  },
                  {
                    id: "pending",
                    label: `Pending (${bookings.filter((b) => b.status === "pending").length})`,
                  },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setBookingFilter(f.id as any)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 999,
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      border: "1px solid #e2e8f0",
                      background: bookingFilter === f.id ? "#071527" : "#ffffff",
                      color: bookingFilter === f.id ? "#ffffff" : "#475569",
                      cursor: "pointer",
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {filteredBookings.length === 0 ? (
                <div className="admin-panel-card" style={{ padding: "60px 20px", textAlign: "center" }}>
                  <Calendar size={42} color="#94a3b8" style={{ margin: "0 auto 12px" }} />
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800 }}>No Demo Bookings Found</h3>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {filteredBookings.map((b) => (
                    <div key={b.id} className="admin-panel-card" style={{ padding: 22 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          flexWrap: "wrap",
                          gap: 12,
                        }}
                      >
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span
                              style={{
                                background: "#f1f5f9",
                                color: "#475569",
                                padding: "3px 8px",
                                borderRadius: 6,
                                fontSize: "0.75rem",
                                fontWeight: 800,
                              }}
                            >
                              #BP-{String(b.id).padStart(5, "0")}
                            </span>
                            <span style={{ fontSize: "1.18rem", fontWeight: 800, color: "#0f172a" }}>
                              {b.studentName}
                            </span>
                            <span
                              style={{
                                background: "#e0f2fe",
                                color: "#0369a1",
                                padding: "3px 10px",
                                borderRadius: 999,
                                fontSize: "0.75rem",
                                fontWeight: 700,
                              }}
                            >
                              {b.grade}
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: "0.9rem",
                              fontWeight: 700,
                              color: "#059669",
                              marginTop: 6,
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <BookOpen size={15} /> {b.courseName}
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span
                            style={{
                              background: b.status === "confirmed" ? "#dcfce7" : "#fef3c7",
                              color: b.status === "confirmed" ? "#15803d" : "#b45309",
                              padding: "5px 12px",
                              borderRadius: 999,
                              fontSize: "0.74rem",
                              fontWeight: 800,
                              textTransform: "uppercase",
                            }}
                          >
                            {b.status || "confirmed"}
                          </span>

                          <button
                            onClick={() => handleConfirmBooking(b)}
                            disabled={confirmingId === b.id}
                            style={{
                              background: "#0284c7",
                              color: "#ffffff",
                              border: "none",
                              padding: "8px 14px",
                              borderRadius: 8,
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <CheckCircle size={15} />
                            <span>
                              {confirmingId === b.id
                                ? "Sending Confirmation..."
                                : "Confirm & Send Confirmation Email"}
                            </span>
                          </button>

                          <button
                            onClick={() => openCredentialGenerator(b)}
                            style={{
                              background: "#059669",
                              color: "#ffffff",
                              border: "none",
                              padding: "8px 14px",
                              borderRadius: 8,
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <Key size={15} />
                            <span>Generate Login Credentials</span>
                          </button>

                          <button
                            onClick={() => {
                              const cleanFirst = String(b.studentName || "STUDENT")
                                .trim()
                                .split(/\s+/)[0]
                                .replace(/[^a-zA-Z0-9]/g, "")
                                .toUpperCase();
                              const matchedAcc = studentAccounts.find(
                                (a) =>
                                  a.studentName?.toLowerCase() ===
                                  String(b.studentName || "").trim().toLowerCase()
                              );
                              assignHomeworkToStudent({
                                username:
                                  matchedAcc?.username ||
                                  `BP-${cleanFirst}-${String(b.id || 100).padStart(4, "0")}`,
                                studentName: b.studentName,
                                courseName: b.courseName,
                                grade: b.grade,
                              });
                            }}
                            style={{
                              background: "#4f46e5",
                              color: "#ffffff",
                              border: "none",
                              padding: "8px 14px",
                              borderRadius: 8,
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <FileText size={15} />
                            <span>Assign Homework</span>
                          </button>
                        </div>
                      </div>

                      <hr style={{ border: "none", borderTop: "1px solid #f1f5f9", margin: "14px 0" }} />

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                          gap: 14,
                          fontSize: "0.85rem",
                        }}
                      >
                        <div>
                          <div style={{ color: "#64748b", fontSize: "0.72rem", fontWeight: 700 }}>PARENT / GUARDIAN</div>
                          <div style={{ fontWeight: 700, marginTop: 3, display: "flex", alignItems: "center", gap: 6 }}>
                            <User size={14} color="#64748b" /> {b.parentName}
                          </div>
                        </div>

                        <div>
                          <div style={{ color: "#64748b", fontSize: "0.72rem", fontWeight: 700 }}>PHONE / WHATSAPP</div>
                          <div style={{ fontWeight: 700, marginTop: 3, display: "flex", alignItems: "center", gap: 6 }}>
                            <Phone size={14} color="#64748b" /> {b.phoneNumber}
                          </div>
                        </div>

                        <div>
                          <div style={{ color: "#64748b", fontSize: "0.72rem", fontWeight: 700 }}>EMAIL ADDRESS</div>
                          <div style={{ fontWeight: 600, marginTop: 3, display: "flex", alignItems: "center", gap: 6 }}>
                            <Mail size={14} color="#64748b" /> {b.email || "Not provided"}
                          </div>
                        </div>

                        <div>
                          <div style={{ color: "#64748b", fontSize: "0.72rem", fontWeight: 700 }}>PREFERRED SLOT</div>
                          <div style={{ fontWeight: 600, marginTop: 3, display: "flex", alignItems: "center", gap: 6 }}>
                            <Clock size={14} color="#64748b" /> {b.preferredTime}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 10,
                          marginTop: 14,
                          paddingTop: 12,
                          borderTop: "1px dashed #e2e8f0",
                        }}
                      >
                        <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                          Booked on: {new Date(b.createdAt).toLocaleString()}
                        </div>
                        <a
                          href={`https://wa.me/${cleanPhoneForWhatsApp(b.phoneNumber)}?text=Hello%20${encodeURIComponent(
                            b.parentName
                          )},%20this%20is%20Bright%20Path%20Learning%20Hub%20confirming%20your%201:1%20demo%20booking%20for%20${encodeURIComponent(
                            b.studentName
                          )}.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            background: "#25d366",
                            color: "#ffffff",
                            padding: "7px 14px",
                            borderRadius: 8,
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <ExternalLink size={13} /> Message Parent on WhatsApp
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =================================================================
              VIEW 3: STUDENT LOGIN CREDENTIALS
              ================================================================= */}
          {activeView === "credentials" && (
            <div>
              {filteredCredentials.length === 0 ? (
                <div className="admin-panel-card" style={{ padding: "60px 20px", textAlign: "center" }}>
                  <Key size={42} color="#94a3b8" style={{ margin: "0 auto 12px" }} />
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800 }}>
                    No Student Credentials Generated Yet
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "6px 0 18px" }}>
                    Generate login credentials for a student to automatically email their Welcome & Confirmation package and copy their login details.
                  </p>
                  <button
                    onClick={() => openCredentialGenerator()}
                    className="btn btn-primary"
                    style={{ padding: "10px 20px", fontSize: "0.86rem" }}
                  >
                    <Key size={16} /> Generate First Student Login
                  </button>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 18 }}>
                  {filteredCredentials.map((acc) => (
                    <div
                      key={acc.id}
                      className="admin-panel-card"
                      style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: "1.12rem", color: "#0f172a" }}>
                            {acc.studentName} ({acc.grade})
                          </div>
                          <div style={{ fontSize: "0.82rem", color: "#059669", fontWeight: 700, marginTop: 2 }}>
                            {acc.courseName}
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 2 }}>
                            Parent: {acc.parentName} • {acc.email}
                          </div>
                        </div>
                        <span
                          style={{
                            background: "#dcfce7",
                            color: "#15803d",
                            padding: "4px 10px",
                            borderRadius: 999,
                            fontSize: "0.7rem",
                            fontWeight: 800,
                          }}
                        >
                          ACTIVE
                        </span>
                      </div>

                      <div
                        style={{
                          background: "#f8fafc",
                          border: "1px dashed #cbd5e1",
                          borderRadius: 10,
                          padding: "12px 14px",
                          fontFamily: "monospace",
                          fontSize: "0.86rem",
                        }}
                      >
                        <div>
                          <strong>Username:</strong> <span style={{ color: "#0f172a" }}>{acc.username}</span>
                        </div>
                        <div style={{ marginTop: 4 }}>
                          <strong>Password:</strong> <span style={{ color: "#dc2626" }}>{acc.password}</span>
                        </div>
                        <div style={{ marginTop: 4, fontFamily: "var(--font-sans)", fontSize: "0.76rem", color: "#64748b" }}>
                          <strong>Student Portal:</strong> /portal
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button
                          onClick={() => copyCredentials(acc, `acc-${acc.id}`)}
                          style={{
                            flex: 1,
                            background: copiedId === `acc-${acc.id}` ? "#059669" : "#071527",
                            color: "#ffffff",
                            border: "none",
                            padding: "9px 12px",
                            borderRadius: 8,
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                          }}
                        >
                          {copiedId === `acc-${acc.id}` ? <Check size={14} /> : <Copy size={14} />}
                          <span>{copiedId === `acc-${acc.id}` ? "Copied!" : "Copy Credentials"}</span>
                        </button>

                        <a
                          href={`https://wa.me/${cleanPhoneForWhatsApp(acc.phoneNumber)}?text=${encodeURIComponent(
                            formatCredentialText(acc)
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            background: "#25D366",
                            color: "#ffffff",
                            padding: "9px 12px",
                            borderRadius: 8,
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <ExternalLink size={14} /> WhatsApp
                        </a>

                        <button
                          onClick={() =>
                            assignHomeworkToStudent({
                              username: acc.username,
                              studentName: acc.studentName,
                              courseName: acc.courseName,
                              grade: acc.grade,
                            })
                          }
                          style={{
                            width: "100%",
                            background: "#4f46e5",
                            color: "#ffffff",
                            border: "none",
                            padding: "9px 12px",
                            borderRadius: 8,
                            fontSize: "0.8rem",
                            fontWeight: 800,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                          }}
                        >
                          <FileText size={14} /> Assign Homework to {acc.studentName}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =================================================================
              VIEW 4: QUICK PHONE LEADS
              ================================================================= */}
          {activeView === "leads" && (
            <div className="admin-panel-card">
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.86rem" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
                      <th style={{ padding: "14px 18px", color: "#64748b" }}>ID</th>
                      <th style={{ padding: "14px 18px", color: "#64748b" }}>Phone Number</th>
                      <th style={{ padding: "14px 18px", color: "#64748b" }}>Source</th>
                      <th style={{ padding: "14px 18px", color: "#64748b" }}>Captured At</th>
                      <th style={{ padding: "14px 18px", color: "#64748b", textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((l) => (
                      <tr key={l.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "14px 18px", color: "#94a3b8", fontWeight: 700 }}>#{l.id}</td>
                        <td style={{ padding: "14px 18px", fontWeight: 800, color: "#0f172a" }}>
                          {l.countryCode || ""} {l.phoneNumber}
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <span
                            style={{
                              background: "#ede9fe",
                              color: "#6d28d9",
                              padding: "3px 10px",
                              borderRadius: 999,
                              fontSize: "0.74rem",
                              fontWeight: 700,
                            }}
                          >
                            {l.source}
                          </span>
                        </td>
                        <td style={{ padding: "14px 18px", color: "#64748b" }}>
                          {new Date(l.createdAt).toLocaleString()}
                        </td>
                        <td style={{ padding: "14px 18px", textAlign: "right" }}>
                          <a
                            href={`https://wa.me/${cleanPhoneForWhatsApp(
                              `${l.countryCode || "+234"}${l.phoneNumber}`
                            )}?text=Hello%20from%20Bright%20Path%20Learning%20Hub!`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              background: "#25d366",
                              color: "#ffffff",
                              padding: "6px 12px",
                              borderRadius: 8,
                              fontSize: "0.78rem",
                              fontWeight: 700,
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                            }}
                          >
                            <ExternalLink size={13} /> Follow Up on WhatsApp
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeView.startsWith("campus-") && (
            <AdminCampusManager
              key={activeView}
              section={activeView.replace("campus-", "") as CampusTab}
              lmsData={lmsData}
              students={studentAccounts.map((s: any) => ({
                username: s.username,
                studentName: s.studentName,
              }))}
              onRefresh={() => fetchData(false)}
              showToast={showToast}
            />
          )}
          {/* =================================================================
              TEACHER HUB: HOMEWORK, ACADEMIC PROGRESS & PDF REPORT CARDS
              ================================================================= */}
          {(activeView === "lms-homework" ||
            activeView === "lms-progress" ||
            activeView === "lms-reports") && (
            <AdminLmsManager
              activeSection={activeView}
              lmsData={lmsData}
              studentAccounts={studentAccounts}
              bookings={bookings}
              preselectedStudent={preselectedStudent}
              onRefresh={() => fetchData(false)}
              showToast={showToast}
            />
          )}

          {/* =================================================================
              CMS VIEWS: LANDING PAGE & SECTIONS EDITOR
              ================================================================= */}
          {isCmsView && (
            <div className="admin-panel-card" style={{ padding: 26 }}>
              {/* 1. GENERAL & FOOTER */}
              {activeView === "cms-general" && (
                <div style={{ display: "grid", gap: 16 }}>
                  <div className="form-row-2col">
                    <div className="form-group">
                      <label className="form-label">Site / Brand Name</label>
                      <input
                        className="form-input"
                        value={siteContent.general.siteName}
                        onChange={(e) =>
                          setSiteContent({
                            ...siteContent,
                            general: { ...siteContent.general, siteName: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Business Registration No.</label>
                      <input
                        className="form-input"
                        value={siteContent.general.registrationNo}
                        onChange={(e) =>
                          setSiteContent({
                            ...siteContent,
                            general: { ...siteContent.general, registrationNo: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-row-2col">
                    <div className="form-group">
                      <label className="form-label">Phone Display Number</label>
                      <input
                        className="form-input"
                        value={siteContent.general.phone}
                        onChange={(e) =>
                          setSiteContent({
                            ...siteContent,
                            general: { ...siteContent.general, phone: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">WhatsApp Number (digits)</label>
                      <input
                        className="form-input"
                        value={siteContent.general.whatsapp}
                        onChange={(e) =>
                          setSiteContent({
                            ...siteContent,
                            general: { ...siteContent.general, whatsapp: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-row-2col">
                    <div className="form-group">
                      <label className="form-label">Official Email</label>
                      <input
                        className="form-input"
                        value={siteContent.general.email}
                        onChange={(e) =>
                          setSiteContent({
                            ...siteContent,
                            general: { ...siteContent.general, email: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Physical Address</label>
                      <input
                        className="form-input"
                        value={siteContent.general.address}
                        onChange={(e) =>
                          setSiteContent({
                            ...siteContent,
                            general: { ...siteContent.general, address: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-row-2col">
                    <div className="form-group">
                      <label className="form-label">Facebook Page URL</label>
                      <input
                        className="form-input"
                        value={siteContent.general.facebookUrl}
                        onChange={(e) =>
                          setSiteContent({
                            ...siteContent,
                            general: { ...siteContent.general, facebookUrl: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Operating Hours</label>
                      <input
                        className="form-input"
                        value={siteContent.general.workingHours}
                        onChange={(e) =>
                          setSiteContent({
                            ...siteContent,
                            general: { ...siteContent.general, workingHours: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Footer About Description</label>
                    <textarea
                      className="form-input"
                      rows={3}
                      value={siteContent.general.footerDescription}
                      onChange={(e) =>
                        setSiteContent({
                          ...siteContent,
                          general: { ...siteContent.general, footerDescription: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {/* 2. HERO SECTION */}
              {activeView === "cms-hero" && (
                <div style={{ display: "grid", gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Top Badge Pill Text</label>
                    <input
                      className="form-input"
                      value={siteContent.hero.badgeText}
                      onChange={(e) =>
                        setSiteContent({
                          ...siteContent,
                          hero: { ...siteContent.hero, badgeText: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div className="form-row-2col">
                    <div className="form-group">
                      <label className="form-label">Headline Line 1 Prefix</label>
                      <input
                        className="form-input"
                        value={siteContent.hero.titleLine1Prefix}
                        onChange={(e) =>
                          setSiteContent({
                            ...siteContent,
                            hero: { ...siteContent.hero, titleLine1Prefix: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Headline Line 1 Highlight (Gold)</label>
                      <input
                        className="form-input"
                        value={siteContent.hero.titleLine1Highlight}
                        onChange={(e) =>
                          setSiteContent({
                            ...siteContent,
                            hero: { ...siteContent.hero, titleLine1Highlight: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-row-2col">
                    <div className="form-group">
                      <label className="form-label">Headline Line 2 Prefix</label>
                      <input
                        className="form-input"
                        value={siteContent.hero.titleLine2Prefix}
                        onChange={(e) =>
                          setSiteContent({
                            ...siteContent,
                            hero: { ...siteContent.hero, titleLine2Prefix: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Headline Line 2 Highlight (Green)</label>
                      <input
                        className="form-input"
                        value={siteContent.hero.titleLine2Highlight}
                        onChange={(e) =>
                          setSiteContent({
                            ...siteContent,
                            hero: { ...siteContent.hero, titleLine2Highlight: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Rotating Animated Words (comma-separated)</label>
                    <input
                      className="form-input"
                      value={siteContent.hero.rotatingWords.join(", ")}
                      onChange={(e) =>
                        setSiteContent({
                          ...siteContent,
                          hero: {
                            ...siteContent.hero,
                            rotatingWords: e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          },
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Hero Subtitle</label>
                    <textarea
                      className="form-input"
                      rows={3}
                      value={siteContent.hero.subtitle}
                      onChange={(e) =>
                        setSiteContent({
                          ...siteContent,
                          hero: { ...siteContent.hero, subtitle: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div className="form-row-2col">
                    <div className="form-group">
                      <label className="form-label">Rating Text</label>
                      <input
                        className="form-input"
                        value={siteContent.hero.ratingText}
                        onChange={(e) =>
                          setSiteContent({
                            ...siteContent,
                            hero: { ...siteContent.hero, ratingText: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Lead Capture Card Prompt</label>
                      <input
                        className="form-input"
                        value={siteContent.hero.leadPrompt}
                        onChange={(e) =>
                          setSiteContent({
                            ...siteContent,
                            hero: { ...siteContent.hero, leadPrompt: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 3. BENEFITS STRIP */}
              {activeView === "cms-benefits" && (
                <div style={{ display: "grid", gap: 16 }}>
                  {siteContent.benefits.map((b, idx) => (
                    <div
                      key={idx}
                      style={{ padding: 16, border: "1px solid #e2e8f0", borderRadius: 12, background: "#f8fafc" }}
                    >
                      <div style={{ fontWeight: 800, fontSize: "0.86rem", marginBottom: 10 }}>
                        Benefit Item #{idx + 1}
                      </div>
                      <div className="form-row-2col">
                        <div className="form-group">
                          <label className="form-label">Title</label>
                          <input
                            className="form-input"
                            value={b.title}
                            onChange={(e) => {
                              const next = [...siteContent.benefits];
                              next[idx] = { ...next[idx], title: e.target.value };
                              setSiteContent({ ...siteContent, benefits: next });
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Subtitle</label>
                          <input
                            className="form-input"
                            value={b.sub}
                            onChange={(e) => {
                              const next = [...siteContent.benefits];
                              next[idx] = { ...next[idx], sub: e.target.value };
                              setSiteContent({ ...siteContent, benefits: next });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 4. FLAGSHIP COURSES */}
              {activeView === "cms-courses" && (
                <div style={{ display: "grid", gap: 18 }}>
                  <div className="form-row-2col">
                    <div className="form-group">
                      <label className="form-label">Section Pill</label>
                      <input
                        className="form-input"
                        value={siteContent.coursesSection.pill}
                        onChange={(e) =>
                          setSiteContent({
                            ...siteContent,
                            coursesSection: { ...siteContent.coursesSection, pill: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Section Title</label>
                      <input
                        className="form-input"
                        value={siteContent.coursesSection.title}
                        onChange={(e) =>
                          setSiteContent({
                            ...siteContent,
                            coursesSection: { ...siteContent.coursesSection, title: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  {siteContent.coursesSection.courses.map((course, idx) => (
                    <div
                      key={course.id}
                      style={{ padding: 18, border: "1px solid #cbd5e1", borderRadius: 12, background: "#f8fafc" }}
                    >
                      <div style={{ fontWeight: 800, marginBottom: 12, color: course.headerColor }}>
                        Course #{idx + 1}: {course.title}
                      </div>
                      <div className="form-row-2col">
                        <div className="form-group">
                          <label className="form-label">Course Title</label>
                          <input
                            className="form-input"
                            value={course.title}
                            onChange={(e) => {
                              const next = [...siteContent.coursesSection.courses];
                              next[idx] = { ...next[idx], title: e.target.value };
                              setSiteContent({
                                ...siteContent,
                                coursesSection: { ...siteContent.coursesSection, courses: next },
                              });
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Brand Label & Grades</label>
                          <div style={{ display: "flex", gap: 8 }}>
                            <input
                              className="form-input"
                              value={course.brandLabel}
                              onChange={(e) => {
                                const next = [...siteContent.coursesSection.courses];
                                next[idx] = { ...next[idx], brandLabel: e.target.value };
                                setSiteContent({
                                  ...siteContent,
                                  coursesSection: { ...siteContent.coursesSection, courses: next },
                                });
                              }}
                            />
                            <input
                              className="form-input"
                              value={course.grades}
                              onChange={(e) => {
                                const next = [...siteContent.coursesSection.courses];
                                next[idx] = { ...next[idx], grades: e.target.value };
                                setSiteContent({
                                  ...siteContent,
                                  coursesSection: { ...siteContent.coursesSection, courses: next },
                                });
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Tagline</label>
                        <input
                          className="form-input"
                          value={course.tagline}
                          onChange={(e) => {
                            const next = [...siteContent.coursesSection.courses];
                            next[idx] = { ...next[idx], tagline: e.target.value };
                            setSiteContent({
                              ...siteContent,
                              coursesSection: { ...siteContent.coursesSection, courses: next },
                            });
                          }}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Bullet Highlights (one per line)</label>
                        <textarea
                          className="form-input"
                          rows={4}
                          value={course.highlights.join("\n")}
                          onChange={(e) => {
                            const next = [...siteContent.coursesSection.courses];
                            next[idx] = {
                              ...next[idx],
                              highlights: e.target.value.split("\n").filter((l) => l.trim().length > 0),
                            };
                            setSiteContent({
                              ...siteContent,
                              coursesSection: { ...siteContent.coursesSection, courses: next },
                            });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 5. WHY BRIGHT PATH */}
              {activeView === "cms-why" && (
                <div style={{ display: "grid", gap: 16 }}>
                  {siteContent.whySection.points.map((pt, idx) => (
                    <div
                      key={idx}
                      style={{ padding: 16, border: "1px solid #e2e8f0", borderRadius: 12, background: "#f8fafc" }}
                    >
                      <div className="form-row-2col">
                        <div className="form-group">
                          <label className="form-label">Card #{idx + 1} Title</label>
                          <input
                            className="form-input"
                            value={pt.title}
                            onChange={(e) => {
                              const next = [...siteContent.whySection.points];
                              next[idx] = { ...next[idx], title: e.target.value };
                              setSiteContent({
                                ...siteContent,
                                whySection: { ...siteContent.whySection, points: next },
                              });
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Subtitle</label>
                          <input
                            className="form-input"
                            value={pt.subtitle}
                            onChange={(e) => {
                              const next = [...siteContent.whySection.points];
                              next[idx] = { ...next[idx], subtitle: e.target.value };
                              setSiteContent({
                                ...siteContent,
                                whySection: { ...siteContent.whySection, points: next },
                              });
                            }}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                          className="form-input"
                          rows={2}
                          value={pt.desc}
                          onChange={(e) => {
                            const next = [...siteContent.whySection.points];
                            next[idx] = { ...next[idx], desc: e.target.value };
                            setSiteContent({
                              ...siteContent,
                              whySection: { ...siteContent.whySection, points: next },
                            });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 6. PARENT TESTIMONIALS */}
              {activeView === "cms-testimonials" && (
                <div style={{ display: "grid", gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Featured YouTube Video Embed URL</label>
                    <input
                      className="form-input"
                      value={siteContent.testimonialsSection.videoUrl}
                      onChange={(e) =>
                        setSiteContent({
                          ...siteContent,
                          testimonialsSection: { ...siteContent.testimonialsSection, videoUrl: e.target.value },
                        })
                      }
                    />
                  </div>
                  {siteContent.testimonialsSection.items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{ padding: 16, border: "1px solid #e2e8f0", borderRadius: 12, background: "#f8fafc" }}
                    >
                      <div className="form-row-2col">
                        <div className="form-group">
                          <label className="form-label">Parent Name</label>
                          <input
                            className="form-input"
                            value={item.author}
                            onChange={(e) => {
                              const next = [...siteContent.testimonialsSection.items];
                              next[idx] = { ...next[idx], author: e.target.value };
                              setSiteContent({
                                ...siteContent,
                                testimonialsSection: { ...siteContent.testimonialsSection, items: next },
                              });
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Child & Program Relation</label>
                          <input
                            className="form-input"
                            value={item.relation}
                            onChange={(e) => {
                              const next = [...siteContent.testimonialsSection.items];
                              next[idx] = { ...next[idx], relation: e.target.value };
                              setSiteContent({
                                ...siteContent,
                                testimonialsSection: { ...siteContent.testimonialsSection, items: next },
                              });
                            }}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Review Quote</label>
                        <textarea
                          className="form-input"
                          rows={2}
                          value={item.quote}
                          onChange={(e) => {
                            const next = [...siteContent.testimonialsSection.items];
                            next[idx] = { ...next[idx], quote: e.target.value };
                            setSiteContent({
                              ...siteContent,
                              testimonialsSection: { ...siteContent.testimonialsSection, items: next },
                            });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 7. SHINING STARS */}
              {activeView === "cms-stars" && (
                <div style={{ display: "grid", gap: 16 }}>
                  {siteContent.shiningStarsSection.stars.map((star, idx) => (
                    <div
                      key={idx}
                      style={{ padding: 16, border: "1px solid #e2e8f0", borderRadius: 12, background: "#f8fafc" }}
                    >
                      <div className="form-row-2col">
                        <div className="form-group">
                          <label className="form-label">Student Name</label>
                          <input
                            className="form-input"
                            value={star.name}
                            onChange={(e) => {
                              const next = [...siteContent.shiningStarsSection.stars];
                              next[idx] = { ...next[idx], name: e.target.value };
                              setSiteContent({
                                ...siteContent,
                                shiningStarsSection: { ...siteContent.shiningStarsSection, stars: next },
                              });
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Grade & Program</label>
                          <div style={{ display: "flex", gap: 8 }}>
                            <input
                              className="form-input"
                              value={star.grade}
                              onChange={(e) => {
                                const next = [...siteContent.shiningStarsSection.stars];
                                next[idx] = { ...next[idx], grade: e.target.value };
                                setSiteContent({
                                  ...siteContent,
                                  shiningStarsSection: { ...siteContent.shiningStarsSection, stars: next },
                                });
                              }}
                            />
                            <input
                              className="form-input"
                              value={star.program}
                              onChange={(e) => {
                                const next = [...siteContent.shiningStarsSection.stars];
                                next[idx] = { ...next[idx], program: e.target.value };
                                setSiteContent({
                                  ...siteContent,
                                  shiningStarsSection: { ...siteContent.shiningStarsSection, stars: next },
                                });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Achievements (one per line)</label>
                        <textarea
                          className="form-input"
                          rows={3}
                          value={star.achievements.join("\n")}
                          onChange={(e) => {
                            const next = [...siteContent.shiningStarsSection.stars];
                            next[idx] = {
                              ...next[idx],
                              achievements: e.target.value.split("\n").filter(Boolean),
                            };
                            setSiteContent({
                              ...siteContent,
                              shiningStarsSection: { ...siteContent.shiningStarsSection, stars: next },
                            });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 8. OUTCOME GUARANTEE */}
              {activeView === "cms-guarantee" && (
                <div style={{ display: "grid", gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Section Title</label>
                    <input
                      className="form-input"
                      value={siteContent.guaranteeSection.title}
                      onChange={(e) =>
                        setSiteContent({
                          ...siteContent,
                          guaranteeSection: { ...siteContent.guaranteeSection, title: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Guarantee Description</label>
                    <textarea
                      className="form-input"
                      rows={3}
                      value={siteContent.guaranteeSection.description}
                      onChange={(e) =>
                        setSiteContent({
                          ...siteContent,
                          guaranteeSection: { ...siteContent.guaranteeSection, description: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bottom Highlight Guarantee Note</label>
                    <input
                      className="form-input"
                      value={siteContent.guaranteeSection.bottomBannerText}
                      onChange={(e) =>
                        setSiteContent({
                          ...siteContent,
                          guaranteeSection: { ...siteContent.guaranteeSection, bottomBannerText: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {/* 9. FAQs MANAGER */}
              {activeView === "cms-faq" && (
                <div style={{ display: "grid", gap: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800 }}>
                      FAQ Questions ({siteContent.faqSection.faqs.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        setSiteContent({
                          ...siteContent,
                          faqSection: {
                            ...siteContent.faqSection,
                            faqs: [
                              ...siteContent.faqSection.faqs,
                              { q: "New Question?", a: "Enter answer here..." },
                            ],
                          },
                        })
                      }
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        background: "#059669",
                        color: "#ffffff",
                        border: "none",
                        padding: "7px 14px",
                        borderRadius: 8,
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      <Plus size={14} /> Add New FAQ
                    </button>
                  </div>

                  {siteContent.faqSection.faqs.map((faq, idx) => (
                    <div
                      key={idx}
                      style={{ padding: 16, border: "1px solid #e2e8f0", borderRadius: 12, background: "#f8fafc" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <strong style={{ fontSize: "0.82rem" }}>FAQ #{idx + 1}</strong>
                        <button
                          type="button"
                          onClick={() => {
                            const next = siteContent.faqSection.faqs.filter((_, i) => i !== idx);
                            setSiteContent({
                              ...siteContent,
                              faqSection: { ...siteContent.faqSection, faqs: next },
                            });
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#dc2626",
                            cursor: "pointer",
                            fontSize: "0.78rem",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <Trash2 size={13} /> Remove
                        </button>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Question</label>
                        <input
                          className="form-input"
                          value={faq.q}
                          onChange={(e) => {
                            const next = [...siteContent.faqSection.faqs];
                            next[idx] = { ...next[idx], q: e.target.value };
                            setSiteContent({
                              ...siteContent,
                              faqSection: { ...siteContent.faqSection, faqs: next },
                            });
                          }}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Answer</label>
                        <textarea
                          className="form-input"
                          rows={2}
                          value={faq.a}
                          onChange={(e) => {
                            const next = [...siteContent.faqSection.faqs];
                            next[idx] = { ...next[idx], a: e.target.value };
                            setSiteContent({
                              ...siteContent,
                              faqSection: { ...siteContent.faqSection, faqs: next },
                            });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 10. CURRICULUM TABLE */}
              {activeView === "cms-curriculum" && (
                <div style={{ display: "grid", gap: 16 }}>
                  {siteContent.curriculumSection.rows.map((row, idx) => (
                    <div
                      key={idx}
                      style={{ padding: 16, border: "1px solid #e2e8f0", borderRadius: 12, background: "#f8fafc" }}
                    >
                      <div className="form-row-2col">
                        <div className="form-group">
                          <label className="form-label">Course Name</label>
                          <input
                            className="form-input"
                            value={row.course}
                            onChange={(e) => {
                              const next = [...siteContent.curriculumSection.rows];
                              next[idx] = { ...next[idx], course: e.target.value };
                              setSiteContent({
                                ...siteContent,
                                curriculumSection: { ...siteContent.curriculumSection, rows: next },
                              });
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Grades & Mode</label>
                          <div style={{ display: "flex", gap: 8 }}>
                            <input
                              className="form-input"
                              value={row.grades}
                              onChange={(e) => {
                                const next = [...siteContent.curriculumSection.rows];
                                next[idx] = { ...next[idx], grades: e.target.value };
                                setSiteContent({
                                  ...siteContent,
                                  curriculumSection: { ...siteContent.curriculumSection, rows: next },
                                });
                              }}
                            />
                            <input
                              className="form-input"
                              value={row.mode}
                              onChange={(e) => {
                                const next = [...siteContent.curriculumSection.rows];
                                next[idx] = { ...next[idx], mode: e.target.value };
                                setSiteContent({
                                  ...siteContent,
                                  curriculumSection: { ...siteContent.curriculumSection, rows: next },
                                });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Core Focus & Pedagogy</label>
                        <input
                          className="form-input"
                          value={row.focus}
                          onChange={(e) => {
                            const next = [...siteContent.curriculumSection.rows];
                            next[idx] = { ...next[idx], focus: e.target.value };
                            setSiteContent({
                              ...siteContent,
                              curriculumSection: { ...siteContent.curriculumSection, rows: next },
                            });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* CREDENTIAL GENERATOR MODAL */}
      {credModalOpen && (
        <div className="modal-backdrop" onClick={() => setCredModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Key size={20} color="var(--bp-navy-800)" />
                <h2 className="modal-title">Generate Student Login Credentials</h2>
              </div>
              <button onClick={() => setCredModalOpen(false)} className="modal-close-btn">
                ✕
              </button>
            </div>

            <div className="modal-body">
              {generatedResult ? (
                <div>
                  <div
                    style={{
                      background: "#ecfdf5",
                      border: "1px solid #10b981",
                      color: "#065f46",
                      padding: "14px",
                      borderRadius: 10,
                      marginBottom: 16,
                      fontSize: "0.88rem",
                      fontWeight: 600,
                    }}
                  >
                    ✅ Login credentials generated! A Confirmation & Welcome HTML Email has been sent to{" "}
                    <strong>{generatedResult.account.email}</strong>.
                  </div>

                  <div
                    style={{
                      background: "#f8fafc",
                      border: "2px dashed #94a3b8",
                      borderRadius: 10,
                      padding: 16,
                      fontFamily: "monospace",
                      fontSize: "0.9rem",
                      marginBottom: 16,
                    }}
                  >
                    <div>
                      <strong>Student:</strong> {generatedResult.account.studentName} ({generatedResult.account.grade})
                    </div>
                    <div>
                      <strong>Course:</strong> {generatedResult.account.courseName}
                    </div>
                    <div>
                      <strong>Username:</strong> {generatedResult.account.username}
                    </div>
                    <div>
                      <strong>Password:</strong>{" "}
                      <span style={{ color: "#dc2626" }}>{generatedResult.account.password}</span>
                    </div>
                    <div>
                      <strong>Portal URL:</strong> {generatedResult.portalUrl}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10, flexDirection: "column" }}>
                    <button
                      type="button"
                      onClick={() => copyCredentials(generatedResult.account, "modal-copy")}
                      className="btn btn-primary shining"
                      style={{ width: "100%", padding: "12px" }}
                    >
                      <Copy size={17} />
                      <span>
                        {copiedId === "modal-copy"
                          ? "Copied to Clipboard!"
                          : "Copy Credentials to Send to User"}
                      </span>
                    </button>

                    <a
                      href={`https://wa.me/${cleanPhoneForWhatsApp(
                        generatedResult.account.phoneNumber
                      )}?text=${encodeURIComponent(formatCredentialText(generatedResult.account))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-whatsapp"
                      style={{ width: "100%", padding: "12px", textDecoration: "none" }}
                    >
                      <ExternalLink size={17} />
                      <span>Send Credentials via WhatsApp</span>
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleGenerateCredentialsSubmit}>
                  <div className="form-row-2col">
                    <div className="form-group">
                      <label className="form-label">Student Name</label>
                      <input
                        className="form-input"
                        value={credForm.studentName}
                        onChange={(e) => setCredForm({ ...credForm, studentName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Grade</label>
                      <input
                        className="form-input"
                        value={credForm.grade}
                        onChange={(e) => setCredForm({ ...credForm, grade: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row-2col">
                    <div className="form-group">
                      <label className="form-label">Parent Name</label>
                      <input
                        className="form-input"
                        value={credForm.parentName}
                        onChange={(e) => setCredForm({ ...credForm, parentName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">User Email (for Welcome Email)</label>
                      <input
                        type="email"
                        className="form-input"
                        value={credForm.email}
                        onChange={(e) => setCredForm({ ...credForm, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row-2col">
                    <div className="form-group">
                      <label className="form-label">Phone / WhatsApp</label>
                      <input
                        className="form-input"
                        value={credForm.phoneNumber}
                        onChange={(e) => setCredForm({ ...credForm, phoneNumber: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Enrolled Course</label>
                      <input
                        className="form-input"
                        value={credForm.courseName}
                        onChange={(e) => setCredForm({ ...credForm, courseName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row-2col">
                    <div className="form-group">
                      <label className="form-label">Generated Username</label>
                      <input
                        className="form-input"
                        style={{ fontFamily: "monospace", fontWeight: 700 }}
                        value={credForm.username}
                        onChange={(e) => setCredForm({ ...credForm, username: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Generated Password</label>
                      <input
                        className="form-input"
                        style={{ fontFamily: "monospace", fontWeight: 700, color: "#dc2626" }}
                        value={credForm.password}
                        onChange={(e) => setCredForm({ ...credForm, password: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Live Classroom Link (Zoom / Google Meet - Optional)</label>
                    <input
                      className="form-input"
                      placeholder="https://meet.google.com/..."
                      value={credForm.classLink}
                      onChange={(e) => setCredForm({ ...credForm, classLink: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={generatingCred}
                    className="btn btn-primary shining"
                    style={{ width: "100%", padding: "13px", marginTop: 6 }}
                  >
                    <Send size={17} />
                    <span>
                      {generatingCred
                        ? "Generating & Sending Welcome Email..."
                        : "Generate Credentials & Send Welcome Email"}
                    </span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#f8fafc" }} />}>
      <AdminDashboardInner />
    </Suspense>
  );
}
