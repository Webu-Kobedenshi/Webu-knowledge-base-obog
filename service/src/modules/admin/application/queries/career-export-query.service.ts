import { Inject, Injectable } from "@nestjs/common";
import type { CareerExportRowDto } from "../dto/career-export.dto";
import {
  CAREER_EXPORT_REPOSITORY,
  type CareerExportRepositoryPort,
} from "../ports/career-export-repository.port";

@Injectable()
export class CareerExportQueryService {
  constructor(
    @Inject(CAREER_EXPORT_REPOSITORY)
    private readonly careerExportRepository: CareerExportRepositoryPort,
  ) {}

  getCareerExportRows(): Promise<CareerExportRowDto[]> {
    return this.careerExportRepository.findCareerExportRows();
  }
}
