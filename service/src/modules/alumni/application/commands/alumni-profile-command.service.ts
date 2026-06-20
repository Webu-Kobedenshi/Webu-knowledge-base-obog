import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { DomainValidationError } from "../../../../common/domain/domain-validation.error";
import {
  ACCOUNT_REPOSITORY,
  type AccountRepositoryPort,
} from "../../../account/application/ports/account-repository.port";
import { STORAGE, type StoragePort } from "../../../media/application/ports/storage.port";
import { AlumniProfileDraft } from "../../domain/entities/alumni-profile.entity";
import type { AlumniProfileDto } from "../../domain/read-models/alumni.read-model";
import type { UpdateAlumniProfileInput } from "../dto/alumni.input";
import {
  ALUMNI_PROFILE_REPOSITORY,
  type AlumniProfileRepositoryPort,
} from "../ports/alumni-profile-repository.port";

@Injectable()
export class AlumniProfileCommandService {
  constructor(
    @Inject(ALUMNI_PROFILE_REPOSITORY)
    private readonly alumniProfileRepository: AlumniProfileRepositoryPort,
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: AccountRepositoryPort,
    @Inject(STORAGE)
    private readonly storageService: StoragePort,
  ) {}

  async updateAlumniProfile(
    userId: string,
    input: UpdateAlumniProfileInput,
  ): Promise<AlumniProfileDto> {
    const user = await this.accountRepository.findUserById(userId);
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

    return this.alumniProfileRepository.upsertAlumniProfile(userId, {
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
    const user = await this.accountRepository.findUserById(userId);
    if (!user) {
      throw new BadRequestException("User not found");
    }

    const updated = await this.alumniProfileRepository.toggleHelpfulReaction(
      alumniProfileId,
      userId,
    );
    if (!updated) {
      throw new BadRequestException("Alumni profile not found");
    }

    return updated;
  }

  async updateAvatar(userId: string, url: string): Promise<AlumniProfileDto> {
    const normalizedUrl = url.trim();
    if (!normalizedUrl) {
      throw new BadRequestException("url is required");
    }

    const existing = await this.accountRepository.findUserById(userId);
    const oldAvatarUrl = existing?.alumniProfile?.avatarUrl ?? null;

    const updated = await this.alumniProfileRepository.updateAvatarUrl(userId, normalizedUrl);
    if (!updated) {
      throw new BadRequestException("Alumni profile not found");
    }

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
}
