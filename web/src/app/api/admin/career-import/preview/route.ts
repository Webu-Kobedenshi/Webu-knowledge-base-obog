import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const requiredHeaders = [
  "学籍番号",
  "本名",
  "学科",
  "卒業年度",
  "内定先",
  "なぜこの会社を選んだか",
  "始めた就活時期",
  "ガクチカ",
] as const;

const optionalHeaders = ["メールアドレス", "備考", "公開同意"] as const;

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

type GraphQlResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

const previewMutation = `
  mutation PreviewCareerExcelImport($input: CareerExcelImportPreviewInput!) {
    previewCareerExcelImport(input: $input) {
      batchId
      fileName
      totalCount
      validCount
      errorCount
      pendingCount
      overwriteCount
      rows {
        id
        rowNumber
        status
        errors
        studentId
        fullName
        department
        graduationYear
        companyName
        companyMotivation
        activityPeriod
        gakuchika
        matchedUserId
        matchedAlumniProfileId
        willOverwrite
      }
    }
  }
`;

function toCellText(value: unknown): string {
  return String(value ?? "").trim();
}

function headerIndex(headers: string[], header: string): number {
  return headers.findIndex((item) => item === header);
}

async function executeGraphql<T>(serviceToken: string, query: string, variables: unknown) {
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

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const serviceToken = session?.serviceToken;

  if (!serviceToken || session.user?.role !== "ADMIN") {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, message: "file is required" }, { status: 400 });
  }

  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    return NextResponse.json({ ok: false, message: ".xlsx file is required" }, { status: 400 });
  }

  if (file.size <= 0 || file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { ok: false, message: "file size must be between 1 byte and 5 MB" },
      { status: 400 },
    );
  }

  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    return NextResponse.json({ ok: false, message: "sheet is required" }, { status: 400 });
  }

  const sheet = workbook.Sheets[firstSheetName];
  const table = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    blankrows: false,
    defval: "",
  });
  const headers = (table[0] ?? []).map(toCellText);
  const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header));
  if (missingHeaders.length > 0) {
    return NextResponse.json(
      { ok: false, message: `missing headers: ${missingHeaders.join(", ")}` },
      { status: 400 },
    );
  }

  const rows = table.slice(1).map((row, index) => ({
    rowNumber: index + 2,
    studentId: toCellText(row[headerIndex(headers, "学籍番号")]),
    fullName: toCellText(row[headerIndex(headers, "本名")]),
    department: toCellText(row[headerIndex(headers, "学科")]),
    graduationYear: toCellText(row[headerIndex(headers, "卒業年度")]),
    companyName: toCellText(row[headerIndex(headers, "内定先")]),
    companyMotivation: toCellText(row[headerIndex(headers, "なぜこの会社を選んだか")]),
    activityPeriod: toCellText(row[headerIndex(headers, "始めた就活時期")]),
    gakuchika: toCellText(row[headerIndex(headers, "ガクチカ")]),
    email: toCellText(row[headerIndex(headers, "メールアドレス")]),
    remarks: toCellText(row[headerIndex(headers, "備考")]),
    consent: toCellText(row[headerIndex(headers, "公開同意")]),
  }));

  if (rows.length === 0) {
    return NextResponse.json({ ok: false, message: "data rows are required" }, { status: 400 });
  }

  const result = await executeGraphql<{ previewCareerExcelImport: CareerImportPreview }>(
    serviceToken,
    previewMutation,
    {
      input: {
        fileName: file.name,
        rows: rows.map((row) => {
          const optional = Object.fromEntries(
            optionalHeaders.map((header) => {
              const key =
                header === "メールアドレス" ? "email" : header === "備考" ? "remarks" : "consent";
              return [key, row[key as "email" | "remarks" | "consent"] || null];
            }),
          );

          return {
            ...row,
            ...optional,
          };
        }),
      },
    },
  );

  if (result.errors?.length || !result.data?.previewCareerExcelImport) {
    return NextResponse.json(
      {
        ok: false,
        message:
          result.errors?.map((item) => item.message).join(", ") || "Career import preview failed",
      },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true, preview: result.data.previewCareerExcelImport });
}
