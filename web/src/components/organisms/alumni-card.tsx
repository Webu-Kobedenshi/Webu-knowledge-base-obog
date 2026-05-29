import type { AlumniProfile } from "@/graphql/types";
import { departmentGradient } from "@/lib/department-theme";
import Link from "next/link";

type AlumniCardProps = {
  alumni: AlumniProfile;
};

const departmentLabel: Record<AlumniProfile["department"], string> = {
  IT_EXPERT: "ITエキスパート",
  IT_SPECIALIST: "ITスペシャリスト",
  INFORMATION_PROCESS: "情報処理",
  PROGRAMMING: "プログラミング",
  AI_SYSTEM: "AIシステム開発",
  ADVANCED_STUDIES: "総合研究科",
  INFO_BUSINESS: "情報ビジネス",
  INFO_ENGINEERING: "情報工学",
  GAME_RESEARCH: "ゲーム開発研究",
  GAME_ENGINEER: "ゲームエンジニア",
  GAME_SOFTWARE: "ゲーム制作",
  ESPORTS: "esportsエンジニア",
  CG_ANIMATION: "CGアニメーション",
  DIGITAL_ANIME: "デジタルアニメ",
  GRAPHIC_DESIGN: "グラフィックデザイン",
  INDUSTRIAL_DESIGN: "インダストリアルデザイン",
  ARCHITECTURAL: "建築",
  SOUND_CREATE: "サウンドクリエイト",
  SOUND_TECHNIQUE: "サウンドテクニック",
  VOICE_ACTOR: "声優",
  INTERNATIONAL_COMM: "国際コミュニケーション",
  OTHERS: "その他",
};

