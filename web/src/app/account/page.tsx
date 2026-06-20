import { AccountActions } from "@/app/account/account-actions";
import { ChevronLeftIcon } from "@/components/atoms/icons";
import { ToastOnMount } from "@/components/atoms/toast-on-mount";
import { AccountProfileForm } from "@/components/organisms/account-profile-form";
import { fetchMyProfileSummary } from "@/graphql/account";
import { getCachedServerSession } from "@/graphql/session";
import Link from "next/link";

const roleLabel: Record<"STUDENT" | "ALUMNI" | "ADMIN", string> = {
  STUDENT: "在校生",
  ALUMNI: "卒業生",
  ADMIN: "管理者",
};

const roleGradient: Record<"STUDENT" | "ALUMNI" | "ADMIN", string> = {
  STUDENT: "from-blue-500 to-cyan-500",
  ALUMNI: "from-violet-500 to-fuchsia-500",
  ADMIN: "from-amber-500 to-orange-500",
};

type AccountPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchParamValue(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const [session, { profile }, params] = await Promise.all([
    getCachedServerSession(),
    fetchMyProfileSummary(),
    searchParams,
  ]);
  const resolvedParams = params ?? {};
  const gmailLinkStatus = getSearchParamValue(resolvedParams.gmailLinkStatus);
  const gmailLinkMessage = getSearchParamValue(resolvedParams.gmailLinkMessage);
  const role = (profile?.role ?? session?.user?.role) as "STUDENT" | "ALUMNI" | "ADMIN" | undefined;
  const displayName = profile?.name ?? session?.user?.name ?? "ユーザー";
  const email = profile?.email ?? session?.user?.email ?? "";
  const initial = (displayName || "U")[0].toUpperCase();
  const gradient = roleGradient[role ?? "STUDENT"];

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-4 py-6 md:px-6 md:py-10">
      <ToastOnMount
        variant={gmailLinkStatus === "success" ? "success" : "error"}
        message={gmailLinkMessage}
      />
      {/* ── Navigation ── */}
      <nav className="mb-6">
        <Link
          href="/"
          className="group inline-flex items-center gap-1.5 text-[13px] font-medium text-stone-500 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
        >
          <ChevronLeftIcon
            size={16}
            className="transition-transform group-hover:-translate-x-0.5"
            title="戻る"
          />
          一覧に戻る
        </Link>
      </nav>

      {/* ── Profile Hero ── */}
      <section className="relative isolate overflow-hidden rounded-3xl border border-stone-200/90 bg-white shadow-[0_10px_30px_-18px_rgba(0,0,0,0.25)] ring-1 ring-stone-100/80 dark:border-stone-800 dark:bg-stone-950 dark:ring-stone-800/60">
        {/* Hero banner */}
        <div className={`relative h-32 bg-gradient-to-br ${gradient} md:h-36`}>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.3),transparent_55%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.15),transparent_40%)]"
          />
          {/* Floating dots */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <span className="absolute left-[10%] top-[25%] h-2 w-2 rounded-full bg-white/40 blur-[0.5px]" />
            <span className="absolute left-[35%] top-[60%] h-1.5 w-1.5 rounded-full bg-white/35" />
            <span className="absolute left-[60%] top-[20%] h-2.5 w-2.5 rounded-full bg-white/20 blur-[1px]" />
            <span className="absolute left-[82%] top-[50%] h-1.5 w-1.5 rounded-full bg-white/30" />
          </div>
        </div>

        {/* Avatar + identity */}
        <div className="relative px-5 pb-5 md:px-6 md:pb-6">
          <div className="-mt-12">
            <div
              className={`flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br ${gradient} text-3xl font-extrabold text-white shadow-lg dark:border-stone-950`}
            >
              {initial}
            </div>
          </div>

          <div className="mt-3 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-extrabold text-stone-900 dark:text-stone-100">
                {displayName}
              </h1>
              <p className="mt-0.5 truncate text-[13px] text-stone-500 dark:text-stone-400">
                {email}
              </p>
            </div>
            {role ? (
              <div className="shrink-0">
                <span
                  className={`inline-block rounded-full bg-gradient-to-r ${gradient} px-3 py-1 text-[11px] font-bold text-white shadow-sm`}
                >
                  {roleLabel[role]}
                </span>
              </div>
            ) : null}
          </div>

          <div className="mt-6 border-t border-stone-200/80 pt-6 dark:border-stone-800/70">
            {role === "ADMIN" ? (
              <>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                  <p className="font-bold">教員アカウント</p>
                  <p className="mt-1 text-xs opacity-80">{email}</p>
                  <div className="mt-4 rounded-xl border border-amber-200/80 bg-white/60 p-3 dark:border-amber-900/50 dark:bg-amber-950/30">
                    <p className="font-bold">就活情報 Excel 出力</p>
                    <p className="mt-1 text-xs leading-5 opacity-80">
                      登録済みの学籍番号、本名、学科、卒業年度、内定先、会社を選んだ理由、始めた就活時期、ガクチカを
                      Excel でダウンロードできます。
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href="/api/admin/career-export"
                      className="inline-flex h-10 items-center justify-center rounded-xl bg-amber-600 px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-amber-500"
                    >
                      就活情報Excelをダウンロード
                    </Link>
                    <span className="inline-flex h-10 cursor-not-allowed items-center justify-center rounded-xl border border-amber-300 bg-white/50 px-4 text-sm font-bold text-amber-900/50 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100/50">
                      Excelアップロード ※ 将来リリース予定
                    </span>
                  </div>
                </div>
                <AccountProfileForm
                  initialProfile={profile}
                  initialName={profile?.name ?? session?.user?.name}
                  initialEmail={profile?.email ?? session?.user?.email}
                  title="プロフィール"
                  description="管理者アカウントで表示する名前を更新できます。"
                  showPublicProfileFields={false}
                  showLinkedGmailField={false}
                  basicProfileRequiredMode="nameOnly"
                />
              </>
            ) : (
              <AccountProfileForm
                initialProfile={profile}
                initialName={profile?.name ?? session?.user?.name}
                initialEmail={profile?.email ?? session?.user?.email}
                title="プロフィール"
                description="初期設定で入力した項目を更新できます。"
                showPublicProfileFields={false}
              />
            )}

            {/* ── Account Actions ── */}
            <div className="mt-6">
              <AccountActions />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
