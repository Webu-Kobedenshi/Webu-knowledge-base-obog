import { AlumniDetailTemplate } from "@/components/templates/alumni-detail-template";
import { fetchMyProfileSummary } from "@/graphql/account";
import { fetchAlumniDetail } from "@/graphql/alumni";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ companyExperienceId?: string | string[] }>;
};

export default async function AlumniDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const companyExperienceIdParam = resolvedSearchParams.companyExperienceId;
  const selectedCompanyExperienceId = Array.isArray(companyExperienceIdParam)
    ? companyExperienceIdParam[0]
    : companyExperienceIdParam;

  const { profile, error: profileError } = await fetchMyProfileSummary();

  if (profileError === "Authentication required") {
    redirect(`/login?callbackUrl=/alumni/${id}`);
  }

  if (!profile) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6 py-10">
        <section className="w-full rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          プロフィール取得に失敗しました。時間をおいて再読み込みしてください。
          <p className="mt-2 text-xs opacity-80">詳細: {profileError}</p>
        </section>
      </main>
    );
  }

  const { alumni, error } = await fetchAlumniDetail(id);

  if (error) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6 py-10">
        <section className="w-full rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          <p>OB/OGの情報を取得できませんでした。</p>
          <p className="mt-2 text-xs opacity-80">詳細: {error}</p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-rose-700 underline underline-offset-2 hover:text-rose-900 dark:text-rose-300"
          >
            一覧に戻る
          </Link>
        </section>
      </main>
    );
  }

  if (!alumni) {
    notFound();
  }

  return (
    <AlumniDetailTemplate
      alumni={alumni}
      selectedCompanyExperienceId={selectedCompanyExperienceId}
    />
  );
}
