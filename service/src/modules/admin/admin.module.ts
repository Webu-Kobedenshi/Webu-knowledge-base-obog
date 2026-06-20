import { Module } from "@nestjs/common";
import { CommonModule } from "../../common/common.module";
import { CareerImportCommandService } from "./application/commands/career-import-command.service";
import { CAREER_EXPORT_REPOSITORY } from "./application/ports/career-export-repository.port";
import { CAREER_IMPORT_REPOSITORY } from "./application/ports/career-import-repository.port";
import { CareerExportQueryService } from "./application/queries/career-export-query.service";
import { CareerExportRepository } from "./infrastructure/career-export.repository";
import { CareerImportRepository } from "./infrastructure/career-import.repository";
import { AdminResolver } from "./presentation/admin.resolver";

@Module({
  imports: [CommonModule],
  providers: [
    CareerImportRepository,
    CareerExportRepository,
    {
      provide: CAREER_IMPORT_REPOSITORY,
      useExisting: CareerImportRepository,
    },
    {
      provide: CAREER_EXPORT_REPOSITORY,
      useExisting: CareerExportRepository,
    },
    CareerImportCommandService,
    CareerExportQueryService,
    AdminResolver,
  ],
})
export class AdminModule {}
