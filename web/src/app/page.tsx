import {
  AlumniListResults,
  AlumniListResultsSkeleton,
  AlumniListTemplateFrame,
} from "@/components/templates/alumni-list-template";
import { fetchMyProfile } from "@/graphql/account";
import { fetchAlumniList } from "@/graphql/alumni";
import type { AlumniListSort, MyAccountProfile } from "@/graphql/types";
import { redirect } from "next/navigation";
import { Suspense } from "react";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: PageProps) {
  const [{ profile, error: profileError }, params] = await Promise.all([
    fetchMyProfile(),
    searchParams,
  ]);

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

  const resolvedParams: Record<string, string | string[] | undefined> = params ?? {};
  const departmentParam = resolvedParams.department;
  const companyParam = resolvedParams.company;
  const graduationYearParam = resolvedParams.graduationYear;
  const pageParam = resolvedParams.page;
  const pageSizeParam = resolvedParams.pageSize;
  const sortParam = resolvedParams.sort;

  const department =
    (Array.isArray(departmentParam) ? departmentParam[0] : departmentParam)?.trim() ?? "";
  const company = (Array.isArray(companyParam) ? companyParam[0] : companyParam)?.trim() ?? "";
  const sortRaw = (Array.isArray(sortParam) ? sortParam[0] : sortParam)?.trim() ?? "";
  const sort: AlumniListSort = sortRaw === "helpful" ? "HELPFUL" : "DEFAULT";
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
    avatarUrl: profile.alumniProfile?.avatarUrl ?? null,
  };

  return (
    <AlumniListTemplateFrame
      initialDepartment={department}
      initialCompany={company}
      initialGraduationYear={graduationYear ? String(graduationYear) : ""}
      pageSize={pageSize}
      sort={sort}
      account={account}
    >
      <Suspense
        key={[department, company, graduationYear ?? "", sort, currentPage, pageSize].join(":")}
        fallback={
          <AlumniListResultsSkeleton
            initialDepartment={department}
            initialCompany={company}
            initialGraduationYear={graduationYear ? String(graduationYear) : ""}
            pageSize={pageSize}
            sort={sort}
            account={account}
          />
        }
      >
        <AlumniListData
          department={department || undefined}
          company={company || undefined}
          graduationYear={graduationYear}
          sort={sort}
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
  sort: AlumniListSort;
  currentPage: number;
  pageSize: number;
  offset: number;
  initialDepartment: string;
  initialCompany: string;
  initialGraduationYear: string;
  account: MyAccountProfile;
};

async function AlumniListData({
  department,
  company,
  graduationYear,
  sort,
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
    sort,
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
      sort={sort}
      hasNextPage={hasNextPage}
      account={account}
      error={error}
    />
  );
}
