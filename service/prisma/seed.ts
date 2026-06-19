import { PrismaPg } from "@prisma/adapter-pg";
import {
  Department,
  JobHuntingPeriod,
  PrismaClient,
  Role,
  SelectionFormat,
  SelectionStepKind,
  UserStatus,
} from "@prisma/client";
import { Pool } from "pg";

const SEED_EMAIL_DOMAIN = "seed.kobedenshi.ac.jp";
const GRADUATION_YEARS = [2023, 2024, 2025, 2026] as const;
const COMPANY_SEARCH_SEPARATOR_PATTERN =
  /[\s\u3000・･.．,，、。_＿/／\\＼()[\]（）［］【】「」『』]/g;

type SeedStep = {
  stepKind: SelectionStepKind;
  format?: SelectionFormat;
  interviewerCount?: number;
  durationMinutes?: number;
  questions?: string;
  atmosphere?: string;
  preparation?: string;
};

type SeedCompany = {
  companyName: string;
  motivation?: string;
  selectionExperience?: {
    entryTrigger?: string;
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
  skills: string[];
  portfolioUrl?: string;
  gakuchika?: string;
  usefulCoursework?: string;
  activityPeriod?: JobHuntingPeriod;
  activityPeriodNote?: string;
  acceptContact: boolean;
  xUrl?: string;
  instagramUrl?: string;
};

function hiraganaToKatakana(value: string): string {
  return value.replace(/[\u3041-\u3096]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) + 0x60),
  );
}

function normalizeCompanyNameForSearch(value: string): string {
  return hiraganaToKatakana(value.normalize("NFKC"))
    .toLocaleLowerCase("ja-JP")
    .replace(COMPANY_SEARCH_SEPARATOR_PATTERN, "")
    .trim();
}

type SeedTrack = "engineering" | "game" | "creative" | "sound" | "construction" | "business";

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
      format: SelectionFormat.UNKNOWN,
      durationMinutes: 0,
      questions: "ポートフォリオURL、使用技術、制作期間、担当範囲を記入しました。",
      preparation: "作品ごとに課題、工夫、学びを1分で説明できるメモを作りました。",
    },
    {
      stepKind: options?.coding ? SelectionStepKind.CODING_TEST : SelectionStepKind.FIRST_INTERVIEW,
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
      format: options?.finalFormat ?? SelectionFormat.ONLINE,
      interviewerCount: 2,
      durationMinutes: 40,
      questions:
        "入社後に挑戦したい領域、チームで働く時に大切にしていること、5年後にどう成長していたいか。",
      atmosphere: "一次よりも価値観や働き方の相性を見られている印象でした。",
      preparation: "会社のプロダクトを実際に触り、良い点と改善案をまとめました。",
    },
  ],
});

const creativeFlow = (entryTrigger = "ポートフォリオ経由"): SeedCompany["selectionExperience"] => ({
  entryTrigger,
  steps: [
    {
      stepKind: SelectionStepKind.DOCUMENT_SCREENING,
      format: SelectionFormat.UNKNOWN,
      questions: "ポートフォリオ、制作意図、担当範囲、使用ツール。",
      preparation: "作品を新しい順ではなく、伝えたい強みが伝わる順に並べました。",
    },
    {
      stepKind: SelectionStepKind.FIRST_INTERVIEW,
      format: SelectionFormat.ONLINE,
      interviewerCount: 2,
      durationMinutes: 50,
      questions: "一番見てほしい作品、苦労した工程、チーム制作での役割、好きな作品とその理由。",
      atmosphere: "作品を見ながら会話する形で、圧迫感はありませんでした。",
      preparation: "制作前のラフ、没案、改善前後の比較も見せられるようにしました。",
    },
    {
      stepKind: SelectionStepKind.FINAL_INTERVIEW,
      format: SelectionFormat.IN_PERSON,
      interviewerCount: 3,
      durationMinutes: 45,
      questions: "会社で作りたいもの、苦手な工程への向き合い方、納期が厳しい時の進め方。",
      atmosphere: "人柄と継続力を丁寧に見られている感じでした。",
      preparation: "会社の制作実績を見て、好きな表現と理由を整理しました。",
    },
  ],
});

const soundFlow = (entryTrigger = "学校紹介"): SeedCompany["selectionExperience"] => ({
  entryTrigger,
  steps: [
    {
      stepKind: SelectionStepKind.DOCUMENT_SCREENING,
      format: SelectionFormat.UNKNOWN,
      questions: "制作音源、担当範囲、使用機材、作品意図。",
      preparation: "作品を場面ごとに整理し、聴かせたい順番で見せる構成にしました。",
    },
    {
      stepKind: SelectionStepKind.FIRST_INTERVIEW,
      format: SelectionFormat.ONLINE,
      interviewerCount: 2,
      durationMinutes: 45,
      questions: "一番自信のある音源、収録や編集で工夫した点、チーム制作での役割。",
      atmosphere: "音を聞きながらの会話で、実務イメージを膨らませる雰囲気でした。",
      preparation: "制作環境やプラグインの説明を、具体的な画面で話せるようにしました。",
    },
    {
      stepKind: SelectionStepKind.FINAL_INTERVIEW,
      format: SelectionFormat.IN_PERSON,
      interviewerCount: 2,
      durationMinutes: 40,
      questions: "どんな作品の音を作りたいか、制作の締切にどう向き合うか、入社後に伸ばしたい技術。",
      atmosphere: "制作姿勢とコミュニケーションを丁寧に見られている印象でした。",
      preparation: "好きな作品の音作りを分析して、自分ならどう再現するかを整理しました。",
    },
  ],
});

