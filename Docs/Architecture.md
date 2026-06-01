# Architecture

このプロジェクトの設計方針です。

## Goal

神戸電子専門学校の在校生が、OB/OG の就職先や選考体験を探せるナレッジベースを作る。

## Apps

- `web`: Next.js App Router
- `service`: NestJS GraphQL API
- `db`: PostgreSQL
- `storage`: S3 compatible storage

## Frontend

`web` は Server Components を中心にします。

- pages: `web/src/app`
- API routes: `web/src/app/api`
- GraphQL access: `web/src/graphql`
- shared logic: `web/src/lib`
- components: `web/src/components`

### Component Layers

- `atoms`: shadcn/ui などの基本 UI をラップする
- `molecules`: 複数 atoms を組み合わせる
- `organisms`: 画面上の独立した機能ブロック
- `templates`: ページの骨格

UI を追加するときは、既存 layer に合う場所へ置きます。

## Backend

`service` は Layered Architecture + CQRS を基本にします。

- `presentation`: GraphQL resolver と guard
- `application`: use case の調停
- `domain`: 業務ルール、値オブジェクト、エンティティ
- `infrastructure`: Prisma、storage、外部接続

Command は更新系、Query は参照系として分けます。

## Data Flow

1. `web` が NextAuth で Google login を行う
2. `web` が service 用 JWT を作る
3. `service` の GraphQL resolver を JWT で呼び出す
4. `service` が Prisma 経由で PostgreSQL を読み書きする
5. 画像は署名付き URL で storage へ直接 upload する

## Auth

- Google OAuth を使う
- NextAuth session は JWT strategy
- API は `GqlAuthGuard` で保護する
- 管理者判定は `AdminEmail` table を見る

## Core Models

- `User`: ログインユーザー、ロール、初期設定
- `AdminEmail`: 管理者メール
- `AlumniProfile`: 公開プロフィール
- `AlumniCompany`: 内定先、就職先
- `SelectionExperience`: 企業ごとの選考体験
- `SelectionStep`: 選考ステップ

## Storage

アバター画像は S3 compatible storage に保存します。

- `ENDPOINT`: service から S3 API に接続する URL
- `PUBLIC_UPLOAD_ENDPOINT`: browser が署名付き URL に PUT する URL
- `PUBLIC_ENDPOINT`: 保存後に表示する公開 URL

## Implementation Rules

- GraphQL schema、DTO、frontend type は同じ変更で揃える
- DB schema を変えるときは migration を作る
- 読み取りは Prisma `select` で必要な項目だけ取る
- 公開プロフィールの正規化や検証は domain 層に寄せる
- shadcn/ui を直接使い回さず、必要なら `atoms` でラップする
