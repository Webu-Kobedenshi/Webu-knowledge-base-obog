import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { Input } from "@/components/atoms/input";

type LinkedGmailSectionProps = {
  loginInfoOpen: boolean;
  onToggleLoginInfoOpen: () => void;
  currentLinkedGmail: string | null;
  linkedGmailInput: string;
  onLinkedGmailInputChange: (value: string) => void;
  onLinkGmail: () => void;
  onUnlinkGmail: () => void;
  isLinkingGmail: boolean;
};

export function LinkedGmailSection({
  loginInfoOpen,
  onToggleLoginInfoOpen,
  currentLinkedGmail,
  linkedGmailInput,
  onLinkedGmailInputChange,
  onLinkGmail,
  onUnlinkGmail,
  isLinkingGmail,
}: LinkedGmailSectionProps) {
  return (
    <Card className="gap-0 border-stone-200/90 bg-white shadow-[0_8px_24px_-18px_rgba(0,0,0,0.25)] dark:border-stone-800/80 dark:bg-stone-900/40">
      <Button
        type="button"
        onClick={onToggleLoginInfoOpen}
        variant="ghost"
        className="flex h-auto w-full items-center justify-between p-0 hover:bg-transparent dark:hover:bg-transparent"
      >
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-sm dark:bg-emerald-900/40">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-emerald-600 dark:text-emerald-400"
            >
              <title>アカウント連携</title>
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </span>
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
            卒業後のログイン情報
          </h3>
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
          className={`shrink-0 text-stone-400 transition-transform duration-200 ${loginInfoOpen ? "rotate-180" : ""}`}
        >
          <title>{loginInfoOpen ? "閉じる" : "開く"}</title>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </Button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          loginInfoOpen ? "mt-4 max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="rounded-xl border border-stone-100 bg-stone-50/50 p-4 dark:border-stone-800/60 dark:bg-stone-900/40">
          <p className="mb-4 text-xs leading-relaxed text-stone-600 dark:text-stone-400">
            学校のアカウント（
            <code className="rounded bg-rose-50 px-1 py-0.5 text-[11px] font-semibold text-rose-500 dark:bg-rose-950/30">
              @st.kobedenshi.ac.jp
            </code>
            ）は卒業後に失効します。卒業後もこのプロフィールにアクセスして情報を更新できるように、あらかじめ個人のGmailアドレスを登録してください。
          </p>

          <div className="space-y-4">
            {currentLinkedGmail ? (
              <div className="flex flex-col gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900/50 dark:bg-emerald-950/20 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="block text-[10px] font-bold text-emerald-600 dark:text-emerald-500">
                    登録済みの引き継ぎアドレス
                  </span>
                  <strong className="text-sm text-stone-900 dark:text-stone-100">
                    {currentLinkedGmail}
                  </strong>
                </div>
                <Button
                  type="button"
                  onClick={onUnlinkGmail}
                  disabled={isLinkingGmail}
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-[11px] disabled:opacity-50"
                >
                  登録を解除する
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <label
                  htmlFor="linked-gmail"
                  className="block text-[11px] font-semibold text-stone-500 dark:text-stone-400"
                >
                  個人のGmailアドレス
                </label>
                <div className="flex gap-2">
                  <Input
                    id="linked-gmail"
                    value={linkedGmailInput}
                    onChange={(event) => onLinkedGmailInputChange(event.target.value)}
                    placeholder="example@gmail.com"
                    type="email"
                    disabled={isLinkingGmail}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={onLinkGmail}
                    disabled={isLinkingGmail || !linkedGmailInput}
                    variant="secondary"
                    className="h-10 shrink-0 px-4 text-xs font-bold disabled:opacity-50"
                  >
                    {isLinkingGmail ? "登録中…" : "登録する"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
