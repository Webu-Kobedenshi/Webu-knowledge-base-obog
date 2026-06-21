import { getCachedServerSession } from "./session";
import type {
  AlumniListConnection,
  AlumniListItem,
  AlumniListSort,
  AlumniProfile,
  Department,
} from "./types";

type AlumniListData = {
  getAlumniListItems: AlumniListConnection;
};

type GraphQlResponse<TData> = {
  data?: TData;
  errors?: Array<{ message: string }>;
};

function toGraphqlErrorMessage(errors: Array<{ message: string }> | undefined): string {
  return errors?.map((item) => item.message).join(", ") ?? "";
}

function normalizeAuthError(message: string): string {
  return message.includes("Email is not allowed") ? "Authentication required" : message;
}

const alumniListQuery = `
  query GetAlumniListItems(
    $department: Department
    $company: String
    $graduationYear: Int
    $sort: AlumniListSort
    $limit: Int!
    $offset: Int!
  ) {
    getAlumniListItems(
      department: $department
      company: $company
      graduationYear: $graduationYear
      sort: $sort
      limit: $limit
      offset: $offset
    ) {
      items {
        id
        userId
        nickname
        avatarUrl
        graduationYear
        department
        companyNames
        companyExperiences {
          id
          companyName
          isPublic
          motivation
          selectionExperience {
            id
            hasSelectionFlow
          }
        }
        helpfulReaction {
          count
          reactedByViewer
        }
        remarks
        xUrl
        instagramUrl
        isPublic
        acceptContact
        skills
        hasPortfolio
        hasGakuchika
        hasUsefulCoursework
        createdAt
        updatedAt
      }
      totalCount
      hasNextPage
    }
  }
`;

export async function fetchAlumniList(params: {
  department?: string;
  company?: string;
  graduationYear?: number;
  sort?: AlumniListSort;
  limit?: number;
  offset?: number;
}) {
  const session = await getCachedServerSession();
  const serviceToken = session?.serviceToken;
  if (!serviceToken) {
    return {
      alumniList: [] satisfies AlumniListItem[],
      totalCount: 0,
      hasNextPage: false,
      error: "Authentication required",
    };
  }

  const endpoint = process.env.GRAPHQL_ENDPOINT ?? "http://localhost:4000/graphql";
  const limit = params.limit ?? 12;
  const offset = params.offset ?? 0;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${serviceToken}`,
      },
      cache: "no-store",
      body: JSON.stringify({
        query: alumniListQuery,
        variables: {
          department: params.department as Department | undefined,
          company: params.company,
          graduationYear: params.graduationYear,
          sort: params.sort,
          limit,
          offset,
        },
      }),
    });

    const json = (await response.json()) as GraphQlResponse<AlumniListData>;

    if (json.errors?.length) {
      return {
        alumniList: [] satisfies AlumniListItem[],
        totalCount: 0,
        hasNextPage: false,
        error: normalizeAuthError(toGraphqlErrorMessage(json.errors)),
      };
    }

    return {
      alumniList: json.data?.getAlumniListItems.items ?? [],
      totalCount: json.data?.getAlumniListItems.totalCount ?? 0,
      hasNextPage: json.data?.getAlumniListItems.hasNextPage ?? false,
      error: "",
    };
  } catch (error) {
    return {
      alumniList: [] satisfies AlumniListItem[],
      totalCount: 0,
      hasNextPage: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ── Alumni Detail ──

type AlumniDetailData = {
  getAlumniDetail: AlumniProfile | null;
};

const alumniDetailQuery = `
  query GetAlumniDetail($id: ID!) {
    getAlumniDetail(id: $id) {
      id
      userId
      nickname
      avatarUrl
      graduationYear
      department
      companyNames
      activityPeriod
      activityPeriodNote
        companyExperiences {
          id
          companyName
          isPublic
          motivation
          selectionExperience {
            id
            entryTrigger
          motivation
          activityPeriod
          activityPeriodNote
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
      helpfulReaction {
        count
        reactedByViewer
      }
      remarks
      contactEmail
      xUrl
      instagramUrl
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
`;

export async function fetchAlumniDetail(id: string) {
  const session = await getCachedServerSession();
  const serviceToken = session?.serviceToken;
  if (!serviceToken) {
    return { alumni: null, error: "Authentication required" };
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
        query: alumniDetailQuery,
        variables: { id },
      }),
    });

    const json = (await response.json()) as GraphQlResponse<AlumniDetailData>;

    if (json.errors?.length) {
      return {
        alumni: null,
        error: normalizeAuthError(toGraphqlErrorMessage(json.errors)),
      };
    }

    return {
      alumni: json.data?.getAlumniDetail ?? null,
      error: "",
    };
  } catch (error) {
    return {
      alumni: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