const businessFlow = (entryTrigger = "就活サイト"): SeedCompany["selectionExperience"] => ({
  entryTrigger,
  steps: [
    {
      stepKind: SelectionStepKind.WEB_TEST,
      format: SelectionFormat.ONLINE,
      durationMinutes: 60,
      questions: "言語、非言語、性格検査。難易度は標準的でした。",
      preparation: "市販のSPI対策を1冊解き、時間配分に慣れました。",
    },
    {
      stepKind: SelectionStepKind.FIRST_INTERVIEW,
      format: SelectionFormat.ONLINE,
      interviewerCount: 1,
      durationMinutes: 35,
      questions: "学校で学んだこと、アルバイト経験、志望業界、周囲からどんな人と言われるか。",
      atmosphere: "会話に近く、経験の深掘りが中心でした。",
      preparation: "自己PRとガクチカを数字や具体例つきで話せるようにしました。",
    },
    {
      stepKind: SelectionStepKind.FINAL_INTERVIEW,
      format: SelectionFormat.IN_PERSON,
      interviewerCount: 2,
      durationMinutes: 30,
      questions: "なぜこの会社か、入社後どんな価値を出せるか、長く働く上で大切にしたいこと。",
      atmosphere: "少し緊張感はありますが、話を最後まで聞いてくれました。",
      preparation: "競合企業との違いを自分の言葉で説明できるようにしました。",
    },
  ],
});

type CompanyExperienceQuality = {
  motivation: string;
  activityPeriod: JobHuntingPeriod;
  activityPeriodNote: string;
};

