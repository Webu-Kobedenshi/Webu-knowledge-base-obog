-- Collapse the previous categorized helpful reactions into a single "helpful" reaction.
DELETE FROM "HelpfulReaction"
WHERE "id" IN (
  SELECT "id"
  FROM (
    SELECT
      "id",
      ROW_NUMBER() OVER (
        PARTITION BY "alumniProfileId", "userId"
        ORDER BY "createdAt" ASC, "id" ASC
      ) AS "rowNumber"
    FROM "HelpfulReaction"
  ) AS "duplicates"
  WHERE "rowNumber" > 1
);

-- Drop indexes from the categorized version if that migration already ran locally.
DROP INDEX IF EXISTS "HelpfulReaction_alumniProfileId_userId_kind_key";
DROP INDEX IF EXISTS "HelpfulReaction_alumniProfileId_kind_idx";

-- Drop the category column/type if they exist.
ALTER TABLE "HelpfulReaction" DROP COLUMN IF EXISTS "kind";
DROP TYPE IF EXISTS "HelpfulReactionKind";

-- Ensure the single-reaction constraints exist.
CREATE UNIQUE INDEX IF NOT EXISTS "HelpfulReaction_alumniProfileId_userId_key" ON "HelpfulReaction"("alumniProfileId", "userId");
CREATE INDEX IF NOT EXISTS "HelpfulReaction_alumniProfileId_idx" ON "HelpfulReaction"("alumniProfileId");
