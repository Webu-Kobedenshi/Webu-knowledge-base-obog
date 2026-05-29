# 技術スタック（2026-02-20）

## 1. Frontend（web）

- Next.js `16.1.6`（App Router）
- React `19.2.3`
- TypeScript `5.x`
- Tailwind CSS `4.x`
- NextAuth `4.24.x`（Google OAuth）
- jose `6.x`（JWT 署名）

## 2. Backend（service）

- NestJS `11.x`
- GraphQL（Schema-first）
- Apollo Server `5.x`
- Prisma `7.4.x`（`@prisma/client`, `prisma`, `@prisma/adapter-pg`）
- PostgreSQL Driver: `pg 8.x`
- AWS SDK v3（S3 Client / Presigner）

## 3. Data / Storage

- PostgreSQL `16`（Docker image: `postgres:16-alpine`）
- Cloudflare R2（S3 互換オブジェクトストレージ）
  - アバター画像アップロードに利用（S3 署名付きURLで直接 PUT）
  - `ENDPOINT` は S3 API 用（例: `https://<account-id>.r2.cloudflarestorage.com`）
  - `PUBLIC_UPLOAD_ENDPOINT` はブラウザから到達可能な署名付き PUT 用 S3 API URL（例: `https://<account-id>.r2.cloudflarestorage.com`、ローカルは `http://localhost:9000`）
  - `PUBLIC_ENDPOINT` は配信用の公開ベース URL（例: `https://<bucket>.r2.dev` またはカスタム CDN ドメイン`）
  - ブラウザから直接アップロードする場合は **バケットの CORS 設定** が必須
  - 実装注意点: 署名生成はサーバ側で行い、公開 URL は `PUBLIC_ENDPOINT` を元に生成する

## 4. 開発・運用ツール

- Node.js `22 LTS`（`>=22 <23`）
- pnpm `10.8.1`
- Biome `1.9.x`（Lint / Format）
- Jest `30.x`
- Docker / Docker Compose

## 5. アーキテクチャ方針

- Frontend: App Router + Server Components 中心
- Backend: Layered Architecture + CQRS（Command / Query 分離）
- API: GraphQL を単一エントリとして提供
- ORM: Prisma の型を活用し、`select` ベースで必要フィールドを取得
