import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

type CareerImportResult = {
  batchId: string;
  totalCount: number;
  appliedCount: number;
  skippedCount: number;
  pendingCount: number;
  errorCount: number;
};

type GraphQlResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

const confirmMutation = `
  mutation ConfirmCareerExcelImport($batchId: ID!) {
    confirmCareerExcelImport(batchId: $batchId) {
      batchId
      totalCount
      appliedCount
      skippedCount
      pendingCount
      errorCount
    }
  }
`;

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

  const body = (await request.json()) as { batchId?: string };
  const batchId = body.batchId?.trim();
  if (!batchId) {
    return NextResponse.json({ ok: false, message: "batchId is required" }, { status: 400 });
  }

  const result = await executeGraphql<{ confirmCareerExcelImport: CareerImportResult }>(
    serviceToken,
    confirmMutation,
    { batchId },
  );

  if (result.errors?.length || !result.data?.confirmCareerExcelImport) {
    return NextResponse.json(
      {
        ok: false,
        message:
          result.errors?.map((item) => item.message).join(", ") || "Career import confirm failed",
      },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true, result: result.data.confirmCareerExcelImport });
}
