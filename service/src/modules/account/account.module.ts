import { Module } from "@nestjs/common";
import { CommonModule } from "../../common/common.module";
import { AccountCommandService } from "./application/commands/account-command.service";
import { ACCOUNT_REPOSITORY } from "./application/ports/account-repository.port";
import { AccountQueryService } from "./application/queries/account-query.service";
import { AccountRepository } from "./infrastructure/account.repository";
import { AccountResolver } from "./presentation/account.resolver";

@Module({
  imports: [CommonModule],
  providers: [
    AccountRepository,
    {
      provide: ACCOUNT_REPOSITORY,
      useExisting: AccountRepository,
    },
    AccountQueryService,
    AccountCommandService,
    AccountResolver,
  ],
  exports: [ACCOUNT_REPOSITORY, AccountQueryService],
})
export class AccountModule {}
