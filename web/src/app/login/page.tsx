import { Button } from "@/components/atoms/button";
import { Suspense } from "react";
import { LoginPageClient } from "./login-page-client";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageClient />
    </Suspense>
  );
}

function LoginPageFallback() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6">
      <section className="w-full rounded-xl border border-zinc-200 p-6 shadow-sm dark:border-zinc-800">
        <h1 className="text-xl font-semibold">ログイン</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Googleアカウントでログインしてください。
        </p>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Button type="button" className="w-full" disabled>
              在校生はこちら
            </Button>
            <p className="text-center text-[11px] text-zinc-500 dark:text-zinc-400">
              @st.kobedenshi.ac.jp アカウントを使用推奨
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
                あるいは
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Button type="button" variant="outline" className="w-full" disabled>
              卒業生はこちら
            </Button>
            <p className="text-center text-[11px] text-zinc-500 dark:text-zinc-400">
              Gmailアカウントでログインしてください
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-lg bg-blue-50 p-4 text-xs leading-relaxed text-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
          <strong className="block font-semibold">⚠️ 在校生の方へ重要なお知らせ</strong>
          <p className="mt-1">
            学校のアカウント（@st.kobedenshi.ac.jp）は卒業後に失効します。卒業後もプロフィールにアクセスできるよう、
            <strong>在学中にログイン後、アカウント設定から「引き継ぎGmail」の登録</strong>
            をお願いします。
          </p>
        </div>
      </section>
    </main>
  );
}
