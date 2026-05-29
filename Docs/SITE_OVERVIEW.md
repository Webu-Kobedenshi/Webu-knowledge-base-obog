# Webu-Portal サイト概要

## プロジェクト概要

**Webu Portal** は、神戸電子専門学校の学生サークル「We部」が運営する **OB/OG（卒業生）ポータルサイト**。在校生が卒業生の内定先・就職先情報を閲覧でき、卒業生は自分のプロフィールを後輩に公開して就活支援やネットワーキングに貢献できる。

---

## 技術スタック

### フロントエンド（`web/`）
- **Next.js 16** (App Router / React 19)
- **TypeScript 5**
- **Tailwind CSS 4**
- **NextAuth v4**（認証）
- **Biome**（リント & フォーマッター）
- **Geist**（フォント）

### バックエンド（`service/`）
- **NestJS 11**
- **GraphQL**（Apollo Server 5 + @nestjs/graphql）
- **Prisma 7**（ORM）+ PostgreSQL
- **AWS SDK v3** / MinIO（S3互換オブジェクトストレージ、アバター画像保管）
- **jose**（JWT認証）

### インフラ
- **Fly.io**（本番デプロイ）
  - アプリ名: `webu-portal-service-rion0910`
  - リージョン: `nrt`（東京）
  - VM: `shared-cpu-1x` / 512MB
- **Docker Compose**（ローカル開発環境）
  - PostgreSQL / MinIO / Service / Web の4コンテナ構成

---

## ユーザーロール

| ロール | 説明 |
|---|---|
| `STUDENT`（在校生） | デフォルトロール。OB/OG 一覧を閲覧できる |
| `ALUMNI`（卒業生） | 入学年度＋修業年数から自動判定。プロフィールを公開可能 |
| `ADMIN`（管理者） | 管理者権限 |

### ユーザーステータス

| ステータス | 説明 |
|---|---|
| `ENROLLED` | 在学中 |
| `GRADUATED` | 卒業済み（入学年度＋修業年数で自動判定） |
| `WITHDRAWN` | 退学・休学 |

---

## 学科一覧と修業年数

学科を選択すると修業年数は自動的に決定される。

| 年数 | 学科 |
|---|---|
| **4年制** | ITエキスパート、ゲーム開発研究 |
| **3年制** | ITスペシャリスト、ゲームエンジニア |
| **2年制** | 情報処理、プログラミング、AIシステム開発、情報ビジネス、情報工学、ゲーム制作、esportsエンジニア、CGアニメーション、デジタルアニメ、グラフィックデザイン、インダストリアルデザイン、建築、サウンドクリエイト、サウンドテクニック、声優、国際コミュニケーション、その他 |
| **1年制** | 総合研究科 |

---

## ページ構成と機能

### 1. ログインページ (`/login`)
- NextAuth によるソーシャルログイン
- 未認証ユーザーは全ページからここにリダイレクト

### 2. 初期設定ページ (`/initial-setup`)
- 初回ログイン後に表示
- 名前、学籍番号、入学年度、学科を入力（修業年数は学科から自動設定）
- 入力完了後、メインページへリダイレクト

### 3. メインページ / OB・OG一覧 (`/`)
- **卒業生カード一覧表示**: アバター、表示名、所属学科、卒業年度、内定先企業名を表示
- **学科カラー表示**: 学科ごとの固定グラデーションをカード背景に適用
- **検索・フィルタ機能**:
  - 学科で絞り込み
  - 卒業年度で絞り込み
  - 企業名でテキスト検索（300ms デバウンス付き）
  - 表示件数切替（10/20/50件）
- **ページネーション**: 前後ページナビゲーション
- **アカウントバッジ**: ヘッダーに自分の名前・ロール表示、マイページへのリンク

### 4. アカウント（マイページ） (`/account`)
- **プロフィールヒーロー**: グラデーション背景 + アバター + 名前 + メール + ロールバッジ
- **基本情報セクション**（必須）:
  - 名前、学籍番号、入学年度、学科（修業年数は自動）
- **公開プロフィール設定セクション**（任意）:
  - **公開トグル**: ON にすると以下が入力・表示可能
  - プロフィール画像アップロード（MinIO/S3 署名付きURL方式）
  - 表示名（必須）
  - X / Instagram のリンク + 連絡受付トグル
  - 内定先・勤務先（複数登録可、公開時は1件以上必須）
  - 企業別の選考体験（任意）
  - 備考欄
  - スキル、ポートフォリオURL、学チカ、役に立った授業
  - Progressive Disclosure: 非公開時はフォーム全体がブラー＋ロックアイコン表示
