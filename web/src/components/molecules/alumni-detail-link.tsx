"use client";

import { ChevronRightIcon, LoaderCircleIcon } from "@/components/atoms/icons";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type AlumniDetailLinkProps = {
  href: string;
  className?: string;
};

export function AlumniDetailLink({ href, className }: AlumniDetailLinkProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isNavigating, setIsNavigating] = useState(false);

  const isLoading = isPending || isNavigating;

  return (
    <Link
      href={href}
      aria-busy={isLoading}
      aria-disabled={isLoading}
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-semibold text-violet-600 transition-colors hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-300",
        isLoading && "pointer-events-none opacity-70",
        className,
      )}
      onClick={(event) => {
        if (
          isLoading ||
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }

        event.preventDefault();
        setIsNavigating(true);
        startTransition(() => {
          router.push(href);
        });
      }}
    >
      <span>{isLoading ? "読み込み中" : "詳しく見る"}</span>
      {isLoading ? (
        <LoaderCircleIcon className="size-3 animate-spin" aria-hidden="true" />
      ) : (
        <ChevronRightIcon size={12} strokeWidth={2.5} aria-hidden="true" />
      )}
    </Link>
  );
}
