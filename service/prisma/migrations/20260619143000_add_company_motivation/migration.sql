ALTER TABLE "AlumniCompany"
ADD COLUMN "motivation" TEXT;

UPDATE "AlumniCompany" AS company
SET "motivation" = experience."motivation"
FROM "SelectionExperience" AS experience
WHERE experience."alumniCompanyId" = company.id
  AND experience."motivation" IS NOT NULL
  AND btrim(experience."motivation") <> '';
