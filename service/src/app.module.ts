import { join } from "node:path";
import { ApolloDriver, type ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { AppResolver } from "./app.resolver";
import { AccountModule } from "./modules/account/account.module";
import { AdminModule } from "./modules/admin/admin.module";
import { AlumniModule } from "./modules/alumni/alumni.module";
import { MediaModule } from "./modules/media/media.module";

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: [join(process.cwd(), "src/**/*.graphql")],
      playground: process.env.NODE_ENV !== "production",
    }),
    AdminModule,
    AccountModule,
    AlumniModule,
    MediaModule,
  ],
  providers: [AppResolver],
})
export class AppModule {}
