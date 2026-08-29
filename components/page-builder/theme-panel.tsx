"use client";

import {
  ACCENT_CHOICES,
  FONT_LIST,
  FONT_PAIRINGS,
  PRESET_LIST,
  contrastRatio,
  normaliseHex,
  resolveFontKey,
  resolveTheme,
} from "@/components/page-blocks/theme";
import { type PageTheme } from "@/lib/types/event-page";
import { cn } from "@/lib/utils";
import { Check, Pipette, TriangleAlert } from "lucide-react";
import { useId, useState } from "react";

/** Any accent is allowed; a faint one is flagged rather than silently shipped. */
export const ThemePanel = ({
  theme,
  onChange,
}: {
  theme: PageTheme;
  onChange: (next: PageTheme) => void;
}) => {
  const preset = theme.preset ?? "paper";
  const active = resolveTheme(theme);
  const pickerId = useId();
  const [draft, setDraft] = useState(active.accent);

  const commitHex = (value: string) => {
    setDraft(value);

    const hex = normaliseHex(value);

    if (hex) {
      onChange({ ...theme, accent: hex });
    }
  };

  /* 3:1 is the WCAG floor for a large label or a UI shape. */
  const accentContrast = contrastRatio(active.accent, active.ground);
  const accentIsFaint = accentContrast < 3;

  return (
    <aside className="w-full shrink-0 border-t border-border bg-card lg:min-h-0 lg:w-[300px] lg:overflow-y-auto lg:border-t-0 lg:border-l">
      <div className="border-b border-border px-4 py-3.5">
        <span className="text-[14px] font-bold">Look</span>
        <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
          Pick a ground, an accent and a type pairing. Every combination stays
          readable.
        </p>
      </div>

      <div className="flex flex-col gap-5 p-4">
        <div>
          <span className="mb-2 block text-[12px] font-semibold">Theme</span>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_LIST.map((option) => {
              const swatch = resolveTheme({ preset: option.value });
              const selected = preset === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={selected}
                  title={option.note}
                  onClick={() =>
                    /* The old accent belonged to the old ground. */
                    onChange({ ...theme, preset: option.value, accent: "" })
                  }
                  className={cn(
                    "cursor-pointer overflow-hidden rounded-sm text-left transition-shadow",
                    selected
                      ? "ring-2 ring-primary ring-inset"
                      : "ring-1 ring-foreground/10 ring-inset hover:ring-foreground/25",
                  )}
                >
                  <span
                    className="flex h-[62px] flex-col justify-end gap-1.5 p-2.5"
                    style={{ background: swatch.ground }}
                  >
                    <span
                      className="block h-1.5 w-3/5 rounded-sm"
                      style={{ background: swatch.ink, opacity: 0.9 }}
                    />
                    <span
                      className="block h-1 w-2/5 rounded-sm"
                      style={{ background: swatch.ink, opacity: 0.45 }}
                    />
                    <span
                      className="block h-3 w-9 rounded-full"
                      style={{ background: swatch.accent }}
                    />
                  </span>
                  <span className="flex items-center justify-between px-2.5 py-1.5">
                    <span className="text-[11.5px] font-semibold">
                      {option.label}
                    </span>
                    {selected ? (
                      <Check className="h-3.5 w-3.5 text-primary" strokeWidth={3} />
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <span className="mb-2 block text-[12px] font-semibold">Accent</span>
          <div className="flex flex-wrap gap-2">
            {ACCENT_CHOICES[preset].map((hex) => {
              const selected = active.accent === hex.toLowerCase();

              return (
                <button
                  key={hex}
                  type="button"
                  aria-label={`Accent ${hex}`}
                  aria-pressed={selected}
                  onClick={() => {
                    setDraft(hex);
                    onChange({ ...theme, accent: hex });
                  }}
                  className={cn(
                    "h-7 w-7 cursor-pointer rounded-full transition-transform active:scale-[0.9]",
                    selected
                      ? "ring-2 ring-foreground ring-offset-2 ring-offset-card"
                      : "ring-1 ring-foreground/10 ring-inset",
                  )}
                  style={{ background: hex }}
                />
              );
            })}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <label
              htmlFor={pickerId}
              className="relative flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-sm ring-1 ring-border ring-inset"
              style={{ background: active.accent }}
              title="Pick any colour"
            >
              <Pipette
                className="h-3.5 w-3.5"
                style={{ color: active.onAccent }}
                strokeWidth={2.5}
              />
              <input
                id={pickerId}
                type="color"
                value={active.accent}
                onChange={(input) => commitHex(input.target.value)}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </label>
            <input
              value={draft}
              onChange={(input) => commitHex(input.target.value)}
              onBlur={() => setDraft(active.accent)}
              spellCheck={false}
              aria-label="Accent colour hex"
              placeholder="#0fb26e"
              className="h-9 w-full rounded-sm border border-border bg-background px-3 font-mono text-[12.5px] uppercase outline-none focus:border-primary"
            />
          </div>

          {accentIsFaint ? (
            <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-destructive">
              <TriangleAlert className="mt-px h-3 w-3 shrink-0" />
              This colour is faint on the {preset} ground. Buttons stay readable,
              but accent text will be hard to see.
            </p>
          ) : (
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              Any colour works. Vera picks the label on top of it so buttons stay
              readable.
            </p>
          )}
        </div>

        <div>
          <span className="mb-2 block text-[12px] font-semibold">Type</span>
          <div className="flex flex-col gap-2">
            {FONT_LIST.map((font) => {
              /* An old page may still carry a pre-pairing name. */
              const selected = resolveFontKey(theme.font) === font.value;

              return (
                <button
                  key={font.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onChange({ ...theme, font: font.value })}
                  className={cn(
                    "flex cursor-pointer flex-col gap-0.5 rounded-sm px-3 py-2.5 text-left transition-colors",
                    selected
                      ? "bg-accent ring-2 ring-primary ring-inset"
                      : "ring-1 ring-foreground/10 ring-inset hover:bg-muted/50",
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "text-[15px] leading-tight font-bold",
                        selected && "text-accent-foreground",
                      )}
                      /* Each row is set in the face it offers. */
                      style={{ fontFamily: FONT_PAIRINGS[font.value].display }}
                    >
                      {font.label}
                    </span>
                    {selected ? (
                      <Check
                        className="h-3.5 w-3.5 shrink-0 text-primary"
                        strokeWidth={3}
                      />
                    ) : null}
                  </span>
                  <span
                    className={cn(
                      "text-[11px]",
                      selected
                        ? "text-accent-foreground/75"
                        : "text-muted-foreground",
                    )}
                  >
                    {font.note}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
};
