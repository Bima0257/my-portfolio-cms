"use client";

import { Icon as IconifyIcon } from "@iconify/react";

const shortMap: Record<string, string> = {
  palette: "mdi:palette",
  person_search: "mdi:account-search",
  smartphone: "mdi:cellphone",
  desktop_windows: "mdi:monitor",
  brand_awareness: "mdi:bullhorn",
  play_circle: "mdi:play-circle",
  school: "mdi:school",
  work: "mdi:briefcase",
  mail: "mdi:email",
  folder: "mdi:folder",
  bookmark: "mdi:bookmark",
  category: "mdi:shape",
  link: "mdi:link",
  dashboard: "mdi:view-dashboard",
  settings: "mdi:cog",
  star: "mdi:star",
  person: "mdi:account",
  check_circle: "mdi:check-circle",
  send: "mdi:send",
  arrow_forward: "mdi:arrow-right",
  close: "mdi:close",
  add: "mdi:plus",
  edit: "mdi:pencil",
  delete: "mdi:delete",
  drag_indicator: "mdi:drag",
  image: "mdi:image",
  upload: "mdi:upload",
  info: "mdi:information",
  error: "mdi:alert-circle",
  monitoring: "mdi:chart-bar",
  storefront: "mdi:store",
  shopping_bag: "mdi:shopping",
  account_balance_wallet: "mdi:wallet",
  fitness_center: "mdi:dumbbell",
  schedule: "mdi:calendar-clock",
  location_on: "mdi:map-marker",
  open_in_new: "mdi:open-in-new",
  logout: "mdi:logout",
  database: "mdi:database",
  mark_email_unread: "mdi:email-mark-as-unread",
  more_vert: "mdi:dots-vertical",
  description: "mdi:file-document",
  picture_as_pdf: "mdi:file-pdf",
  react: "simple-icons:react",
  nextjs: "simple-icons:nextdotjs",
  vue: "simple-icons:vuedotjs",
  angular: "simple-icons:angular",
  tailwind: "simple-icons:tailwindcss",
  typescript: "simple-icons:typescript",
  javascript: "simple-icons:javascript",
  html: "simple-icons:html5",
  nodejs: "simple-icons:nodedotjs",
  laravel: "simple-icons:laravel",
  codeigniter: "simple-icons:codeigniter",
  python: "simple-icons:python",
  supabase: "simple-icons:supabase",
  figma: "simple-icons:figma",
  github: "simple-icons:github",
  linkedin: "simple-icons:linkedin",
  twitter: "simple-icons:x",
  x: "simple-icons:x",
};

export default function Icon({ name, size = 24, className = "" }: { name?: string | null; size?: number; className?: string }) {
  if (!name) return null;

  const trimmed = name.trim();

  if (trimmed.includes(":")) {
    return <IconifyIcon icon={trimmed} width={size} height={size} className={className} />;
  }

  const resolved = shortMap[trimmed.toLowerCase()] ?? `mdi:${trimmed.toLowerCase()}`;

  return <IconifyIcon icon={resolved} width={size} height={size} className={className} />;
}
