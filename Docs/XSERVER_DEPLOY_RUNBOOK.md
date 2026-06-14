# Xserver Deploy Runbook

このドキュメントは、以降の開発者が `web-u.dev` の Xserver 環境へ自立してデプロイできるようにするための手順書です。

既存の要点メモは [DEPLOY_XSERVER.md](./DEPLOY_XSERVER.md) にあります。この runbook では、初回構築、通常リリース、検証、ロールバック、トラブル対応までを一連の作業として扱います。

## 現在の構成

```text
Internet
  |
  | https://web-u.dev
  v
Caddy container :80/:443
  |
  v
Next.js web container :3000
  |
  | GRAPHQL_ENDPOINT=http://service:4000/graphql
  v
NestJS service container :4000
  |
  +-- Neon PostgreSQL
  +-- Cloudflare R2
  +-- Google OAuth
```

Xserver 上では `compose.xserver.yml` で `caddy`、`web`、`service` の 3 コンテナを起動します。DB と画像ストレージは Xserver 内に持たず、Neon と Cloudflare R2 を使います。

## 管理対象ファイル

- `compose.xserver.yml`: Xserver 用 Docker Compose
- `deploy/xserver/Caddyfile`: `web-u.dev` / `www.web-u.dev` の reverse proxy
- `web/Dockerfile.xserver`: Next.js production build
- `service/Dockerfile.xserver`: NestJS production build
- `.env.xserver.example`: 本番環境変数テンプレート
- `Docs/XSERVER_DEPLOY_RUNBOOK.md`: この手順書

`.env.xserver` は秘密情報を含むため Git に commit しません。

## 前提条件

### アクセス

- Xserver に SSH ログインできる
- SSH ユーザー: `webu`
- 接続先 IP: `162.43.91.89`
- サーバー上で Docker / Docker Compose を実行できる
- 80 / 443 / 443 UDP が外部から到達できる

```bash
ssh webu@162.43.91.89
docker --version
docker compose version
```

Docker を実行できない場合は、まず Xserver 側で Docker 利用権限または Docker インストール状態を確認してください。

### DNS

`name.com` で以下の A レコードを設定します。

```text
Type: A
Host: @
Value: 162.43.91.89
```

```text
Type: A
Host: www
Value: 162.43.91.89
```

反映確認:

```bash
dig +short web-u.dev
dig +short www.web-u.dev
```

どちらも `162.43.91.89` を返すことを確認します。

### 外部サービス

本番デプロイ前に以下を準備します。

- Neon PostgreSQL の Direct connection URL
- Cloudflare R2 bucket と S3 API token
- Google Cloud Console の OAuth Client
- 管理者として seed するメールアドレス

関連ドキュメント:

- [DEPLOY_NEON.md](./DEPLOY_NEON.md)
- [DEPLOY_R2.md](./DEPLOY_R2.md)
- [OPERATIONS_SPEC.md](./OPERATIONS_SPEC.md)
- [DATABASE_MIGRATION.md](./DATABASE_MIGRATION.md)

## Google OAuth 設定

Google Cloud Console の OAuth Client に `web-u.dev` を登録します。

Authorized JavaScript origins:

```text
https://web-u.dev
```

Authorized redirect URIs:

```text
https://web-u.dev/api/auth/callback/google
https://web-u.dev/api/account/gmail/verify/callback
```

設定漏れがあると、通常ログインまたは卒業後ログイン用 Gmail 紐づけが失敗します。

## Cloudflare R2 設定

R2 bucket の CORS に `https://web-u.dev` を含めます。

```json
[
  {
    "AllowedOrigins": ["https://web-u.dev"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

移行期間中に旧 Vercel URL も使う場合は、旧 URL も `AllowedOrigins` に残します。

## 環境変数

サーバー上のリポジトリルートで `.env.xserver` を作成します。

```bash
cp .env.xserver.example .env.xserver
chmod 600 .env.xserver
vi .env.xserver
```

設定する値:

| 変数 | 用途 | 注意 |
| --- | --- | --- |
| `NEXTAUTH_URL` | NextAuth の公開 URL | `https://web-u.dev` |
| `NEXTAUTH_SECRET` | NextAuth secret | 強いランダム文字列 |
| `AUTH_JWT_SECRET` | web-service 間 JWT secret | `web` と `service` で同じ値になる。`.env.xserver` は両方のコンテナに渡される |
| `AUTH_ALLOWED_DOMAINS` | ログイン許可ドメイン | 例: `st.kobedenshi.ac.jp,gmail.com` |
| `ADMIN_SEED_EMAILS` | 管理者 seed 対象 | カンマ区切り |
| `GRAPHQL_ENDPOINT` | web から service への GraphQL URL | Compose 内では `http://service:4000/graphql` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Google Cloud Console から取得 |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Google Cloud Console から取得 |
| `DATABASE_URL` | Neon PostgreSQL URL | Direct URL、`sslmode=require` 必須 |
| `PORT` | service port | Compose で `4000` を指定 |
| `CORS_ORIGINS` | service CORS 許可 origin | `https://web-u.dev` |
| `ENDPOINT` | R2 S3 endpoint | 例: `https://<account-id>.r2.cloudflarestorage.com` |
| `PUBLIC_UPLOAD_ENDPOINT` | ブラウザ PUT 用 endpoint | R2 S3 endpoint |
| `PUBLIC_ENDPOINT` | 画像公開 URL | 公開配信用 domain |
| `ACCESS_KEY` | R2 access key ID | Git に書かない |
| `SECRET_KEY` | R2 secret access key | Git に書かない |
| `BUCKET_NAME` | R2 bucket name | 例: `webu-portal` |

