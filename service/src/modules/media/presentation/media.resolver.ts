import { Inject, UseGuards } from "@nestjs/common";
import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { CurrentUserId } from "../../../common/auth/current-user-id.decorator";
import { GqlAuthGuard } from "../../../common/auth/gql-auth.guard";
import { MediaCommandService } from "../application/commands/media-command.service";
import type { UploadUrlResponse } from "../application/dto/media.dto";

@Resolver()
export class MediaResolver {
  constructor(
    @Inject(MediaCommandService)
    private readonly mediaCommandService: MediaCommandService,
  ) {}

  @Mutation("getUploadUrl")
  @UseGuards(GqlAuthGuard)
  getUploadUrl(
    @CurrentUserId() userId: string,
    @Args("fileName") fileName: string,
    @Args("contentType") contentType: string,
  ): Promise<UploadUrlResponse> {
    return this.mediaCommandService.getUploadUrl(userId, fileName, contentType);
  }
}
