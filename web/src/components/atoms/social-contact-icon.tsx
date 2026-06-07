import { InstagramIcon, XSocialIcon } from "@/components/atoms/icons";
import type { AlumniContactLink } from "@/lib/alumni-contact";

type SocialContactIconProps = {
  platform: AlumniContactLink["label"];
  className?: string;
  size?: number;
};

export function SocialContactIcon({ platform, className, size = 16 }: SocialContactIconProps) {
  if (platform === "Instagram") {
    return <InstagramIcon aria-hidden className={className} size={size} strokeWidth={2.4} />;
  }

  return <XSocialIcon aria-hidden className={className} size={size} />;
}
