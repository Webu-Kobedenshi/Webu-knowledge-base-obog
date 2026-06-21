import { Badge } from "@/components/atoms/badge";
import { ChevronRightIcon, CrownIcon } from "@/components/atoms/icons";
import { ToastOnMount } from "@/components/atoms/toast-on-mount";
import { SearchField } from "@/components/molecules/search-field";
import { AccountBadge } from "@/components/organisms/account-badge";
import { AlumniCard } from "@/components/organisms/alumni-card";
import { AlumniCardSkeleton } from "@/components/organisms/alumni-card-skeleton";
import type { AlumniListItem, AlumniListSort, MyAccountProfile } from "@/graphql/types";
import Link from "next/link";
import type { ReactNode } from "react";

type AlumniListTemplateProps = {
  alumni: AlumniListItem[];
  initialDepartment: string;
  initialCompany: string;
  initialGraduationYear: string;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  sort: AlumniListSort;
  hasNextPage: boolean;
  account: MyAccountProfile;
  error?: string;
};

const publishButtonClassName =
  "metallic-publish-button inline-flex h-10 w-full items-center justify-center px-4 text-xs font-bold transition-all duration-200 active:scale-[0.98] sm:ml-auto sm:h-9 sm:w-auto sm:min-w-[10.75rem]";

type PodiumRank = 1 | 2 | 3;

type PodiumEntry = {
  alumni: AlumniListItem;
  rank: PodiumRank;
};

const podiumTheme: Record<
  PodiumRank,
  {
    crownClassName: string;
    blockClassName: string;
    heightClassName: string;
    scaleClassName: string;
  }
> = {
  1: {
    crownClassName: "bg-amber-100 text-amber-600 ring-amber-200",
    blockClassName: "from-amber-200 via-amber-100 to-amber-50 text-amber-800",
    heightClassName: "h-28",
    scaleClassName: "md:origin-top md:scale-105",
  },
  2: {
    crownClassName: "bg-slate-100 text-slate-500 ring-slate-200",
    blockClassName: "from-slate-200 via-slate-100 to-slate-50 text-slate-700",
    heightClassName: "h-20",
    scaleClassName: "",
  },
  3: {
    crownClassName: "bg-orange-100 text-orange-600 ring-orange-200",
    blockClassName: "from-orange-200 via-orange-100 to-orange-50 text-orange-800",
    heightClassName: "h-16",
    scaleClassName: "",
  },
};

export function AlumniListTemplate({
  alumni,
  initialDepartment,
  initialCompany,
  initialGraduationYear,
  totalCount,
  currentPage,
  pageSize,
  sort,
  hasNextPage,
  account,
  error,
}: AlumniListTemplateProps) {
  return (
    <AlumniListTemplateFrame
      initialDepartment={initialDepartment}
      initialCompany={initialCompany}
      initialGraduationYear={initialGraduationYear}
      pageSize={pageSize}
      sort={sort}
      account={account}
    >
      <AlumniListResults
        alumni={alumni}
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
    </AlumniListTemplateFrame>
  );
}

type AlumniListTemplateFrameProps = {
  initialDepartment: string;
  initialCompany: string;
  initialGraduationYear: string;
  pageSize: number;
  sort: AlumniListSort;
  account: MyAccountProfile;
  children: ReactNode;
};

