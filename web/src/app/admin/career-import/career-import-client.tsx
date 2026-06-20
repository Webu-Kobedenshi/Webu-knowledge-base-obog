"use client";

import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { useMemo, useState } from "react";

type CareerImportPreviewRow = {
  id: string;
  rowNumber: number;
  status: "VALID" | "ERROR" | "PENDING_USER";
  errors: string[];
  studentId: string | null;
  fullName: string | null;
  department: string | null;
  graduationYear: number | null;
  companyName: string | null;
  companyMotivation: string | null;
  activityPeriod: string | null;
  gakuchika: string | null;
  matchedUserId: string | null;
  matchedAlumniProfileId: string | null;
  willOverwrite: boolean;
};

type CareerImportPreview = {
  batchId: string;
  fileName: string;
  totalCount: number;
  validCount: number;
  errorCount: number;
  pendingCount: number;
  overwriteCount: number;
  rows: CareerImportPreviewRow[];
};

type CareerImportResult = {
  batchId: string;
  totalCount: number;
  appliedCount: number;
  skippedCount: number;
  pendingCount: number;
  errorCount: number;
};

type ApiResponse<T> =
  | ({
      ok: true;
    } & T)
  | {
      ok: false;
      message: string;
    };

const statusLabel: Record<CareerImportPreviewRow["status"], string> = {
  VALID: "反映対象",
  ERROR: "エラー",
  PENDING_USER: "User未作成",
};

const statusClass: Record<CareerImportPreviewRow["status"], string> = {
  VALID: "border-emerald-200 bg-emerald-50 text-emerald-700",
  ERROR: "border-rose-200 bg-rose-50 text-rose-700",
  PENDING_USER: "border-amber-200 bg-amber-50 text-amber-700",
};

export function CareerImportClient() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CareerImportPreview | null>(null);
  const [result, setResult] = useState<CareerImportResult | null>(null);
  const [message, setMessage] = useState("");
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const canConfirm = useMemo(
    () => Boolean(preview && preview.validCount > 0 && !result),
    [preview, result],
  );

  async function handlePreview() {
    if (!file) {
      setMessage("Excelファイルを選択してください。");
      return;
    }

    setIsPreviewing(true);
    setMessage("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/admin/career-import/preview", {
      method: "POST",
      body: formData,
    });
    const json = (await response.json()) as ApiResponse<{ preview: CareerImportPreview }>;

    if (!json.ok) {
      setPreview(null);
      setMessage(json.message);
      setIsPreviewing(false);
      return;
    }

    setPreview(json.preview);
    setIsPreviewing(false);
  }

  async function handleConfirm() {
    if (!preview) return;

    setIsConfirming(true);
    setMessage("");

    const response = await fetch("/api/admin/career-import/confirm", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ batchId: preview.batchId }),
    });
    const json = (await response.json()) as ApiResponse<{ result: CareerImportResult }>;

    if (!json.ok) {
      setMessage(json.message);
      setIsConfirming(false);
      return;
    }

    setResult(json.result);
    setIsConfirming(false);
  }

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 text-stone-900 dark:bg-stone-950 dark:text-stone-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <p className="text-sm font-medium text-violet-600 dark:text-violet-300">Admin</p>
          <h1 className="text-3xl font-bold">就活情報 Excel アップロード</h1>
        </header>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="rounded-lg border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-2 text-sm font-medium">
                Excel ファイル
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={(event) => {
                    setFile(event.target.files?.[0] ?? null);
                    setPreview(null);
                    setResult(null);
                    setMessage("");
                  }}
                  className="h-11 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-stone-100 file:px-3 file:py-1.5 file:text-sm file:font-medium hover:border-stone-300 dark:border-stone-700 dark:bg-stone-950 dark:file:bg-stone-800"
                />
              </label>

              <div className="flex flex-wrap gap-2">
                <Button onClick={handlePreview} disabled={isPreviewing}>
                  {isPreviewing ? "確認中..." : "プレビュー"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleConfirm}
                  disabled={!canConfirm || isConfirming}
                >
                  {isConfirming ? "反映中..." : "反映を確定"}
                </Button>
              </div>

              {message ? (
                <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {message}
                </p>
              ) : null}

              {result ? (
                <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {result.appliedCount}件を反映しました。未反映 {result.skippedCount}件。
                </p>
              ) : null}
            </div>
          </Card>

          <Card className="rounded-lg border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <SummaryItem label="総行数" value={preview?.totalCount ?? 0} />
              <SummaryItem label="反映対象" value={preview?.validCount ?? 0} />
              <SummaryItem label="エラー" value={preview?.errorCount ?? 0} />
              <SummaryItem label="User未作成" value={preview?.pendingCount ?? 0} />
              <SummaryItem label="上書き予定" value={preview?.overwriteCount ?? 0} />
            </dl>
          </Card>
        </section>

        {preview ? (
          <section className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead className="bg-stone-100 text-xs uppercase tracking-wide text-stone-500 dark:bg-stone-800 dark:text-stone-400">
                  <tr>
                    <th className="px-3 py-3">行</th>
                    <th className="px-3 py-3">状態</th>
                    <th className="px-3 py-3">学籍番号</th>
                    <th className="px-3 py-3">本名</th>
                    <th className="px-3 py-3">学科</th>
                    <th className="px-3 py-3">卒業年度</th>
                    <th className="px-3 py-3">内定先</th>
                    <th className="px-3 py-3">エラー</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {preview.rows.map((row) => (
                    <tr key={row.id} className="align-top">
                      <td className="px-3 py-3 font-mono text-xs">{row.rowNumber}</td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex whitespace-nowrap rounded-full border px-2 py-1 text-xs font-medium ${statusClass[row.status]}`}
                        >
                          {statusLabel[row.status]}
                          {row.willOverwrite ? " / 上書き" : ""}
                        </span>
                      </td>
                      <td className="px-3 py-3">{row.studentId ?? "-"}</td>
                      <td className="px-3 py-3">{row.fullName ?? "-"}</td>
                      <td className="px-3 py-3">{row.department ?? "-"}</td>
                      <td className="px-3 py-3">{row.graduationYear ?? "-"}</td>
                      <td className="px-3 py-3">{row.companyName ?? "-"}</td>
                      <td className="max-w-sm px-3 py-3 text-rose-600">
                        {row.errors.length > 0 ? row.errors.join(", ") : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

function SummaryItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-stone-100 bg-stone-50 p-3 dark:border-stone-800 dark:bg-stone-950">
      <dt className="text-xs text-stone-500">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold">{value}</dd>
    </div>
  );
}
