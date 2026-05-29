export type Department =
  | "IT_EXPERT"
  | "IT_SPECIALIST"
  | "INFORMATION_PROCESS"
  | "PROGRAMMING"
  | "AI_SYSTEM"
  | "ADVANCED_STUDIES"
  | "INFO_BUSINESS"
  | "INFO_ENGINEERING"
  | "GAME_RESEARCH"
  | "GAME_ENGINEER"
  | "GAME_SOFTWARE"
  | "ESPORTS"
  | "CG_ANIMATION"
  | "DIGITAL_ANIME"
  | "GRAPHIC_DESIGN"
  | "INDUSTRIAL_DESIGN"
  | "ARCHITECTURAL"
  | "SOUND_CREATE"
  | "SOUND_TECHNIQUE"
  | "VOICE_ACTOR"
  | "INTERNATIONAL_COMM"
  | "OTHERS";

export type UserStatus = "ENROLLED" | "GRADUATED" | "WITHDRAWN";

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

export type SelectionStep = {
  id: string;
  stepKind: SelectionStepKind;
  format: SelectionFormat;
  interviewerCount: number | null;
  durationMinutes: number | null;
  questions: string | null;
  atmosphere: string | null;
  preparation: string | null;
  sortOrder: number;
};

export type SelectionExperience = {
  id: string;
  entryTrigger: string | null;
  overallTip: string | null;
  steps: SelectionStep[];
};

export type CompanyExperience = {
  id: string;
  companyName: string;
  selectionExperience: SelectionExperience | null;
};

export type AlumniProfile = {
  id: string;
  userId: string;
  nickname: string | null;
  graduationYear: number;
  department: Department;
  companyNames: string[];
  companyExperiences: CompanyExperience[];
  remarks: string | null;
  contactEmail: string | null;
  xUrl: string | null;
  instagramUrl: string | null;
  avatarUrl: string | null;
  skills: string[];
  portfolioUrl: string | null;
  gakuchika: string | null;
  usefulCoursework: string | null;
  isPublic: boolean;
  acceptContact: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AlumniConnection = {
  items: AlumniProfile[];
  totalCount: number;
  hasNextPage: boolean;
};

export type MyAccountProfile = {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "ALUMNI" | "ADMIN";
};
