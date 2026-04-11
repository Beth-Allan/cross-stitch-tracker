import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import dmcThreads from "./fixtures/dmc-threads.json";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding DMC thread catalog...");

  // Upsert DMC brand (idempotent)
  const dmcBrand = await prisma.supplyBrand.upsert({
    where: { name: "DMC" },
    update: {},
    create: {
      name: "DMC",
      website: "https://www.dmc.com",
      supplyType: "THREAD",
    },
  });

  let count = 0;
  for (const thread of dmcThreads) {
    await prisma.thread.upsert({
      where: {
        brandId_colorCode: {
          brandId: dmcBrand.id,
          colorCode: thread.colorCode,
        },
      },
      update: {
        colorName: thread.colorName,
        hexColor: thread.hexColor,
        colorFamily: thread.colorFamily as
          | "BLACK"
          | "WHITE"
          | "RED"
          | "ORANGE"
          | "YELLOW"
          | "GREEN"
          | "BLUE"
          | "PURPLE"
          | "BROWN"
          | "GRAY"
          | "NEUTRAL",
      },
      create: {
        brandId: dmcBrand.id,
        colorCode: thread.colorCode,
        colorName: thread.colorName,
        hexColor: thread.hexColor,
        colorFamily: thread.colorFamily as
          | "BLACK"
          | "WHITE"
          | "RED"
          | "ORANGE"
          | "YELLOW"
          | "GREEN"
          | "BLUE"
          | "PURPLE"
          | "BROWN"
          | "GRAY"
          | "NEUTRAL",
      },
    });
    count++;
  }

  console.log(`Seeded ${count} DMC threads under brand "${dmcBrand.name}" (id: ${dmcBrand.id})`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error("Seed failed:", e);
    prisma.$disconnect();
    process.exit(1);
  });
