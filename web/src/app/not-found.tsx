import { Button } from "@/components/atoms/button";
import { ErrorPageShell } from "@/components/templates/error-page-shell";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ページが見つかりませんでした | We部ナレッジベース",
};

export default function NotFound() {
  return (
    <ErrorPageShell
      code="404"
      title="ページが見つかりませんでした"
      description="URLが変更されたか、公開されていないページにアクセスしている可能性があります。一覧に戻って、もう一度探してみてください。"
    >
      <Button asChild className="h-10 px-5 text-sm font-semibold">
        <Link href="/">一覧に戻る</Link>
      </Button>
    </ErrorPageShell>
  );
}
