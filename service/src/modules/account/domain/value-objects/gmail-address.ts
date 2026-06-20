import { DomainValidationError } from "../../../../common/domain/domain-validation.error";

export class GmailAddress {
  private constructor(private readonly value: string) {}

  static from(raw: string): GmailAddress {
    const normalized = raw.toLowerCase().trim();

    if (!normalized.endsWith("@gmail.com")) {
      throw new DomainValidationError("引き継ぎアドレスは @gmail.com のみ登録できます。");
    }

    return new GmailAddress(normalized);
  }

  toString(): string {
    return this.value;
  }
}
