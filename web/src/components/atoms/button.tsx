import { Button as ShadcnButton } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { ComponentProps } from "react";

type ButtonProps = ComponentProps<typeof ShadcnButton>;

const variantClass: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default:
    "rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 dark:from-violet-500 dark:to-fuchsia-500 dark:hover:from-violet-400 dark:hover:to-fuchsia-400",
  destructive:
    "rounded-xl border border-rose-200 bg-transparent text-rose-600 hover:bg-rose-50 dark:border-rose-800/50 dark:text-rose-400 dark:hover:bg-rose-900/20",
  outline:
    "rounded-xl border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900/60 dark:text-stone-300 dark:hover:bg-stone-800",
  secondary:
    "rounded-xl bg-stone-200 text-stone-800 hover:bg-stone-300 dark:bg-stone-700 dark:text-stone-100 dark:hover:bg-stone-600",
  ghost:
    "rounded-xl bg-transparent text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100",
  link: "h-auto rounded-none p-0 text-violet-600 hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-300",
};

export function Button({ className, variant = "default", type = "button", ...props }: ButtonProps) {
  const buttonVariant = variant ?? "default";

  return (
    <ShadcnButton
      variant={buttonVariant}
      type={type}
      className={cn(
        "transition-all duration-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60",
        variantClass[buttonVariant],
        className,
      )}
      {...props}
    />
  );
}
