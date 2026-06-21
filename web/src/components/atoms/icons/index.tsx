import * as React from "react";

type IconProps = Omit<React.SVGProps<SVGSVGElement>, "color" | "children"> & {
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
  absoluteStrokeWidth?: boolean;
  title?: string;
};

type IconNode = Array<
  | ["circle", React.SVGProps<SVGCircleElement>]
  | ["line", React.SVGProps<SVGLineElement>]
  | ["path", React.SVGProps<SVGPathElement>]
  | ["rect", React.SVGProps<SVGRectElement>]
>;

function renderNode(node: IconNode[number]) {
  if (node[0] === "circle") {
    const { key: nodeKey, ...nodeAttrs } = node[1];
    return <circle key={nodeKey} {...nodeAttrs} />;
  }

  if (node[0] === "line") {
    const { key: nodeKey, ...nodeAttrs } = node[1];
    return <line key={nodeKey} {...nodeAttrs} />;
  }

  if (node[0] === "rect") {
    const { key: nodeKey, ...nodeAttrs } = node[1];
    return <rect key={nodeKey} {...nodeAttrs} />;
  }

  const { key: nodeKey, ...nodeAttrs } = node[1];
  return <path key={nodeKey} {...nodeAttrs} />;
}

function createShadcnIcon(displayName: string, iconNode: IconNode) {
  const Component = React.forwardRef<SVGSVGElement, IconProps>(
    (
      { size = 24, color = "currentColor", strokeWidth = 2, absoluteStrokeWidth, title, ...props },
      ref,
    ) => (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={absoluteStrokeWidth ? (Number(strokeWidth) * 24) / Number(size) : strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden={title ? undefined : true}
        {...props}
      >
        <title>{title ?? displayName}</title>
        {iconNode.map(renderNode)}
      </svg>
    ),
  );

  Component.displayName = displayName;
  return Component;
}

export const ArrowRightIcon = createShadcnIcon("ArrowRightIcon", [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "m12 5 7 7-7 7", key: "xquz4c" }],
]);

export const BanIcon = createShadcnIcon("BanIcon", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M4.929 4.929 19.07 19.071", key: "196cmz" }],
]);

