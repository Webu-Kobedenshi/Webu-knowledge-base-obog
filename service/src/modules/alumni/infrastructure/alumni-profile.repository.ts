import { Inject, Injectable } from "@nestjs/common";
import type {
  Prisma,
  Department as PrismaDepartment,
  JobHuntingPeriod as PrismaJobHuntingPeriod,
  SelectionFormat as PrismaSelectionFormat,
  SelectionStepKind as PrismaSelectionStepKind,
} from "@prisma/client";
import type { Department } from "../../../common/domain/department";
import { PrismaService } from "../../../prisma.service";
import type {
  AlumniProfileRepositoryPort,
  FindPublicAlumniListParams,
  UpdateAlumniProfilePersistenceInput,
} from "../application/ports/alumni-profile-repository.port";
import { normalizeCompanyNameForSearch } from "../domain/company-search-normalization";
import type {
  AlumniConnectionDto,
  AlumniListConnectionDto,
  AlumniProfileDto,
} from "../domain/read-models/alumni.read-model";
import {
  alumniListItemSelect,
  alumniProfileSelect,
  toAlumniListItemDto,
  toAlumniProfileDto,
} from "./alumni-profile.mapper";

@Injectable()
export class AlumniProfileRepository implements AlumniProfileRepositoryPort {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private toPrismaDepartment(value: Department): PrismaDepartment {
    return value as PrismaDepartment;
  }

  private toPrismaSelectionStepKind(value: string): PrismaSelectionStepKind {
    return value as PrismaSelectionStepKind;
  }

  private toPrismaSelectionFormat(value: string | undefined): PrismaSelectionFormat {
    return (value ?? "UNKNOWN") as PrismaSelectionFormat;
  }

  private toPrismaJobHuntingPeriod(value: string | undefined): PrismaJobHuntingPeriod | undefined {
    return value ? (value as PrismaJobHuntingPeriod) : undefined;
  }

  private buildPublicListWhere(
    params: Pick<FindPublicAlumniListParams, "company" | "department" | "graduationYear">,
  ) {
    const { department, company, graduationYear } = params;
    const companySearch = company ? normalizeCompanyNameForSearch(company) : "";

    return {
      isPublic: true,
      companies: {
        some: {
          isPublic: true,
          ...(companySearch
            ? {
                companyNameSearch: {
                  contains: companySearch,
                },
              }
            : {}),
        },
      },
      ...(department ? { department: this.toPrismaDepartment(department) } : {}),
      ...(graduationYear ? { graduationYear } : {}),
    } satisfies Prisma.AlumniProfileWhereInput;
  }

  private buildPublicListOrderBy(
    sort: FindPublicAlumniListParams["sort"],
  ): Prisma.AlumniProfileOrderByWithRelationInput[] {
    const defaultOrderBy: Prisma.AlumniProfileOrderByWithRelationInput[] = [
      { graduationYear: "desc" },
      { createdAt: "desc" },
    ];

    if (sort === "HELPFUL") {
      return [{ helpfulReactions: { _count: "desc" } }, ...defaultOrderBy];
    }

    return defaultOrderBy;
  }

  async findPublicList(params: FindPublicAlumniListParams): Promise<AlumniConnectionDto> {
    const { limit, offset } = params;
    const where = this.buildPublicListWhere(params);
    const orderBy = this.buildPublicListOrderBy(params.sort);

    const [items, totalCount] = await this.prisma.$transaction([
      this.prisma.alumniProfile.findMany({
        where,
        select: alumniProfileSelect,
        orderBy,
        skip: offset,
        take: limit,
      }),
      this.prisma.alumniProfile.count({ where }),
    ]);

    return {
      items: items.map((item) => toAlumniProfileDto(item, { publicCompaniesOnly: true })),
      totalCount,
      hasNextPage: offset + items.length < totalCount,
    };
  }

  async findPublicListItems(params: FindPublicAlumniListParams): Promise<AlumniListConnectionDto> {
    const { limit, offset } = params;
    const where = this.buildPublicListWhere(params);
    const orderBy = this.buildPublicListOrderBy(params.sort);

    const [items, totalCount] = await this.prisma.$transaction([
      this.prisma.alumniProfile.findMany({
        where,
        select: alumniListItemSelect,
        orderBy,
        skip: offset,
        take: limit,
      }),
      this.prisma.alumniProfile.count({ where }),
    ]);

    return {
      items: items.map((item) => toAlumniListItemDto(item)),
      totalCount,
      hasNextPage: offset + items.length < totalCount,
    };
  }

