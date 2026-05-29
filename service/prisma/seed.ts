import { PrismaPg } from "@prisma/adapter-pg";
import {
  Department,
  PrismaClient,
  Role,
  SelectionFormat,
  SelectionStepKind,
  UserStatus,
} from "@prisma/client";
import { Pool } from "pg";

const SEED_EMAIL_DOMAIN = "seed.kobedenshi.ac.jp";

type SeedStep = {
  stepKind: SelectionStepKind;
  stepTitle?: string;
  format?: SelectionFormat;
  interviewerCount?: number;
  durationMinutes?: number;
  questions?: string;
  atmosphere?: string;
  preparation?: string;
};

type SeedCompany = {
  companyName: string;
  selectionExperience?: {
    entryTrigger?: string;
    overallTip?: string;
    steps: SeedStep[];
  };
};

type SeedAlumni = {
  emailLocal: string;
  name: string;
  nickname: string;
  enrollmentYear: number;
  department: Department;
  companies: SeedCompany[];
  remarks: string;
  skills: string[];
  portfolioUrl?: string;
  gakuchika: string;
  entryTrigger: string;
  interviewTip: string;
  usefulCoursework: string;
  acceptContact: boolean;
};

const departmentDurationYears: Record<Department, number> = {
  IT_EXPERT: 4,
  IT_SPECIALIST: 3,
  INFORMATION_PROCESS: 2,
  PROGRAMMING: 2,
  AI_SYSTEM: 2,
  ADVANCED_STUDIES: 1,
  INFO_BUSINESS: 2,
  INFO_ENGINEERING: 2,
  GAME_RESEARCH: 4,
  GAME_ENGINEER: 3,
  GAME_SOFTWARE: 2,
  ESPORTS: 2,
  CG_ANIMATION: 2,
  DIGITAL_ANIME: 2,
  GRAPHIC_DESIGN: 2,
  INDUSTRIAL_DESIGN: 2,
  ARCHITECTURAL: 2,
  SOUND_CREATE: 2,
  SOUND_TECHNIQUE: 2,
  VOICE_ACTOR: 2,
  INTERNATIONAL_COMM: 2,
  OTHERS: 2,
};

const commonQuestions =
  "自己紹介、志望理由、学生時代に力を入れたこと、制作物で工夫した点、チーム開発で困ったことをどう解決したか。";

const engineeringFlow = (options?: {
  entryTrigger?: string;
  coding?: boolean;
  finalFormat?: SelectionFormat;
}): SeedCompany["selectionExperience"] => ({
  entryTrigger: options?.entryTrigger ?? "学校求人",
  steps: [
    {
      stepKind: SelectionStepKind.DOCUMENT_SCREENING,
      stepTitle: "エントリーシート・ポートフォリオ提出",
      format: SelectionFormat.UNKNOWN,
      durationMinutes: 0,
      questions: "ポートフォリオURL、使用技術、制作期間、担当範囲を記入しました。",
      preparation: "作品ごとに課題、工夫、学びを1分で説明できるメモを作りました。",
    },
    {
      stepKind: options?.coding ? SelectionStepKind.CODING_TEST : SelectionStepKind.FIRST_INTERVIEW,
      stepTitle: options?.coding ? "技術課題" : "一次面接",
      format: SelectionFormat.ONLINE,
      interviewerCount: options?.coding ? undefined : 2,
      durationMinutes: options?.coding ? 90 : 45,
      questions: options?.coding
        ? "配列操作、APIレスポンスの整形、簡単な画面実装。実装後に設計意図を説明しました。"
        : commonQuestions,
      atmosphere: "穏やかで、回答を深掘りしながら一緒に考えてくれる雰囲気でした。",
      preparation: "基本情報レベルの用語と、GitHubに載せたコードの説明を復習しました。",
    },
    {
      stepKind: SelectionStepKind.FINAL_INTERVIEW,
      stepTitle: "最終面接",
      format: options?.finalFormat ?? SelectionFormat.ONLINE,
      interviewerCount: 2,
      durationMinutes: 40,
      questions:
        "入社後に挑戦したい領域、チームで働く時に大切にしていること、5年後にどう成長していたいか。",
      atmosphere: "一次よりも価値観や働き方の相性を見られている印象でした。",
      preparation: "会社のプロダクトを実際に触り、良い点と改善案をまとめました。",
    },
  ],
  overallTip:
    "技術力だけでなく、学んだことを次の制作にどう活かしたかを聞かれます。制作物の失敗談も前向きに話せるようにしておくと安心です。",
});

