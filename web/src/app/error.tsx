"use client";

import { Button } from "@/components/atoms/button";
import { ErrorPageShell } from "@/components/templates/error-page-shell";
import Link from "next/link";
import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const details =
    process.env.NODE_ENV === "development"
      ? [error.message, error.digest ? `digest: ${error.digest}` : ""].filter(Boolean).join(" / ")
      : undefined;

  return (
    <ErrorPageShell
      code="500"
      title="一時的なエラーが発生しました"
      description="ページの表示中に問題が起きました。再試行しても直らない場合は、少し時間をおいてからアクセスしてください。"
      details={details}
    >
      <Button className="h-10 px-5 text-sm font-semibold" onClick={reset}>
        再試行
      </Button>
      <Button asChild variant="outline" className="h-10 px-5 text-sm font-semibold">
        <Link href="/">一覧に戻る</Link>
      </Button>
    </ErrorPageShell>
  );
}
