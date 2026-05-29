import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { AlumniProfileDraft } from "../../domain/entities/alumni-profile.entity";
import { InitialSettingsDraft } from "../../domain/entities/initial-settings.entity";
import { DomainValidationError } from "../../domain/errors/domain-validation.error";
import { GmailAddress } from "../../domain/value-objects/gmail-address";
import { AlumniRepository } from "../../infrastructure/alumni.repository";
import { StorageService } from "../../infrastructure/storage.service";
import type { AlumniProfileDto, UserDto } from "../dto/alumni.dto";
import type {
  InitialSettingsInput,
  UpdateAlumniProfileInput,
  UploadUrlResponse,
} from "../dto/alumni.input";

@Injectable()
export class AlumniCommandService {
  constructor(
    @Inject(AlumniRepository) private readonly alumniRepository: AlumniRepository,
    @Inject(StorageService) private readonly storageService: StorageService,
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
      companyExperiences: normalized.companyExperiences,
      contactEmail: normalized.contactEmail,
      isPublic: normalized.isPublic,
      acceptContact: normalized.acceptContact,
      skills: normalized.skills,
      portfolioUrl: normalized.portfolioUrl,
      gakuchika: normalized.gakuchika,
      entryTrigger: normalized.entryTrigger,
      interviewTip: normalized.interviewTip,
      usefulCoursework: normalized.usefulCoursework,
    });
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
          console.error("[StorageService] Failed to delete old avatar:", key, err);
        });
      }
    }

    return updated;
  }

  async linkGmail(userId: string, gmail: string): Promise<UserDto> {
    let address: GmailAddress;
    try {
      address = GmailAddress.from(gmail);
    } catch (error) {
      if (error instanceof DomainValidationError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
    const normalized = address.toString();

    // 既に他のユーザーが使用していないか確認
    const existing = await this.alumniRepository.findUserByLinkedGmail(normalized);
    if (existing && existing.id !== userId) {
      throw new BadRequestException("このGmailアドレスは既に他のアカウントに登録されています。");
    }

    return this.alumniRepository.updateLinkedGmail(userId, normalized);
  }

  async unlinkGmail(userId: string): Promise<UserDto> {
    return this.alumniRepository.updateLinkedGmail(userId, null);
  }
}
