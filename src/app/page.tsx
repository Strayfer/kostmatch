"use client";

/**
 * Perilaku model AI (system prompt, model, RAG, guardrail) tetap diatur di route.tsx.
 * page.tsx ini memperbaiki UX AI: prompt terstruktur, saran pertanyaan, retry, dan konteks kriteria.
 */

import {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  useId,
  type CSSProperties,
  type ComponentType,
} from "react";
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Send,
  Star,
  MapPin,
  Zap,
  Banknote,
  MapPinned,
  Phone,
  Bed,
  Maximize,
  Bath,
  CheckCircle2,
  Bot,
  ChevronRight,
  Heart,
  Search,
  Snowflake,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
  Navigation,
  SlidersHorizontal,
  Check,
  Trash2,
  Moon,
  Sun,
  Monitor,
  Accessibility,
  Contrast,
  Type,
  Focus,
  EyeOff,
  Footprints,
  Bike,
  Car,
} from "lucide-react";
import { dorms, type Dorm } from "@/data";

/* ============================== TYPES ============================== */

type Message = { role: "user" | "assistant"; content: string; error?: boolean };
type ToastItem = { id: number; text: string; actionLabel?: string; onAction?: () => void };
type SortKey = "rating" | "priceAsc" | "distance";
type DrawerKind = "concierge" | "saved" | "a11y" | null;
type ThemeMode = "light" | "dark" | "system";
type CollectionType = "best" | "cheapest" | "closest";
type IconType = ComponentType<{ size?: number | string; className?: string }>;

type BrowseFilters = {
  budget: number;
  gender: string;
  distance: number;
  rating: number;
  ac: boolean;
  electricity: string;
};

type A11yPrefs = {
  theme: ThemeMode;
  highContrast: boolean;
  reduceMotion: boolean;
  readableFont: boolean;
  boldFocus: boolean;
  reduceTransparency: boolean;
};

const DEFAULT_A11Y: A11yPrefs = {
  theme: "system",
  highContrast: false,
  reduceMotion: false,
  readableFont: false,
  boldFocus: false,
  reduceTransparency: false,
};

/* ============================== THEME + CSS ============================== */

const CSS = `
@import url('https://cdn.jsdelivr.net/npm/@fontsource-variable/fraunces@5/index.css');
@import url('https://cdn.jsdelivr.net/npm/@fontsource-variable/fraunces@5/wght-italic.css');
@import url('https://cdn.jsdelivr.net/npm/@fontsource-variable/plus-jakarta-sans@5/index.css');
@import url('https://cdn.jsdelivr.net/npm/@fontsource-variable/lexend@5/index.css');

.km-app {
  --km-nav-h: 3.5rem;
  --km-paper: #F4F0E6;
  --km-surface: #FFFFFF;
  --km-surface-alt: #FDFCF8;
  --km-ink: #20241C;
  --km-ink-soft: #5B6052;
  --km-ink-faint: #7C8171;
  --km-line: #E4DECC;
  --km-line-strong: #D3CCB6;
  --km-brand: #123F33;
  --km-brand-deep: #0C2E25;
  --km-brand-mid: #2E6B54;
  --km-brand-soft: #E8EFEA;
  --km-on-brand: #F4F0E6;
  --km-amber: #B45309;
  --km-amber-bright: #E9A13B;
  --km-amber-soft: #FBF3E2;
  --km-amber-border: #EAD9B0;
  --km-blue: #2C5F8A;
  --km-blue-soft: #EAF1F7;
  --km-rose: #A34A6B;
  --km-rose-soft: #F8EEF2;
  --km-violet: #6A5AA8;
  --km-violet-soft: #F0EEF8;
  --km-danger: #B3372B;
  --km-danger-soft: #FAEDEB;
  --km-success: #2E7D4F;
  --km-whatsapp: #25D366;
  --km-whatsapp-hover: #1EBE5D;
  --km-overlay: rgba(32, 36, 28, 0.45);
  --km-nav-bg: rgba(244, 240, 230, 0.88);
  --km-disabled-overlay: rgba(244, 240, 230, 0.62);
  --km-focus: #2E6B54;
  --km-focus-ring: rgba(46, 107, 84, 0.18);
  --km-shadow: 0 1px 3px rgba(32, 36, 28, 0.06);
  --km-shadow-hover: 0 20px 44px -18px rgba(32, 36, 28, 0.30);
  --km-hero-scrim: #10130E;
  --km-mesh:
    radial-gradient(640px 320px at 88% -12%, rgba(233, 161, 59, 0.13), transparent),
    radial-gradient(720px 380px at 8% -22%, rgba(46, 107, 84, 0.16), transparent);
  --km-kawung: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72' viewBox='0 0 72 72'%3E%3Cg fill='none' stroke='%23123F33' stroke-opacity='0.07'%3E%3Ccircle cx='0' cy='0' r='16'/%3E%3Ccircle cx='72' cy='0' r='16'/%3E%3Ccircle cx='0' cy='72' r='16'/%3E%3Ccircle cx='72' cy='72' r='16'/%3E%3Ccircle cx='36' cy='36' r='16'/%3E%3Ccircle cx='36' cy='36' r='5'/%3E%3C/g%3E%3C/svg%3E");
  font-family: "Plus Jakarta Sans Variable", "Plus Jakarta Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  background: var(--km-paper);
  color: var(--km-ink);
}
@media (min-width: 640px) { .km-app { --km-nav-h: 4rem; } }

.km-app.km-dark {
  --km-paper: #0E1411;
  --km-surface: #151C18;
  --km-surface-alt: #182019;
  --km-ink: #E9EFE7;
  --km-ink-soft: #A9B4A7;
  --km-ink-faint: #7E8A7C;
  --km-line: #26312B;
  --km-line-strong: #35443C;
  --km-brand: #2F7D5F;
  --km-brand-deep: #25654C;
  --km-brand-mid: #57B18A;
  --km-brand-soft: #1B2A23;
  --km-on-brand: #F2F7F1;
  --km-amber: #E9A13B;
  --km-amber-bright: #F0B45C;
  --km-amber-soft: #2A2113;
  --km-amber-border: #4A3A1C;
  --km-blue: #7FB2E5;
  --km-blue-soft: #162331;
  --km-rose: #E39AB6;
  --km-rose-soft: #2A1B22;
  --km-violet: #B9A8F0;
  --km-violet-soft: #221D33;
  --km-danger: #E57368;
  --km-danger-soft: #2A1715;
  --km-success: #6FCF97;
  --km-overlay: rgba(0, 0, 0, 0.62);
  --km-nav-bg: rgba(14, 20, 17, 0.88);
  --km-disabled-overlay: rgba(14, 20, 17, 0.66);
  --km-focus: #57B18A;
  --km-focus-ring: rgba(87, 177, 138, 0.22);
  --km-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
  --km-shadow-hover: 0 20px 44px -18px rgba(0, 0, 0, 0.65);
  --km-mesh:
    radial-gradient(640px 320px at 88% -12%, rgba(233, 161, 59, 0.10), transparent),
    radial-gradient(720px 380px at 8% -22%, rgba(87, 177, 138, 0.12), transparent);
  --km-kawung: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72' viewBox='0 0 72 72'%3E%3Cg fill='none' stroke='%23E9EFE7' stroke-opacity='0.05'%3E%3Ccircle cx='0' cy='0' r='16'/%3E%3Ccircle cx='72' cy='0' r='16'/%3E%3Ccircle cx='0' cy='72' r='16'/%3E%3Ccircle cx='72' cy='72' r='16'/%3E%3Ccircle cx='36' cy='36' r='16'/%3E%3Ccircle cx='36' cy='36' r='5'/%3E%3C/g%3E%3C/svg%3E");
}

.km-app.km-hc {
  --km-paper: #FFFFFF; --km-surface: #FFFFFF; --km-surface-alt: #FFFFFF;
  --km-ink: #000000; --km-ink-soft: #000000; --km-ink-faint: #1A1A1A;
  --km-line: #000000; --km-line-strong: #000000;
  --km-brand: #0033CC; --km-brand-deep: #002299; --km-brand-mid: #0033CC; --km-brand-soft: #E6ECFF; --km-on-brand: #FFFFFF;
  --km-amber: #8A5A00; --km-amber-bright: #B87A00; --km-amber-soft: #FFF4D6; --km-amber-border: #8A5A00;
  --km-blue: #0033CC; --km-blue-soft: #E6ECFF;
  --km-rose: #99004D; --km-rose-soft: #FFE6F2;
  --km-violet: #4D0099; --km-violet-soft: #F2E6FF;
  --km-danger: #CC0000; --km-danger-soft: #FFE6E6;
  --km-success: #006600;
  --km-overlay: rgba(0,0,0,0.82); --km-nav-bg: #FFFFFF; --km-disabled-overlay: rgba(255,255,255,0.85);
  --km-focus: #0033CC; --km-focus-ring: rgba(0,51,204,0.25);
  --km-shadow: none; --km-shadow-hover: none; --km-mesh: none; --km-kawung: none;
}
.km-app.km-hc.km-dark {
  --km-paper: #000000; --km-surface: #000000; --km-surface-alt: #000000;
  --km-ink: #FFFFFF; --km-ink-soft: #FFFFFF; --km-ink-faint: #E6E6E6;
  --km-line: #FFFFFF; --km-line-strong: #FFFFFF;
  --km-brand: #66B2FF; --km-brand-deep: #3399FF; --km-brand-mid: #66B2FF; --km-brand-soft: #001F3F; --km-on-brand: #000000;
  --km-amber: #FFD400; --km-amber-bright: #FFD400; --km-amber-soft: #332B00; --km-amber-border: #FFD400;
  --km-blue: #66B2FF; --km-blue-soft: #001F3F;
  --km-rose: #FF99CC; --km-rose-soft: #33001F;
  --km-violet: #CC99FF; --km-violet-soft: #1F0033;
  --km-danger: #FF6666; --km-danger-soft: #330000;
  --km-success: #66FF99;
  --km-overlay: rgba(0,0,0,0.9); --km-nav-bg: #000000; --km-disabled-overlay: rgba(0,0,0,0.85);
  --km-focus: #FFD400; --km-focus-ring: rgba(255,212,0,0.3);
}

.km-app.km-readable { font-family: "Lexend Variable", "Lexend", ui-sans-serif, system-ui, sans-serif; letter-spacing: 0.01em; line-height: 1.6; }
.km-app.km-readable .km-display { font-family: "Lexend Variable", "Lexend", ui-sans-serif, system-ui, sans-serif; font-style: normal; letter-spacing: 0; }
.km-app.km-readable em { font-style: normal; }
.km-app.km-reduce-motion *, .km-app.km-reduce-motion *::before, .km-app.km-reduce-motion *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
.km-app.km-bold-focus :focus-visible { outline: 3px solid var(--km-focus) !important; outline-offset: 3px !important; }
.km-app.km-reduce-transparency { --km-nav-bg: var(--km-paper); --km-overlay: rgba(0,0,0,0.88); }
.km-app.km-reduce-transparency * { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }

html { scrollbar-width: thin; scrollbar-color: var(--km-line-strong) var(--km-paper); }
html::-webkit-scrollbar { width: 10px; height: 10px; }
html::-webkit-scrollbar-track { background: var(--km-paper); }
html::-webkit-scrollbar-thumb { background: var(--km-line-strong); border-radius: 8px; border: 2px solid var(--km-paper); }
html::-webkit-scrollbar-thumb:hover { background: var(--km-brand-mid); }

.km-display { font-family: "Fraunces Variable", "Fraunces", Georgia, "Times New Roman", serif; font-optical-sizing: auto; }
.km-app ::selection { background: var(--km-brand); color: var(--km-on-brand); }
.km-app button { cursor: pointer; }
.km-app button:disabled { cursor: not-allowed; }
.km-app :focus-visible { outline: 2px solid var(--km-focus); outline-offset: 2px; border-radius: 6px; }
.km-nums { font-variant-numeric: tabular-nums; }
.km-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.km-kawung { background-image: var(--km-kawung); }

.km-skip { position: fixed; top: 8px; left: 8px; z-index: 100; transform: translateY(-160%); background: var(--km-brand); color: var(--km-on-brand); padding: 10px 14px; border-radius: 10px; font-weight: 700; font-size: 13px; transition: transform 0.2s ease; }
.km-skip:focus-visible { transform: translateY(0); }

.km-scroll { scrollbar-width: thin; scrollbar-color: var(--km-line-strong) transparent; }
.km-scroll::-webkit-scrollbar { width: 7px; height: 7px; }
.km-scroll::-webkit-scrollbar-track { background: transparent; }
.km-scroll::-webkit-scrollbar-thumb { background: var(--km-line-strong); border-radius: 8px; }
.km-scroll::-webkit-scrollbar-thumb:hover { background: var(--km-brand-mid); }

@keyframes kmFadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
@keyframes kmFadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes kmDrawer { from { transform: translateX(56px); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes kmPop { 0% { transform: scale(0.4); } 60% { transform: scale(1.3); } 100% { transform: scale(1); } }
@keyframes kmDot { 0%, 80%, 100% { transform: translateY(0); opacity: 0.35; } 40% { transform: translateY(-4px); opacity: 1; } }
@keyframes kmPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
.km-anim { animation: kmFadeUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) both; }
.km-fade { animation: kmFadeIn 0.25s ease both; }
.km-drawer { animation: kmDrawer 0.35s cubic-bezier(0.22, 1, 0.36, 1) both; }
.km-pop { animation: kmPop 0.3s ease both; }
.km-dot { animation: kmDot 1.2s infinite ease-in-out; }
.km-live { animation: kmPulse 2s infinite; }

.km-range { -webkit-appearance: none; appearance: none; width: 100%; height: 6px; border-radius: 999px; outline: none; background: var(--km-line); }
.km-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 18px; height: 18px; border-radius: 50%; background: var(--km-surface); border: 3px solid var(--km-thumb, var(--km-brand)); box-shadow: 0 1px 5px rgba(0,0,0,0.25); cursor: pointer; transition: transform 0.15s ease; }
.km-range::-webkit-slider-thumb:hover { transform: scale(1.18); }
.km-range::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%; background: var(--km-surface); border: 3px solid var(--km-thumb, var(--km-brand)); box-shadow: 0 1px 5px rgba(0,0,0,0.25); cursor: pointer; }
.km-range::-moz-range-track { height: 6px; border-radius: 999px; background: transparent; }

.km-select { -webkit-appearance: none; appearance: none; background-color: var(--km-paper); color: var(--km-ink); border: 1px solid var(--km-line); border-radius: 0.75rem; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237C8171' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; outline: none; transition: border-color 0.2s ease, box-shadow 0.2s ease; }
.km-select:focus { border-color: var(--km-brand-mid); box-shadow: 0 0 0 3px var(--km-focus-ring); }
.km-select option { background: var(--km-surface); color: var(--km-ink); }
.km-input { background: var(--km-paper); color: var(--km-ink); border: 1px solid var(--km-line); border-radius: 0.75rem; outline: none; transition: border-color 0.2s ease, box-shadow 0.2s ease; }
.km-input:focus { border-color: var(--km-brand-mid); box-shadow: 0 0 0 3px var(--km-focus-ring); }
.km-input::placeholder { color: var(--km-ink-faint); }
.km-btn-primary { background: var(--km-brand); color: var(--km-on-brand); transition: background 0.2s ease, transform 0.15s ease; }
.km-btn-primary:hover { background: var(--km-brand-deep); }
.km-btn-ghost { background: var(--km-surface); color: var(--km-ink-soft); border: 1px solid var(--km-line); transition: border-color 0.2s ease, color 0.2s ease, transform 0.15s ease; }
.km-btn-ghost:hover { border-color: var(--km-line-strong); color: var(--km-ink); }
.km-chip { background: var(--km-paper); color: var(--km-ink-soft); border: 1px solid var(--km-line); }
.km-card { background: var(--km-surface); border: 1px solid var(--km-line); box-shadow: var(--km-shadow); }
.km-kbd { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 10.5px; padding: 2px 6px; border-radius: 6px; border: 1px solid var(--km-line-strong); border-bottom-width: 2px; background: var(--km-surface); color: var(--km-ink-soft); }
.km-strong { font-weight: 700; color: var(--km-brand-mid); }
.km-bullet { display: flex; gap: 8px; margin: 4px 0; }
.km-bullet-dot { flex: none; width: 5px; height: 5px; border-radius: 99px; background: var(--km-brand-mid); margin-top: 8px; }
.km-num { flex: none; font-weight: 700; color: var(--km-brand-mid); }
.km-md-h { font-weight: 700; color: var(--km-ink); margin: 6px 0 2px; }

@media (prefers-reduced-motion: reduce) {
  .km-anim, .km-fade, .km-drawer, .km-pop, .km-dot, .km-live { animation: none !important; }
  .km-app * { transition-duration: 0.01ms !important; }
}
`;