export function AlumniCard({ alumni }: AlumniCardProps) {
  const initial = (alumni.nickname ?? "匿")[0];
  const gradient = departmentGradient[alumni.department];
  const companyNames = alumni.companyNames.length > 0 ? alumni.companyNames : ["未設定"];
  const [primaryCompany, ...otherCompanies] = companyNames;
  const selectionExperienceCount = alumni.companyExperiences.filter(
    (company) => company.selectionExperience,
  ).length;
  const canContact = alumni.acceptContact && Boolean(alumni.contactEmail);
  const displayName = alumni.nickname ?? "匿名";

  return (
    <article className="alumni-card group relative isolate overflow-hidden rounded-3xl border border-stone-200 bg-white transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.15)] dark:border-stone-800 dark:bg-stone-950 dark:hover:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.5)]">
      {/* ── Hero zone ── */}
      <div className="relative h-28 overflow-hidden">
        {/* Gradient background — always present */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90`} />
        {/* Decorative light effects */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.35),transparent_55%),radial-gradient(circle_at_85%_30%,rgba(255,255,255,0.2),transparent_45%)]"
        />
        {/* Floating confetti dots */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <span className="absolute left-[12%] top-[18%] h-1.5 w-1.5 rounded-full bg-white/60 blur-[0.5px]" />
          <span className="absolute left-[30%] top-[65%] h-1 w-1 rounded-full bg-white/50" />
          <span className="absolute left-[55%] top-[22%] h-2 w-2 rounded-full bg-white/30 blur-[1px]" />
          <span className="absolute left-[75%] top-[55%] h-1 w-1 rounded-full bg-white/50" />
          <span className="absolute left-[88%] top-[25%] h-1.5 w-1.5 rounded-full bg-white/40 blur-[0.5px]" />
        </div>
        {/* Celebration badge — floats in hero zone */}
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold tracking-wide text-amber-700 shadow-sm backdrop-blur-md dark:bg-black/50 dark:text-amber-200">
          🎉 内定おめでとう！
        </span>
        {/* Department tag */}
        <span className="absolute right-3 top-3 rounded-full bg-black/25 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md">
          {departmentLabel[alumni.department]}
        </span>
      </div>

      {/* ── Avatar row (overlapping hero/body) ── */}
      <div className="relative z-10 -mt-10 flex items-end justify-between px-4">
        {/* Avatar */}
        <div className="relative inline-block">
          {alumni.avatarUrl ? (
            <img
              src={alumni.avatarUrl}
              alt={`${displayName}のプロフィール画像`}
              className="h-20 w-20 rounded-2xl border-[3px] border-white object-cover shadow-lg transition-transform duration-300 group-hover:scale-105 dark:border-stone-900"
            />
          ) : (
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-2xl border-[3px] border-white bg-gradient-to-br ${gradient} text-2xl font-extrabold text-white shadow-lg dark:border-stone-900`}
            >
              {initial}
            </div>
          )}
          {canContact ? (
            <span className="absolute -bottom-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 shadow-sm ring-2 ring-white dark:ring-stone-900">
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <title>連絡受付中</title>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
          ) : null}
        </div>

        {/* Skill tags — right side of avatar row */}
        {alumni.skills.length > 0 ? (
          <div className="ml-3 flex min-w-0 flex-1 flex-col justify-end pb-0.5">
            <div className="ml-auto flex max-w-full flex-col items-start gap-0.5">
              <span className="shrink-0 text-[10px] font-semibold text-stone-400 dark:text-stone-500">
                ⚔️ 就活武器
              </span>
              <div className="flex w-full min-w-0 flex-nowrap justify-start gap-1 overflow-hidden">
                {alumni.skills.slice(0, 3).map((skill) => (
                  <span
                    key={skill}
                    title={skill}
                    className="min-w-0 shrink truncate rounded-md bg-violet-100/80 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* ── Body ── */}
      <div className="relative px-4 pb-4 pt-2.5">
        {/* Name + year */}
        <div className="flex items-baseline gap-2">
          <h3 className="truncate text-[15px] font-bold text-stone-900 dark:text-stone-100">
            {displayName}
          </h3>
          <span className="shrink-0 text-[11px] font-medium text-stone-400 dark:text-stone-500">
            {alumni.graduationYear}年卒
          </span>
        </div>

        {/* ── Company — the centerpiece ── */}
        <div className="mt-3">
          <p className="text-[22px] font-extrabold leading-tight tracking-tight text-stone-900 dark:text-stone-100">
            {primaryCompany}
          </p>
          {otherCompanies.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {otherCompanies.slice(0, 2).map((name) => (
                <span
                  key={name}
                  className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] font-semibold text-stone-600 dark:bg-stone-800 dark:text-stone-300"
                >
                  ＋ {name}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {/* ── Remarks as personal quote ── */}
        <p className="mt-3 line-clamp-2 border-l-2 border-stone-200 pl-2.5 text-[12px] leading-relaxed text-stone-500 dark:border-stone-700 dark:text-stone-400">
          {alumni.remarks ? (
            alumni.remarks
          ) : (
            <span className="italic text-stone-300 dark:text-stone-600">なし</span>
          )}
        </p>

        {/* ── Detail Link ── */}
        {alumni.skills.length > 0 ||
        alumni.gakuchika ||
        alumni.usefulCoursework ||
        alumni.portfolioUrl ||
        selectionExperienceCount > 0 ? (
          <Link
            href={`/alumni/${alumni.id}`}
            className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-violet-600 transition-colors hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-300"
          >
            <span>詳しく見る</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <title>詳細</title>
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        ) : null}

        {/* ── Contact CTA ── */}
        <div className="mt-4">
          {canContact ? (
            <a
              href={`mailto:${alumni.contactEmail}`}
              className="group/cta flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-[12px] font-semibold text-white transition-all duration-200 hover:bg-stone-800 hover:shadow-lg active:scale-[0.98] dark:bg-white dark:text-stone-900 dark:hover:bg-stone-100"
            >
              <span>この先輩に話を聞いてみる</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform group-hover/cta:translate-x-0.5"
              >
                <title>送信</title>
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </a>
          ) : (
            <div className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-stone-200 px-4 py-2.5 text-[11px] text-stone-400 dark:border-stone-800 dark:text-stone-600">
              <span>現在は連絡を受け付けていません</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
