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

export const studentAccounts = pgTable("student_accounts", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id"),
  parentName: text("parent_name").notNull(),
  studentName: text("student_name").notNull(),
  email: text("email").notNull(),
  phoneNumber: text("phone_number").notNull(),
  grade: text("grade").notNull(),
  courseName: text("course_name").notNull(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  classLink: text("class_link"),
  scheduleSlot: text("schedule_slot"),
  status: text("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type DemoBooking = typeof demoBookings.$inferSelect;
export type NewDemoBooking = typeof demoBookings.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type StudentAccount = typeof studentAccounts.$inferSelect;
export type NewStudentAccount = typeof studentAccounts.$inferInsert;
export type SiteSetting = typeof siteSettings.$inferSelect;
