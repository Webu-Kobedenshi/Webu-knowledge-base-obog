import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import type { UploadUrlResponse } from "../dto/media.dto";
import { STORAGE, type StoragePort } from "../ports/storage.port";

@Injectable()
export class MediaCommandService {
  constructor(@Inject(STORAGE) private readonly storageService: StoragePort) {}

  getUploadUrl(userId: string, fileName: string, contentType: string): Promise<UploadUrlResponse> {
    const normalizedFileName = fileName.trim();
    const normalizedContentType = contentType.trim();

    if (!normalizedFileName) {
      throw new BadRequestException("fileName is required");
    }

    if (!normalizedContentType) {
      throw new BadRequestException("contentType is required");
    }

    if (!normalizedContentType.startsWith("image/")) {
      throw new BadRequestException("contentType must be image/*");
    }

    return this.storageService.createPutUploadUrl({
      userId,
      fileName: normalizedFileName,
      contentType: normalizedContentType,
    });
  }
}