- **アカウント操作**: アカウント削除機能

### 5. OB・OG詳細 (`/alumni/[id]`)
- **プロフィールヒーロー**: 学科別の固定グラデーション、アバター、表示名、学科、卒業年度、内定先を表示
- **企業別の選考体験**:
  - 複数企業がある場合は企業タブで切り替え
  - エントリーのきっかけ、選考ステップ、質問、雰囲気、準備内容、全体Tipsを表示
  - 選考種別はステップ見出しとして表示し、同一内容のバッジは表示しない
- **深掘り情報**: スキル、ポートフォリオ、学チカ、役に立った授業を必要に応じて表示

---

## API エンドポイント

### フロントエンド API Routes（`web/src/app/api/`）
| パス | メソッド | 機能 |
|---|---|---|
| `/api/account/profile` | POST | プロフィール更新（基本情報 + 公開プロフィール） |
| `/api/account/avatar/upload-url` | POST | アバター画像アップロード用の署名付きURL取得 |
| `/api/account/avatar/complete` | POST | アバターURL保存完了通知 |
| `/api/account/delete` | POST/DELETE | アカウント削除 |
| `/api/auth/[...nextauth]` | GET/POST | NextAuth 認証エンドポイント |

### バックエンド GraphQL（`service/`）
| クエリ/ミューテーション | 機能 |
|---|---|
| `getMyProfile` | 自分のプロフィール取得 |
| `getAlumniList` | 卒業生一覧取得（学科・企業名・卒業年度フィルタ、ページネーション） |
| `updateInitialSettings` | 初期設定更新（名前・学籍番号・入学年度・学科） |
| `updateAlumniProfile` | 公開プロフィール更新 |

---

## データモデル（Prisma）

### User
- id, email, name, studentId, role, status
- enrollmentYear（入学年度）, durationYears（修業年数、学科から自動導出）, department（学科）
- 1対1: AlumniProfile

### AlumniProfile
- nickname, graduationYear, department, companyNames
- remarks, contactEmail（互換用）, xUrl, instagramUrl, avatarUrl
- skills, portfolioUrl, gakuchika, usefulCoursework
- isPublic, acceptContact
- 1対多: AlumniCompany, AlumniImage
- 現行UIのプロフィール画像は `avatarUrl` を主に参照する

### AlumniCompany
- companyName（ユニーク制約: alumniProfileId + companyName）
- 任意で 1対1: SelectionExperience

### AlumniImage
- url, caption, sortOrder
- 現時点ではプロフィール表示の主導データではなく、画像拡張用の永続化モデル

### SelectionExperience
- entryTrigger, overallTip
- 1対多: SelectionStep

### SelectionStep
- stepKind, format, interviewerCount, durationMinutes
- questions, atmosphere, preparation
- sortOrder
- 補足名は持たず、表示名は stepKind から導出する
- 内定は選考ステップとして新規入力しない

---

## ドメインロジック

### 卒業判定 (`graduation-policy.ts`)
- `卒業年度 = 入学年度 + 修業年数`
- `現在年 > (入学年度 + 修業年数 - 1)` で卒業済みと判定

### ロール自動遷移 (`user-role-transition.ts`)
- 卒業判定に基づき `STUDENT → ALUMNI`、`ENROLLED → GRADUATED` に自動遷移

### 学科→年数マッピング (`department-duration.ts`)
- 学科enum から修業年数を自動導出（上記の学科一覧参照）

---

## UI/UX 特徴

- **ダーク/ライトモード対応**
- **学科別カラー**: 学科ごとに固定したグラデーションカラーを一覧・詳細で一貫適用
- **情報密度の調整**: 重複バッジを減らし、選考体験の本文情報を読みやすく配置
- **安定したカードレイアウト**: 企業数や連絡可否が違っても主要CTAの位置が大きくずれない
- **外部SNS連絡導線**: 連絡CTAは設定済みのX/Instagramリンクへ遷移し、未設定時は受付不可表示にする
- **Progressive Disclosure**: 公開プロフィール設定は非公開時にブラー表示
- **レスポンシブ対応**: モバイル〜デスクトップまで最適化されたレイアウト
- **Atomic Design**: atoms → molecules → organisms → templates のコンポーネント階層
