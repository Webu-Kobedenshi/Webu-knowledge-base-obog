"use client";

import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { SettingsIcon, Trash2Icon } from "@/components/atoms/icons";
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
          <SettingsIcon
            size={14}
            strokeWidth={2.5}
            className="text-stone-500 dark:text-stone-400"
            title="アカウント操作"
          />
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
          <Trash2Icon size={15} title="アカウント削除" />
          {isDeleting ? "削除中…" : "アカウント削除"}
        </Button>
      </div>
    </Card>
  );
}
