-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('UNSTARTED', 'KITTING', 'KITTED', 'IN_PROGRESS', 'ON_HOLD', 'FINISHED', 'FFO');

-- CreateTable
CREATE TABLE "Designer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Designer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Genre" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chart" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "designerId" TEXT,
    "coverImageUrl" TEXT,
    "coverThumbnailUrl" TEXT,
    "stitchCount" INTEGER NOT NULL DEFAULT 0,
    "stitchCountApproximate" BOOLEAN NOT NULL DEFAULT false,
    "stitchesWide" INTEGER NOT NULL DEFAULT 0,
    "stitchesHigh" INTEGER NOT NULL DEFAULT 0,
    "isPaperChart" BOOLEAN NOT NULL DEFAULT false,
    "isFormalKit" BOOLEAN NOT NULL DEFAULT false,
    "isSAL" BOOLEAN NOT NULL DEFAULT false,
    "kitColorCount" INTEGER,
    "digitalWorkingCopyUrl" TEXT,
    "dateAdded" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "chartId" TEXT NOT NULL,
    "userId" TEXT NOT NULL DEFAULT '1',
    "status" "ProjectStatus" NOT NULL DEFAULT 'UNSTARTED',
    "startDate" TIMESTAMP(3),
    "finishDate" TIMESTAMP(3),
    "ffoDate" TIMESTAMP(3),
    "finishPhotoUrl" TEXT,
    "startingStitches" INTEGER NOT NULL DEFAULT 0,
    "stitchesCompleted" INTEGER NOT NULL DEFAULT 0,
    "fabricId" TEXT,
    "projectBin" TEXT,
    "ipadApp" TEXT,
    "needsOnionSkinning" BOOLEAN NOT NULL DEFAULT false,
    "wantToStartNext" BOOLEAN NOT NULL DEFAULT false,
    "preferredStartSeason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ChartToGenre" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ChartToGenre_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Designer_name_key" ON "Designer"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Genre_name_key" ON "Genre"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Project_chartId_key" ON "Project"("chartId");

-- CreateIndex
CREATE INDEX "_ChartToGenre_B_index" ON "_ChartToGenre"("B");

-- AddForeignKey
ALTER TABLE "Chart" ADD CONSTRAINT "Chart_designerId_fkey" FOREIGN KEY ("designerId") REFERENCES "Designer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_chartId_fkey" FOREIGN KEY ("chartId") REFERENCES "Chart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChartToGenre" ADD CONSTRAINT "_ChartToGenre_A_fkey" FOREIGN KEY ("A") REFERENCES "Chart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChartToGenre" ADD CONSTRAINT "_ChartToGenre_B_fkey" FOREIGN KEY ("B") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

