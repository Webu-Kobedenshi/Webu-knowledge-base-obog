# Fly.io デプロイ手順（service / NestJS）

このドキュメントは `service` を Fly.io にデプロイするための手順をまとめたものです。

## 0. このリポジトリで使う設定ファイル

- `fly.toml`（Fly アプリ設定）
- `service/Dockerfile.fly`（Fly デプロイ用 Dockerfile）
- `service/package.json` の `start:prod` は `node dist/src/main.js`

## 1. 前提

- Fly CLI インストール済み（`flyctl`）
- Neon の `DATABASE_URL` を取得済み（Direct 接続）
- `AUTH_JWT_SECRET` を用意済み
- （画像を使う場合）Cloudflare R2 のキーを取得済み

## 2. 初回セットアップ

```bash
flyctl auth login
flyctl launch --no-deploy
```

`fly.toml` の `app` はユニーク名にしてください。

## 3. Secrets 設定

最低限:

```bash
flyctl secrets set \
  DATABASE_URL="<Neon Direct URL>" \
  AUTH_JWT_SECRET="<strong-secret>" \
  ADMIN_SEED_EMAILS="<admin-email@example.com>" \
  CORS_ORIGINS="https://<your-web-domain>"
```

R2 を使う場合:

```bash
flyctl secrets set \
  ENDPOINT="https://<account-id>.r2.cloudflarestorage.com" \
  PUBLIC_ENDPOINT="https://<your-r2-public-domain>" \
  ACCESS_KEY="<r2-access-key>" \
  SECRET_KEY="<r2-secret-key>" \
  BUCKET_NAME="webu-portal"
```

## 4. デプロイ

```bash
flyctl deploy
```

このリポジトリでは `fly.toml` の `release_command` で `pnpm prisma migrate deploy` が実行されます。

管理者メールを追加する場合は、`ADMIN_SEED_EMAILS` を設定したうえで追加専用seedを実行します。このseedは既存の管理者メールを削除せず、新しいメールアドレスだけを追加します。

```bash
flyctl ssh console -C "cd /app/service && pnpm db:seed:admin-emails"
```

## 5. 動作確認

```bash
curl -sS -o /dev/null -w "%{http_code}\n" https://<your-app>.fly.dev/graphql
```

- `400` が返れば GraphQL エンドポイントとしては正常です（GET にクエリ本文がないため）。

## 6. よく使う運用コマンド

```bash
# ログ確認
flyctl logs --app <your-app>

# Secrets 更新
flyctl secrets set KEY="VALUE"

# 再デプロイ
flyctl deploy

# 状態確認
flyctl status --app <your-app>
```

## 7. Web 側（Cloudflare Pages）との接続

Web 側環境変数:

- `GRAPHQL_ENDPOINT=https://<your-app>.fly.dev/graphql`
- `AUTH_JWT_SECRET=<service と同じ値>`

Service 側:

- `CORS_ORIGINS=https://<your-web-domain>`

## 8. 注意

- `auto_stop_machines = "off"` でスリープしにくい設定にしていますが、利用量に応じて課金されます。
- Neon の接続はまず Direct URL（`-pooler` なし）を推奨します。

## 9. main マージ時の自動デプロイ（GitHub Actions）

このリポジトリには自動デプロイ用 Workflow を追加済みです。

- [.github/workflows/fly-deploy.yml](../.github/workflows/fly-deploy.yml)

挙動:

- `main` への push 時に実行
- 変更対象が `service/**` または `fly.toml` の場合に実行
- `flyctl deploy --remote-only` でデプロイ

事前設定:

1. GitHub リポジトリ → `Settings` → `Secrets and variables` → `Actions`
2. `New repository secret` で `FLY_API_TOKEN` を追加
3. 値には `flyctl auth token` の出力を設定
