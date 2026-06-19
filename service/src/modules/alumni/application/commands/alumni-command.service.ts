import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { jwtVerify } from "jose";
import { AlumniProfileDraft } from "../../domain/entities/alumni-profile.entity";
import { InitialSettingsDraft } from "../../domain/entities/initial-settings.entity";
import { DomainValidationError } from "../../domain/errors/domain-validation.error";
import { GmailAddress } from "../../domain/value-objects/gmail-address";
import type { AlumniProfileDto, UserDto } from "../dto/alumni.dto";
import type {
  AdminNameInput,
  InitialSettingsInput,
  UpdateAlumniProfileInput,
  UploadUrlResponse,
} from "../dto/alumni.input";
import { ALUMNI_REPOSITORY, type AlumniRepositoryPort } from "../ports/alumni-repository.port";
import { STORAGE, type StoragePort } from "../ports/storage.port";

const LINKED_GMAIL_VERIFICATION_PURPOSE = "linked-gmail-verification";
const DUPLICATE_GMAIL_MESSAGE = "このGmailアドレスは既に他のアカウントに登録されています。";
const INVALID_GMAIL_VERIFICATION_MESSAGE =
  "Gmailアドレスの確認が完了していません。もう一度Googleで確認してください。";

type LinkedGmailVerificationPayload = {
  purpose?: string;
  gmail?: string;
  verifiedAt?: string;
  sub?: string;
};

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

@Injectable()
export class AlumniCommandService {
  constructor(
    @Inject(ALUMNI_REPOSITORY) private readonly alumniRepository: AlumniRepositoryPort,
    @Inject(STORAGE) private readonly storageService: StoragePort,
  ) {}

