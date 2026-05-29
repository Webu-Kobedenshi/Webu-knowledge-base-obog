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
import { Textarea } from "@/components/atoms/textarea";
import { showErrorToast, showSuccessToast } from "@/components/atoms/toast";
import { BasicProfileSection } from "@/components/organisms/account-profile/basic-profile-section";
import { LinkedGmailSection } from "@/components/organisms/account-profile/linked-gmail-section";
import type { AlumniProfile, Department, UserStatus } from "@/graphql/types";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

type Role = "STUDENT" | "ALUMNI" | "ADMIN";

type InitialProfile = {
  id: string;
  email: string;
  name: string | null;
  studentId: string | null;
  linkedGmail: string | null;
  role: Role;
  status: UserStatus;
  enrollmentYear: number | null;
  durationYears: number | null;
  department: Department | null;
  alumniProfile: AlumniProfile | null;
} | null;

type AccountProfileFormProps = {
  initialProfile?: InitialProfile;
  initialName?: string | null;
  initialEmail?: string | null;
  title?: string;
  description?: string;
  showBasicProfileFields?: boolean;
  showPublicProfileFields?: boolean;
  showLinkedGmailField?: boolean;
  onSuccess?: () => void;
  redirectOnSuccess?: string;
};

type AccountProfileFormState = {
  name: string;
  studentId: string;
  enrollmentYear: string;
  durationYears: "" | "1" | "2" | "3" | "4";
  department: Department | "";
  nickname: string;
  companyNames: string[];
  selectionExperiences: SelectionExperienceFormState[];
  remarks: string;
  contactEmail: string;
  xUrl: string;
  instagramUrl: string;
  isPublic: boolean;
  acceptContact: boolean;
  skills: string[];
  portfolioUrl: string;
  gakuchika: string;
  usefulCoursework: string;
};

type SelectionStepKind =
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

type SelectionFormat = "ONLINE" | "IN_PERSON" | "UNKNOWN";

type SelectionStepFormState = {
  stepKind: SelectionStepKind;
  format: SelectionFormat;
  interviewerCount: string;
  durationMinutes: string;
  questions: string;
  atmosphere: string;
  preparation: string;
};

type SelectionExperienceFormState = {
  enabled: boolean;
  entryTrigger: string;
  overallTip: string;
  steps: SelectionStepFormState[];
};

const defaultState: AccountProfileFormState = {
  name: "",
  studentId: "",
  enrollmentYear: "",
  durationYears: "",
  department: "",
  nickname: "",
  companyNames: [],
  selectionExperiences: [],
  remarks: "",
  contactEmail: "",
  xUrl: "",
  instagramUrl: "",
  isPublic: false,
  acceptContact: false,
  skills: [],
  portfolioUrl: "",
  gakuchika: "",
  usefulCoursework: "",
};

const selectionStepOptions: Array<{ value: SelectionStepKind; label: string }> = [
  { value: "DOCUMENT_SCREENING", label: "書類選考" },
  { value: "WEB_TEST", label: "Webテスト" },
  { value: "ASSIGNMENT", label: "課題" },
  { value: "CODING_TEST", label: "コーディング試験" },
  { value: "CASUAL_INTERVIEW", label: "カジュアル面談" },
  { value: "FIRST_INTERVIEW", label: "一次面接" },
  { value: "SECOND_INTERVIEW", label: "二次面接" },
  { value: "FINAL_INTERVIEW", label: "最終面接" },
  { value: "OTHER", label: "その他" },
];

const selectionFormatOptions: Array<{ value: SelectionFormat; label: string }> = [
  { value: "UNKNOWN", label: "不明" },
  { value: "ONLINE", label: "オンライン" },
  { value: "IN_PERSON", label: "対面" },
];

const interviewerCountOptions: Array<{ value: string; label: string }> = [
  { value: "1", label: "1人" },
  { value: "2", label: "2人" },
  { value: "3", label: "3人" },
  { value: "OTHER", label: "その他" },
];

const defaultSelectionStepOrder: SelectionStepKind[] = [
  "DOCUMENT_SCREENING",
  "FIRST_INTERVIEW",
  "SECOND_INTERVIEW",
  "FINAL_INTERVIEW",
];

const departmentOptions: Array<{ value: Department; label: string }> = [
  { value: "IT_EXPERT", label: "ITエキスパート（4年制）" },
  { value: "IT_SPECIALIST", label: "ITスペシャリスト（3年制）" },
  { value: "INFORMATION_PROCESS", label: "情報処理（2年制）" },
  { value: "PROGRAMMING", label: "プログラミング（2年制）" },
  { value: "AI_SYSTEM", label: "AIシステム開発（2年制）" },
  { value: "ADVANCED_STUDIES", label: "総合研究科（1年制）" },
  { value: "INFO_BUSINESS", label: "情報ビジネス（2年制）" },
  { value: "INFO_ENGINEERING", label: "情報工学（2年制）" },
  { value: "GAME_RESEARCH", label: "ゲーム開発研究（4年制）" },
  { value: "GAME_ENGINEER", label: "ゲームエンジニア（3年制）" },
  { value: "GAME_SOFTWARE", label: "ゲーム制作（2年制）" },
  { value: "ESPORTS", label: "esportsエンジニア（2年制）" },
  { value: "CG_ANIMATION", label: "CGアニメーション（2年制）" },
  { value: "DIGITAL_ANIME", label: "デジタルアニメ（2年制）" },
  { value: "GRAPHIC_DESIGN", label: "グラフィックデザイン（2年制）" },
  { value: "INDUSTRIAL_DESIGN", label: "インダストリアルデザイン（2年制）" },
  { value: "ARCHITECTURAL", label: "建築（2年制）" },
  { value: "SOUND_CREATE", label: "サウンドクリエイト（2年制）" },
  { value: "SOUND_TECHNIQUE", label: "サウンドテクニック（2年制）" },
  { value: "VOICE_ACTOR", label: "声優（2年制）" },
  { value: "INTERNATIONAL_COMM", label: "国際コミュニケーション（2年制）" },
  { value: "OTHERS", label: "その他（2年制）" },
];

