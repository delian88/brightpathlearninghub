import { drizzle } from "drizzle-orm/postgres-js";
import { eq, or } from "drizzle-orm";
import postgres from "postgres";
import * as schema from "./schema";
import { defaultSiteContent, type SiteContentData } from "@/lib/defaultSiteContent";

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
  studentAccounts: schema.StudentAccount[];
  siteContent: SiteContentData;
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
  studentAccounts: [],
  siteContent: defaultSiteContent,
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
    status: data.status || "pending",
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

export async function updateDemoBookingStatus(
  id: number,
  status: string,
  notes?: string
): Promise<schema.DemoBooking | null> {
  if (db) {
    try {
      const updateValues: Partial<schema.NewDemoBooking> = { status };
      if (notes !== undefined) updateValues.notes = notes;
      const [updated] = await db
        .update(schema.demoBookings)
        .set(updateValues)
        .where(eq(schema.demoBookings.id, id))
        .returning();
      if (updated) return updated;
    } catch (err) {
      console.error("Drizzle database update booking failed:", err);
    }
  }

  const found = memoryStore.bookings.find((b) => b.id === id);
  if (found) {
    found.status = status;
    if (notes !== undefined) found.notes = notes;
    return found;
  }
  return null;
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

export async function getSiteContent(): Promise<SiteContentData> {
  if (db) {
    try {
      const rows = await db
        .select()
        .from(schema.siteSettings)
        .where(eq(schema.siteSettings.key, "landing_page_content"));
      if (rows && rows.length > 0 && rows[0].value) {
        const parsed = JSON.parse(rows[0].value);
        return { ...defaultSiteContent, ...parsed };
      }
    } catch (err) {
      console.error("Failed to load site_settings from DB, using defaults:", err);
    }
  }
  return memoryStore.siteContent;
}

export async function saveSiteContent(content: SiteContentData): Promise<SiteContentData> {
  memoryStore.siteContent = content;
  if (db) {
    try {
      const existing = await db
        .select()
        .from(schema.siteSettings)
        .where(eq(schema.siteSettings.key, "landing_page_content"));

      const serialized = JSON.stringify(content);
      if (existing && existing.length > 0) {
        await db
          .update(schema.siteSettings)
          .set({ value: serialized, updatedAt: new Date() })
          .where(eq(schema.siteSettings.key, "landing_page_content"));
      } else {
        await db.insert(schema.siteSettings).values({
          key: "landing_page_content",
          value: serialized,
          updatedAt: new Date(),
        });
      }
    } catch (err) {
      console.error("Failed to save site_settings to DB:", err);
    }
  }
  return content;
}

export async function createStudentAccount(
  data: schema.NewStudentAccount
): Promise<schema.StudentAccount> {
  if (db) {
    try {
      const [inserted] = await db.insert(schema.studentAccounts).values(data).returning();
      if (inserted) return inserted;
    } catch (err) {
      console.error("Failed to insert studentAccount in DB, falling back to memory:", err);
    }
  }

  const newAccount: schema.StudentAccount = {
    id: memoryStore.studentAccounts.length + 1,
    bookingId: data.bookingId || null,
    parentName: data.parentName,
    studentName: data.studentName,
    email: data.email,
    phoneNumber: data.phoneNumber,
    grade: data.grade,
    courseName: data.courseName,
    username: data.username,
    password: data.password,
    classLink: data.classLink || null,
    scheduleSlot: data.scheduleSlot || null,
    status: data.status || "active",
    createdAt: new Date(),
  };

  memoryStore.studentAccounts.unshift(newAccount);
  return newAccount;
}

export async function getStudentAccounts(): Promise<schema.StudentAccount[]> {
  if (db) {
    try {
      const results = await db
        .select()
        .from(schema.studentAccounts)
        .orderBy(schema.studentAccounts.createdAt);
      if (results) return results.reverse();
    } catch (err) {
      console.error("Failed to fetch studentAccounts from DB:", err);
    }
  }
  return memoryStore.studentAccounts;
}

export async function authenticateStudentAccount(
  identifier: string,
  password: string
): Promise<schema.StudentAccount | null> {
  const cleanId = identifier.trim().toLowerCase();
  const cleanPass = password.trim();

  if (db) {
    try {
      const all = await db.select().from(schema.studentAccounts);
      const match = all.find(
        (acc) =>
          (acc.username.toLowerCase() === cleanId || acc.email.toLowerCase() === cleanId) &&
          acc.password === cleanPass
      );
      if (match) return match;
    } catch (err) {
      console.error("Student auth DB error:", err);
    }
  }

  const memMatch = memoryStore.studentAccounts.find(
    (acc) =>
      (acc.username.toLowerCase() === cleanId || acc.email.toLowerCase() === cleanId) &&
      acc.password === cleanPass
  );
  return memMatch || null;
}