  updateInitialSettings(userId: string, input: InitialSettingsInput): Promise<UserDto> {
    let draft: InitialSettingsDraft;
    try {
      draft = InitialSettingsDraft.create(input);
    } catch (error) {
      if (error instanceof DomainValidationError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }

    const normalized = draft.toData();

    return this.alumniRepository.updateInitialSettings(userId, {
      ...input,
      name: normalized.name,
      studentId: normalized.studentId,
      durationYears: normalized.durationYears,
      role: normalized.role,
      status: normalized.status,
    });
  }

  async updateAdminName(userId: string, input: AdminNameInput): Promise<UserDto> {
    const user = await this.alumniRepository.findUserById(userId);
    if (!user) {
      throw new BadRequestException("User not found");
    }

    if (user.role !== "ADMIN") {
      throw new BadRequestException("Admin role is required");
    }

    const name = input.name.trim();
    if (!name) {
      throw new BadRequestException("name is required");
    }

    return this.alumniRepository.updateAdminName(userId, name);
  }

  deleteMyAccount(userId: string): Promise<boolean> {
    return this.alumniRepository.deleteUserById(userId);
  }

  async updateAlumniProfile(
    userId: string,
    input: UpdateAlumniProfileInput,
  ): Promise<AlumniProfileDto> {
    const user = await this.alumniRepository.findUserById(userId);
    if (!user) {
      throw new BadRequestException("User not found");
    }

    let draft: AlumniProfileDraft;
    try {
      draft = AlumniProfileDraft.create(input, user.email);
    } catch (error) {
      if (error instanceof DomainValidationError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }

    const normalized = draft.toData();

    return this.alumniRepository.upsertAlumniProfile(userId, {
      ...input,
      nickname: normalized.nickname,
      companyNames: normalized.companyNames,
      companyExperiences: normalized.companyExperiences?.map((company) => ({
        ...company,
        isPublic: company.isPublic ?? true,
      })),
      contactEmail: normalized.contactEmail,
      xUrl: normalized.xUrl,
      instagramUrl: normalized.instagramUrl,
      isPublic: normalized.isPublic,
      acceptContact: normalized.acceptContact,
      skills: normalized.skills,
      portfolioUrl: normalized.portfolioUrl,
      gakuchika: normalized.gakuchika,
      usefulCoursework: normalized.usefulCoursework,
      activityPeriod: normalized.activityPeriod,
      activityPeriodNote: normalized.activityPeriodNote,
    });
  }

  async toggleHelpfulReaction(userId: string, alumniProfileId: string): Promise<AlumniProfileDto> {
    const user = await this.alumniRepository.findUserById(userId);
    if (!user) {
      throw new BadRequestException("User not found");
    }

    const updated = await this.alumniRepository.toggleHelpfulReaction(alumniProfileId, userId);
    if (!updated) {
      throw new BadRequestException("Alumni profile not found");
    }

    return updated;
  }

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

  async updateAvatar(userId: string, url: string): Promise<AlumniProfileDto> {
    const normalizedUrl = url.trim();
    if (!normalizedUrl) {
      throw new BadRequestException("url is required");
    }

    // Fetch the existing avatarUrl before overwriting it
    const existing = await this.alumniRepository.findUserById(userId);
    const oldAvatarUrl = existing?.alumniProfile?.avatarUrl ?? null;

    const updated = await this.alumniRepository.updateAvatarUrl(userId, normalizedUrl);
    if (!updated) {
      throw new BadRequestException("Alumni profile not found");
    }

    // Physically delete the old avatar from R2 (best-effort, non-fatal)
    if (oldAvatarUrl) {
      const key = this.storageService.extractKeyFromUrl(oldAvatarUrl);
      if (key) {
        this.storageService.deleteObject(key).catch((err: unknown) => {
          console.error("[StoragePort] Failed to delete old avatar:", key, err);
        });
      }
    }

    return updated;
  }

  private getJwtSecret(): Uint8Array {
    const secret = process.env.AUTH_JWT_SECRET ?? process.env.NEXTAUTH_SECRET;
    if (!secret) {
      throw new BadRequestException("Authentication is not configured");
    }

    return new TextEncoder().encode(secret);
  }

  private async verifyLinkedGmailToken(userId: string, verificationToken: string): Promise<string> {
    let payload: LinkedGmailVerificationPayload;
    try {
      const result = await jwtVerify<LinkedGmailVerificationPayload>(
        verificationToken,
        this.getJwtSecret(),
      );
      payload = result.payload;
    } catch {
      throw new BadRequestException(INVALID_GMAIL_VERIFICATION_MESSAGE);
    }

    if (payload.purpose !== LINKED_GMAIL_VERIFICATION_PURPOSE || payload.sub !== userId) {
      throw new BadRequestException(INVALID_GMAIL_VERIFICATION_MESSAGE);
    }

    let address: GmailAddress;
    try {
      address = GmailAddress.from(payload.gmail ?? "");
    } catch (error) {
      if (error instanceof DomainValidationError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }

    return address.toString();
  }

  async linkGmail(userId: string, verificationToken: string): Promise<UserDto> {
    const normalized = await this.verifyLinkedGmailToken(userId, verificationToken);

    const primaryEmailUser = await this.alumniRepository.findUserByEmail(normalized);
    if (primaryEmailUser && primaryEmailUser.id !== userId) {
      throw new BadRequestException(DUPLICATE_GMAIL_MESSAGE);
    }

    // 既に他のユーザーが使用していないか確認
    const existing = await this.alumniRepository.findUserByLinkedGmail(normalized);
    if (existing && existing.id !== userId) {
      throw new BadRequestException(DUPLICATE_GMAIL_MESSAGE);
    }

    if (existing?.id === userId) {
      return existing;
    }

    try {
      return await this.alumniRepository.updateLinkedGmail(userId, normalized);
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new BadRequestException(DUPLICATE_GMAIL_MESSAGE);
      }
      throw error;
    }
  }

  async unlinkGmail(userId: string): Promise<UserDto> {
    return this.alumniRepository.updateLinkedGmail(userId, null);
  }
}
