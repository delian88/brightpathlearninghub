import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.warn(
    "\n⚠️  DATABASE_URL is not set in .env.local.\n" +
    "👉 To push schema to Supabase, add your Supabase connection string to .env.local:\n" +
    "   DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres\n"
  );
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl || "postgresql://postgres:postgres@localhost:5432/postgres",
  },
});
