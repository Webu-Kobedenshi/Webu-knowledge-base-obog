import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
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

type GraphQlResponse<TData> = {
  data?: TData;
  errors?: Array<{ message: string }>;
};

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

export async function fetchMyProfile() {
  const session = await getServerSession(authOptions);
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
        error: json.errors.map((item) => item.message).join(", "),
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
