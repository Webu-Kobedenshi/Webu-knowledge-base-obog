import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { ArrowRightIcon, ChevronDownIcon, LinkIcon, MailIcon } from "@/components/atoms/icons";

type LinkedGmailSectionProps = {
  loginInfoOpen: boolean;
  onToggleLoginInfoOpen: () => void;
  currentLinkedGmail: string | null;
  onLinkGmail: () => void;
  onUnlinkGmail: () => void;
  isLinkingGmail: boolean;
};

export function LinkedGmailSection({
  loginInfoOpen,
  onToggleLoginInfoOpen,
  currentLinkedGmail,
  onLinkGmail,
  onUnlinkGmail,
  isLinkingGmail,
}: LinkedGmailSectionProps) {
  const isLinked = Boolean(currentLinkedGmail);

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
            <LinkIcon
              size={14}
              strokeWidth={2.5}
              className="text-emerald-600 dark:text-emerald-400"
              title="アカウント連携"
            />
          </span>
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
            卒業後のログイン情報
          </h3>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
              isLinked
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
            }`}
          >
            {isLinked ? "設定済み" : "未設定"}
          </span>
        </div>
        <ChevronDownIcon
          size={18}
          className={`shrink-0 text-stone-400 transition-transform duration-200 ${loginInfoOpen ? "rotate-180" : ""}`}
          title={loginInfoOpen ? "閉じる" : "開く"}
        />
      </Button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          loginInfoOpen ? "mt-4 max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="rounded-xl border border-stone-100 bg-stone-50/50 p-4 dark:border-stone-800/60 dark:bg-stone-900/40">
          <div className="mb-4 space-y-1">
            <p className="text-sm font-bold text-stone-900 dark:text-stone-100">
              卒業後に使うログイン先を設定
            </p>
            <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-400">
              学校アカウントの失効後もログインできるよう、個人のGmailを登録します。
            </p>
          </div>

          <div className="space-y-4">
            {currentLinkedGmail ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                      <MailIcon size={12} />
                      登録済み
                    </span>
                    <strong className="block break-all text-sm text-stone-900 dark:text-stone-100">
                      {currentLinkedGmail}
                    </strong>
                    <p className="text-[11px] leading-relaxed text-stone-600 dark:text-stone-400">
                      このGmailで卒業後もログインできます。
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={onUnlinkGmail}
                    disabled={isLinkingGmail}
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 text-[11px] disabled:opacity-50"
                  >
                    登録を解除する
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-stone-300 bg-white/80 p-4 dark:border-stone-700 dark:bg-stone-950/20">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                    <MailIcon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-stone-900 dark:text-stone-100">未登録</p>
                    <p className="mt-1 text-xs leading-relaxed text-stone-600 dark:text-stone-400">
                      Googleで確認した個人Gmailを、そのままログイン先に追加します。
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={onLinkGmail}
                  disabled={isLinkingGmail}
                  variant="secondary"
                  className="mt-4 h-11 w-full justify-center gap-2 rounded-xl bg-neutral-900 px-4 text-xs font-bold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 disabled:opacity-50"
                >
                  {isLinkingGmail ? "Google確認へ移動中…" : "Gmailを登録する"}
                  {!isLinkingGmail ? <ArrowRightIcon size={14} /> : null}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
