import { Inject, UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CurrentUserId } from "../../../common/auth/current-user-id.decorator";
import { GqlAuthGuard } from "../../../common/auth/gql-auth.guard";
import type { Department } from "../../../common/domain/department";
import { AlumniProfileCommandService } from "../application/commands/alumni-profile-command.service";
import type {
  AlumniConnectionDto,
  AlumniListConnectionDto,
  AlumniProfileDto,
} from "../application/dto/alumni.dto";
import type { UpdateAlumniProfileInput } from "../application/dto/alumni.input";
import { AlumniQueryService } from "../application/queries/alumni-query.service";

type AlumniListSort = "DEFAULT" | "HELPFUL";

@Resolver()
export class AlumniResolver {
  constructor(
    @Inject(AlumniQueryService)
    private readonly alumniQueryService: AlumniQueryService,
    @Inject(AlumniProfileCommandService)
    private readonly alumniProfileCommandService: AlumniProfileCommandService,
  ) {}

  @Query("getAlumniList")
  @UseGuards(GqlAuthGuard)
  getAlumniList(
    @Args("department", { nullable: true }) department?: Department,
    @Args("company", { nullable: true }) company?: string,
    @Args("graduationYear", { nullable: true }) graduationYear?: number,
    @Args("sort", { nullable: true }) sort?: AlumniListSort,
    @Args("limit") limit?: number,
    @Args("offset") offset?: number,
  ): Promise<AlumniConnectionDto> {
    return this.alumniQueryService.getAlumniList({
      department,
      company,
      graduationYear,
      sort,
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
    @Args("sort", { nullable: true }) sort?: AlumniListSort,
    @Args("limit") limit?: number,
    @Args("offset") offset?: number,
  ): Promise<AlumniListConnectionDto> {
    return this.alumniQueryService.getAlumniListItems({
      department,
      company,
      graduationYear,
      sort,
      limit: limit ?? 12,
      offset: offset ?? 0,
    });
  }

  @Query("getCompanyNameSuggestions")
  @UseGuards(GqlAuthGuard)
  getCompanyNameSuggestions(
    @Args("query") query: string,
    @Args("limit", { nullable: true }) limit?: number,
  ): Promise<string[]> {
    return this.alumniQueryService.getCompanyNameSuggestions(query, limit ?? 8);
  }

  @Query("getAlumniDetail")
  @UseGuards(GqlAuthGuard)
  getAlumniDetail(
    @CurrentUserId() userId: string,
    @Args("id") id: string,
  ): Promise<AlumniProfileDto | null> {
    return this.alumniQueryService.getAlumniDetail(id, userId);
  }

  @Mutation("updateAlumniProfile")
  @UseGuards(GqlAuthGuard)
  updateAlumniProfile(
    @CurrentUserId() userId: string,
    @Args("input") input: UpdateAlumniProfileInput,
  ): Promise<AlumniProfileDto> {
    return this.alumniProfileCommandService.updateAlumniProfile(userId, input);
  }

  @Mutation("toggleHelpfulReaction")
  @UseGuards(GqlAuthGuard)
  toggleHelpfulReaction(
    @CurrentUserId() userId: string,
    @Args("alumniProfileId") alumniProfileId: string,
  ): Promise<AlumniProfileDto> {
    return this.alumniProfileCommandService.toggleHelpfulReaction(userId, alumniProfileId);
  }

  @Mutation("updateAvatar")
  @UseGuards(GqlAuthGuard)
  updateAvatar(
    @CurrentUserId() userId: string,
    @Args("url") url: string,
  ): Promise<AlumniProfileDto> {
    return this.alumniProfileCommandService.updateAvatar(userId, url);
  }
}
