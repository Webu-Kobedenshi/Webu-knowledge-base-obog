import { DomainValidationError } from "../../../../common/domain/domain-validation.error";
import { GmailAddress } from "./gmail-address";

describe("GmailAddress", () => {
  it("normalizes lowercase and trims", () => {
    const gmail = GmailAddress.from("  USER@GMAIL.COM ");

    expect(gmail.toString()).toBe("user@gmail.com");
  });

  it("throws on non gmail address", () => {
    expect(() => GmailAddress.from("user@example.com")).toThrow(DomainValidationError);
  });
});
