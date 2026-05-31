import { ArrowRight, GraduationCap, MailCheck, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

export function LoginPageContent({ loginButton }: { loginButton: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-10">
      <section className="w-full rounded-xl border border-zinc-200 bg-white/90 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80">
        <p className="text-xs font-semibold text-violet-600 dark:text-violet-300">
          We部 OBOGナレッジベース
        </p>
        <h1 className="mt-2 text-xl font-semibold text-zinc-950 sm:text-2xl dark:text-zinc-50">
          ログイン
        </h1>

        {loginButton}

        <div className="mt-5 rounded-lg border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Google画面で選ぶアカウント
          </p>
          <div className="mt-3 space-y-3">
            <div className="flex gap-3">
              <GraduationCap
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 text-violet-600 dark:text-violet-300"
              />
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">在校生</p>
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  学校アカウント（@st.kobedenshi.ac.jp）を選択
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <MailCheck
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 text-sky-600 dark:text-sky-300"
              />
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">卒業生</p>
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  引き継ぎ登録したGmailアカウントを選択
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <ShieldCheck
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-300"
              />
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">管理者</p>
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  管理者として許可されたGoogleアカウントを選択
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-blue-50 p-4 text-xs leading-relaxed text-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
          <strong className="block font-semibold">在校生の方へ重要なお知らせ</strong>
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

export function LoginButtonContent() {
  return (
    <>
      Googleでログインへ進む
      <ArrowRight aria-hidden="true" className="size-4" />
    </>
  );
}
