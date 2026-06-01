# Site Overview

サイトの画面と主な機能の概要です。

## Product

We部が運営する OB/OG 就活ナレッジベースです。

在校生は先輩の内定先や選考体験を閲覧できます。
卒業生は公開プロフィールを登録し、後輩からの相談導線を持てます。

## Roles

- `STUDENT`: 一覧と詳細を閲覧する
- `ALUMNI`: 公開プロフィールを登録する
- `ADMIN`: 管理者として利用する

## Pages

### `/login`

Google OAuth でログインします。

### `/initial-setup`

初回ログイン後に必要な基本情報を登録します。

- 名前
- 学籍番号
- 入学年度
- 学科

### `/`

OB/OG の一覧です。

- 学科で絞り込み
- 卒業年度で絞り込み
- 企業名で検索
- 表示件数を `12 / 24 / 36 / 48` から選択
- ページネーション

### `/alumni/[id]`

OB/OG の詳細ページです。

- プロフィール
- 内定先、就職先
- 企業別の選考体験
- スキル、ポートフォリオ、学チカ、役に立った授業
- X / Instagram の連絡導線

### `/account`

自分のアカウントと公開プロフィールを編集します。

- 基本情報
- アバター画像
- 公開プロフィール
- 引き継ぎ Gmail
- アカウント削除

### `/account/public`

公開プロフィールの編集に集中するページです。

## API Routes

- `/api/auth/[...nextauth]`: NextAuth
- `/api/account/profile`: プロフィール更新
- `/api/account/avatar/upload-url`: 画像 upload URL 発行
- `/api/account/avatar/complete`: avatar URL 保存
- `/api/account/gmail`: 引き継ぎ Gmail 更新
- `/api/account/gmail/verify/start`: Gmail 確認開始
- `/api/account/gmail/verify/callback`: Gmail 確認 callback
- `/api/account/delete`: アカウント削除

## GraphQL

主な query / mutation:

- `getMyProfile`
- `getAlumniList`
- `getAlumniListItems`
- `getAlumniDetail`
- `updateInitialSettings`
- `updateAlumniProfile`
- `updateAvatar`
- `linkGmail`
- `deleteMyAccount`

## Data Model

- `User`: アカウント基本情報
- `AdminEmail`: 管理者メール
- `AlumniProfile`: 公開プロフィール
- `AlumniCompany`: 企業情報
- `SelectionExperience`: 企業別の選考体験
- `SelectionStep`: 選考ステップ

## UI Notes

- 学科ごとに固定カラーを使う
- 一覧カードは高さと CTA 位置を揃える
- 読み込みが遅いときは skeleton を表示する
- 詳細リンクの遷移中は loading 表示にする
- UI component は atomic design に沿って配置する
