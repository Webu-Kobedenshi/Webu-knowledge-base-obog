import type { AlumniContactLink } from "@/lib/alumni-contact";
import { Instagram } from "lucide-react";

type SocialContactIconProps = {
  platform: AlumniContactLink["label"];
  className?: string;
  size?: number;
};

export function SocialContactIcon({ platform, className, size = 16 }: SocialContactIconProps) {
  if (platform === "Instagram") {
    return <Instagram aria-hidden className={className} size={size} strokeWidth={2.4} />;
  }

  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <title>X</title>
      <path d="M13.86 10.47 21.15 2h-1.73l-6.33 7.35L8.03 2H2.2l7.64 11.1L2.2 22h1.73l6.68-7.77L15.95 22h5.83l-7.92-11.53Zm-2.36 2.75-.77-1.1L4.57 3.3H7.2l4.98 7.12.77 1.1 6.47 9.25h-2.63l-5.29-7.55Z" />
    </svg>
  );
}
