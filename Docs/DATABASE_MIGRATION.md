# データベースマイグレーション ガイド

カラム追加などのスキーマ変更から本番デプロイまでの手順をまとめたドキュメントです。

---

## 全体フロー

```
① schema.prisma を編集
② ローカルでマイグレーション作成
③ ローカルDBで動作確認
④ Git に commit & push
⑤ main マージ → 自動デプロイ（release_command で本番適用）
```

---

## ① スキーマを編集する

`service/prisma/schema.prisma` にカラム・テーブルを追加します。

```prisma
model AlumniProfile {
  // ... 既存フィールド
  avatarUrl    String?   // ← 例: NULLable カラム追加
}
```

### 本番データを壊さないためのルール

| やりたいこと | 安全な方法 |
|---|---|
| **カラム追加** | `String?` や `Int?`（NULL許可）で追加。既存行は `null` になる |
| **デフォルト値付き追加** | `Boolean @default(false)` のように `@default` を指定 |
| **NOT NULL カラム追加** | ⚠ 既存行があると失敗する。先に NULL許可で追加 → データ埋め → 別マイグレーションで NOT NULL に変更 |
| **カラム削除** | ⚠ 先にアプリ側のコードからそのカラムへの参照を全て削除してからスキーマ変更 |
| **カラム名変更** | ⚠ Prisma は「旧カラム削除＋新カラム追加」と解釈する。`migration.sql` を手動修正して `ALTER TABLE ... RENAME COLUMN` に書き換える |
| **テーブル削除** | ⚠ データが全て消える。本当に不要か確認 |

> **原則: 新規カラムは `?`（Optional）か `@default` 付きで追加すれば安全**

### カラム削除のチェックリスト

今回のように入力項目そのものを廃止する場合は、DBカラムだけでなくアプリの契約面も同時に確認します。

1. フロントのフォーム状態・入力UI・表示UIから対象フィールドを削除
2. `web/src/graphql` の取得フィールドと TypeScript 型から削除
3. Web API Route の request body 型から削除
4. Service の GraphQL schema / DTO / Domain input / Repository select・create data から削除
5. `schema.prisma` から削除し、`DROP COLUMN IF EXISTS` の migration を追加
6. `pnpm --filter web typecheck` と `pnpm --filter service typecheck` を実行

---

## ② マイグレーションファイルを作成する

```bash
cd service

# マイグレーション作成（名前は英語スネークケースで）
pnpm prisma migrate dev --name add_avatar_url
```

実行すると以下が起きます：

1. `prisma/migrations/<timestamp>_add_avatar_url/migration.sql` が生成される
2. ローカルDBにその SQL が適用される
3. Prisma Client が再生成される

> ⚠ `migrate dev` は**開発環境専用**です。本番には絶対に直接実行しないでください。

### 生成された SQL を必ず確認する

```bash
cat prisma/migrations/*_add_avatar_url/migration.sql
```

```sql
-- 例: 安全な ALTER TABLE
ALTER TABLE "AlumniProfile" ADD COLUMN "avatarUrl" TEXT;
```

特に以下に注意：

- 意図しない `DROP` 文がないか
- `NOT NULL` 制約が既存データと矛盾しないか
- カラム名変更が `DROP + ADD` になっていないか

必要であれば `migration.sql` を手動で修正できます。

---

## ③ ローカルで動作確認する

```bash
# ローカルサーバー起動
pnpm start:dev

# DB の状態を確認
pnpm prisma studio
```

- 新カラムが追加されているか
- アプリの読み書きが正常か
- 既存データが壊れていないか

---

## ④ Git に commit & push

マイグレーションファイルは必ず Git に含めます。

```bash
git add service/prisma/schema.prisma
git add service/prisma/migrations/
git commit -m "feat: add avatarUrl column to AlumniProfile"
git push origin <branch>
```

> `prisma/migrations/` ディレクトリは `.gitignore` に入れないでください。
> 本番デプロイ時に `prisma migrate deploy` がこのファイルを参照します。

---

## ⑤ 本番デプロイ

### 自動デプロイ（推奨）

`main` ブランチにマージすると GitHub Actions が自動実行します。

```
main に push
  ↓
GitHub Actions: fly-deploy.yml
  ↓
Fly.io でビルド
  ↓
release_command: prisma migrate deploy  ← ここで本番DBにマイグレーション適用
  ↓
アプリ起動
```

`release_command` は `fly.toml` で定義されています：

```toml
[deploy]
  release_command = "/app/service/node_modules/.bin/prisma migrate deploy --schema /app/service/prisma/schema.prisma"
```

`prisma migrate deploy` の特徴：
- `prisma/migrations/` 内の **未適用のマイグレーション** だけを順番に実行する
- 新しい SQL を自動生成しない（安全）
- 対話的な確認なし

### 手動デプロイ

```bash
flyctl deploy --remote-only --wait-timeout 300
```

> `--wait-timeout 300` は release_command の完了待ちを 5分 に延長します。
> Fly.io の VM 起動が遅い場合にタイムアウトを防ぎます。

---

## トラブルシューティング

### release_command がタイムアウトする

```
✖ Failed: timeout reached waiting for machine's state to change
```

**原因**: Fly.io の VM プロビジョニングが遅い（インフラ側の問題で多発する）

**対処**:
1. GitHub Actions から **Re-run jobs** で再実行
2. または手動で `flyctl deploy --remote-only --wait-timeout 300`

### マイグレーションが失敗した場合

```bash
# Fly.io のログを確認
flyctl logs --app webu-portal-service-rion0910

# 本番DBのマイグレーション状態を確認
flyctl ssh console --app webu-portal-service-rion0910
> /app/service/node_modules/.bin/prisma migrate status --schema /app/service/prisma/schema.prisma
```

### NOT NULL カラムを追加したい場合（2段階マイグレーション）

```bash
# Step 1: NULL許可で追加
pnpm prisma migrate dev --name add_phone_nullable

# → アプリ側でデータを埋める処理を実装・デプロイ

# Step 2: NOT NULL に変更
# schema.prisma で ? を外す
pnpm prisma migrate dev --name make_phone_required
```

---

## 環境ごとの接続先

| 環境 | DB | 接続方法 |
|---|---|---|
| ローカル | Docker PostgreSQL | `DATABASE_URL` in `.env` |
| 本番 | Neon PostgreSQL | `DATABASE_URL` in Fly.io Secrets |

本番の `DATABASE_URL` は Fly.io の Secrets に設定済みです。
変更する場合は:

```bash
flyctl secrets set DATABASE_URL="<new-neon-url>" --app webu-portal-service-rion0910
```