const selectionQualityPresets: Record<SeedTrack, CompanyExperienceQuality[]> = {
  engineering: [
    {
      motivation:
        "学生時代に作ったWebアプリの経験を、ユーザーに近い開発で活かせると感じたためです。説明会で若手でも設計や改善提案に関われると聞き、入社後の成長イメージが持てました。",
      activityPeriod: JobHuntingPeriod.SECOND_YEAR_FIRST_HALF,
      activityPeriodNote:
        "2年の4月ごろからポートフォリオを整理し、学校求人と学内説明会を見ながら応募先を絞りました。",
    },
    {
      motivation:
        "チーム開発の進め方やコードレビューの文化が自分に合っていると感じました。面接で制作物の工夫を丁寧に聞いてもらえたことも、入社後に学び続けられそうだと思った理由です。",
      activityPeriod: JobHuntingPeriod.FIRST_YEAR_SECOND_HALF,
      activityPeriodNote:
        "1年後期からGitHubの整理を始め、冬休みに自己PRと制作物説明をまとめました。",
    },
    {
      motivation:
        "授業で学んだプログラミングやデータベースの知識を、生活や業務を支えるシステム開発に活かしたいと思いました。会社の事例を調べる中で、長く技術を磨ける環境だと感じました。",
      activityPeriod: JobHuntingPeriod.SUMMER_BREAK,
      activityPeriodNote:
        "夏休みに求人を見比べ、9月から先生に添削してもらいながら応募書類を整えました。",
    },
  ],
  game: [
    {
      motivation:
        "自分が制作で大切にしてきた操作感や遊びやすさを、実際のゲーム開発で磨きたいと思ったためです。作品へのフィードバックが具体的で、ここなら成長できそうだと感じました。",
      activityPeriod: JobHuntingPeriod.SECOND_YEAR_FIRST_HALF,
      activityPeriodNote: "2年の4月から応募作品を絞り込み、5月には動画とREADMEを見直しました。",
    },
    {
      motivation:
        "チームでゲームを完成させる経験を通して、実装だけでなく企画意図を理解して動く仕事に興味を持ちました。会社の作品の雰囲気が自分の作りたい方向と近かったことも決め手です。",
      activityPeriod: JobHuntingPeriod.FIRST_YEAR_SECOND_HALF,
      activityPeriodNote:
        "1年後期からチーム制作の記録を残し、春休みにポートフォリオ用の説明文を作りました。",
    },
    {
      motivation:
        "面接で作品の改善点まで一緒に話してもらえたことで、ものづくりに真剣な会社だと感じました。自分の得意な実装領域を活かしながら、演出や品質にも関われる点に惹かれました。",
      activityPeriod: JobHuntingPeriod.SUMMER_BREAK,
      activityPeriodNote:
        "夏休みに過去作品を作り直し、9月から企業ごとに見せる作品の順番を変えました。",
    },
  ],
  creative: [
    {
      motivation:
        "ポートフォリオを見てもらった時に、完成品だけでなく考え方や修正の過程まで評価してもらえたためです。自分の表現を仕事として伸ばせる環境だと感じました。",
      activityPeriod: JobHuntingPeriod.SECOND_YEAR_FIRST_HALF,
      activityPeriodNote:
        "2年の4月から作品を選び直し、5月に先生へ見せて構成と説明文を修正しました。",
    },
    {
      motivation:
        "会社の制作実績を調べる中で、授業で取り組んできたデザインや映像表現と近い領域に挑戦できると思いました。面接での雰囲気もよく、相談しながら作れる印象がありました。",
      activityPeriod: JobHuntingPeriod.FIRST_YEAR_SECOND_HALF,
      activityPeriodNote:
        "1年後期から作品をため始め、春休みにポートフォリオサイトとPDFを整えました。",
    },
    {
      motivation:
        "自分の強みである情報整理や見せ方の工夫を、実際の案件で活かしたいと考えました。入社後に幅広い制作に関われる点が、成長につながると感じました。",
      activityPeriod: JobHuntingPeriod.SUMMER_BREAK,
      activityPeriodNote: "夏休みに作品の見せ方を変え、応募前に制作意図を短く話す練習をしました。",
    },
  ],
  sound: [
    {
      motivation:
        "作品の世界観を音で支える仕事に関わりたいと思ったためです。面接で音源の意図を丁寧に聞いてもらえ、技術だけでなく考え方も見てくれる会社だと感じました。",
      activityPeriod: JobHuntingPeriod.SECOND_YEAR_FIRST_HALF,
      activityPeriodNote: "2年の4月から音源を整理し、5月に提出用データと説明文をまとめました。",
    },
    {
      motivation:
        "収録や編集で学んだことを、現場に近い制作環境で活かしたいと考えました。好きな作品の音作りと会社の制作領域が重なっていたことが志望理由です。",
      activityPeriod: JobHuntingPeriod.FIRST_YEAR_SECOND_HALF,
      activityPeriodNote: "1年後期から制作音源を残し、春休みにポートフォリオの順番を見直しました。",
    },
    {
      motivation:
        "チーム制作で音の役割を考える楽しさを知り、映像やゲームを支える音響職に進みたいと思いました。会社説明で現場の動き方を聞けたことが決め手になりました。",
      activityPeriod: JobHuntingPeriod.SUMMER_BREAK,
      activityPeriodNote: "夏休みに作品ごとの担当範囲を整理し、9月から面接で話す練習を始めました。",
    },
  ],
  construction: [
    {
      motivation:
        "授業で学んだCADや設計の知識を、実際の住まいや空間づくりに活かしたいと思ったためです。説明会で現場と設計の両方を理解して働ける点に魅力を感じました。",
      activityPeriod: JobHuntingPeriod.SECOND_YEAR_FIRST_HALF,
      activityPeriodNote: "2年の4月から求人を見始め、5月に図面課題と自己PRを整理しました。",
    },
    {
      motivation:
        "利用者の動線や安全性を考える課題にやりがいを感じ、実務でも人の生活に近い仕事をしたいと思いました。面接で学んだ内容を具体的に聞いてもらえたことも印象に残っています。",
      activityPeriod: JobHuntingPeriod.FIRST_YEAR_SECOND_HALF,
      activityPeriodNote: "1年後期から業界研究を始め、冬休みに企業ごとの施工実績を調べました。",
    },
    {
      motivation:
        "図面だけでなく、現場で人と連携しながら形にしていく働き方に惹かれました。会社見学で社員同士のやり取りを見て、自分もここで成長したいと感じました。",
      activityPeriod: JobHuntingPeriod.SUMMER_BREAK,
      activityPeriodNote: "夏休みに会社見学へ行き、9月から志望理由を企業ごとに書き分けました。",
    },
  ],
  business: [
    {
      motivation:
        "接客や授業で身につけた相手に合わせて伝える力を、仕事で活かせると感じたためです。面接で人柄だけでなく行動の理由まで聞いてもらえ、長く働く姿を想像できました。",
      activityPeriod: JobHuntingPeriod.SECOND_YEAR_FIRST_HALF,
      activityPeriodNote: "2年の4月から説明会に参加し、5月にSPIと面接練習を並行して進めました。",
    },
    {
      motivation:
        "会社の商品やサービスが身近で、利用者の困りごとを支える仕事に関わりたいと思いました。アルバイト経験で工夫したことを評価してもらえたことも決め手です。",
      activityPeriod: JobHuntingPeriod.FIRST_YEAR_SECOND_HALF,
      activityPeriodNote: "1年後期から自己分析を始め、春休みにガクチカと自己PRを書き直しました。",
    },
    {
      motivation:
        "数字を見ながら改善する仕事と、人と関わる仕事の両方に挑戦できる点に惹かれました。説明会で若手の仕事例を聞き、学んだことを活かせそうだと感じました。",
      activityPeriod: JobHuntingPeriod.SUMMER_BREAK,
      activityPeriodNote: "夏休みに業界を絞り、9月から企業ごとに志望理由と逆質問を準備しました。",
    },
  ],
};

