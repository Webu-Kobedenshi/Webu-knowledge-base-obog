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

type JobHuntingPeriod =
  | "FIRST_YEAR_FIRST_HALF"
  | "FIRST_YEAR_SECOND_HALF"
  | "SECOND_YEAR_FIRST_HALF"
  | "SUMMER_BREAK"
  | "PRE_GRADUATION_AUTUMN"
  | "OTHER";

type CompanyExperienceBody = {
  companyName: string;
  isPublic?: boolean;
  motivation?: string;
  selectionExperience?: {
    entryTrigger?: string;
    motivation?: string;
    activityPeriod?: JobHuntingPeriod;
    activityPeriodNote?: string;
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
  studentId?: string;
  enrollmentYear?: number;
  durationYears?: number;
  department?: Department;
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
  activityPeriod?: JobHuntingPeriod;
  activityPeriodNote?: string;
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

const updateAdminNameMutation = `
  mutation UpdateAdminName($input: AdminNameInput!) {
    updateAdminName(input: $input) {
      id
      name
      role
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
	        isPublic
	        motivation
	        selectionExperience {
          id
        }
	      }
	      activityPeriod
	      activityPeriodNote
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

    if (session.user?.role === "ADMIN") {
      if (!body.name?.trim()) {
        return NextResponse.json(
          {
            ok: false,
            message: "name is required",
          },
          { status: 400 },
        );
      }

      const adminNameResult = await executeGraphql<{
        updateAdminName: { id: string };
      }>(serviceToken, updateAdminNameMutation, {
        input: {
          name: body.name.trim(),
        },
      });

      if (adminNameResult.errors?.length || !adminNameResult.data?.updateAdminName) {
        return NextResponse.json(
          {
            ok: false,
            message:
              adminNameResult.errors?.map((item) => item.message).join(", ") ||
              "Admin name update failed",
          },
          { status: 400 },
        );
      }

      return NextResponse.json({ ok: true, alumniUpdated: false, message: "Profile updated" });
    }

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
    const publicCompanyCount =
      body.companyExperiences?.filter(
        (item) => item.companyName.trim().length > 0 && item.isPublic !== false,
      ).length ?? companyNames.length;
    const publicCompanyMotivationCount =
      body.companyExperiences?.filter(
        (item) =>
          item.companyName.trim().length > 0 &&
          item.isPublic !== false &&
          Boolean(item.motivation?.trim()),
      ).length ?? 0;

    if (isPublic && publicCompanyCount === 0) {
      return NextResponse.json(
        {
          ok: false,
          message: "公開する場合は公開する内定先を1件以上指定してください",
        },
        { status: 400 },
      );
    }

    if (isPublic && !body.activityPeriod) {
      return NextResponse.json(
        {
          ok: false,
          message: "公開する場合は就活を始めた時期を指定してください",
        },
        { status: 400 },
      );
    }

    if (isPublic && publicCompanyMotivationCount === 0) {
      return NextResponse.json(
        {
          ok: false,
          message: "公開する場合は公開する内定先のうち1社以上に選んだ理由を入力してください",
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
          contactEmail,
          xUrl,
          instagramUrl,
          isPublic,
          acceptContact: isPublic ? body.acceptContact : false,
          skills: body.skills,
          portfolioUrl: body.portfolioUrl,
          gakuchika: body.gakuchika,
          usefulCoursework: body.usefulCoursework,
          activityPeriod: body.activityPeriod,
          activityPeriodNote: body.activityPeriodNote,
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
