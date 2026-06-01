# Fly.io Deploy

`service` を Fly.io にデプロイする手順です。

## Files

- `fly.toml`
- `service/Dockerfile.fly`
- `service/package.json`

## Setup

```bash
flyctl auth login
flyctl launch --no-deploy
```

`fly.toml` の `app` は Fly.io 上で一意の名前にします。

## Secrets

最低限必要な値:

```bash
flyctl secrets set \
  DATABASE_URL="<Neon Direct URL>" \
  AUTH_JWT_SECRET="<strong-secret>" \
  AUTH_ALLOWED_DOMAINS="st.kobedenshi.ac.jp,gmail.com" \
  ADMIN_SEED_EMAILS="<admin@example.com>" \
  CORS_ORIGINS="https://<your-web-domain>"
```

R2 を使う場合:

```bash
flyctl secrets set \
  ENDPOINT="https://<account-id>.r2.cloudflarestorage.com" \
  PUBLIC_UPLOAD_ENDPOINT="https://<account-id>.r2.cloudflarestorage.com" \
  PUBLIC_ENDPOINT="https://<your-r2-public-domain>" \
  ACCESS_KEY="<r2-access-key>" \
  SECRET_KEY="<r2-secret-key>" \
  BUCKET_NAME="webu-portal"
```

## Deploy

```bash
flyctl deploy
```

`fly.toml` の `release_command` で Prisma migration が適用されます。

## Seed Admin Emails

```bash
flyctl ssh console -C "cd /app/service && pnpm db:seed:admin-emails"
```

## Check

```bash
curl -sS -o /dev/null -w "%{http_code}\n" https://<your-app>.fly.dev/graphql
```

`400` が返れば GraphQL endpoint は起動しています。

## Common Commands

```bash
flyctl logs --app <your-app>
flyctl status --app <your-app>
flyctl secrets set KEY="VALUE"
flyctl deploy
```