/* ============================== HELPERS ============================== */

const formatIDR = (n: number) => "Rp " + n.toLocaleString("id-ID");
const formatNum = (n: number, digits?: number) =>
  n.toLocaleString("id-ID", digits === undefined ? undefined : { minimumFractionDigits: digits, maximumFractionDigits: digits });
const shortName = (name: string) => name.split("|")[0].split("-")[0].trim();
const initials = (name: string) => shortName(name).split(/\s+/).slice(0, 2).map((w) => w[0] || "").join("").toUpperCase();

const genderLabel = (g: string) => {
  const lower = g.toLowerCase();
  if (lower.includes("putra") && lower.includes("putri")) return "Campuran";
  if (lower.includes("putri")) return "Putri";
  if (lower.includes("putra")) return "Putra";
  return "Campuran";
};

const genderStyle = (g: string) =>
  g === "Putra"
    ? { bg: "var(--km-blue-soft)", fg: "var(--km-blue)" }
    : g === "Putri"
    ? { bg: "var(--km-rose-soft)", fg: "var(--km-rose)" }
    : { bg: "var(--km-violet-soft)", fg: "var(--km-violet)" };

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const renderMarkdown = (text: string) => {
  const lines = escapeHtml(text).split(/\r?\n/);
  const html = lines.map((line) => {
    const bold = line.replace(/\*\*(.+?)\*\*/g, '<strong class="km-strong">$1</strong>');
    const bullet = bold.match(/^\s*[-•]\s+(.*)$/);
    if (bullet) return `<div class="km-bullet"><span class="km-bullet-dot"></span><span>${bullet[1]}</span></div>`;
    const numbered = bold.match(/^\s*(\d+)[.)]\s+(.*)$/);
    if (numbered) return `<div class="km-bullet"><span class="km-num">${numbered[1]}.</span><span>${numbered[2]}</span></div>`;
    if (/^#{1,3}\s+/.test(bold)) return `<div class="km-md-h">${bold.replace(/^#{1,3}\s+/, "")}</div>`;
    return bold;
  }).join("\n");
  const joined = html.replace(/\n/g, "<br/>").replace(/<br\/><div/g, "<div").replace(/<\/div><br\/>/g, "</div>");
  return { __html: joined };
};

const rangeFill = (value: number, min: number, max: number, color: string) =>
  ({ background: `linear-gradient(to right, ${color} ${((value - min) / (max - min)) * 100}%, var(--km-line) ${((value - min) / (max - min)) * 100}%)`, "--km-thumb": color } as CSSProperties);

const pickByIds = (ids: number[]) => ids.map((id) => dorms.find((d) => d.id === id)).filter((d): d is Dorm => Boolean(d));
const uniqueDorms = (list: Dorm[]) => Array.from(new Map(list.map((d) => [d.id, d])).values());

const getCollectionDorms = (type: CollectionType) => {
  if (type === "best") return uniqueDorms([...pickByIds([3, 37, 9]), ...[...dorms].sort((a, b) => b.rating - a.rating)]).slice(0, 8);
  if (type === "closest") return uniqueDorms([...pickByIds([3, 1, 8]), ...[...dorms].sort((a, b) => a.distanceKm - b.distanceKm)]).slice(0, 8);
  return [...dorms].sort((a, b) => a.price - b.price).slice(0, 8);
};

const COLLECTION_DORMS: Record<CollectionType, Dorm[]> = {
  best: getCollectionDorms("best"),
  cheapest: getCollectionDorms("cheapest"),
  closest: getCollectionDorms("closest"),
};

const travelEstimates = (km: number) => ({
  walk: Math.max(1, Math.round((km / 4.5) * 60)),
  motor: Math.max(2, Math.round((km / 22) * 60 + 2)),
  car: Math.max(3, Math.round((km / 16) * 60 + 4)),
});

const recommendedMode = (note: string): "walk" | "motor" | "car" | null => {
  const n = note.toLowerCase();
  if (/jalan kaki|kaki|walk/.test(n)) return "walk";
  if (/motor|ojek|sepeda motor/.test(n)) return "motor";
  if (/mobil|car|angkot/.test(n)) return "car";
  return null;
};

/* ============================== SHARED PIECES ============================== */

function Logo({ size = 32 }: { size?: number }) {
  const rawId = useId();
  const gid = `km-logo-${rawId.replace(/:/g, "")}`;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--km-brand)" />
          <stop offset="1" stopColor="var(--km-brand-mid)" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill={`url(#${gid})`} />
      <path d="M11 25.2 24 13.6l13 11.6" stroke="var(--km-on-brand)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 23.4V35h18V23.4" stroke="var(--km-on-brand)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 35v-6.2h6V35" stroke="var(--km-on-brand)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="33.5" cy="12.5" r="3.1" fill="var(--km-amber-bright)" />
      <path d="M38.8 7.4l.7 1.7 1.7.7-1.7.7-.7 1.7-.7-1.7-1.7-.7 1.7-.7z" fill="var(--km-amber-bright)" />
    </svg>
  );
}

function SmartImage({ src, alt, label, className = "" }: { src: string; alt: string; label?: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ backgroundImage: `var(--km-kawung), linear-gradient(135deg, var(--km-brand) 0%, var(--km-brand-mid) 100%)` }} role="img" aria-label={alt}>
        <span className="km-display italic font-medium text-white/85 text-[22px]">{initials(label || alt)}</span>
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" className={className} onError={() => setFailed(true)} />;
}

function TypingDots() {
  return (
    <div className="flex gap-2.5 km-fade">
      <span className="w-7 h-7 rounded-lg grid place-items-center shrink-0 border bg-[var(--km-brand-soft)] border-[var(--km-line)] text-[var(--km-brand-mid)]"><Bot size={13} /></span>
      <div className="km-card px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-1.5">
        {[0, 1, 2].map((i) => <span key={i} className="km-dot w-1.5 h-1.5 rounded-full bg-[var(--km-brand-mid)]" style={{ animationDelay: `${i * 0.15}s` }} />)}
      </div>
    </div>
  );
}

