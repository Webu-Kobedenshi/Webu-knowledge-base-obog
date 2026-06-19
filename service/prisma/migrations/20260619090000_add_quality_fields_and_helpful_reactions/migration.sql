-- CreateEnum
CREATE TYPE "JobHuntingPeriod" AS ENUM ('FIRST_YEAR_FIRST_HALF', 'FIRST_YEAR_SECOND_HALF', 'SECOND_YEAR_FIRST_HALF', 'SUMMER_BREAK', 'PRE_GRADUATION_AUTUMN', 'OTHER');

-- AlterTable
ALTER TABLE "SelectionExperience"
ADD COLUMN "motivation" TEXT,
ADD COLUMN "activityPeriod" "JobHuntingPeriod",
ADD COLUMN "activityPeriodNote" TEXT;

-- CreateTable
CREATE TABLE "HelpfulReaction" (
    "id" TEXT NOT NULL,
    "alumniProfileId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HelpfulReaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HelpfulReaction_alumniProfileId_userId_key" ON "HelpfulReaction"("alumniProfileId", "userId");

-- CreateIndex
CREATE INDEX "HelpfulReaction_alumniProfileId_idx" ON "HelpfulReaction"("alumniProfileId");

-- CreateIndex
CREATE INDEX "HelpfulReaction_userId_idx" ON "HelpfulReaction"("userId");

-- AddForeignKey
ALTER TABLE "HelpfulReaction" ADD CONSTRAINT "HelpfulReaction_alumniProfileId_fkey" FOREIGN KEY ("alumniProfileId") REFERENCES "AlumniProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpfulReaction" ADD CONSTRAINT "HelpfulReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
