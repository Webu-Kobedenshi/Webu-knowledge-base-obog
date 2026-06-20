import type { Department } from "../../../../common/domain/department";
import type { JobHuntingPeriod } from "../../../alumni/domain/entities/alumni-profile.entity";

export type CareerExportRowDto = {
  studentId: string | null;
  fullName: string | null;
  department: Department;
  graduationYear: number;
  companyName: string;
  companyMotivation: string | null;
  activityPeriod: JobHuntingPeriod | null;
  gakuchika: string | null;
};
