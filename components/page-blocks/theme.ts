import { type PageTheme, type ThemePreset } from "@/lib/types/event-page";

/**
 * Literal values, not Vera's tokens: a published page wears the organizer's
 * theme. Every preset already passes contrast on its own ground.
 */
export interface ResolvedTheme {
  ground: string;
  surface: string;
  raised: string;
  ink: string;
  dim: string;
  line: string;
  accent: string;
  onAccent: string;
  fontStack: string;
  displayStack: string;
}

export interface PresetDefinition {
  label: string;
  note: string;
  dark: boolean;
  colors: Omit<ResolvedTheme, "fontStack" | "displayStack" | "onAccent">;
}

const PRESETS: Record<ThemePreset, PresetDefinition> = {
  paper: {
    label: "Paper",
    note: "Vera's own",
    dark: false,
    colors: {
      ground: "#f5f3ef", surface: "#faf8f4", raised: "#edeae2",
      ink: "#16150f", dim: "#6f6d61", line: "#e1ddd1",
      accent: "#0fb26e",
    },
  },
  midnight: {
    label: "Midnight",
    note: "Late and loud",
    dark: true,
    colors: {
      ground: "#141317", surface: "#1c1a21", raised: "#232028",
      ink: "#f2efe9", dim: "#a49eac", line: "#2b2932",
      accent: "#c9f24d",
    },
  },
  ink: {
    label: "Ink",
    note: "Deep and clean",
    dark: true,
    colors: {
      ground: "#101820", surface: "#17222c", raised: "#1e2b38",
      ink: "#eef2f5", dim: "#97a7b5", line: "#25333f",
      accent: "#ff6b4a",
    },
  },
  sun: {
    label: "Sun",
    note: "Warm daytime",
    dark: false,
    colors: {
      ground: "#fff8ec", surface: "#fffdf8", raised: "#f6ead6",
      ink: "#241a10", dim: "#7f6b56", line: "#eadcc4",
      accent: "#e2571f",
    },
  },
  noir: {
    label: "Noir",
    note: "Black and white",
    dark: true,
    colors: {
      ground: "#0a0a0a", surface: "#141414", raised: "#1e1e1e",
      ink: "#fafafa", dim: "#a1a1a1", line: "#262626",
      accent: "#ffffff",
    },
  },
  forest: {
    label: "Forest",
    note: "Deep green",
    dark: true,
    colors: {
      ground: "#0d1a14", surface: "#132520", raised: "#1a322a",
      ink: "#eaf3ee", dim: "#94ab9f", line: "#1f3a30",
      accent: "#7ee0a8",
    },
  },
  plum: {
    label: "Plum",
    note: "Rich and nocturnal",
    dark: true,
    colors: {
      ground: "#160f1d", surface: "#1f1629", raised: "#2a1e37",
      ink: "#f3ecf8", dim: "#a99bb5", line: "#2f2340",
      accent: "#e3a7ff",
    },
  },
  ocean: {
    label: "Ocean",
    note: "Cool and wide",
    dark: true,
    colors: {
      ground: "#07171c", surface: "#0d2229", raised: "#123039",
      ink: "#e6f3f5", dim: "#8fabb3", line: "#16353f",
      accent: "#4fd6e0",
    },
  },
  bloom: {
    label: "Bloom",
    note: "Soft and bright",
    dark: false,
    colors: {
      ground: "#fdf2f4", surface: "#fffafb", raised: "#f8e3e8",
      ink: "#2b1119", dim: "#875f69", line: "#f0d5dc",
      accent: "#d6336c",
    },
  },
  slate: {
    label: "Slate",
    note: "Quiet and neutral",
    dark: false,
    colors: {
      ground: "#f4f5f7", surface: "#fbfbfc", raised: "#e8eaee",
      ink: "#14181f", dim: "#616873", line: "#dcdfe5",
      accent: "#3d5afe",
    },
  },
  sand: {
    label: "Sand",
    note: "Dry and earthy",
    dark: false,
    colors: {
      ground: "#f6f1e7", surface: "#fdfaf3", raised: "#ebe2d1",
      ink: "#1f1a12", dim: "#756a58", line: "#e0d6c2",
      accent: "#b45309",
    },
  },
  mint: {
    label: "Mint",
    note: "Fresh and open",
    dark: false,
    colors: {
      ground: "#eff7f3", surface: "#f9fdfb", raised: "#dcece4",
      ink: "#0e1c16", dim: "#5d7168", line: "#d2e4da",
      accent: "#0e7c66",
    },
  },
};

