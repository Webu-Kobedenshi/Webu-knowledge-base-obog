import type { ReactNode } from "react";

type ErrorPageShellProps = {
  code: string;
  title: string;
  description: string;
  children: ReactNode;
  details?: string;
};

export function ErrorPageShell({
  code,
  title,
  description,
  children,
  details,
}: ErrorPageShellProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-10 md:px-6">
      <section className="liquid-glass-strong w-full overflow-hidden rounded-2xl p-6 md:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-sm font-extrabold text-white shadow-sm">
            {code}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-violet-600 dark:text-violet-400">
              We部ナレッジベース
            </p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-stone-900 md:text-3xl dark:text-stone-100">
              {title}
            </h1>
            <p className="mt-3 text-sm leading-7 text-stone-600 dark:text-stone-400">
              {description}
            </p>

            {details ? (
              <p className="mt-4 rounded-xl border border-stone-200/80 bg-white/70 px-3 py-2 text-xs text-stone-500 dark:border-stone-700/70 dark:bg-stone-900/60 dark:text-stone-400">
                {details}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">{children}</div>
          </div>
        </div>
      </section>
    </main>
  );
}
