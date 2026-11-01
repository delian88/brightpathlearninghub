import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

if (connectionString) {
  try {
    const client = postgres(connectionString, { max: 10, prepare: false });
    dbInstance = drizzle(client, { schema });
  } catch (error) {
    console.warn("Failed to initialize postgres client with DATABASE_URL:", error);
  }
}

// In-memory fallback repository when DATABASE_URL is not yet configured
interface InMemoryStore {
  bookings: schema.DemoBooking[];
  leads: schema.Lead[];
  contacts: any[];
}

const memoryStore: InMemoryStore = {
  bookings: [
    {
      id: 1,
      parentName: "Amina Bello",
      phoneNumber: "+234 803 123 4567",
      email: "amina.bello@example.com",
      studentName: "Zainab Bello",
      grade: "Grade 2",
      courseId: "english-phonics",
      courseName: "English Phonics & Reading",
      preferredTime: "Weekday Evening (5 PM - 6 PM)",
      status: "confirmed",
      notes: "Interested in improving reading fluency and pronunciation.",
      createdAt: new Date(Date.now() - 3600000 * 2),
    },
    {
      id: 2,
      parentName: "Emeka Okafor",
      phoneNumber: "+234 806 320 2616",
      email: "emeka.okafor@example.com",
      studentName: "Chidubem Okafor",
      grade: "Grade 4",
      courseId: "coding",
      courseName: "Coding & AI Fundamentals",
      preferredTime: "Weekend Morning (10 AM - 11 AM)",
      status: "confirmed",
      notes: "Beginner curious about scratch and game building.",
      createdAt: new Date(Date.now() - 3600000 * 18),
    },
  ],
  leads: [
    {
      id: 1,
      phoneNumber: "+234 806 320 2616",
      countryCode: "+234",
      source: "hero_banner",
      createdAt: new Date(Date.now() - 7200000),
    },
    {
      id: 2,
      phoneNumber: "+234 812 555 0192",
      countryCode: "+234",
      source: "whatsapp_header",
      createdAt: new Date(Date.now() - 3600000 * 5),
    },
  ],
  contacts: [],
};

export const db = dbInstance;

export async function saveDemoBooking(data: schema.NewDemoBooking): Promise<schema.DemoBooking> {
  if (db) {
    try {
      const [inserted] = await db.insert(schema.demoBookings).values(data).returning();
      if (inserted) return inserted;
    } catch (err) {
      console.error("Drizzle database insert failed, falling back to memory store:", err);
    }
  }

  const newBooking: schema.DemoBooking = {
    id: memoryStore.bookings.length + 1,
    parentName: data.parentName,
    phoneNumber: data.phoneNumber,
    email: data.email || null,
    studentName: data.studentName,
    grade: data.grade,
    courseId: data.courseId,
    courseName: data.courseName,
    preferredTime: data.preferredTime,
    status: data.status || "confirmed",
    notes: data.notes || null,
    createdAt: new Date(),
  };

  memoryStore.bookings.unshift(newBooking);
  return newBooking;
}

export async function getDemoBookings(): Promise<schema.DemoBooking[]> {
  if (db) {
    try {
      const results = await db.select().from(schema.demoBookings).orderBy(schema.demoBookings.createdAt);
      if (results) return results.reverse();
    } catch (err) {
      console.error("Drizzle database select failed, falling back to memory store:", err);
    }
  }
  return memoryStore.bookings;
}

export async function saveLead(data: schema.NewLead): Promise<schema.Lead> {
  if (db) {
    try {
      const [inserted] = await db.insert(schema.leads).values(data).returning();
      if (inserted) return inserted;
    } catch (err) {
      console.error("Drizzle database insert lead failed, falling back to memory store:", err);
    }
  }

  const newLead: schema.Lead = {
    id: memoryStore.leads.length + 1,
    phoneNumber: data.phoneNumber,
    countryCode: data.countryCode || "+234",
    source: data.source || "website",
    createdAt: new Date(),
  };

  memoryStore.leads.unshift(newLead);
  return newLead;
}

export async function getLeads(): Promise<schema.Lead[]> {
  if (db) {
    try {
      const results = await db.select().from(schema.leads).orderBy(schema.leads.createdAt);
      if (results) return results.reverse();
    } catch (err) {
      console.error("Drizzle database select leads failed, falling back to memory store:", err);
    }
  }
  return memoryStore.leads;
}
