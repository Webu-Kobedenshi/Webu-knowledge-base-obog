import { Inject, NotFoundException, UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CurrentUserId } from "../../../common/auth/current-user-id.decorator";
import { type AuthenticatedUser, CurrentUser } from "../../../common/auth/current-user.decorator";
import { GqlAuthGuard } from "../../../common/auth/gql-auth.guard";
import { AlumniCommandService } from "../application/commands/alumni-command.service";
import type {
  AlumniConnectionDto,
  AlumniListConnectionDto,
  AlumniProfileDto,
  UserDto,
} from "../application/dto/alumni.dto";
import type {
  InitialSettingsInput,
  UpdateAlumniProfileInput,
  UploadUrlResponse,
} from "../application/dto/alumni.input";
import { AlumniQueryService } from "../application/queries/alumni-query.service";
import type { Department } from "../domain/types/department";
import { resolveRoleAndStatus } from "../domain/user-role-transition";

@Resolver()
export class AlumniResolver {
  constructor(
    @Inject(AlumniQueryService)
    private readonly alumniQueryService: AlumniQueryService,
    @Inject(AlumniCommandService)
    private readonly alumniCommandService: AlumniCommandService,
  ) {}

  @Query("findUserByLinkedGmail")
  @UseGuards(GqlAuthGuard)
  findUserByLinkedGmail(@Args("gmail") gmail: string): Promise<UserDto | null> {
    return this.alumniQueryService.findUserByLinkedGmail(gmail);
  }

  @Query("isAdminEmail")
  @UseGuards(GqlAuthGuard)
  isAdminEmail(@Args("email") email: string): Promise<boolean> {
    return this.alumniQueryService.isAdminEmail(email);
  }

  @Query("getAlumniList")
  @UseGuards(GqlAuthGuard)
  getAlumniList(
    @Args("department", { nullable: true }) department?: Department,
    @Args("company", { nullable: true }) company?: string,
    @Args("graduationYear", { nullable: true }) graduationYear?: number,
    @Args("limit") limit?: number,
    @Args("offset") offset?: number,
  ): Promise<AlumniConnectionDto> {
    return this.alumniQueryService.getAlumniList({
      department,
      company,
      graduationYear,
      limit: limit ?? 12,
      offset: offset ?? 0,
    });
  }

  @Query("getAlumniListItems")
  @UseGuards(GqlAuthGuard)
  getAlumniListItems(
    @Args("department", { nullable: true }) department?: Department,
    @Args("company", { nullable: true }) company?: string,
    @Args("graduationYear", { nullable: true }) graduationYear?: number,
    @Args("limit") limit?: number,
    @Args("offset") offset?: number,
  ): Promise<AlumniListConnectionDto> {
    return this.alumniQueryService.getAlumniListItems({
      department,
      company,
      graduationYear,
      limit: limit ?? 12,
      offset: offset ?? 0,
    });
  }

  @Query("getAlumniDetail")
  @UseGuards(GqlAuthGuard)
  getAlumniDetail(@Args("id") id: string): Promise<AlumniProfileDto | null> {
    return this.alumniQueryService.getAlumniDetail(id);
  }

  @Query("getMyProfile")
  @UseGuards(GqlAuthGuard)
  async getMyProfile(@CurrentUserId() userId: string): Promise<UserDto> {
    const profile = await this.alumniQueryService.getMyProfile(userId);
    if (!profile) {
      throw new NotFoundException("User not found");
    }

    return profile;
  }

  @Query("getMyProfileSummary")
  @UseGuards(GqlAuthGuard)
  getMyProfileSummary(@CurrentUser() user: AuthenticatedUser): UserDto {
    const role = user.role ?? "STUDENT";
    const status = user.status ?? "ENROLLED";
    const summary: UserDto = {
      id: user.id,
      email: user.email,
      name: user.name ?? null,
      studentId: user.studentId ?? null,
      linkedGmail: user.linkedGmail ?? null,
      role,
      status,
      enrollmentYear: user.enrollmentYear ?? null,
      durationYears: user.durationYears ?? null,
      department: (user.department as Department | null | undefined) ?? null,
      createdAt: user.createdAt ?? new Date(),
      updatedAt: user.updatedAt ?? new Date(),
      alumniProfile: null,
    };

    if (summary.role === "ADMIN") {
      return summary;
    }

    if (summary.enrollmentYear && summary.durationYears) {
      const resolved = resolveRoleAndStatus({
        enrollmentYear: summary.enrollmentYear,
        durationYears: summary.durationYears,
      });

      return {
        ...summary,
        role: resolved.role,
        status: resolved.status,
      };
    }

    return summary;
  }

  @Mutation("updateInitialSettings")
  @UseGuards(GqlAuthGuard)
  updateInitialSettings(
    @CurrentUserId() userId: string,
    @Args("input") input: InitialSettingsInput,
  ): Promise<UserDto> {
    return this.alumniCommandService.updateInitialSettings(userId, input);
  }

  @Mutation("updateAlumniProfile")
  @UseGuards(GqlAuthGuard)
  updateAlumniProfile(
    @CurrentUserId() userId: string,
    @Args("input") input: UpdateAlumniProfileInput,
  ): Promise<AlumniProfileDto> {
    return this.alumniCommandService.updateAlumniProfile(userId, input);
  }

  @Mutation("deleteMyAccount")
  @UseGuards(GqlAuthGuard)
  deleteMyAccount(@CurrentUserId() userId: string): Promise<boolean> {
    return this.alumniCommandService.deleteMyAccount(userId);
  }

  @Mutation("getUploadUrl")
  @UseGuards(GqlAuthGuard)
  getUploadUrl(
    @CurrentUserId() userId: string,
    @Args("fileName") fileName: string,
    @Args("contentType") contentType: string,
  ): Promise<UploadUrlResponse> {
    return this.alumniCommandService.getUploadUrl(userId, fileName, contentType);
  }

  @Mutation("updateAvatar")
  @UseGuards(GqlAuthGuard)
  updateAvatar(
    @CurrentUserId() userId: string,
    @Args("url") url: string,
  ): Promise<AlumniProfileDto> {
    return this.alumniCommandService.updateAvatar(userId, url);
  }

  @Mutation("linkGmail")
  @UseGuards(GqlAuthGuard)
  linkGmail(
    @CurrentUserId() userId: string,
    @Args("verificationToken") verificationToken: string,
  ): Promise<UserDto> {
    return this.alumniCommandService.linkGmail(userId, verificationToken);
  }

  @Mutation("unlinkGmail")
  @UseGuards(GqlAuthGuard)
  unlinkGmail(@CurrentUserId() userId: string): Promise<UserDto> {
    return this.alumniCommandService.unlinkGmail(userId);
  }
}