const trackPlans: Array<{ track: SeedTrack; count: number }> = [
  { track: "engineering", count: 56 },
  { track: "game", count: 21 },
  { track: "creative", count: 21 },
  { track: "sound", count: 12 },
  { track: "construction", count: 20 },
  { track: "business", count: 20 },
];

const departmentPools: Record<SeedTrack, Department[]> = {
  engineering: [
    Department.IT_EXPERT,
    Department.IT_SPECIALIST,
    Department.INFORMATION_PROCESS,
    Department.PROGRAMMING,
    Department.AI_SYSTEM,
  ],
  game: [Department.GAME_RESEARCH, Department.GAME_ENGINEER, Department.GAME_SOFTWARE],
  creative: [
    Department.CG_ANIMATION,
    Department.DIGITAL_ANIME,
    Department.GRAPHIC_DESIGN,
    Department.INDUSTRIAL_DESIGN,
  ],
  sound: [Department.SOUND_CREATE, Department.SOUND_TECHNIQUE],
  construction: [Department.ARCHITECTURAL],
  business: [Department.INFO_BUSINESS, Department.INTERNATIONAL_COMM, Department.OTHERS],
};

const companyPools: Record<SeedTrack, string[]> = {
  engineering: [
    "株式会社アイオス",
    "株式会社アイシーエス",
    "アイテック阪急阪神株式会社",
    "アイレット株式会社",
    "株式会社アウトソーシングテクノロジー",
    "株式会社アルトナー",
    "株式会社アルプス技研",
    "eBASE-PLUS株式会社",
    "株式会社ウイルテック",
    "株式会社ヴィンクス",
    "エスアイエス・テクノサービス株式会社",
    "株式会社エスユーエス",
    "株式会社NTTデータNJK",
    "株式会社NTTデータ関西",
    "株式会社オープンアップITエンジニア",
    "株式会社オプティム",
    "株式会社オプテージ",
    "グローリー株式会社",
    "株式会社神戸デジタル・ラボ",
    "コベルコソフトサービス株式会社",
    "コンピューターマネージメント株式会社",
    "サービス&セキュリティ株式会社",
    "株式会社さくらケーシーエス",
    "CTCシステムマネジメント株式会社",
    "株式会社ジェイテック",
    "新明和工業株式会社",
    "株式会社セキュアヴェイル",
    "株式会社セラク",
    "株式会社ソフトウェア・サービス",
    "株式会社都築ソフトウェア",
    "TISソリューションリンク株式会社",
    "株式会社ティーネットジャパン",
    "株式会社テクノプロ（IT社、エンジニアリング社、デザイン社）",
    "デジタル・インフォメーション・テクノロジー株式会社",
    "東芝テックソリューションサービス株式会社",
    "株式会社トーホー",
    "鳥取ダイハツ販売株式会社",
    "TOPPANエッジITソリューション株式会社",
    "トランスコスモス株式会社",
    "西日本旅客鉄道株式会社",
    "日清紡マイクロデバイス株式会社",
    "日本アイ・ビー・エムデジタルサービス株式会社",
    "株式会社ネグジット総研",
    "ネクストウェア株式会社",
    "株式会社ネットプロテクションズ",
    "パーソルクロステクノロジー株式会社",
    "株式会社ビーネックステクノロジーズ",
    "株式会社フォーカスシステムズ",
    "富士ソフト株式会社",
    "株式会社ミックウェア",
    "株式会社メイテックフィルダーズ",
    "株式会社メンバーズ",
    "ヤマトシステム開発株式会社",
    "リコージャパン株式会社",
    "株式会社ワールドインテック",
  ],
  game: [
    "株式会社ORENDA WORLD",
    "グランディング株式会社",
    "株式会社CRAFTS&MEISTER",
    "株式会社インティ・クリエイツ",
    "株式会社オルカ",
    "株式会社ガンバリオン",
    "株式会社クロスプラススタジオ",
    "株式会社コロプラ",
    "株式会社サイバーコネクトツー",
    "株式会社サクセス",
    "株式会社サファリゲームズ",
    "株式会社ビサイド",
    "株式会社ファイン",
    "株式会社ヘキサドライブ",
    "株式会社ラクジン",
    "株式会社ロジカルビート",
  ],
  creative: [
    "アステッキホールディングス株式会社",
    "株式会社アップコム",
    "オージーケー技研株式会社",
    "株式会社カプコン",
    "株式会社ジェー・シー・スタッフ",
    "株式会社ジオブレイン",
    "シンエイ動画株式会社",
    "株式会社スタジオ雲雀",
    "ペダビット株式会社",
    "株式会社まほろば",
    "株式会社ミツエーリンクス",
    "株式会社Lin",
  ],
  sound: [
    "株式会社インターナショナルクリエイティブ",
    "株式会社エクシードキャリア",
    "オハラ企画株式会社",
    "株式会社Cygames",
    "有限会社動画堂",
    "フィールズ株式会社",
  ],
  construction: [
    "株式会社アーネストワン",
    "株式会社アイ工務店",
    "株式会社池下設計",
    "株式会社オサマル",
    "株式会社近創",
    "住友林業ホームテック株式会社",
    "大東建託株式会社",
    "大和ハウス工業株式会社",
    "タット・プラン工事株式会社",
    "棚田建材株式会社",
    "タマホーム株式会社",
    "トランスコスモス株式会社",
    "日本管財住宅管理株式会社",
    "橋工芸株式会社",
    "株式会社ファーストコンテック",
    "ファースト住建株式会社",
    "藤岡金属株式会社",
    "株式会社フジコー",
    "前川建設株式会社",
    "ヤマダホーム株式会社",
    "立建設株式会社",
    "株式会社ワールドコーポレーション",
  ],
  business: [
    "ITXコミュニケーションズ株式会社",
    "あわじ島農業協同組合",
    "株式会社インテリックス",
    "Evand株式会社",
    "小野建株式会社",
    "株式会社籠谷",
    "コカ・コーラ ボトラーズジャパンベンディング株式会社",
    "株式会社コジマ",
    "サントリービバレッジソリューション株式会社",
    "日本測器株式会社",
    "株式会社橋立大丸",
    "兵庫県信用組合",
    "医療法人社団風林会",
    "株式会社松屋フーズ",
    "株式会社マルアイ",
    "株式会社ヤマダデンキ",
    "株式会社吉富運輸",
    "リコージャパン株式会社",
  ],
};

