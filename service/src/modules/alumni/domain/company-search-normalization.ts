const SEPARATOR_PATTERN = /[\s\u3000・･.．,，、。_＿/／\\＼()[\]（）［］【】「」『』]/g;

function hiraganaToKatakana(value: string): string {
  return value.replace(/[\u3041-\u3096]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) + 0x60),
  );
}

export function normalizeCompanyNameForSearch(value: string): string {
  return hiraganaToKatakana(value.normalize("NFKC"))
    .toLocaleLowerCase("ja-JP")
    .replace(SEPARATOR_PATTERN, "")
    .trim();
}
