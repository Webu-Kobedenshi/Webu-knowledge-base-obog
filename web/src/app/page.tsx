import {
  AlumniListResults,
  AlumniListResultsSkeleton,
  AlumniListTemplateFrame,
} from "@/components/templates/alumni-list-template";
import { fetchMyProfileSummary } from "@/graphql/account";
import { fetchAlumniList } from "@/graphql/alumni";
import { redirect } from "next/navigation";
import { Suspense } from "react";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: PageProps) {
  const { profile, error: profileError } = await fetchMyProfileSummary();

  if (profileError === "Authentication required") {
    redirect("/login?callbackUrl=/");
  }

  if (!profile && !profileError) {
    redirect("/initial-setup");
  }

  if (!profile || profileError) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6 py-10">
        <section className="w-full rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          プロフィール取得に失敗しました。時間をおいて再読み込みしてください。
          <p className="mt-2 text-xs opacity-80">詳細: {profileError}</p>
        </section>
      </main>
    );
  }

  if (profile.role === "ADMIN" && !profile.name?.trim()) {
    redirect("/initial-setup");
  }

  if (
    profile.role !== "ADMIN" &&
    (!profile.studentId || !profile.enrollmentYear || !profile.durationYears || !profile.department)
  ) {
    redirect("/initial-setup");
  }

  const params: Record<string, string | string[] | undefined> = (await searchParams) ?? {};
  const departmentParam = params.department;
  const companyParam = params.company;
  const graduationYearParam = params.graduationYear;
  const pageParam = params.page;
  const pageSizeParam = params.pageSize;

  const department =
    (Array.isArray(departmentParam) ? departmentParam[0] : departmentParam)?.trim() ?? "";
  const company = (Array.isArray(companyParam) ? companyParam[0] : companyParam)?.trim() ?? "";
  const graduationYearRaw =
    (Array.isArray(graduationYearParam) ? graduationYearParam[0] : graduationYearParam)?.trim() ??
    "";
  const parsedGraduationYear = Number(graduationYearRaw);
  const graduationYear =
    Number.isInteger(parsedGraduationYear) && parsedGraduationYear >= 1900
      ? parsedGraduationYear
      : undefined;

  const parsedPage = Number((Array.isArray(pageParam) ? pageParam[0] : pageParam)?.trim() ?? "1");
  const currentPage = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.floor(parsedPage) : 1;
  const parsedPageSize = Number(
    (Array.isArray(pageSizeParam) ? pageSizeParam[0] : pageSizeParam)?.trim() ?? "12",
  );
  const pageSize = [12, 24, 36, 48].includes(parsedPageSize) ? parsedPageSize : 12;
  const offset = (currentPage - 1) * pageSize;
  const account = {
    id: profile.id,
    name: profile.name ?? "ユーザー",
    email: profile.email,
    role: profile.role,
  };

  return (
    <AlumniListTemplateFrame
      initialDepartment={department}
      initialCompany={company}
      initialGraduationYear={graduationYear ? String(graduationYear) : ""}
      pageSize={pageSize}
      account={account}
    >
      <Suspense
        key={[department, company, graduationYear ?? "", currentPage, pageSize].join(":")}
        fallback={
          <AlumniListResultsSkeleton
            initialDepartment={department}
            initialCompany={company}
            initialGraduationYear={graduationYear ? String(graduationYear) : ""}
            pageSize={pageSize}
            account={account}
          />
        }
      >
        <AlumniListData
          department={department || undefined}
          company={company || undefined}
          graduationYear={graduationYear}
          currentPage={currentPage}
          pageSize={pageSize}
          offset={offset}
          initialDepartment={department}
          initialCompany={company}
          initialGraduationYear={graduationYear ? String(graduationYear) : ""}
          account={account}
        />
      </Suspense>
    </AlumniListTemplateFrame>
  );
}

type AlumniListDataProps = {
  department?: string;
  company?: string;
  graduationYear?: number;
  currentPage: number;
  pageSize: number;
  offset: number;
  initialDepartment: string;
  initialCompany: string;
  initialGraduationYear: string;
  account: {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "STUDENT" | "ALUMNI";
  };
};

async function AlumniListData({
  department,
  company,
  graduationYear,
  currentPage,
  pageSize,
  offset,
  initialDepartment,
  initialCompany,
  initialGraduationYear,
  account,
}: AlumniListDataProps) {
  const { alumniList, totalCount, hasNextPage, error } = await fetchAlumniList({
    department,
    company,
    graduationYear,
    limit: pageSize,
    offset,
  });

  return (
    <AlumniListResults
      alumni={alumniList}
      initialDepartment={initialDepartment}
      initialCompany={initialCompany}
      initialGraduationYear={initialGraduationYear}
      totalCount={totalCount}
      currentPage={currentPage}
      pageSize={pageSize}
      hasNextPage={hasNextPage}
      account={account}
      error={error}
    />
  );
}
