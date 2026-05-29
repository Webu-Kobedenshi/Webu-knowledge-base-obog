import { Inject, NotFoundException, UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import type { User } from "@prisma/client";
import { CurrentUser } from "../../../common/auth/current-user.decorator";
import { GqlAuthGuard } from "../../../common/auth/gql-auth.guard";
import { AlumniCommandService } from "../application/commands/alumni-command.service";
import type { AlumniConnectionDto, AlumniProfileDto, UserDto } from "../application/dto/alumni.dto";
import type {
  InitialSettingsInput,
  UpdateAlumniProfileInput,
  UploadUrlResponse,
} from "../application/dto/alumni.input";
import { AlumniQueryService } from "../application/queries/alumni-query.service";
import type { Department } from "../domain/types/department";

@Resolver()
export class AlumniResolver {
  constructor(
    @Inject(AlumniQueryService)
    private readonly alumniQueryService: AlumniQueryService,
    @Inject(AlumniCommandService)
    private readonly alumniCommandService: AlumniCommandService,
  ) {}

  @Query("findUserByLinkedGmail")
  findUserByLinkedGmail(@Args("gmail") gmail: string): Promise<UserDto | null> {
    // ログイン前に auth.ts から呼ばれるため Guard をバイパスするか、Repository を利用する。
    // QueryService にメソッドがないためリポジトリから引くか、QueryService に追加する。
    return this.alumniQueryService.findUserByLinkedGmail(gmail);
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

  @Query("getAlumniDetail")
  @UseGuards(GqlAuthGuard)
  getAlumniDetail(@Args("id") id: string): Promise<AlumniProfileDto | null> {
    return this.alumniQueryService.getAlumniDetail(id);
  }

  @Query("getMyProfile")
  @UseGuards(GqlAuthGuard)
  async getMyProfile(@CurrentUser() user: User): Promise<UserDto> {
    const userId = user.id;
    const profile = await this.alumniQueryService.getMyProfile(userId);
    if (!profile) {
      throw new NotFoundException("User not found");
    }

    return profile;
  }

  @Mutation("updateInitialSettings")
  @UseGuards(GqlAuthGuard)
  updateInitialSettings(
    @CurrentUser() user: User,
    @Args("input") input: InitialSettingsInput,
  ): Promise<UserDto> {
    return this.alumniCommandService.updateInitialSettings(user.id, input);
  }

  @Mutation("updateAlumniProfile")
  @UseGuards(GqlAuthGuard)
  updateAlumniProfile(
    @CurrentUser() user: User,
    @Args("input") input: UpdateAlumniProfileInput,
  ): Promise<AlumniProfileDto> {
    return this.alumniCommandService.updateAlumniProfile(user.id, input);
  }

  @Mutation("deleteMyAccount")
  @UseGuards(GqlAuthGuard)
  deleteMyAccount(@CurrentUser() user: User): Promise<boolean> {
    return this.alumniCommandService.deleteMyAccount(user.id);
  }

  @Mutation("getUploadUrl")
  @UseGuards(GqlAuthGuard)
  getUploadUrl(
    @CurrentUser() user: User,
    @Args("fileName") fileName: string,
    @Args("contentType") contentType: string,
  ): Promise<UploadUrlResponse> {
    return this.alumniCommandService.getUploadUrl(user.id, fileName, contentType);
  }

  @Mutation("updateAvatar")
  @UseGuards(GqlAuthGuard)
  updateAvatar(@CurrentUser() user: User, @Args("url") url: string): Promise<AlumniProfileDto> {
    return this.alumniCommandService.updateAvatar(user.id, url);
  }

  @Mutation("linkGmail")
  @UseGuards(GqlAuthGuard)
  linkGmail(@CurrentUser() user: User, @Args("gmail") gmail: string): Promise<UserDto> {
    return this.alumniCommandService.linkGmail(user.id, gmail);
  }

  @Mutation("unlinkGmail")
  @UseGuards(GqlAuthGuard)
  unlinkGmail(@CurrentUser() user: User): Promise<UserDto> {
    return this.alumniCommandService.unlinkGmail(user.id);
  }
}
