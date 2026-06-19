ALTER TABLE "AlumniProfile"
ADD COLUMN "activityPeriod" "JobHuntingPeriod",
ADD COLUMN "activityPeriodNote" TEXT;

UPDATE "AlumniProfile" AS profile
SET
  "activityPeriod" = source."activityPeriod",
  "activityPeriodNote" = source."activityPeriodNote"
FROM (
  SELECT DISTINCT ON (company."alumniProfileId")
    company."alumniProfileId",
    experience."activityPeriod",
    experience."activityPeriodNote"
  FROM "AlumniCompany" AS company
  INNER JOIN "SelectionExperience" AS experience
    ON experience."alumniCompanyId" = company.id
  WHERE experience."activityPeriod" IS NOT NULL
     OR experience."activityPeriodNote" IS NOT NULL
  ORDER BY company."alumniProfileId", company."createdAt" ASC
) AS source
WHERE profile.id = source."alumniProfileId";
