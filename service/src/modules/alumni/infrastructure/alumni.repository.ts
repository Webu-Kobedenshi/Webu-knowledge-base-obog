import { ConflictException, Inject, Injectable } from "@nestjs/common";
import type {
  Prisma,
  Department as PrismaDepartment,
  Role as PrismaRole,
  SelectionFormat as PrismaSelectionFormat,
  SelectionStepKind as PrismaSelectionStepKind,
  UserStatus as PrismaUserStatus,
} from "@prisma/client";
import { PrismaService } from "../../../prisma.service";
import type {
  AlumniRepositoryPort,
  FindPublicAlumniListParams,
  InitialSettingsPersistenceInput,
  UpdateAlumniProfilePersistenceInput,
} from "../application/ports/alumni-repository.port";
import type {
  AlumniListConnectionDto,
  AlumniListItemDto,
  AlumniProfileDto,
  UserDto,
} from "../domain/read-models/alumni.read-model";
import type { Department } from "../domain/types/department";
import type { UserRole, UserStatus } from "../domain/types/user";

type SelectionStepKind =
  | "DOCUMENT_SCREENING"
  | "WEB_TEST"
  | "ASSIGNMENT"
  | "CODING_TEST"
  | "CASUAL_INTERVIEW"
  | "FIRST_INTERVIEW"
  | "SECOND_INTERVIEW"
  | "FINAL_INTERVIEW"
  | "OFFER"
  | "OTHER";

type SelectionFormat = "ONLINE" | "IN_PERSON" | "UNKNOWN";

type AlumniConnection = {
  items: AlumniProfileDto[];
  totalCount: number;
  hasNextPage: boolean;
};

