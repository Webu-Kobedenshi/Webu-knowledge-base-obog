import { SocialContactIcon } from "@/components/atoms/social-contact-icon";
import type { AlumniProfile } from "@/graphql/types";
import { getAlumniContactClassName, getAlumniContactLinks } from "@/lib/alumni-contact";
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
  const contactLinks = getAlumniContactLinks(alumni);
  const canContact = alumni.acceptContact && contactLinks.length > 0;
  const displayName = alumni.nickname ?? "匿名";

  return (
    <article className="alumni-card group relative isolate flex h-full flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.15)] dark:border-stone-800 dark:bg-stone-950 dark:hover:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.5)]">
      {/* ── Hero zone ── */}
      <div className="relative h-24 overflow-hidden">
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
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-amber-700 shadow-sm backdrop-blur-md dark:bg-black/50 dark:text-amber-200">
          🎉 内定おめでとう！
        </span>
        {/* Department tag */}
        <span className="absolute right-3 top-3 rounded-full bg-black/25 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md">
          {departmentLabel[alumni.department]}
        </span>
      </div>

      {/* ── Avatar row (overlapping hero/body) ── */}
      <div className="relative z-10 -mt-8 flex min-h-[4.75rem] items-start justify-between gap-3 px-4">
        {/* Avatar */}
        <div className="relative inline-block">
          {alumni.avatarUrl ? (
            <img
              src={alumni.avatarUrl}
              alt={`${displayName}のプロフィール画像`}
              className="h-16 w-16 rounded-xl border-[3px] border-white object-cover shadow-lg transition-transform duration-300 group-hover:scale-105 dark:border-stone-900"
            />
          ) : (
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-xl border-[3px] border-white bg-gradient-to-br ${gradient} text-xl font-extrabold text-white shadow-lg dark:border-stone-900`}
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

        <div className="flex min-w-0 flex-1 justify-end pt-10">
          {alumni.skills.length > 0 ? (
            <div className="flex max-w-full flex-col items-start gap-1">
              <span className="shrink-0 text-[10px] font-bold text-stone-400 dark:text-stone-500">
                就活武器
              </span>
              <div className="flex max-w-full flex-wrap justify-start gap-1">
                {alumni.skills.slice(0, 3).map((skill) => (
                  <span
                    key={skill}
                    title={skill}
                    className="min-w-0 max-w-20 shrink truncate rounded-md bg-violet-100/80 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="relative flex flex-1 flex-col px-4 pb-3 pt-2">
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
        <div
          className={`mt-2 min-h-[3.25rem] ${
            otherCompanies.length === 0 ? "flex items-center" : ""
          }`}
        >
          <p
            className={`line-clamp-2 font-extrabold leading-tight tracking-tight text-stone-900 dark:text-stone-100 ${
              otherCompanies.length === 0 ? "text-[26px]" : "text-[20px]"
            }`}
          >
            {primaryCompany}
          </p>
          {otherCompanies.length > 0 ? (
            <div className="mt-1.5 flex min-h-[1.375rem] flex-wrap gap-1.5">
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
        <p className="mt-2 min-h-[3.25rem] line-clamp-2 border-l-2 border-stone-200 pl-2.5 text-[12px] leading-relaxed text-stone-500 dark:border-stone-700 dark:text-stone-400">
          {alumni.remarks ? (
            alumni.remarks
          ) : (
            <span className="italic text-stone-300 dark:text-stone-600">なし</span>
          )}
        </p>

        {/* ── Detail Link ── */}
        <div className="mt-2 min-h-[1.25rem]">
          {alumni.skills.length > 0 ||
          alumni.gakuchika ||
          alumni.usefulCoursework ||
          alumni.portfolioUrl ||
          selectionExperienceCount > 0 ? (
            <Link
              href={`/alumni/${alumni.id}`}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-600 transition-colors hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-300"
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
        </div>

        {/* ── Contact CTA ── */}
        <div className="mt-auto pt-3">
          {canContact ? (
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-stone-400 dark:text-stone-500">
                SNSで連絡する
              </p>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(0,1fr))] gap-2">
                {contactLinks.map((contactLink) => (
                  <a
                    key={contactLink.label}
                    href={contactLink.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${contactLink.label}で連絡する`}
                    title={`${contactLink.label}で連絡する`}
                    className={`group/cta flex min-w-0 items-center justify-center rounded-xl px-3 py-2 transition-all duration-200 hover:shadow-lg active:scale-[0.98] ${getAlumniContactClassName(contactLink.label)}`}
                  >
                    <SocialContactIcon
                      platform={contactLink.label}
                      size={16}
                      className="shrink-0 transition-transform group-hover/cta:scale-110"
                    />
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-stone-200 px-4 py-2 text-[11px] text-stone-400 dark:border-stone-800 dark:text-stone-600">
              <span>現在は連絡を受け付けていません</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
