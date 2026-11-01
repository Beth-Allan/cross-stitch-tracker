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

  // DMC's one line, as migrations 20261031120000_thread_lines and
  // 20261101185151_the_length_beth_cuts fill it in: an 8 m skein of six-strand floss, cut at 24
  // inches (THR-008, THR-016). A brand's only line carries no name.
  const dmcLine = await prisma.threadLine.upsert({
    where: { brandId_name: { brandId: dmcBrand.id, name: "" } },
    update: {},
    create: {
      brandId: dmcBrand.id,
      skeinLengthMm: 8000,
      strandStructure: "SIX_STRAND",
      cutLengthInches: 24,
    },
  });

  let count = 0;
  for (const thread of dmcThreads) {
    await prisma.thread.upsert({
      where: {
        lineId_colorCode: {
          lineId: dmcLine.id,
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
        lineId: dmcLine.id,
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
