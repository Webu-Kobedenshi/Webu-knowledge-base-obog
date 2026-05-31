import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { linkGmailWithVerificationToken } from "./gmail-linking";

const unlinkGmailMutation = `
  mutation UnlinkGmail {
    unlinkGmail {
      id
      linkedGmail
    }
  }
`;

type GraphQlResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

async function executeGraphql<T>(serviceToken: string, query: string, variables?: unknown) {
  const endpoint = process.env.GRAPHQL_ENDPOINT ?? "http://localhost:4000/graphql";
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${serviceToken}`,
      },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    });

    const text = await response.text();
    if (!text) {
      return { errors: [{ message: "Empty response from service" }] } as GraphQlResponse<T>;
    }

    return JSON.parse(text) as GraphQlResponse<T>;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to connect to service";
    return { errors: [{ message }] } as GraphQlResponse<T>;
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const serviceToken = session?.serviceToken;

    if (!serviceToken) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    const { verificationToken } = await request.json();
    if (!verificationToken || typeof verificationToken !== "string") {
      return NextResponse.json(
        { ok: false, message: "GoogleでGmailアドレスを確認してください" },
        { status: 400 },
      );
    }

    const result = await linkGmailWithVerificationToken({
      serviceToken,
      verificationToken,
    });

    if (!result.ok) {
      return NextResponse.json({ ok: false, message: result.message }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      message: result.message,
      linkedGmail: result.linkedGmail,
    });
  } catch (err) {
    console.error("[POST /api/account/gmail] Unexpected error:", err);
    return NextResponse.json(
      { ok: false, message: "サーバーエラーが発生しました。" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    const serviceToken = session?.serviceToken;

    if (!serviceToken) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    const result = await executeGraphql<{ unlinkGmail: { id: string } }>(
      serviceToken,
      unlinkGmailMutation,
    );

    if (result.errors?.length || !result.data?.unlinkGmail) {
      return NextResponse.json(
        {
          ok: false,
          message: result.errors?.map((item) => item.message).join(", ") || "Unlink failed",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: true, message: "Gmail account unlinked successfully" });
  } catch (err) {
    console.error("[DELETE /api/account/gmail] Unexpected error:", err);
    return NextResponse.json(
      { ok: false, message: "サーバーエラーが発生しました。" },
      { status: 500 },
    );
  }
}
