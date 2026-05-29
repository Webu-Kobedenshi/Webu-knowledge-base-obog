import { resolveProfileVisibility } from "../alumni-profile-policy";
import { DomainValidationError } from "../errors/domain-validation.error";
import { CompanyNameCollection } from "../value-objects/company-name";
import { EmailAddress } from "../value-objects/email";
import { SkillList } from "../value-objects/skill-list";

export type AlumniProfileDraftInput = {
  nickname?: string;
  companyNames: string[];
  companyExperiences?: CompanyExperienceDraftInput[];
  contactEmail?: string;
  isPublic?: boolean;
  acceptContact?: boolean;
  skills?: string[];
  portfolioUrl?: string;
  gakuchika?: string;
  usefulCoursework?: string;
};

export type SelectionStepKind =
  | "DOCUMENT_SCREENING"
  | "WEB_TEST"
  | "ASSIGNMENT"
  | "CODING_TEST"
  | "CASUAL_INTERVIEW"
  | "FIRST_INTERVIEW"
  | "SECOND_INTERVIEW"
  | "FINAL_INTERVIEW"
  | "OFFER"
  | "OTHER";

export type SelectionFormat = "ONLINE" | "IN_PERSON" | "UNKNOWN";

export type SelectionStepDraftInput = {
  stepKind: SelectionStepKind;
  format?: SelectionFormat;
  interviewerCount?: number;
  durationMinutes?: number;
  questions?: string;
  atmosphere?: string;
  preparation?: string;
};

export type SelectionExperienceDraftInput = {
  entryTrigger?: string;
  overallTip?: string;
  steps?: SelectionStepDraftInput[];
};

export type CompanyExperienceDraftInput = {
  companyName: string;
  selectionExperience?: SelectionExperienceDraftInput | null;
};

export type AlumniProfileDraftData = {
  nickname?: string;
  companyNames: string[];
  companyExperiences?: CompanyExperienceDraftInput[];
  contactEmail: string;
  isPublic: boolean;
  acceptContact: boolean;
  skills: string[];
  portfolioUrl?: string;
  gakuchika?: string;
  usefulCoursework?: string;
};

export class AlumniProfileDraft {
  private constructor(private readonly data: AlumniProfileDraftData) {}

  static create(input: AlumniProfileDraftInput, fallbackEmail: string): AlumniProfileDraft {
    const { isPublic, acceptContact } = resolveProfileVisibility({
      isPublic: input.isPublic,
      acceptContact: input.acceptContact,
    });

    const companyExperiences = input.companyExperiences
      ? normalizeCompanyExperiences(input.companyExperiences)
      : undefined;
    const companyNames = companyExperiences
      ? companyExperiences.map((item) => item.companyName)
      : CompanyNameCollection.from(input.companyNames).toArray();

    const draft = new AlumniProfileDraft({
      nickname: input.nickname !== undefined ? input.nickname.trim() : undefined,
      companyNames,
      companyExperiences,
      contactEmail: EmailAddress.resolve(input.contactEmail, fallbackEmail).toString(),
      isPublic,
      acceptContact: isPublic ? acceptContact : false,
      skills: SkillList.from(input.skills).toArray(),
      portfolioUrl: input.portfolioUrl !== undefined ? input.portfolioUrl.trim() : undefined,
      gakuchika: input.gakuchika !== undefined ? input.gakuchika.trim() : undefined,
      usefulCoursework:
        input.usefulCoursework !== undefined ? input.usefulCoursework.trim() : undefined,
    });

    draft.assertPublishable();

    return draft;
  }

  toData(): AlumniProfileDraftData {
    return {
      ...this.data,
      companyNames: [...this.data.companyNames],
      companyExperiences: this.data.companyExperiences
        ? this.data.companyExperiences.map((company) => ({
            ...company,
            selectionExperience: company.selectionExperience
              ? {
                  ...company.selectionExperience,
                  steps: company.selectionExperience.steps
                    ? company.selectionExperience.steps.map((step) => ({ ...step }))
                    : [],
                }
              : null,
          }))
        : undefined,
      skills: [...this.data.skills],
    };
  }

  private assertPublishable() {
    if (this.data.isPublic && this.data.companyNames.length === 0) {
      throw new DomainValidationError(
        "companyNames must contain at least one item when isPublic is true",
      );
    }

    if (this.data.isPublic && !this.data.nickname) {
      throw new DomainValidationError("nickname is required when isPublic is true");
    }
  }
}

const validStepKinds = new Set<SelectionStepKind>([
  "DOCUMENT_SCREENING",
  "WEB_TEST",
  "ASSIGNMENT",
  "CODING_TEST",
  "CASUAL_INTERVIEW",
  "FIRST_INTERVIEW",
  "SECOND_INTERVIEW",
  "FINAL_INTERVIEW",
  "OFFER",
  "OTHER",
]);

const validFormats = new Set<SelectionFormat>(["ONLINE", "IN_PERSON", "UNKNOWN"]);

function normalizeCompanyExperiences(
  input: CompanyExperienceDraftInput[],
): CompanyExperienceDraftInput[] {
  const seen = new Set<string>();
  const normalized: CompanyExperienceDraftInput[] = [];

  for (const item of input) {
    const companyName = item.companyName.trim();
    if (!companyName || seen.has(companyName)) {
      continue;
    }
    seen.add(companyName);

    normalized.push({
      companyName,
      selectionExperience: item.selectionExperience
        ? normalizeSelectionExperience(item.selectionExperience)
        : null,
    });
  }

  return normalized;
}

function normalizeSelectionExperience(
  input: SelectionExperienceDraftInput,
): SelectionExperienceDraftInput | null {
  const steps = (input.steps ?? [])
    .map(normalizeSelectionStep)
    .filter((step): step is SelectionStepDraftInput => Boolean(step));
  const entryTrigger = input.entryTrigger?.trim();
  const overallTip = input.overallTip?.trim();

  if (!entryTrigger && !overallTip && steps.length === 0) {
    return null;
  }

  return {
    entryTrigger: entryTrigger || undefined,
    overallTip: overallTip || undefined,
    steps,
  };
}

function normalizeSelectionStep(input: SelectionStepDraftInput): SelectionStepDraftInput | null {
  if (!validStepKinds.has(input.stepKind)) {
    throw new DomainValidationError("selection step kind is invalid");
  }

  const format = input.format && validFormats.has(input.format) ? input.format : "UNKNOWN";
  const interviewerCount = normalizePositiveInt(input.interviewerCount);
  const durationMinutes = normalizePositiveInt(input.durationMinutes);
  const questions = input.questions?.trim();
  const atmosphere = input.atmosphere?.trim();
  const preparation = input.preparation?.trim();

  if (!questions && !atmosphere && !preparation && !interviewerCount && !durationMinutes) {
    return null;
  }

  return {
    stepKind: input.stepKind,
    format,
    interviewerCount,
    durationMinutes,
    questions: questions || undefined,
    atmosphere: atmosphere || undefined,
    preparation: preparation || undefined,
  };
}

function normalizePositiveInt(value: number | undefined): number | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (!Number.isInteger(value) || value < 0 || value > 999) {
    throw new DomainValidationError("selection step numeric fields must be between 0 and 999");
  }

  return value;
}
