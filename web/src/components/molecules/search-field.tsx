"use client";

import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import { cn } from "@/lib/cn";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type SearchFieldProps = {
  initialDepartment: string;
  initialCompany: string;
  initialGraduationYear: string;
  initialPageSize: number;
};

export function SearchField({
  initialDepartment,
  initialCompany,
  initialGraduationYear,
  initialPageSize,
}: SearchFieldProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [department, setDepartment] = useState(initialDepartment || "");
  const [graduationYear, setGraduationYear] = useState(initialGraduationYear || "");
  const [pageSize, setPageSize] = useState(String(initialPageSize));
  const [companyInput, setCompanyInput] = useState(initialCompany);
  const [company, setCompany] = useState(initialCompany);
  const [isExpandedOnMobile, setIsExpandedOnMobile] = useState(() =>
    Boolean(initialDepartment || initialCompany || initialGraduationYear),
  );
  const canReset = Boolean(department || companyInput || graduationYear || pageSize !== "12");
  const activeFilterCount =
    Number(Boolean(department)) +
    Number(Boolean(companyInput.trim())) +
    Number(Boolean(graduationYear)) +
    Number(pageSize !== "12");

  useEffect(() => {
    const timer = setTimeout(() => {
      setCompany(companyInput.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [companyInput]);

  const nextHref = useMemo(() => {
    const query = new URLSearchParams();

    if (department) {
      query.set("department", department);
    }

    if (company) {
      query.set("company", company);
    }

    if (graduationYear) {
      query.set("graduationYear", graduationYear);
    }

    if (pageSize !== "12") {
      query.set("pageSize", pageSize);
    }

    const serialized = query.toString();
    return serialized ? `${pathname}?${serialized}` : pathname;
  }, [company, department, graduationYear, pageSize, pathname]);

  useEffect(() => {
    router.replace(nextHref, { scroll: false });
  }, [nextHref, router]);

  const handleReset = () => {
    setDepartment("");
    setCompanyInput("");
    setCompany("");
    setGraduationYear("");
    setPageSize("12");
    setIsExpandedOnMobile(false);
    router.replace(pathname, { scroll: false });
  };

  return (
    <form className="liquid-glass rounded-2xl p-4" onSubmit={(event) => event.preventDefault()}>
      <div className="flex items-center justify-between gap-2 md:hidden">
        <p className="text-[12px] font-semibold text-stone-600 dark:text-stone-300">
          絞り込み
          <span className="ml-1 tabular-nums text-stone-400 dark:text-stone-500">
            {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}
          </span>
        </p>
        <Button
          type="button"
          onClick={() => setIsExpandedOnMobile((prev) => !prev)}
          aria-expanded={isExpandedOnMobile}
          aria-controls="search-filter-panel"
          variant="outline"
          size="icon-sm"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn(
              "shrink-0 transition-transform duration-200",
              isExpandedOnMobile && "rotate-180",
            )}
          >
            <title>{isExpandedOnMobile ? "閉じる" : "開く"}</title>
            <path d="m6 9 6 6 6-6" />
          </svg>
        </Button>
      </div>

      <div
        id="search-filter-panel"
        className={cn(
          "mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_120px_auto]",
          !isExpandedOnMobile && "hidden md:grid",
        )}
      >
        <label htmlFor="search-department" className="space-y-1.5">
          <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
            学科で絞り込む
          </span>
          <Select
            value={department || "ALL"}
            onValueChange={(val) => setDepartment(val === "ALL" ? "" : val)}
          >
            <SelectTrigger id="search-department">
              <SelectValue placeholder="すべての学科" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">すべての学科</SelectItem>
              <SelectItem value="IT_EXPERT">ITエキスパート</SelectItem>
              <SelectItem value="IT_SPECIALIST">ITスペシャリスト</SelectItem>
              <SelectItem value="INFORMATION_PROCESS">情報処理</SelectItem>
              <SelectItem value="PROGRAMMING">プログラミング</SelectItem>
              <SelectItem value="AI_SYSTEM">AIシステム開発</SelectItem>
              <SelectItem value="ADVANCED_STUDIES">総合研究科</SelectItem>
              <SelectItem value="INFO_BUSINESS">情報ビジネス</SelectItem>
              <SelectItem value="INFO_ENGINEERING">情報工学</SelectItem>
              <SelectItem value="GAME_RESEARCH">ゲーム開発研究</SelectItem>
              <SelectItem value="GAME_ENGINEER">ゲームエンジニア</SelectItem>
              <SelectItem value="GAME_SOFTWARE">ゲーム制作</SelectItem>
              <SelectItem value="ESPORTS">esportsエンジニア</SelectItem>
              <SelectItem value="CG_ANIMATION">CGアニメーション</SelectItem>
              <SelectItem value="DIGITAL_ANIME">デジタルアニメ</SelectItem>
              <SelectItem value="GRAPHIC_DESIGN">グラフィックデザイン</SelectItem>
              <SelectItem value="INDUSTRIAL_DESIGN">インダストリアルデザイン</SelectItem>
              <SelectItem value="ARCHITECTURAL">建築</SelectItem>
              <SelectItem value="SOUND_CREATE">サウンドクリエイト</SelectItem>
              <SelectItem value="SOUND_TECHNIQUE">サウンドテクニック</SelectItem>
              <SelectItem value="VOICE_ACTOR">声優</SelectItem>
              <SelectItem value="INTERNATIONAL_COMM">国際コミュニケーション</SelectItem>
              <SelectItem value="OTHERS">その他</SelectItem>
            </SelectContent>
          </Select>
        </label>

        <label htmlFor="search-graduation-year" className="space-y-1.5">
          <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
            卒業年度で絞り込む
          </span>
          <Input
            id="search-graduation-year"
            name="graduationYear"
            type="number"
            inputMode="numeric"
            min={1900}
            max={2100}
            value={graduationYear}
            onChange={(event) => setGraduationYear(event.target.value.trim())}
            placeholder="例: 2026"
          />
        </label>

        <label htmlFor="search-company" className="space-y-1.5">
          <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
            企業名で検索
          </span>
          <Input
            id="search-company"
            name="company"
            value={companyInput}
            onChange={(event) => setCompanyInput(event.target.value)}
            placeholder="例: 株式会社○○"
          />
        </label>

        <label htmlFor="search-page-size" className="space-y-1.5">
          <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
            表示件数
          </span>
          <Select value={pageSize} onValueChange={setPageSize}>
            <SelectTrigger id="search-page-size">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12">12件</SelectItem>
              <SelectItem value="24">24件</SelectItem>
              <SelectItem value="36">36件</SelectItem>
              <SelectItem value="48">48件</SelectItem>
            </SelectContent>
          </Select>
        </label>

        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-transparent select-none">リセット</span>
          <Button
            type="button"
            onClick={handleReset}
            disabled={!canReset}
            variant="secondary"
            className="w-full disabled:opacity-50"
          >
            リセット
          </Button>
        </div>
      </div>
    </form>
  );
}
