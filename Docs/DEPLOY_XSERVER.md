# Xserver Deploy

`web-u.dev` で `web` と `service` を xサーバー上の Docker にデプロイする手順です。

初回構築、通常リリース、検証、ロールバック、トラブル対応まで含む詳細手順は [XSERVER_DEPLOY_RUNBOOK.md](./XSERVER_DEPLOY_RUNBOOK.md) を参照してください。

## Prerequisites

- xサーバーの `webu` アカウントで SSH ログインできる
- Docker / Docker Compose を `webu` アカウントで実行できる
- 80 番と 443 番ポートが外部から到達できる
- `web-u.dev` と `www.web-u.dev` の A レコードが `162.43.91.89` を向いている
- Neon / Cloudflare R2 / Google OAuth の本番用 secret を確認できる

## Files

- `compose.xserver.yml`
- `web/Dockerfile.xserver`
- `service/Dockerfile.xserver`
- `deploy/xserver/Caddyfile`
- `.env.xserver.example`

## DNS

name.com で以下を設定します。

```text
Type: A
Host: @
Value: 162.43.91.89
```

```text
Type: A
Host: www
Value: 162.43.91.89
```

## Environment

サーバー上で `.env.xserver.example` をコピーして `.env.xserver` を作ります。

```bash
cp .env.xserver.example .env.xserver
```

最低限、以下を本番値に置き換えます。

```text
NEXTAUTH_SECRET
AUTH_JWT_SECRET
ADMIN_SEED_EMAILS
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
DATABASE_URL
ENDPOINT
PUBLIC_UPLOAD_ENDPOINT
PUBLIC_ENDPOINT
ACCESS_KEY
SECRET_KEY
BUCKET_NAME
```

`AUTH_JWT_SECRET` は `web` と `service` で同じ値を使います。

## Google OAuth

Google Cloud Console の OAuth Client に以下を追加します。

Authorized JavaScript origins:

```text
https://web-u.dev
```

Authorized redirect URIs:

```text
https://web-u.dev/api/auth/callback/google
https://web-u.dev/api/account/gmail/verify/callback
```

## Cloudflare R2 CORS

R2 bucket の CORS に `https://web-u.dev` を追加します。移行中に Vercel も併用する場合は、既存の Vercel URL も残します。

```json
[
  {
    "AllowedOrigins": ["https://web-u.dev", "https://webu-portal-web.vercel.app"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

## Deploy

初回ログイン後、まず初期パスワードを変更します。

```bash
ssh webu@162.43.91.89
passwd
```

リポジトリを配置し、環境変数を設定したら起動します。

```bash
docker compose -f compose.xserver.yml up -d --build
```

検証時だけテンプレートで compose の構文を確認できます。

```bash
XSERVER_ENV_FILE=.env.xserver.example docker compose -f compose.xserver.yml config
```

migration を適用します。

```bash
docker compose -f compose.xserver.yml exec service pnpm prisma migrate deploy
```

管理者メールを seed します。

```bash
docker compose -f compose.xserver.yml exec service pnpm db:seed:admin-emails
```

## Check

```bash
docker compose -f compose.xserver.yml ps
docker compose -f compose.xserver.yml logs -f web service caddy
curl -I https://web-u.dev
curl -I https://www.web-u.dev
```

ブラウザでは以下を確認します。

1. `https://web-u.dev` が表示される
2. Google ログインできる
3. OB/OG 一覧が表示される
4. `/account` の保存が成功する
5. アバター画像アップロードが成功する
6. `https://www.web-u.dev` が `https://web-u.dev` にリダイレクトされる

## Operations

```bash
docker compose -f compose.xserver.yml pull
docker compose -f compose.xserver.yml up -d --build
docker compose -f compose.xserver.yml logs -f
docker compose -f compose.xserver.yml restart web
docker compose -f compose.xserver.yml restart service
```

旧 Vercel / Fly.io 環境は、移行後しばらく rollback 用に残してから停止します。
