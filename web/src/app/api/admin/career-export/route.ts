import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

type CareerExportRow = {
  studentId: string | null;
  fullName: string | null;
  department: string;
  graduationYear: number;
  companyName: string;
  companyMotivation: string | null;
  activityPeriod: string | null;
  gakuchika: string | null;
};

type GraphQlResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

const exportQuery = `
  query GetCareerExportRows {
    getCareerExportRows {
      studentId
      fullName
      department
      graduationYear
      companyName
      companyMotivation
      activityPeriod
      gakuchika
    }
  }
`;

const activityPeriodLabel: Record<string, string> = {
  FIRST_YEAR_FIRST_HALF: "1年前期",
  FIRST_YEAR_SECOND_HALF: "1年後期",
  SECOND_YEAR_FIRST_HALF: "2年前期",
  SUMMER_BREAK: "夏休み",
  PRE_GRADUATION_AUTUMN: "卒業前年秋",
  OTHER: "その他",
};

function toExportFileName() {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `career-export-${yyyy}${mm}${dd}.xlsx`;
}

async function executeGraphql<T>(serviceToken: string, query: string, variables?: unknown) {
  const endpoint = process.env.GRAPHQL_ENDPOINT ?? "http://localhost:4000/graphql";
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${serviceToken}`,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  return (await response.json()) as GraphQlResponse<T>;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const serviceToken = session?.serviceToken;

  if (!serviceToken || session.user?.role !== "ADMIN") {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const result = await executeGraphql<{ getCareerExportRows: CareerExportRow[] }>(
    serviceToken,
    exportQuery,
  );

  if (result.errors?.length || !result.data) {
    return NextResponse.json(
      {
        ok: false,
        message: result.errors?.map((item) => item.message).join(", ") || "Career export failed",
      },
      { status: 400 },
    );
  }

  const rows = result.data.getCareerExportRows.map((row) => ({
    学籍番号: row.studentId ?? "",
    本名: row.fullName ?? "",
    学科: row.department,
    卒業年度: row.graduationYear,
    内定先: row.companyName,
    なぜこの会社を選んだか: row.companyMotivation ?? "",
    始めた就活時期: row.activityPeriod
      ? (activityPeriodLabel[row.activityPeriod] ?? row.activityPeriod)
      : "",
    ガクチカ: row.gakuchika ?? "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: [
      "学籍番号",
      "本名",
      "学科",
      "卒業年度",
      "内定先",
      "なぜこの会社を選んだか",
      "始めた就活時期",
      "ガクチカ",
    ],
  });
  worksheet["!cols"] = [
    { wch: 14 },
    { wch: 18 },
    { wch: 22 },
    { wch: 10 },
    { wch: 24 },
    { wch: 36 },
    { wch: 16 },
    { wch: 36 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "就活情報");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
  const fileName = toExportFileName();

  return new Response(new Uint8Array(buffer), {
    headers: {
      "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "content-disposition": `attachment; filename="${fileName}"`,
      "cache-control": "no-store",
    },
  });
}