function ChatBubble({ msg, onRetry, matched, onOpenDorm }: { msg: Message; onRetry?: () => void; matched?: Dorm[]; onOpenDorm?: (d: Dorm) => void }) {
  const isUser = msg.role === "user";
  return (
    <div className={`km-anim flex flex-col ${isUser ? "items-end" : "items-start"}`}>
      <div className={`flex gap-2.5 max-w-full ${isUser ? "flex-row-reverse" : ""}`}>
        {isUser ? (
          <span className="w-7 h-7 rounded-lg grid place-items-center text-[8.5px] font-bold shrink-0 mt-0.5 bg-[var(--km-ink)] text-[var(--km-paper)]">AKU</span>
        ) : (
          <span className={`w-7 h-7 rounded-lg grid place-items-center shrink-0 mt-0.5 border ${msg.error ? "bg-[var(--km-danger-soft)] border-[var(--km-danger)] text-[var(--km-danger)]" : "bg-[var(--km-brand-soft)] border-[var(--km-line)] text-[var(--km-brand-mid)]"}`}>
            {msg.error ? <AlertTriangle size={13} /> : <Bot size={13} />}
          </span>
        )}
        <div className={`max-w-[85%] sm:max-w-[80%] px-3.5 py-2.5 text-[13px] leading-relaxed rounded-2xl ${isUser ? "rounded-br-md whitespace-pre-wrap bg-[var(--km-brand)] text-[var(--km-on-brand)]" : msg.error ? "rounded-bl-md border bg-[var(--km-danger-soft)] border-[var(--km-danger)] text-[var(--km-danger)]" : "km-card rounded-bl-md text-[var(--km-ink)]"}`}>
          {isUser ? msg.content : msg.error ? (
            <div>
              <p className="font-semibold mb-0.5">Tidak dapat menghubungi layanan AI.</p>
              <p className="text-[12px] opacity-80 mb-2">{msg.content}</p>
              {onRetry && (
                <button type="button" onClick={onRetry} className="inline-flex items-center gap-1.5 text-[11.5px] font-bold rounded-lg px-2.5 py-1.5 transition-colors active:scale-95 border bg-[var(--km-surface)] border-[var(--km-danger)] text-[var(--km-danger)] hover:bg-[var(--km-danger)] hover:text-[var(--km-surface)]">
                  <RotateCcw size={11} /> Coba lagi
                </button>
              )}
            </div>
          ) : (
            <div dangerouslySetInnerHTML={renderMarkdown(msg.content)} />
          )}
        </div>
      </div>
      {matched && matched.length > 0 && onOpenDorm && (
        <div className="mt-2 ml-[38px] w-[calc(100%-38px)] max-w-[400px] space-y-1.5">
          {matched.map((d) => (
            <button type="button" key={d.id} onClick={() => onOpenDorm(d)} className="km-card w-full flex items-center gap-3 p-2 rounded-xl hover:border-[var(--km-brand-mid)] text-left transition-all active:scale-[0.98] group">
              <SmartImage src={d.imageUrl} alt={d.name} label={d.name} className="w-10 h-10 rounded-lg object-cover border border-[var(--km-line)] shrink-0" />
              <span className="min-w-0 flex-1 block">
                <span className="block text-[12.5px] font-semibold truncate">{d.name}</span>
                <span className="block text-[11px] km-nums text-[var(--km-ink-soft)]">{formatIDR(d.price)} · {formatNum(d.distanceKm)} km · ★ {formatNum(d.rating)}</span>
              </span>
              <ChevronRight size={14} className="text-[var(--km-ink-faint)] group-hover:text-[var(--km-brand-mid)] transition-colors shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DormCard({ dorm, index, saved, onOpen, onToggleSave }: { dorm: Dorm; index: number; saved: boolean; onOpen: () => void; onToggleSave: () => void }) {
  const label = genderLabel(dorm.gender);
  const g = genderStyle(label);
  return (
    <article role="button" tabIndex={0} onClick={onOpen} onKeyDown={(e) => { if (e.key === "Enter") onOpen(); }} className="km-anim km-card group rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--km-shadow-hover)] hover:border-[var(--km-line-strong)]" style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}>
      <div className="relative h-44 overflow-hidden">
        <SmartImage src={dorm.imageUrl} alt={dorm.name} label={dorm.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--km-hero-scrim)]/45 via-transparent to-transparent" />
        <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-[0.07em] px-2.5 py-1 rounded-full border border-white/50 shadow-sm" style={{ background: g.bg, color: g.fg }}>{label}</span>
        <button type="button" aria-label={saved ? "Hapus dari daftar simpanan" : "Simpan ke daftar simpanan"} aria-pressed={saved} onClick={(e) => { e.stopPropagation(); onToggleSave(); }} className="absolute top-3 right-3 w-8 h-8 rounded-full grid place-items-center bg-white/90 backdrop-blur border border-white/60 shadow-sm hover:scale-110 active:scale-95 transition-transform">
          <Heart key={saved ? 1 : 0} size={15} className={saved ? "km-pop fill-[var(--km-danger)] text-[var(--km-danger)]" : "text-[#5B6052]"} />
        </button>
        <span className="absolute bottom-3 left-3 flex items-center gap-1 bg-[var(--km-hero-scrim)]/60 backdrop-blur text-white text-[11.5px] font-semibold px-2.5 py-1 rounded-full">
          <Star size={11} className="fill-[#E9A13B] text-[#E9A13B]" />
          {formatNum(dorm.rating)}
          <span className="text-white/60 font-normal">({formatNum(dorm.reviewCount)})</span>
        </span>
      </div>
      <div className="p-4">
        <h3 className="text-[15px] font-semibold leading-snug km-clamp-2 mb-1.5 min-h-[40px]">{dorm.name}</h3>
        <div className="flex items-center gap-3 text-[12px] mb-3 text-[var(--km-ink-soft)]">
          <span className="flex items-center gap-1"><MapPin size={12} className="text-[var(--km-brand-mid)]" />{formatNum(dorm.distanceKm)} km ke kampus</span>
          {dorm.hasAC && <span className="flex items-center gap-1 font-medium text-[var(--km-blue)]"><Snowflake size={11} /> AC</span>}
        </div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {dorm.facilities.slice(0, 3).map((fac) => <span key={fac} className="km-chip text-[10.5px] px-2 py-0.5 rounded-md">{fac}</span>)}
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-[var(--km-line)]">
          <p><span className="text-[16px] font-bold km-nums">{formatIDR(dorm.price)}</span><span className="text-[11px] font-medium text-[var(--km-ink-faint)]"> /bln</span></p>
          <span className="w-8 h-8 rounded-full grid place-items-center transition-colors bg-[var(--km-brand-soft)] text-[var(--km-brand)] group-hover:bg-[var(--km-brand)] group-hover:text-[var(--km-on-brand)]"><ArrowRight size={14} /></span>
        </div>
      </div>
    </article>
  );
}

function StripDormCard({ dorm, saved, onOpen, onToggleSave }: { dorm: Dorm; saved: boolean; onOpen: () => void; onToggleSave: () => void }) {
  const label = genderLabel(dorm.gender);
  const g = genderStyle(label);
  return (
    <article
      data-strip-card
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === "Enter") onOpen(); }}
      className="km-card group w-[236px] sm:w-[260px] lg:w-[280px] shrink-0 snap-start rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--km-shadow-hover)] hover:border-[var(--km-line-strong)]"
    >
      <div className="relative h-36 sm:h-40 overflow-hidden">
        <SmartImage src={dorm.imageUrl} alt={dorm.name} label={dorm.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--km-hero-scrim)]/55 via-transparent to-transparent" />
        <button type="button" aria-label={saved ? "Hapus dari daftar simpanan" : "Simpan ke daftar simpanan"} aria-pressed={saved} onClick={(e) => { e.stopPropagation(); onToggleSave(); }} className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full grid place-items-center bg-white/90 backdrop-blur border border-white/60 shadow-sm hover:scale-110 active:scale-95 transition-transform">
          <Heart key={saved ? 1 : 0} size={14} className={saved ? "km-pop fill-[var(--km-danger)] text-[var(--km-danger)]" : "text-[#5B6052]"} />
        </button>
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.07em] px-2 py-0.5 rounded-full border border-white/50 shadow-sm" style={{ background: g.bg, color: g.fg }}>{label}</span>
          <span className="flex items-center gap-1 bg-[var(--km-hero-scrim)]/60 backdrop-blur text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
            <Star size={10} className="fill-[#E9A13B] text-[#E9A13B]" />{formatNum(dorm.rating)}
          </span>
        </div>
      </div>
      <div className="p-3.5">
        <h3 className="text-[14px] font-semibold leading-snug km-clamp-2 min-h-[38px]">{dorm.name}</h3>
        <p className="text-[11.5px] mt-1 truncate text-[var(--km-ink-soft)]">{dorm.address}</p>
        <div className="flex items-center gap-1.5 text-[11px] mt-2 km-nums text-[var(--km-ink-soft)]">
          <MapPin size={11} className="text-[var(--km-brand-mid)] shrink-0" />
          <span>{formatNum(dorm.distanceKm)} km</span>
          <span className="text-[var(--km-ink-faint)]">·</span>
          <span>{formatNum(dorm.reviewCount)} ulasan</span>
        </div>
        <p className="text-[11px] mt-1.5 truncate text-[var(--km-ink-faint)]">{dorm.facilities.slice(0, 3).join(" · ")}</p>
        <div className="flex items-end justify-between pt-3 mt-3 border-t border-[var(--km-line)]">
          <div>
            <p className="text-[15px] font-bold km-nums leading-tight">{formatIDR(dorm.price)}</p>
            <p className="text-[10.5px] font-medium text-[var(--km-ink-faint)]">/bulan</p>
          </div>
          <span className="w-8 h-8 rounded-full grid place-items-center transition-colors bg-[var(--km-brand-soft)] text-[var(--km-brand)] group-hover:bg-[var(--km-brand)] group-hover:text-[var(--km-on-brand)]"><ArrowRight size={14} /></span>
        </div>
      </div>
    </article>
  );
}

function CollectionStrip({
  icon: Icon,
  title,
  desc,
  accent,
  items,
  delay,
  onBrowse,
  onOpenDorm,
  savedIds,
  onToggleSave,
  reduceMotion,
}: {
  icon: IconType;
  title: string;
  desc: string;
  accent: { fg: string; soft: string };
  items: Dorm[];
  delay: number;
  onBrowse: () => void;
  onOpenDorm: (d: Dorm) => void;
  savedIds: number[];
  onToggleSave: (d: Dorm) => void;
  reduceMotion: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(updateScrollState);
      ro.observe(el);
    }
    const t = window.setTimeout(updateScrollState, 350);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
      ro?.disconnect();
      window.clearTimeout(t);
    };
  }, [items, updateScrollState]);

  const scrollByCards = (dir: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-strip-card]");
    const amount = card ? card.offsetWidth + 12 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * amount, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <section className="km-anim km-card rounded-2xl p-4 sm:p-5" style={{ animationDelay: `${delay}ms`, "--km-acc": accent.fg } as CSSProperties} aria-label={title}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-10 h-10 rounded-xl grid place-items-center shrink-0" style={{ background: accent.soft, color: accent.fg }}><Icon size={17} /></span>
          <div className="min-w-0">
            <h3 className="km-display text-[20px] sm:text-[22px] font-semibold tracking-tight leading-tight">{title}</h3>
            <p className="text-[12px] mt-0.5 text-[var(--km-ink-soft)]">{desc}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button type="button" onClick={onBrowse} className="km-btn-ghost h-9 px-3 rounded-xl text-[12px] font-bold flex items-center gap-1.5 active:scale-95">
            Lihat semua <ArrowRight size={13} />
          </button>
          <div className="hidden md:flex items-center gap-1">
            <button type="button" onClick={() => scrollByCards(-1)} disabled={!canLeft} aria-label={`Geser ${title} ke kiri`} className="km-btn-ghost w-9 h-9 rounded-xl grid place-items-center active:scale-95 disabled:opacity-35"><ArrowLeft size={15} /></button>
            <button type="button" onClick={() => scrollByCards(1)} disabled={!canRight} aria-label={`Geser ${title} ke kanan`} className="km-btn-ghost w-9 h-9 rounded-xl grid place-items-center active:scale-95 disabled:opacity-35"><ArrowRight size={15} /></button>
          </div>
        </div>
      </div>

      <div className="relative -mx-1">
        <div ref={scrollRef} role="region" aria-label={`Daftar ${title}`} tabIndex={0} className="km-scroll flex gap-3 overflow-x-auto snap-x snap-mandatory px-1 pb-2">
          {items.map((d) => (
            <StripDormCard key={d.id} dorm={d} saved={savedIds.includes(d.id)} onOpen={() => onOpenDorm(d)} onToggleSave={() => onToggleSave(d)} />
          ))}
        </div>
        {canRight && <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[var(--km-surface)] to-transparent" />}
        {canLeft && <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[var(--km-surface)] to-transparent" />}
      </div>
    </section>
  );
}

