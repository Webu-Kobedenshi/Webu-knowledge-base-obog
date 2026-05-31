# Vercel デプロイ手順（web / Next.js）

このドキュメントは `web` を Vercel にデプロイする手順です。

## 1. プロジェクト作成

1. Vercel ダッシュボードで `Add New...` → `Project`
2. `Webu-Kobedenshi/Webu-Portal` を選択
3. 設定を以下にする
   - Framework Preset: `Next.js`
   - Root Directory: `web`
   - Build Command: `pnpm build`
   - Output Directory: デフォルト

## 2. Environment Variables（Production）

以下を設定:

- `NEXTAUTH_URL=https://<your-vercel-domain>`
- `NEXTAUTH_SECRET=<strong-random-secret>`
- `AUTH_JWT_SECRET=<service と同じ値>`
- `AUTH_ALLOWED_DOMAINS=st.kobedenshi.ac.jp`
- `GRAPHQL_ENDPOINT=https://<your-fly-app>.fly.dev/graphql`
- `GOOGLE_CLIENT_ID=<google-client-id>`
- `GOOGLE_CLIENT_SECRET=<google-client-secret>`

現在の構成例:

- `NEXTAUTH_URL=https://webu-portal-web.vercel.app`
- `GRAPHQL_ENDPOINT=https://webu-portal-service-rion0910.fly.dev/graphql`

## 3. デプロイ

1. `Deploy` を実行
2. `Ready` になることを確認

## 4. Google OAuth 設定

Google Cloud Console の OAuth Client に以下を追加:

- Authorized JavaScript origins:
  - `https://<your-vercel-domain>`
- Authorized redirect URIs:
  - `https://<your-vercel-domain>/api/auth/callback/google`
  - `https://<your-vercel-domain>/api/account/gmail/verify/callback`

## 5. service（Fly）側の CORS 設定

`CORS_ORIGINS` を Web 本番ドメインに設定:

```bash
flyctl secrets set CORS_ORIGINS="https://<your-vercel-domain>"
```

## 6. 動作確認

1. ログインできる
2. 一覧 (`/`) が表示される
3. 初期設定 (`/initial-setup`) を保存できる
4. アバターアップロードが完了する

## 7. よくある詰まり

- `NEXTAUTH_URL` が localhost のまま
- `AUTH_JWT_SECRET` が service と不一致
- `GRAPHQL_ENDPOINT` が localhost のまま
- Google OAuth redirect URI 未設定