const givenNamePool = [
  { given: "葵", reading: "あおい" },
  { given: "蓮", reading: "れん" },
  { given: "結衣", reading: "ゆい" },
  { given: "湊", reading: "みなと" },
  { given: "陽菜", reading: "ひな" },
  { given: "翔太", reading: "しょうた" },
  { given: "美桜", reading: "みお" },
  { given: "陸", reading: "りく" },
  { given: "さくら", reading: "さくら" },
  { given: "海斗", reading: "かいと" },
  { given: "玲奈", reading: "れいな" },
  { given: "悠斗", reading: "ゆうと" },
  { given: "紗良", reading: "さら" },
  { given: "大和", reading: "やまと" },
  { given: "七海", reading: "ななみ" },
];

const surnamePool = [
  "高橋",
  "佐藤",
  "鈴木",
  "田中",
  "伊藤",
  "渡辺",
  "山本",
  "中村",
  "小林",
  "加藤",
  "吉田",
  "山田",
  "井上",
  "木村",
  "林",
  "清水",
  "林田",
  "坂本",
  "藤田",
  "松本",
  "阿部",
  "石井",
  "森",
  "前田",
  "小川",
  "岡田",
  "中島",
  "長谷川",
  "近藤",
  "村上",
];

type NameEntry = {
  name: string;
  given: string;
  reading: string;
};

const skillPools: Record<SeedTrack, string[]> = {
  engineering: ["TypeScript", "Java", "SQL", "React", "Linux", "AWS"],
  game: ["Unity", "C#", "C++", "Git", "レベルデザイン", "描画基礎"],
  creative: ["Figma", "After Effects", "Blender", "Photoshop", "Illustrator", "Premiere Pro"],
  sound: ["Cubase", "Pro Tools", "作曲", "効果音", "収録", "編集"],
  construction: ["CAD", "BIM", "施工管理", "積算", "安全管理", "プレゼン"],
  business: ["Excel", "簿記", "提案", "接客", "販売", "資料作成"],
};

const gakuchikaTemplates: Record<SeedTrack, string[]> = {
  engineering: [
    "学内チームで予約管理アプリを制作し、画面設計と実装の両方を担当しました。",
    "在庫管理システムの制作で、ER図設計からAPI実装まで担当しました。",
    "学内の業務支援ツールを作成し、使いやすさを意識した改善を重ねました。",
  ],
  game: [
    "4人チームでゲームを制作し、プレイヤー制御と演出調整を担当しました。",
    "バトルゲームの試作で、当たり判定とゲーム進行の制御を実装しました。",
    "学内作品の制作で、実装とデバッグを通して完成度を高めました。",
  ],
  creative: [
    "学園祭の告知ビジュアルを制作し、情報整理と見せ方の統一を意識しました。",
    "キャラクターや映像作品を制作し、質感やレイアウトの改善を重ねました。",
    "チーム制作で進行管理も担当し、全体の方向性をそろえました。",
  ],
  sound: [
    "ゲーム作品向けにBGMと効果音を制作し、場面ごとの感情変化に合わせて調整しました。",
    "短編作品の音響制作で、収録から編集までの流れを一通り担当しました。",
    "作品の世界観に合わせて音色とタイミングを調整しました。",
  ],
  construction: [
    "設計課題で利用者動線を考えた提案を行い、施工性との両立を意識しました。",
    "グループ課題で図面と説明資料をまとめ、相手に伝わる構成を意識しました。",
    "施工管理を想定した課題で、工程の優先順位を整理しました。",
  ],
  business: [
    "販売企画の授業で売上管理シートと提案資料を作成し、改善案を発表しました。",
    "接客実習で状況に応じた声かけを工夫し、対応品質の向上を意識しました。",
    "アルバイト経験をもとに、報連相と効率的な作業手順を整理しました。",
  ],
};

