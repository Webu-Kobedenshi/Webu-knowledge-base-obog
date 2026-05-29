import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

type Department =
  | "IT_EXPERT"
  | "IT_SPECIALIST"
  | "INFORMATION_PROCESS"
  | "PROGRAMMING"
  | "AI_SYSTEM"
  | "ADVANCED_STUDIES"
  | "INFO_BUSINESS"
  | "INFO_ENGINEERING"
  | "GAME_RESEARCH"
  | "GAME_ENGINEER"
  | "GAME_SOFTWARE"
  | "ESPORTS"
  | "CG_ANIMATION"
  | "DIGITAL_ANIME"
  | "GRAPHIC_DESIGN"
  | "INDUSTRIAL_DESIGN"
  | "ARCHITECTURAL"
  | "SOUND_CREATE"
  | "SOUND_TECHNIQUE"
  | "VOICE_ACTOR"
  | "INTERNATIONAL_COMM"
  | "OTHERS";

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

type CompanyExperienceBody = {
  companyName: string;
  selectionExperience?: {
    entryTrigger?: string;
    overallTip?: string;
    steps?: Array<{
      stepKind: SelectionStepKind;
      format?: SelectionFormat;
      interviewerCount?: number;
      durationMinutes?: number;
      questions?: string;
      atmosphere?: string;
      preparation?: string;
    }>;
  } | null;
};

type Body = {
  name: string;
  studentId: string;
  enrollmentYear: number;
  durationYears: number;
  department: Department;
  nickname?: string;
  companyNames?: string[];
  companyExperiences?: CompanyExperienceBody[];
  remarks?: string;
  contactEmail?: string;
  xUrl?: string;
  instagramUrl?: string;
  isPublic?: boolean;
  acceptContact?: boolean;
  skills?: string[];
  portfolioUrl?: string;
  gakuchika?: string;
  usefulCoursework?: string;
};

type GraphQlResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

const updateInitialSettingsMutation = `
  mutation UpdateInitialSettings($input: InitialSettingsInput!) {
    updateInitialSettings(input: $input) {
      id
      name
      role
      status
      studentId
      enrollmentYear
      durationYears
      department
    }
  }
`;

const updateAlumniProfileMutation = `
  mutation UpdateAlumniProfile($input: UpdateAlumniProfileInput!) {
    updateAlumniProfile(input: $input) {
      id
      companyNames
      companyExperiences {
        id
        companyName
        selectionExperience {
          id
        }
      }
      isPublic
      acceptContact
      xUrl
      instagramUrl
      skills
      portfolioUrl
      gakuchika
      usefulCoursework
    }
  }
`;

async function executeGraphql<T>(serviceToken: string, query: string, variables: unknown) {
  const endpoint = process.env.GRAPHQL_ENDPOINT ?? "http://localhost:4000/graphql";
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${serviceToken}`,
      },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    });

    const text = await response.text();
    if (!text) {
      return { errors: [{ message: "Empty response from service" }] } as GraphQlResponse<T>;
    }

    return JSON.parse(text) as GraphQlResponse<T>;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to connect to service";
    return { errors: [{ message }] } as GraphQlResponse<T>;
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const serviceToken = session?.serviceToken;

    if (!serviceToken) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as Body;
    if (
      !body.name ||
      !body.studentId ||
      !body.enrollmentYear ||
      !body.durationYears ||
      !body.department
    ) {
      return NextResponse.json(
        {
          ok: false,
          message: "name, studentId, enrollmentYear, department are required",
        },
        { status: 400 },
      );
    }

    const initialResult = await executeGraphql<{
      updateInitialSettings: { id: string };
    }>(serviceToken, updateInitialSettingsMutation, {
      input: {
        name: body.name,
        studentId: body.studentId,
        enrollmentYear: body.enrollmentYear,
        durationYears: body.durationYears,
        department: body.department,
      },
    });

    if (initialResult.errors?.length || !initialResult.data?.updateInitialSettings) {
      return NextResponse.json(
        {
          ok: false,
          message:
            initialResult.errors?.map((item) => item.message).join(", ") ||
            "Initial settings update failed",
        },
        { status: 400 },
      );
    }

    const companyNames = (
      body.companyExperiences?.map((item) => item.companyName) ??
      body.companyNames ??
      []
    )
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    const contactEmail = body.contactEmail?.trim() || session.user?.email || undefined;
    const xUrl = body.xUrl?.trim() || undefined;
    const instagramUrl = body.instagramUrl?.trim() || undefined;
    const isPublic = body.isPublic ?? false;

    if (isPublic && companyNames.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          message: "公開する場合は companyNames を1件以上指定してください",
        },
        { status: 400 },
      );
    }

    const graduationYear = body.enrollmentYear + body.durationYears;

    const alumniResult = await executeGraphql<{ updateAlumniProfile: { id: string } }>(
      serviceToken,
      updateAlumniProfileMutation,
      {
        input: {
          nickname: body.nickname,
          graduationYear,
          department: body.department,
          companyNames,
          companyExperiences: body.companyExperiences,
          remarks: body.remarks,
          contactEmail,
          xUrl,
          instagramUrl,
          isPublic,
          acceptContact: isPublic ? body.acceptContact : false,
          skills: body.skills,
          portfolioUrl: body.portfolioUrl,
          gakuchika: body.gakuchika,
          usefulCoursework: body.usefulCoursework,
        },
      },
    );

    if (alumniResult.errors?.length || !alumniResult.data?.updateAlumniProfile) {
      return NextResponse.json(
        {
          ok: false,
          message:
            alumniResult.errors?.map((item) => item.message).join(", ") ||
            "Alumni profile update failed",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: true, alumniUpdated: true, message: "Profile updated" });
  } catch (err) {
    console.error("[POST /api/account/profile] Unexpected error:", err);
    return NextResponse.json(
      { ok: false, message: "サーバーエラーが発生しました。時間をおいて再試行してください。" },
      { status: 500 },
    );
  }
}
