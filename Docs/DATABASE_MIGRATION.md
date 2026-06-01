# Database Migration

Prisma schema を変更するときの手順です。

## Flow

1. `service/prisma/schema.prisma` を編集する
2. migration を作る
3. 生成された SQL を確認する
4. ローカルで動作確認する
5. schema と migration を commit する
6. deploy 時に本番へ適用する

## Create Migration

```bash
pnpm prisma:migrate
```

または service 配下で直接実行します。

```bash
cd service
pnpm prisma migrate dev --name <migration_name>
```

migration 名は英語の snake_case にします。

```text
add_avatar_url
drop_unused_auth_tables
```

## Check SQL

作成された SQL を必ず確認します。

```bash
cat service/prisma/migrations/*_<migration_name>/migration.sql
```

確認すること:

- 意図しない `DROP` がない
- 既存データがある table に危険な `NOT NULL` 追加をしていない
- rename が `DROP + ADD` になっていない

## Safe Changes

- nullable column を追加する
- default 付き column を追加する
- index を追加する
- 未使用 table を drop する前にコード参照を消す

## Risky Changes

- `NOT NULL` column を既存 table に追加する
- column を削除する
- table を削除する
- column 名を変更する

危険な変更は 2 段階に分けます。

例:

1. nullable で追加する
2. アプリで値を埋める
3. 別 migration で required にする

## Remove Column Or Table

削除前に確認すること:

```bash
rg -n "fieldName|ModelName" service web Docs
```

削除する場合は、以下を同じ変更に含めます。

- Prisma schema
- migration
- GraphQL schema
- DTO
- Repository select / create / update
- frontend types
- form state
- docs

## Production

本番では `prisma migrate deploy` を使います。

Fly.io では `fly.toml` の `release_command` で実行されます。

```toml
[deploy]
  release_command = "/app/service/node_modules/.bin/prisma migrate deploy --schema /app/service/prisma/schema.prisma"
```

## Check

```bash
pnpm --dir service exec prisma validate --schema service/prisma/schema.prisma
pnpm --dir service typecheck
```

## Troubleshooting

Fly.io の migration が失敗したら logs を見ます。

```bash
flyctl logs --app <your-app>
```

本番 DB の migration 状態を確認する場合:

```bash
flyctl ssh console --app <your-app>
cd /app/service
pnpm prisma migrate status --schema prisma/schema.prisma
```
