import { Module } from "@nestjs/common";
import { CommonModule } from "../../common/common.module";
import { MediaCommandService } from "./application/commands/media-command.service";
import { STORAGE } from "./application/ports/storage.port";
import { StorageService } from "./infrastructure/storage.service";
import { MediaResolver } from "./presentation/media.resolver";

@Module({
  imports: [CommonModule],
  providers: [
    StorageService,
    {
      provide: STORAGE,
      useExisting: StorageService,
    },
    MediaCommandService,
    MediaResolver,
  ],
  exports: [STORAGE],
})
export class MediaModule {}