export const PRESET_LIST = Object.entries(PRESETS).map(([value, definition]) => ({
  value: value as ThemePreset,
  label: definition.label,
  note: definition.note,
  dark: definition.dark,
}));

/**
 * Pairings, not single families: a display face for headlines and a companion
 * for reading. Loaded as CSS variables by `lib/page-fonts.ts`.
 */
export interface FontPairing {
  label: string;
  note: string;
  display: string;
  body: string;
}

const FALLBACK_SANS = "-apple-system, 'Segoe UI', Roboto, sans-serif";
const FALLBACK_SERIF = "Georgia, 'Times New Roman', serif";

export const FONT_PAIRINGS = {
  gilroy: {
    label: "Gilroy",
    note: "Vera's own",
    display: `'Gilroy', var(--font-gilroy), ${FALLBACK_SANS}`,
    body: `'Gilroy', var(--font-gilroy), ${FALLBACK_SANS}`,
  },
  editorial: {
    label: "Editorial",
    note: "Gala, awards, black tie",
    display: `var(--font-playfair), ${FALLBACK_SERIF}`,
    body: `var(--font-lora), ${FALLBACK_SERIF}`,
  },
  poster: {
    label: "Poster",
    note: "Gig flyer, big and loud",
    display: `var(--font-anton), Impact, ${FALLBACK_SANS}`,
    body: `var(--font-archivo), ${FALLBACK_SANS}`,
  },
  brutal: {
    label: "Brutal",
    note: "Heavy, confident, plain",
    display: `var(--font-archivo-black), ${FALLBACK_SANS}`,
    body: `var(--font-archivo), ${FALLBACK_SANS}`,
  },
  soft: {
    label: "Soft",
    note: "Warm, friendly, human",
    display: `var(--font-fraunces), ${FALLBACK_SERIF}`,
    body: `var(--font-nunito), ${FALLBACK_SANS}`,
  },
  club: {
    label: "Club",
    note: "Underground, technical",
    display: `var(--font-space-mono), ui-monospace, monospace`,
    body: `var(--font-archivo), ${FALLBACK_SANS}`,
  },
  modern: {
    label: "Modern",
    note: "Clean, geometric, neutral",
    display: `var(--font-sora), ${FALLBACK_SANS}`,
    body: `var(--font-sora), ${FALLBACK_SANS}`,
  },
  classic: {
    label: "Classic",
    note: "Bookish and steady",
    display: `var(--font-baskerville), ${FALLBACK_SERIF}`,
    body: `var(--font-baskerville), ${FALLBACK_SERIF}`,
  },
  condensed: {
    label: "Condensed",
    note: "Tall, tight, festival",
    display: `var(--font-bebas), ${FALLBACK_SANS}`,
    body: `var(--font-barlow), ${FALLBACK_SANS}`,
  },
  quirky: {
    label: "Quirky",
    note: "Art show, off centre",
    display: `var(--font-syne), ${FALLBACK_SANS}`,
    body: `var(--font-outfit), ${FALLBACK_SANS}`,
  },
  statement: {
    label: "Statement",
    note: "Sharp serif, modern body",
    display: `var(--font-dm-serif), ${FALLBACK_SERIF}`,
    body: `var(--font-karla), ${FALLBACK_SANS}`,
  },
  humanist: {
    label: "Humanist",
    note: "Rounded and approachable",
    display: `var(--font-outfit), ${FALLBACK_SANS}`,
    body: `var(--font-outfit), ${FALLBACK_SANS}`,
  },
} satisfies Record<string, FontPairing>;

export type FontKey = keyof typeof FONT_PAIRINGS;