function SwitchRow({ icon: Icon, label, desc, checked, onChange }: { icon: IconType; label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="km-card w-full flex items-center gap-3 rounded-xl p-3 text-left transition-colors hover:border-[var(--km-line-strong)]">
      <span className="w-9 h-9 rounded-lg grid place-items-center shrink-0 bg-[var(--km-brand-soft)] text-[var(--km-brand-mid)]"><Icon size={15} /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-bold">{label}</span>
        <span className="block text-[11.5px] leading-snug text-[var(--km-ink-soft)]">{desc}</span>
      </span>
      <span className={`relative w-10 h-6 rounded-full shrink-0 transition-colors ${checked ? "bg-[var(--km-brand)]" : "bg-[var(--km-line-strong)]"}`}>
        <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-[var(--km-surface)] shadow transition-transform ${checked ? "translate-x-4" : ""}`} />
      </span>
    </button>
  );
}

/* ============================== APP ============================== */

export default function KostMatchApp() {
  const [step, setStep] = useState(0);
  const [detailFrom, setDetailFrom] = useState(2);
  const [maxBudget, setMaxBudget] = useState(2000000);
  const [gender, setGender] = useState("Semua");
  const [maxDistance, setMaxDistance] = useState(5);
  const [needAC, setNeedAC] = useState(false);
  const [electricity, setElectricity] = useState("Semua");
  const [minRating, setMinRating] = useState(1);
  const [browsedDorms, setBrowsedDorms] = useState<Dorm[]>([]);
  const [browseTitle, setBrowseTitle] = useState("Hasil pencarian");
  const [browseFilters, setBrowseFilters] = useState<BrowseFilters | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("rating");
  const [selectedDorm, setSelectedDorm] = useState<Dorm | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [drawer, setDrawer] = useState<DrawerKind>(null);
  const [conciergeMessages, setConciergeMessages] = useState<Message[]>([]);
  const [conciergeInput, setConciergeInput] = useState("");
  const [isConciergeTyping, setIsConciergeTyping] = useState(false);
  const conciergeEndRef = useRef<HTMLDivElement>(null);
  const conciergeInputRef = useRef<HTMLInputElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastSeq = useRef(0);
  const [prefs, setPrefs] = useState<A11yPrefs>(DEFAULT_A11Y);
  const [prefsHydrated, setPrefsHydrated] = useState(false);
  const [systemDark, setSystemDark] = useState(false);
  const dark = prefs.theme === "dark" || (prefs.theme === "system" && systemDark);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: prefs.reduceMotion ? "auto" : "smooth" }); }, [messages, isTyping, prefs.reduceMotion]);
  useEffect(() => { conciergeEndRef.current?.scrollIntoView({ behavior: prefs.reduceMotion ? "auto" : "smooth" }); }, [conciergeMessages, isConciergeTyping, prefs.reduceMotion]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "auto" }); }, [step]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("kostmatch:saved:v1");
      if (raw) { const ids = JSON.parse(raw); if (Array.isArray(ids)) setSavedIds(ids.filter((x): x is number => typeof x === "number")); }
      const rawPrefs = window.localStorage.getItem("kostmatch:a11y:v1");
      if (rawPrefs) setPrefs({ ...DEFAULT_A11Y, ...JSON.parse(rawPrefs) });
      else if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPrefs((p) => ({ ...p, reduceMotion: true }));
    } catch { /* storage unavailable */ }
    setHydrated(true);
    setPrefsHydrated(true);
  }, []);

  useEffect(() => { if (!hydrated) return; try { window.localStorage.setItem("kostmatch:saved:v1", JSON.stringify(savedIds)); } catch { /* storage unavailable */ } }, [savedIds, hydrated]);
  useEffect(() => { if (!prefsHydrated) return; try { window.localStorage.setItem("kostmatch:a11y:v1", JSON.stringify(prefs)); } catch { /* storage unavailable */ } }, [prefs, prefsHydrated]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!drawer) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [drawer]);

  useEffect(() => {
    if (!drawer) return;
    const node = drawerRef.current;
    if (!node) return;
    const focusables = () => Array.from(node.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter((el) => !el.hasAttribute("disabled"));
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) { e.preventDefault(); lastEl.focus(); }
      else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); firstEl.focus(); }
    };
    node.addEventListener("keydown", onKey);
    return () => node.removeEventListener("keydown", onKey);
  }, [drawer]);

  useEffect(() => {
    if (drawer !== "concierge") return;
    const t = window.setTimeout(() => conciergeInputRef.current?.focus(), 320);
    return () => window.clearTimeout(t);
  }, [drawer]);

  const dismissToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));
  const pushToast = (text: string, action?: { actionLabel: string; onAction: () => void }) => {
    const id = ++toastSeq.current;
    setToasts((prev) => [...prev.slice(-2), { id, text, ...action }]);
    window.setTimeout(() => dismissToast(id), 4200);
  };

  const savedDorms = useMemo(() => savedIds.map((id) => dorms.find((d) => d.id === id)).filter((d): d is Dorm => Boolean(d)), [savedIds]);

  const toggleSave = (dorm: Dorm) => {
    if (savedIds.includes(dorm.id)) {
      const idx = savedIds.indexOf(dorm.id);
      setSavedIds((prev) => prev.filter((id) => id !== dorm.id));
      pushToast(`${shortName(dorm.name)} dihapus dari daftar simpanan`, {
        actionLabel: "Urungkan",
        onAction: () => setSavedIds((cur) => { if (cur.includes(dorm.id)) return cur; const next = [...cur]; next.splice(Math.min(idx, next.length), 0, dorm.id); return next; }),
      });
    } else {
      setSavedIds((prev) => [dorm.id, ...prev.filter((id) => id !== dorm.id)]);
      pushToast(`${shortName(dorm.name)} disimpan ke daftar simpanan`);
    }
  };

  const clearShortlist = () => {
    const prev = savedIds;
    setSavedIds([]);
    pushToast("Daftar simpanan dikosongkan", { actionLabel: "Urungkan", onAction: () => setSavedIds(prev) });
  };

  const handleInstantClick = (type: CollectionType) => {
    const sorted = [...dorms];
    let title = "";
    if (type === "best") { sorted.sort((a, b) => b.rating - a.rating); title = "Rating tertinggi dekat kampus"; setSortBy("rating"); }
    if (type === "cheapest") { sorted.sort((a, b) => a.price - b.price); title = "Paling hemat"; setSortBy("priceAsc"); }
    if (type === "closest") { sorted.sort((a, b) => a.distanceKm - b.distanceKm); title = "Terdekat ke kampus"; setSortBy("distance"); }
    setBrowsedDorms(sorted.slice(0, 9));
    setBrowseTitle(title);
    setBrowseFilters(null);
    setStep(2);
  };

  const handleCustomSearch = () => {
    const filtered = dorms.filter((dorm) => {
      if (needAC && !dorm.hasAC) return false;
      if (electricity !== "Semua") { const wantIncluded = electricity === "Included"; if (dorm.electricityIncluded !== wantIncluded) return false; }
      if (dorm.price > maxBudget) return false;
      if (dorm.distanceKm > maxDistance) return false;
      if (dorm.rating < minRating) return false;
      if (gender !== "Semua" && dorm.gender !== gender) return false;
      return true;
    });
    setBrowsedDorms(filtered.sort((a, b) => b.rating - a.rating));
    setBrowseTitle("Hasil sesuai filter");
    setBrowseFilters({ budget: maxBudget, gender, distance: maxDistance, rating: minRating, ac: needAC, electricity });
    setSortBy("rating");
    setStep(2);
  };

  const resetFilters = () => {
    setMaxBudget(2000000); setGender("Semua"); setMaxDistance(5); setNeedAC(false); setElectricity("Semua"); setMinRating(1);
    pushToast("Filter diatur ulang ke default");
  };

  const sortedBrowsed = useMemo(() => {
    const arr = [...browsedDorms];
    if (sortBy === "priceAsc") arr.sort((a, b) => a.price - b.price);
    else if (sortBy === "distance") arr.sort((a, b) => a.distanceKm - b.distanceKm);
    else arr.sort((a, b) => b.rating - a.rating);
    return arr;
  }, [browsedDorms, sortBy]);

  const openDetail = (dorm: Dorm, from: number = 2) => { setSelectedDorm(dorm); setDetailFrom(from); setDrawer(null); setStep(4); };

  const requestAnalysis = async (dorm: Dorm, msgs: Message[]) => {
    setIsTyping(true);
    try {
      const res = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ dorm, messages: msgs.map(({ role, content }) => ({ role, content })) }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Permintaan gagal");
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", content: error instanceof Error ? error.message : "Terjadi kesalahan.", error: true }]);
    } finally { setIsTyping(false); }
  };

  const openChat = (dorm: Dorm) => {
    setSelectedDorm(dorm);
    const initial: Message[] = [{ role: "user", content: "Halo, tolong analisis kost ini berdasarkan ulasan penghuni. Jawab dalam Bahasa Indonesia dengan struktur: 1) Ringkasan singkat, 2) Kelebihan utama, 3) Kekurangan/keluhan yang sering muncul, 4) Cocok untuk tipe penghuni seperti apa, 5) Pertanyaan penting yang perlu dikonfirmasi ke pemilik. Jika data tidak tersedia, katakan tidak diketahui dan jangan mengarang." }];
    setMessages(initial);
    setDrawer(null);
    setStep(3);
    requestAnalysis(dorm, initial);
  };

  const sendChatText = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || !selectedDorm || isTyping) return;
    const next: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next); setInput(""); requestAnalysis(selectedDorm, next);
  };

  const retryChat = () => { if (!selectedDorm || isTyping) return; const clean = messages.filter((m) => !m.error); setMessages(clean); requestAnalysis(selectedDorm, clean); };

  const openConcierge = useCallback(() => {
    setDrawer("concierge");
    setConciergeMessages((prev) => prev.length ? prev : [{ role: "assistant", content: "Halo! Aku **Asisten AI KostMatch**. Sebutkan budget, preferensi gender (putra/putri/campuran), jarak maksimal, dan fasilitas wajib (AC, listrik termasuk, kamar mandi dalam, dll). Aku akan menyusun shortlist beserta alasan singkat, trade-off, dan hal yang perlu kamu tanyakan ke pemilik." }]);
  }, []);

  const requestRecommend = async (msgs: Message[]) => {
    setIsConciergeTyping(true);
    try {
      const res = await fetch("/api/recommend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: msgs.map(({ role, content }) => ({ role, content })) }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Permintaan gagal");
      setConciergeMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (error) {
      setConciergeMessages((prev) => [...prev, { role: "assistant", content: error instanceof Error ? error.message : "Terjadi kesalahan.", error: true }]);
    } finally { setIsConciergeTyping(false); }
  };

  const sendConciergeText = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isConciergeTyping) return;
    const next: Message[] = [...conciergeMessages, { role: "user", content: trimmed }];
    setConciergeMessages(next); setConciergeInput(""); requestRecommend(next);
  };

  const retryConcierge = () => { if (isConciergeTyping) return; const clean = conciergeMessages.filter((m) => !m.error); setConciergeMessages(clean); requestRecommend(clean); };
  const findDormsInText = (text: string) => { const cleanText = text.toLowerCase(); return dorms.filter((d) => { const coreName = d.name.split("|")[0].split("-")[0].trim().toLowerCase(); return cleanText.includes(coreName); }); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); if (step !== 0) openConcierge(); }
      if (e.key === "Escape") setDrawer(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, openConcierge]);

  const universities = [
    { name: "Telkom University", img: "/images/universities/telkom.jpg", active: true },
    { name: "Institut Teknologi Bandung", img: "/images/universities/itb.jpg", active: false },
    { name: "Universitas Padjadjaran", img: "/images/universities/unpad.jpg", active: false },
    { name: "Universitas Pendidikan Indonesia", img: "/images/universities/upi.jpg", active: false },
    { name: "Universitas Katolik Parahyangan", img: "/images/universities/unpar.jpg", active: false },
    { name: "Universitas Pasundan", img: "/images/universities/unpas.jpg", active: false },
  ];

  const chatChips = [
    { label: "WiFi & belajar", prompt: "Bagaimana kualitas WiFi, apakah kost ini cocok untuk belajar?" },
    { label: "Air & kamar mandi", prompt: "Bagaimana kondisi pasokan air dan kamar mandinya?" },
    { label: "Bising & aman", prompt: "Apakah lingkungannya tenang dan aman, terutama malam hari?" },
    { label: "Makanan sekitar", prompt: "Apa saja pilihan makanan di sekitar dan kira-kira berapa harganya?" },
    { label: "Sepadan dengan harga?", prompt: "Berdasarkan ulasan penghuni, apakah kost ini sepadan dengan harganya?" },
  ];

  const conciergeChips = ["Paling hemat di bawah Rp 1,5jt", "Kost tenang untuk belajar", "Kost putri dengan AC dekat kampus"];

  const rootClass = ["km-app", "min-h-screen", "antialiased", "flex", "flex-col", dark ? "km-dark" : "", prefs.highContrast ? "km-hc" : "", prefs.reduceMotion ? "km-reduce-motion" : "", prefs.readableFont ? "km-readable" : "", prefs.boldFocus ? "km-bold-focus" : "", prefs.reduceTransparency ? "km-reduce-transparency" : ""].filter(Boolean).join(" ");
  const travel = selectedDorm ? travelEstimates(selectedDorm.distanceKm) : null;
  const recMode = selectedDorm ? recommendedMode(selectedDorm.trafficNote) : null;

  return (
    <div className={rootClass} style={{ colorScheme: dark ? "dark" : "light" }}>
      <style>{CSS}</style>
      <a href="#km-main" className="km-skip">Lewati ke konten</a>

      <header className="fixed top-0 inset-x-0 z-40 h-[var(--km-nav-h)] border-b border-[var(--km-line)] bg-[var(--km-nav-bg)] backdrop-blur-md">
        <div className="relative max-w-6xl mx-auto h-full px-3 sm:px-4 flex items-center justify-between gap-2">
          <button type="button" onClick={() => setStep(step === 0 ? 0 : 1)} className="flex items-center gap-2.5 active:scale-95 transition-transform shrink-0" aria-label="Beranda KostMatch">
            <Logo size={32} />
            <span className="km-display font-semibold text-[19px] tracking-tight hidden min-[380px]:inline">KostMatch</span>
          </button>

          {step > 0 && (
            <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-1.5 text-[12.5px] km-chip rounded-full pl-3 pr-1.5 py-1.5">
              <GraduationCap size={14} className="text-[var(--km-brand-mid)]" />
              <span className="font-medium">Telkom University</span>
              <button type="button" onClick={() => setStep(0)} className="ml-1 text-[11px] font-bold text-[var(--km-brand-mid)] hover:bg-[var(--km-brand-soft)] rounded-full px-2 py-0.5 transition-colors">Ganti</button>
            </div>
          )}

          <div className="flex items-center gap-1.5 sm:gap-2">
            {step > 0 && (
              <button type="button" onClick={() => setDrawer("saved")} aria-label={`Buka daftar simpanan, ${formatNum(savedIds.length)} disimpan`} className="km-btn-ghost relative w-10 h-10 rounded-xl grid place-items-center active:scale-95">
                <Heart size={16} className={savedIds.length > 0 ? "fill-[var(--km-danger)] text-[var(--km-danger)]" : ""} />
                {savedIds.length > 0 && <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--km-brand)] text-[var(--km-on-brand)] text-[10px] font-bold grid place-items-center km-nums">{formatNum(savedIds.length)}</span>}
              </button>
            )}
            <button type="button" onClick={() => setPrefs((p) => ({ ...p, theme: dark ? "light" : "dark" }))} aria-label={dark ? "Ganti ke mode terang" : "Ganti ke mode gelap"} className="km-btn-ghost w-10 h-10 rounded-xl grid place-items-center active:scale-95">{dark ? <Sun size={16} /> : <Moon size={16} />}</button>
            <button type="button" onClick={() => setDrawer("a11y")} aria-label="Buka pengaturan aksesibilitas" className="km-btn-ghost w-10 h-10 rounded-xl grid place-items-center active:scale-95"><Accessibility size={16} /></button>
            {step > 0 && (
              <button type="button" onClick={openConcierge} className="km-btn-primary h-10 px-3 sm:px-3.5 rounded-xl text-[13px] font-semibold flex items-center gap-2 active:scale-95">
                <Sparkles size={14} /><span className="hidden sm:inline">Asisten AI</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main id="km-main" className="pt-[var(--km-nav-h)] flex-grow flex flex-col">
        {step === 0 && (
          <section key="s0" className="km-anim flex-grow">
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 km-kawung pointer-events-none" />
              <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--km-mesh)" }} />
              <div className="relative max-w-6xl mx-auto px-4 pt-12 sm:pt-14 md:pt-20 pb-10 text-center">
                <h1 className="km-anim km-display text-[36px] sm:text-[40px] md:text-[58px] leading-[1.05] tracking-[-0.01em] font-medium max-w-3xl mx-auto" style={{ animationDelay: "100ms" }}>
                  Temukan kost yang terasa <em className="italic text-[var(--km-brand-mid)]">seperti rumah.</em>
                </h1>
                <p className="km-anim mt-5 text-[14.5px] md:text-[15.5px] max-w-xl mx-auto leading-relaxed text-[var(--km-ink-soft)]" style={{ animationDelay: "170ms" }}>
                  Listing terverifikasi, ulasan jujur penghuni, dan asisten AI yang membaca setiap ulasan untukmu. Pilih kampus untuk mulai.
                </p>
              </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 pb-16">
              <div className="flex items-stretch gap-3 sm:gap-4">
                <div className="grid flex-1 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {universities.map((uni, i) =>
                    uni.active ? (
                      <button type="button" key={uni.name} onClick={() => setStep(1)} className="km-anim group relative h-44 rounded-2xl overflow-hidden text-left border border-[var(--km-line)] bg-[var(--km-surface)] shadow-[var(--km-shadow)] hover:shadow-[var(--km-shadow-hover)] hover:-translate-y-1 transition-all duration-300 active:scale-[0.99]" style={{ animationDelay: `${220 + i * 60}ms` }}>
                        <SmartImage src={uni.img} alt={uni.name} label={uni.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--km-hero-scrim)]/90 via-[var(--km-hero-scrim)]/35 to-[var(--km-hero-scrim)]/10" />
                        <span className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-[10.5px] font-bold text-[#123F33]"><span className="w-1.5 h-1.5 rounded-full bg-[#2E7D4F] km-live" />Tersedia sekarang</span>
                        <div className="absolute bottom-0 inset-x-0 p-4 flex items-end justify-between gap-2">
                          <div>
                            <p className="text-white font-semibold text-[16px] leading-snug">{uni.name}</p>
                            <p className="text-white/70 text-[11.5px] mt-0.5 km-nums">{formatNum(dorms.length)} listing terdekat</p>
                          </div>
                          <span className="w-8 h-8 rounded-full bg-white text-[#123F33] grid place-items-center opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0"><ArrowRight size={15} /></span>
                        </div>
                      </button>
                    ) : (
                      <div key={uni.name} className="km-anim relative h-44 rounded-2xl overflow-hidden border border-[var(--km-line)] bg-[var(--km-surface)]" style={{ animationDelay: `${220 + i * 60}ms` }} aria-disabled="true">
                        <SmartImage src={uni.img} alt={uni.name} label={uni.name} className="absolute inset-0 w-full h-full object-cover grayscale opacity-50" />
                        <div className="absolute inset-0 bg-[var(--km-disabled-overlay)]" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
                          <p className="font-semibold text-[14.5px] leading-snug text-[var(--km-ink)]">{uni.name}</p>
                          <span className="km-chip text-[10px] font-bold uppercase tracking-[0.08em] px-2.5 py-1 rounded-full">Segera hadir</span>
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* Decorative "more campuses coming" rail — intentionally non-interactive */}
                <div
                  aria-hidden="true"
                  className="km-anim pointer-events-none select-none hidden lg:flex w-10 xl:w-11 shrink-0 items-center justify-center rounded-2xl border border-dashed border-[var(--km-line-strong)] bg-[var(--km-surface)] relative overflow-hidden shadow-[var(--km-shadow)]"
                  style={{ animationDelay: "620ms" }}
                >
                  <div className="absolute inset-0 opacity-40 bg-gradient-to-b from-[var(--km-brand-soft)] via-transparent to-[var(--km-brand-soft)]" />
                  <div className="absolute inset-y-4 right-1.5 w-px bg-gradient-to-b from-transparent via-[var(--km-line-strong)] to-transparent" />
                  <div className="relative flex flex-col items-center gap-3 text-[var(--km-ink-faint)]">
                    <span className="h-8 w-px bg-[var(--km-line-strong)]" />
                    <ArrowRight size={16} />
                    <span className="h-8 w-px bg-[var(--km-line-strong)]" />
                  </div>
                </div>
              </div>

              <div className="km-anim flex flex-wrap items-center justify-center gap-x-9 gap-y-3 mt-10 pt-8 border-t border-[var(--km-line)]" style={{ animationDelay: "600ms" }}>
                {[{ icon: ShieldCheck, text: "Mudah digunakan" }, { icon: Star, text: "Tanpa iklan" }, { icon: Sparkles, text: "Analisis ulasan berbasis AI" }].map((item) => (
                  <span key={item.text} className="flex items-center gap-2 text-[12.5px] font-medium text-[var(--km-ink-soft)]"><item.icon size={14} className="text-[var(--km-brand-mid)]" />{item.text}</span>
                ))}
              </div>
            </div>
          </section>
        )}

        {step === 1 && (
          <section key="s1" className="flex-grow w-full">
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--km-mesh)" }} />
              <div className="relative max-w-6xl mx-auto w-full px-4 pt-8 md:pt-10">
                <div className="km-anim flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-[10.5px] font-bold tracking-[0.2em] uppercase mb-2 text-[var(--km-brand-mid)]">Telkom University · {formatNum(dorms.length)} listing</p>
                    <h1 className="km-display text-[30px] md:text-[38px] font-medium tracking-[-0.01em] leading-[1.08]">Temukan tempatmu, <em className="italic text-[var(--km-brand-mid)]">dengan caramu.</em></h1>
                  </div>
                  <button type="button" onClick={() => setStep(0)} className="lg:hidden km-btn-ghost text-[12px] font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg"><ArrowLeft size={13} /> Ganti kampus</button>
                </div>

                <button type="button" onClick={openConcierge} className="km-anim km-card w-full group mt-6 rounded-2xl transition-all duration-300 active:scale-[0.997] hover:border-[var(--km-brand-mid)] text-left" style={{ animationDelay: "80ms" }}>
                  <div className="flex items-center gap-3.5 px-4 py-4">
                    <span className="w-10 h-10 rounded-xl grid place-items-center shrink-0 group-hover:scale-105 transition-transform bg-[var(--km-brand)] text-[var(--km-on-brand)]"><Sparkles size={16} /></span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[14px] font-bold tracking-tight">Tanya Asisten AI</span>
                      <span className="block text-[12.5px] truncate text-[var(--km-ink-soft)]">Jelaskan kost idealmu — budget, gender, jarak, fasilitas…</span>
                    </span>
                    <span className="hidden sm:flex items-center gap-1 shrink-0"><kbd className="km-kbd">⌘</kbd><kbd className="km-kbd">K</kbd></span>
                  </div>
                </button>
              </div>
            </div>

            <div className="max-w-6xl mx-auto w-full px-4 pb-14">
              <div className="km-anim km-card rounded-2xl p-4 sm:p-5 md:p-6 mt-4" style={{ animationDelay: "150ms" }}>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2"><SlidersHorizontal size={14} className="text-[var(--km-brand-mid)]" /><span className="text-[11px] font-bold tracking-[0.14em] uppercase text-[var(--km-ink-soft)]">Filter manual</span></div>
                  <button type="button" onClick={resetFilters} className="flex items-center gap-1.5 text-[11.5px] font-semibold text-[var(--km-ink-faint)] hover:text-[var(--km-danger)] transition-colors"><RotateCcw size={11} /> Atur ulang</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
                  <div className="lg:col-span-3">
                    <label htmlFor="km-budget" className="block text-[11.5px] font-semibold mb-1.5 text-[var(--km-ink-soft)]">Budget maks / bulan</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12.5px] font-semibold text-[var(--km-ink-faint)]">Rp</span>
                      <input id="km-budget" type="text" inputMode="numeric" value={maxBudget.toLocaleString("id-ID")} onChange={(e) => setMaxBudget(Number(e.target.value.replace(/\D/g, "")))} className="km-input km-nums w-full pl-9 pr-3 py-2.5 text-[13.5px] font-semibold" />
                    </div>
                  </div>
                  <div className="lg:col-span-2">
                    <label htmlFor="km-gender" className="block text-[11.5px] font-semibold mb-1.5 text-[var(--km-ink-soft)]">Gender</label>
                    <select id="km-gender" value={gender} onChange={(e) => setGender(e.target.value)} className="km-select w-full pl-3 pr-9 py-2.5 text-[13.5px] font-semibold">
                      <option value="Semua">Semua</option><option value="Putra">Putra</option><option value="Putri">Putri</option><option value="Campur">Campuran</option>
                    </select>
                  </div>
                  <div className="lg:col-span-2">
                    <label htmlFor="km-distance" className="flex justify-between text-[11.5px] font-semibold mb-2.5 text-[var(--km-ink-soft)]"><span>Jarak</span><span className="km-nums text-[var(--km-brand-mid)]">{formatNum(maxDistance, 1)} km</span></label>
                    <input id="km-distance" type="range" min={0.1} max={5} step={0.1} value={maxDistance} onChange={(e) => setMaxDistance(Number(e.target.value))} className="km-range" style={rangeFill(maxDistance, 0.1, 5, "var(--km-brand)")} />
                  </div>
                  <div className="lg:col-span-2">
                    <label htmlFor="km-rating" className="flex justify-between text-[11.5px] font-semibold mb-2.5 text-[var(--km-ink-soft)]"><span>Rating min</span><span className="km-nums text-[var(--km-amber)]">{formatNum(minRating, 1)} ★</span></label>
                    <input id="km-rating" type="range" min={1} max={5} step={0.1} value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} className="km-range" style={rangeFill(minRating, 1, 5, "var(--km-amber)")} />
                  </div>
                  <div className="lg:col-span-3">
                    <button type="button" onClick={handleCustomSearch} className="km-btn-primary w-full h-[42px] font-semibold text-[13.5px] rounded-xl flex items-center justify-center gap-2 active:scale-[0.97]">Cari listing <ArrowRight size={14} /></button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-5 pt-4 border-t border-[var(--km-line)]">
                  <button type="button" role="switch" aria-checked={needAC} onClick={() => setNeedAC((v) => !v)} className="flex items-center gap-2.5 group">
                    <span className={`relative w-9 h-5 rounded-full transition-colors ${needAC ? "bg-[var(--km-brand)]" : "bg-[var(--km-line-strong)]"}`}><span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-[var(--km-surface)] shadow transition-transform ${needAC ? "translate-x-4" : ""}`} /></span>
                    <span className="text-[13px] font-medium flex items-center gap-1.5 transition-colors text-[var(--km-ink-soft)] group-hover:text-[var(--km-ink)]"><Snowflake size={13} className="text-[var(--km-blue)]" /> Wajib AC</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <Zap size={13} className="text-[var(--km-amber)]" />
                    <select aria-label="Listrik" value={electricity} onChange={(e) => setElectricity(e.target.value)} className="km-select bg-transparent pl-2.5 pr-8 py-1.5 text-[12.5px] font-medium">
                      <option value="Semua">Semua listrik</option><option value="Included">Termasuk sewa</option><option value="Not Included">Token / terpisah</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="km-anim flex items-end justify-between mt-10 mb-4" style={{ animationDelay: "220ms" }}>
                <h2 className="km-display text-[22px] font-semibold tracking-tight">Koleksi pilihan</h2>
                <span className="text-[11.5px] font-medium hidden sm:block text-[var(--km-ink-faint)]">Geser atau lihat semua</span>
              </div>

              <div className="space-y-4">
                <CollectionStrip icon={Star} title="Kualitas terbaik" desc="Rating penghuni tertinggi, terverifikasi." accent={{ fg: "var(--km-brand)", soft: "var(--km-brand-soft)" }} items={COLLECTION_DORMS.best} delay={280} onBrowse={() => handleInstantClick("best")} onOpenDorm={(d) => openDetail(d, 1)} savedIds={savedIds} onToggleSave={toggleSave} reduceMotion={prefs.reduceMotion} />
                <CollectionStrip icon={Banknote} title="Paling hemat" desc="Sewa terendah, tanpa tebak-tebakan." accent={{ fg: "var(--km-amber)", soft: "var(--km-amber-soft)" }} items={COLLECTION_DORMS.cheapest} delay={340} onBrowse={() => handleInstantClick("cheapest")} onOpenDorm={(d) => openDetail(d, 1)} savedIds={savedIds} onToggleSave={toggleSave} reduceMotion={prefs.reduceMotion} />
                <CollectionStrip icon={MapPinned} title="Terdekat ke kampus" desc="Bisa jalan kaki ke Telkom University." accent={{ fg: "var(--km-blue)", soft: "var(--km-blue-soft)" }} items={COLLECTION_DORMS.closest} delay={400} onBrowse={() => handleInstantClick("closest")} onOpenDorm={(d) => openDetail(d, 1)} savedIds={savedIds} onToggleSave={toggleSave} reduceMotion={prefs.reduceMotion} />
              </div>
            </div>
          </section>
        )}

        {step === 2 && (
          <section key="s2" className="km-anim flex-grow max-w-6xl mx-auto w-full px-4 py-8">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
              <div className="flex items-center gap-3.5">
                <button type="button" onClick={() => setStep(1)} aria-label="Kembali ke pencarian" className="km-btn-ghost w-10 h-10 rounded-xl grid place-items-center active:scale-95 shrink-0"><ArrowLeft size={16} /></button>
                <div>
                  <h1 className="km-display text-[26px] md:text-[30px] font-semibold tracking-tight leading-tight">{browseTitle}</h1>
                  <p className="text-[12.5px] mt-0.5 km-nums text-[var(--km-ink-soft)]">{formatNum(sortedBrowsed.length)} dari {formatNum(dorms.length)} listing · Telkom University</p>
                </div>
              </div>
              <label className="flex items-center gap-2 text-[12px] font-semibold text-[var(--km-ink-soft)]">
                Urutkan
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)} className="km-select pl-3 pr-9 py-2 text-[12.5px] font-semibold">
                  <option value="rating">Rating tertinggi</option><option value="priceAsc">Harga · terendah</option><option value="distance">Terdekat</option>
                </select>
              </label>
            </div>

            {browseFilters && (
              <div className="flex flex-wrap items-center gap-1.5 mb-6">
                {[`≤ ${formatIDR(browseFilters.budget)}`, `≤ ${formatNum(browseFilters.distance, 1)} km`, `≥ ${formatNum(browseFilters.rating, 1)} ★`, browseFilters.gender !== "Semua" ? genderLabel(browseFilters.gender) : null, browseFilters.ac ? "Wajib AC" : null, browseFilters.electricity !== "Semua" ? (browseFilters.electricity === "Included" ? "Listrik termasuk" : "Listrik terpisah") : null].filter((x): x is string => Boolean(x)).map((chip) => (
                  <span key={chip} className="km-chip text-[11.5px] font-semibold px-2.5 py-1 rounded-full km-nums">{chip}</span>
                ))}
                <button type="button" onClick={() => setStep(1)} className="text-[11.5px] font-bold px-2 py-1 transition-colors text-[var(--km-brand-mid)] hover:text-[var(--km-brand)]">Ubah filter</button>
              </div>
            )}

            {sortedBrowsed.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedBrowsed.map((dorm, i) => <DormCard key={dorm.id} dorm={dorm} index={i} saved={savedIds.includes(dorm.id)} onOpen={() => openDetail(dorm, 2)} onToggleSave={() => toggleSave(dorm)} />)}
              </div>
            ) : (
              <div className="km-anim km-card border-dashed rounded-2xl py-16 px-6 flex flex-col items-center text-center">
                <span className="w-14 h-14 rounded-2xl grid place-items-center mb-4 bg-[var(--km-brand-soft)] text-[var(--km-brand)]"><Search size={22} /></span>
                <h3 className="km-display text-[22px] font-semibold mb-1.5">Tidak ada hasil</h3>
                <p className="text-[13px] max-w-sm mb-6 leading-relaxed text-[var(--km-ink-soft)]">Tidak ada yang cocok dengan kombinasi budget, jarak, dan fasilitas ini. Longgarkan satu atau dua filter — kamar yang tepat ada di luar sana.</p>
                <button type="button" onClick={() => setStep(1)} className="km-btn-primary h-10 px-5 font-semibold text-[13px] rounded-xl flex items-center gap-2 active:scale-95">Ubah filter <ArrowRight size={14} /></button>
              </div>
            )}
          </section>
        )}

        {step === 4 && selectedDorm && travel && (
          <section key="s4" className="km-anim flex-grow max-w-5xl mx-auto w-full px-4 py-7">
            <button type="button" onClick={() => setStep(detailFrom)} className="flex items-center gap-1.5 text-[13px] font-semibold mb-5 transition-colors active:scale-95 text-[var(--km-ink-soft)] hover:text-[var(--km-ink)]"><ArrowLeft size={14} /> Kembali ke {detailFrom === 2 ? "hasil" : "pencarian"}</button>

            <div className="km-card rounded-2xl overflow-hidden">
              <div className="relative h-[280px] md:h-[360px]">
                <SmartImage src={selectedDorm.imageUrl} alt={selectedDorm.name} label={selectedDorm.name} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--km-hero-scrim)]/85 via-[var(--km-hero-scrim)]/30 to-transparent" />
                <span className="absolute top-4 left-4 text-[10.5px] font-bold uppercase tracking-[0.07em] px-3 py-1.5 rounded-full border border-white/50 shadow-sm" style={{ background: genderStyle(genderLabel(selectedDorm.gender)).bg, color: genderStyle(genderLabel(selectedDorm.gender)).fg }}>{genderLabel(selectedDorm.gender)}</span>
                <button type="button" onClick={() => toggleSave(selectedDorm)} aria-label="Ubah daftar simpanan" aria-pressed={savedIds.includes(selectedDorm.id)} className="absolute top-4 right-3 w-10 h-10 rounded-full grid place-items-center bg-white/90 backdrop-blur border border-white/60 shadow-sm hover:scale-110 active:scale-95 transition-transform">
                  <Heart key={savedIds.includes(selectedDorm.id) ? 1 : 0} size={17} className={savedIds.includes(selectedDorm.id) ? "km-pop fill-[var(--km-danger)] text-[var(--km-danger)]" : "text-[#5B6052]"} />
                </button>
                <div className="absolute bottom-0 inset-x-0 p-5 md:p-7 flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div className="min-w-0">
                    <h1 className="km-display text-[26px] md:text-[34px] font-semibold text-white tracking-tight leading-[1.12] mb-1.5">{selectedDorm.name}</h1>
                    <p className="text-white/75 text-[13px] flex items-center gap-1.5"><MapPin size={13} className="shrink-0" /> {selectedDorm.address}</p>
                  </div>
                  <div className="bg-white/95 backdrop-blur rounded-xl px-4 py-3 shadow-lg shrink-0 self-start md:self-auto">
                    <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] mb-0.5 text-[#7C8171]">Sewa / bulan</p>
                    <p className="text-[20px] font-bold km-nums tracking-tight text-[#20241C]">{formatIDR(selectedDorm.price)}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5 md:p-7 grid grid-cols-1 lg:grid-cols-3 gap-7">
                <div className="lg:col-span-2 space-y-7">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                    {[
                      { label: "Rating", value: <span className="flex items-center gap-1"><Star size={13} className="text-[var(--km-amber-bright)] fill-[var(--km-amber-bright)]" />{formatNum(selectedDorm.rating)}<span className="text-[11.5px] font-normal text-[var(--km-ink-faint)]">({formatNum(selectedDorm.reviewCount)})</span></span> },
                      { label: "Jarak", value: `${formatNum(selectedDorm.distanceKm)} km` },
                      { label: "Gender", value: genderLabel(selectedDorm.gender) },
                      { label: "AC", value: <span className="flex items-center gap-1.5"><Snowflake size={13} className={selectedDorm.hasAC ? "text-[var(--km-blue)]" : "text-[var(--km-ink-faint)]"} />{selectedDorm.hasAC ? "Ya" : "Tidak"}</span> },
                    ].map((item) => (
                      <div key={item.label} className="rounded-xl p-3 border bg-[var(--km-paper)] border-[var(--km-line)]">
                        <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] mb-1 text-[var(--km-ink-faint)]">{item.label}</p>
                        <p className="text-[14px] font-semibold km-nums">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h3 className="text-[11px] font-bold tracking-[0.14em] uppercase mb-3 text-[var(--km-ink-faint)]">Spesifikasi kamar</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[{ icon: Maximize, label: "Ukuran kamar", value: selectedDorm.roomSize }, { icon: Bed, label: "Tipe kamar", value: selectedDorm.roomType }, { icon: Zap, label: "Listrik", value: selectedDorm.electricityIncluded ? "Termasuk sewa" : "Token / terpisah" }, { icon: Bath, label: "Kamar mandi", value: selectedDorm.bathroomType }].map((item) => (
                        <div key={item.label} className="flex items-center gap-3 rounded-xl p-3 border bg-[var(--km-paper)] border-[var(--km-line)]">
                          <span className="w-8 h-8 rounded-lg grid place-items-center shrink-0 bg-[var(--km-brand-soft)] text-[var(--km-brand)]"><item.icon size={14} /></span>
                          <div className="min-w-0"><p className="text-[10.5px] font-medium text-[var(--km-ink-faint)]">{item.label}</p><p className="text-[13px] font-semibold truncate">{item.value}</p></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[11px] font-bold tracking-[0.14em] uppercase mb-3 text-[var(--km-ink-faint)]">Akses ke kampus</h3>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[{ key: "walk", icon: Footprints, label: "Jalan kaki", min: travel.walk }, { key: "motor", icon: Bike, label: "Motor", min: travel.motor }, { key: "car", icon: Car, label: "Mobil", min: travel.car }].map((m) => (
                        <div key={m.key} className={`relative rounded-xl p-3 border text-center ${recMode === m.key ? "bg-[var(--km-brand-soft)] border-[var(--km-brand-mid)]" : "bg-[var(--km-paper)] border-[var(--km-line)]"}`}>
                          {recMode === m.key && <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8.5px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-[var(--km-brand)] text-[var(--km-on-brand)]">Disarankan</span>}
                          <m.icon size={16} className="mx-auto mb-1.5 text-[var(--km-brand-mid)]" />
                          <p className="text-[10.5px] font-semibold leading-tight text-[var(--km-ink-soft)]">{m.label}</p>
                          <p className="text-[15px] font-bold km-nums mt-0.5">±{m.min} mnt</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10.5px] mt-2 text-[var(--km-ink-faint)]">Estimasi berdasarkan jarak lurus, bukan waktu lalu lintas real-time.</p>
                    <div className="mt-3 rounded-xl p-4 flex gap-3 border bg-[var(--km-amber-soft)] border-[var(--km-amber-border)]">
                      <span className="w-8 h-8 rounded-lg grid place-items-center shrink-0 border bg-[var(--km-surface)] text-[var(--km-amber)] border-[var(--km-amber-border)]"><Navigation size={14} /></span>
                      <div><h4 className="text-[12px] font-bold tracking-wide uppercase mb-1 text-[var(--km-amber)]">Catatan akses</h4><p className="text-[13px] leading-relaxed text-[var(--km-ink)]">{selectedDorm.trafficNote}</p></div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[11px] font-bold tracking-[0.14em] uppercase mb-3 text-[var(--km-ink-faint)]">Fasilitas</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {selectedDorm.facilities.map((fac, i) => (
                        <div key={i} className="km-card flex items-center gap-2 rounded-lg px-2.5 py-2"><CheckCircle2 size={13} className="text-[var(--km-success)] shrink-0" /><span className="text-[12.5px]">{fac}</span></div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-[11px] font-bold tracking-[0.14em] uppercase text-[var(--km-ink-faint)]">Kata penghuni</h3>
                      <span className="km-chip text-[10.5px] font-semibold px-2 py-0.5 rounded-full km-nums">{formatNum(selectedDorm.googleReviews.length)} di Google</span>
                    </div>
                    {selectedDorm.googleReviews.length > 0 ? (
                      <div className="space-y-2.5">
                        {selectedDorm.googleReviews.map((rev, i) => (
                          <figure key={i} className="relative rounded-xl p-4 pl-5 border bg-[var(--km-paper)] border-[var(--km-line)]">
                            <span className="km-display absolute -top-1 left-2 text-[38px] leading-none select-none text-[var(--km-brand-mid)] opacity-30" aria-hidden="true">“</span>
                            <blockquote className="relative text-[13.5px] italic leading-relaxed text-[var(--km-ink)]">{rev}</blockquote>
                          </figure>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[13px] italic text-[var(--km-ink-faint)]">Belum ada ulasan tertulis — tanya AI atau pemilik untuk detail.</p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="rounded-2xl p-5 sticky top-[calc(var(--km-nav-h)+1rem)] border bg-[var(--km-paper)] border-[var(--km-line)]">
                    <h3 className="km-display text-[19px] font-semibold tracking-tight mb-1">Tertarik dengan kost ini?</h3>
                    <p className="text-[12.5px] mb-4 leading-relaxed text-[var(--km-ink-soft)]">Baca analisis AI dulu, lalu hubungi pemilik langsung.</p>
                    <p className="mb-5"><span className="km-display text-[30px] font-semibold km-nums tracking-tight">{formatIDR(selectedDorm.price)}</span><span className="text-[12px] font-medium text-[var(--km-ink-faint)]"> /bulan</span></p>
                    <button type="button" onClick={() => openChat(selectedDorm)} className="km-btn-primary w-full h-11 font-semibold text-[13.5px] rounded-xl flex items-center justify-center gap-2 active:scale-[0.97] mb-2.5"><Sparkles size={15} /> Analisis dengan AI</button>
                    <a href={`https://wa.me/${selectedDorm.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Halo, saya menemukan ${selectedDorm.name} di KostMatch. Apakah kamar masih tersedia?`)}`} target="_blank" rel="noopener noreferrer" className="w-full h-11 text-white font-semibold text-[13.5px] rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.97] bg-[var(--km-whatsapp)] hover:bg-[var(--km-whatsapp-hover)]"><Phone size={15} /> WhatsApp pemilik</a>
                    <p className="text-center text-[11px] km-nums tracking-wide mt-2 mb-4 text-[var(--km-ink-faint)]">{selectedDorm.whatsapp}</p>
                    <div className="space-y-2 pt-4 border-t border-[var(--km-line-strong)]">
                      {[{ icon: ShieldCheck, text: "Kontak pemilik langsung — tanpa perantara" }, { icon: Star, text: "Ulasan bersumber dari Google" }, { icon: Check, text: `AI membaca semua ${formatNum(selectedDorm.reviewCount)} ulasan untukmu` }].map((item) => (
                        <p key={item.text} className="flex items-center gap-2 text-[11.5px] font-medium text-[var(--km-ink-soft)]"><item.icon size={12} className="text-[var(--km-brand-mid)] shrink-0" />{item.text}</p>
                      ))}
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] mt-4 pt-3 border-t border-[var(--km-line-strong)] km-nums text-[var(--km-ink-faint)]">Listing № {String(selectedDorm.id).padStart(3, "0")}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {step === 3 && selectedDorm && (
          <section key="s3" className="km-anim flex-grow w-full max-w-3xl mx-auto px-4 h-[calc(100dvh-var(--km-nav-h))] flex flex-col">
            <div className="flex items-center gap-3 py-4 shrink-0">
              <button type="button" onClick={() => setStep(4)} aria-label="Kembali ke listing" className="km-btn-ghost w-10 h-10 rounded-xl grid place-items-center active:scale-95 shrink-0"><ArrowLeft size={16} /></button>
              <SmartImage src={selectedDorm.imageUrl} alt={selectedDorm.name} label={selectedDorm.name} className="w-10 h-10 rounded-xl object-cover border border-[var(--km-line)] shrink-0" />
              <div className="min-w-0 flex-1">
                <h2 className="text-[14.5px] font-bold tracking-tight truncate">{selectedDorm.name}</h2>
                <p className="text-[11.5px] flex items-center gap-1 text-[var(--km-ink-soft)]"><Sparkles size={11} className="text-[var(--km-brand-mid)]" /> Asisten AI Kost · {formatNum(selectedDorm.reviewCount)} ulasan dianalisis</p>
              </div>
              <button type="button" onClick={() => openChat(selectedDorm)} disabled={isTyping} title="Mulai ulang analisis" aria-label="Mulai ulang analisis" className="km-btn-ghost w-9 h-9 rounded-xl grid place-items-center active:scale-95 disabled:opacity-40 shrink-0"><RotateCcw size={14} /></button>
            </div>

            <div className="km-card flex-1 min-h-0 rounded-2xl overflow-hidden flex flex-col mb-4">
              <div className="km-scroll flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--km-surface-alt)]">
                {messages.map((msg, idx) => <ChatBubble key={idx} msg={msg} onRetry={msg.error ? retryChat : undefined} />)}
                {isTyping && <TypingDots />}
                <div ref={chatEndRef} />
              </div>
              <div className="border-t border-[var(--km-line)] p-3 shrink-0 bg-[var(--km-surface)]">
                <div className="km-scroll flex gap-1.5 overflow-x-auto pb-2.5">
                  {chatChips.map((chip) => (
                    <button type="button" key={chip.label} onClick={() => sendChatText(chip.prompt)} disabled={isTyping} className="km-chip whitespace-nowrap rounded-full px-3 py-1.5 text-[11.5px] font-semibold hover:border-[var(--km-brand-mid)] hover:text-[var(--km-brand-mid)] transition-colors disabled:opacity-40 active:scale-95">{chip.label}</button>
                  ))}
                </div>
                <form onSubmit={(e) => { e.preventDefault(); sendChatText(input); }} className="flex gap-2">
                  <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Tanya soal WiFi, air, makanan, kebisingan…" className="km-input flex-grow px-3.5 py-2.5 text-[13.5px]" />
                  <button type="submit" disabled={isTyping || !input.trim()} aria-label="Kirim pesan" className="km-btn-primary w-11 h-11 rounded-xl grid place-items-center disabled:opacity-40 active:scale-95 shrink-0"><Send size={16} /></button>
                </form>
                <p className="text-[10.5px] text-center mt-2 text-[var(--km-ink-faint)]">Ringkasan AI berasal dari ulasan penghuni — selalu konfirmasi detail ke pemilik.</p>
              </div>
            </div>
          </section>
        )}
      </main>

      {step !== 3 && (
        <footer className="border-t border-[var(--km-line)] mt-auto">
          <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[12px] text-[var(--km-ink-soft)]"><Logo size={20} /><span className="font-bold text-[var(--km-ink)]">KostMatch</span> · Kost mahasiswa, lebih mudah.</div>
            <p className="text-[11px] km-nums text-[var(--km-ink-faint)]">Team Kamar 216 · © {new Date().getFullYear()}</p>
          </div>
        </footer>
      )}

      {drawer && <div className="fixed inset-0 z-50 bg-[var(--km-overlay)] backdrop-blur-[2px] km-fade" onClick={() => setDrawer(null)} aria-hidden="true" />}

      {drawer === "concierge" && (
        <aside ref={drawerRef} role="dialog" aria-modal="true" aria-label="Asisten AI" className="km-drawer fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[460px] border-l border-[var(--km-line)] shadow-2xl flex flex-col bg-[var(--km-paper)] pb-[env(safe-area-inset-bottom)]">
          <div className="px-5 py-4 border-b border-[var(--km-line)] bg-[var(--km-surface)] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl grid place-items-center bg-[var(--km-brand)] text-[var(--km-on-brand)]"><Sparkles size={16} /></span>
              <div><h3 className="km-display text-[18px] font-semibold tracking-tight leading-tight">Asisten AI</h3><p className="text-[11.5px] text-[var(--km-ink-soft)]">Ceritakan yang kamu cari</p></div>
            </div>
            <button type="button" onClick={() => setDrawer(null)} aria-label="Tutup asisten" className="w-8 h-8 rounded-lg grid place-items-center text-[var(--km-ink-soft)] hover:text-[var(--km-ink)] hover:bg-[var(--km-paper)] transition-all active:scale-95"><X size={16} /></button>
          </div>
          <div className="km-scroll flex-1 overflow-y-auto p-4 space-y-4">
            {conciergeMessages.map((msg, idx) => (
              <ChatBubble key={idx} msg={msg} onRetry={msg.error ? retryConcierge : undefined} matched={msg.role === "assistant" && !msg.error ? findDormsInText(msg.content) : []} onOpenDorm={(d) => openDetail(d, browsedDorms.length > 0 ? 2 : 1)} />
            ))}
            {isConciergeTyping && <TypingDots />}
            <div ref={conciergeEndRef} />
          </div>
          <div className="border-t border-[var(--km-line)] bg-[var(--km-surface)] p-3 shrink-0">
            <div className="km-scroll flex gap-1.5 overflow-x-auto pb-2.5">
              {conciergeChips.map((chip) => (
                <button type="button" key={chip} onClick={() => sendConciergeText(chip)} disabled={isConciergeTyping} className="km-chip whitespace-nowrap rounded-full px-3 py-1.5 text-[11.5px] font-semibold hover:border-[var(--km-brand-mid)] hover:text-[var(--km-brand-mid)] transition-colors disabled:opacity-40 active:scale-95">{chip}</button>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); sendConciergeText(conciergeInput); }} className="flex gap-2">
              <input ref={conciergeInputRef} type="text" value={conciergeInput} onChange={(e) => setConciergeInput(e.target.value)} placeholder="mis. Kost putri di bawah 1,5jt ada AC…" className="km-input flex-grow px-3.5 py-2.5 text-[13.5px]" />
              <button type="submit" disabled={isConciergeTyping || !conciergeInput.trim()} aria-label="Kirim ke asisten" className="km-btn-primary w-11 h-11 rounded-xl grid place-items-center disabled:opacity-40 active:scale-95 shrink-0"><Send size={16} /></button>
            </form>
            <p className="text-[10.5px] text-center mt-2 km-nums text-[var(--km-ink-faint)]">Rekomendasi dari {formatNum(dorms.length)} listing terverifikasi.</p>
          </div>
        </aside>
      )}

      {drawer === "saved" && (
        <aside ref={drawerRef} role="dialog" aria-modal="true" aria-label="Daftar simpanan" className="km-drawer fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[420px] border-l border-[var(--km-line)] shadow-2xl flex flex-col bg-[var(--km-paper)] pb-[env(safe-area-inset-bottom)]">
          <div className="px-5 py-4 border-b border-[var(--km-line)] bg-[var(--km-surface)] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl grid place-items-center border bg-[var(--km-danger-soft)] text-[var(--km-danger)] border-[var(--km-line)]"><Heart size={16} className="fill-[var(--km-danger)]" /></span>
              <div><h3 className="km-display text-[18px] font-semibold tracking-tight leading-tight">Daftar simpanan</h3><p className="text-[11.5px] km-nums text-[var(--km-ink-soft)]">{formatNum(savedDorms.length)} disimpan · tersimpan di perangkat ini</p></div>
            </div>
            <button type="button" onClick={() => setDrawer(null)} aria-label="Tutup daftar simpanan" className="w-8 h-8 rounded-lg grid place-items-center text-[var(--km-ink-soft)] hover:text-[var(--km-ink)] hover:bg-[var(--km-paper)] transition-all active:scale-95"><X size={16} /></button>
          </div>
          <div className="km-scroll flex-1 overflow-y-auto p-4 space-y-2">
            {savedDorms.length > 0 ? (
              savedDorms.map((dorm, i) => (
                <div key={dorm.id} className="km-anim km-card flex items-center gap-3 p-2.5 rounded-xl hover:border-[var(--km-brand-mid)] transition-all group" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
                  <button type="button" onClick={() => openDetail(dorm, browsedDorms.length > 0 ? 2 : 1)} className="flex items-center gap-3 min-w-0 flex-1 text-left">
                    <SmartImage src={dorm.imageUrl} alt={dorm.name} label={dorm.name} className="w-12 h-12 rounded-lg object-cover border border-[var(--km-line)] shrink-0" />
                    <span className="min-w-0 flex-1 block"><span className="block text-[13px] font-bold truncate">{dorm.name}</span><span className="block text-[11.5px] km-nums mt-0.5 text-[var(--km-ink-soft)]">{formatIDR(dorm.price)} · {formatNum(dorm.distanceKm)} km · ★ {formatNum(dorm.rating)}</span></span>
                    <ChevronRight size={14} className="text-[var(--km-ink-faint)] group-hover:text-[var(--km-brand-mid)] transition-colors shrink-0" />
                  </button>
                  <button type="button" onClick={() => toggleSave(dorm)} aria-label={`Hapus ${dorm.name} dari daftar simpanan`} className="w-8 h-8 rounded-lg grid place-items-center text-[var(--km-ink-faint)] hover:text-[var(--km-danger)] hover:bg-[var(--km-danger-soft)] transition-all active:scale-95 shrink-0"><Trash2 size={14} /></button>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center px-6 py-14">
                <span className="km-card w-14 h-14 rounded-2xl grid place-items-center mb-4 text-[var(--km-danger)]"><Heart size={22} /></span>
                <h3 className="km-display text-[20px] font-semibold mb-1.5">Belum ada yang disimpan</h3>
                <p className="text-[12.5px] max-w-[240px] leading-relaxed text-[var(--km-ink-soft)]">Ketuk hati pada listing untuk membuat daftar simpanan yang bisa kamu bandingkan dan kunjungi lagi.</p>
              </div>
            )}
          </div>
          {savedDorms.length > 0 && (
            <div className="border-t border-[var(--km-line)] bg-[var(--km-surface)] p-3 shrink-0 flex items-center justify-between">
              <span className="text-[11.5px] font-semibold km-nums pl-1 text-[var(--km-ink-soft)]">{formatNum(savedDorms.length)} listing disimpan</span>
              <button type="button" onClick={clearShortlist} className="flex items-center gap-1.5 text-[11.5px] font-bold text-[var(--km-danger)] hover:bg-[var(--km-danger-soft)] rounded-lg px-2.5 py-1.5 transition-colors active:scale-95"><Trash2 size={12} /> Hapus semua</button>
            </div>
          )}
        </aside>
      )}

      {drawer === "a11y" && (
        <aside ref={drawerRef} role="dialog" aria-modal="true" aria-label="Aksesibilitas" className="km-drawer fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[420px] border-l border-[var(--km-line)] shadow-2xl flex flex-col bg-[var(--km-paper)] pb-[env(safe-area-inset-bottom)]">
          <div className="px-5 py-4 border-b border-[var(--km-line)] bg-[var(--km-surface)] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl grid place-items-center bg-[var(--km-brand-soft)] text-[var(--km-brand-mid)]"><Accessibility size={16} /></span>
              <div><h3 className="km-display text-[18px] font-semibold tracking-tight leading-tight">Aksesibilitas</h3><p className="text-[11.5px] text-[var(--km-ink-soft)]">Sesuaikan tampilan dan interaksi</p></div>
            </div>
            <button type="button" onClick={() => setDrawer(null)} aria-label="Tutup aksesibilitas" className="w-8 h-8 rounded-lg grid place-items-center text-[var(--km-ink-soft)] hover:text-[var(--km-ink)] hover:bg-[var(--km-paper)] transition-all active:scale-95"><X size={16} /></button>
          </div>
          <div className="km-scroll flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <p className="text-[11px] font-bold tracking-[0.14em] uppercase mb-2 text-[var(--km-ink-faint)]">Tema</p>
              <div className="grid grid-cols-3 gap-2">
                {[{ mode: "light", icon: Sun, label: "Terang" }, { mode: "dark", icon: Moon, label: "Gelap" }, { mode: "system", icon: Monitor, label: "Sistem" }].map((t) => (
                  <button type="button" key={t.mode} onClick={() => setPrefs((p) => ({ ...p, theme: t.mode as ThemeMode }))} aria-pressed={prefs.theme === t.mode} className={`rounded-xl p-3 border flex flex-col items-center gap-1.5 text-[12px] font-bold transition-colors ${prefs.theme === t.mode ? "bg-[var(--km-brand)] text-[var(--km-on-brand)] border-[var(--km-brand)]" : "km-card text-[var(--km-ink-soft)] hover:border-[var(--km-line-strong)]"}`}>
                    <t.icon size={16} />{t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <SwitchRow icon={Contrast} label="Kontras tinggi" desc="Warna lebih tegas untuk keterbacaan maksimal." checked={prefs.highContrast} onChange={(v) => setPrefs((p) => ({ ...p, highContrast: v }))} />
              <SwitchRow icon={EyeOff} label="Kurangi gerak" desc="Matikan animasi dan transisi yang tidak perlu." checked={prefs.reduceMotion} onChange={(v) => setPrefs((p) => ({ ...p, reduceMotion: v }))} />
              <SwitchRow icon={Type} label="Font mudah dibaca" desc="Gunakan Lexend dengan jarak huruf lebih longgar." checked={prefs.readableFont} onChange={(v) => setPrefs((p) => ({ ...p, readableFont: v }))} />
              <SwitchRow icon={Focus} label="Fokus tebal" desc="Garis fokus keyboard lebih jelas dan tebal." checked={prefs.boldFocus} onChange={(v) => setPrefs((p) => ({ ...p, boldFocus: v }))} />
              <SwitchRow icon={EyeOff} label="Kurangi transparansi" desc="Hapus blur dan buat latar belakang lebih solid." checked={prefs.reduceTransparency} onChange={(v) => setPrefs((p) => ({ ...p, reduceTransparency: v }))} />
            </div>
            <div className="km-card rounded-xl p-4">
              <p className="text-[11px] font-bold tracking-[0.14em] uppercase mb-2 text-[var(--km-ink-faint)]">Pintasan keyboard</p>
              <div className="space-y-1.5 text-[12px] text-[var(--km-ink-soft)]">
                <p className="flex items-center justify-between"><span>Buka Asisten AI</span><span className="flex gap-1"><kbd className="km-kbd">⌘</kbd><kbd className="km-kbd">K</kbd></span></p>
                <p className="flex items-center justify-between"><span>Tutup panel</span><kbd className="km-kbd">Esc</kbd></p>
                <p className="flex items-center justify-between"><span>Navigasi kontrol</span><kbd className="km-kbd">Tab</kbd></p>
              </div>
            </div>
            <button type="button" onClick={() => { setPrefs(DEFAULT_A11Y); pushToast("Preferensi aksesibilitas diatur ulang"); }} className="km-btn-ghost w-full h-10 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 active:scale-95"><RotateCcw size={14} /> Atur ulang preferensi</button>
          </div>
        </aside>
      )}

      <div role="status" aria-live="polite" className="fixed bottom-5 inset-x-0 z-[80] flex flex-col items-center gap-2 px-4 pointer-events-none pb-[env(safe-area-inset-bottom)]">
        {toasts.map((t) => (
          <div key={t.id} className="km-anim pointer-events-auto flex items-center gap-3 pl-4 pr-2 py-2 rounded-full shadow-[var(--km-shadow-hover)] text-[12.5px] font-medium max-w-full bg-[var(--km-ink)] text-[var(--km-paper)]">
            <Check size={13} className="text-[var(--km-success)] shrink-0" />
            <span className="truncate">{t.text}</span>
            {t.actionLabel && <button type="button" onClick={() => { t.onAction?.(); dismissToast(t.id); }} className="ml-1 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[var(--km-amber-bright)] font-bold text-[11.5px] transition-colors shrink-0">{t.actionLabel}</button>}
          </div>
        ))}
      </div>
    </div>
  );
}
