import {
  Briefcase,
  Cpu,
  Drama,
  GraduationCap,
  HeartPulse,
  LayoutGrid,
  Martini,
  Music,
  Palette,
  Shirt,
  Trophy,
  UtensilsCrossed,
  Users,
  Clapperboard,
  type LucideIcon,
} from "lucide-react";

// Single source of truth on the backend is
// backend/src/validations/category.validation.js's CATEGORY_ICON_KEYS —
// this map must be kept in sync with it manually. A key with no entry here
// falls back to "other" so a stale client never crashes on an unrecognized
// key added later.
export const CATEGORY_ICON_KEYS = [
  "music",
  "sports",
  "comedy",
  "business",
  "nightlife",
  "arts",
  "food",
  "film",
  "education",
  "health",
  "community",
  "tech",
  "fashion",
  "other",
] as const;

export type CategoryIconKey = (typeof CATEGORY_ICON_KEYS)[number];

export const CATEGORY_ICON_COMPONENT_MAP: Record<CategoryIconKey, LucideIcon> = {
  music: Music,
  sports: Trophy,
  comedy: Drama,
  business: Briefcase,
  nightlife: Martini,
  arts: Palette,
  food: UtensilsCrossed,
  film: Clapperboard,
  education: GraduationCap,
  health: HeartPulse,
  community: Users,
  tech: Cpu,
  fashion: Shirt,
  other: LayoutGrid,
};

export const getCategoryIcon = (iconKey: string): LucideIcon =>
  CATEGORY_ICON_COMPONENT_MAP[iconKey as CategoryIconKey] ??
  CATEGORY_ICON_COMPONENT_MAP.other;
