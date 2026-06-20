import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { GqlAdminGuard } from "./auth/gql-admin.guard";
import { GqlAuthGuard } from "./auth/gql-auth.guard";

@Module({
  providers: [PrismaService, GqlAuthGuard, GqlAdminGuard],
  exports: [PrismaService, GqlAuthGuard, GqlAdminGuard],
})
export class CommonModule {}
