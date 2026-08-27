"use client";

import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

/**
 * The dashed tear line Vera already uses as the developer portal's sidebar
 * divider (.ticket-perforation / -vertical in globals.css). It is the
 * structural device across organizer surfaces: it separates an event from its
 * sales stub, a ticket from its counterfoil.
 */
export const Perforation = ({ className }: { className?: string }) => (
  <hr className={cn("ticket-perforation", className)} />
);

export const PerforationY = ({ className }: { className?: string }) => (
  <div className={cn("ticket-perforation-vertical shrink-0", className)} />
);

export const Eyebrow = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <span
    className={cn(
      "text-[11px] font-semibold tracking-[0.08em] uppercase text-muted-foreground/70",
      className,
    )}
  >
    {children}
  </span>
);

export const StatCell = ({
  label,
  value,
  note,
}: {
  label: string;
  value: ReactNode;
  note?: ReactNode;
}) => (
  <div className="flex-1 px-5 py-[18px]">
    <Eyebrow>{label}</Eyebrow>
    <div className="mt-[5px] text-2xl font-bold tracking-[-0.02em] tabular-nums">
      {value}
    </div>
    {note ? (
      <div className="mt-[3px] text-xs text-muted-foreground">{note}</div>
    ) : null}
  </div>
);

/**
 * A row of headline numbers. Four cells across is unreadable on a phone, so
 * below lg it becomes a two-column grid with hairline dividers and the
 * perforations only appear once the cells sit side by side.
 */
export const StatStrip = ({
  cells,
}: {
  cells: { label: string; value: ReactNode; note?: ReactNode }[];
}) => (
  <div className="grid grid-cols-2 overflow-hidden rounded-sm bg-card shadow-[inset_0_0_0_1px_var(--hairline)] lg:flex lg:items-stretch">
    {cells.map((cell, index) => (
      <div
        key={cell.label}
        className={cn(
          "flex-1 px-4 py-4 sm:px-5 sm:py-[18px]",
          /* Grid gutters on mobile; the tear line takes over at lg. */
          index % 2 === 0 && "border-r border-border lg:border-r-0",
          index < cells.length - 2 && "border-b border-border lg:border-b-0",
          index > 0 &&
            "lg:bg-[repeating-linear-gradient(to_bottom,var(--border)_0,var(--border)_8px,transparent_8px,transparent_16px)] lg:bg-[length:1px_100%] lg:bg-left lg:bg-no-repeat lg:pl-5",
        )}
      >
        <Eyebrow>{cell.label}</Eyebrow>
        <div className="mt-[5px] text-xl font-bold tracking-[-0.02em] tabular-nums sm:text-2xl">
          {cell.value}
        </div>
        {cell.note ? (
          <div className="mt-[3px] text-xs text-muted-foreground">{cell.note}</div>
        ) : null}
      </div>
    ))}
  </div>
);

export const Meter = ({
  percent,
  className,
}: {
  percent: number;
  className?: string;
}) => (
  <div className={cn("h-1 overflow-hidden rounded-full bg-muted", className)}>
    <div
      className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
      style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
    />
  </div>
);

export const EmptyState = ({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-primary">
      {icon}
    </div>
    <h2 className="text-base font-semibold">{title}</h2>
    <p className="max-w-sm text-sm text-muted-foreground text-pretty">
      {description}
    </p>
    {action ? <div className="mt-2">{action}</div> : null}
  </div>
);

export const ErrorState = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) => (
  <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
    <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
    {onRetry ? (
      <button
        type="button"
        onClick={onRetry}
        className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
      >
        Try again
      </button>
    ) : null}
  </div>
);

export const Switch = ({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={cn(
      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
      checked ? "bg-primary" : "bg-border",
    )}
  >
    <span
      className={cn(
        "absolute top-0.5 h-4 w-4 rounded-full bg-card shadow-sm transition-[left]",
        checked ? "left-[18px]" : "left-0.5",
      )}
    />
  </button>
);

export const SectionLabel = ({
  children,
  hint,
}: {
  children: ReactNode;
  hint?: string;
}) => (
  <div className="mb-2">
    <span className="block text-[13px] font-semibold">{children}</span>
    {hint ? (
      <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>
    ) : null}
  </div>
);
