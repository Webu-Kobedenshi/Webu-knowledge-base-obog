import { SignJWT } from "jose";
import type { NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";

const DEFAULT_AUTHORIZED_DOMAIN = "st.kobedenshi.ac.jp,gmail.com";
const SCHOOL_EMAIL_DOMAIN = "st.kobedenshi.ac.jp";
const TEACHER_EMAIL_LOCAL_PART_PATTERN = /^[a-z][a-z._-]*$/;

type Role = "STUDENT" | "ALUMNI" | "ADMIN";

type GraphQlResponse<TData> = {
  data?: TData;
  errors?: Array<{ message: string }>;
};

const isAdminEmailQuery = `
  query IsAdminEmail($email: String!) {
    isAdminEmail(email: $email)
  }
`;

const findUserByLinkedGmailQuery = `
  query FindUserByLinkedGmailForAuth($gmail: String!) {
    findUserByLinkedGmail(gmail: $gmail) {
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

function normalizeEmail(email?: string | null): string {
  return email?.toLowerCase().trim() ?? "";
}

function isTeacherEmailFormat(email?: string | null): boolean {
  const normalizedEmail = normalizeEmail(email);
  const [localPart, domain, ...rest] = normalizedEmail.split("@");
  return (
    rest.length === 0 &&
    domain === SCHOOL_EMAIL_DOMAIN &&
    TEACHER_EMAIL_LOCAL_PART_PATTERN.test(localPart)
  );
}

function isAllowedDomainEmail(email?: string | null): boolean {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return false;
  }

  const allowedDomainsRaw = process.env.AUTH_ALLOWED_DOMAINS?.trim() || DEFAULT_AUTHORIZED_DOMAIN;
  const allowedDomains = allowedDomainsRaw
    .split(",")
    .map((item) => item.trim().toLowerCase().replace(/^@/, ""))
    .filter(Boolean);

  return allowedDomains.some((domain) => normalizedEmail.endsWith(`@${domain}`));
}

async function isAdminEmail(email?: string | null): Promise<boolean> {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return false;
  }

  const endpoint = process.env.GRAPHQL_ENDPOINT ?? "http://localhost:4000/graphql";
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({
        query: isAdminEmailQuery,
        variables: { email: normalizedEmail },
      }),
    });

    const json = (await response.json()) as GraphQlResponse<{ isAdminEmail: boolean }>;
    return Boolean(json.data?.isAdminEmail);
  } catch {
    return false;
  }
}

async function isLinkedGmail(email?: string | null): Promise<boolean> {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail.endsWith("@gmail.com")) {
    return false;
  }

  const endpoint = process.env.GRAPHQL_ENDPOINT ?? "http://localhost:4000/graphql";
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({
        query: findUserByLinkedGmailQuery,
        variables: { gmail: normalizedEmail },
      }),
    });

    const json = (await response.json()) as GraphQlResponse<{
      findUserByLinkedGmail: { id: string } | null;
    }>;
    return Boolean(json.data?.findUserByLinkedGmail?.id);
  } catch {
    return false;
  }
}

async function isAuthorizedEmail(email?: string | null): Promise<boolean> {
  if (!email) {
    return false;
  }

  const isAdmin = await isAdminEmail(email);
  if (isTeacherEmailFormat(email)) {
    return isAdmin;
  }

  return isAllowedDomainEmail(email) || isAdmin || (await isLinkedGmail(email));
}

async function createServiceToken(payload: {
  userId: string;
  email: string;
  role: Role;
  name?: string;
}) {
  return new SignJWT({
    email: payload.email,
    role: payload.role,
    name: payload.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(getJwtSecret());
}

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!(await isAuthorizedEmail(user.email))) {
        return false;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        token.email = user.email;
      }

      if (user?.name) {
        token.name = user.name;
      }

      if (user?.id) {
        token.userId = user.id;
      }

      const email = typeof token.email === "string" ? token.email : null;
      const tokenRole = token.role as Role | undefined;
      const role =
        email && (await isAdminEmail(email))
          ? "ADMIN"
          : tokenRole === "ADMIN"
            ? "STUDENT"
            : (tokenRole ?? "STUDENT");
      token.role = role;

      const userId = (token.userId as string | undefined) ?? token.sub;
      if (!userId || !token.email) {
        return token;
      }

      token.userId = userId;
      token.serviceToken = await createServiceToken({
        userId,
        email: token.email,
        role,
        name: typeof token.name === "string" ? token.name : undefined,
      });

      return token;
    },
    async session({ session, token }) {
      if (!session.user) {
        return session;
      }

      session.user.id = (token.userId as string | undefined) ?? token.sub ?? "";
      session.user.role = ((token.role as Role | undefined) ?? "STUDENT") as Role;
      session.serviceToken = token.serviceToken as string | undefined;

      return session;
    },
  },
};
