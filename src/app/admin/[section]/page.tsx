import { Suspense } from "react";
import AdminDashboardPage from "../page";

export function generateStaticParams() {
  return [
    { section: "overview" },
    { section: "users" },
    { section: "bookings" },
    { section: "credentials" },
    { section: "leads" },
    { section: "homework" },
    { section: "progress" },
    { section: "reports" },
    { section: "campus-profiles" },
    { section: "campus-announcements" },
    { section: "campus-timetable" },
    { section: "campus-attendance" },
    { section: "campus-materials" },
    { section: "campus-messages" },
    { section: "campus-support" },
    { section: "campus-calendar" },
    { section: "cms-general" },
    { section: "cms-hero" },
    { section: "cms-benefits" },
    { section: "cms-courses" },
    { section: "cms-why" },
    { section: "cms-testimonials" },
    { section: "cms-stars" },
    { section: "cms-guarantee" },
    { section: "cms-faq" },
    { section: "cms-curriculum" },
  ];
}

export default function AdminSectionPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#f8fafc" }} />}>
      <AdminDashboardPage />
    </Suspense>
  );
}
