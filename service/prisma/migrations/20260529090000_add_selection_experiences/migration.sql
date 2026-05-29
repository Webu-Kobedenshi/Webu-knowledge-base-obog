CREATE TYPE "SelectionStepKind" AS ENUM (
  'DOCUMENT_SCREENING',
  'WEB_TEST',
  'ASSIGNMENT',
  'CODING_TEST',
  'CASUAL_INTERVIEW',
  'FIRST_INTERVIEW',
  'SECOND_INTERVIEW',
  'FINAL_INTERVIEW',
  'OFFER',
  'OTHER'
);

CREATE TYPE "SelectionFormat" AS ENUM (
  'ONLINE',
  'IN_PERSON',
  'UNKNOWN'
);

CREATE TABLE "SelectionExperience" (
  "id" TEXT NOT NULL,
  "alumniCompanyId" TEXT NOT NULL,
  "entryTrigger" TEXT,
  "overallTip" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "SelectionExperience_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SelectionStep" (
  "id" TEXT NOT NULL,
  "selectionExperienceId" TEXT NOT NULL,
  "stepKind" "SelectionStepKind" NOT NULL,
  "stepTitle" TEXT,
  "format" "SelectionFormat" NOT NULL DEFAULT 'UNKNOWN',
  "interviewerCount" INTEGER,
  "durationMinutes" INTEGER,
  "questions" TEXT,
  "atmosphere" TEXT,
  "preparation" TEXT,
  "tip" TEXT,
  "sortOrder" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "SelectionStep_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SelectionExperience_alumniCompanyId_key"
  ON "SelectionExperience"("alumniCompanyId");

CREATE INDEX "SelectionStep_selectionExperienceId_sortOrder_idx"
  ON "SelectionStep"("selectionExperienceId", "sortOrder");

ALTER TABLE "SelectionExperience"
  ADD CONSTRAINT "SelectionExperience_alumniCompanyId_fkey"
  FOREIGN KEY ("alumniCompanyId") REFERENCES "AlumniCompany"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SelectionStep"
  ADD CONSTRAINT "SelectionStep_selectionExperienceId_fkey"
  FOREIGN KEY ("selectionExperienceId") REFERENCES "SelectionExperience"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
