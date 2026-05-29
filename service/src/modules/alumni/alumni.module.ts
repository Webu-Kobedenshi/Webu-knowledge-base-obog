import { Module } from "@nestjs/common";
import { GqlAuthGuard } from "../../common/auth/gql-auth.guard";
import { PrismaService } from "../../prisma.service";
import { AlumniCommandService } from "./application/commands/alumni-command.service";
import { ALUMNI_REPOSITORY } from "./application/ports/alumni-repository.port";
import { STORAGE } from "./application/ports/storage.port";
import { AlumniQueryService } from "./application/queries/alumni-query.service";
import { AlumniRepository } from "./infrastructure/alumni.repository";
import { StorageService } from "./infrastructure/storage.service";
import { AlumniResolver } from "./presentation/alumni.resolver";

@Module({
  providers: [
    PrismaService,
    AlumniRepository,
    StorageService,
    {
      provide: ALUMNI_REPOSITORY,
      useExisting: AlumniRepository,
    },
    {
      provide: STORAGE,
      useExisting: StorageService,
    },
    AlumniQueryService,
    AlumniCommandService,
    GqlAuthGuard,
    AlumniResolver,
  ],
})
export class AlumniModule {}
