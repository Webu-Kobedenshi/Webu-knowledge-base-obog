import { getCachedServerSession } from "./session";
import type { AlumniProfile, Department, UserStatus } from "./types";

type Role = "STUDENT" | "ALUMNI" | "ADMIN";

type GetMyProfileData = {
  getMyProfile: {
    id: string;
    email: string;
    name: string | null;
    studentId: string | null;
    linkedGmail: string | null;
    role: Role;
    status: UserStatus;
    enrollmentYear: number | null;
    durationYears: number | null;
    department: Department | null;
    alumniProfile: AlumniProfile | null;
  };
};

type MyProfile = GetMyProfileData["getMyProfile"];

type GetMyProfileSummaryData = {
  getMyProfileSummary: Omit<MyProfile, "alumniProfile">;
};

type GraphQlResponse<TData> = {
  data?: TData;
  errors?: Array<{ message: string }>;
};

function toGraphqlErrorMessage(errors: Array<{ message: string }> | undefined): string {
  return errors?.map((item) => item.message).join(", ") ?? "";
}

function normalizeProfileError(message: string): string {
  return message.includes("Email is not allowed") ? "Authentication required" : message;
}

const getMyProfileQuery = `
  query GetMyProfile {
    getMyProfile {
      id
      email
      name
      studentId
      linkedGmail
      role
      status
      enrollmentYear
      durationYears
      department
      alumniProfile {
        id
        userId
        nickname
        graduationYear
        department
        companyNames
        companyExperiences {
          id
          companyName
          isPublic
          selectionExperience {
            id
            entryTrigger
            overallTip
            steps {
              id
              stepKind
              format
              interviewerCount
              durationMinutes
              questions
              atmosphere
              preparation
              sortOrder
            }
          }
        }
        remarks
        contactEmail
        xUrl
        instagramUrl
        avatarUrl
        isPublic
        acceptContact
        skills
        portfolioUrl
        gakuchika
        usefulCoursework
        createdAt
        updatedAt
      }
    }
  }
`;

const getMyProfileSummaryQuery = `
  query GetMyProfileSummary {
    getMyProfileSummary {
      id
      email
      name
      studentId
      linkedGmail
      role
      status
      enrollmentYear
      durationYears
      department
    }
  }
`;

export async function fetchMyProfile() {
  const session = await getCachedServerSession();
  const serviceToken = session?.serviceToken;
  if (!serviceToken) {
    return { profile: null, error: "Authentication required" } as const;
  }

  const endpoint = process.env.GRAPHQL_ENDPOINT ?? "http://localhost:4000/graphql";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${serviceToken}`,
      },
      cache: "no-store",
      body: JSON.stringify({
        query: getMyProfileQuery,
      }),
    });

    const json = (await response.json()) as GraphQlResponse<GetMyProfileData>;

    if (json.errors?.length) {
      return {
        profile: null,
        error: normalizeProfileError(toGraphqlErrorMessage(json.errors)),
      } as const;
    }

    return {
      profile: json.data?.getMyProfile ?? null,
      error: "",
    } as const;
  } catch (error) {
    return {
      profile: null,
      error: error instanceof Error ? error.message : "Unknown error",
    } as const;
  }
}

export async function fetchMyProfileSummary() {
  const session = await getCachedServerSession();
  const serviceToken = session?.serviceToken;
  if (!serviceToken) {
    return { profile: null, error: "Authentication required" } as const;
  }

  const endpoint = process.env.GRAPHQL_ENDPOINT ?? "http://localhost:4000/graphql";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${serviceToken}`,
      },
      cache: "no-store",
      body: JSON.stringify({
        query: getMyProfileSummaryQuery,
      }),
    });

    const json = (await response.json()) as GraphQlResponse<GetMyProfileSummaryData>;

    if (json.errors?.length) {
      return {
        profile: null,
        error: normalizeProfileError(toGraphqlErrorMessage(json.errors)),
      } as const;
    }

    return {
      profile: json.data?.getMyProfileSummary
        ? {
            ...json.data.getMyProfileSummary,
            alumniProfile: null,
          }
        : null,
      error: "",
    } as const;
  } catch (error) {
    return {
      profile: null,
      error: error instanceof Error ? error.message : "Unknown error",
    } as const;
  }
}
