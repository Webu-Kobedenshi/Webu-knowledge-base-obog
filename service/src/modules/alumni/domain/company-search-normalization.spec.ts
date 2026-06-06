import { normalizeCompanyNameForSearch } from "./company-search-normalization";

describe("normalizeCompanyNameForSearch", () => {
  it("normalizes kana, width, case, and separators", () => {
    expect(normalizeCompanyNameForSearch(" 株式会社 がんばりおん ")).toBe("株式会社ガンバリオン");
    expect(normalizeCompanyNameForSearch("株式会社ガンバリオン")).toBe("株式会社ガンバリオン");
    expect(normalizeCompanyNameForSearch("ｶﾞﾝﾊﾞﾘｵﾝ")).toBe("ガンバリオン");
    expect(normalizeCompanyNameForSearch("ＤＭＭ.com")).toBe("dmmcom");
  });
});
