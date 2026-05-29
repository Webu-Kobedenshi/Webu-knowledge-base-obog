-- Remove no-longer-used tactics fields from alumni profile
ALTER TABLE "AlumniProfile"
  DROP COLUMN "entryTrigger",
  DROP COLUMN "interviewTip";
