"use client";

import { Button } from "@/components/atoms/button";
import { showErrorToast, showSuccessToast } from "@/components/atoms/toast";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { LoginButtonContent, LoginPageContent } from "./login-page-content";

const googleAuthorizationParams = {
  prompt: "select_account",
};

export function LoginPageClient() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const error = searchParams.get("error");
  const accountDeleted = searchParams.get("accountDeleted");
  const notifiedKeyRef = useRef<string | null>(null);

  const errorMessage =
    error === "OAuthSignin"
      ? "Google OAuth設定が不足しています。GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET を設定してください。"
      : error === "AccessDenied"
        ? "このGoogleアカウントではログインできません。在校生は学校アカウント、卒業生は登録済みGmail、管理者は許可済みアカウントを選んでください。"
        : null;

  useEffect(() => {
    const notifyKey = `${errorMessage ?? ""}:${accountDeleted ?? ""}`;
    if (notifiedKeyRef.current === notifyKey) {
      return;
    }

    if (errorMessage) {
      showErrorToast(errorMessage);
    }

    if (accountDeleted) {
      showSuccessToast("アカウントを削除しました。");
    }

    notifiedKeyRef.current = notifyKey;
  }, [errorMessage, accountDeleted]);

  return (
    <LoginPageContent
      loginButton={
        <Button
          type="button"
          className="mt-6 h-12 w-full bg-zinc-950 text-base text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
          onClick={() => signIn("google", { callbackUrl }, googleAuthorizationParams)}
        >
          <LoginButtonContent />
        </Button>
      }
    />
  );
}
