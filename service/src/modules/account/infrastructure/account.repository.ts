import { ConflictException, Inject, Injectable } from "@nestjs/common";
import type {
  Department as PrismaDepartment,
  Role as PrismaRole,
  UserStatus as PrismaUserStatus,
} from "@prisma/client";
import type { Department } from "../../../common/domain/department";
import type { UserRole, UserStatus } from "../../../common/domain/user";
import { PrismaService } from "../../../prisma.service";
import type { UserDto } from "../../alumni/domain/read-models/alumni.read-model";
import { toUserDto, userSelect } from "../../alumni/infrastructure/alumni-profile.mapper";
import type {
  AccountRepositoryPort,
  InitialSettingsPersistenceInput,
} from "../application/ports/account-repository.port";

@Injectable()
export class AccountRepository implements AccountRepositoryPort {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private toPrismaDepartment(value: Department): PrismaDepartment {
    return value as PrismaDepartment;
  }

  private toPrismaRole(value: UserRole): PrismaRole {
    return value as PrismaRole;
  }

  private toPrismaUserStatus(value: UserStatus): PrismaUserStatus {
    return value as PrismaUserStatus;
  }

  async findUserById(userId: string): Promise<UserDto | null> {
    const record = await this.prisma.user.findUnique({
      where: { id: userId },
      select: userSelect,
    });

    return record ? toUserDto(record) : null;
  }

  async findUserByEmail(email: string): Promise<UserDto | null> {
    const record = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: userSelect,
    });

    return record ? toUserDto(record) : null;
  }

  async findUserByLinkedGmail(gmail: string): Promise<UserDto | null> {
    const record = await this.prisma.user.findUnique({
      where: { linkedGmail: gmail.toLowerCase().trim() },
      select: userSelect,
    });

    return record ? toUserDto(record) : null;
  }

  async isAdminEmail(email: string): Promise<boolean> {
    const normalizedEmail = email.toLowerCase().trim();
    if (!normalizedEmail) {
      return false;
    }

    const record = await this.prisma.adminEmail.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    return Boolean(record);
  }

  async updateInitialSettings(
    userId: string,
    input: InitialSettingsPersistenceInput,
  ): Promise<UserDto> {
    try {
      const record = await this.prisma.user.update({
        where: { id: userId },
        data: {
          name: input.name,
          studentId: input.studentId,
          enrollmentYear: input.enrollmentYear,
          durationYears: input.durationYears,
          department: this.toPrismaDepartment(input.department),
          role: this.toPrismaRole(input.role),
          status: this.toPrismaUserStatus(input.status),
        },
        select: userSelect,
      });

      return toUserDto(record);
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
        throw new ConflictException("この学籍番号はすでに他のユーザーに登録されています");
      }
      throw error;
    }
  }

  async updateAdminName(userId: string, name: string): Promise<UserDto> {
    const record = await this.prisma.user.update({
      where: { id: userId },
      data: { name },
      select: userSelect,
    });

    return toUserDto(record);
  }

  async updateLinkedGmail(userId: string, gmail: string | null): Promise<UserDto> {
    const record = await this.prisma.user.update({
      where: { id: userId },
      data: { linkedGmail: gmail },
      select: userSelect,
    });

    return toUserDto(record);
  }

  async deleteUserById(userId: string): Promise<boolean> {
    const result = await this.prisma.user.deleteMany({
      where: { id: userId },
    });

    return result.count > 0;
  }
}
