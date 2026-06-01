# Neon Deploy

本番 PostgreSQL を Neon で用意する手順です。

## Create Project

- PostgreSQL version: `16`
- Region: API と近いリージョン
- Neon Auth: `OFF`

## Connection String

Neon の `Connect` から Direct 接続 URL を取得します。

確認すること:

- `-pooler` が入っていない
- `sslmode=require` が付いている

## Set Fly.io Secret

```bash
flyctl secrets set DATABASE_URL="<Neon Direct URL>"
```

## Migration

本番 migration は Fly.io deploy 時に `release_command` で実行されます。

```bash
pnpm prisma migrate deploy
```

## Check

- Fly.io deploy log で migration 成功を確認する
- `https://<your-app>.fly.dev/graphql` が `400` を返す

## Security

- 接続文字列は Git に書かない
- 漏れた場合は Neon で password を reset する
