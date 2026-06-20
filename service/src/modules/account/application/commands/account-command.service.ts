import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { jwtVerify } from "jose";
import { DomainValidationError } from "../../../../common/domain/domain-validation.error";
import { InitialSettingsDraft } from "../../domain/entities/initial-settings.entity";
import { GmailAddress } from "../../domain/value-objects/gmail-address";
import type { UserDto } from "../dto/account.dto";
import type { AdminNameInput, InitialSettingsInput } from "../dto/account.input";
import { ACCOUNT_REPOSITORY, type AccountRepositoryPort } from "../ports/account-repository.port";

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
export class AccountCommandService {
  constructor(
    @Inject(ACCOUNT_REPOSITORY) private readonly accountRepository: AccountRepositoryPort,
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

    return this.accountRepository.updateInitialSettings(userId, {
      ...input,
      name: normalized.name,
      studentId: normalized.studentId,
      durationYears: normalized.durationYears,
      role: normalized.role,
      status: normalized.status,
    });
  }

  async updateAdminName(userId: string, input: AdminNameInput): Promise<UserDto> {
    const user = await this.accountRepository.findUserById(userId);
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

    return this.accountRepository.updateAdminName(userId, name);
  }

  deleteMyAccount(userId: string): Promise<boolean> {
    return this.accountRepository.deleteUserById(userId);
  }

  async linkGmail(userId: string, verificationToken: string): Promise<UserDto> {
    const normalized = await this.verifyLinkedGmailToken(userId, verificationToken);

    const primaryEmailUser = await this.accountRepository.findUserByEmail(normalized);
    if (primaryEmailUser && primaryEmailUser.id !== userId) {
      throw new BadRequestException(DUPLICATE_GMAIL_MESSAGE);
    }

    const existing = await this.accountRepository.findUserByLinkedGmail(normalized);
    if (existing && existing.id !== userId) {
      throw new BadRequestException(DUPLICATE_GMAIL_MESSAGE);
    }

    if (existing?.id === userId) {
      return existing;
    }

    try {
      return await this.accountRepository.updateLinkedGmail(userId, normalized);
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new BadRequestException(DUPLICATE_GMAIL_MESSAGE);
      }
      throw error;
    }
  }

  async unlinkGmail(userId: string): Promise<UserDto> {
    return this.accountRepository.updateLinkedGmail(userId, null);
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
}
