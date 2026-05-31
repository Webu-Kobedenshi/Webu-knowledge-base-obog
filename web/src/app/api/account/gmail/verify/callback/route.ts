import { authOptions } from "@/auth";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  createLinkedGmailVerificationToken,
  getCurrentServiceUserId,
  linkGmailWithVerificationToken,
} from "../../gmail-linking";
import { createPublicUrl } from "../oauth-url";

const LINKED_GMAIL_OAUTH_STATE_PURPOSE = "linked-gmail-oauth-state";
const STATE_COOKIE_NAME = "linked_gmail_oauth_state";
const GOOGLE_JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

type GoogleIdTokenPayload = {
  email?: string;
  email_verified?: boolean | string;
  nonce?: string;
};

type StatePayload = {
  purpose?: string;
  nonce?: string;
  sub?: string;
};

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

function redirectWithError(request: Request, message: string) {
  return createAccountRedirect(request, {
    gmailLinkStatus: "error",
    gmailLinkMessage: message,
  });
}

async function exchangeCodeForIdToken({
  code,
  request,
}: {
  code: string;
  request: Request;
}) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth設定が不足しています。");
  }

  const redirectUri = createPublicUrl("/api/account/gmail/verify/callback", request).toString();
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
    cache: "no-store",
  });

  const json = (await response.json()) as { id_token?: string; error_description?: string };
  if (!response.ok || !json.id_token) {
    throw new Error(json.error_description || "Googleアカウントの確認に失敗しました。");
  }

  return json.id_token;
}

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const error = searchParams.get("error");
  if (error) {
    return redirectWithError(request, "Googleアカウントの確認がキャンセルされました。");
  }

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  if (!code || !state) {
    return redirectWithError(request, "Googleアカウントの確認情報が不足しています。");
  }

  const cookieStore = await cookies();
  const stateCookie = cookieStore.get(STATE_COOKIE_NAME)?.value;
  if (!stateCookie || stateCookie !== state) {
    return redirectWithError(
      request,
      "Googleアカウントの確認が期限切れです。もう一度お試しください。",
    );
  }

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const serviceToken = session?.serviceToken;
  if (!userId || !serviceToken) {
    return redirectWithError(request, "ログインし直してからGmailアドレスを確認してください。");
  }

  try {
    const stateResult = await jwtVerify<StatePayload>(state, getJwtSecret());
    const statePayload = stateResult.payload;
    if (
      statePayload.purpose !== LINKED_GMAIL_OAUTH_STATE_PURPOSE ||
      statePayload.sub !== userId ||
      !statePayload.nonce
    ) {
      return redirectWithError(
        request,
        "Googleアカウントの確認が期限切れです。もう一度お試しください。",
      );
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return redirectWithError(request, "Google OAuth設定が不足しています。");
    }

    const idToken = await exchangeCodeForIdToken({ code, request });
    const idTokenResult = await jwtVerify<GoogleIdTokenPayload>(idToken, GOOGLE_JWKS, {
      audience: clientId,
      issuer: ["https://accounts.google.com", "accounts.google.com"],
    });
    const payload = idTokenResult.payload;
    const email = payload.email?.toLowerCase().trim() ?? "";
    const emailVerified = payload.email_verified === true || payload.email_verified === "true";

    if (payload.nonce !== statePayload.nonce || !emailVerified || !email.endsWith("@gmail.com")) {
      return redirectWithError(request, "確認済みのGmailアドレスを選択してください。");
    }

    const serviceUserId = await getCurrentServiceUserId(serviceToken);
    if (!serviceUserId) {
      return redirectWithError(request, "ログインし直してからGmailアドレスを確認してください。");
    }

    const verificationToken = await createLinkedGmailVerificationToken({
      userId: serviceUserId,
      gmail: email,
    });
    const result = await linkGmailWithVerificationToken({ serviceToken, verificationToken });
    if (!result.ok) {
      return redirectWithError(request, result.message);
    }

    const response = createAccountRedirect(request, {
      gmailLinkStatus: "success",
      gmailLinkMessage: "引き継ぎGmailアドレスを登録しました。",
    });
    response.cookies.delete(STATE_COOKIE_NAME);
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Googleアカウントの確認に失敗しました。";
    return redirectWithError(request, message);
  }
}
