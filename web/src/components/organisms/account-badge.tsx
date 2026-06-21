import { ChevronRightIcon } from "@/components/atoms/icons";
import type { MyAccountProfile } from "@/graphql/types";
import Link from "next/link";

type AccountBadgeProps = {
  account: MyAccountProfile;
};

const roleLabel: Record<MyAccountProfile["role"], string> = {
  STUDENT: "在校生",
  ALUMNI: "卒業生",
  ADMIN: "管理者",
};

export function AccountBadge({ account }: AccountBadgeProps) {
  const initial = (account.name || account.email || "U").slice(0, 1).toUpperCase();

  return (
    <Link
      href="/account"
      className="group inline-flex items-center gap-3 rounded-2xl border border-stone-200/80 bg-white/80 pl-2.5 pr-4 py-2 text-left shadow-sm transition-all hover:border-violet-200 hover:bg-violet-50/50 hover:shadow-md dark:border-stone-700/60 dark:bg-stone-900/60 dark:hover:border-violet-900/50 dark:hover:bg-violet-900/20"
      aria-label="マイページへ移動"
    >
      <div className="flex items-center gap-2.5">
        {account.avatarUrl ? (
          <img
            src={account.avatarUrl}
            alt="プロフィール画像"
            className="h-9 w-9 shrink-0 rounded-full object-cover shadow-sm ring-1 ring-stone-200/80 dark:ring-stone-700/70"
          />
        ) : (
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white shadow-sm">
            {initial}
          </span>
        )}
        <span className="min-w-0">
          <span className="block truncate text-[13px] font-bold text-stone-800 dark:text-stone-200">
            {account.name}
          </span>
          <span className="block text-[11px] font-medium text-stone-500 dark:text-stone-400">
            {roleLabel[account.role]}
          </span>
        </span>
      </div>

      {/* Divider */}
      <div className="h-8 w-px bg-stone-200 dark:bg-stone-700/60" />

      {/* CTA Label & Icon */}
      <div className="flex items-center gap-1 text-stone-400 transition-colors group-hover:text-violet-600 dark:text-stone-500 dark:group-hover:text-violet-400">
        <span className="text-[11px] font-bold">マイページ</span>
        <ChevronRightIcon
          size={16}
          strokeWidth={2.5}
          className="transition-transform group-hover:translate-x-0.5"
          title="マイページへ"
        />
      </div>
    </Link>
  );
}
