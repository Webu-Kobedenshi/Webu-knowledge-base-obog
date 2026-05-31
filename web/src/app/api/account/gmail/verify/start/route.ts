import { authOptions } from "@/auth";
import { SignJWT } from "jose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { createPublicUrl } from "../oauth-url";

const LINKED_GMAIL_OAUTH_STATE_PURPOSE = "linked-gmail-oauth-state";
const STATE_COOKIE_NAME = "linked_gmail_oauth_state";

function getJwtSecret(): Uint8Array {
  const secret = process.env.AUTH_JWT_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_JWT_SECRET or NEXTAUTH_SECRET is required");
  }

  return new TextEncoder().encode(secret);
}

function createAccountRedirect(request: Request, params: Record<string, string>) {
  const url = createPublicUrl("/account", request);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return createAccountRedirect(request, {
      gmailLinkStatus: "error",
      gmailLinkMessage: "ログインし直してからGmailアドレスを確認してください。",
    });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return createAccountRedirect(request, {
      gmailLinkStatus: "error",
      gmailLinkMessage: "Google OAuth設定が不足しています。",
    });
  }

  const nonce = crypto.randomUUID();
  const state = await new SignJWT({
    purpose: LINKED_GMAIL_OAUTH_STATE_PURPOSE,
    nonce,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(getJwtSecret());

  const redirectUri = createPublicUrl("/api/account/gmail/verify/callback", request).toString();
  const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleUrl.searchParams.set("client_id", clientId);
  googleUrl.searchParams.set("redirect_uri", redirectUri);
  googleUrl.searchParams.set("response_type", "code");
  googleUrl.searchParams.set("scope", "openid email");
  googleUrl.searchParams.set("prompt", "select_account");
  googleUrl.searchParams.set("state", state);
  googleUrl.searchParams.set("nonce", nonce);

  const response = NextResponse.redirect(googleUrl);
  response.cookies.set(STATE_COOKIE_NAME, state, {
    httpOnly: true,
    maxAge: 10 * 60,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