secret を生成する例:

```bash
openssl rand -base64 32
```

`.env.xserver` の構文確認:

```bash
XSERVER_ENV_FILE=.env.xserver docker compose -f compose.xserver.yml config
```

このコマンドは環境変数を展開して表示するため、出力をチャットや Issue に貼らないでください。

## 初回デプロイ

### 1. サーバーにログインする

```bash
ssh webu@162.43.91.89
```

初回ログイン直後で初期パスワードのままなら変更します。

```bash
passwd
```

### 2. リポジトリを配置する

まだ clone していない場合:

```bash
mkdir -p ~/apps
cd ~/apps
git clone https://github.com/Webu-Kobedenshi/Webu-knowledge-base-obog.git
cd Webu-knowledge-base-obog
```

すでに clone 済みの場合:

```bash
cd ~/apps/Webu-knowledge-base-obog
git fetch origin
```

本番反映は原則 `release` ブランチから行います。

```bash
git checkout release
git pull --ff-only origin release
```

緊急時に特定 commit を反映する場合は、作業ログに commit hash を残してください。

### 3. `.env.xserver` を作る

```bash
cp .env.xserver.example .env.xserver
chmod 600 .env.xserver
vi .env.xserver
```

編集後に Compose 設定を検証します。

```bash
XSERVER_ENV_FILE=.env.xserver docker compose -f compose.xserver.yml config
```

### 4. コンテナを build / 起動する

```bash
docker compose -f compose.xserver.yml up -d --build
```

状態確認:

```bash
docker compose -f compose.xserver.yml ps
docker compose -f compose.xserver.yml logs --tail=100 web service caddy
```

### 5. DB migration を適用する

```bash
docker compose -f compose.xserver.yml exec service pnpm prisma migrate deploy
```

状態確認:

```bash
docker compose -f compose.xserver.yml exec service pnpm prisma migrate status
```

### 6. 管理者メールを seed する

```bash
docker compose -f compose.xserver.yml exec service pnpm db:seed:admin-emails
```

`ADMIN_SEED_EMAILS` を変更したときもこのコマンドを再実行します。

## 通常リリース手順

### 1. ローカルで release ブランチを準備する

開発フローは [GIT_WORKFLOW.md](./GIT_WORKFLOW.md) に従います。

本番反映前にローカルで最低限以下を通します。

```bash
pnpm typecheck
pnpm lint:check
```

Prisma schema を変更した場合は、migration SQL が commit されていることを確認します。

```bash
git status --short
find service/prisma/migrations -maxdepth 2 -name migration.sql
```

### 2. サーバーで最新 release を取得する

```bash
ssh webu@162.43.91.89
cd ~/apps/Webu-knowledge-base-obog
git fetch origin
git checkout release
git pull --ff-only origin release
```

反映対象を記録します。

```bash
git rev-parse --short HEAD
git log -1 --oneline
```

### 3. build / 起動する

```bash
docker compose -f compose.xserver.yml up -d --build
```

`caddy:2-alpine` の更新も取り込みたい場合:

```bash
docker compose -f compose.xserver.yml pull caddy
docker compose -f compose.xserver.yml up -d --build
```

### 4. migration を適用する

```bash
docker compose -f compose.xserver.yml exec service pnpm prisma migrate deploy
```

### 5. 必要に応じて管理者 seed を再実行する

```bash
docker compose -f compose.xserver.yml exec service pnpm db:seed:admin-emails
```

### 6. リリース後確認を行う

```bash
docker compose -f compose.xserver.yml ps
docker compose -f compose.xserver.yml logs --tail=100 web service caddy
curl -I https://web-u.dev
curl -I https://www.web-u.dev
```

期待値:

- `https://web-u.dev` が `200` 系を返す
- `https://www.web-u.dev` が `https://web-u.dev` に redirect される
- `web` / `service` / `caddy` が `Up` になる
- `service` logs に migration 後の起動エラーがない

ブラウザで確認すること:

1. `https://web-u.dev` が表示される
2. Google ログインできる
3. OB/OG 一覧が表示される
4. `/account` の保存が成功する
5. アバター画像アップロードが成功する
6. `https://www.web-u.dev` が `https://web-u.dev` にリダイレクトされる

## よく使う運用コマンド

