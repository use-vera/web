"use client";

import { POSTER_TONES, type PosterTone } from "@/components/vera/event-poster";
import { cn } from "@/lib/utils";
import { ArrowLeft, Search, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { type ReactNode } from "react";

/*
 * The organizer's kit. Same voice as the public site: bold lowercase
 * headings ending in a full stop, flat poster colours for the numbers that
 * matter, outlined panels on the page colour (never an off-white card), and
 * ink/outline pills for filters.
 */

/** The dashed tear line, kept for the ticket-and-stub moments. */
export const Perforation = ({ className }: { className?: string }) => <hr className={cn("ticket-perforation", className)} />;

export const PerforationY = ({ className }: { className?: string }) => <div className={cn("ticket-perforation-vertical shrink-0", className)} />;

/** A small label above a value. Sentence case, no tracking. */
export const Eyebrow = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span className={cn("text-[13px] font-semibold text-muted-foreground", className)}>{children}</span>
);

/** Page padding inside the desk. Every organizer page sits in this. */
export { DESK } from "@/components/organizer/desk";

interface PageHeaderProps {
  /** Lowercase lead, e.g. "your". */
  lead?: string;
  /** The last words, in green, ending in a full stop: "events." */
  accent: string;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
  className?: string;
}

/** The heading every organizer page opens with. */
export const PageHeader = ({ lead, accent, description, actions, back, className }: PageHeaderProps) => (
  <header className={cn("flex flex-col gap-4 pt-[clamp(20px,3vw,40px)] pb-[clamp(20px,2.4vw,32px)]", className)}>
    {back ? (
      <Link
        href={back.href}
        className="inline-flex h-9 w-fit items-center gap-1.5 rounded-full border-[1.5px] border-border px-3.5 text-[13px] font-semibold transition-colors hover:border-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {back.label}
      </Link>
    ) : null}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
      <div className="flex min-w-0 flex-col gap-2.5">
        <h1 style={{ lineHeight: 0.95 }} className="text-[clamp(38px,5vw,64px)] font-extrabold tracking-[-0.045em] text-foreground">
          {lead ? `${lead} ` : null}
          <span className="text-primary">{accent}</span>
        </h1>
        {description ? <p className="max-w-xl text-[15px] text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2 sm:shrink-0">{actions}</div> : null}
    </div>
  </header>
);

/** An outlined section on the page colour. */
export const Panel = ({ children, className }: { children: ReactNode; className?: string }) => (
  <section className={cn("min-w-0 overflow-hidden rounded-[28px] border-[1.5px] border-border", className)}>{children}</section>
);

/** A panel's title row: bold title, a quiet line under it, an action on the right. */
export const PanelHeader = ({ title, description, action, className }: { title: ReactNode; description?: ReactNode; action?: ReactNode; className?: string }) => (
  <div className={cn("flex items-start justify-between gap-4 px-5 pt-5 pb-4 sm:px-6", className)}>
    <div className="min-w-0">
      <h2 className="text-[17px] leading-snug font-bold tracking-[-0.01em]">{title}</h2>
      {description ? <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p> : null}
    </div>
    {action ? <div className="shrink-0">{action}</div> : null}
  </div>
);

/** Column headings: sentence case, quiet, no tracking. */
export const TABLE_HEAD = "py-3.5 text-[13px] font-semibold tracking-normal normal-case text-muted-foreground";

interface FilterPillsProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
}

/** The site's filter pills: ink when on, an outline when off. Scrolls sideways on a phone. */
export const FilterPills = <T extends string>({ options, value, onChange, label, className }: FilterPillsProps<T>) => (
  <div role="group" aria-label={label} className={cn("flex gap-2 overflow-x-auto", NO_SCROLLBAR, className)}>
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        aria-pressed={value === option.value}
        onClick={() => onChange(option.value)}
        className={cn(
          "flex h-10 shrink-0 cursor-pointer items-center rounded-full border-[1.5px] px-4 text-sm font-semibold whitespace-nowrap transition-colors",
          value === option.value ? "border-foreground bg-foreground text-background" : "border-border text-foreground hover:border-foreground",
        )}
      >
        {option.label}
      </button>
    ))}
  </div>
);

/** A pill search box. */
export const SearchField = ({ className, ...props }: React.ComponentProps<"input">) => (
  <label
    className={cn(
      "flex h-12 items-center gap-2.5 rounded-full border-[1.5px] border-border px-4 transition-colors focus-within:border-foreground",
      className,
    )}
  >
    <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
    <input type="search" className="h-full w-full min-w-0 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground" {...props} />
  </label>
);

const STAT_TONES: PosterTone[] = ["green", "yellow", "blue", "pink"];

interface StatCellProps {
  label: string;
  value: ReactNode;
  note?: ReactNode;
  tone?: PosterTone;
}

