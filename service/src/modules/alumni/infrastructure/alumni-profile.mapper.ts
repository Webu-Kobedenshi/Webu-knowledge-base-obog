import type { Prisma } from "@prisma/client";
import type { Department } from "../../../common/domain/department";
import type {
  AlumniListItemDto,
  AlumniProfileDto,
  HelpfulReactionSummaryDto,
  JobHuntingPeriod,
  SelectionFormat,
  SelectionStepKind,
  UserDto,
} from "../domain/read-models/alumni.read-model";

export const userBaseSelect = {
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

export const alumniProfileSelect = {
  id: true,
  userId: true,
  nickname: true,
  graduationYear: true,
  department: true,
  companies: {
    select: {
      id: true,
      companyName: true,
      isPublic: true,
      motivation: true,
      selectionExperience: {
        select: {
          id: true,
          entryTrigger: true,
          motivation: true,
          activityPeriod: true,
          activityPeriodNote: true,
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
  activityPeriod: true,
  activityPeriodNote: true,
  helpfulReactions: {
    select: {
      userId: true,
    },
  },
  isPublic: true,
  acceptContact: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: userBaseSelect,
  },
} satisfies Prisma.AlumniProfileSelect;

export const alumniListItemSelect = {
  id: true,
  userId: true,
  nickname: true,
  graduationYear: true,
  department: true,
  companies: {
    select: {
      id: true,
      companyName: true,
      isPublic: true,
      motivation: true,
      selectionExperience: {
        select: {
          id: true,
          entryTrigger: true,
          steps: {
            where: {
              stepKind: {
                not: "OFFER",
              },
            },
            select: {
              id: true,
            },
            take: 1,
          },
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
  helpfulReactions: {
    select: {
      userId: true,
    },
  },
  isPublic: true,
  acceptContact: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.AlumniProfileSelect;

export const userSelect = {
  ...userBaseSelect,
  alumniProfile: {
    select: alumniProfileSelect,
  },
} satisfies Prisma.UserSelect;

export type AlumniProfileRecord = Prisma.AlumniProfileGetPayload<{
  select: typeof alumniProfileSelect;
}>;
export type AlumniListItemRecord = Prisma.AlumniProfileGetPayload<{
  select: typeof alumniListItemSelect;
}>;
export type UserRecord = Prisma.UserGetPayload<{ select: typeof userSelect }>;

export function toHelpfulReactionSummary(
  reactions: Array<{ userId: string }>,
  viewerUserId?: string,
): HelpfulReactionSummaryDto {
  return {
    count: reactions.length,
    reactedByViewer: viewerUserId
      ? reactions.some((reaction) => reaction.userId === viewerUserId)
      : false,
  };
}

export function toAlumniProfileDto(
  record: AlumniProfileRecord,
  options?: { publicCompaniesOnly?: boolean; viewerUserId?: string },
): AlumniProfileDto {
  const companies = options?.publicCompaniesOnly
    ? record.companies.filter((item) => item.isPublic)
    : record.companies;

  return {
    id: record.id,
    userId: record.userId,
    nickname: record.nickname,
    graduationYear: record.graduationYear,
    department: record.department as Department,
    companyNames: companies.map((item) => item.companyName),
    companyExperiences: companies.map((item) => ({
      id: item.id,
      companyName: item.companyName,
      isPublic: item.isPublic,
      motivation: item.motivation,
      selectionExperience: item.selectionExperience
        ? {
            id: item.selectionExperience.id,
            entryTrigger: item.selectionExperience.entryTrigger,
            motivation: item.selectionExperience.motivation,
            activityPeriod: item.selectionExperience.activityPeriod as JobHuntingPeriod | null,
            activityPeriodNote: item.selectionExperience.activityPeriodNote,
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
    helpfulReaction: toHelpfulReactionSummary(record.helpfulReactions, options?.viewerUserId),
    remarks: record.remarks,
    contactEmail: record.contactEmail,
    xUrl: record.xUrl,
    instagramUrl: record.instagramUrl,
    avatarUrl: record.avatarUrl,
    skills: record.skills,
    portfolioUrl: record.portfolioUrl,
    gakuchika: record.gakuchika,
    usefulCoursework: record.usefulCoursework,
    activityPeriod: record.activityPeriod as JobHuntingPeriod | null,
    activityPeriodNote: record.activityPeriodNote,
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

export function toAlumniListItemDto(record: AlumniListItemRecord): AlumniListItemDto {
  const companies = record.companies.filter((item) => item.isPublic);

  return {
    id: record.id,
    userId: record.userId,
    nickname: record.nickname,
    graduationYear: record.graduationYear,
    department: record.department as Department,
    companyNames: companies.map((item) => item.companyName),
    companyExperiences: companies.map((item) => ({
      id: item.id,
      companyName: item.companyName,
      isPublic: item.isPublic,
      motivation: item.motivation,
      selectionExperience: item.selectionExperience
        ? {
            id: item.selectionExperience.id,
            hasSelectionFlow: Boolean(
              item.selectionExperience.entryTrigger || item.selectionExperience.steps.length > 0,
            ),
          }
        : null,
    })),
    helpfulReaction: toHelpfulReactionSummary(record.helpfulReactions),
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

export function toUserDto(record: UserRecord, viewerUserId?: string): UserDto {
  return {
    ...record,
    department: record.department as Department | null,
    alumniProfile: record.alumniProfile
      ? toAlumniProfileDto(record.alumniProfile, { viewerUserId })
      : null,
  };
}
