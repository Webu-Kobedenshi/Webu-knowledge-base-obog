"use client";

import { Button } from "@/components/atoms/button";
import { ChevronLeftIcon, ExternalLinkIcon, MousePointerClickIcon } from "@/components/atoms/icons";
import { SocialContactIcon } from "@/components/atoms/social-contact-icon";
import type { AlumniProfile } from "@/graphql/types";
import { getAlumniContactClassName, getAlumniContactLinks } from "@/lib/alumni-contact";
import { departmentGradient } from "@/lib/department-theme";
import {
  decodeWebTestTimeAssessment,
  decodeWebTestType,
  getWebTestTimeAssessmentLabel,
  getWebTestTypeLabel,
} from "@/lib/selection-step-meta";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type AlumniDetailTemplateProps = {
  alumni: AlumniProfile;
  selectedCompanyExperienceId?: string;
  returnHref?: string;
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

export function AlumniDetailTemplate({
  alumni,
  selectedCompanyExperienceId,
  returnHref = "/",
}: AlumniDetailTemplateProps) {
  const gradient = departmentGradient[alumni.department];
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
  const initialSelectedCompanyId = companyExperiences.some(
    (company) => company.id === selectedCompanyExperienceId,
  )
    ? (selectedCompanyExperienceId ?? "")
    : (companyExperiences[0]?.id ?? "");
  const [selectedCompanyId, setSelectedCompanyId] = useState(initialSelectedCompanyId);
  const selectedCompany =
    companyExperiences.find((company) => company.id === selectedCompanyId) ?? companyExperiences[0];
  const selectedExperience = selectedCompany?.selectionExperience ?? null;
  const visibleSelectionSteps =
    selectedExperience?.steps.filter((step) => step.stepKind !== "OFFER") ?? [];
  const companiesWithExperienceCount = companyExperiences.filter(
    (company) => company.selectionExperience,
  ).length;
  const contactLinks = getAlumniContactLinks(alumni);
  const canContact = alumni.acceptContact && contactLinks.length > 0;
  const hasDeepDive =
    alumni.skills.length > 0 || alumni.portfolioUrl || alumni.gakuchika || alumni.usefulCoursework;

  useEffect(() => {
    if (
      selectedCompanyExperienceId &&
      companyExperiences.some((company) => company.id === selectedCompanyExperienceId)
    ) {
      setSelectedCompanyId(selectedCompanyExperienceId);
    }
  }, [companyExperiences, selectedCompanyExperienceId]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-4 py-6 md:px-6 md:py-10">
      {/* ── Navigation ── */}
      <nav className="mb-6">
        <Link
          href={returnHref}
          className="group inline-flex items-center gap-1.5 text-[13px] font-medium text-stone-500 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
        >
          <ChevronLeftIcon
            size={16}
            className="transition-transform group-hover:-translate-x-0.5"
            title="戻る"
          />
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
      <section
        id="selection-flow"
        className="mt-4 scroll-mt-4 rounded-2xl border border-stone-200/90 bg-white p-5 shadow-[0_8px_24px_-18px_rgba(0,0,0,0.15)] dark:border-stone-800/80 dark:bg-stone-900/40"
      >
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
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-900/30 dark:text-emerald-300">
              選考フローあり
            </span>
          ) : null}
        </div>

        {companyExperiences.length > 1 ? (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {companyExperiences.map((company) => {
              const isSelected = company.id === selectedCompany?.id;
              return (
                <Button
                  key={company.id}
                  type="button"
                  onClick={() => setSelectedCompanyId(company.id)}
                  variant={isSelected ? "secondary" : "outline"}
                  className={`h-auto shrink-0 px-3 py-2 text-left ${
                    isSelected
                      ? "border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900"
                      : "border-stone-200 bg-white text-stone-700 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-300"
                  }`}
                >
                  <span className="block max-w-40 truncate text-[12px] font-bold">
                    {company.companyName}
                  </span>
                  {company.selectionExperience ? (
                    <span
                      className={`mt-0.5 block text-[10px] ${
                        isSelected ? "text-white/70 dark:text-stone-600" : "text-stone-400"
                      }`}
                    >
                      選考体験あり
                    </span>
                  ) : null}
                </Button>
              );
            })}
          </div>
        ) : null}

        {selectedCompany ? (
          <div className="mt-4">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
              <h3 className="min-w-0 flex-1 break-words text-lg font-extrabold text-stone-900 dark:text-stone-100">
                {selectedCompany.companyName}
              </h3>
              {selectedExperience?.entryTrigger ? (
                <div className="inline-flex max-w-full shrink-0 items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-amber-950 shadow-sm dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/70 dark:text-amber-200">
                    <MousePointerClickIcon aria-hidden="true" className="size-3.5" />
                  </span>
                  <span className="text-[10px] font-bold leading-none text-amber-700 dark:text-amber-300">
                    エントリーのきっかけ
                  </span>
                  <span className="min-w-0 truncate text-[12px] font-extrabold leading-none">
                    {selectedExperience.entryTrigger}
                  </span>
                </div>
              ) : null}
            </div>

            {selectedExperience ? (
              <div className="mt-4 space-y-4">
                {visibleSelectionSteps.length > 0 ? (
                  <div className="relative space-y-3">
                    <div className="absolute bottom-4 left-[15px] top-4 w-px bg-stone-200 dark:bg-stone-700" />
                    {visibleSelectionSteps.map((step, index) =>
                      (() => {
                        const isWebTestStep = step.stepKind === "WEB_TEST";
                        const isCodingTestStep = step.stepKind === "CODING_TEST";
                        const isDocumentScreeningStep = step.stepKind === "DOCUMENT_SCREENING";
                        const webTestTypeLabel = getWebTestTypeLabel(
                          decodeWebTestType(step.questions),
                        );
                        const webTestTimeAssessmentLabel = getWebTestTimeAssessmentLabel(
                          decodeWebTestTimeAssessment(step.atmosphere),
                        );

                        return (
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
                                  {selectionStepKindLabel[step.stepKind] || "選考ステップ"}
                                </h4>
                                {!isDocumentScreeningStep ? (
                                  <span className="rounded-md border border-stone-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-stone-500 shadow-sm dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400">
                                    {selectionFormatLabel[step.format] ?? step.format}
                                  </span>
                                ) : null}
                                {!isWebTestStep &&
                                !isDocumentScreeningStep &&
                                step.interviewerCount ? (
                                  <span className="rounded-md border border-stone-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-stone-500 shadow-sm dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400">
                                    {step.interviewerCount >= 4
                                      ? isCodingTestStep
                                        ? "試験官 複数人"
                                        : "面接官 複数人"
                                      : isCodingTestStep
                                        ? `試験官 ${step.interviewerCount}人`
                                        : `面接官 ${step.interviewerCount}人`}
                                  </span>
                                ) : null}
                                {!isDocumentScreeningStep && step.durationMinutes ? (
                                  <span className="rounded-md border border-stone-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-stone-500 shadow-sm dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400">
                                    {isWebTestStep
                                      ? `所要時間 ${step.durationMinutes}分`
                                      : isCodingTestStep
                                        ? `制限時間 ${step.durationMinutes}分`
                                        : `面接時間 ${step.durationMinutes}分`}
                                  </span>
                                ) : null}
                              </div>

                              {isWebTestStep && webTestTypeLabel ? (
                                <div className="mt-3">
                                  <p className="text-[10px] font-bold text-stone-400">
                                    Webテストの種類
                                  </p>
                                  <p className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed text-stone-700 dark:text-stone-300">
                                    {webTestTypeLabel}
                                  </p>
                                </div>
                              ) : null}
                              {isWebTestStep && webTestTimeAssessmentLabel ? (
                                <div className="mt-3">
                                  <p className="text-[10px] font-bold text-stone-400">時間の感覚</p>
                                  <p className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed text-stone-700 dark:text-stone-300">
                                    {webTestTimeAssessmentLabel}
                                  </p>
                                </div>
                              ) : null}
                              {!isWebTestStep && step.questions ? (
                                <div className="mt-3">
                                  <p className="text-[10px] font-bold text-stone-400">
                                    {isCodingTestStep
                                      ? "出題内容"
                                      : isDocumentScreeningStep
                                        ? "確認される内容"
                                        : "聞かれた質問"}
                                  </p>
                                  <p className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed text-stone-700 dark:text-stone-300">
                                    {step.questions}
                                  </p>
                                </div>
                              ) : null}
                              {!isWebTestStep && !isDocumentScreeningStep && step.atmosphere ? (
                                <div className="mt-3">
                                  <p className="text-[10px] font-bold text-stone-400">
                                    {isCodingTestStep ? "使用言語・実行環境" : "雰囲気"}
                                  </p>
                                  <p className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed text-stone-700 dark:text-stone-300">
                                    {step.atmosphere}
                                  </p>
                                </div>
                              ) : null}
                              {!isDocumentScreeningStep && step.preparation ? (
                                <div className="mt-3">
                                  <p className="text-[10px] font-bold text-stone-400">
                                    {isWebTestStep
                                      ? "対策してよかったこと"
                                      : isCodingTestStep
                                        ? "解き方や対策で役立ったこと"
                                        : "準備してよかったこと"}
                                  </p>
                                  <p className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed text-stone-700 dark:text-stone-300">
                                    {step.preparation}
                                  </p>
                                </div>
                              ) : null}
                            </article>
                          </div>
                        );
                      })(),
                    )}
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
              <div className="mt-4 rounded-xl border border-dashed border-stone-200 p-4 text-center text-[12px] text-stone-500 dark:border-stone-800 dark:text-stone-400">
                未登録
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
                    <ExternalLinkIcon size={14} title="ポートフォリオ" />
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
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-stone-400 dark:text-stone-500">
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
                  className={`group/cta flex min-w-0 items-center justify-center rounded-2xl px-4 py-3.5 transition-all duration-200 hover:shadow-lg active:scale-[0.98] ${getAlumniContactClassName(contactLink.label)}`}
                >
                  <SocialContactIcon
                    platform={contactLink.label}
                    size={18}
                    className="shrink-0 transition-transform group-hover/cta:scale-110"
                  />
                </a>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-stone-200 px-5 py-3.5 text-[13px] text-stone-400 dark:border-stone-800 dark:text-stone-600">
            <span>現在は連絡を受け付けていません</span>
          </div>
        )}
      </div>
    </main>
  );
}