/** 学科から修業年数を導出する */
function getDurationYears(department: Department): "1" | "2" | "3" | "4" {
  switch (department) {
    case "IT_EXPERT":
    case "GAME_RESEARCH":
      return "4";
    case "IT_SPECIALIST":
    case "GAME_ENGINEER":
      return "3";
    case "ADVANCED_STUDIES":
      return "1";
    default:
      return "2";
  }
}

function createRowId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2);
}

function createBlankSelectionStep(stepKind: SelectionStepKind = "DOCUMENT_SCREENING") {
  return {
    stepKind,
    format: "UNKNOWN",
    interviewerCount: "",
    durationMinutes: "",
    questions: "",
    atmosphere: "",
    preparation: "",
  } satisfies SelectionStepFormState;
}

function getNextSelectionStepKind(steps: SelectionStepFormState[]): SelectionStepKind {
  return (
    defaultSelectionStepOrder.find(
      (stepKind) => !steps.some((step) => step.stepKind === stepKind),
    ) ?? "OTHER"
  );
}

function createBlankSelectionExperience(): SelectionExperienceFormState {
  return {
    enabled: false,
    entryTrigger: "",
    overallTip: "",
    steps: [createBlankSelectionStep()],
  };
}

function hasSelectionStepContent(step: SelectionStepFormState) {
  return Boolean(
    step.interviewerCount.trim() ||
      step.durationMinutes.trim() ||
      step.questions.trim() ||
      step.atmosphere.trim() ||
      step.preparation.trim(),
  );
}

function hasSelectionExperienceContent(experience: SelectionExperienceFormState) {
  return Boolean(
    experience.entryTrigger.trim() ||
      experience.overallTip.trim() ||
      experience.steps.some(hasSelectionStepContent),
  );
}

function getStepDeleteKey(companyIndex: number, stepIndex: number) {
  return `${companyIndex}:${stepIndex}`;
}

