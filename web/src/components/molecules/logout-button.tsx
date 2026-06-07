"use client";

import { Button } from "@/components/atoms/button";
import { LogOutIcon } from "@/components/atoms/icons";
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
      <LogOutIcon size={15} className="shrink-0" title="ログアウト" />
      {variant === "default" && "ログアウト"}
    </Button>
  );
}
