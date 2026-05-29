# Architecture Definition: OB/OG Portal

## 1. Project Overview

**Goal:** 神戸電子専門学校のOB/OGと在校生を繋ぐポータルサイト

**Primary Features:**

- OB/OG情報の登録
- 一覧検索
- 閲覧
- 企業別の選考体験の登録・閲覧
- アバター画像のアップロード

**Constraints:**

- Node 22 LTS
- pnpm
- Docker Compose

## 2. Technology Stack

**Frontend:**

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4

**Backend:**

- NestJS 11
- GraphQL (Schema-first)
- Prisma 7

**Database:**

- PostgreSQL

**Tooling:**

- Biome (Lint/Format)
- shadcn/ui (UI Components)

## 3. Frontend Architecture (Web)

### 3.1 Component Strategy: Atomic Design

外部ライブラリ（shadcn/ui）への依存を疎結合にするため、atoms でラップする。

**Atoms**

- shadcn/ui の直接のラップ
- プロジェクト全体の共通スタイルや基本プロパティを定義

**Molecules**

- 複数の Atoms を組み合わせた構成要素
- 例: SearchField = Input + Button

**Organisms**

- 独立して機能する大きなパーツ
- 例: AlumniCard, RegistrationForm

**Templates**

- ページの骨格、レイアウト

**Pages**

- app/ 配下のディレクトリ
- データのフェッチ（Server Components）と Template への流し込みを担当

### 3.2 Data Fetching

- Server Components を基本として、データ取得はサーバーサイドで行う
- `web/src/graphql` に GraphQL 操作と TypeScript 型を集約し、ページやテンプレートへ渡すデータ形状を明示する
- App Router の Route Handler は、ブラウザから直接バックエンドに渡せない認証付き操作やアップロード前処理の中継を担当する

### 3.3 UI Design Rules

- 学科ごとの色は `web/src/lib/department-theme.ts` に集約し、一覧カード・詳細ヒーロー・アバター代替表示で同一の色を使う
- 学科カラーはプロフィール画像に左右されない固定背景として扱い、ヒーロー背景にアバター画像を混ぜない
- 一覧カードは企業数や連絡可否の違いで主要CTAの位置が大きくずれないよう、カード本文を縦方向に揃える
- 連絡CTAは公開プロフィールで設定されたX/Instagramリンクへ遷移し、メールアドレスを直接のユーザー導線にしない
- 選考ステップは「選考種別」を見出しにし、同じ内容のバッジを重複表示しない
- 入力フォームは自由記述を増やしすぎず、面接官人数など集計・比較しやすい項目は選択式にする

## 4. Backend Architecture (Service)

### 4.1 Layered Architecture, CQRS, and Light DDD

レイヤードアーキテクチャ + CQRS を基本に、重要ユースケースから段階的に DDD を適用する（Light DDD）。

- 公開プロフィール更新は Command として扱い、SNSリンクのURL正規化・許可ホスト判定は Domain の値オブジェクトで行う
- 一覧・詳細取得は Query として扱い、Application は Repository Port から読み取りモデルを受け取る
現時点の最優先ユースケースは `updateAlumniProfile`。

**Presentation Layer**

- Resolvers
- GraphQL エントリポイント
- 認証ガード、Transport入出力のマッピング
- 業務ルールは持たない

**Application Layer**

- **Commands:** 書き込み処理（登録・更新・削除）のユースケース調停
- **Queries:** 読み取り処理のユースケース調停
- **Ports:** Application が必要とする Repository / Storage などの抽象契約
- トランザクション境界、例外マッピング、ドメイン/インフラ調整を担当
- ビジネス不変条件（正規化や公開制約）は原則持たない
- Command / Query は Infrastructure の具象クラスではなく port に依存する

**Domain Layer**

- エンティティ、バリューオブジェクト、ポリシー、ドメインサービス
- ビジネス不変条件とルールの唯一の置き場
- 文字列正規化、重複排除、公開制約などの業務ルールを実装

**Infrastructure Layer**

- Prisma を使った永続化
- 外部API/ストレージ連携
- ドメイン判断は持たず、技術的実装に限定

### 4.2 Data Access

- Prisma 7 は永続化モデルとして利用し、ドメインモデルとは責務分離する
- 読み取りでは select を使って必要フィールドのみ取得する
- Repository で DTO へ整形し、Application へ返す
- API 契約（GraphQL schema / DTO 互換性）を維持しながら段階移行する

### 4.3 Selection Experience Model

選考体験は企業単位で管理する。

- `AlumniProfile` は複数の `AlumniCompany` を持つ
- `AlumniCompany` は任意で1つの `SelectionExperience` を持つ
- `SelectionExperience` は複数の `SelectionStep` を `sortOrder` 順に持つ
- `SelectionStep` は選考種別、実施形式、面接官人数、所要時間、質問、雰囲気、準備内容を持つ
- `SelectionStep` は面接・試験・課題などの具体的な接点を表し、内定そのものは選択肢として扱わない
- `SelectionStep` に補足名は持たせない。表示名は `stepKind` から導出し、後輩が読む本文情報へ入力負荷を寄せる

### 4.4 Storage Boundary

アバター画像は S3 互換ストレージへ直接アップロードする。