export function AlumniListTemplateFrame({
  initialDepartment,
  initialCompany,
  initialGraduationYear,
  pageSize,
  sort,
  account,
  children,
}: AlumniListTemplateFrameProps) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[1400px] px-3 py-4 sm:px-4 sm:py-6 md:px-8 md:py-8">
      <header className="liquid-glass-strong rounded-2xl p-4 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" />
              <p className="text-[11px] font-semibold tracking-[0.12em] text-violet-600 dark:text-violet-400">
                We部運営
              </p>
            </div>
            <h1 className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-2.5">
              <span className="bg-gradient-to-br from-violet-600 to-fuchsia-600 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent md:text-3xl dark:from-violet-400 dark:to-fuchsia-400">
                We部ナレッジベース
              </span>
              <span className="text-sm font-bold tracking-wider text-stone-500 dark:text-stone-400 sm:mb-0.5">
                (ver.就活)
              </span>
            </h1>
            <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-stone-500 dark:text-stone-400">
              あの企業に就職した先輩に話が聞けるかも！？
            </p>
          </div>
          <div className="hidden lg:block">
            <AccountBadge account={account} />
          </div>
        </div>
        <Link
          href="/account"
          className="mt-4 flex items-center justify-between rounded-xl border border-stone-200/80 bg-white/70 px-3 py-2 text-left shadow-sm transition-colors hover:bg-violet-50/60 dark:border-stone-700/60 dark:bg-stone-900/50 dark:hover:bg-violet-900/20 lg:hidden"
          aria-label="マイページへ移動"
        >
          <span className="flex min-w-0 items-center gap-2.5">
            {account.avatarUrl ? (
              <img
                src={account.avatarUrl}
                alt="プロフィール画像"
                className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-stone-200/80 dark:ring-stone-700/70"
              />
            ) : (
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xs font-bold text-white">
                {(account.name || account.email || "U").slice(0, 1).toUpperCase()}
              </span>
            )}
            <span className="min-w-0">
              <span className="block truncate text-[12px] font-bold text-stone-800 dark:text-stone-200">
                {account.name}
              </span>
              <span className="block text-[10px] font-semibold text-stone-500 dark:text-stone-400">
                マイページ
              </span>
            </span>
          </span>
          <ChevronRightIcon
            size={16}
            strokeWidth={2.5}
            className="shrink-0 text-stone-400"
            title="マイページへ"
          />
        </Link>
      </header>

      <section className="mt-4">
        <SearchField
          initialDepartment={initialDepartment}
          initialCompany={initialCompany}
          initialGraduationYear={initialGraduationYear}
          initialPageSize={pageSize}
          initialSort={sort}
        />
      </section>

      {children}
    </main>
  );
}

type AlumniListResultsProps = {
  alumni: AlumniListItem[];
  initialDepartment: string;
  initialCompany: string;
  initialGraduationYear: string;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  sort: AlumniListSort;
  hasNextPage: boolean;
  account: MyAccountProfile;
  error?: string;
};