const creativeFlow = (entryTrigger = "ポートフォリオ経由"): SeedCompany["selectionExperience"] => ({
  entryTrigger,
  steps: [
    {
      stepKind: SelectionStepKind.DOCUMENT_SCREENING,
      stepTitle: "作品選考",
      format: SelectionFormat.UNKNOWN,
      questions: "ポートフォリオ、制作意図、担当範囲、使用ツール。",
      preparation: "作品を新しい順ではなく、伝えたい強みが伝わる順に並べました。",
    },
    {
      stepKind: SelectionStepKind.FIRST_INTERVIEW,
      stepTitle: "クリエイター面接",
      format: SelectionFormat.ONLINE,
      interviewerCount: 2,
      durationMinutes: 50,
      questions: "一番見てほしい作品、苦労した工程、チーム制作での役割、好きな作品とその理由。",
      atmosphere: "作品を見ながら会話する形で、圧迫感はありませんでした。",
      preparation: "制作前のラフ、没案、改善前後の比較も見せられるようにしました。",
    },
    {
      stepKind: SelectionStepKind.FINAL_INTERVIEW,
      stepTitle: "最終面接",
      format: SelectionFormat.IN_PERSON,
      interviewerCount: 3,
      durationMinutes: 45,
      questions: "会社で作りたいもの、苦手な工程への向き合い方、納期が厳しい時の進め方。",
      atmosphere: "人柄と継続力を丁寧に見られている感じでした。",
      preparation: "会社の制作実績を見て、好きな表現と理由を整理しました。",
    },
  ],
  overallTip:
    "ポートフォリオは完成度だけでなく、制作意図、修正力、チーム内での動き方まで説明できると説得力が出ます。",
});

const businessFlow = (entryTrigger = "就活サイト"): SeedCompany["selectionExperience"] => ({
  entryTrigger,
  steps: [
    {
      stepKind: SelectionStepKind.WEB_TEST,
      stepTitle: "適性検査",
      format: SelectionFormat.ONLINE,
      durationMinutes: 60,
      questions: "言語、非言語、性格検査。難易度は標準的でした。",
      preparation: "市販のSPI対策を1冊解き、時間配分に慣れました。",
    },
    {
      stepKind: SelectionStepKind.FIRST_INTERVIEW,
      stepTitle: "一次面接",
      format: SelectionFormat.ONLINE,
      interviewerCount: 1,
      durationMinutes: 35,
      questions: "学校で学んだこと、アルバイト経験、志望業界、周囲からどんな人と言われるか。",
      atmosphere: "会話に近く、経験の深掘りが中心でした。",
      preparation: "自己PRとガクチカを数字や具体例つきで話せるようにしました。",
    },
    {
      stepKind: SelectionStepKind.FINAL_INTERVIEW,
      stepTitle: "役員面接",
      format: SelectionFormat.IN_PERSON,
      interviewerCount: 2,
      durationMinutes: 30,
      questions: "なぜこの会社か、入社後どんな価値を出せるか、長く働く上で大切にしたいこと。",
      atmosphere: "少し緊張感はありますが、話を最後まで聞いてくれました。",
      preparation: "競合企業との違いを自分の言葉で説明できるようにしました。",
    },
  ],
  overallTip:
    "人柄と再現性を見られます。経験そのものより、何を考えてどう動いたかを具体的に話せることが大切です。",
});