- サーバー内通信・削除処理は `ENDPOINT` を使う
- ブラウザが直接 `PUT` する署名付きURLは `PUBLIC_ENDPOINT` を使って生成する
- 保存する公開URLも `PUBLIC_ENDPOINT` から組み立てる
- ローカル MinIO では `ENDPOINT=http://minio:9000`、`PUBLIC_ENDPOINT=http://localhost:9000` のように内部向けとブラウザ向けを分ける

## 5. Directory Structure

- `web/src/components/atoms`: Wrapped shadcn/ui コンポーネント
- `web/src/components/molecules`: 複数atomsの組み合わせ
- `web/src/components/organisms`: 画面機能の主要ブロック
- `web/src/components/templates`: ページ構造テンプレート
- `web/src/app`: App Router ページ/ルートハンドラ
- `web/src/graphql`: GraphQL クエリ・型連携
- `web/src/lib/department-theme.ts`: 学科別の固定カラーパレット

- `service/src/modules/alumni/presentation`: Resolver・認証ガード適用・入出力マッピング
- `service/src/modules/alumni/application/commands`: 書き込みユースケース調停
- `service/src/modules/alumni/application/queries`: 読み取りユースケース調停
- `service/src/modules/alumni/application/ports`: Application が利用する外部依存の抽象契約
- `service/src/modules/alumni/domain/entities`: Domain Entity
- `service/src/modules/alumni/domain/value-objects`: Domain Value Object
- `service/src/modules/alumni/domain/errors`: Domain Error
- `service/src/modules/alumni/infrastructure`: Prisma 永続化・外部連携
- `service/src/common`: 共通認証/基盤
- `service/prisma`: Prisma schema と migration

## 6. Implementation Rules (For Copilot)

**Architecture First**

- 実装着手前に `Docs/Architecture.md` と `.github/copilot-instructions.md` の両方を確認すること
- 両者に差分がある場合はこのドキュメントを優先し、同一PRで整合させること
- 1PR 1ユースケースを基本に、段階的に DDD を適用すること

**Type Safety**

- GraphQL schema、DTO、`web/src/graphql/types.ts` のデータ形状を同じ変更単位で更新すること
- GraphQL の取得フィールドから削除した値は、フォーム状態・DTO・Repository select・Prisma schema まで同じタイミングで削除すること

**Component Creation**

- UIパーツを作成する際は、まず atoms に shadcn/ui をインポートし、それを他のコンポーネントで再利用すること

**CQRS**

- AlumniService に全てのロジックを詰め込まず、AlumniCommandService と AlumniQueryService に分けること
- Application 層は調停に集中し、業務ルールは Domain 層へ移譲すること
- Application 層から Infrastructure の具象クラスを直接 import せず、`application/ports` の抽象へ依存すること
- Infrastructure 実装は `AlumniModule` で port token に bind すること

**Tailwind 4**

- CSS-based な設定思想に基づき、インラインクラスでのスタイリングを優先すること

**Prisma**

- 読み取り専用のクエリでは、パフォーマンス向上のため select を使用して必要なフィールドのみを絞り込むこと

## 7. Security (MVP)

**Authentication**

- Google OAuth（既定: `@st.kobedenshi.ac.jp`、`AUTH_ALLOWED_DOMAINS` で変更可能）

**Authorization**

- 全ての GraphQL Resolver は GqlAuthGuard 等で保護すること
- プロフィール編集時は、userId がログインユーザー本人であることを必ず検証すること

## 8. Update Log (2026-02-19)

- `alumni` モジュールで Layer/CQRS の責務を再整理
  - QueryサービスでのDB更新副作用を除去
  - 返却DTOで role/status を解決して読み取り責務を維持
- 入力型を `application/dto/alumni.input.ts` に集約し、Resolver/Service の重複定義を削減
- Repository の `select` / DTO 変換の重複を統合して保守性を改善
- MinIO を使ったアバターアップロード（署名付きURL + URL保存）を実装

## 9. Update Log (2026-04-13)

- `alumni` モジュールで Light DDD 方針を明文化
  - Domain 層へ Entity / Value Object を追加
  - `updateAlumniProfile` の業務ルールを Domain に移譲
  - `updateInitialSettings` / `linkGmail` の検証ロジックを Domain モデル経由へ移行
- Domain Validation Error を導入し、Application で例外マッピングを統一
- Domain / Application の単体テストを拡充（Query service test を追加）

## 10. Update Log (2026-05-29)

- 選考体験をMVPの主要機能として整理
  - `AlumniCompany` / `SelectionExperience` / `SelectionStep` による企業別選考フローを明文化
  - `SelectionStep.stepTitle` を廃止し、選考種別を見出しとして扱う設計へ変更
  - 面接官人数を自由入力から選択式に変更し、`4以上` は「その他 / 複数人」として表示
- UIの情報設計を更新
  - 学科別カラーを `department-theme.ts` に集約
  - ヒーロー背景からアバター画像オーバーレイを外し、学科カラーを一貫表示
  - 一覧カードのバッジを削減し、主要CTAの位置が揃うように調整
- ストレージ境界を更新
  - ブラウザ用の署名付きアップロードURLは `PUBLIC_ENDPOINT` で生成
  - サーバー内部のS3操作は `ENDPOINT` を使い続ける
