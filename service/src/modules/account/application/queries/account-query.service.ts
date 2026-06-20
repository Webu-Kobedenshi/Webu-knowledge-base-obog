import { Inject, Injectable } from "@nestjs/common";
import type { Department } from "../../../../common/domain/department";
import { resolveRoleAndStatus } from "../../domain/user-role-transition";
import type { UserDto } from "../dto/account.dto";
import { ACCOUNT_REPOSITORY, type AccountRepositoryPort } from "../ports/account-repository.port";

export type AccountSummaryInput = {
  id: string;
  email: string;
  name?: string | null;
  studentId?: string | null;
  linkedGmail?: string | null;
  role?: UserDto["role"] | null;
  status?: UserDto["status"] | null;
  enrollmentYear?: number | null;
  durationYears?: number | null;
  department?: Department | string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

@Injectable()
export class AccountQueryService {
  constructor(
    @Inject(ACCOUNT_REPOSITORY) private readonly accountRepository: AccountRepositoryPort,
  ) {}

  async getMyProfile(userId: string): Promise<UserDto | null> {
    const profile = await this.accountRepository.findUserById(userId);
    if (!profile) {
      return null;
    }

    return this.resolveStudentRoleAndStatus(profile);
  }

  getMyProfileSummary(user: AccountSummaryInput): UserDto {
    return this.resolveStudentRoleAndStatus({
      id: user.id,
      email: user.email,
      name: user.name ?? null,
      studentId: user.studentId ?? null,
      linkedGmail: user.linkedGmail ?? null,
      role: user.role ?? "STUDENT",
      status: user.status ?? "ENROLLED",
      enrollmentYear: user.enrollmentYear ?? null,
      durationYears: user.durationYears ?? null,
      department: (user.department as Department | null | undefined) ?? null,
      createdAt: user.createdAt ?? new Date(),
      updatedAt: user.updatedAt ?? new Date(),
      alumniProfile: null,
    });
  }

  findUserByLinkedGmail(gmail: string): Promise<UserDto | null> {
    return this.accountRepository.findUserByLinkedGmail(gmail);
  }

  isAdminEmail(email: string): Promise<boolean> {
    return this.accountRepository.isAdminEmail(email);
  }

  private resolveStudentRoleAndStatus(profile: UserDto): UserDto {
    if (profile.role === "ADMIN") {
      return profile;
    }

    if (profile.enrollmentYear && profile.durationYears) {
      const resolved = resolveRoleAndStatus({
        enrollmentYear: profile.enrollmentYear,
        durationYears: profile.durationYears,
      });

      if (profile.role !== resolved.role || profile.status !== resolved.status) {
        return {
          ...profile,
          role: resolved.role,
          status: resolved.status,
        };
      }
    }

    return profile;
  }
}
