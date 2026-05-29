import { authOptions } from "@/auth";
import { AccountProfileForm } from "@/components/organisms/account-profile-form";
import { fetchMyProfile } from "@/graphql/account";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AccountPublicProfilePage() {
  const session = await getServerSession(authOptions);
  const { profile, error } = await fetchMyProfile();

  if (error === "Authentication required") {
    redirect("/login?callbackUrl=/account/public");
  }

  if (!profile || error) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6 py-10">
        <section className="w-full rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          プロフィール取得に失敗しました。時間をおいて再読み込みしてください。
          <p className="mt-2 text-xs opacity-80">詳細: {error}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-4 py-6 md:px-6 md:py-10">
      <nav className="mb-6">
        <Link
          href="/"
          className="group inline-flex items-center gap-1.5 text-[13px] font-medium text-stone-500 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform group-hover:-translate-x-0.5"
          >
            <title>戻る</title>
            <path d="m15 18-6-6 6-6" />
          </svg>
          ホームに戻る
        </Link>
      </nav>

      <section className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.25)] dark:border-stone-800 dark:bg-stone-950">
        <h1 className="text-xl font-extrabold text-stone-900 dark:text-stone-100">
          公開プロフィール設定
        </h1>
        <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
          内定先や表示名など、後輩に公開する情報を更新できます。
        </p>

        <AccountProfileForm
          initialProfile={profile}
          initialName={profile?.name ?? session?.user?.name}
          initialEmail={profile?.email ?? session?.user?.email}
          showBasicProfileFields={false}
          showPublicProfileFields
          showLinkedGmailField={false}
        />
      </section>
    </main>
  );
}
