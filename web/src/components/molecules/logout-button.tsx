"use client";

import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/cn";
import { signOut } from "next-auth/react";

type LogoutButtonProps = {
  className?: string;
  variant?: "default" | "icon";
};

export function LogoutButton({ className, variant = "default" }: LogoutButtonProps) {
  return (
    <Button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      variant="outline"
      className={cn("flex h-10 items-center justify-center gap-2", className)}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0"
      >
        <title>ログアウト</title>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      {variant === "default" && "ログアウト"}
    </Button>
  );
}
