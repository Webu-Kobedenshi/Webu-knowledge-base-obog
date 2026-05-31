# Webu-Portal

Next.js(App Router) + NestJS(GraphQL schema-first) + PostgreSQL(Prisma) を Docker Compose でまとめた開発環境です。

詳細は Docs 配下を参照してください。

- [Docs/STATUS.md](./Docs/STATUS.md): 現在の開発進捗
- [Docs/GIT_WORKFLOW.md](./Docs/GIT_WORKFLOW.md): ブランチ戦略と運用フロー
- [Docs/TECH_STACK.md](./Docs/TECH_STACK.md): 技術スタック（最新版）
- [Docs/Architecture.md](./Docs/Architecture.md): アーキテクチャ定義
- [Docs/OPERATIONS_SPEC.md](./Docs/OPERATIONS_SPEC.md): 運用仕様
- [Docs/PRD.md](./Docs/PRD.md): 要件定義（プロダクト視点）
- [Docs/DEPLOY_FREE_TIER.md](./Docs/DEPLOY_FREE_TIER.md): 無料枠優先デプロイ手順（Cloudflare + Render + Neon + R2）
- [Docs/DEPLOY_FLYIO.md](./Docs/DEPLOY_FLYIO.md): Fly.io デプロイ手順（service）
- [Docs/DEPLOY_NEON.md](./Docs/DEPLOY_NEON.md): Neon（PostgreSQL）設定手順
- [Docs/DEPLOY_R2.md](./Docs/DEPLOY_R2.md): Cloudflare R2 設定手順
- [Docs/DEPLOY_VERCEL.md](./Docs/DEPLOY_VERCEL.md): Vercel デプロイ手順（web）

## 構成

- web: Next.js(App Router)
- service: NestJS + GraphQL(schema-first) + Prisma
- db: PostgreSQL
- object storage: MinIO（プロフィール画像）

## 前提

- Node.js 22 LTS
- pnpm
- Docker / Docker Compose

## 起動

0. 環境変数を作成（初回のみ）

```bash
cp .env.example .env
```

Google OAuth を使うため、最低限以下を `.env` に設定してください。

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_SECRET`
- `AUTH_JWT_SECRET`
- `ADMIN_SEED_EMAILS`（seedで登録する管理者メール。複数の場合はカンマ区切り）

Google Cloud Console の OAuth Client には、通常ログイン用と引き継ぎGmail確認用の
Redirect URI を登録してください。

- `http://localhost:3000/api/auth/callback/google`
- `http://localhost:3000/api/account/gmail/verify/callback`

1. ルートで起動

```bash
pnpm dev
```

2. 動作確認

- フロント: http://localhost:3000
- GraphQL: http://localhost:4000/graphql

## よく使うコマンド

```bash
# 停止（ボリューム含め削除）
pnpm down

# lint
pnpm lint

# format
pnpm format

# Prisma Client生成
pnpm prisma:generate

# マイグレーション作成・適用
pnpm prisma:migrate

# Prisma Studio
pnpm prisma:studio

# 管理者メール追加（ADMIN_SEED_EMAILS を admin@example.com,other@example.com の形式で設定）
pnpm prisma:seed:admin-emails
```

## 現在の開発進捗（2026-02-19）

- 認証: NextAuth + Google OAuth（許可ドメイン制限あり）
- API保護: NestJS 側 GraphQL Resolver を `GqlAuthGuard` で保護
- 初期設定: 名前 / 学籍番号 / 入学年度 / 年制 / 学科の更新フロー実装済み
- 公開プロフィール: 内定先（複数）・備考・連絡先・公開可否を更新可能
- 一覧: 学科・企業名でのフィルタ + ページネーション対応
- アカウント: プロフィール更新 / 退会（関連データ Cascade 削除）対応
- 画像: MinIO への署名付きURLアップロード + `avatarUrl` 保存対応
- サービス構造: Layered + CQRS 構成。`Query` 側副作用を排除するリファクタ実施済み

## 備考

- Google OAuth（既定: `@st.kobedenshi.ac.jp`、`AUTH_ALLOWED_DOMAINS` で変更可）
- Node 22 LTS 想定のため、Node 23 以上の場合は切り替えを推奨
