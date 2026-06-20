import { Inject, UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CurrentUserId } from "../../../common/auth/current-user-id.decorator";
import { GqlAdminGuard } from "../../../common/auth/gql-admin.guard";
import { GqlAuthGuard } from "../../../common/auth/gql-auth.guard";
import { CareerImportCommandService } from "../application/commands/career-import-command.service";
import type { CareerExportRowDto } from "../application/dto/career-export.dto";
import type {
  CareerExcelImportPreviewInput,
  CareerImportPreviewDto,
  CareerImportResultDto,
} from "../application/dto/career-import.dto";
import { CareerExportQueryService } from "../application/queries/career-export-query.service";

@Resolver()
export class AdminResolver {
  constructor(
    @Inject(CareerImportCommandService)
    private readonly careerImportCommandService: CareerImportCommandService,
    @Inject(CareerExportQueryService)
    private readonly careerExportQueryService: CareerExportQueryService,
  ) {}

  @Query("getCareerExportRows")
  @UseGuards(GqlAuthGuard, GqlAdminGuard)
  getCareerExportRows(): Promise<CareerExportRowDto[]> {
    return this.careerExportQueryService.getCareerExportRows();
  }

  @Mutation("previewCareerExcelImport")
  @UseGuards(GqlAuthGuard, GqlAdminGuard)
  previewCareerExcelImport(
    @CurrentUserId() adminUserId: string,
    @Args("input") input: CareerExcelImportPreviewInput,
  ): Promise<CareerImportPreviewDto> {
    return this.careerImportCommandService.previewCareerExcelImport(adminUserId, input);
  }

  @Mutation("confirmCareerExcelImport")
  @UseGuards(GqlAuthGuard, GqlAdminGuard)
  confirmCareerExcelImport(@Args("batchId") batchId: string): Promise<CareerImportResultDto> {
    return this.careerImportCommandService.confirmCareerExcelImport(batchId);
  }
}
