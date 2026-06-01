# Webu Knowledge Base OBOG

神戸電子専門学校の OB/OG と在校生をつなぐ就活ナレッジベースです。

## Overview

- `web`: Next.js App Router / React / Tailwind CSS / NextAuth
- `service`: NestJS / GraphQL / Prisma
- `db`: PostgreSQL
- `storage`: MinIO（ローカルの S3 互換ストレージ）

## Requirements

- Node.js `22 LTS`
- pnpm `10.x`
- Docker / Docker Compose

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Create environment file

```bash
cp .env.example .env
```

`.env` の以下は各自の環境に合わせて設定してください。

```bash
NEXTAUTH_SECRET="replace-with-strong-random-string"
AUTH_JWT_SECRET="replace-with-strong-random-string"
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
ADMIN_SEED_EMAILS="admin@example.com"
```

`NEXTAUTH_SECRET` と `AUTH_JWT_SECRET` はローカル開発では同じ値でも問題ありません。
管理者としてログインするメールアドレスは `ADMIN_SEED_EMAILS` に設定します。

### 3. Configure Google OAuth

Google Cloud Console の OAuth Client に以下を登録してください。

Authorized JavaScript origins:

```text
http://localhost:3000
```

Authorized redirect URIs:

```text
http://localhost:3000/api/auth/callback/google
http://localhost:3000/api/account/gmail/verify/callback
```

### 4. Start local services

```bash
pnpm dev
```

初回起動時に Docker イメージのビルド、依存関係のインストール、Prisma migration の適用が実行されます。

### 5. Seed local data

別ターミナルで実行してください。

```bash
pnpm prisma:seed
pnpm prisma:seed:admin-emails
```

## Local URLs

- Web: http://localhost:3000
- GraphQL: http://localhost:4000/graphql
- MinIO Console: http://localhost:9001

MinIO のローカル初期アカウント:

```text
Username: minioadmin
Password: minioadmin
```

## Common Commands

```bash
# Start local environment
pnpm dev

# Stop and remove local volumes
pnpm down

# Type check
pnpm typecheck

# Lint
pnpm lint

# Format
pnpm format

# Prisma Studio
pnpm prisma:studio

# Apply Prisma migrations in development
pnpm prisma:migrate

# Seed sample data
pnpm prisma:seed

# Seed admin emails
pnpm prisma:seed:admin-emails
```

## Documentation

詳細な仕様や運用手順は `Docs` 配下を参照してください。

- [Architecture](./Docs/Architecture.md)
- [Tech Stack](./Docs/TECH_STACK.md)
- [Operations Spec](./Docs/OPERATIONS_SPEC.md)
- [Site Overview](./Docs/SITE_OVERVIEW.md)
- [Git Workflow](./Docs/GIT_WORKFLOW.md)
- [Vercel Deploy](./Docs/DEPLOY_VERCEL.md)
- [Fly.io Deploy](./Docs/DEPLOY_FLYIO.md)
- [Neon Deploy](./Docs/DEPLOY_NEON.md)
- [Cloudflare R2 Deploy](./Docs/DEPLOY_R2.md)
