import { Skeleton } from "@/components/atoms/skeleton";

export function AlumniCardSkeleton() {
  return (
    <article className="overflow-hidden rounded-3xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-950">
      <div className="relative h-24 overflow-hidden bg-gradient-to-br from-violet-200/70 via-sky-200/60 to-cyan-200/70 dark:from-violet-950/40 dark:via-sky-950/30 dark:to-cyan-950/40">
        <Skeleton className="absolute left-3 top-3 h-5 w-24 rounded-full bg-white/70 dark:bg-white/10" />
        <Skeleton className="absolute right-3 top-3 h-5 w-18 rounded-full bg-black/10 dark:bg-white/10" />
      </div>

      <div className="relative z-10 -mt-8 px-4">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-16 w-16 rounded-xl border-[3px] border-white shadow-lg dark:border-stone-900" />
          <div className="flex min-w-0 flex-1 justify-end pt-10">
            <div className="flex max-w-full flex-col items-start gap-1">
              <Skeleton className="h-2.5 w-14" />
              <div className="flex gap-1">
                <Skeleton className="h-5 w-12 rounded-md" />
                <Skeleton className="h-5 w-10 rounded-md" />
                <Skeleton className="h-5 w-11 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-3 pt-2">
        <div className="flex items-baseline gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-14" />
        </div>

        <div className="mt-2 space-y-2">
          <Skeleton className="h-8 w-4/5" />
          <Skeleton className="h-8 w-3/5" />
        </div>

        <div className="mt-3 space-y-2 border-l-2 border-stone-200 pl-2.5 dark:border-stone-700">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-11/12" />
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-3 rounded-full" />
        </div>

        <div className="mt-auto pt-3">
          <Skeleton className="mb-2 h-2.5 w-16" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-10 rounded-xl" />
            <Skeleton className="h-10 rounded-xl" />
          </div>
        </div>
      </div>
    </article>
  );
}
