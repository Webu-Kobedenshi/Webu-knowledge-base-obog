# 運用仕様書: 神戸電子 OB・OG ポータル

## 1. 目的

本仕様書は、OB・OGポータルの運用メカニズムを「認証」「権限変換」「公開データ統制」の観点で定義する。

---

## 2. 運用ポリシー（MVP）

### 2.1 認証

- Google OAuth を使用
- 許可ドメインのみログイン可能（`AUTH_ALLOWED_DOMAINS`、既定: `st.kobedenshi.ac.jp`）
- 認証済みトークンで GraphQL API を保護

### 2.2 初期設定の必須項目

初回セットアップで以下を必須入力とする。

1. 学籍番号（`studentId`）
2. 入学年度（`enrollmentYear`）
3. 年制（`durationYears`: 1/2/3/4）
4. 学科（`department` Enum）

### 2.3 ロール/ステータスの動的変換

- 判定式: `現在年度 > (入学年度 + 年制 - 1)`
- 成立時:
  - `role: STUDENT -> ALUMNI`
  - `status: ENROLLED -> GRADUATED`
- 判定タイミング:
  - `getMyProfile` 実行時に再計算
  - 現在は「返却値への反映」を行い、Query内でDB更新は行わない（CQRSの読み取り責務を維持）

### 2.4 公開プロフィール運用

公開プロフィール（`updateAlumniProfile`）では以下項目を更新可能。

更新対象:

- `companyNames`（複数）
- `companyExperiences`（企業別の選考体験）
- `nickname`
- `remarks`
- `contactEmail`
- `xUrl`
- `instagramUrl`
- `isPublic`
- `acceptContact`
- `skills`
- `portfolioUrl`
- `gakuchika`
- `usefulCoursework`

運用ルール:

- `acceptContact=true` の公開プロフィールは、原則として `xUrl` または `instagramUrl` のどちらかを設定する
- SNSリンクはX（`x.com` / `twitter.com`）またはInstagram（`instagram.com` / `ig.me`）のURLとしてDomain層で検証する

- `isPublic=true` の場合、`companyNames` は1件以上必須
- 選考体験は企業ごとに任意登録とし、全ての内定先に入力する必要はない
- 選考ステップは `stepKind` を見出しとして扱い、補足名は保持しない
- 内定は選考ステップとして新規入力せず、面接・試験・課題など後輩が準備に使える接点だけを登録する
- 面接官人数は `1 / 2 / 3 / その他` の選択式で扱い、保存上は `4以上` を「その他 / 複数人」として表示する
- 画像は `getUploadUrl` で署名付きURLを取得し、アップロード後 `updateAvatar` でURLを保存
- 署名付きアップロードURLはブラウザから到達可能な `PUBLIC_ENDPOINT` で生成し、サーバー内部のS3操作は `ENDPOINT` を使う
- ※要件上の「ALUMNI限定編集」は今後の厳格化対象（現実装は本人トークン前提の更新）

---

## 3. 公開データ抽出ルール（一覧表示）

一覧表示に含める条件:

1. `alumniProfile.isPublic == true`

追加フィルタ:

- 学科（`department`）
- 企業名キーワード（`companyNames contains`、大文字小文字非区別）

---

## 4. 主要ユーザーフロー

### 4.1 初回ログイン

1. ログイン成功
2. `getMyProfile` 実行
3. 初期設定未完了（必須4項目が欠落）なら `/initial-setup` へリダイレクト
4. 初期設定保存

### 4.2 在校生フェーズ（STUDENT）

- 一覧閲覧のみ
- 公開プロフィール編集は不可（UI上メッセージ表示）

### 4.3 卒業後フェーズ（ALUMNI）

1. `getMyProfile` 実行時にロール/ステータスを再計算
2. アカウントページで公開プロフィールを更新
3. `isPublic=true` の場合、一覧に表示対象となる

### 4.4 アバター更新フロー

1. `POST /api/account/avatar/upload-url`
2. `PUBLIC_ENDPOINT` で署名されたURLへブラウザから `PUT`
3. `POST /api/account/avatar/complete` で `avatarUrl` を永続化

### 4.5 選考体験更新フロー

1. 公開プロフィール設定で企業を登録
2. 企業ごとに「この企業の選考体験を書く」を任意で有効化
3. `entryTrigger`、`overallTip`、`steps` を `POST /api/account/profile` 経由で更新
4. Domain 層で空の体験・空のステップを正規化し、Repository が企業単位で `SelectionExperience` / `SelectionStep` を再作成する

---

## 5. セキュリティ/整合性

- GraphQL Resolver は `GqlAuthGuard` で保護
- 初期設定更新時に入力値バリデーション（年制 1/2/3/4 等）
- 公開プロフィール更新時は公開条件を検証（公開時の company 必須）
- 選考体験の空行、重複企業名、無効な enum 値は Domain 層で正規化・検証
- 退会時は `onDelete: Cascade` により関連データを物理削除

---

## 6. 実装反映箇所

### Backend

- `service/src/modules/alumni/domain/graduation-policy.ts`
- `service/src/modules/alumni/application/commands/alumni-command.service.ts`
- `service/src/modules/alumni/application/queries/alumni-query.service.ts`
- `service/src/modules/alumni/infrastructure/alumni.repository.ts`
- `service/src/modules/alumni/presentation/alumni.graphql`
- `service/src/modules/alumni/presentation/alumni.resolver.ts`
- `service/src/modules/alumni/infrastructure/storage.service.ts`

### Frontend

- `web/src/app/page.tsx`
- `web/src/app/account/page.tsx`
- `web/src/app/initial-setup/page.tsx`
- `web/src/components/organisms/account-profile-form.tsx`
- `web/src/graphql/alumni.ts`
- `web/src/graphql/account.ts`
- `web/src/app/api/account/profile/route.ts`
- `web/src/app/api/account/avatar/upload-url/route.ts`
- `web/src/app/api/account/avatar/complete/route.ts`
- `web/src/app/api/account/delete/route.ts`

---

## 7. 今後の運用拡張

- 学籍番号の実名簿照合（外部マスタ連携）
- 管理者監査ログ（更新履歴・公開切替履歴）
- 公開プロフィールの承認ワークフロー
