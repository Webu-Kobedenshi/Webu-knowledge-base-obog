"use client";

import { cn } from "@/lib/cn";
import { Loader2 } from "lucide-react";
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
        <Loader2 className="size-3 animate-spin" aria-hidden="true" />
      ) : (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      )}
    </Link>
  );
}