  async findPublicCompanyNameSuggestions(query: string, limit: number): Promise<string[]> {
    const take = Math.min(Math.max(limit, 1), 12);
    const normalizedQuery = normalizeCompanyNameForSearch(query);
    if (!normalizedQuery) {
      return [];
    }

    const prefixRecords = await this.prisma.alumniCompany.findMany({
      where: {
        isPublic: true,
        companyNameSearch: {
          startsWith: normalizedQuery,
        },
        alumniProfile: {
          isPublic: true,
        },
      },
      distinct: ["companyName"],
      orderBy: [{ companyNameSearch: "asc" }, { companyName: "asc" }],
      take,
      select: {
        companyName: true,
      },
    });

    if (prefixRecords.length >= take) {
      return prefixRecords.map((record) => record.companyName);
    }

    const remainingTake = take - prefixRecords.length;
    const containsRecords = await this.prisma.alumniCompany.findMany({
      where: {
        isPublic: true,
        companyNameSearch: {
          contains: normalizedQuery,
          not: {
            startsWith: normalizedQuery,
          },
        },
        alumniProfile: {
          isPublic: true,
        },
      },
      distinct: ["companyName"],
      orderBy: [{ companyNameSearch: "asc" }, { companyName: "asc" }],
      take: remainingTake,
      select: {
        companyName: true,
      },
    });

    return [...prefixRecords, ...containsRecords].map((record) => record.companyName);
  }

  async findPublicById(id: string, viewerUserId?: string): Promise<AlumniProfileDto | null> {
    const record = await this.prisma.alumniProfile.findFirst({
      where: {
        id,
        isPublic: true,
        companies: {
          some: {
            isPublic: true,
          },
        },
      },
      select: alumniProfileSelect,
    });

    return record ? toAlumniProfileDto(record, { publicCompaniesOnly: true, viewerUserId }) : null;
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
          activityPeriod: this.toPrismaJobHuntingPeriod(input.activityPeriod),
          activityPeriodNote: input.activityPeriodNote,
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
          activityPeriod: this.toPrismaJobHuntingPeriod(input.activityPeriod),
          activityPeriodNote: input.activityPeriodNote,
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
                companyNameSearch: normalizeCompanyNameForSearch(company.companyName),
                isPublic: company.isPublic,
                motivation: company.motivation,
              },
              update: {
                companyNameSearch: normalizeCompanyNameForSearch(company.companyName),
                isPublic: company.isPublic,
                motivation: company.motivation,
              },
              select: { id: true },
            });

            if (company.selectionExperience) {
              const experience = await transaction.selectionExperience.upsert({
                where: { alumniCompanyId: record.id },
                create: {
                  alumniCompanyId: record.id,
                  entryTrigger: company.selectionExperience.entryTrigger,
                  motivation: company.selectionExperience.motivation,
                  activityPeriod: this.toPrismaJobHuntingPeriod(
                    company.selectionExperience.activityPeriod,
                  ),
                  activityPeriodNote: company.selectionExperience.activityPeriodNote,
                  overallTip: company.selectionExperience.overallTip,
                },
                update: {
                  entryTrigger: company.selectionExperience.entryTrigger,
                  motivation: company.selectionExperience.motivation,
                  activityPeriod: this.toPrismaJobHuntingPeriod(
                    company.selectionExperience.activityPeriod,
                  ),
                  activityPeriodNote: company.selectionExperience.activityPeriodNote,
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
              companyNameSearch: normalizeCompanyNameForSearch(companyName),
              isPublic: true,
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

    return toAlumniProfileDto(record);
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

    return toAlumniProfileDto(record);
  }

  async toggleHelpfulReaction(
    alumniProfileId: string,
    userId: string,
  ): Promise<AlumniProfileDto | null> {
    const profile = await this.prisma.alumniProfile.findFirst({
      where: {
        id: alumniProfileId,
        isPublic: true,
        companies: {
          some: {
            isPublic: true,
          },
        },
      },
      select: { id: true },
    });

    if (!profile) {
      return null;
    }

    await this.prisma.$transaction(async (transaction) => {
      const existing = await transaction.helpfulReaction.findFirst({
        where: {
          alumniProfileId: profile.id,
          userId,
        },
        select: { id: true },
      });

      if (existing) {
        await transaction.helpfulReaction.delete({
          where: { id: existing.id },
        });
        return;
      }

      await transaction.helpfulReaction.create({
        data: {
          alumniProfileId: profile.id,
          userId,
        },
      });
    });

    return this.findPublicById(profile.id, userId);
  }
}
