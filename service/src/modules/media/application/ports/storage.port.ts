import type { UploadUrlResponse } from "../dto/media.dto";

export const STORAGE = Symbol("STORAGE");

export interface StoragePort {
  createPutUploadUrl(params: {
    userId: string;
    fileName: string;
    contentType: string;
  }): Promise<UploadUrlResponse>;
  extractKeyFromUrl(publicUrl: string): string | null;
  deleteObject(key: string): Promise<void>;
}
