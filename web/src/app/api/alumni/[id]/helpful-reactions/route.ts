import { authOptions } from "@/auth";
import type { HelpfulReactionSummary } from "@/graphql/types";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

type GraphQlResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

const toggleHelpfulReactionMutation = `
  mutation ToggleHelpfulReaction($alumniProfileId: ID!) {
    toggleHelpfulReaction(alumniProfileId: $alumniProfileId) {
      helpfulReaction {
        count
        reactedByViewer
      }
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

  const text = await response.text();
  if (!text) {
    return { errors: [{ message: "Empty response from service" }] } as GraphQlResponse<T>;
  }

  return JSON.parse(text) as GraphQlResponse<T>;
}

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const serviceToken = session?.serviceToken;

  if (!serviceToken) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const result = await executeGraphql<{
      toggleHelpfulReaction: { helpfulReaction: HelpfulReactionSummary };
    }>(serviceToken, toggleHelpfulReactionMutation, {
      alumniProfileId: id,
    });

    if (result.errors?.length || !result.data?.toggleHelpfulReaction) {
      return NextResponse.json(
        {
          ok: false,
          message:
            result.errors?.map((item) => item.message).join(", ") ||
            "Helpful reaction update failed",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      ok: true,
      helpfulReaction: result.data.toggleHelpfulReaction.helpfulReaction,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Helpful reaction update failed",
      },
      { status: 500 },
    );
  }
}
