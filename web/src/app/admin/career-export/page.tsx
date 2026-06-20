import { authOptions } from "@/auth";
import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function CareerExportPage() {
  const session = await getServerSession(authOptions);

  if (!session?.serviceToken || session.user?.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 text-stone-900 dark:bg-stone-950 dark:text-stone-50">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <p className="text-sm font-medium text-violet-600 dark:text-violet-300">Admin</p>
          <h1 className="text-3xl font-bold">就活情報 Excel 出力</h1>
        </header>

        <Card className="rounded-lg border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="flex flex-col gap-5">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">出力内容</h2>
              <p className="text-sm leading-6 text-stone-600 dark:text-stone-300">
                学籍番号、本名、学科、卒業年度、内定先、会社を選んだ理由、始めた就活時期、ガクチカを
                1学生 x 1企業の行で出力します。
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href="/api/admin/career-export">Excelをダウンロード</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/admin/career-import">アップロード画面へ</Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
