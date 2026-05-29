"use client";

import type { AlumniProfile } from "@/graphql/types";
import Link from "next/link";
import { useMemo, useState } from "react";

type AlumniDetailTemplateProps = {
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

const departmentGradient: Partial<Record<AlumniProfile["department"], string>> = {
  IT_EXPERT: "from-violet-500 to-indigo-500",
  IT_SPECIALIST: "from-blue-500 to-cyan-500",
  INFORMATION_PROCESS: "from-sky-500 to-blue-500",
  PROGRAMMING: "from-emerald-500 to-teal-500",
  AI_SYSTEM: "from-purple-500 to-violet-500",
  ADVANCED_STUDIES: "from-amber-500 to-orange-500",
  INFO_BUSINESS: "from-cyan-500 to-blue-500",
  INFO_ENGINEERING: "from-indigo-500 to-blue-500",
  GAME_RESEARCH: "from-rose-500 to-pink-500",
  GAME_ENGINEER: "from-red-500 to-rose-500",
  GAME_SOFTWARE: "from-pink-500 to-fuchsia-500",
  ESPORTS: "from-lime-500 to-green-500",
  CG_ANIMATION: "from-fuchsia-500 to-purple-500",
  DIGITAL_ANIME: "from-pink-500 to-rose-500",
  GRAPHIC_DESIGN: "from-orange-500 to-amber-500",
  INDUSTRIAL_DESIGN: "from-teal-500 to-emerald-500",
  ARCHITECTURAL: "from-stone-500 to-zinc-500",
  SOUND_CREATE: "from-yellow-500 to-amber-500",
  SOUND_TECHNIQUE: "from-amber-500 to-yellow-500",
  VOICE_ACTOR: "from-rose-400 to-pink-400",
  INTERNATIONAL_COMM: "from-blue-500 to-indigo-500",
  OTHERS: "from-gray-500 to-slate-500",
};

const selectionStepKindLabel: Record<string, string> = {
  DOCUMENT_SCREENING: "書類選考",
  WEB_TEST: "Webテスト",
  ASSIGNMENT: "課題",
  CODING_TEST: "コーディング試験",
  CASUAL_INTERVIEW: "カジュアル面談",
  FIRST_INTERVIEW: "一次面接",
  SECOND_INTERVIEW: "二次面接",
  FINAL_INTERVIEW: "最終面接",
  OFFER: "内定",
  OTHER: "その他",
};

const selectionFormatLabel: Record<string, string> = {
  ONLINE: "オンライン",
  IN_PERSON: "対面",
  UNKNOWN: "不明",
};

export function AlumniDetailTemplate({ alumni }: AlumniDetailTemplateProps) {
  const gradient = departmentGradient[alumni.department] ?? "from-gray-500 to-slate-500";
  const displayName = alumni.nickname ?? "匿名";
  const initial = (displayName || "匿")[0];
  const companyNames = alumni.companyNames.length > 0 ? alumni.companyNames : ["未設定"];
  const companyExperiences = useMemo(() => {
    if (alumni.companyExperiences.length > 0) {
      return alumni.companyExperiences;
    }

    return companyNames.map((companyName, index) => ({
      id: `${companyName}-${index}`,
      companyName,
      selectionExperience: null,
    }));
  }, [alumni.companyExperiences, companyNames]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(companyExperiences[0]?.id ?? "");
  const selectedCompany =
    companyExperiences.find((company) => company.id === selectedCompanyId) ?? companyExperiences[0];
  const selectedExperience = selectedCompany?.selectionExperience ?? null;
  const companiesWithExperienceCount = companyExperiences.filter(
    (company) => company.selectionExperience,
  ).length;
  const canContact = alumni.acceptContact && Boolean(alumni.contactEmail);
  const hasDeepDive =
    alumni.skills.length > 0 || alumni.portfolioUrl || alumni.gakuchika || alumni.usefulCoursework;

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-4 py-6 md:px-6 md:py-10">
      {/* ── Navigation ── */}
      <nav className="mb-6">
        <Link
          href="/"
          className="group inline-flex items-center gap-1.5 text-[13px] font-medium text-stone-500 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform group-hover:-translate-x-0.5"
          >
            <title>戻る</title>
            <path d="m15 18-6-6 6-6" />
          </svg>
          一覧に戻る
        </Link>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative isolate overflow-hidden rounded-3xl border border-stone-200/90 bg-white shadow-[0_10px_30px_-18px_rgba(0,0,0,0.25)] ring-1 ring-stone-100/80 dark:border-stone-800 dark:bg-stone-950 dark:ring-stone-800/60">
        {/* Hero banner */}
        <div className={`relative h-36 bg-gradient-to-br ${gradient} md:h-40`}>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.3),transparent_55%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.15),transparent_40%)]"
          />
          {alumni.avatarUrl ? (
            <img
              src={alumni.avatarUrl}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover mix-blend-overlay opacity-30"
            />
          ) : null}
          {/* Floating dots */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <span className="absolute left-[10%] top-[25%] h-2 w-2 rounded-full bg-white/40 blur-[0.5px]" />
            <span className="absolute left-[35%] top-[60%] h-1.5 w-1.5 rounded-full bg-white/35" />
            <span className="absolute left-[60%] top-[20%] h-2.5 w-2.5 rounded-full bg-white/20 blur-[1px]" />
            <span className="absolute left-[82%] top-[50%] h-1.5 w-1.5 rounded-full bg-white/30" />
          </div>
          {/* Badges */}
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold tracking-wide text-amber-700 shadow-sm backdrop-blur-md dark:bg-black/50 dark:text-amber-200">
            🎉 内定おめでとう！
          </span>
          <span className="absolute right-3 top-3 rounded-full bg-black/25 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md">
            {departmentLabel[alumni.department]}
          </span>
        </div>

        {/* Avatar + identity */}
        <div className="relative px-5 pb-6 md:px-6">
          <div className="-mt-14 flex items-end gap-4">
            {alumni.avatarUrl ? (
              <img
                src={alumni.avatarUrl}
                alt={`${displayName}のプロフィール画像`}
                className="h-28 w-28 rounded-2xl border-4 border-white object-cover shadow-lg dark:border-stone-950"
              />
            ) : (
              <div
                className={`flex h-28 w-28 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br ${gradient} text-4xl font-extrabold text-white shadow-lg dark:border-stone-950`}
              >
                {initial}
              </div>
            )}
            <div className="mb-1 min-w-0 flex-1">
              <h1 className="truncate text-2xl font-extrabold text-stone-900 dark:text-stone-100">
                {displayName}
              </h1>
              <p className="mt-0.5 text-[13px] text-stone-500 dark:text-stone-400">
                {departmentLabel[alumni.department]} · {alumni.graduationYear}
                年卒
              </p>
            </div>
          </div>

          {/* Companies */}
          <div className="mt-5">
            {companyNames.map((name, index) => (
              <p
                key={name}
                className={`${index === 0 ? "text-2xl font-extrabold" : "mt-1 text-base font-bold text-stone-600 dark:text-stone-400"} break-words leading-tight tracking-tight text-stone-900 dark:text-stone-100`}
              >
                {index > 0 ? `＋ ${name}` : name}
              </p>
            ))}
          </div>

          {/* Remarks */}
          {alumni.remarks ? (
            <p className="mt-4 break-words border-l-2 border-stone-200 pl-3 text-[13px] leading-relaxed text-stone-600 dark:border-stone-700 dark:text-stone-400">
              {alumni.remarks}
            </p>
          ) : null}
        </div>
      </section>

      {/* ── Company Selection Experience ── */}
      <section className="mt-4 rounded-2xl border border-stone-200/90 bg-white p-5 shadow-[0_8px_24px_-18px_rgba(0,0,0,0.15)] dark:border-stone-800/80 dark:bg-stone-900/40">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              企業別の選考体験
            </h2>
            <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
              {companiesWithExperienceCount > 0
                ? `${companiesWithExperienceCount}社の選考フローが公開されています`
                : "この先輩は企業名のみ公開しています"}
            </p>
          </div>
          {selectedExperience ? (
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              選考フローあり
            </span>
          ) : null}
        </div>

        {companyExperiences.length > 1 ? (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {companyExperiences.map((company) => {
              const isSelected = company.id === selectedCompany?.id;
              return (
                <button
                  key={company.id}
                  type="button"
                  onClick={() => setSelectedCompanyId(company.id)}
                  className={`shrink-0 rounded-xl border px-3 py-2 text-left transition ${
                    isSelected
                      ? "border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900"
                      : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-300 dark:hover:bg-stone-800"
                  }`}
                >
                  <span className="block max-w-40 truncate text-[12px] font-bold">
                    {company.companyName}
                  </span>
                  <span
                    className={`mt-0.5 block text-[10px] ${
                      isSelected ? "text-white/70 dark:text-stone-600" : "text-stone-400"
                    }`}
                  >
                    {company.selectionExperience ? "選考体験あり" : "企業名のみ"}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}

        {selectedCompany ? (
          <div className="mt-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="break-words text-lg font-extrabold text-stone-900 dark:text-stone-100">
                {selectedCompany.companyName}
              </h3>
              {selectedExperience?.entryTrigger ? (
                <span className="shrink-0 rounded-lg bg-stone-100 px-2 py-1 text-[10px] font-semibold text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                  {selectedExperience.entryTrigger}
                </span>
              ) : null}
            </div>

            {selectedExperience ? (
              <div className="mt-4 space-y-4">
                {selectedExperience.steps.length > 0 ? (
                  <div className="relative space-y-3">
                    <div className="absolute bottom-4 left-[15px] top-4 w-px bg-stone-200 dark:bg-stone-700" />
                    {selectedExperience.steps.map((step, index) => (
                      <div
                        key={step.id}
                        className="relative grid grid-cols-[32px_minmax(0,1fr)] gap-3"
                      >
                        <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-stone-900 text-[11px] font-bold text-white dark:bg-stone-100 dark:text-stone-900">
                          {index + 1}
                        </div>
                        <article className="rounded-xl border border-stone-200 bg-stone-50/70 p-4 dark:border-stone-800 dark:bg-stone-950/60">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
                              {step.stepTitle ||
                                selectionStepKindLabel[step.stepKind] ||
                                "選考ステップ"}
                            </h4>
                            <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-semibold text-stone-500 dark:bg-stone-900 dark:text-stone-400">
                              {selectionStepKindLabel[step.stepKind] ?? step.stepKind}
                            </span>
                            <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-semibold text-stone-500 dark:bg-stone-900 dark:text-stone-400">
                              {selectionFormatLabel[step.format] ?? step.format}
                            </span>
                            {step.interviewerCount ? (
                              <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-semibold text-stone-500 dark:bg-stone-900 dark:text-stone-400">
                                面接官 {step.interviewerCount}人
                              </span>
                            ) : null}
                            {step.durationMinutes ? (
                              <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-semibold text-stone-500 dark:bg-stone-900 dark:text-stone-400">
                                {step.durationMinutes}分
                              </span>
                            ) : null}
                          </div>

                          {step.questions ? (
                            <div className="mt-3">
                              <p className="text-[10px] font-bold text-stone-400">聞かれた質問</p>
                              <p className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed text-stone-700 dark:text-stone-300">
                                {step.questions}
                              </p>
                            </div>
                          ) : null}
                          {step.atmosphere ? (
                            <div className="mt-3">
                              <p className="text-[10px] font-bold text-stone-400">雰囲気</p>
                              <p className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed text-stone-700 dark:text-stone-300">
                                {step.atmosphere}
                              </p>
                            </div>
                          ) : null}
                          {step.preparation ? (
                            <div className="mt-3">
                              <p className="text-[10px] font-bold text-stone-400">
                                準備してよかったこと
                              </p>
                              <p className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed text-stone-700 dark:text-stone-300">
                                {step.preparation}
                              </p>
                            </div>
                          ) : null}
                        </article>
                      </div>
                    ))}
                  </div>
                ) : null}

                {selectedExperience.overallTip ? (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                    <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                      この企業を受ける後輩へ
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-[13px] leading-relaxed text-emerald-900 dark:text-emerald-100">
                      {selectedExperience.overallTip}
                    </p>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-stone-200 p-4 text-[12px] text-stone-500 dark:border-stone-800 dark:text-stone-400">
                この企業は内定先として公開されています。選考フローや面接質問はまだ登録されていません。
              </div>
            )}
          </div>
        ) : null}
      </section>

      {/* ── Deep Dive Sections ── */}
      {hasDeepDive ? (
        <div className="mt-4 space-y-3">
          {/* スキルと武器 */}
          {alumni.skills.length > 0 || alumni.portfolioUrl ? (
            <section className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-[0_8px_24px_-18px_rgba(0,0,0,0.15)] dark:border-stone-800/80 dark:bg-stone-900/40">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-sm dark:bg-violet-900/40">
                  ⚔️
                </span>
                <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  スキルと武器
                </h2>
              </div>
              {alumni.skills.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {alumni.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-lg bg-violet-100/80 px-2.5 py-1 text-[12px] font-semibold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : null}
              {alumni.portfolioUrl ? (
                <div className="mt-3">
                  <a
                    href={alumni.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200/80 bg-stone-50/80 px-3 py-1.5 text-[12px] font-semibold text-stone-700 transition-colors hover:bg-stone-100 dark:border-stone-700/60 dark:bg-stone-800/60 dark:text-stone-300 dark:hover:bg-stone-800"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <title>ポートフォリオ</title>
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    ポートフォリオを見る
                  </a>
                </div>
              ) : null}
            </section>
          ) : null}

          {/* ガクチカ */}
          {alumni.gakuchika ? (
            <section className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-[0_8px_24px_-18px_rgba(0,0,0,0.15)] dark:border-stone-800/80 dark:bg-stone-900/40">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-sm dark:bg-amber-900/40">
                  🔥
                </span>
                <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  学生時代に力を入れたこと
                </h2>
              </div>
              <p className="mt-3 break-words whitespace-pre-wrap text-[13px] leading-relaxed text-stone-700 dark:text-stone-300">
                {alumni.gakuchika}
              </p>
            </section>
          ) : null}

          {/* 学校のこと */}
          {alumni.usefulCoursework ? (
            <section className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-[0_8px_24px_-18px_rgba(0,0,0,0.15)] dark:border-stone-800/80 dark:bg-stone-900/40">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-sm dark:bg-blue-900/40">
                  📚
                </span>
                <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  役立った授業・先生
                </h2>
              </div>
              <p className="mt-3 break-words whitespace-pre-wrap text-[13px] leading-relaxed text-stone-700 dark:text-stone-300">
                {alumni.usefulCoursework}
              </p>
            </section>
          ) : null}
        </div>
      ) : null}

      {/* ── Contact CTA ── */}
      <div className="mt-6">
        {canContact ? (
          <a
            href={`mailto:${alumni.contactEmail}`}
            className="group/cta flex w-full items-center justify-center gap-2 rounded-2xl bg-stone-900 px-5 py-3.5 text-[14px] font-bold text-white transition-all duration-200 hover:bg-stone-800 hover:shadow-lg active:scale-[0.98] dark:bg-white dark:text-stone-900 dark:hover:bg-stone-100"
          >
            <span>この先輩に話を聞いてみる</span>
            <svg
              width="16"
              height="16"
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
          <div className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-stone-200 px-5 py-3.5 text-[13px] text-stone-400 dark:border-stone-800 dark:text-stone-600">
            <span>現在は連絡を受け付けていません</span>
          </div>
        )}
      </div>
    </main>
  );
}
