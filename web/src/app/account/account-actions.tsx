"use client";

import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { showErrorToast } from "@/components/atoms/toast";
import { LogoutButton } from "@/components/molecules/logout-button";
import { signOut } from "next-auth/react";
import { useState } from "react";

export function AccountActions() {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("本当にアカウントを削除しますか？この操作は元に戻せません。")) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch("/api/account/delete", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("アカウント削除に失敗しました");
      }

      await signOut({ callbackUrl: "/login?accountDeleted=1" });
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : "削除に失敗しました");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="gap-0 border-stone-200/90 bg-white shadow-[0_8px_24px_-18px_rgba(0,0,0,0.25)] dark:border-stone-800/80 dark:bg-stone-900/40">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-200 text-sm dark:bg-stone-700">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-stone-500 dark:text-stone-400"
          >
            <title>アカウント操作</title>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </span>
        <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">アカウント操作</h3>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <LogoutButton className="flex-1" />
        <Button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          variant="destructive"
          className="flex h-10 flex-1 items-center justify-center gap-2 disabled:opacity-50"
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
          >
            <title>アカウント削除</title>
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
          {isDeleting ? "削除中…" : "アカウント削除"}
        </Button>
      </div>
    </Card>
  );
}
