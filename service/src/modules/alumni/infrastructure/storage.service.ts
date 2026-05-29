import { randomUUID } from "node:crypto";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Injectable } from "@nestjs/common";
import type { StoragePort } from "../application/ports/storage.port";

type UploadUrlResult = {
  uploadUrl: string;
  fileUrl: string;
  key: string;
};

@Injectable()
export class StorageService implements StoragePort {
  private readonly endpoint: string;
  private readonly publicEndpoint: string;
  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly bucketName: string;
  private readonly s3Client: S3Client;
  private readonly publicS3Client: S3Client;

  constructor() {
    this.endpoint = process.env.ENDPOINT ?? "http://minio:9000";
    this.publicEndpoint =
      process.env.PUBLIC_ENDPOINT ??
      this.endpoint
        .replace("http://minio:", "http://localhost:")
        .replace("https://minio:", "https://localhost:");
    this.accessKey = process.env.ACCESS_KEY ?? "minioadmin";
    this.secretKey = process.env.SECRET_KEY ?? "minioadmin";
    this.bucketName = process.env.BUCKET_NAME ?? "webu-portal";

    this.s3Client = new S3Client({
      region: "us-east-1",
      endpoint: this.endpoint,
      forcePathStyle: true,
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
      credentials: {
        accessKeyId: this.accessKey,
        secretAccessKey: this.secretKey,
      },
    });

    this.publicS3Client = new S3Client({
      region: "us-east-1",
      endpoint: this.publicEndpoint,
      forcePathStyle: true,
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
      credentials: {
        accessKeyId: this.accessKey,
        secretAccessKey: this.secretKey,
      },
    });
  }

  private normalizeFileName(fileName: string): string {
    return fileName
      .trim()
      .replaceAll(/\s+/g, "-")
      .replaceAll(/[^a-zA-Z0-9._-]/g, "")
      .replaceAll(/-{2,}/g, "-")
      .toLowerCase();
  }

  private createObjectKey(userId: string, fileName: string): string {
    const normalized = this.normalizeFileName(fileName);
    return `avatars/${userId}/${randomUUID()}-${normalized || "upload.bin"}`;
  }

  private buildPublicBaseUrl(): string {
    const endpoint = this.publicEndpoint.replace(/\/$/, "");

    try {
      const url = new URL(endpoint);
      const path = url.pathname.replace(/^\/+|\/+$/g, "");
      const hostHasBucket = url.hostname.startsWith(`${this.bucketName}.`);
      const pathHasBucket = path === this.bucketName || path.endsWith(`/${this.bucketName}`);

      const isR2PublicDev = url.hostname.endsWith(".r2.dev");

      if (hostHasBucket || pathHasBucket || isR2PublicDev) {
        return endpoint;
      }

      return `${endpoint}/${this.bucketName}`;
    } catch {
      return `${endpoint}/${this.bucketName}`;
    }
  }

  private toPublicFileUrl(key: string): string {
    return `${this.buildPublicBaseUrl()}/${key}`;
  }

  async createPutUploadUrl(params: {
    userId: string;
    fileName: string;
    contentType: string;
  }): Promise<UploadUrlResult> {
    const key = this.createObjectKey(params.userId, params.fileName);

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: params.contentType,
    });

    const uploadUrl = await getSignedUrl(this.publicS3Client, command, {
      expiresIn: 300,
    });

    return {
      uploadUrl,
      fileUrl: this.toPublicFileUrl(key),
      key,
    };
  }

  extractKeyFromUrl(publicUrl: string): string | null {
    try {
      const url = new URL(publicUrl);
      // pathname is like "/avatars/userId/uuid-filename.webp"
      // or "/webu-portal/avatars/..." for path-style URLs
      const pathname = url.pathname.replace(/^\/+/, "");
      // Strip leading bucket name if present (path-style)
      const withoutBucket = pathname.startsWith(`${this.bucketName}/`)
        ? pathname.slice(this.bucketName.length + 1)
        : pathname;
      return withoutBucket || null;
    } catch {
      return null;
    }
  }

  async deleteObject(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    await this.s3Client.send(command);
  }
}
