import type { Department } from "../../../../common/domain/department";

export type InitialSettingsInput = {
  name: string;
  studentId: string;
  enrollmentYear: number;
  durationYears: number;
  department: Department;
};

export type AdminNameInput = {
  name: string;
};
