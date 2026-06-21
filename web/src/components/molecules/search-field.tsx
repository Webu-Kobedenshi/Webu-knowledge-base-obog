"use client";

import { Button } from "@/components/atoms/button";
import { ChevronDownIcon } from "@/components/atoms/icons";
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
import { useEffect, useMemo, useRef, useState } from "react";

type SearchFieldProps = {
  initialDepartment: string;
  initialCompany: string;
  initialGraduationYear: string;
  initialPageSize: number;
  initialSort: "DEFAULT" | "HELPFUL";
};

export function SearchField({
  initialDepartment,
  initialCompany,
  initialGraduationYear,
  initialPageSize,
  initialSort,
}: SearchFieldProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();
  const companySuggestionCacheRef = useRef(new Map<string, string[]>());

  const [department, setDepartment] = useState(initialDepartment || "");
  const [graduationYear, setGraduationYear] = useState(initialGraduationYear || "");
  const [pageSize, setPageSize] = useState(String(initialPageSize));
  const [companyInput, setCompanyInput] = useState(initialCompany);
  const [company, setCompany] = useState(initialCompany);
  const [companySuggestions, setCompanySuggestions] = useState<string[]>([]);
  const [isCompanySuggestionsOpen, setIsCompanySuggestionsOpen] = useState(false);
  const [isCompanySuggestionsLoading, setIsCompanySuggestionsLoading] = useState(false);
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

  useEffect(() => {
    const query = companyInput.trim();

    if (!query) {
      setCompanySuggestions([]);
      setIsCompanySuggestionsLoading(false);
      return;
    }

    const cacheKey = query.toLowerCase();
    const cachedSuggestions = companySuggestionCacheRef.current.get(cacheKey);
    if (cachedSuggestions) {
      setCompanySuggestions(cachedSuggestions);
      setIsCompanySuggestionsLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsCompanySuggestionsLoading(true);

      try {
        const response = await fetch(
          `/api/alumni/company-suggestions?query=${encodeURIComponent(query)}`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          setCompanySuggestions([]);
          return;
        }

        const data = (await response.json()) as { suggestions?: string[] };
        const suggestions = data.suggestions ?? [];
        companySuggestionCacheRef.current.set(cacheKey, suggestions);
        setCompanySuggestions(suggestions);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setCompanySuggestions([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsCompanySuggestionsLoading(false);
        }
      }
    }, 150);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
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

    if (initialSort === "HELPFUL") {
      query.set("sort", "helpful");
    }

    const serialized = query.toString();
    return serialized ? `${pathname}?${serialized}` : pathname;
  }, [company, department, graduationYear, initialSort, pageSize, pathname]);

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

  const startGraduationYearFromCurrentYear = (input: HTMLInputElement) => {
    if (input.value) return false;

    const year = String(currentYear);
    input.value = year;
    setGraduationYear(year);
    return true;
  };

  const handleCompanySuggestionSelect = (suggestion: string) => {
    setCompanyInput(suggestion);
    setCompany(suggestion);
    setIsCompanySuggestionsOpen(false);
  };

  return (
    <form
      className="liquid-glass relative z-50 rounded-2xl p-4"
      onSubmit={(event) => event.preventDefault()}
    >
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
          aria-label={isExpandedOnMobile ? "絞り込みを閉じる" : "絞り込みを開く"}
        >
          <ChevronDownIcon
            size={18}
            className={cn(
              "shrink-0 transition-transform duration-200",
              isExpandedOnMobile && "rotate-180",
            )}
          />
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
            onKeyDown={(event) => {
              if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
              if (startGraduationYearFromCurrentYear(event.currentTarget)) {
                event.preventDefault();
              }
            }}
            onPointerDown={(event) => {
              const input = event.currentTarget;
              const spinButtonWidth = 44;
              const isSpinButtonArea =
                input.getBoundingClientRect().right - event.clientX <= spinButtonWidth;

              if (isSpinButtonArea && startGraduationYearFromCurrentYear(input)) {
                event.preventDefault();
              }
            }}
            placeholder="例: 2026"
          />
        </label>

        <div className="relative space-y-1.5">
          <label
            htmlFor="search-company"
            className="text-[11px] font-semibold text-stone-500 dark:text-stone-400"
          >
            企業名で検索
          </label>
          <Input
            id="search-company"
            name="company"
            value={companyInput}
            onChange={(event) => {
              setCompanyInput(event.target.value);
              setIsCompanySuggestionsOpen(true);
            }}
            onFocus={() => setIsCompanySuggestionsOpen(true)}
            onBlur={() => {
              window.setTimeout(() => setIsCompanySuggestionsOpen(false), 120);
            }}
            autoComplete="off"
            aria-expanded={isCompanySuggestionsOpen && companyInput.trim().length > 0}
            placeholder="例: 株式会社○○"
          />
          {isCompanySuggestionsOpen && companyInput.trim().length > 0 ? (
            <div
              id="company-suggestion-list"
              className="absolute top-full right-0 left-0 z-[60] mt-2 overflow-hidden rounded-xl border border-stone-200/80 bg-white shadow-lg shadow-stone-900/10 dark:border-stone-700 dark:bg-stone-900"
            >
              {companySuggestions.length > 0 ? (
                companySuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className="block w-full px-3.5 py-2.5 text-left text-sm text-stone-800 transition-colors hover:bg-violet-50 focus:bg-violet-50 focus:outline-none dark:text-stone-100 dark:hover:bg-violet-950/40 dark:focus:bg-violet-950/40"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleCompanySuggestionSelect(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))
              ) : (
                <p className="px-3.5 py-2.5 text-sm text-stone-400">
                  {isCompanySuggestionsLoading ? "候補を検索中..." : "候補なし"}
                </p>
              )}
            </div>
          ) : null}
        </div>

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
