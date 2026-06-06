ALTER TABLE "AlumniCompany"
  ADD COLUMN "companyNameSearch" TEXT NOT NULL DEFAULT '';

UPDATE "AlumniCompany"
SET "companyNameSearch" = regexp_replace(
  lower(
    translate(
      "companyName",
      'ぁあぃいぅうぇえぉおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもゃやゅゆょよらりるれろゎわゐゑをんゔゕゖＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ０１２３４５６７８９',
      'ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロヮワヰヱヲンヴヵヶABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    )
  ),
  '[[:space:]　・･.．,，、。_＿/／\\＼()（）\[\]［］【】「」『』]+',
  '',
  'g'
)
WHERE "companyNameSearch" = '';

CREATE INDEX "AlumniCompany_isPublic_alumniProfileId_idx"
  ON "AlumniCompany"("isPublic", "alumniProfileId");

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX "AlumniCompany_companyNameSearch_trgm_idx"
  ON "AlumniCompany" USING GIN ("companyNameSearch" gin_trgm_ops);

CREATE INDEX "AlumniCompany_public_companyNameSearch_prefix_idx"
  ON "AlumniCompany"("companyNameSearch" text_pattern_ops)
  WHERE "isPublic" = true;
