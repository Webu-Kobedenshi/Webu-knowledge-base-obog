# Tech Stack

このプロジェクトで使っている主要技術の一覧です。

## Frontend

- Next.js `16.1.6`
- React `19.2.3`
- TypeScript `5.x`
- Tailwind CSS `4.x`
- shadcn/ui
- NextAuth `4.24.x`
- jose `6.x`

## Backend

- NestJS `11.x`
- GraphQL schema-first
- Apollo Server `5.x`
- Prisma `7.4.x`
- PostgreSQL driver `pg`
- AWS SDK v3（S3 compatible storage）

## Data And Storage

- PostgreSQL `16`
- Local DB: Docker Compose
- Production DB: Neon
- Local object storage: MinIO
- Production object storage: Cloudflare R2

## Tooling

- Node.js `22 LTS`
- pnpm `10.8.1`
- Docker / Docker Compose
- Biome
- Jest

## Architecture Policy

- Frontend は App Router と Server Components を中心にする
- UI は atomic design に沿って `atoms` から再利用する
- Backend は Layered Architecture + CQRS を基本にする
- Prisma の読み取りは必要フィールドを `select` で絞る