/** One headline number on a flat poster colour. */
export const StatCell = ({ label, value, note, tone = "cream" }: StatCellProps) => {
  const colours = POSTER_TONES[tone];
  return (
    <div
      className={cn("flex min-w-0 flex-col gap-1 rounded-[24px] p-[clamp(16px,1.6vw,22px)]", tone === "cream" && "ring-1 ring-border ring-inset")}
      style={{ backgroundColor: colours.bg, color: colours.fg }}
    >
      <span className="text-[13px] font-semibold opacity-75">{label}</span>
      <span style={{ lineHeight: 1.05 }} className="truncate text-[clamp(24px,2.4vw,34px)] font-extrabold tracking-[-0.035em] tabular-nums">
        {value}
      </span>
      {note ? <span className="truncate text-[13px] font-semibold opacity-70">{note}</span> : null}
    </div>
  );
};

/** A row of headline numbers, each on its own colour. Two across on a phone, four on a desk. */
export const StatStrip = ({ cells }: { cells: { label: string; value: ReactNode; note?: ReactNode; tone?: PosterTone }[] }) => (
  <div className={cn("grid grid-cols-2 gap-2.5 sm:gap-3", cells.length === 3 ? "sm:grid-cols-3" : "lg:grid-cols-4")}>
    {cells.map((cell, index) => (
      <StatCell key={cell.label} {...cell} tone={cell.tone ?? STAT_TONES[index % STAT_TONES.length]} />
    ))}
  </div>
);

export const Meter = ({ percent, className }: { percent: number; className?: string }) => (
  <div className={cn("h-2 overflow-hidden rounded-full bg-foreground/10", className)}>
    <div
      className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
      style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
    />
  </div>
);

export const EmptyState = ({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) => (
  <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-foreground text-background">{icon}</div>
    <h2 className="text-xl font-extrabold tracking-[-0.02em] lowercase">{title.endsWith(".") ? title : `${title}.`}</h2>
    <p className="max-w-sm text-sm text-pretty text-muted-foreground">{description}</p>
    {action ? <div className="mt-2">{action}</div> : null}
  </div>
);

export const ErrorState = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
    <p className="max-w-sm text-[15px] text-muted-foreground">{message}</p>
    {onRetry ? (
      <button
        type="button"
        onClick={onRetry}
        className="flex h-10 cursor-pointer items-center rounded-full border-[1.5px] border-foreground px-4 text-sm font-semibold transition-colors hover:bg-foreground/5"
      >
        Try again
      </button>
    ) : null}
  </div>
);

/** Inline problem text for one field. Renders nothing when there is none. */
export const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <p className="mt-1.5 flex items-start gap-1.5 text-[13px] font-medium text-destructive">
      <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      {message}
    </p>
  ) : null;

/** A summary of everything still wrong on this step. */
export const IssueSummary = ({ messages }: { messages: string[] }) =>
  messages.length === 0 ? null : (
    <div className="mb-6 rounded-[22px] p-4 sm:p-5" style={{ backgroundColor: POSTER_TONES.pink.bg, color: POSTER_TONES.pink.fg }}>
      <p className="flex items-center gap-2 text-sm font-bold">
        <TriangleAlert className="h-4 w-4 shrink-0" />
        {messages.length === 1 ? "One thing to fix before continuing" : `${messages.length} things to fix before continuing`}
      </p>
      <ul className="mt-2 flex flex-col gap-1 pl-6">
        {messages.map((message) => (
          <li key={message} className="list-disc text-[13px] leading-relaxed font-medium">
            {message}
          </li>
        ))}
      </ul>
    </div>
  );

export const Switch = ({ checked, onChange, label }: { checked: boolean; onChange: (next: boolean) => void; label: string }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={cn(
      "relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
      checked ? "bg-foreground" : "bg-foreground/15",
    )}
  >
    <span
      className={cn(
        "absolute top-1 h-5 w-5 rounded-full transition-[left,background-color]",
        checked ? "left-6 bg-primary" : "left-1 bg-background",
      )}
    />
  </button>
);

export const SectionLabel = ({ children, hint }: { children: ReactNode; hint?: string }) => (
  <div className="mb-2">
    <span className="block text-sm font-bold">{children}</span>
    {hint ? <span className="mt-0.5 block text-[13px] text-muted-foreground">{hint}</span> : null}
  </div>
);

/** For the shared Card where a page still uses it: the panel look, no off-white fill. */
export const PANEL = "rounded-[28px] border-[1.5px] border-border bg-transparent shadow-none ring-0";

/** The organizer's select box, drawn like its text fields. */
export const SELECT_FIELD =
  "h-12 w-full cursor-pointer appearance-none rounded-2xl border-[1.5px] border-border bg-transparent px-4 pr-10 text-[15px] text-foreground transition-colors focus-visible:border-foreground focus-visible:outline-none";

/** A solid button sitting on a poster colour: ink on the light tones, paper on the ink one, so it never melts into its panel. */
export const solidOnTone = (tone: PosterTone): React.CSSProperties =>
  tone === "ink" ? { backgroundColor: POSTER_TONES.cream.bg, color: POSTER_TONES.cream.fg } : { backgroundColor: "#16150F", color: "#F5F3EF" };

/** For rows that scroll sideways on a phone: no scrollbar strip under the pills. */
export const NO_SCROLLBAR = "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
