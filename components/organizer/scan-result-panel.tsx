"use client";

import { Eyebrow } from "@/components/organizer/organizer-primitives";
import { POSTER_TONES } from "@/components/vera/event-poster";
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
    className="rounded-[28px] px-4 pt-5 pb-6.5 sm:px-5.5"
    style={{ backgroundColor: ok ? POSTER_TONES.green.bg : POSTER_TONES.pink.bg, color: ok ? POSTER_TONES.green.fg : POSTER_TONES.pink.fg }}
  >
    <div className="flex items-center gap-2.5">
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-current"
      >
        {ok ? (
          <Check className="h-4 w-4 text-[#15C67C]" strokeWidth={3} />
        ) : (
          <TriangleAlert className="h-4 w-4 text-[#F0B9C7]" />
        )}
      </span>
      <span
        className="text-[22px] font-extrabold tracking-[-0.03em]"
      >
        {headline}
      </span>
      <span
        className="ml-auto text-sm font-bold tabular-nums opacity-75"
      >
        {headlineTime}
      </span>
    </div>

    <div className="mt-4.5 flex flex-col sm:flex-row sm:items-stretch">
      <div className="min-w-0 flex-1 rounded-t-[20px] bg-[#F5F3EF] px-5 py-4.5 text-[#16150F] sm:rounded-l-[20px] sm:rounded-tr-none">
        {eventName ? <Eyebrow className="text-[#16150F]/55">{eventName}</Eyebrow> : null}
        <div className="mt-1 text-[22px] font-extrabold tracking-[-0.025em]">
          {attendeeName}
        </div>
        <div className="mt-0.5 text-sm text-[#16150F]/65">
          {detailLine}
        </div>
        {reference || secondaryValue ? (
          <div className="mt-4 flex gap-5.5">
            {reference ? (
              <div>
                <Eyebrow className="text-xs text-[#16150F]/55">Reference</Eyebrow>
                <div className="mt-0.5 font-mono text-[13px] font-semibold">
                  {reference}
                </div>
              </div>
            ) : null}
            {secondaryValue ? (
              <div>
                <Eyebrow className="text-xs text-[#16150F]/55">{secondaryLabel}</Eyebrow>
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
          className="absolute -top-2.5 -left-2.5 h-5 w-5 rounded-full"
          style={{ backgroundColor: ok ? POSTER_TONES.green.bg : POSTER_TONES.pink.bg }}
        />
        <span
          className="absolute -top-2.5 -right-2.5 h-5 w-5 rounded-full sm:-right-auto sm:-bottom-2.5 sm:-left-2.5 sm:top-auto"
          style={{ backgroundColor: ok ? POSTER_TONES.green.bg : POSTER_TONES.pink.bg }}
        />
      </div>

      <div
        className={cn(
          "w-full rounded-b-[20px] bg-[#F5F3EF] p-4.5 text-[#16150F]",
          "sm:w-[186px] sm:shrink-0 sm:origin-left sm:rounded-r-[20px] sm:rounded-bl-none",
          "transition-transform duration-300 ease-out motion-reduce:transform-none",
          /* Only a genuine admission tears off. */
          ok ? "sm:translate-x-3.5 sm:translate-y-2.5 sm:rotate-[2.4deg]" : "",
        )}
      >
        <Eyebrow className="text-xs text-[#16150F]/55">{stubLabel}</Eyebrow>
        <div className="mt-1 text-base font-extrabold tabular-nums">{stubTime}</div>
        <div className="mt-3.5 flex h-9 items-center justify-center gap-[3px] rounded-lg bg-[#16150F]/8 px-2.5">
          {Array.from({ length: 22 }).map((_, index) => (
            <span
              key={index}
              className="bg-[#16150F]/60"
              style={{
                width: index % 4 === 0 ? 3 : index % 3 === 0 ? 2 : 1,
                height: 18 + ((index * 7) % 12),
              }}
            />
          ))}
        </div>
        {reference ? (
          <div className="mt-1.5 text-center font-mono text-[10px] text-[#16150F]/55">
            {reference}
          </div>
        ) : null}
      </div>
    </div>

    {note ? (
      <p
        className="mt-3.5 text-[13px] font-semibold opacity-75"
      >
        {note}
      </p>
    ) : null}
  </div>
);