const courseworkTemplates: Record<SeedTrack, string[]> = {
  engineering: [
    "Webアプリ開発演習、データベース設計、Linuxの基礎が面接で話す材料になりました。",
    "Java演習、ネットワーク基礎、情報セキュリティの授業が役立ちました。",
    "AIやWebの課題制作で、要件整理から実装までの流れを学びました。",
  ],
  game: [
    "ゲーム制作実習、アルゴリズム、チーム制作演習が役立ちました。",
    "Unity実習、プログラミング基礎、作品発表の授業が面接につながりました。",
    "デバッグ演習とゲーム企画の授業で、作る視点を広げられました。",
  ],
  creative: [
    "グラフィック演習、映像表現、企画プレゼンの授業が役立ちました。",
    "3DCG演習、デッサン、映像編集の授業が制作の土台になりました。",
    "ポートフォリオ制作の授業で、作品の見せ方を整理できました。",
  ],
  sound: [
    "サウンドデザイン、レコーディング演習、ゲーム制作連携の授業が役立ちました。",
    "音楽制作実習、編集演習、作品発表の授業が面接材料になりました。",
    "収録と編集の基礎を学ぶ授業が、作品説明に役立ちました。",
  ],
  construction: [
    "設計演習、CAD、プレゼンテーションの授業が役立ちました。",
    "施工計画と建築基礎の授業が、面接で話す材料になりました。",
    "図面作成と工程管理の授業が就活に役立ちました。",
  ],
  business: [
    "ビジネス実務、Excel演習、プレゼンテーションの授業が役立ちました。",
    "接客実習と販売企画の授業が、面接で話す材料になりました。",
    "簿記と事務演習で、数字の扱いに自信がつきました。",
  ],
};

