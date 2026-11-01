import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";

export const demoBookings = pgTable("demo_bookings", {
  id: serial("id").primaryKey(),
  parentName: text("parent_name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  email: text("email"),
  studentName: text("student_name").notNull(),
  grade: text("grade").notNull(),
  courseId: text("course_id").notNull(),
  courseName: text("course_name").notNull(),
  preferredTime: text("preferred_time").notNull(),
  status: text("status").default("confirmed").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  phoneNumber: text("phone_number").notNull(),
  countryCode: text("country_code").default("+234"),
  source: text("source").default("hero_banner").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contactInquiries = pgTable("contact_inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type DemoBooking = typeof demoBookings.$inferSelect;
export type NewDemoBooking = typeof demoBookings.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
