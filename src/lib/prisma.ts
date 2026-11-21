import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// On Vercel serverless functions, the project root filesystem is read-only.
// Copy seeded dev.db to /tmp so write operations (autosave, upload, share) succeed.
if (process.env.VERCEL) {
  const tmpDbPath = path.join("/tmp", "dev.db");
  const localDbPath = path.join(process.cwd(), "prisma", "dev.db");

  if (!fs.existsSync(tmpDbPath) && fs.existsSync(localDbPath)) {
    try {
      fs.copyFileSync(localDbPath, tmpDbPath);
    } catch (e) {
      console.error("Failed to copy database to /tmp:", e);
    }
  }
  process.env.DATABASE_URL = `file:${tmpDbPath}`;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