const seedAlumni: SeedAlumni[] = [
  {
    emailLocal: "aoi.frontend",
    name: "高橋 葵",
    nickname: "あおい",
    enrollmentYear: 2021,
    department: Department.IT_EXPERT,
    companies: [
      {
        companyName: "株式会社ゆめみ",
        selectionExperience: engineeringFlow({ entryTrigger: "逆求人・スカウト", coding: true }),
      },
      { companyName: "Sansan株式会社" },
    ],
    remarks: "フロントエンド志望の相談歓迎です。",
    skills: ["React", "TypeScript", "UI改善"],
    portfolioUrl: "https://example.com/aoi-portfolio",
    gakuchika:
      "学内チームで予約管理アプリを制作し、画面設計とフロント実装を担当しました。利用者の操作迷いを減らすため、先生へのヒアリングをもとに導線を改善しました。",
    entryTrigger: "逆求人・スカウト",
    interviewTip: "ポートフォリオの画面を見せながら、なぜそのUIにしたかを説明できると強いです。",
    usefulCoursework: "Webアプリ開発演習とUI/UXの授業が、面接で話す材料になりました。",
    acceptContact: true,
  },
  {
    emailLocal: "ren.backend",
    name: "田中 蓮",
    nickname: "れん",
    enrollmentYear: 2020,
    department: Department.IT_SPECIALIST,
    companies: [
      {
        companyName: "SCSK株式会社",
        selectionExperience: engineeringFlow({ entryTrigger: "学校求人" }),
      },
      { companyName: "TIS株式会社" },
    ],
    remarks: "SIer志望の人は気軽に聞いてください。",
    skills: ["Java", "SQL", "基本情報"],
    gakuchika:
      "データベースを使った在庫管理システムを制作し、ER図設計からAPI実装まで担当しました。",
    entryTrigger: "学校求人",
    interviewTip: "チーム開発での役割と、報連相で意識したことをかなり聞かれました。",
    usefulCoursework: "データベース設計、Java演習、基本情報対策。",
    acceptContact: true,
  },
  {
    emailLocal: "minato.ai",
    name: "山本 湊",
    nickname: "みなと",
    enrollmentYear: 2022,
    department: Department.AI_SYSTEM,
    companies: [
      {
        companyName: "株式会社MonotaRO",
        selectionExperience: engineeringFlow({
          entryTrigger: "インターン経由",
          coding: true,
          finalFormat: SelectionFormat.IN_PERSON,
        }),
      },
    ],
    remarks: "AI系の研究テーマや面接準備を共有できます。",
    skills: ["Python", "機械学習", "データ分析"],
    portfolioUrl: "https://example.com/minato-ai",
    gakuchika:
      "購買データを想定した需要予測の検証に取り組み、精度だけでなく説明しやすい特徴量設計を意識しました。",
    entryTrigger: "インターン経由",
    interviewTip: "精度の数字だけでなく、なぜその手法を選んだかを聞かれました。",
    usefulCoursework: "Python演習、AIシステム開発、統計の基礎。",
    acceptContact: true,
  },
  {
    emailLocal: "haru.game",
    name: "佐藤 晴",
    nickname: "haru",
    enrollmentYear: 2019,
    department: Department.GAME_RESEARCH,
    companies: [
      {
        companyName: "株式会社Cygames",
        selectionExperience: engineeringFlow({ entryTrigger: "就活サイト", coding: true }),
      },
      {
        companyName: "株式会社バンダイナムコスタジオ",
        selectionExperience: creativeFlow("作品選考"),
      },
    ],
    remarks: "ゲーム会社の技術面接なら話せます。",
    skills: ["Unity", "C#", "チーム制作"],
    portfolioUrl: "https://example.com/haru-game",
    gakuchika: "4人チームで3Dアクションゲームを制作し、プレイヤー制御と敵AIを担当しました。",
    entryTrigger: "就活サイト",
    interviewTip: "遊びやすさをどう改善したか、テストプレイの結果をもとに話すと伝わりました。",
    usefulCoursework: "ゲーム制作実習、アルゴリズム、チーム制作演習。",
    acceptContact: true,
  },
  {
    emailLocal: "yui.design",
    name: "鈴木 結衣",
    nickname: "ゆい",
    enrollmentYear: 2022,
    department: Department.GRAPHIC_DESIGN,
    companies: [
      {
        companyName: "チームラボ株式会社",
        selectionExperience: creativeFlow("ポートフォリオ経由"),
      },
      { companyName: "株式会社電通総研" },
    ],
    remarks: "ポートフォリオ構成の相談に乗れます。",
    skills: ["Figma", "After Effects", "企画"],
    portfolioUrl: "https://example.com/yui-design",
    gakuchika:
      "学園祭の告知ビジュアルを制作し、ターゲットに合わせた情報整理と展開物の統一感を意識しました。",
    entryTrigger: "ポートフォリオ経由",
    interviewTip: "作品の狙いと、修正前後の比較を見せると反応が良かったです。",
    usefulCoursework: "グラフィック演習、映像表現、企画プレゼン。",
    acceptContact: true,
  },
  {
    emailLocal: "sota.infra",
    name: "中村 颯太",
    nickname: "そうた",
    enrollmentYear: 2021,
    department: Department.INFORMATION_PROCESS,
    companies: [
      {
        companyName: "Sky株式会社",
        selectionExperience: engineeringFlow({ entryTrigger: "学校求人" }),
      },
    ],
    remarks: "資格勉強と面接対策の進め方を話せます。",
    skills: ["Linux", "ネットワーク", "基本情報"],
    gakuchika: "学内ネットワーク構成を題材に、障害切り分けの手順書を作り、チーム内で共有しました。",
    entryTrigger: "学校求人",
    interviewTip: "資格名だけでなく、勉強で理解したことを自分の言葉で説明しました。",
    usefulCoursework: "ネットワーク基礎、Linux、情報セキュリティ。",
    acceptContact: false,
  },
  {
    emailLocal: "mio.business",
    name: "伊藤 美桜",
    nickname: "みお",
    enrollmentYear: 2022,
    department: Department.INFO_BUSINESS,
    companies: [
      {
        companyName: "株式会社大塚商会",
        selectionExperience: businessFlow("学校求人"),
      },
      { companyName: "株式会社オービック" },
    ],
    remarks: "営業・事務系の就活も共有できます。",
    skills: ["簿記", "Excel", "プレゼン"],
    gakuchika: "授業内の販売企画で、売上管理シートと提案資料を作成し、改善案を発表しました。",
    entryTrigger: "学校求人",
    interviewTip: "人と関わる経験を、数字や行動で具体的に話す準備をしました。",
    usefulCoursework: "ビジネス実務、Excel演習、プレゼンテーション。",
    acceptContact: true,
  },
  {
    emailLocal: "kaito.cg",
    name: "小林 海斗",
    nickname: "かいと",
    enrollmentYear: 2022,
    department: Department.CG_ANIMATION,
    companies: [
      {
        companyName: "株式会社スクウェア・エニックス",
        selectionExperience: creativeFlow("作品応募"),
      },
    ],
    remarks: "CGポートフォリオの見せ方を話せます。",
    skills: ["Maya", "Blender", "映像編集"],
    portfolioUrl: "https://example.com/kaito-cg",
    gakuchika:
      "キャラクターモデリングと短尺映像制作に取り組み、質感調整とライティングを重点的に改善しました。",
    entryTrigger: "作品応募",
    interviewTip: "制作時間、参考資料、修正したポイントを具体的に聞かれました。",
    usefulCoursework: "3DCG演習、映像編集、デッサン。",
    acceptContact: true,
  },
  {
    emailLocal: "nana.sound",
    name: "山田 菜々",
    nickname: "なな",
    enrollmentYear: 2022,
    department: Department.SOUND_CREATE,
    companies: [
      {
        companyName: "株式会社セガ",
        selectionExperience: creativeFlow("学校紹介"),
      },
      { companyName: "株式会社カプコン" },
    ],
    remarks: "サウンド制作職の準備を共有できます。",
    skills: ["作曲", "効果音", "Pro Tools"],
    portfolioUrl: "https://example.com/nana-sound",
    gakuchika:
      "ゲーム作品向けにBGMと効果音を制作し、場面ごとの感情変化に合わせて音色を調整しました。",
    entryTrigger: "学校紹介",
    interviewTip: "音源を聞いてもらいながら、狙った感情やリファレンスを説明しました。",
    usefulCoursework: "サウンドデザイン、レコーディング演習、ゲーム制作連携。",
    acceptContact: true,
  },
  {
    emailLocal: "riku.esports",
    name: "加藤 陸",
    nickname: "りく",
    enrollmentYear: 2022,
    department: Department.ESPORTS,
    companies: [
      {
        companyName: "株式会社MIXI",
        selectionExperience: businessFlow("イベント運営経験から応募"),
      },
    ],
    remarks: "イベント運営・コミュニティ運営系の相談歓迎です。",
    skills: ["イベント運営", "配信", "分析"],
    gakuchika: "学内大会の運営で、配信進行、参加者対応、トラブル時の連絡フロー整備を担当しました。",
    entryTrigger: "イベント運営経験から応募",
    interviewTip: "好きなゲームの話だけでなく、運営側として工夫したことを話しました。",
    usefulCoursework: "イベント企画、配信技術、コミュニケーション演習。",
    acceptContact: true,
  },
  {
    emailLocal: "akira.arch",
    name: "井上 明",
    nickname: "あきら",
    enrollmentYear: 2022,
    department: Department.ARCHITECTURAL,
    companies: [
      {
        companyName: "株式会社日立ソリューションズ",
        selectionExperience: businessFlow("就活サイト"),
      },
    ],
    remarks: "建築からIT職へ進んだ経験を話せます。",
    skills: ["CAD", "要件整理", "プレゼン"],
    gakuchika:
      "建築課題で利用者動線を考えた設計を行い、ITの画面設計にも通じる考え方として面接で話しました。",
    entryTrigger: "就活サイト",
    interviewTip: "専攻が違っても、学んだ考え方をIT職にどう活かすかを話せれば大丈夫です。",
    usefulCoursework: "設計演習、CAD、プレゼンテーション。",
    acceptContact: true,
  },
  {
    emailLocal: "mei.voice",
    name: "清水 芽衣",
    nickname: "めい",
    enrollmentYear: 2022,
    department: Department.VOICE_ACTOR,
    companies: [
      {
        companyName: "株式会社サイバーエージェント",
        selectionExperience: businessFlow("インターン経由"),
      },
    ],
    remarks: "表現系から広報・企画職に進んだ話ができます。",
    skills: ["発声", "企画", "SNS運用"],
    gakuchika:
      "学内イベントの告知動画でナレーションとSNS投稿を担当し、反応を見ながら投稿内容を改善しました。",
    entryTrigger: "インターン経由",
    interviewTip: "表現力を仕事でどう活かすかを、広報や企画の文脈で説明しました。",
    usefulCoursework: "発声、演技実習、動画制作。",
    acceptContact: false,
  },
];

