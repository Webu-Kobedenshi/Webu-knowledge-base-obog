import type { AlumniProfile } from "@/graphql/types";

export type AlumniContactLink = {
  href: string;
  label: "X" | "Instagram";
};

export function getAlumniContactClassName(platform: AlumniContactLink["label"]) {
  if (platform === "Instagram") {
    return "bg-[linear-gradient(135deg,#833AB4_0%,#E1306C_50%,#F77737_100%)] text-white hover:shadow-[0_12px_28px_-14px_rgba(225,48,108,0.9)]";
  }

  return "bg-black text-white hover:bg-stone-800 hover:shadow-[0_12px_28px_-14px_rgba(0,0,0,0.8)] dark:bg-white dark:text-black dark:hover:bg-stone-100";
}

export function getAlumniContactLinks(alumni: Pick<AlumniProfile, "xUrl" | "instagramUrl">) {
  const links: AlumniContactLink[] = [];

  if (alumni.xUrl) {
    links.push({ href: alumni.xUrl, label: "X" });
  }

  if (alumni.instagramUrl) {
    links.push({ href: alumni.instagramUrl, label: "Instagram" });
  }

  return links;
}
