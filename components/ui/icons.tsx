import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = (p: P) => ({
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...p,
});

export const IconCar = (p: P) => (
  <svg {...base(p)}><path d="M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13" /><path d="M5 13h14v4a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H8v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z" /><circle cx="7.5" cy="15.5" r=".5" /><circle cx="16.5" cy="15.5" r=".5" /></svg>
);
export const IconHome = (p: P) => (
  <svg {...base(p)}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20h14V9.5" /><path d="M10 20v-5h4v5" /></svg>
);
export const IconBriefcase = (p: P) => (
  <svg {...base(p)}><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /><path d="M3 12h18" /></svg>
);
export const IconHeart = (p: P) => (
  <svg {...base(p)}><path d="M12 20s-7-4.3-9.3-8.4C1.2 9 2.4 6 5.4 6c1.9 0 3 1.1 3.6 2 .6-.9 1.7-2 3.6-2 3 0 4.2 3 2.7 5.6C19 15.7 12 20 12 20z" /></svg>
);
export const IconUpload = (p: P) => (
  <svg {...base(p)}><path d="M12 16V4" /><path d="m7 9 5-5 5 5" /><path d="M5 20h14" /></svg>
);
export const IconCalendar = (p: P) => (
  <svg {...base(p)}><rect x="3" y="4.5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v3M16 3v3" /></svg>
);
export const IconFile = (p: P) => (
  <svg {...base(p)}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /></svg>
);
export const IconCheck = (p: P) => (
  <svg {...base(p)}><path d="m5 12 4.5 4.5L19 7" /></svg>
);
export const IconChevronRight = (p: P) => (
  <svg {...base(p)}><path d="m9 6 6 6-6 6" /></svg>
);
export const IconShield = (p: P) => (
  <svg {...base(p)}><path d="M12 3 5 6v5c0 4.4 3 7.6 7 9 4-1.4 7-4.6 7-9V6z" /><path d="m9 12 2 2 4-4" /></svg>
);
export const IconSparkles = (p: P) => (
  <svg {...base(p)}><path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6z" /><path d="M18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8z" /></svg>
);
export const IconUser = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="8" r="4" /><path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" /></svg>
);
export const IconLogout = (p: P) => (
  <svg {...base(p)}><path d="M15 12H4" /><path d="m8 8-4 4 4 4" /><path d="M9 4h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H9" /></svg>
);
export const IconClock = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
export const IconMail = (p: P) => (
  <svg {...base(p)}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
);
export const IconPhone = (p: P) => (
  <svg {...base(p)}><path d="M6 3h3l2 5-2 1.5a12 12 0 0 0 5.5 5.5L18 13l5 2v3a2 2 0 0 1-2 2A17 17 0 0 1 4 5a2 2 0 0 1 2-2z" /></svg>
);
export const IconAlert = (p: P) => (
  <svg {...base(p)}><path d="M12 3 2 20h20z" /><path d="M12 10v4M12 17v.5" /></svg>
);
export const IconEdit = (p: P) => (
  <svg {...base(p)}><path d="M4 20h4l10-10-4-4L4 16z" /><path d="m13.5 6.5 4 4" /></svg>
);
export const IconDownload = (p: P) => (
  <svg {...base(p)}><path d="M12 4v12" /><path d="m7 11 5 5 5-5" /><path d="M5 20h14" /></svg>
);
export const IconPlus = (p: P) => (
  <svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>
);
export const IconArrowLeft = (p: P) => (
  <svg {...base(p)}><path d="M19 12H5" /><path d="m11 6-6 6 6 6" /></svg>
);
export const IconBell = (p: P) => (
  <svg {...base(p)}><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" /><path d="M10 19a2 2 0 0 0 4 0" /></svg>
);
export const IconDoc = (p: P) => (
  <svg {...base(p)}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></svg>
);
export const IconGrid = (p: P) => (
  <svg {...base(p)}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
);

export const LINE_ICONS = { car: IconCar, home: IconHome, briefcase: IconBriefcase, heart: IconHeart } as const;
