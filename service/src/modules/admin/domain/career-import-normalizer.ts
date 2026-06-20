import { DEPARTMENTS, type Department } from "../../../common/domain/department";
import type { JobHuntingPeriod } from "../../alumni/domain/entities/alumni-profile.entity";
import type {
  CareerExcelImportRowInput,
  NormalizedCareerImportValues,
} from "../application/dto/career-import.dto";

export type CareerImportNormalizationResult = {
  rawValues: Record<string, string | number | null>;
  normalizedValues: NormalizedCareerImportValues | null;
  errors: string[];
};

const ACTIVITY_PERIOD_ALIASES: Record<string, JobHuntingPeriod> = {
  "1年前期": "FIRST_YEAR_FIRST_HALF",
  "1年 前期": "FIRST_YEAR_FIRST_HALF",
  FIRST_YEAR_FIRST_HALF: "FIRST_YEAR_FIRST_HALF",
  "1年後期": "FIRST_YEAR_SECOND_HALF",
  "1年 後期": "FIRST_YEAR_SECOND_HALF",
  FIRST_YEAR_SECOND_HALF: "FIRST_YEAR_SECOND_HALF",
  "2年前期": "SECOND_YEAR_FIRST_HALF",
  "2年 前期": "SECOND_YEAR_FIRST_HALF",
  SECOND_YEAR_FIRST_HALF: "SECOND_YEAR_FIRST_HALF",
  夏休み: "SUMMER_BREAK",
  SUMMER_BREAK: "SUMMER_BREAK",
  卒業前年秋: "PRE_GRADUATION_AUTUMN",
  PRE_GRADUATION_AUTUMN: "PRE_GRADUATION_AUTUMN",
  その他: "OTHER",
  OTHER: "OTHER",
};

const DEPARTMENT_ALIASES: Record<string, Department> = {
  IT_EXPERT: "IT_EXPERT",
  ITエキスパート学科: "IT_EXPERT",
  IT_SPECIALIST: "IT_SPECIALIST",
  ITスペシャリスト学科: "IT_SPECIALIST",
  INFORMATION_PROCESS: "INFORMATION_PROCESS",
  情報処理学科: "INFORMATION_PROCESS",
  PROGRAMMING: "PROGRAMMING",
  プログラミング学科: "PROGRAMMING",
  AI_SYSTEM: "AI_SYSTEM",
  AIシステム開発学科: "AI_SYSTEM",
  ADVANCED_STUDIES: "ADVANCED_STUDIES",
  総合研究科: "ADVANCED_STUDIES",
  INFO_BUSINESS: "INFO_BUSINESS",
  情報ビジネス学科: "INFO_BUSINESS",
  INFO_ENGINEERING: "INFO_ENGINEERING",
  情報工学科: "INFO_ENGINEERING",
  GAME_RESEARCH: "GAME_RESEARCH",
  ゲーム開発研究学科: "GAME_RESEARCH",
  GAME_ENGINEER: "GAME_ENGINEER",
  ゲームエンジニア学科: "GAME_ENGINEER",
  GAME_SOFTWARE: "GAME_SOFTWARE",
  ゲーム制作学科: "GAME_SOFTWARE",
  ESPORTS: "ESPORTS",
  esportsエンジニア学科: "ESPORTS",
  CG_ANIMATION: "CG_ANIMATION",
  CGアニメーション学科: "CG_ANIMATION",
  DIGITAL_ANIME: "DIGITAL_ANIME",
  デジタルアニメ学科: "DIGITAL_ANIME",
  GRAPHIC_DESIGN: "GRAPHIC_DESIGN",
  グラフィックデザイン学科: "GRAPHIC_DESIGN",
  INDUSTRIAL_DESIGN: "INDUSTRIAL_DESIGN",
  インダストリアルデザイン学科: "INDUSTRIAL_DESIGN",
  ARCHITECTURAL: "ARCHITECTURAL",
  建築インテリアデザイン学科: "ARCHITECTURAL",
  SOUND_CREATE: "SOUND_CREATE",
  サウンドクリエイト学科: "SOUND_CREATE",
  SOUND_TECHNIQUE: "SOUND_TECHNIQUE",
  サウンドテクニック学科: "SOUND_TECHNIQUE",
  VOICE_ACTOR: "VOICE_ACTOR",
  声優タレント学科: "VOICE_ACTOR",
  INTERNATIONAL_COMM: "INTERNATIONAL_COMM",
  国際コミュニケーション学科: "INTERNATIONAL_COMM",
  OTHERS: "OTHERS",
  その他: "OTHERS",
};

