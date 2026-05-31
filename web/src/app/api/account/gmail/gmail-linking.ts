import { SignJWT } from "jose";

type GraphQlResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

const LINKED_GMAIL_VERIFICATION_PURPOSE = "linked-gmail-verification";

const linkGmailMutation = `
  mutation LinkGmail($verificationToken: String!) {
    linkGmail(verificationToken: $verificationToken) {
      id
      linkedGmail
    }
  }
`;

const getMyProfileQuery = `
  query GetMyProfileForGmailLinking {
    getMyProfile {
      id
    }
  }
`;

function getJwtSecret(): Uint8Array {
  const secret = process.env.AUTH_JWT_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_JWT_SECRET or NEXTAUTH_SECRET is required");
  }

  return new TextEncoder().encode(secret);
}

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

export async function getCurrentServiceUserId(serviceToken: string) {
  const result = await executeGraphql<{ getMyProfile: { id: string } }>(
    serviceToken,
    getMyProfileQuery,
  );

  if (result.errors?.length || !result.data?.getMyProfile?.id) {
    return null;
  }

  return result.data.getMyProfile.id;
}

export async function createLinkedGmailVerificationToken({
  userId,
  gmail,
}: {
  userId: string;
  gmail: string;
}) {
  return new SignJWT({
    purpose: LINKED_GMAIL_VERIFICATION_PURPOSE,
    gmail: gmail.toLowerCase().trim(),
    verifiedAt: new Date().toISOString(),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(getJwtSecret());
}

export async function linkGmailWithVerificationToken({
  serviceToken,
  verificationToken,
}: {
  serviceToken: string;
  verificationToken: string;
}) {
  const result = await executeGraphql<{ linkGmail: { id: string; linkedGmail: string | null } }>(
    serviceToken,
    linkGmailMutation,
    { verificationToken },
  );

  if (result.errors?.length || !result.data?.linkGmail) {
    return {
      ok: false,
      message: result.errors?.map((item) => item.message).join(", ") || "Registration failed",
      linkedGmail: null,
    } as const;
  }

  return {
    ok: true,
    message: "Gmail account linked successfully",
    linkedGmail: result.data.linkGmail.linkedGmail,
  } as const;
}