export function AlumniListResults({
  alumni,
  initialDepartment,
  initialCompany,
  initialGraduationYear,
  totalCount,
  currentPage,
  pageSize,
  sort,
  hasNextPage,
  account,
  error,
}: AlumniListResultsProps) {
  const isHelpfulSort = sort === "HELPFUL";
  const shouldShowPodium = isHelpfulSort && currentPage === 1 && alumni.length > 0;
  const podiumItems: PodiumEntry[] = shouldShowPodium
    ? alumni.slice(0, 3).map((item, index) => ({
        alumni: item,
        rank: (index + 1) as PodiumRank,
      }))
    : [];
  const listItems = shouldShowPodium ? alumni.slice(3) : alumni;
  const hasPrevPage = currentPage > 1;
  const hasFirstPage = currentPage > 1;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const hasLastPage = currentPage < totalPages;
  const paginationButtonClassName =
    "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200/80 bg-white/80 text-stone-600 transition-all hover:bg-stone-50 hover:text-stone-900 active:scale-95 dark:border-stone-700/60 dark:bg-stone-900/60 dark:text-stone-400 dark:hover:bg-stone-800/80 dark:hover:text-stone-200";
  const paginationDisabledClassName =
    "inline-flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-xl border border-stone-200/50 text-stone-300 dark:border-stone-800/50 dark:text-stone-700";

  const buildPageHref = (page: number) => {
    const query = new URLSearchParams();
    if (initialDepartment) {
      query.set("department", initialDepartment);
    }
    if (initialCompany) {
      query.set("company", initialCompany);
    }
    if (initialGraduationYear) {
      query.set("graduationYear", initialGraduationYear);
    }
    if (pageSize !== 12) {
      query.set("pageSize", String(pageSize));
    }
    if (isHelpfulSort) {
      query.set("sort", "helpful");
    }
    if (page > 1) {
      query.set("page", String(page));
    }

    const serialized = query.toString();
    return serialized ? `/?${serialized}` : "/";
  };
  const buildSortHref = (nextSort: AlumniListSort) => {
    const query = new URLSearchParams();
    if (initialDepartment) {
      query.set("department", initialDepartment);
    }
    if (initialCompany) {
      query.set("company", initialCompany);
    }
    if (initialGraduationYear) {
      query.set("graduationYear", initialGraduationYear);
    }
    if (pageSize !== 12) {
      query.set("pageSize", String(pageSize));
    }
    if (nextSort === "HELPFUL") {
      query.set("sort", "helpful");
    }

    const serialized = query.toString();
    return serialized ? `/?${serialized}` : "/";
  };
  const currentListHref = buildPageHref(currentPage);

  return (
    <>
      <section className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-[13px] font-medium text-stone-600 dark:text-stone-400">
            <span className="tabular-nums font-semibold text-stone-900 dark:text-stone-200">
              {totalCount}
            </span>
            <span>件</span>
          </div>
          <div className="h-3.5 w-px bg-stone-200 dark:bg-stone-700" />
          <div
            className={`inline-flex items-center gap-1 rounded-full border bg-white/80 p-1 shadow-sm dark:bg-stone-900/60 ${
              isHelpfulSort
                ? "helpful-sort-control border-rose-200/80 dark:border-rose-900/50"
                : "border-stone-200/80 dark:border-stone-700/60"
            }`}
            aria-label="並び順"
          >
            <Link
              href={buildSortHref("DEFAULT")}
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors ${
                !isHelpfulSort
                  ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950"
                  : "text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
              }`}
            >
              通常順
            </Link>
            <Link
              href={buildSortHref("HELPFUL")}
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors ${
                isHelpfulSort
                  ? "bg-rose-500 text-white shadow-sm shadow-rose-500/25"
                  : "text-stone-500 hover:bg-rose-50 hover:text-rose-600 dark:text-stone-400 dark:hover:bg-rose-950/30 dark:hover:text-rose-300"
              }`}
            >
              役に立った順
            </Link>
          </div>
          {isHelpfulSort ? <Badge variant="default">感謝が多い投稿から表示中</Badge> : null}
          {initialDepartment ? (
            <Badge variant="default">学科で絞り込み中</Badge>
          ) : (
            <Badge variant="secondary">全学科</Badge>
          )}
          {initialGraduationYear ? (
            <Badge variant="default">卒業年度: {initialGraduationYear}</Badge>
          ) : null}
          {initialCompany ? <Badge variant="default">企業: {initialCompany}</Badge> : null}
        </div>
        {account.role !== "ADMIN" ? (
          <Link href="/account/public" className={publishButtonClassName}>
            <span className="relative z-10">内定先を公開する</span>
          </Link>
        ) : null}
      </section>

      {error ? <ToastOnMount variant="error" message={error} /> : null}

      {podiumItems.length > 0 ? (
        <HelpfulPodium entries={podiumItems} returnTo={currentListHref} />
      ) : null}

      <section
        className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${
          podiumItems.length > 0 ? "mt-7" : "mt-5"
        } ${isHelpfulSort ? "helpful-sort-list" : ""}`}
      >
        {listItems.length > 0 ? (
          listItems.map((item, index) => {
            const listIndex = index + podiumItems.length;

            return (
              <div
                key={item.id}
                className={isHelpfulSort ? "helpful-sort-card" : ""}
                style={
                  isHelpfulSort
                    ? { animationDelay: `${Math.min(listIndex, 11) * 45}ms` }
                    : undefined
                }
              >
                <AlumniCard
                  alumni={item}
                  returnTo={currentListHref}
                  highlightHelpful={isHelpfulSort}
                />
              </div>
            );
          })
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300/80 py-16 dark:border-stone-700/60">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800" />
            <p className="mt-4 text-[13px] font-medium text-stone-600 dark:text-stone-400">
              条件に一致するOB/OGが見つかりませんでした
            </p>
            <p className="mt-1 text-[12px] text-stone-400 dark:text-stone-500">
              学科フィルタを解除するか、検索条件を変えてお試しください
            </p>
          </div>
        )}
      </section>

      {totalCount > 0 && (
        <section className="mt-8 flex items-center justify-center gap-1.5">
          {hasFirstPage ? (
            <Link
              href={buildPageHref(1)}
              className={paginationButtonClassName}
              aria-label="最初のページ"
            >
              <span>«</span>
            </Link>
          ) : (
            <span className={paginationDisabledClassName}>«</span>
          )}

          {hasPrevPage ? (
            <Link
              href={buildPageHref(currentPage - 1)}
              className={paginationButtonClassName}
              aria-label="前のページ"
            >
              <span>‹</span>
            </Link>
          ) : (
            <span className={paginationDisabledClassName}>‹</span>
          )}

          <span className="px-3 text-[13px] tabular-nums text-stone-600 dark:text-stone-400">
            <span className="font-semibold text-stone-900 dark:text-stone-200">{currentPage}</span>
            <span className="mx-1 text-stone-300 dark:text-stone-600">/</span>
            <span>{totalPages}</span>
          </span>

          {hasNextPage ? (
            <Link
              href={buildPageHref(currentPage + 1)}
              className={paginationButtonClassName}
              aria-label="次のページ"
            >
              <span>›</span>
            </Link>
          ) : (
            <span className={paginationDisabledClassName}>›</span>
          )}

          {hasLastPage ? (
            <Link
              href={buildPageHref(totalPages)}
              className={paginationButtonClassName}
              aria-label="最後のページ"
            >
              <span>»</span>
            </Link>
          ) : (
            <span className={paginationDisabledClassName}>»</span>
          )}
        </section>
      )}
    </>
  );
}

function HelpfulPodium({ entries, returnTo }: { entries: PodiumEntry[]; returnTo: string }) {
  const entryByRank = new Map(entries.map((entry) => [entry.rank, entry]));
  const orderedEntries = [2, 1, 3]
    .map((rank) => entryByRank.get(rank as PodiumRank))
    .filter((entry): entry is PodiumEntry => Boolean(entry));
  const mobileEntries = [1, 2, 3]
    .map((rank) => entryByRank.get(rank as PodiumRank))
    .filter((entry): entry is PodiumEntry => Boolean(entry));

  return (
    <section className="relative mt-6 overflow-hidden rounded-3xl border border-amber-100/80 bg-gradient-to-b from-amber-50 via-white to-stone-50 px-4 pb-5 pt-12 shadow-lg shadow-amber-100/50 dark:border-amber-900/30 dark:from-amber-950/20 dark:via-stone-950 dark:to-stone-950 dark:shadow-black/20">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-3 h-10 w-[78%] -translate-x-1/2 rounded-b-[100%] border-t-2 border-amber-200/80 dark:border-amber-700/50" />
        {Array.from({ length: 9 }, (_, index) => (
          <span
            key={`podium-flag-${index + 1}`}
            className="absolute top-4 h-0 w-0 border-x-[5px] border-t-[8px] border-x-transparent border-t-amber-300/90 dark:border-t-amber-600/80"
            style={{
              left: `${11 + index * 9.5}%`,
              transform: `rotate(${index % 2 === 0 ? -9 : 8}deg)`,
            }}
          />
        ))}
        <span className="absolute left-[9%] top-14 h-2 w-2 rounded-full bg-amber-300/70" />
        <span className="absolute left-[18%] top-8 text-sm text-amber-300/80">✦</span>
        <span className="absolute right-[14%] top-12 h-2.5 w-2.5 rounded-full bg-rose-300/60" />
        <span className="absolute right-[22%] top-7 text-sm text-amber-300/80">✦</span>
        <span className="absolute left-[46%] top-6 h-1.5 w-1.5 rounded-full bg-stone-300/70" />
      </div>

      <div className="relative z-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-lg font-extrabold text-stone-900 dark:text-stone-100">
              感謝が集まった投稿
            </h2>
          </div>
          <p className="max-w-xs text-[12px] font-medium leading-relaxed text-stone-500 dark:text-stone-400">
            後輩の役に立った声が多い順に、上位3件を表彰しています。
          </p>
        </div>

        <div className="space-y-4 lg:hidden">
          {mobileEntries.map((entry) => (
            <HelpfulPodiumMobileItem key={entry.alumni.id} entry={entry} returnTo={returnTo} />
          ))}
        </div>

        <div className="hidden lg:block">
          <div className="grid grid-cols-3 items-end gap-4">
            {orderedEntries.map((entry) => (
              <HelpfulPodiumColumn key={entry.alumni.id} entry={entry} returnTo={returnTo} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HelpfulPodiumMobileItem({ entry, returnTo }: { entry: PodiumEntry; returnTo: string }) {
  const theme = podiumTheme[entry.rank];

  return (
    <div className="rounded-2xl border border-white/80 bg-white/70 p-3 shadow-sm dark:border-white/10 dark:bg-stone-950/60">
      <div
        className={`mb-3 flex items-center justify-between rounded-xl bg-gradient-to-r px-3 py-2 ${theme.blockClassName}`}
      >
        <span className="inline-flex items-center gap-2 text-sm font-black">
          <CrownIcon size={18} strokeWidth={2.5} title={`${entry.rank}位`} />
          {entry.rank}位
        </span>
        <span className="text-[11px] font-bold opacity-80">感謝ランキング</span>
      </div>
      <AlumniCard alumni={entry.alumni} returnTo={returnTo} highlightHelpful />
    </div>
  );
}

function HelpfulPodiumColumn({ entry, returnTo }: { entry: PodiumEntry; returnTo: string }) {
  const theme = podiumTheme[entry.rank];
  const cardBottomGapClassName = entry.rank === 1 ? "mb-8" : "mb-3";

  return (
    <div className={`flex flex-col items-center ${entry.rank === 1 ? "z-10 col-start-2" : "z-0"}`}>
      <span
        className={`mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full ring-1 ${theme.crownClassName} shadow-md`}
      >
        <CrownIcon size={20} strokeWidth={2.5} title={`${entry.rank}位`} />
      </span>
      <div
        className={`relative w-full max-w-[20rem] transition-transform ${theme.scaleClassName} ${cardBottomGapClassName}`}
      >
        <AlumniCard alumni={entry.alumni} returnTo={returnTo} highlightHelpful />
      </div>

      <div
        className={`flex w-full max-w-64 flex-col items-center justify-center rounded-t-2xl border border-white/70 bg-gradient-to-b px-4 shadow-lg shadow-stone-900/10 dark:border-white/10 ${theme.blockClassName} ${theme.heightClassName}`}
      >
        <span className="text-3xl font-black tabular-nums">{entry.rank}位</span>
      </div>
    </div>
  );
}

type AlumniListResultsSkeletonProps = {
  initialDepartment: string;
  initialCompany: string;
  initialGraduationYear: string;
  pageSize: number;
  sort: AlumniListSort;
  account: MyAccountProfile;
};

export function AlumniListResultsSkeleton({
  initialDepartment,
  initialCompany,
  initialGraduationYear,
  pageSize,
  sort,
  account,
}: AlumniListResultsSkeletonProps) {
  const isHelpfulSort = sort === "HELPFUL";
  const skeletonKeys = Array.from(
    { length: pageSize },
    (_, index) => `alumni-card-skeleton-${index + 1}`,
  );

  return (
    <>
      <section className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-[13px] font-medium text-stone-600 dark:text-stone-400">
            <div className="h-5 w-12 animate-pulse rounded bg-stone-200/80 dark:bg-stone-800/80" />
            <span>件</span>
          </div>
          <div className="h-3.5 w-px bg-stone-200 dark:bg-stone-700" />
          {isHelpfulSort ? <Badge variant="default">感謝が多い投稿から表示中</Badge> : null}
          {initialDepartment ? (
            <Badge variant="default">学科で絞り込み中</Badge>
          ) : (
            <Badge variant="secondary">全学科</Badge>
          )}
          {initialGraduationYear ? (
            <Badge variant="default">卒業年度: {initialGraduationYear}</Badge>
          ) : null}
          {initialCompany ? <Badge variant="default">企業: {initialCompany}</Badge> : null}
        </div>
        {account.role !== "ADMIN" ? (
          <Link href="/account/public" className={publishButtonClassName}>
            <span className="relative z-10">内定先を公開する</span>
          </Link>
        ) : null}
      </section>

      <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {skeletonKeys.map((skeletonKey) => (
          <AlumniCardSkeleton key={skeletonKey} />
        ))}
      </section>
    </>
  );
}
