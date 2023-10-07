import type { Config } from "drizzle-kit";

export const dbCredentials = {
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN!,
};

export default {
  schema: "./src/db/schema.ts",
  driver: "turso",
  dbCredentials,
  verbose: true,
  strict: true,
} satisfies Config;