```bash
# コンテナ状態
docker compose -f compose.xserver.yml ps

# ログ確認
docker compose -f compose.xserver.yml logs -f
docker compose -f compose.xserver.yml logs -f web
docker compose -f compose.xserver.yml logs -f service
docker compose -f compose.xserver.yml logs -f caddy

# 再起動
docker compose -f compose.xserver.yml restart web
docker compose -f compose.xserver.yml restart service
docker compose -f compose.xserver.yml restart caddy

# 再 build
docker compose -f compose.xserver.yml up -d --build

# 停止
docker compose -f compose.xserver.yml down

# Caddy 設定確認
docker compose -f compose.xserver.yml exec caddy caddy validate --config /etc/caddy/Caddyfile
```

## ロールバック

アプリケーションだけを前の commit に戻す場合:

```bash
cd ~/apps/Webu-knowledge-base-obog
git log --oneline -5
git checkout <previous-good-commit>
docker compose -f compose.xserver.yml up -d --build
docker compose -f compose.xserver.yml logs --tail=100 web service caddy
```

注意:

- `prisma migrate deploy` 済みの DB migration は自動では戻りません。
- 後方互換のない migration を含むリリースは、単純な `git checkout` だけでは安全に戻せない可能性があります。
- DB を戻す必要がある場合は、Neon の backup / restore 方針に従います。
- rollback 後は、原因を修正した forward fix を `release` に入れるのを基本にします。

`release` ブランチへ戻す場合:

```bash
git checkout release
git pull --ff-only origin release
docker compose -f compose.xserver.yml up -d --build
```

## トラブルシューティング

### 502 / 503 が出る

Caddy が `web` に到達できていない可能性があります。

```bash
docker compose -f compose.xserver.yml ps
docker compose -f compose.xserver.yml logs --tail=200 caddy
docker compose -f compose.xserver.yml logs --tail=200 web
```

確認点:

- `web` container が `Up` か
- `web` が `PORT=3000` で起動しているか
- `caddy` と `web` が同じ `webu-portal-network` にいるか

### Google ログインが失敗する

確認点:

- `.env.xserver` の `NEXTAUTH_URL=https://web-u.dev`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` が本番 OAuth Client の値
- Google Cloud Console の redirect URI に以下がある

```text
https://web-u.dev/api/auth/callback/google
https://web-u.dev/api/account/gmail/verify/callback
```

ログ:

```bash
docker compose -f compose.xserver.yml logs --tail=200 web
```

### GraphQL 呼び出しが失敗する

確認点:

- `.env.xserver` の `GRAPHQL_ENDPOINT=http://service:4000/graphql`
- `.env.xserver` の `AUTH_JWT_SECRET` が web と service で同じ値
- `service` が起動している

```bash
docker compose -f compose.xserver.yml logs --tail=200 web service
docker compose -f compose.xserver.yml exec web wget -S -O - http://service:4000/graphql
```

GraphQL endpoint は GET だと `400` を返すことがあります。到達確認としては、名前解決や HTTP 応答が返ることを見ます。

### DB migration が失敗する

```bash
docker compose -f compose.xserver.yml exec service pnpm prisma migrate status
docker compose -f compose.xserver.yml logs --tail=200 service
```

確認点:

- `DATABASE_URL` が Neon Direct URL になっている
- `sslmode=require` が付いている
- migration SQL に危険な `DROP` や既存データに対する `NOT NULL` 追加がない

危険な migration の扱いは [DATABASE_MIGRATION.md](./DATABASE_MIGRATION.md) を参照してください。

### 画像アップロードが失敗する

確認点:

- R2 CORS に `https://web-u.dev` が入っている
- `PUBLIC_UPLOAD_ENDPOINT` がブラウザから到達できる R2 S3 endpoint
- `PUBLIC_ENDPOINT` が公開配信用 URL
- `ACCESS_KEY` / `SECRET_KEY` / `BUCKET_NAME` が正しい

ログ:

```bash
docker compose -f compose.xserver.yml logs --tail=200 service web
```

### SSL 証明書が発行されない

Caddy は自動で証明書を取得します。

確認点:

- DNS が `162.43.91.89` を向いている
- 80 / 443 が外部から到達できる
- `deploy/xserver/Caddyfile` の domain が正しい

```bash
dig +short web-u.dev
docker compose -f compose.xserver.yml logs --tail=200 caddy
```

## 定期メンテナンス

- Neon の backup / restore 方針を確認する
- R2 bucket の利用量と公開 URL を確認する
- Xserver の disk 使用量を確認する
- Docker image / build cache が肥大化したら掃除する

```bash
df -h
docker system df
```

不要な image を消す場合は、稼働中 container に影響しないことを確認してから実行します。

```bash
docker image prune
```

## 作業完了チェックリスト

デプロイ担当者は、完了時に以下を PR または作業ログへ残します。

- 反映した branch / commit hash
- 実行したコマンド
- migration の有無
- `docker compose ps` の結果
- `curl -I https://web-u.dev` の結果
- ブラウザで確認した項目
- 問題があった場合の暫定対応と残課題
