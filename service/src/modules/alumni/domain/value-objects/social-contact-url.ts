import { DomainValidationError } from "../../../../common/domain/domain-validation.error";

export type SocialContactPlatform = "x" | "instagram";

const allowedHostsByPlatform: Record<SocialContactPlatform, Set<string>> = {
  x: new Set(["x.com", "www.x.com", "twitter.com", "www.twitter.com"]),
  instagram: new Set(["instagram.com", "www.instagram.com", "ig.me", "www.ig.me"]),
};

const platformLabel: Record<SocialContactPlatform, string> = {
  x: "X",
  instagram: "Instagram",
};

export class SocialContactUrl {
  private constructor(private readonly value: string) {}

  static optional(value: string | undefined, platform: SocialContactPlatform): string | undefined {
    const trimmed = value?.trim();
    if (!trimmed) {
      return undefined;
    }

    let url: URL;
    try {
      url = new URL(trimmed);
    } catch {
      throw new DomainValidationError(`${platformLabel[platform]} contact URL must be a valid URL`);
    }

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      throw new DomainValidationError(
        `${platformLabel[platform]} contact URL must start with http:// or https://`,
      );
    }

    if (!allowedHostsByPlatform[platform].has(url.hostname.toLowerCase())) {
      throw new DomainValidationError(
        `${platformLabel[platform]} contact URL must point to ${platformLabel[platform]}`,
      );
    }

    return new SocialContactUrl(url.toString()).toString();
  }

  toString(): string {
    return this.value;
  }
}
