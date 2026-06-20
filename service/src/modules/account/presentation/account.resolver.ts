import { Inject, NotFoundException, UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CurrentUserId } from "../../../common/auth/current-user-id.decorator";
import { type AuthenticatedUser, CurrentUser } from "../../../common/auth/current-user.decorator";
import { GqlAuthGuard } from "../../../common/auth/gql-auth.guard";
import { AccountCommandService } from "../application/commands/account-command.service";
import type { UserDto } from "../application/dto/account.dto";
import type { AdminNameInput, InitialSettingsInput } from "../application/dto/account.input";
import { AccountQueryService } from "../application/queries/account-query.service";

@Resolver()
export class AccountResolver {
  constructor(
    @Inject(AccountQueryService)
    private readonly accountQueryService: AccountQueryService,
    @Inject(AccountCommandService)
    private readonly accountCommandService: AccountCommandService,
  ) {}

  @Query("findUserByLinkedGmail")
  @UseGuards(GqlAuthGuard)
  findUserByLinkedGmail(@Args("gmail") gmail: string): Promise<UserDto | null> {
    return this.accountQueryService.findUserByLinkedGmail(gmail);
  }

  @Query("isAdminEmail")
  @UseGuards(GqlAuthGuard)
  isAdminEmail(@Args("email") email: string): Promise<boolean> {
    return this.accountQueryService.isAdminEmail(email);
  }

  @Query("getMyProfile")
  @UseGuards(GqlAuthGuard)
  async getMyProfile(@CurrentUserId() userId: string): Promise<UserDto> {
    const profile = await this.accountQueryService.getMyProfile(userId);
    if (!profile) {
      throw new NotFoundException("User not found");
    }

    return profile;
  }

  @Query("getMyProfileSummary")
  @UseGuards(GqlAuthGuard)
  getMyProfileSummary(@CurrentUser() user: AuthenticatedUser): UserDto {
    return this.accountQueryService.getMyProfileSummary(user);
  }

  @Mutation("updateInitialSettings")
  @UseGuards(GqlAuthGuard)
  updateInitialSettings(
    @CurrentUserId() userId: string,
    @Args("input") input: InitialSettingsInput,
  ): Promise<UserDto> {
    return this.accountCommandService.updateInitialSettings(userId, input);
  }

  @Mutation("updateAdminName")
  @UseGuards(GqlAuthGuard)
  updateAdminName(
    @CurrentUserId() userId: string,
    @Args("input") input: AdminNameInput,
  ): Promise<UserDto> {
    return this.accountCommandService.updateAdminName(userId, input);
  }

  @Mutation("deleteMyAccount")
  @UseGuards(GqlAuthGuard)
  deleteMyAccount(@CurrentUserId() userId: string): Promise<boolean> {
    return this.accountCommandService.deleteMyAccount(userId);
  }

  @Mutation("linkGmail")
  @UseGuards(GqlAuthGuard)
  linkGmail(
    @CurrentUserId() userId: string,
    @Args("verificationToken") verificationToken: string,
  ): Promise<UserDto> {
    return this.accountCommandService.linkGmail(userId, verificationToken);
  }

  @Mutation("unlinkGmail")
  @UseGuards(GqlAuthGuard)
  unlinkGmail(@CurrentUserId() userId: string): Promise<UserDto> {
    return this.accountCommandService.unlinkGmail(userId);
  }
}
