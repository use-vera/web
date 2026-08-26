"use client";

import { Eyebrow, Meter } from "@/components/organizer/organizer-primitives";
import Button from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { OrganizerField } from "@/components/organizer/organizer-field";
import { getApiErrorMessage } from "@/lib/api/error-message";
import { clockLabel } from "@/lib/event-status";
import {
  useCheckInTicket,
  useEventTickets,
  useOrganizerEvent,
} from "@/lib/hooks/use-organizer";
import { type TicketCheckInResponse } from "@/lib/types/organizer";
import { cn } from "@/lib/utils";
import { Check, ScanLine, TriangleAlert } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

interface ScanEntry {
  id: string;
  name: string;
  tier: string;
  at: string;
  ok: boolean;
  detail?: string;
}

const CheckInPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const router = useRouter();
  const eventQuery = useOrganizerEvent(eventId);
  const event = eventQuery.data?.event;

  const ticketsQuery = useEventTickets(eventId, { limit: 50 });
  const checkIn = useCheckInTicket();

  const [code, setCode] = useState("");
  const [result, setResult] = useState<TicketCheckInResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ScanEntry[]>([]);
  const [admittedDelta, setAdmittedDelta] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  /* A door runs hands-free: the field takes focus on mount so a hardware
     scanner's keystrokes land in it without anyone clicking first. */
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (keyEvent: KeyboardEvent) => {
      if (keyEvent.key === "Escape") {
        router.push(`/organizer/events/${eventId}`);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router, eventId]);

  const baseAdmitted = useMemo(
    () =>
      (ticketsQuery.data?.items ?? []).filter((ticket) => ticket.status === "used")
        .length,
    [ticketsQuery.data],
  );

  const issued = event?.soldTickets ?? 0;
  const admitted = baseAdmitted + admittedDelta;
  const outside = Math.max(0, issued - admitted);
  const percent = issued > 0 ? Math.round((admitted / issued) * 100) : 0;

  const submit = async (event_: React.FormEvent) => {
    event_.preventDefault();

    const trimmed = code.trim();

    if (!trimmed) {
      return;
    }

    setError(null);

    try {
      const response = await checkIn.mutateAsync({ code: trimmed, eventId });

      setResult(response);
      setHistory((current) =>
        [
          {
            id: `${response.ticket._id}-${Date.now()}`,
            name: response.ticket.attendeeName,
            tier: response.ticket.ticketCategoryName || "General",
            at: clockLabel(response.checkedInAt),
            ok: !response.alreadyUsed,
            detail: response.alreadyUsed
              ? `already used at ${clockLabel(response.ticket.usedAt)}`
              : undefined,
          },
          ...current,
        ].slice(0, 6),
      );

      if (!response.alreadyUsed) {
        setAdmittedDelta((current) => current + 1);
      }
    } catch (caught) {
      setError(getApiErrorMessage(caught, "That code didn't scan"));
      setResult(null);
    } finally {
      setCode("");
      inputRef.current?.focus();
    }
  };

  const admittedNow = result && !result.alreadyUsed;

  return (
    <div className="px-8 pt-5.5 pb-8">
      <Card className="mb-3.5 flex-row items-center gap-7 px-5 py-4">
        <div>
          <Eyebrow>Admitted</Eyebrow>
          <div className="mt-0.5 text-[26px] leading-tight font-bold tracking-[-0.02em] tabular-nums">
            {admitted.toLocaleString("en-NG")}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex justify-between text-xs text-muted-foreground tabular-nums">
            <span>{outside.toLocaleString("en-NG")} still outside</span>
            <span>{issued.toLocaleString("en-NG")} issued</span>
          </div>
          <Meter percent={percent} className="h-2" />
        </div>
      </Card>

      <div className="flex items-stretch gap-3.5">
        <div className="flex w-[452px] shrink-0 flex-col gap-3">
          <div className="ticket-dot-texture relative flex h-[300px] items-center justify-center overflow-hidden rounded-sm bg-[#16150f] outline outline-foreground/10 -outline-offset-1">
            <div className="pointer-events-none absolute inset-7">
              <span className="absolute top-0 left-0 h-9 w-9 rounded-tl-lg border-t-2 border-l-2 border-primary" />
              <span className="absolute top-0 right-0 h-9 w-9 rounded-tr-lg border-t-2 border-r-2 border-primary" />
              <span className="absolute bottom-0 left-0 h-9 w-9 rounded-bl-lg border-b-2 border-l-2 border-primary" />
              <span className="absolute right-0 bottom-0 h-9 w-9 rounded-br-lg border-r-2 border-b-2 border-primary" />
            </div>
            <span
              aria-hidden
              className="absolute top-1/2 right-7 left-7 h-0.5 -translate-y-1/2 rounded-sm bg-primary shadow-[0_0_16px_2px_rgba(15,178,110,0.55)]"
            />
            <p className="absolute right-0 bottom-5 left-0 text-center text-xs font-medium text-[#93917f]">
              Hold the QR inside the frame
            </p>
          </div>

          <form onSubmit={submit} className="flex gap-2">
            <OrganizerField
              ref={inputRef}
              value={code}
              onChange={(event_) => setCode(event_.target.value)}
              placeholder="Ticket reference"
              aria-label="Ticket reference"
              autoComplete="off"
              spellCheck={false}
              className="flex-1 font-mono"
            />
            <Button
              type="submit"
              size="sm"
              className="h-12 shrink-0"
              loading={checkIn.isPending}
              disabled={!code.trim()}
            >
              Admit
            </Button>
          </form>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-muted px-1.5 text-[11px] font-semibold text-muted-foreground">
              Enter
            </kbd>
            admit
            <kbd className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-muted px-1.5 text-[11px] font-semibold text-muted-foreground">
              Esc
            </kbd>
            leave door mode
          </div>

          {error ? (
            <p className="flex items-center gap-2 text-[13px] font-semibold text-destructive">
              <TriangleAlert className="h-4 w-4 shrink-0" />
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3.5">
          {result ? (
            <div
              className={cn(
                "rounded-sm px-5.5 pt-5 pb-6.5 outline outline-foreground/10 -outline-offset-1",
                admittedNow ? "bg-accent" : "bg-destructive/12",
              )}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "flex h-6.5 w-6.5 items-center justify-center rounded-full",
                    admittedNow
                      ? "bg-primary text-primary-foreground"
                      : "bg-destructive text-destructive-foreground",
                  )}
                >
                  {admittedNow ? (
                    <Check className="h-[15px] w-[15px]" strokeWidth={3} />
                  ) : (
                    <TriangleAlert className="h-[15px] w-[15px]" />
                  )}
                </span>
                <span
                  className={cn(
                    "text-[17px] font-bold tracking-[-0.01em]",
                    admittedNow ? "text-accent-foreground" : "text-destructive",
                  )}
                >
                  {admittedNow ? "Admitted" : "Already used"}
                </span>
                <span
                  className={cn(
                    "ml-auto text-[13px] font-semibold tabular-nums",
                    admittedNow ? "text-accent-foreground" : "text-destructive",
                  )}
                >
                  {clockLabel(result.checkedInAt ?? result.ticket.usedAt)}
                </span>
              </div>

              {/* The tear: an admitted ticket splits along Vera's perforation,
                  the counterfoil kicked loose from the body. */}
              <div className="mt-4.5 flex items-stretch">
                <div className="min-w-0 flex-1 rounded-l-sm bg-card px-5 py-4.5 outline outline-foreground/10 -outline-offset-1">
                  <Eyebrow>{event?.name}</Eyebrow>
                  <div className="mt-1.5 text-[19px] font-bold tracking-[-0.01em]">
                    {result.ticket.attendeeName}
                  </div>
                  <div className="mt-0.5 text-[13px] text-muted-foreground">
                    {result.ticket.ticketCategoryName || "General"} &middot;{" "}
                    {result.ticket.quantity}{" "}
                    {result.ticket.quantity === 1 ? "ticket" : "tickets"}
                  </div>
                  <div className="mt-4 flex gap-5.5">
                    <div>
                      <Eyebrow className="text-[10px]">Reference</Eyebrow>
                      <div className="mt-0.5 font-mono text-[13px] font-semibold">
                        {result.ticket.ticketCode}
                      </div>
                    </div>
                    <div>
                      <Eyebrow className="text-[10px]">Bought</Eyebrow>
                      <div className="mt-0.5 text-[13px] font-semibold tabular-nums">
                        {new Intl.DateTimeFormat("en-NG", {
                          day: "numeric",
                          month: "short",
                        }).format(
                          new Date(
                            result.ticket.paidAt || result.ticket.createdAt,
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ticket-perforation-vertical relative shrink-0">
                  <span
                    className={cn(
                      "absolute -top-2.5 -left-2.5 h-5 w-5 rounded-full",
                      admittedNow ? "bg-accent" : "bg-destructive/12",
                    )}
                  />
                  <span
                    className={cn(
                      "absolute -bottom-2.5 -left-2.5 h-5 w-5 rounded-full",
                      admittedNow ? "bg-accent" : "bg-destructive/12",
                    )}
                  />
                </div>

                <div
                  className={cn(
                    "w-[186px] shrink-0 origin-left rounded-r-sm bg-card p-4.5 outline outline-foreground/10 -outline-offset-1",
                    "shadow-[0_2px_4px_rgba(22,21,15,0.05),0_12px_32px_rgba(22,21,15,0.10)]",
                    "transition-transform duration-300 ease-out motion-reduce:transform-none",
                    admittedNow
                      ? "translate-x-3.5 translate-y-2.5 rotate-[2.4deg]"
                      : "",
                  )}
                >
                  <Eyebrow className="text-[10px]">
                    {admittedNow ? "Admitted" : "First used"}
                  </Eyebrow>
                  <div className="mt-1 text-sm font-semibold tabular-nums">
                    {clockLabel(result.checkedInAt ?? result.ticket.usedAt)}
                  </div>
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
                  <div className="mt-1.5 text-center font-mono text-[10px] tracking-[0.08em] text-muted-foreground">
                    {result.ticket.ticketCode}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Card className="flex flex-1 items-center justify-center py-14">
              <div className="max-w-xs text-center">
                <ScanLine className="mx-auto h-6 w-6 text-muted-foreground" />
                <p className="mt-3 text-sm font-semibold">Nobody scanned yet</p>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  The ticket you scan shows up here, torn.
                </p>
              </div>
            </Card>
          )}

          <Card className="gap-0 py-0">
            <div className="flex items-center justify-between px-5 py-3.5">
              <span className="text-base leading-snug font-semibold">
                Last through the door
              </span>
              <span className="text-xs font-medium text-muted-foreground tabular-nums">
                {history.length} this session
              </span>
            </div>
            <hr className="ticket-perforation" />
            <div className="px-5 py-1 pb-2">
              {history.length === 0 ? (
                <p className="py-5 text-center text-[13px] text-muted-foreground">
                  Scans from this session appear here.
                </p>
              ) : (
                history.map((entry) => (
                  <div key={entry.id} className="flex items-center gap-3 py-2.5">
                    <span
                      className={cn(
                        "flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-full",
                        entry.ok
                          ? "bg-accent text-accent-foreground"
                          : "bg-destructive text-destructive-foreground",
                      )}
                    >
                      {entry.ok ? (
                        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                      ) : (
                        <TriangleAlert className="h-3.5 w-3.5" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-semibold">
                        {entry.name}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {entry.tier}
                        {entry.detail ? (
                          <>
                            {" "}&middot;{" "}
                            <span className="font-semibold text-destructive">
                              {entry.detail}
                            </span>
                          </>
                        ) : null}
                      </div>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {entry.at}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckInPage;
