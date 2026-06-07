import { Card } from "@/components/atoms/card";
import { UserIcon } from "@/components/atoms/icons";
import { Input } from "@/components/atoms/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import type { Department } from "@/graphql/types";

type DepartmentOption = {
  value: Department;
  label: string;
};

type BasicProfileSectionProps = {
  name: string;
  studentId: string;
  enrollmentYear: string;
  department: Department | "";
  durationYears: "" | "1" | "2" | "3" | "4";
  departmentOptions: DepartmentOption[];
  onNameChange: (value: string) => void;
  onStudentIdChange: (value: string) => void;
  onEnrollmentYearChange: (value: string) => void;
  onDepartmentChange: (value: Department | "") => void;
  requiredMode?: "all" | "nameOnly";
};

export function BasicProfileSection({
  name,
  studentId,
  enrollmentYear,
  department,
  durationYears,
  departmentOptions,
  onNameChange,
  onStudentIdChange,
  onEnrollmentYearChange,
  onDepartmentChange,
  requiredMode = "all",
}: BasicProfileSectionProps) {
  const showSchoolFields = requiredMode === "all";

  return (
    <Card className="gap-0 border-stone-200/90 bg-white shadow-[0_8px_24px_-18px_rgba(0,0,0,0.25)] dark:border-stone-800/80 dark:bg-stone-900/40">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-sm dark:bg-violet-900/40">
          <UserIcon
            size={14}
            strokeWidth={2.5}
            className="text-violet-600 dark:text-violet-400"
            title="基本情報"
          />
        </span>
        <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">基本情報</h3>
        <span className="ml-auto rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
          必須
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label htmlFor="profile-name" className="space-y-1.5 sm:col-span-2">
          <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">名前</span>
          <Input
            id="profile-name"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="例: 山田 太郎"
            required
          />
        </label>

        {showSchoolFields ? (
          <>
            <label htmlFor="profile-student-id" className="space-y-1.5">
              <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                学籍番号
              </span>
              <Input
                id="profile-student-id"
                value={studentId}
                onChange={(event) => onStudentIdChange(event.target.value)}
                placeholder="例: 24A1234"
                required
              />
            </label>

            <label htmlFor="profile-enrollment-year" className="space-y-1.5">
              <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                入学年度
              </span>
              <Input
                id="profile-enrollment-year"
                value={enrollmentYear}
                onChange={(event) => onEnrollmentYearChange(event.target.value)}
                placeholder="例: 2024"
                inputMode="numeric"
                required
              />
            </label>

            <label htmlFor="profile-department" className="space-y-1.5">
              <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                学科
              </span>
              <Select
                value={department || "UNSELECTED"}
                onValueChange={(val) =>
                  onDepartmentChange(val === "UNSELECTED" ? "" : (val as Department))
                }
                required
              >
                <SelectTrigger id="profile-department">
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNSELECTED">選択してください</SelectItem>
                  {departmentOptions.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>

            <label htmlFor="profile-duration-years" className="space-y-1.5">
              <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                年制（学科から自動設定）
              </span>
              <Select value={durationYears || "UNSELECTED"} disabled>
                <SelectTrigger id="profile-duration-years">
                  <SelectValue placeholder="学科を選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNSELECTED">学科を選択してください</SelectItem>
                  <SelectItem value="1">1年制</SelectItem>
                  <SelectItem value="2">2年制</SelectItem>
                  <SelectItem value="3">3年制</SelectItem>
                  <SelectItem value="4">4年制</SelectItem>
                </SelectContent>
              </Select>
            </label>
          </>
        ) : null}
      </div>
    </Card>
  );
}
