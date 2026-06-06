import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

type GraphQlResponse<TData> = {
  data?: TData;
  errors?: Array<{ message: string }>;
};

const companyNameSuggestionsQuery = `
  query GetCompanyNameSuggestions($query: String!, $limit: Int) {
    getCompanyNameSuggestions(query: $query, limit: $limit)
  }
`;

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const serviceToken = session?.serviceToken;

  if (!serviceToken) {
    return NextResponse.json({ suggestions: [] }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim() ?? "";

  if (!query) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const endpoint = process.env.GRAPHQL_ENDPOINT ?? "http://localhost:4000/graphql";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${serviceToken}`,
      },
      cache: "no-store",
      body: JSON.stringify({
        query: companyNameSuggestionsQuery,
        variables: {
          query,
          limit: 8,
        },
      }),
    });

    const json = (await response.json()) as GraphQlResponse<{
      getCompanyNameSuggestions: string[];
    }>;

    if (json.errors?.length) {
      return NextResponse.json({ suggestions: [] }, { status: 500 });
    }

    return NextResponse.json({
      suggestions: json.data?.getCompanyNameSuggestions ?? [],
    });
  } catch {
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
}