const userBaseSelect = {
  id: true,
  email: true,
  name: true,
  studentId: true,
  linkedGmail: true,
  role: true,
  status: true,
  enrollmentYear: true,
  durationYears: true,
  department: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

const alumniProfileSelect = {
  id: true,
  userId: true,
  nickname: true,
  graduationYear: true,
  department: true,
  companies: {
    select: {
      id: true,
      companyName: true,
      selectionExperience: {
        select: {
          id: true,
          entryTrigger: true,
          overallTip: true,
          steps: {
            select: {
              id: true,
              stepKind: true,
              format: true,
              interviewerCount: true,
              durationMinutes: true,
              questions: true,
              atmosphere: true,
              preparation: true,
              sortOrder: true,
            },
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  },
  remarks: true,
  contactEmail: true,
  xUrl: true,
  instagramUrl: true,
  avatarUrl: true,
  skills: true,
  portfolioUrl: true,
  gakuchika: true,
  usefulCoursework: true,
  isPublic: true,
  acceptContact: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: userBaseSelect,
  },
} satisfies Prisma.AlumniProfileSelect;

const alumniListItemSelect = {
  id: true,
  userId: true,
  nickname: true,
  graduationYear: true,
  department: true,
  companies: {
    select: {
      id: true,
      companyName: true,
      selectionExperience: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  },
  remarks: true,
  xUrl: true,
  instagramUrl: true,
  avatarUrl: true,
  skills: true,
  portfolioUrl: true,
  gakuchika: true,
  usefulCoursework: true,
  isPublic: true,
  acceptContact: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.AlumniProfileSelect;

const userSelect = {
  ...userBaseSelect,
  alumniProfile: {
    select: alumniProfileSelect,
  },
} satisfies Prisma.UserSelect;

type AlumniProfileRecord = Prisma.AlumniProfileGetPayload<{ select: typeof alumniProfileSelect }>;
type AlumniListItemRecord = Prisma.AlumniProfileGetPayload<{ select: typeof alumniListItemSelect }>;
type UserRecord = Prisma.UserGetPayload<{ select: typeof userSelect }>;

@Injectable()
export class AlumniRepository implements AlumniRepositoryPort {
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

  private toPrismaSelectionStepKind(value: SelectionStepKind): PrismaSelectionStepKind {
    return value as PrismaSelectionStepKind;
  }

  private toPrismaSelectionFormat(value: SelectionFormat | undefined): PrismaSelectionFormat {
    return (value ?? "UNKNOWN") as PrismaSelectionFormat;
  }

  private toUserDto(record: UserRecord): UserDto {
    return {
      ...record,
      alumniProfile: record.alumniProfile ? this.toAlumniProfileDto(record.alumniProfile) : null,
    };
  }

  private toAlumniProfileDto(record: AlumniProfileRecord): AlumniProfileDto {
    return {
      id: record.id,
      userId: record.userId,
      nickname: record.nickname,
      graduationYear: record.graduationYear,
      department: record.department as Department,
      companyNames: record.companies.map((item) => item.companyName),
      companyExperiences: record.companies.map((item) => ({
        id: item.id,
        companyName: item.companyName,
        selectionExperience: item.selectionExperience
          ? {
              id: item.selectionExperience.id,
              entryTrigger: item.selectionExperience.entryTrigger,
              overallTip: item.selectionExperience.overallTip,
              steps: item.selectionExperience.steps.map((step) => ({
                id: step.id,
                stepKind: step.stepKind as SelectionStepKind,
                format: step.format as SelectionFormat,
                interviewerCount: step.interviewerCount,
                durationMinutes: step.durationMinutes,
                questions: step.questions,
                atmosphere: step.atmosphere,
                preparation: step.preparation,
                sortOrder: step.sortOrder,
              })),
            }
          : null,
      })),
      remarks: record.remarks,
      contactEmail: record.contactEmail,
      xUrl: record.xUrl,
      instagramUrl: record.instagramUrl,
      avatarUrl: (record as { avatarUrl?: string | null }).avatarUrl ?? null,
      skills: (record as { skills?: string[] }).skills ?? [],
      portfolioUrl: (record as { portfolioUrl?: string | null }).portfolioUrl ?? null,
      gakuchika: (record as { gakuchika?: string | null }).gakuchika ?? null,
      usefulCoursework: (record as { usefulCoursework?: string | null }).usefulCoursework ?? null,
      isPublic: record.isPublic,
      acceptContact: record.acceptContact,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      user: {
        ...record.user,
        department: record.user.department as Department | null,
      },
    };
  }

  private toAlumniListItemDto(record: AlumniListItemRecord): AlumniListItemDto {
    return {
      id: record.id,
      userId: record.userId,
      nickname: record.nickname,
      graduationYear: record.graduationYear,
      department: record.department as Department,
      companyNames: record.companies.map((item) => item.companyName),
      companyExperiences: record.companies.map((item) => ({
        id: item.id,
        companyName: item.companyName,
        selectionExperience: item.selectionExperience
          ? {
              id: item.selectionExperience.id,
            }
          : null,
      })),
      remarks: record.remarks,
      xUrl: record.xUrl,
      instagramUrl: record.instagramUrl,
      avatarUrl: record.avatarUrl,
      skills: record.skills,
      hasPortfolio: Boolean(record.portfolioUrl),
      hasGakuchika: Boolean(record.gakuchika),
      hasUsefulCoursework: Boolean(record.usefulCoursework),
      isPublic: record.isPublic,
      acceptContact: record.acceptContact,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  private buildPublicListWhere(
    params: Pick<FindPublicAlumniListParams, "company" | "department" | "graduationYear">,
  ) {
    const { department, company, graduationYear } = params;

    return {
      isPublic: true,
      ...(department ? { department: this.toPrismaDepartment(department) } : {}),
      ...(graduationYear ? { graduationYear } : {}),
      ...(company
        ? {
            companies: {
              some: {
                companyName: {
                  contains: company,
                  mode: "insensitive",
                },
              },
            },
          }
        : {}),
    } satisfies Prisma.AlumniProfileWhereInput;
  }

  async findPublicList(params: FindPublicAlumniListParams): Promise<AlumniConnection> {
    const { limit, offset } = params;
    const where = this.buildPublicListWhere(params);

    const [items, totalCount] = await this.prisma.$transaction([
      this.prisma.alumniProfile.findMany({
        where,
        select: alumniProfileSelect,
        orderBy: [{ graduationYear: "desc" }, { createdAt: "desc" }],
        skip: offset,
        take: limit,
      }),
      this.prisma.alumniProfile.count({ where }),
    ]);

    return {
      items: items.map((item) => this.toAlumniProfileDto(item)),
      totalCount,
      hasNextPage: offset + items.length < totalCount,
    };
  }

  async findPublicListItems(params: FindPublicAlumniListParams): Promise<AlumniListConnectionDto> {
    const { limit, offset } = params;
    const where = this.buildPublicListWhere(params);

    const [items, totalCount] = await this.prisma.$transaction([
      this.prisma.alumniProfile.findMany({
        where,
        select: alumniListItemSelect,
        orderBy: [{ graduationYear: "desc" }, { createdAt: "desc" }],
        skip: offset,
        take: limit,
      }),
      this.prisma.alumniProfile.count({ where }),
    ]);

    return {
      items: items.map((item) => this.toAlumniListItemDto(item)),
      totalCount,
      hasNextPage: offset + items.length < totalCount,
    };
  }

  async findPublicById(id: string): Promise<AlumniProfileDto | null> {
    const record = await this.prisma.alumniProfile.findFirst({
      where: {
        id,
        isPublic: true,
      },
      select: alumniProfileSelect,
    });

    return record ? this.toAlumniProfileDto(record) : null;
  }

  async findUserById(userId: string): Promise<UserDto | null> {
    const record = await this.prisma.user.findUnique({
      where: { id: userId },
      select: userSelect,
    });

    return record ? this.toUserDto(record) : null;
  }

  async findUserByEmail(email: string): Promise<UserDto | null> {
    const record = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: userSelect,
    });

    return record ? this.toUserDto(record) : null;
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

      return this.toUserDto(record);
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
        throw new ConflictException("この学籍番号はすでに他のユーザーに登録されています");
      }
      throw error;
    }
  }

  async deleteUserById(userId: string): Promise<boolean> {
    const result = await this.prisma.user.deleteMany({
      where: { id: userId },
    });

    return result.count > 0;
  }

  async upsertAlumniProfile(
    userId: string,
    input: UpdateAlumniProfilePersistenceInput,
  ): Promise<AlumniProfileDto> {
    const profileId = await this.prisma.$transaction(async (transaction) => {
      const profile = await transaction.alumniProfile.upsert({
        where: { userId },
        create: {
          userId,
          nickname: input.nickname,
          graduationYear: input.graduationYear,
          department: this.toPrismaDepartment(input.department),
          remarks: input.remarks,
          contactEmail: input.contactEmail,
          xUrl: input.xUrl,
          instagramUrl: input.instagramUrl,
          isPublic: input.isPublic,
          acceptContact: input.acceptContact,
          skills: input.skills ?? [],
          portfolioUrl: input.portfolioUrl,
          gakuchika: input.gakuchika,
          usefulCoursework: input.usefulCoursework,
        },
        update: {
          nickname: input.nickname,
          graduationYear: input.graduationYear,
          department: this.toPrismaDepartment(input.department),
          remarks: input.remarks,
          contactEmail: input.contactEmail,
          xUrl: input.xUrl,
          instagramUrl: input.instagramUrl,
          isPublic: input.isPublic,
          acceptContact: input.acceptContact,
          skills: input.skills ?? [],
          portfolioUrl: input.portfolioUrl,
          gakuchika: input.gakuchika,
          usefulCoursework: input.usefulCoursework,
        },
        select: {
          id: true,
        },
      });

      await transaction.alumniCompany.deleteMany({
        where: {
          alumniProfileId: profile.id,
          companyName: {
            notIn: input.companyNames,
          },
        },
      });

      if (input.companyNames.length > 0) {
        if (input.companyExperiences) {
          for (const company of input.companyExperiences) {
            const record = await transaction.alumniCompany.upsert({
              where: {
                alumniProfileId_companyName: {
                  alumniProfileId: profile.id,
                  companyName: company.companyName,
                },
              },
              create: {
                alumniProfileId: profile.id,
                companyName: company.companyName,
              },
              update: {},
              select: { id: true },
            });

            if (company.selectionExperience) {
              const experience = await transaction.selectionExperience.upsert({
                where: { alumniCompanyId: record.id },
                create: {
                  alumniCompanyId: record.id,
                  entryTrigger: company.selectionExperience.entryTrigger,
                  overallTip: company.selectionExperience.overallTip,
                },
                update: {
                  entryTrigger: company.selectionExperience.entryTrigger,
                  overallTip: company.selectionExperience.overallTip,
                },
                select: { id: true },
              });

              await transaction.selectionStep.deleteMany({
                where: { selectionExperienceId: experience.id },
              });

              const steps = company.selectionExperience.steps ?? [];
              if (steps.length > 0) {
                await transaction.selectionStep.createMany({
                  data: steps.map((step, index) => ({
                    selectionExperienceId: experience.id,
                    stepKind: this.toPrismaSelectionStepKind(step.stepKind),
                    format: this.toPrismaSelectionFormat(step.format),
                    interviewerCount: step.interviewerCount,
                    durationMinutes: step.durationMinutes,
                    questions: step.questions,
                    atmosphere: step.atmosphere,
                    preparation: step.preparation,
                    sortOrder: index,
                  })),
                });
              }
            } else {
              await transaction.selectionExperience.deleteMany({
                where: { alumniCompanyId: record.id },
              });
            }
          }
        } else {
          await transaction.alumniCompany.createMany({
            data: input.companyNames.map((companyName) => ({
              alumniProfileId: profile.id,
              companyName,
            })),
            skipDuplicates: true,
          });
        }
      }

      return profile.id;
    });

    const record = await this.prisma.alumniProfile.findUnique({
      where: { id: profileId },
      select: alumniProfileSelect,
    });

    if (!record) {
      throw new Error("Failed to load updated alumni profile");
    }

    return this.toAlumniProfileDto(record);
  }

  async updateAvatarUrl(userId: string, avatarUrl: string): Promise<AlumniProfileDto | null> {
    const profile = await this.prisma.alumniProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      return null;
    }

    const record = await this.prisma.alumniProfile.update({
      where: { id: profile.id },
      data: { avatarUrl } as Prisma.AlumniProfileUncheckedUpdateInput,
      select: alumniProfileSelect,
    });

    return this.toAlumniProfileDto(record);
  }

  async findUserByLinkedGmail(gmail: string): Promise<UserDto | null> {
    const record = await this.prisma.user.findUnique({
      where: { linkedGmail: gmail.toLowerCase().trim() },
      select: userSelect,
    });

    return record ? this.toUserDto(record) : null;
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

  async updateLinkedGmail(userId: string, gmail: string | null): Promise<UserDto> {
    const record = await this.prisma.user.update({
      where: { id: userId },
      data: { linkedGmail: gmail },
      select: userSelect,
    });

    return this.toUserDto(record);
  }
}