async function main() {
  const connectionString =
    process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@localhost:5432/webu_portal?schema=public";

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const seedEmails = seedAlumni.map((alumni) => `${alumni.emailLocal}@${SEED_EMAIL_DOMAIN}`);

    console.log(`Seeding ${seedAlumni.length} coherent alumni profiles...`);

    await prisma.user.deleteMany({
      where: {
        email: {
          in: seedEmails,
        },
      },
    });

    for (const [index, alumni] of seedAlumni.entries()) {
      const durationYears = departmentDurationYears[alumni.department];
      const graduationYear = alumni.enrollmentYear + durationYears;
      const email = `${alumni.emailLocal}@${SEED_EMAIL_DOMAIN}`;

      await prisma.user.create({
        data: {
          email,
          name: alumni.name,
          studentId: `KD${String(240000 + index + 1)}`,
          enrollmentYear: alumni.enrollmentYear,
          durationYears,
          department: alumni.department,
          role: Role.ALUMNI,
          status: UserStatus.GRADUATED,
          alumniProfile: {
            create: {
              nickname: alumni.nickname,
              graduationYear,
              department: alumni.department,
              remarks: alumni.remarks,
              contactEmail: email,
              isPublic: true,
              acceptContact: alumni.acceptContact,
              skills: alumni.skills,
              portfolioUrl: alumni.portfolioUrl,
              gakuchika: alumni.gakuchika,
              entryTrigger: alumni.entryTrigger,
              interviewTip: alumni.interviewTip,
              usefulCoursework: alumni.usefulCoursework,
              companies: {
                create: alumni.companies.map((company) => ({
                  companyName: company.companyName,
                  selectionExperience: company.selectionExperience
                    ? {
                        create: {
                          entryTrigger: company.selectionExperience.entryTrigger,
                          overallTip: company.selectionExperience.overallTip,
                          steps: {
                            create: company.selectionExperience.steps.map((step, sortOrder) => ({
                              stepKind: step.stepKind,
                              stepTitle: step.stepTitle,
                              format: step.format ?? SelectionFormat.UNKNOWN,
                              interviewerCount: step.interviewerCount,
                              durationMinutes: step.durationMinutes,
                              questions: step.questions,
                              atmosphere: step.atmosphere,
                              preparation: step.preparation,
                              sortOrder,
                            })),
                          },
                        },
                      }
                    : undefined,
                })),
              },
            },
          },
        },
      });
    }

    const companyCount = seedAlumni.reduce((sum, alumni) => sum + alumni.companies.length, 0);
    const experienceCount = seedAlumni.reduce(
      (sum, alumni) =>
        sum + alumni.companies.filter((company) => company.selectionExperience).length,
      0,
    );

    console.log(
      `Seed completed: ${seedAlumni.length} users, ${companyCount} companies, ${experienceCount} selection experiences.`,
    );
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
