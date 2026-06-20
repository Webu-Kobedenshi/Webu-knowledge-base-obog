import { Module } from "@nestjs/common";
import { CommonModule } from "../../common/common.module";
import { AccountModule } from "../account/account.module";
import { MediaModule } from "../media/media.module";
import { AlumniProfileCommandService } from "./application/commands/alumni-profile-command.service";
import { ALUMNI_PROFILE_REPOSITORY } from "./application/ports/alumni-profile-repository.port";
import { AlumniQueryService } from "./application/queries/alumni-query.service";
import { AlumniProfileRepository } from "./infrastructure/alumni-profile.repository";
import { AlumniResolver } from "./presentation/alumni.resolver";

@Module({
  imports: [CommonModule, AccountModule, MediaModule],
  providers: [
    AlumniProfileRepository,
    {
      provide: ALUMNI_PROFILE_REPOSITORY,
      useExisting: AlumniProfileRepository,
    },
    AlumniQueryService,
    AlumniProfileCommandService,
    AlumniResolver,
  ],
})
export class AlumniModule {}
