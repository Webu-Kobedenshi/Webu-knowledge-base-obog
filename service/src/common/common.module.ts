import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { GqlAuthGuard } from "./auth/gql-auth.guard";

@Module({
  providers: [PrismaService, GqlAuthGuard],
  exports: [PrismaService, GqlAuthGuard],
})
export class CommonModule {}
