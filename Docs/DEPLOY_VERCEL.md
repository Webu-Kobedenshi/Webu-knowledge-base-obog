# Vercel Deploy

`web` を Vercel にデプロイする手順です。

## Project Settings

- Framework Preset: `Next.js`
- Root Directory: `web`
- Build Command: `pnpm build`
- Output Directory: default

## Environment Variables

```text
NEXTAUTH_URL=https://<your-vercel-domain>
NEXTAUTH_SECRET=<strong-secret>
AUTH_JWT_SECRET=<same-as-service>
AUTH_ALLOWED_DOMAINS=st.kobedenshi.ac.jp,gmail.com
GRAPHQL_ENDPOINT=https://<your-fly-app>.fly.dev/graphql
GOOGLE_CLIENT_ID=<google-client-id>
GOOGLE_CLIENT_SECRET=<google-client-secret>
```

Current production example:

```text
NEXTAUTH_URL=https://webu-portal-web.vercel.app
GRAPHQL_ENDPOINT=https://webu-portal-service-rion0910.fly.dev/graphql
```

## Google OAuth

Google Cloud Console の OAuth Client に以下を登録します。

Authorized JavaScript origins:

```text
https://<your-vercel-domain>
```

Authorized redirect URIs:

```text
https://<your-vercel-domain>/api/auth/callback/google
https://<your-vercel-domain>/api/account/gmail/verify/callback
```

## Service CORS

Fly.io 側の `CORS_ORIGINS` に Web の本番 URL を入れます。

```bash
flyctl secrets set CORS_ORIGINS="https://<your-vercel-domain>"
```

## Check

1. `/login` から Google ログインできる
2. `/` の一覧が表示される
3. `/account` を保存できる
4. アバター画像をアップロードできる

## Common Issues

- `NEXTAUTH_URL` が localhost のまま
- Google OAuth の redirect URI に `https` の callback がない
- `AUTH_JWT_SECRET` が web と service で違う
- `GRAPHQL_ENDPOINT` が本番 service を向いていない
