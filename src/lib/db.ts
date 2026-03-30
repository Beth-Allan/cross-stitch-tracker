import { PrismaClient } from "@/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set. Check your .env.local file.");
  }

  const adapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL,
  });

  return new PrismaClient({ adapter });
}

/**
 * Lazy Prisma client singleton.
 * Defers creation until first use so module evaluation during build
 * (when DATABASE_URL is not available) does not throw.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createPrismaClient();
    }
    return Reflect.get(globalForPrisma.prisma, prop, receiver);
  },
});
