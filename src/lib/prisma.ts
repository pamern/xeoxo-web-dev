import { PrismaClient } from "@prisma/client";

// Prisma client singleton.
// Next.js hot-reload tạo nhiều instance -> cache vào globalThis để tránh
// "too many connections" khi dev.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
