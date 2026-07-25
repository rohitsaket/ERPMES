import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://postgres:password-1688@localhost:5432/ERPMES?schema=public"
    }
  }
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
