# Operations Spec

運用上のルールをまとめます。

## Authentication

- Google OAuth を使う
- NextAuth は JWT session strategy
- GraphQL は service 用 JWT で呼び出す
- GraphQL resolver は `GqlAuthGuard` で保護する

## Allowed Users

ログインできるユーザー:

- `AUTH_ALLOWED_DOMAINS` に含まれるドメイン
- `AdminEmail` に登録されたメール
- `linkedGmail` として登録済みの Gmail

教職員形式の学校メールは、`AdminEmail` に登録されている場合のみ管理者として扱います。

## Initial Setup

初回ログイン後、以下が未設定なら `/initial-setup` に誘導します。

- `studentId`
- `enrollmentYear`
- `durationYears`
- `department`

`durationYears` は学科から決定します。

## Role Transition

卒業判定:

```text
currentYear > enrollmentYear + durationYears - 1
```

条件を満たすと返却上は以下として扱います。

- `role`: `STUDENT` -> `ALUMNI`
- `status`: `ENROLLED` -> `GRADUATED`

## Public Profile

公開プロフィールの主なルール:

- `isPublic=true` の場合は企業を 1 件以上登録する
- `acceptContact=true` の場合は X または Instagram の URL を使う
- SNS URL は許可された host のみ保存する
- 選考体験は企業ごとに任意で登録する
- 空の選考体験や空のステップは保存前に整理する

## Avatar Upload

1. `POST /api/account/avatar/upload-url`
2. browser が署名付き URL に `PUT`
3. `POST /api/account/avatar/complete`
4. `avatarUrl` を保存する

## Linked Gmail

卒業後もログインできるように、在学中に Gmail を紐づけます。

Flow:

1. `/api/account/gmail/verify/start`
2. Google OAuth
3. `/api/account/gmail/verify/callback`
4. Gmail の verified email を保存する

Google OAuth には以下の redirect URI が必要です。

```text
http://localhost:3000/api/account/gmail/verify/callback
https://<production-web-domain>/api/account/gmail/verify/callback
```

## Account Delete

アカウント削除時は `User` を削除します。
関連する公開プロフィールや企業情報は Prisma の cascade で削除されます。

## Admin Email

管理者メールは `ADMIN_SEED_EMAILS` から seed します。

```bash
pnpm prisma:seed:admin-emails
```

本番では Fly.io 上で実行します。

```bash
flyctl ssh console -C "cd /app/service && pnpm db:seed:admin-emails"
```
