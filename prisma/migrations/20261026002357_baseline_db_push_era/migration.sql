/*
  Baseline: everything that reached the database by `prisma db push` between the March
  migration and October 2026 — fourteen models, two enums, and the column changes below.

  It never runs against a database that already holds the app. Production and the preview
  branch were built by those pushes, so `prisma/migrate-deploy.ts` records this migration as
  applied there instead of executing it. Its SQL only runs on a new, empty database, where the
  March migration has just created the four columns dropped below and they hold nothing.
*/
BEGIN;
-- CreateEnum
CREATE TYPE "SupplyType" AS ENUM ('THREAD', 'BEAD', 'SPECIALTY');

-- CreateEnum
CREATE TYPE "ColorFamily" AS ENUM ('BLACK', 'WHITE', 'RED', 'ORANGE', 'YELLOW', 'GREEN', 'BLUE', 'PURPLE', 'BROWN', 'GRAY', 'NEUTRAL');

-- AlterTable
ALTER TABLE "Chart" DROP COLUMN "digitalWorkingCopyUrl",
ADD COLUMN     "focalPointX" DOUBLE PRECISION,
ADD COLUMN     "focalPointY" DOUBLE PRECISION,
ADD COLUMN     "seriesId" TEXT;

-- AlterTable
ALTER TABLE "Designer" ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "fabricId",
DROP COLUMN "ipadApp",
DROP COLUMN "projectBin",
ADD COLUMN     "overCount" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "stitchingAppId" TEXT,
ADD COLUMN     "storageLocationId" TEXT,
ADD COLUMN     "strandCount" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "wastePercent" INTEGER NOT NULL DEFAULT 20,
ALTER COLUMN "userId" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Series" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "totalCount" INTEGER,
    "designerId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChartFile" (
    "id" TEXT NOT NULL,
    "chartId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "label" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChartFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StitchSession" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "stitchCount" INTEGER NOT NULL,
    "timeSpentMinutes" INTEGER,
    "photoKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StitchSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplyBrand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "supplyType" "SupplyType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplyBrand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Thread" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "colorCode" TEXT NOT NULL,
    "colorName" TEXT NOT NULL,
    "hexColor" TEXT NOT NULL,
    "colorFamily" "ColorFamily" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Thread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bead" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "productCode" TEXT NOT NULL,
    "colorName" TEXT NOT NULL,
    "hexColor" TEXT NOT NULL,
    "colorFamily" "ColorFamily" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecialtyItem" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "productCode" TEXT NOT NULL,
    "colorName" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "hexColor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpecialtyItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectThread" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "stitchCount" INTEGER NOT NULL DEFAULT 0,
    "quantityRequired" INTEGER NOT NULL DEFAULT 1,
    "quantityAcquired" INTEGER NOT NULL DEFAULT 0,
    "isNeedOverridden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectBead" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "beadId" TEXT NOT NULL,
    "quantityRequired" INTEGER NOT NULL DEFAULT 1,
    "quantityAcquired" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectBead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectSpecialty" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "specialtyItemId" TEXT NOT NULL,
    "quantityRequired" INTEGER NOT NULL DEFAULT 1,
    "quantityAcquired" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectSpecialty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FabricBrand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FabricBrand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fabric" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "photoUrl" TEXT,
    "count" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "colorFamily" TEXT NOT NULL,
    "colorType" TEXT NOT NULL,
    "shortestEdgeInches" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "longestEdgeInches" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "needToBuy" BOOLEAN NOT NULL DEFAULT false,
    "linkedProjectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fabric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorageLocation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StorageLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StitchingApp" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StitchingApp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Series_name_key" ON "Series"("name");

-- CreateIndex
CREATE INDEX "ChartFile_chartId_idx" ON "ChartFile"("chartId");

-- CreateIndex
CREATE INDEX "StitchSession_projectId_idx" ON "StitchSession"("projectId");

-- CreateIndex
CREATE INDEX "StitchSession_date_idx" ON "StitchSession"("date");

-- CreateIndex
CREATE UNIQUE INDEX "SupplyBrand_name_key" ON "SupplyBrand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Thread_brandId_colorCode_key" ON "Thread"("brandId", "colorCode");

-- CreateIndex
CREATE UNIQUE INDEX "Bead_brandId_productCode_key" ON "Bead"("brandId", "productCode");

-- CreateIndex
CREATE UNIQUE INDEX "SpecialtyItem_brandId_productCode_key" ON "SpecialtyItem"("brandId", "productCode");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectThread_projectId_threadId_key" ON "ProjectThread"("projectId", "threadId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectBead_projectId_beadId_key" ON "ProjectBead"("projectId", "beadId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectSpecialty_projectId_specialtyItemId_key" ON "ProjectSpecialty"("projectId", "specialtyItemId");

-- CreateIndex
CREATE UNIQUE INDEX "FabricBrand_name_key" ON "FabricBrand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Fabric_linkedProjectId_key" ON "Fabric"("linkedProjectId");

-- AddForeignKey
ALTER TABLE "Series" ADD CONSTRAINT "Series_designerId_fkey" FOREIGN KEY ("designerId") REFERENCES "Designer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chart" ADD CONSTRAINT "Chart_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChartFile" ADD CONSTRAINT "ChartFile_chartId_fkey" FOREIGN KEY ("chartId") REFERENCES "Chart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_storageLocationId_fkey" FOREIGN KEY ("storageLocationId") REFERENCES "StorageLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_stitchingAppId_fkey" FOREIGN KEY ("stitchingAppId") REFERENCES "StitchingApp"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StitchSession" ADD CONSTRAINT "StitchSession_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "SupplyBrand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bead" ADD CONSTRAINT "Bead_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "SupplyBrand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecialtyItem" ADD CONSTRAINT "SpecialtyItem_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "SupplyBrand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectThread" ADD CONSTRAINT "ProjectThread_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectThread" ADD CONSTRAINT "ProjectThread_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectBead" ADD CONSTRAINT "ProjectBead_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectBead" ADD CONSTRAINT "ProjectBead_beadId_fkey" FOREIGN KEY ("beadId") REFERENCES "Bead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectSpecialty" ADD CONSTRAINT "ProjectSpecialty_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectSpecialty" ADD CONSTRAINT "ProjectSpecialty_specialtyItemId_fkey" FOREIGN KEY ("specialtyItemId") REFERENCES "SpecialtyItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fabric" ADD CONSTRAINT "Fabric_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "FabricBrand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fabric" ADD CONSTRAINT "Fabric_linkedProjectId_fkey" FOREIGN KEY ("linkedProjectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;