function mulberry32(seed: number) {
  let t = seed;

  return () => {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function pickByIndex<T>(items: readonly T[], index: number): T {
  return items[index % items.length];
}

function shuffleWithSeed<T>(items: T[], seed: number) {
  const rng = mulberry32(seed);
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}

const namePool = shuffleWithSeed(
  surnamePool.flatMap((surname) =>
    givenNamePool.map((given) => ({
      name: `${surname} ${given.given}`,
      given: given.given,
      reading: given.reading,
    })),
  ),
  20250301,
).slice(0, 150);

function toKatakana(text: string) {
  return text.replace(/[ぁ-ゖ]/g, (char) => String.fromCharCode(char.charCodeAt(0) + 0x60));
}

function buildNickname(entry: NameEntry, rng: () => number) {
  const styles = [
    entry.name,
    entry.given,
    entry.reading,
    toKatakana(entry.reading),
    `${entry.reading}さん`,
    `${entry.given}くん`,
    `${entry.given}ちゃん`,
  ];

  const variant = styles[Math.floor(rng() * styles.length)] ?? entry.name;
  return variant;
}

function buildName(index: number, rng: () => number) {
  const entry = namePool[index];
  if (!entry) {
    throw new Error(`namePool is missing entry for index ${index}`);
  }

  return {
    name: entry.name,
    nickname: buildNickname(entry, rng),
  };
}

function buildSkills(track: SeedTrack, index: number) {
  const pool = skillPools[track];
  const offset = index % pool.length;

  return [pool[offset], pool[(offset + 2) % pool.length], pool[(offset + 4) % pool.length]];
}

function buildGakuchika(track: SeedTrack, index: number, rng: () => number) {
  if (rng() < 0.18) {
    return undefined;
  }

  return pickByIndex(gakuchikaTemplates[track], index);
}

function buildCoursework(track: SeedTrack, index: number, rng: () => number) {
  if (rng() < 0.22) {
    return undefined;
  }

  return pickByIndex(courseworkTemplates[track], index);
}

function buildPortfolioUrl(track: SeedTrack, index: number, emailLocal: string, rng: () => number) {
  const shouldInclude =
    track === "creative" || track === "game" || track === "engineering" || track === "sound"
      ? rng() < 0.7
      : rng() < 0.25;

  return shouldInclude ? `https://example.com/${emailLocal}-${track}-${index}` : undefined;
}

function buildSelectionExperience(
  track: SeedTrack,
  profileIndex: number,
  department: Department,
  companyIndex: number,
): SeedCompany["selectionExperience"] {
  const baseProfileIndex = profileIndex + departmentDurationYears[department];
  const triggerIndex = baseProfileIndex + companyIndex;

  const experience = (() => {
    switch (track) {
      case "engineering":
        return engineeringFlow({
          entryTrigger: pickByIndex(
            ["学校求人", "インターン経由", "逆求人・スカウト", "学内説明会"],
            triggerIndex,
          ),
          coding:
            department === Department.IT_EXPERT ||
            department === Department.AI_SYSTEM ||
            department === Department.PROGRAMMING,
          finalFormat: triggerIndex % 3 === 0 ? SelectionFormat.IN_PERSON : SelectionFormat.ONLINE,
        });
      case "game":
        return engineeringFlow({
          entryTrigger: pickByIndex(
            ["学校求人", "作品応募", "インターン経由", "学内説明会"],
            triggerIndex,
          ),
          coding: true,
          finalFormat: triggerIndex % 2 === 0 ? SelectionFormat.ONLINE : SelectionFormat.IN_PERSON,
        });
      case "creative":
        return creativeFlow(
          pickByIndex(
            ["ポートフォリオ経由", "作品応募", "学校紹介", "インターン経由"],
            triggerIndex,
          ),
        );
      case "sound":
        return soundFlow(
          pickByIndex(["学校紹介", "ポートフォリオ経由", "先生紹介", "作品応募"], triggerIndex),
        );
      case "construction":
        return businessFlow(
          pickByIndex(["学校求人", "合同説明会", "就活サイト", "インターン経由"], triggerIndex),
        );
      case "business":
        return businessFlow(
          pickByIndex(["学校求人", "就活サイト", "合同説明会", "インターン経由"], triggerIndex),
        );
    }
  })();

  return experience;
}

function pickDepartment(track: SeedTrack, rng: () => number, localIndex: number) {
  const pool = departmentPools[track];
  const offset = Math.floor(rng() * pool.length);
  return pool[(localIndex + offset) % pool.length] ?? pool[0];
}

function buildGraduationYear(rng: () => number, index: number): number {
  const weightedYears: number[] = [
    2026,
    2025,
    2025,
    2024,
    2024,
    2023,
    pickByIndex(GRADUATION_YEARS, index),
  ];

  return weightedYears[Math.floor(rng() * weightedYears.length)] ?? 2025;
}

function buildCompanies(
  track: SeedTrack,
  department: Department,
  profileIndex: number,
  rng: () => number,
) {
  const pool = companyPools[track];
  const desiredCount = 1 + (rng() < 0.55 ? 1 : 0) + (rng() < 0.18 ? 1 : 0);
  const companies: SeedCompany[] = [];
  const used = new Set<string>();
  let cursor = Math.floor(rng() * pool.length);

  while (companies.length < desiredCount) {
    const companyName = pool[cursor % pool.length];
    cursor += 1 + Math.floor(rng() * 3);

    if (used.has(companyName)) {
      continue;
    }

    used.add(companyName);
    const companyQuality = pickByIndex(
      selectionQualityPresets[track],
      profileIndex + companies.length,
    );

    const selectionExperience =
      companies.length === 0
        ? rng() < 0.82
          ? buildSelectionExperience(track, profileIndex, department, companies.length)
          : undefined
        : rng() < 0.28
          ? buildSelectionExperience(track, profileIndex, department, companies.length)
          : undefined;

    companies.push({
      companyName,
      motivation: companyQuality.motivation,
      selectionExperience,
    });
  }

  return companies;
}

function buildSeedAlumni() {
  const seedAlumni: SeedAlumni[] = [];
  let globalIndex = 0;

  for (const plan of trackPlans) {
    for (let localIndex = 0; localIndex < plan.count; localIndex += 1) {
      const index = globalIndex;
      const rng = mulberry32(20250301 + index * 97);
      const { name, nickname } = buildName(index, rng);
      const department = pickDepartment(plan.track, rng, localIndex);
      const durationYears = departmentDurationYears[department];
      const graduationYear = buildGraduationYear(rng, index);
      const enrollmentYear = graduationYear - durationYears;
      const emailLocal = `${plan.track}.${String(index + 1).padStart(3, "0")}`;
      const skills = buildSkills(plan.track, index);
      const companies = buildCompanies(plan.track, department, index, rng);
      const activitySource = pickByIndex(selectionQualityPresets[plan.track], index);

      seedAlumni.push({
        emailLocal,
        name,
        nickname,
        enrollmentYear,
        department,
        companies,
        skills,
        portfolioUrl: buildPortfolioUrl(plan.track, index, emailLocal, rng),
        gakuchika: buildGakuchika(plan.track, index, rng),
        usefulCoursework: buildCoursework(plan.track, index, rng),
        activityPeriod: activitySource?.activityPeriod,
        activityPeriodNote: activitySource?.activityPeriodNote,
        acceptContact: rng() > 0.28,
        xUrl: `https://x.com/${emailLocal.replaceAll(".", "_")}`,
        instagramUrl: `https://www.instagram.com/${emailLocal.replaceAll(".", "_")}/`,
      });

      globalIndex += 1;
    }
  }

  return shuffleWithSeed(seedAlumni, 20260531);
}

const seedAlumni = buildSeedAlumni();

type SeededProfileForReaction = {
  id: string;
  userId: string;
};

type SeededUserForReaction = {
  id: string;
};

function buildHelpfulReactionRows(
  profiles: SeededProfileForReaction[],
  users: SeededUserForReaction[],
) {
  const userIds = users.map((user) => user.id);

  return profiles.flatMap((profile, profileIndex) => {
    const targetCount = Math.min(
      4 + (profileIndex % 8) + (profileIndex % 9 === 0 ? 8 : profileIndex % 4 === 0 ? 4 : 0),
      Math.max(userIds.length - 1, 0),
    );
    const rows: Array<{ alumniProfileId: string; userId: string }> = [];
    let cursor = profileIndex + 1;

    while (rows.length < targetCount && rows.length < userIds.length - 1) {
      const userId = userIds[cursor % userIds.length];
      cursor += 1;

      if (!userId || userId === profile.userId || rows.some((row) => row.userId === userId)) {
        continue;
      }

      rows.push({
        alumniProfileId: profile.id,
        userId,
      });
    }

    return rows;
  });
}

async function main() {
  const connectionString =
    process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@localhost:5432/webu_portal?schema=public";

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log(`Seeding ${seedAlumni.length} coherent alumni profiles...`);

    await prisma.user.deleteMany({
      where: {
        email: {
          endsWith: `@${SEED_EMAIL_DOMAIN}`,
        },
      },
    });

    for (const [index, alumni] of seedAlumni.entries()) {
      const durationYears = departmentDurationYears[alumni.department];
      const calculatedGraduationYear = alumni.enrollmentYear + durationYears;
      const email = `${alumni.emailLocal}@${SEED_EMAIL_DOMAIN}`;

      await prisma.user.create({
        data: {
          email,
          name: alumni.name,
          studentId: `KD${String(950000 + index + 1)}`,
          enrollmentYear: alumni.enrollmentYear,
          durationYears,
          department: alumni.department,
          role: Role.ALUMNI,
          status: UserStatus.GRADUATED,
          alumniProfile: {
            create: {
              nickname: alumni.nickname,
              graduationYear: calculatedGraduationYear,
              department: alumni.department,
              contactEmail: email,
              xUrl: alumni.acceptContact ? alumni.xUrl : undefined,
              instagramUrl: alumni.acceptContact ? alumni.instagramUrl : undefined,
              isPublic: true,
              acceptContact: alumni.acceptContact,
              skills: alumni.skills,
              portfolioUrl: alumni.portfolioUrl,
              gakuchika: alumni.gakuchika,
              usefulCoursework: alumni.usefulCoursework,
              activityPeriod: alumni.activityPeriod,
              activityPeriodNote: alumni.activityPeriodNote,
              companies: {
                create: alumni.companies.map((company) => ({
                  companyName: company.companyName,
                  companyNameSearch: normalizeCompanyNameForSearch(company.companyName),
                  motivation: company.motivation,
                  selectionExperience: company.selectionExperience
                    ? {
                        create: {
                          entryTrigger: company.selectionExperience.entryTrigger,
                          steps: {
                            create: company.selectionExperience.steps.map((step, sortOrder) => ({
                              stepKind: step.stepKind,
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

    const seededProfiles = await prisma.alumniProfile.findMany({
      where: {
        user: {
          email: {
            endsWith: `@${SEED_EMAIL_DOMAIN}`,
          },
        },
      },
      select: {
        id: true,
        userId: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    const seededUsers = await prisma.user.findMany({
      where: {
        email: {
          endsWith: `@${SEED_EMAIL_DOMAIN}`,
        },
      },
      select: {
        id: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    const helpfulReactionRows = buildHelpfulReactionRows(seededProfiles, seededUsers);

    if (helpfulReactionRows.length > 0) {
      await prisma.helpfulReaction.createMany({
        data: helpfulReactionRows,
        skipDuplicates: true,
      });
    }

    const companyCount = seedAlumni.reduce((sum, alumni) => sum + alumni.companies.length, 0);
    const experienceCount = seedAlumni.reduce(
      (sum, alumni) =>
        sum + alumni.companies.filter((company) => company.selectionExperience).length,
      0,
    );

    console.log(
      `Seed completed: ${seedAlumni.length} users, ${companyCount} companies, ${experienceCount} selection experiences, ${helpfulReactionRows.length} helpful reactions.`,
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
