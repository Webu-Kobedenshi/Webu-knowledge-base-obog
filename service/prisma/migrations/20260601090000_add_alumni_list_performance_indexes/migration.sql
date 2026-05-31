CREATE INDEX "AlumniProfile_isPublic_graduationYear_createdAt_idx"
  ON "AlumniProfile"("isPublic", "graduationYear" DESC, "createdAt" DESC);

CREATE INDEX "AlumniProfile_isPublic_department_graduationYear_createdAt_idx"
  ON "AlumniProfile"("isPublic", "department", "graduationYear" DESC, "createdAt" DESC);

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX "AlumniCompany_companyName_trgm_idx"
  ON "AlumniCompany" USING GIN ("companyName" gin_trgm_ops);
