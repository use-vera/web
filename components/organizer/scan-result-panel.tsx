"use client";

import { Eyebrow } from "@/components/organizer/organizer-primitives";
import { cn } from "@/lib/utils";
import { Check, TriangleAlert } from "lucide-react";

/**
 * The tear.
 *
 * An admitted ticket splits along the perforation Vera already uses, the stub
 * kicked loose from the body. Both check-in paths render this. The online one
 * from the server's response, the offline one from the local decision, so a
 * door looks the same whether or not it currently has signal. Keeping it in
 * one place is the point: two copies drifted apart the first time.
 */
export const ScanResultPanel = ({
  ok,
  headline,
  headlineTime,
  eventName,
  attendeeName,
  detailLine,
  reference,
  secondaryLabel,
  secondaryValue,
  stubLabel,
  stubTime,
  note,
}: {
  ok: boolean;
  headline: string;
  headlineTime: string;
  eventName?: string;
  attendeeName: string;
  detailLine: string;
  reference?: string;
  /** e.g. "Bought" / "17 Aug". Omitted offline, where it isn't known. */
  secondaryLabel?: string;
  secondaryValue?: string;
  stubLabel: string;
  stubTime: string;
  /** Offline only: says the scan is on this device until the next sync. */
  note?: string;
}) => (
  <div
    className={cn(
      "rounded-sm px-4 pt-5 pb-6.5 outline outline-foreground/10 -outline-offset-1 sm:px-5.5",
      ok ? "bg-accent" : "bg-destructive/12",
    )}
  >
    <div className="flex items-center gap-2.5">
      <span
        className={cn(
          "flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-full",
          ok
            ? "bg-primary text-primary-foreground"
            : "bg-destructive text-destructive-foreground",
        )}
      >
        {ok ? (
          <Check className="h-[15px] w-[15px]" strokeWidth={3} />
        ) : (
          <TriangleAlert className="h-[15px] w-[15px]" />
        )}
      </span>
      <span
        className={cn(
          "text-[17px] font-bold tracking-[-0.01em]",
          ok ? "text-accent-foreground" : "text-destructive",
        )}
      >
        {headline}
      </span>
      <span
        className={cn(
          "ml-auto text-[13px] font-semibold tabular-nums",
          ok ? "text-accent-foreground" : "text-destructive",
        )}
      >
        {headlineTime}
      </span>
    </div>

    <div className="mt-4.5 flex flex-col sm:flex-row sm:items-stretch">
      <div className="min-w-0 flex-1 rounded-t-sm bg-card px-5 py-4.5 outline outline-foreground/10 -outline-offset-1 sm:rounded-l-sm sm:rounded-tr-none">
        {eventName ? <Eyebrow>{eventName}</Eyebrow> : null}
        <div className="mt-1.5 text-[19px] font-bold tracking-[-0.01em]">
          {attendeeName}
        </div>
        <div className="mt-0.5 text-[13px] text-muted-foreground">
          {detailLine}
        </div>
        {reference || secondaryValue ? (
          <div className="mt-4 flex gap-5.5">
            {reference ? (
              <div>
                <Eyebrow className="text-[10px]">Reference</Eyebrow>
                <div className="mt-0.5 font-mono text-[13px] font-semibold">
                  {reference}
                </div>
              </div>
            ) : null}
            {secondaryValue ? (
              <div>
                <Eyebrow className="text-[10px]">{secondaryLabel}</Eyebrow>
                <div className="mt-0.5 text-[13px] font-semibold tabular-nums">
                  {secondaryValue}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* The tear line, with punched notches that follow its axis. */}
      <div className="relative shrink-0">
        <hr className="ticket-perforation sm:hidden" />
        <div className="ticket-perforation-vertical hidden h-full sm:block" />
        <span
          className={cn(
            "absolute -top-2.5 -left-2.5 h-5 w-5 rounded-full",
            ok ? "bg-accent" : "bg-destructive/12",
          )}
        />
        <span
          className={cn(
            "absolute -top-2.5 -right-2.5 h-5 w-5 rounded-full sm:-right-auto sm:-bottom-2.5 sm:-left-2.5 sm:top-auto",
            ok ? "bg-accent" : "bg-destructive/12",
          )}
        />
      </div>

      <div
        className={cn(
          "w-full rounded-b-sm bg-card p-4.5 outline outline-foreground/10 -outline-offset-1",
          "sm:w-[186px] sm:shrink-0 sm:origin-left sm:rounded-r-sm sm:rounded-bl-none",
          "shadow-[0_2px_4px_rgba(22,21,15,0.05),0_12px_32px_rgba(22,21,15,0.10)]",
          "transition-transform duration-300 ease-out motion-reduce:transform-none",
          /* Only a genuine admission tears off. */
          ok ? "sm:translate-x-3.5 sm:translate-y-2.5 sm:rotate-[2.4deg]" : "",
        )}
      >
        <Eyebrow className="text-[10px]">{stubLabel}</Eyebrow>
        <div className="mt-1 text-sm font-semibold tabular-nums">{stubTime}</div>
        <div className="mt-3.5 flex h-9 items-center justify-center gap-[3px] rounded bg-muted px-2.5">
          {Array.from({ length: 22 }).map((_, index) => (
            <span
              key={index}
              className="bg-foreground/55"
              style={{
                width: index % 4 === 0 ? 3 : index % 3 === 0 ? 2 : 1,
                height: 18 + ((index * 7) % 12),
              }}
            />
          ))}
        </div>
        {reference ? (
          <div className="mt-1.5 text-center font-mono text-[10px] tracking-[0.08em] text-muted-foreground">
            {reference}
          </div>
        ) : null}
      </div>
    </div>

    {note ? (
      <p
        className={cn(
          "mt-3.5 text-xs",
          ok ? "text-accent-foreground/85" : "text-muted-foreground",
        )}
      >
        {note}
      </p>
    ) : null}
  </div>
);