export const CheckIcon = createShadcnIcon("CheckIcon", [
  ["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }],
]);

export const CrownIcon = createShadcnIcon("CrownIcon", [
  ["path", { d: "m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z", key: "1uwrx8" }],
  ["path", { d: "M5 20h14", key: "1r9h4u" }],
]);

export const ChevronDownIcon = createShadcnIcon("ChevronDownIcon", [
  ["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }],
]);

export const ChevronLeftIcon = createShadcnIcon("ChevronLeftIcon", [
  ["path", { d: "m15 18-6-6 6-6", key: "1wnfg3" }],
]);

export const ChevronRightIcon = createShadcnIcon("ChevronRightIcon", [
  ["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }],
]);

export const ChevronUpIcon = createShadcnIcon("ChevronUpIcon", [
  ["path", { d: "m18 15-6-6-6 6", key: "153udz" }],
]);

export const ExternalLinkIcon = createShadcnIcon("ExternalLinkIcon", [
  ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
  ["path", { d: "M10 14 21 3", key: "gplh6r" }],
  [
    "path",
    {
      d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",
      key: "a6xqqp",
    },
  ],
]);

export const GraduationCapIcon = createShadcnIcon("GraduationCapIcon", [
  [
    "path",
    {
      d: "M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z",
      key: "j76jl0",
    },
  ],
  ["path", { d: "M22 10v6", key: "1lu8f3" }],
  ["path", { d: "M6 12.5V16a6 3 0 0 0 12 0v-3.5", key: "1r8lef" }],
]);

export const HeartIcon = createShadcnIcon("HeartIcon", [
  [
    "path",
    {
      d: "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",
      key: "c3ymky",
    },
  ],
]);

export const ImagePlusIcon = createShadcnIcon("ImagePlusIcon", [
  ["path", { d: "M16 5h6", key: "1vod17" }],
  ["path", { d: "M19 2v6", key: "4bpg5p" }],
  ["path", { d: "M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5", key: "1ue2ih" }],
  ["path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21", key: "1xmnt7" }],
  ["circle", { cx: "9", cy: "9", r: "2", key: "af1f0g" }],
]);

export const InstagramIcon = createShadcnIcon("InstagramIcon", [
  ["rect", { width: "20", height: "20", x: "2", y: "2", rx: "5", ry: "5", key: "2e1cvw" }],
  ["path", { d: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z", key: "9exkf1" }],
  ["line", { x1: "17.5", x2: "17.51", y1: "6.5", y2: "6.5", key: "r4j83e" }],
]);

export const LinkIcon = createShadcnIcon("LinkIcon", [
  [
    "path",
    {
      d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71",
      key: "1cjeqo",
    },
  ],
  [
    "path",
    {
      d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
      key: "19qd67",
    },
  ],
]);

export const LoaderCircleIcon = createShadcnIcon("LoaderCircleIcon", [
  ["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }],
]);

export const LockIcon = createShadcnIcon("LockIcon", [
  ["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2", key: "1w4ew1" }],
  ["path", { d: "M7 11V7a5 5 0 0 1 10 0v4", key: "fwvmzm" }],
]);

export const LogOutIcon = createShadcnIcon("LogOutIcon", [
  ["path", { d: "m16 17 5-5-5-5", key: "1bji2h" }],
  ["path", { d: "M21 12H9", key: "dn1m92" }],
  ["path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", key: "1uf3rs" }],
]);

export const MailIcon = createShadcnIcon("MailIcon", [
  ["path", { d: "m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7", key: "132q7q" }],
  ["rect", { x: "2", y: "4", width: "20", height: "16", rx: "2", key: "izxlao" }],
]);

export const MailCheckIcon = createShadcnIcon("MailCheckIcon", [
  ["path", { d: "M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8", key: "12jkf8" }],
  ["path", { d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7", key: "1ocrg3" }],
  ["path", { d: "m16 19 2 2 4-4", key: "1b14m6" }],
]);

export const MousePointerClickIcon = createShadcnIcon("MousePointerClickIcon", [
  ["path", { d: "M14 4.1 12 6", key: "ita8i4" }],
  ["path", { d: "m5.1 8-2.9-.8", key: "1go3kf" }],
  ["path", { d: "m6 12-1.9 2", key: "mnht97" }],
  ["path", { d: "M7.2 2.2 8 5.1", key: "1cfko1" }],
  [
    "path",
    {
      d: "M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z",
      key: "s0h3yz",
    },
  ],
]);

export const PlusIcon = createShadcnIcon("PlusIcon", [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }],
]);

export const SettingsIcon = createShadcnIcon("SettingsIcon", [
  [
    "path",
    {
      d: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",
      key: "1i5ecw",
    },
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }],
]);

export const ShieldCheckIcon = createShadcnIcon("ShieldCheckIcon", [
  [
    "path",
    {
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      key: "oel41y",
    },
  ],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }],
]);

export const Trash2Icon = createShadcnIcon("Trash2Icon", [
  ["path", { d: "M10 11v6", key: "nco0om" }],
  ["path", { d: "M14 11v6", key: "outv1u" }],
  ["path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6", key: "miytrc" }],
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2", key: "e791ji" }],
]);

export const UploadIcon = createShadcnIcon("UploadIcon", [
  ["path", { d: "M12 3v12", key: "1x0j5s" }],
  ["path", { d: "m17 8-5-5-5 5", key: "7q97r8" }],
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }],
]);

export const UserIcon = createShadcnIcon("UserIcon", [
  ["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", key: "975kel" }],
  ["circle", { cx: "12", cy: "7", r: "4", key: "17ys0d" }],
]);

export function XSocialIcon({
  size = 24,
  title,
  ...props
}: Omit<React.SVGProps<SVGSVGElement>, "children"> & { size?: number | string; title?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden={title ? undefined : true}
      {...props}
    >
      <title>{title ?? "X"}</title>
      <path d="M13.86 10.47 21.15 2h-1.73l-6.33 7.35L8.03 2H2.2l7.64 11.1L2.2 22h1.73l6.68-7.77L15.95 22h5.83l-7.92-11.53Zm-2.36 2.75-.77-1.1L4.57 3.3H7.2l4.98 7.12.77 1.1 6.47 9.25h-2.63l-5.29-7.55Z" />
    </svg>
  );
}
