import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-stone-200/80 dark:bg-stone-800/80", className)}
      {...props}
    />
  );
}