const departmentSet = new Set<string>(DEPARTMENTS);

function text(value: string | number | null | undefined): string {
  return String(value ?? "").trim();
}

function optionalText(value: string | number | null | undefined): string | undefined {
  const normalized = text(value);
  return normalized || undefined;
}

function normalizeDepartment(value: string): Department | null {
  const compact = value.replaceAll(/\s+/g, "");
  if (departmentSet.has(compact)) {
    return compact as Department;
  }

  return DEPARTMENT_ALIASES[compact] ?? null;
}

function normalizeActivityPeriod(value: string): JobHuntingPeriod | null {
  return ACTIVITY_PERIOD_ALIASES[value.replaceAll(/\s+/g, "")] ?? null;
}

export function normalizeCareerImportRow(
  input: CareerExcelImportRowInput,
): CareerImportNormalizationResult {
  const rawValues = {
    rowNumber: input.rowNumber,
    studentId: input.studentId ?? null,
    fullName: input.fullName ?? null,
    department: input.department ?? null,
    graduationYear: input.graduationYear ?? null,
    companyName: input.companyName ?? null,
    companyMotivation: input.companyMotivation ?? null,
    activityPeriod: input.activityPeriod ?? null,
    gakuchika: input.gakuchika ?? null,
    email: input.email ?? null,
    remarks: input.remarks ?? null,
    consent: input.consent ?? null,
  };
  const errors: string[] = [];

  const studentId = text(input.studentId);
  const fullName = text(input.fullName);
  const departmentText = text(input.department);
  const graduationYearText = text(input.graduationYear);
  const companyName = text(input.companyName);
  const companyMotivation = text(input.companyMotivation);
  const activityPeriodText = text(input.activityPeriod);
  const gakuchika = text(input.gakuchika);

  if (!studentId) errors.push("学籍番号 is required");
  if (!fullName) errors.push("本名 is required");
  if (!departmentText) errors.push("学科 is required");
  if (!graduationYearText) errors.push("卒業年度 is required");
  if (!companyName) errors.push("内定先 is required");
  if (!companyMotivation) errors.push("なぜこの会社を選んだか is required");
  if (!activityPeriodText) errors.push("始めた就活時期 is required");
  if (!gakuchika) errors.push("ガクチカ is required");

  const department = departmentText ? normalizeDepartment(departmentText) : null;
  if (departmentText && !department) {
    errors.push("学科 is invalid");
  }

  const graduationYear = Number.parseInt(graduationYearText, 10);
  if (
    graduationYearText &&
    (!Number.isInteger(graduationYear) || graduationYear < 2000 || graduationYear > 2100)
  ) {
    errors.push("卒業年度 is invalid");
  }

  const activityPeriod = activityPeriodText ? normalizeActivityPeriod(activityPeriodText) : null;
  if (activityPeriodText && !activityPeriod) {
    errors.push("始めた就活時期 is invalid");
  }

  if (errors.length > 0 || !department || !activityPeriod || !Number.isInteger(graduationYear)) {
    return {
      rawValues,
      normalizedValues: null,
      errors,
    };
  }

  return {
    rawValues,
    normalizedValues: {
      studentId,
      fullName,
      department,
      graduationYear,
      companyName,
      companyMotivation,
      activityPeriod,
      gakuchika,
      email: optionalText(input.email),
      remarks: optionalText(input.remarks),
      consent: optionalText(input.consent),
    },
    errors,
  };
}