export const FONT_LIST = Object.entries(FONT_PAIRINGS).map(([value, pairing]) => ({
  value: value as FontKey,
  label: pairing.label,
  note: pairing.note,
}));

/** Quick picks per preset. A custom colour is always allowed alongside these. */
export const ACCENT_CHOICES: Record<ThemePreset, string[]> = {
  paper: ["#0fb26e", "#e2571f", "#4a8cff", "#b06bff", "#d6336c", "#0d9488"],
  midnight: ["#c9f24d", "#15c67c", "#ff6b4a", "#4a8cff", "#ff4fa3", "#ffd23f"],
  ink: ["#ff6b4a", "#4ad6ff", "#c9f24d", "#ffb84a", "#ff5c8a", "#9d7bff"],
  sun: ["#e2571f", "#0fb26e", "#2b6cb0", "#8b5cf6", "#c2410c", "#be123c"],
  noir: ["#ffffff", "#ffe600", "#ff3b30", "#00e5ff", "#7cff6b", "#ff7ac6"],
  forest: ["#7ee0a8", "#ffd166", "#7fd8ff", "#ff8f6b", "#e0c3fc", "#f4f1de"],
  plum: ["#e3a7ff", "#ffd166", "#6bffb8", "#78c5ff", "#ff7ab8", "#fff1a8"],
  ocean: ["#4fd6e0", "#ffd166", "#a3e635", "#ff8f6b", "#c4b5fd", "#f8fafc"],
  bloom: ["#d6336c", "#7c3aed", "#0d9488", "#ea580c", "#1d4ed8", "#059669"],
  slate: ["#3d5afe", "#0f766e", "#b91c1c", "#7c3aed", "#c2410c", "#0369a1"],
  sand: ["#b45309", "#15803d", "#1d4ed8", "#9d174d", "#4d7c0f", "#7c2d12"],
  mint: ["#0e7c66", "#1d4ed8", "#b45309", "#9d174d", "#6d28d9", "#0f766e"],
};

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

export const normaliseHex = (value: string | undefined | null) => {
  const raw = String(value ?? "").trim();

  if (!HEX.test(raw)) {
    return null;
  }

  const body = raw.replace("#", "");

  return `#${
    body.length === 3
      ? body
          .split("")
          .map((character) => character + character)
          .join("")
      : body
  }`.toLowerCase();
};

/** WCAG relative luminance, so a free-choice accent still gets a readable label. */
const relativeLuminance = (hex: string) => {
  const channels = [1, 3, 5].map((offset) => {
    const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;

    return value <= 0.03928
      ? value / 12.92
      : ((value + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};

export const contrastRatio = (foreground: string, background: string) => {
  const first = relativeLuminance(foreground);
  const second = relativeLuminance(background);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);

  return (lighter + 0.05) / (darker + 0.05);
};

/** Black or white on the given colour, whichever a reader can actually see. */
export const readableOn = (hex: string) =>
  contrastRatio("#16150f", hex) >= contrastRatio("#ffffff", hex)
    ? "#16150f"
    : "#ffffff";

/**
 * Fonts used to be one family each rather than a pairing. A page published
 * under the old names keeps the look it was published with instead of quietly
 * reverting to Gilroy.
 */
const LEGACY_FONTS: Record<string, FontKey> = {
  serif: "classic",
  grotesk: "modern",
};

export const resolveFontKey = (font?: string): FontKey => {
  if (!font) return "gilroy";
  if (font in FONT_PAIRINGS) return font as FontKey;

  return LEGACY_FONTS[font] ?? "gilroy";
};

export const resolveTheme = (theme?: PageTheme): ResolvedTheme => {
  const preset = PRESETS[theme?.preset ?? "paper"] ?? PRESETS.paper;
  const accent = normaliseHex(theme?.accent) ?? preset.colors.accent;
  const pairing = FONT_PAIRINGS[resolveFontKey(theme?.font)];

  return {
    ...preset.colors,
    accent,
    onAccent: readableOn(accent),
    fontStack: pairing.body,
    displayStack: pairing.display,
  };
};
