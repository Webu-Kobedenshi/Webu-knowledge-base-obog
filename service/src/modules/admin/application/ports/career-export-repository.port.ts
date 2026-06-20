import type { CareerExportRowDto } from "../dto/career-export.dto";

export const CAREER_EXPORT_REPOSITORY = Symbol("CAREER_EXPORT_REPOSITORY");

export interface CareerExportRepositoryPort {
  findCareerExportRows(): Promise<CareerExportRowDto[]>;
}