export function AccountProfileForm({
  initialProfile,
  initialName,
  initialEmail,
  title = "プロフィール・公開情報",
  description = "初期設定で入力した項目を更新できます。公開する内定先情報もここで管理します。",
  showBasicProfileFields = true,
  showPublicProfileFields = true,
  showLinkedGmailField = true,
  onSuccess,
  redirectOnSuccess,
}: AccountProfileFormProps) {
  const router = useRouter();
  const initialCompanyExperiences = initialProfile?.alumniProfile?.companyExperiences?.length
    ? initialProfile.alumniProfile.companyExperiences
    : (initialProfile?.alumniProfile?.companyNames ?? []).map((companyName) => ({
        id: companyName,
        companyName,
        selectionExperience: null,
      }));
  const initialCompanyNames = initialCompanyExperiences.map((item) => item.companyName);
  const initialSelectionExperiences = initialCompanyExperiences.map((item) => {
    const experience = item.selectionExperience;
    if (!experience) {
      return createBlankSelectionExperience();
    }
    const editableSteps = experience.steps.filter((step) => step.stepKind !== "OFFER");

    return {
      enabled: true,
      entryTrigger: experience.entryTrigger ?? "",
      overallTip: experience.overallTip ?? "",
      steps:
        editableSteps.length > 0
          ? editableSteps.map((step) => ({
              stepKind: step.stepKind,
              format: step.format,
              interviewerCount:
                step.interviewerCount !== null && step.interviewerCount !== undefined
                  ? step.interviewerCount >= 4
                    ? "OTHER"
                    : String(step.interviewerCount)
                  : "",
              durationMinutes:
                step.durationMinutes !== null && step.durationMinutes !== undefined
                  ? String(step.durationMinutes)
                  : "",
              questions: step.questions ?? "",
              atmosphere: step.atmosphere ?? "",
              preparation: step.preparation ?? "",
            }))
          : [createBlankSelectionStep()],
    } satisfies SelectionExperienceFormState;
  });
  const initialAvatarUrl = initialProfile?.alumniProfile?.avatarUrl ?? null;
  const initialIsPublic =
    (initialProfile?.alumniProfile?.isPublic ?? false) && initialCompanyNames.length > 0;

  const currentUserEmail = initialProfile?.email ?? initialEmail ?? "";
  const isSchoolEmail = currentUserEmail.endsWith("@st.kobedenshi.ac.jp");
  const shouldShowLinkedGmailField = showLinkedGmailField && isSchoolEmail;

  const [state, setState] = useState<AccountProfileFormState>({
    ...defaultState,
    name: initialProfile?.name ?? initialName ?? "",
    studentId: initialProfile?.studentId ?? "",
    enrollmentYear: initialProfile?.enrollmentYear ? String(initialProfile.enrollmentYear) : "",
    durationYears: initialProfile?.durationYears
      ? (String(initialProfile.durationYears) as AccountProfileFormState["durationYears"])
      : "",
    department: initialProfile?.department ?? "",
    nickname: initialProfile?.alumniProfile?.nickname ?? initialName ?? "",
    companyNames: initialCompanyNames,
    selectionExperiences: initialSelectionExperiences,
    remarks: initialProfile?.alumniProfile?.remarks ?? "",
    contactEmail: initialProfile?.alumniProfile?.contactEmail ?? initialEmail ?? "",
    xUrl: initialProfile?.alumniProfile?.xUrl ?? "",
    instagramUrl: initialProfile?.alumniProfile?.instagramUrl ?? "",
    isPublic: initialIsPublic,
    acceptContact: initialProfile?.alumniProfile?.acceptContact ?? false,
    skills: initialProfile?.alumniProfile?.skills ?? [],
    portfolioUrl: initialProfile?.alumniProfile?.portfolioUrl ?? "",
    gakuchika: initialProfile?.alumniProfile?.gakuchika ?? "",
    usefulCoursework: initialProfile?.alumniProfile?.usefulCoursework ?? "",
  });
  const [companyRowIds, setCompanyRowIds] = useState<string[]>(() =>
    initialCompanyNames.map(() => createRowId()),
  );
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const avatarFileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [linkedGmailInput, setLinkedGmailInput] = useState("");
  const [currentLinkedGmail, setCurrentLinkedGmail] = useState<string | null>(
    initialProfile?.linkedGmail ?? null,
  );
  const [isLinkingGmail, setIsLinkingGmail] = useState(false);

  const [hasAlumniProfile, setHasAlumniProfile] = useState(Boolean(initialProfile?.alumniProfile));
  const [isSaving, setIsSaving] = useState(false);
  const [deepDiveOpen, setDeepDiveOpen] = useState(false);
  const [loginInfoOpen, setLoginInfoOpen] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [pendingStepDeleteKey, setPendingStepDeleteKey] = useState<string | null>(null);

  const canSubmitInitial = useMemo(() => {
    const enrollmentYear = Number(state.enrollmentYear);
    return (
      Boolean(state.name.trim()) &&
      Boolean(state.studentId.trim()) &&
      Number.isFinite(enrollmentYear) &&
      enrollmentYear >= 2000 &&
      enrollmentYear <= 2100 &&
      ["1", "2", "3", "4"].includes(state.durationYears) &&
      Boolean(state.department)
    );
  }, [state]);

  const canEditAlumniProfile = state.isPublic;

  const setField = <K extends keyof AccountProfileFormState>(
    key: K,
    value: AccountProfileFormState[K],
  ) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const setCompanyNameAt = (index: number, value: string) => {
    setState((prev) => {
      const next = [...prev.companyNames];
      next[index] = value;
      return { ...prev, companyNames: next };
    });
  };

  const addCompanyNameField = () => {
    setCompanyRowIds((prev) => [...prev, createRowId()]);
    setState((prev) => ({
      ...prev,
      companyNames: [...prev.companyNames, ""],
      selectionExperiences: [...prev.selectionExperiences, createBlankSelectionExperience()],
    }));
  };

  const removeCompanyNameField = (index: number) => {
    setCompanyRowIds((prev) => prev.filter((_, itemIndex) => itemIndex !== index));

    setState((prev) => ({
      ...prev,
      companyNames: prev.companyNames.filter((_, itemIndex) => itemIndex !== index),
      selectionExperiences: prev.selectionExperiences.filter((_, itemIndex) => itemIndex !== index),
      isPublic:
        prev.companyNames.filter((_, itemIndex) => itemIndex !== index).length > 0
          ? prev.isPublic
          : false,
      acceptContact:
        prev.companyNames.filter((_, itemIndex) => itemIndex !== index).length > 0
          ? prev.acceptContact
          : false,
    }));
  };

  const updateSelectionExperienceAt = (
    companyIndex: number,
    updater: (value: SelectionExperienceFormState) => SelectionExperienceFormState,
  ) => {
    setState((prev) => ({
      ...prev,
      selectionExperiences: prev.selectionExperiences.map((item, index) =>
        index === companyIndex ? updater(item) : item,
      ),
    }));
  };

  const updateSelectionStepAt = (
    companyIndex: number,
    stepIndex: number,
    updater: (value: SelectionStepFormState) => SelectionStepFormState,
  ) => {
    setPendingStepDeleteKey(null);
    updateSelectionExperienceAt(companyIndex, (experience) => ({
      ...experience,
      steps: experience.steps.map((step, index) => (index === stepIndex ? updater(step) : step)),
    }));
  };

  const addSelectionStep = (companyIndex: number) => {
    setPendingStepDeleteKey(null);
    updateSelectionExperienceAt(companyIndex, (experience) => ({
      ...experience,
      enabled: true,
      steps: [
        ...experience.steps,
        createBlankSelectionStep(getNextSelectionStepKind(experience.steps)),
      ],
    }));
  };

  const removeSelectionStep = (companyIndex: number, stepIndex: number) => {
    setPendingStepDeleteKey(null);
    updateSelectionExperienceAt(companyIndex, (experience) => ({
      ...experience,
      steps:
        experience.steps.length > 1
          ? experience.steps.filter((_, index) => index !== stepIndex)
          : [createBlankSelectionStep()],
    }));
  };

  const saveProfile = async (options?: {
    silent?: boolean;
    forcePrivate?: boolean;
  }): Promise<boolean> => {
    const silent = options?.silent ?? false;
    const forcePrivate = options?.forcePrivate ?? false;

    if (!canSubmitInitial) {
      const msg = "名前・学籍番号・入学年度・学科は必須です。";
      showErrorToast(msg);
      return false;
    }

    const seenCompanyNames = new Set<string>();
    const normalizedCompanyExperiences = state.companyNames.flatMap((companyName, index) => {
      const normalizedCompanyName = companyName.trim();
      if (!normalizedCompanyName || seenCompanyNames.has(normalizedCompanyName)) {
        return [];
      }
      seenCompanyNames.add(normalizedCompanyName);

      const experience = state.selectionExperiences[index] ?? createBlankSelectionExperience();
      const selectionExperience =
        experience.enabled && hasSelectionExperienceContent(experience)
          ? {
              entryTrigger: experience.entryTrigger.trim() || undefined,
              overallTip: experience.overallTip.trim() || undefined,
              steps: experience.steps.filter(hasSelectionStepContent).map((step) => ({
                stepKind: step.stepKind,
                format: step.format,
                interviewerCount:
                  step.interviewerCount.trim() === "OTHER"
                    ? 4
                    : step.interviewerCount.trim()
                      ? Number(step.interviewerCount)
                      : undefined,
                durationMinutes: step.durationMinutes.trim()
                  ? Number(step.durationMinutes)
                  : undefined,
                questions: step.questions.trim() || undefined,
                atmosphere: step.atmosphere.trim() || undefined,
                preparation: step.preparation.trim() || undefined,
              })),
            }
          : null;

      return [
        {
          companyName: normalizedCompanyName,
          selectionExperience,
        },
      ];
    });
    const normalizedCompanyNames = normalizedCompanyExperiences.map((item) => item.companyName);
    const normalizedContactEmail = state.contactEmail.trim() || (initialEmail?.trim() ?? "");
    const isPublicToSave = forcePrivate ? false : state.isPublic;

    if (showPublicProfileFields && isPublicToSave && normalizedCompanyNames.length === 0) {
      const msg = "公開する場合は内定先・勤務先を1件以上入力してください。";
      showErrorToast(msg);
      return false;
    }

    if (showPublicProfileFields && isPublicToSave && !state.nickname.trim()) {
      const msg = "公開する場合は表示名を1文字以上入力してください。";
      showErrorToast(msg);
      return false;
    }

    if (
      showPublicProfileFields &&
      isPublicToSave &&
      state.acceptContact &&
      !state.xUrl.trim() &&
      !state.instagramUrl.trim()
    ) {
      const msg = "連絡を受け付ける場合はXまたはInstagramのリンクを入力してください。";
      showErrorToast(msg);
      return false;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/account/profile", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: state.name.trim(),
          studentId: state.studentId.trim(),
          enrollmentYear: Number(state.enrollmentYear),
          durationYears: Number(state.durationYears),
          department: state.department,
          nickname: state.nickname,
          companyNames: normalizedCompanyNames,
          companyExperiences: normalizedCompanyExperiences,
          remarks: state.remarks,
          contactEmail: normalizedContactEmail,
          xUrl: state.xUrl.trim(),
          instagramUrl: state.instagramUrl.trim(),
          isPublic: isPublicToSave,
          acceptContact: isPublicToSave ? state.acceptContact : false,
          skills: state.skills.map((s) => s.trim()).filter((s) => s.length > 0),
          portfolioUrl: state.portfolioUrl.trim(),
          gakuchika: state.gakuchika.trim(),
          usefulCoursework: state.usefulCoursework.trim(),
        }),
      });

      const json = (await response.json()) as {
        ok?: boolean;
        message?: string;
        alumniUpdated?: boolean;
      };

      if (!response.ok || !json.ok) {
        throw new Error(json.message || "更新に失敗しました");
      }

      if (json.alumniUpdated) {
        setHasAlumniProfile(true);
      }

      if (!silent) {
        if (!showPublicProfileFields) {
          showSuccessToast("保存しました。初期情報を更新しました。");
        } else if (json.alumniUpdated) {
          showSuccessToast("保存しました。初期情報と公開プロフィールを更新しました。");
        } else {
          showSuccessToast("保存しました。初期情報を更新しました。");
        }
        if (onSuccess) {
          onSuccess();
        }
        if (redirectOnSuccess) {
          router.push(redirectOnSuccess);
          router.refresh();
        }
      }

      return true;
    } catch (submitError) {
      const msg = submitError instanceof Error ? submitError.message : "更新に失敗しました";
      showErrorToast(msg);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await saveProfile();
  };

  const handleAvatarUpload = async () => {
    if (!selectedAvatarFile) {
      showErrorToast("画像ファイルを選択してください。");
      return;
    }

    if (!selectedAvatarFile.type.startsWith("image/")) {
      showErrorToast("画像ファイルのみアップロードできます。");
      return;
    }

    if (!hasAlumniProfile) {
      const saved = await saveProfile({ silent: true, forcePrivate: true });
      if (!saved) {
        return;
      }
    }

    setIsUploadingAvatar(true);

    try {
      const uploadUrlResponse = await fetch("/api/account/avatar/upload-url", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          fileName: selectedAvatarFile.name,
          contentType: selectedAvatarFile.type,
        }),
      });

      const uploadUrlJson = (await uploadUrlResponse.json()) as {
        ok?: boolean;
        message?: string;
        uploadUrl?: string;
        fileUrl?: string;
      };

      if (
        !uploadUrlResponse.ok ||
        !uploadUrlJson.ok ||
        !uploadUrlJson.uploadUrl ||
        !uploadUrlJson.fileUrl
      ) {
        throw new Error(uploadUrlJson.message || "アップロードURLの取得に失敗しました");
      }

      const putResponse = await fetch(uploadUrlJson.uploadUrl, {
        method: "PUT",
        headers: {
          "content-type": selectedAvatarFile.type,
        },
        body: selectedAvatarFile,
      });

      if (!putResponse.ok) {
        throw new Error("画像アップロードに失敗しました");
      }

      const completeResponse = await fetch("/api/account/avatar/complete", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          url: uploadUrlJson.fileUrl,
        }),
      });

      const completeJson = (await completeResponse.json()) as {
        ok?: boolean;
        message?: string;
        avatarUrl?: string | null;
      };

      if (!completeResponse.ok || !completeJson.ok) {
        throw new Error(completeJson.message || "画像URLの保存に失敗しました");
      }

      setAvatarUrl(completeJson.avatarUrl ?? uploadUrlJson.fileUrl);
      setSelectedAvatarFile(null);
      if (avatarFileInputRef.current) {
        avatarFileInputRef.current.value = "";
      }
      showSuccessToast("プロフィール画像を更新しました。");
    } catch (uploadError) {
      showErrorToast(
        uploadError instanceof Error ? uploadError.message : "画像アップロードに失敗しました",
      );
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleLinkGmail = async () => {
    const email = linkedGmailInput.trim().toLowerCase();
    if (!email) {
      showErrorToast("Gmailアドレスを入力してください");
      return;
    }

    if (!email.endsWith("@gmail.com")) {
      showErrorToast("有効な @gmail.com アドレスを指定してください");
      return;
    }

    setIsLinkingGmail(true);
    try {
      const response = await fetch("/api/account/gmail", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ gmail: email }),
      });

      const json = await response.json();
      if (!response.ok || !json.ok) {
        throw new Error(json.message || "Gmail連携に失敗しました");
      }

      setCurrentLinkedGmail(email);
      setLinkedGmailInput("");
      showSuccessToast("引き継ぎGmailアドレスを登録しました");
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : "サーバーエラーが発生しました");
    } finally {
      setIsLinkingGmail(false);
    }
  };

  const handleUnlinkGmail = async () => {
    if (!confirm("引き継ぎGmailアドレスの登録を解除します。よろしいですか？")) {
      return;
    }

    setIsLinkingGmail(true);

    try {
      const response = await fetch("/api/account/gmail", {
        method: "DELETE",
      });

      const json = await response.json();
      if (!response.ok || !json.ok) {
        throw new Error(json.message || "Gmail連携の解除に失敗しました");
      }

      setCurrentLinkedGmail(null);
      showSuccessToast("引き継ぎGmailアドレスの登録を解除しました");
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : "サーバーエラーが発生しました");
    } finally {
      setIsLinkingGmail(false);
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      {showBasicProfileFields ? (
        <BasicProfileSection
          name={state.name}
          studentId={state.studentId}
          enrollmentYear={state.enrollmentYear}
          department={state.department}
          durationYears={state.durationYears}
          departmentOptions={departmentOptions}
          onNameChange={(value) => setField("name", value)}
          onStudentIdChange={(value) => setField("studentId", value)}
          onEnrollmentYearChange={(value) => setField("enrollmentYear", value)}
          onDepartmentChange={(dept) => {
            setField("department", dept);
            if (dept) {
              setField("durationYears", getDurationYears(dept));
            } else {
              setField("durationYears", "");
            }
          }}
        />
      ) : null}

      {shouldShowLinkedGmailField ? (
        <LinkedGmailSection
          loginInfoOpen={loginInfoOpen}
          onToggleLoginInfoOpen={() => setLoginInfoOpen((prev) => !prev)}
          currentLinkedGmail={currentLinkedGmail}
          linkedGmailInput={linkedGmailInput}
          onLinkedGmailInputChange={setLinkedGmailInput}
          onLinkGmail={handleLinkGmail}
          onUnlinkGmail={handleUnlinkGmail}
          isLinkingGmail={isLinkingGmail}
        />
      ) : null}

      {showPublicProfileFields ? (
        <>
          {/* ─── Section 3: 公開プロフィール設定 (Progressive Disclosure) ─── */}
          <section className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-[0_8px_24px_-18px_rgba(0,0,0,0.25)] dark:border-stone-800/80 dark:bg-stone-900/40">
            {/* Header Area with Toggle */}
            <div className="flex flex-col gap-4 border-b border-stone-100 bg-stone-50/50 p-5 dark:border-stone-800/60 dark:bg-stone-900/20 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3 sm:items-center">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-100/80 text-sm dark:bg-violet-900/30">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-violet-600 dark:text-violet-400"
                  >
                    <title>公開設定</title>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    公開プロフィール設定
                  </h3>
                  <p className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">
                    内定先や表示名を後輩に公開できます
                  </p>
                </div>
              </div>

              {/* Master Toggle */}
              <label className="flex cursor-pointer items-center gap-2.5 sm:justify-end">
                <span className="text-[13px] font-semibold text-stone-700 dark:text-stone-300">
                  {state.isPublic ? "公開中" : "非公開"}
                </span>
                <span className="relative inline-flex">
                  <input
                    type="checkbox"
                    checked={state.isPublic}
                    onChange={(event) => {
                      const isPublic = event.target.checked;
                      setState((prev) => ({
                        ...prev,
                        isPublic,
                        acceptContact: isPublic ? prev.acceptContact : false,
                      }));
                    }}
                    className="peer sr-only"
                  />
                  <span className="block h-6 w-10.5 rounded-full bg-stone-200 transition-colors peer-checked:bg-violet-500 peer-focus-visible:ring-2 peer-focus-visible:ring-violet-400 peer-focus-visible:ring-offset-2 dark:bg-stone-700 dark:peer-checked:bg-violet-500" />
                  <span className="absolute left-[3px] top-[3px] h-4.5 w-4.5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-[18px]" />
                </span>
              </label>
            </div>

            {/* Content Area (Progressive Disclosure) */}
            <div className="relative p-5">
              {/* Overlay when disabled */}
              {!state.isPublic && (
                <div className="absolute inset-x-0 bottom-0 top-0 z-10 flex flex-col items-center justify-center rounded-b-2xl bg-white/60 p-6 backdrop-blur-[2px] dark:bg-stone-950/60 transition-all duration-300">
                  <div className="flex max-w-[280px] flex-col items-center gap-3 rounded-2xl border border-stone-200/80 bg-white/90 p-5 text-center shadow-lg backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/90">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-stone-400"
                      >
                        <title>非公開ロック</title>
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                    <p className="text-[12px] font-medium leading-relaxed text-stone-600 dark:text-stone-300">
                      公開設定をオンにすると、お世話になった母校の後輩たちに
                      <strong className="text-stone-900 dark:text-white">内定先</strong>や
                      <strong className="text-stone-900 dark:text-white">メッセージ</strong>
                      を共有できます。
                    </p>
                  </div>
                </div>
              )}

              {/* The Fields (Faded out when disabled) */}
              <div
                className={`space-y-6 transition-all duration-300 ${!state.isPublic ? "opacity-30 blur-[1px] select-none pointer-events-none" : ""}`}
              >
                {/* ─── Avatar Upload ─── */}
                <div className="space-y-3">
                  <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                    プロフィール画像
                  </span>
                  <div className="grid items-start gap-3 sm:grid-cols-[96px_minmax(0,1fr)]">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="プロフィール画像"
                        className="h-24 w-24 rounded-2xl border border-stone-200/80 object-cover dark:border-stone-700/60"
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-dashed border-stone-300 text-[10px] font-medium text-stone-400 dark:border-stone-600 dark:text-stone-500">
                        No Image
                      </div>
                    )}

                    <div className="min-w-0 flex-1 space-y-2">
                      <input
                        ref={avatarFileInputRef}
                        id="profile-avatar-file"
                        type="file"
                        accept="image/*"
                        onChange={(event) => setSelectedAvatarFile(event.target.files?.[0] ?? null)}
                        disabled={isUploadingAvatar || !state.isPublic}
                        className="sr-only"
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <label
                          htmlFor="profile-avatar-file"
                          className="inline-flex h-9 w-full cursor-pointer items-center justify-center rounded-lg border border-stone-300 px-3 text-xs font-semibold text-stone-700 transition-colors hover:bg-stone-50 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
                        >
                          写真を選択
                        </label>

                        <button
                          type="button"
                          onClick={handleAvatarUpload}
                          disabled={isUploadingAvatar || !selectedAvatarFile || !state.isPublic}
                          className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-stone-900 px-3 text-xs font-bold text-white transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
                        >
                          {isUploadingAvatar ? "アップロード中…" : "アップロード"}
                        </button>
                      </div>

                      {selectedAvatarFile ? (
                        <p className="truncate rounded-lg border border-stone-200/80 bg-stone-50 px-2 py-1 text-[11px] text-stone-500 dark:border-stone-700/60 dark:bg-stone-800/60 dark:text-stone-400">
                          {selectedAvatarFile.name}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>

                <hr className="border-stone-100 dark:border-stone-800/60" />

                {/* Nickname & Contact */}
                <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
                  <label htmlFor="profile-nickname" className="space-y-1.5">
                    <span className="flex items-center justify-between text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                      <span>
                        表示名 <span className="text-rose-500">*</span>
                      </span>
                    </span>
                    <Input
                      id="profile-nickname"
                      value={state.nickname}
                      onChange={(event) => setField("nickname", event.target.value)}
                      placeholder="例: たろう"
                      disabled={!canEditAlumniProfile}
                      className={
                        !state.nickname.trim() && state.isPublic
                          ? "border-rose-300 focus-visible:ring-rose-400"
                          : ""
                      }
                    />
                  </label>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                      <span>SNSリンク</span>

                      {/* Contact Toggle Inline */}
                      <label className="flex cursor-pointer items-center gap-1.5">
                        <span className="text-[10px]">受け付ける</span>
                        <span className="relative inline-flex">
                          <input
                            type="checkbox"
                            checked={state.acceptContact}
                            onChange={(event) => setField("acceptContact", event.target.checked)}
                            disabled={!canEditAlumniProfile}
                            className="peer sr-only"
                          />
                          <span className="block h-3.5 w-6 rounded-full bg-stone-300 transition-colors peer-checked:bg-emerald-500 dark:bg-stone-600" />
                          <span className="absolute left-[2px] top-[2px] h-2.5 w-2.5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-[10px]" />
                        </span>
                      </label>
                    </div>
                    <Input
                      id="profile-x-dm-url"
                      value={state.xUrl}
                      onChange={(event) => setField("xUrl", event.target.value)}
                      placeholder="Xのリンク"
                      type="url"
                      aria-label="Xのリンク"
                      disabled={!canEditAlumniProfile || !state.acceptContact}
                      className={!state.acceptContact ? "opacity-50" : ""}
                    />
                    <Input
                      id="profile-instagram-dm-url"
                      value={state.instagramUrl}
                      onChange={(event) => setField("instagramUrl", event.target.value)}
                      placeholder="Instagramのリンク"
                      type="url"
                      aria-label="Instagramのリンク"
                      disabled={!canEditAlumniProfile || !state.acceptContact}
                      className={!state.acceptContact ? "opacity-50" : ""}
                    />
                    <p className="text-[10px] leading-relaxed text-stone-400 dark:text-stone-500">
                      一覧・詳細の連絡ボタンから、設定したSNSリンクへ遷移します。
                    </p>
                  </div>
                </div>

                <hr className="border-stone-100 dark:border-stone-800/60" />

                {/* Companies */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                      内定先・勤務先 <span className="text-rose-500">*</span>
                    </span>
                    <span className="text-[10px] text-stone-400 dark:text-stone-500">
                      複数登録可
                    </span>
                  </div>

                  {state.companyNames.length === 0 ? (
                    <div
                      className={`rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${state.isPublic ? "border-amber-200 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-950/10" : "border-stone-200 dark:border-stone-700"}`}
                    >
                      <p
                        className={`text-[13px] font-medium ${state.isPublic ? "text-amber-700 dark:text-amber-500" : "text-stone-400 dark:text-stone-500"}`}
                      >
                        ここに追加された企業名がカードに表示されます
                      </p>
                    </div>
                  ) : null}

                  <div className="space-y-3">
                    {state.companyNames.map((companyName, index) => {
                      const experience =
                        state.selectionExperiences[index] ?? createBlankSelectionExperience();

                      return (
                        <div
                          key={companyRowIds[index]}
                          className="rounded-2xl border border-stone-200/80 p-3 dark:border-stone-800/80"
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100/80 text-[11px] font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                              {index + 1}
                            </div>
                            <Input
                              value={companyName}
                              onChange={(event) => setCompanyNameAt(index, event.target.value)}
                              placeholder="例: 株式会社○○"
                              disabled={!canEditAlumniProfile}
                              className={
                                !companyName.trim() && state.isPublic
                                  ? "border-rose-300 focus-visible:ring-rose-400"
                                  : ""
                              }
                            />
                            <button
                              type="button"
                              onClick={() => removeCompanyNameField(index)}
                              disabled={!canEditAlumniProfile}
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-stone-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-rose-900/20 dark:hover:text-rose-400"
                              title="削除"
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
                              >
                                <title>削除</title>
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                              </svg>
                            </button>
                          </div>

                          <label className="mt-3 flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-stone-50 px-3 py-2 dark:bg-stone-900/60">
                            <span>
                              <span className="block text-[12px] font-bold text-stone-800 dark:text-stone-100">
                                この企業の選考体験を書く
                              </span>
                              <span className="block text-[10px] text-stone-500 dark:text-stone-400">
                                任意。全ての内定先に書く必要はありません
                              </span>
                            </span>
                            <span className="relative inline-flex">
                              <input
                                type="checkbox"
                                checked={experience.enabled}
                                onChange={(event) =>
                                  updateSelectionExperienceAt(index, (prev) => ({
                                    ...prev,
                                    enabled: event.target.checked,
                                  }))
                                }
                                disabled={!canEditAlumniProfile}
                                className="peer sr-only"
                              />
                              <span className="block h-6 w-10.5 rounded-full bg-stone-200 transition-colors peer-checked:bg-emerald-500 dark:bg-stone-700" />
                              <span className="absolute left-[3px] top-[3px] h-4.5 w-4.5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-[18px]" />
                            </span>
                          </label>

                          {experience.enabled ? (
                            <div className="mt-3 space-y-3 rounded-xl border border-emerald-100 bg-emerald-50/40 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/10">
                              <div className="block space-y-1.5">
                                <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                                  エントリーのきっかけ
                                </span>
                                <Input
                                  value={experience.entryTrigger}
                                  onChange={(event) =>
                                    updateSelectionExperienceAt(index, (prev) => ({
                                      ...prev,
                                      entryTrigger: event.target.value,
                                    }))
                                  }
                                  placeholder="例: 学校求人、逆求人、インターン経由"
                                  disabled={!canEditAlumniProfile}
                                />
                              </div>

                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                                    選考フロー
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => addSelectionStep(index)}
                                    disabled={!canEditAlumniProfile}
                                    className="inline-flex h-8 items-center rounded-lg border border-emerald-200 bg-white px-3 text-[11px] font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-40 dark:border-emerald-800 dark:bg-stone-900 dark:text-emerald-300"
                                  >
                                    ステップ追加
                                  </button>
                                </div>

                                {experience.steps.map((step, stepIndex) => {
                                  const deleteKey = getStepDeleteKey(index, stepIndex);
                                  const isDeletePending = pendingStepDeleteKey === deleteKey;

                                  return (
                                    <div
                                      key={`${companyRowIds[index]}-${stepIndex}`}
                                      className="space-y-3 rounded-xl border border-stone-200 bg-white p-3 dark:border-stone-800 dark:bg-stone-950/60"
                                    >
                                      <div className="grid gap-2 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                          <span className="text-[10px] font-semibold text-stone-500 dark:text-stone-400">
                                            選考種別
                                          </span>
                                          <Select
                                            value={step.stepKind}
                                            onValueChange={(value) =>
                                              updateSelectionStepAt(index, stepIndex, (prev) => ({
                                                ...prev,
                                                stepKind: value as SelectionStepKind,
                                              }))
                                            }
                                            disabled={!canEditAlumniProfile}
                                          >
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {selectionStepOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                  {option.label}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div className="space-y-1.5">
                                          <span className="text-[10px] font-semibold text-stone-500 dark:text-stone-400">
                                            実施形式
                                          </span>
                                          <Select
                                            value={step.format}
                                            onValueChange={(value) =>
                                              updateSelectionStepAt(index, stepIndex, (prev) => ({
                                                ...prev,
                                                format: value as SelectionFormat,
                                              }))
                                            }
                                            disabled={!canEditAlumniProfile}
                                          >
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {selectionFormatOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                  {option.label}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>

                                      <div className="grid gap-2 sm:grid-cols-2">
                                        <Select
                                          value={step.interviewerCount}
                                          onValueChange={(value) =>
                                            updateSelectionStepAt(index, stepIndex, (prev) => ({
                                              ...prev,
                                              interviewerCount: value,
                                            }))
                                          }
                                          disabled={!canEditAlumniProfile}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder="面接官人数" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {interviewerCountOptions.map((option) => (
                                              <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                        <Input
                                          value={step.durationMinutes}
                                          onChange={(event) =>
                                            updateSelectionStepAt(index, stepIndex, (prev) => ({
                                              ...prev,
                                              durationMinutes: event.target.value,
                                            }))
                                          }
                                          type="number"
                                          min={0}
                                          placeholder="所要時間(分)"
                                          disabled={!canEditAlumniProfile}
                                        />
                                      </div>

                                      <Textarea
                                        value={step.questions}
                                        onChange={(event) =>
                                          updateSelectionStepAt(index, stepIndex, (prev) => ({
                                            ...prev,
                                            questions: event.target.value,
                                          }))
                                        }
                                        placeholder="聞かれた質問"
                                        disabled={!canEditAlumniProfile}
                                      />
                                      <Textarea
                                        value={step.atmosphere}
                                        onChange={(event) =>
                                          updateSelectionStepAt(index, stepIndex, (prev) => ({
                                            ...prev,
                                            atmosphere: event.target.value,
                                          }))
                                        }
                                        placeholder="面接の雰囲気"
                                        disabled={!canEditAlumniProfile}
                                      />
                                      <Textarea
                                        value={step.preparation}
                                        onChange={(event) =>
                                          updateSelectionStepAt(index, stepIndex, (prev) => ({
                                            ...prev,
                                            preparation: event.target.value,
                                          }))
                                        }
                                        placeholder="準備してよかったこと"
                                        disabled={!canEditAlumniProfile}
                                      />
                                      <div className="flex items-center justify-end gap-2">
                                        {isDeletePending ? (
                                          <button
                                            type="button"
                                            onClick={() => setPendingStepDeleteKey(null)}
                                            className="text-[11px] font-semibold text-stone-400 transition hover:text-stone-600"
                                          >
                                            やめる
                                          </button>
                                        ) : null}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (isDeletePending) {
                                              removeSelectionStep(index, stepIndex);
                                              return;
                                            }
                                            setPendingStepDeleteKey(deleteKey);
                                          }}
                                          disabled={!canEditAlumniProfile}
                                          className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition disabled:opacity-40 ${
                                            isDeletePending
                                              ? "bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-300"
                                              : "text-stone-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20"
                                          }`}
                                        >
                                          {isDeletePending
                                            ? "もう一度押して削除"
                                            : "このステップを削除"}
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              <Textarea
                                value={experience.overallTip}
                                onChange={(event) =>
                                  updateSelectionExperienceAt(index, (prev) => ({
                                    ...prev,
                                    overallTip: event.target.value,
                                  }))
                                }
                                placeholder="この企業を受ける後輩に伝えたい全体Tips"
                                disabled={!canEditAlumniProfile}
                              />
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={addCompanyNameField}
                    disabled={!canEditAlumniProfile}
                    className="mt-2 inline-flex h-9 items-center gap-1.5 rounded-xl border border-dashed border-stone-300 px-4 text-xs font-semibold text-stone-600 transition-all hover:border-stone-400 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-stone-600 dark:text-stone-400 dark:hover:border-stone-500 dark:hover:bg-stone-800"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <title>追加</title>
                      <path d="M12 5v14" />
                      <path d="M5 12h14" />
                    </svg>
                    内定先・勤務先を追加
                  </button>
                </div>

                <hr className="border-stone-100 dark:border-stone-800/60" />

                {/* Remarks / Message */}
                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                      後輩へひとこと
                    </span>
                    <p
                      className={`text-[10px] ${state.remarks.length >= 50 ? "text-rose-500" : "text-stone-400 dark:text-stone-500"}`}
                    >
                      {state.remarks.length}/50
                    </p>
                  </div>
                  <Textarea
                    value={state.remarks}
                    onChange={(event) => setField("remarks", event.target.value)}
                    maxLength={50}
                    className="min-h-24"
                    placeholder="就活のアドバイスでも学生生活やるべきことでも！"
                    disabled={!canEditAlumniProfile}
                  />
                </div>

                <hr className="border-stone-100 dark:border-stone-800/60" />

                {/* ── 後輩へのアドバイス (Deep Dive) ── */}
                <div className="space-y-5">
                  <button
                    type="button"
                    onClick={() => setDeepDiveOpen((prev) => !prev)}
                    className="flex w-full items-center gap-2 text-left"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-sm dark:bg-amber-900/40">
                      💡
                    </span>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                        後輩へのアドバイス
                      </h4>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400">
                        任意 · 書くほど後輩の参考になります
                      </p>
                    </div>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`shrink-0 text-stone-400 transition-transform duration-200 ${deepDiveOpen ? "rotate-180" : ""}`}
                    >
                      <title>{deepDiveOpen ? "閉じる" : "開く"}</title>
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>

                  {/* Collapsible content */}
                  <div
                    className={`space-y-5 overflow-hidden transition-all duration-300 ease-in-out ${
                      deepDiveOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    {/* Skills */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                          評価された技術・資格・経験など（最大3つ）
                        </span>
                        <span className="text-[10px] text-stone-400 dark:text-stone-500">
                          {state.skills.length}/3
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {state.skills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-1 rounded-lg bg-violet-100/80 px-2 py-1 text-[12px] font-semibold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => {
                                setState((prev) => ({
                                  ...prev,
                                  skills: prev.skills.filter((s) => s !== skill),
                                }));
                              }}
                              disabled={!canEditAlumniProfile}
                              className="ml-0.5 text-violet-400 hover:text-violet-700 dark:text-violet-500 dark:hover:text-violet-200"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      {state.skills.length < 3 ? (
                        <div className="flex gap-2">
                          <Input
                            id="profile-skill-input"
                            placeholder="例: React (15文字以内)"
                            maxLength={15}
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            disabled={!canEditAlumniProfile}
                            onKeyDown={(event) => {
                              if (event.nativeEvent.isComposing) return;
                              if (event.key === "Enter") {
                                event.preventDefault();
                                const value = skillInput.trim().slice(0, 15);
                                if (
                                  value &&
                                  state.skills.length < 3 &&
                                  !state.skills.includes(value)
                                ) {
                                  setState((prev) => ({
                                    ...prev,
                                    skills: [...prev.skills, value],
                                  }));
                                  setSkillInput("");
                                }
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const value = skillInput.trim().slice(0, 15);
                              if (
                                value &&
                                state.skills.length < 3 &&
                                !state.skills.includes(value)
                              ) {
                                setState((prev) => ({
                                  ...prev,
                                  skills: [...prev.skills, value],
                                }));
                                setSkillInput("");
                              }
                            }}
                            disabled={!canEditAlumniProfile}
                            className="shrink-0 rounded-lg border border-stone-300 px-3 text-xs font-semibold text-stone-600 transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800"
                          >
                            追加
                          </button>
                        </div>
                      ) : null}
                    </div>

                    {/* Portfolio URL */}
                    <label htmlFor="profile-portfolio-url" className="block space-y-1.5">
                      <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                        ポートフォリオURL
                      </span>
                      <Input
                        id="profile-portfolio-url"
                        value={state.portfolioUrl}
                        onChange={(event) => setField("portfolioUrl", event.target.value)}
                        placeholder="https://your-portfolio.com"
                        type="url"
                        disabled={!canEditAlumniProfile}
                      />
                    </label>

                    {/* Gakuchika */}
                    <div className="space-y-1.5">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                          学生時代に力を入れたこと
                        </span>
                        <p
                          className={`text-[10px] ${state.gakuchika.length >= 200 ? "text-rose-500" : "text-stone-400 dark:text-stone-500"}`}
                        >
                          {state.gakuchika.length}/200
                        </p>
                      </div>
                      <Textarea
                        value={state.gakuchika}
                        onChange={(event) => setField("gakuchika", event.target.value)}
                        maxLength={200}
                        placeholder="例: We部のプロジェクトでReactを使ったサイト制作をリーダーとして行いました"
                        disabled={!canEditAlumniProfile}
                      />
                    </div>

                    {/* Useful Coursework */}
                    <div className="space-y-1.5">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                          役立った授業・先生
                        </span>
                        <p
                          className={`text-[10px] ${state.usefulCoursework.length >= 200 ? "text-rose-500" : "text-stone-400 dark:text-stone-500"}`}
                        >
                          {state.usefulCoursework.length}/200
                        </p>
                      </div>
                      <Textarea
                        value={state.usefulCoursework}
                        onChange={(event) => setField("usefulCoursework", event.target.value)}
                        maxLength={200}
                        placeholder="例: ○○先生のWebフレームワーク演習がポートフォリオ制作にそのまま活かせました"
                        disabled={!canEditAlumniProfile}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : null}

      <div className="sticky bottom-0 -mx-1 bg-gradient-to-t from-white via-white to-white/0 px-1 pb-2 pt-4 dark:from-stone-950 dark:via-stone-950 dark:to-stone-950/0">
        <button
          type="submit"
          disabled={isSaving}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-stone-900 text-sm font-bold tracking-wide text-white shadow-lg shadow-stone-900/20 transition-all hover:bg-stone-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900 dark:shadow-stone-100/10 dark:hover:bg-stone-200"
        >
          {isSaving ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-stone-900/30 dark:border-t-stone-900" />
              保存中…
            </>
          ) : (
            "プロフィールを保存する"
          )}
        </button>
      </div>
    </form>
  );
}
