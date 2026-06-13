import { join } from "node:path";
import { ApolloDriver, type ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { AppResolver } from "./app.resolver";
import { AlumniModule } from "./modules/alumni/alumni.module";

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: [join(process.cwd(), "src/**/*.graphql")],
      playground: process.env.NODE_ENV !== "production",
    }),
    AlumniModule,
  ],
  providers: [AppResolver],
})
export class AppModule {}
