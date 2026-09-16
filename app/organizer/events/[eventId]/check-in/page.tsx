"use client";

import { OrganizerField } from "@/components/organizer/organizer-field";
import { Eyebrow, Meter } from "@/components/organizer/organizer-primitives";
import { QrScanner } from "@/components/organizer/qr-scanner";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getApiErrorMessage } from "@/lib/api/error-message";
import { clockLabel } from "@/lib/event-status";
import { ScanResultPanel } from "@/components/organizer/scan-result-panel";
import { useCheckInConflicts } from "@/lib/hooks/use-door-admin";
import { useDoorMode } from "@/lib/hooks/use-door-mode";
import { type ScanDecision } from "@/lib/checkin/validate";
import {
  useCheckInTicket,
  useEventTickets,
  useOrganizerEvent,
} from "@/lib/hooks/use-organizer";
import { type TicketCheckInResponse } from "@/lib/types/organizer";
import { cn } from "@/lib/utils";
import {
  Check,
  Download,
  ScanLine,
  TriangleAlert,
  WifiOff,
} from "lucide-react";
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
  const [localResult, setLocalResult] = useState<ScanDecision | null>(null);
  const [lane, setLane] = useState("");
  const conflictsQuery = useCheckInConflicts(eventId);
  const door = useDoorMode(eventId, () => void conflictsQuery.refetch());
  const conflicts = conflictsQuery.data?.items ?? [];
  const [admittedDelta, setAdmittedDelta] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

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
      (ticketsQuery.data?.items ?? []).filter(
        (ticket) => ticket.status === "used",
      ).length,
    [ticketsQuery.data],
  );

  const issued = event?.soldTickets ?? 0;
  const admitted = baseAdmitted + admittedDelta;
  const outside = Math.max(0, issued - admitted);
  const percent = issued > 0 ? Math.round((admitted / issued) * 100) : 0;

  const admit = async (raw: string) => {
    const trimmed = raw.trim();

    if (!trimmed) {
      return;
    }

    setError(null);

    /* Offline mode decides locally and queues. No request, no waiting. The
       server re-validates every queued scan when the sync lands. */
    if (door.status === "ready") {
      const decision = await door.scan(trimmed);

      if (decision) {
        const ok = decision.outcome === "admitted";

        setResult(null);
        setLocalResult(decision);
        setHistory((current) =>
          [
            {
              id: `${decision.hash}-${Date.now()}`,
              name: decision.entry?.name ?? "Unknown code",
              tier: decision.entry?.tier ?? "",
              at: clockLabel(decision.scannedAt),
              ok,
              detail: ok ? undefined : decision.message.toLowerCase(),
            },
            ...current,
          ].slice(0, 6),
        );

        if (ok) {
          setAdmittedDelta((current) => current + 1);
        } else {
          setError(decision.message);
        }
      }

      setCode("");
      inputRef.current?.focus();
      return;
    }

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

  const submit = (formEvent: React.FormEvent) => {
    formEvent.preventDefault();
    void admit(code);
  };

  const admittedNow = result && !result.alreadyUsed;

  return (
    <div className="px-4 pt-5 pb-8 sm:px-6 lg:px-8">
      {/* Door mode: prepare while there is signal, then scan with none. */}
      <Card className="mb-3.5 flex-col items-start gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:gap-4 sm:px-5">
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
            door.status === "ready"
              ? "bg-accent text-accent-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          {door.status === "ready" ? (
            <WifiOff className="h-[17px] w-[17px]" />
          ) : (
            <Download className="h-[17px] w-[17px]" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-semibold">
              {door.status === "ready"
                ? "Door mode is on. Scans work with no signal"
                : "Door mode is off"}
            </span>
            {door.status === "ready" ? (
              <>
                <Badge variant={door.online ? "default" : "outline"}>
                  {door.online ? "Online" : "Offline"}
                </Badge>
                {door.meta?.laneLabel ? (
                  <Badge variant="outline">{door.meta.laneLabel}</Badge>
                ) : null}
              </>
            ) : null}
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground tabular-nums">
            {door.status === "ready"
              ? `${door.rosterCount.toLocaleString("en-NG")} tickets held · ${door.pendingCount} waiting to sync${
                  door.syncing ? " · syncing" : ""
                }`
              : "Download the guest list once, then the door keeps working if the network drops."}
          </div>
          {door.error ? (
            <p className="mt-1.5 text-xs font-semibold text-destructive">
              {door.error}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 gap-2">
          {door.status === "ready" ? (
            <Button
              size="sm"
              variant="outline"
              className="h-9 text-xs"
              disabled={!door.online || door.syncing}
              onClick={() => void door.sync()}
            >
              Sync now
            </Button>
          ) : null}
          {door.status !== "ready" ? (
            <OrganizerField
              value={lane}
              onChange={(input) => setLane(input.target.value)}
              placeholder="Door 1"
              aria-label="Name this door"
              className="h-9 w-[110px] text-xs"
              maxLength={60}
            />
          ) : null}
          <Button
            size="sm"
            variant={door.status === "ready" ? "outline" : "default"}
            className="h-9 text-xs"
            loading={door.status === "preparing"}
            disabled={!door.online}
            onClick={() => void door.prepare(lane)}
          >
            {door.status === "ready" ? "Refresh list" : "Turn on door mode"}
          </Button>
        </div>
      </Card>

      {conflicts.length > 0 ? (
        <Card className="mb-3.5 gap-0 py-0">
          <div className="flex items-center justify-between px-4 py-3.5 sm:px-5">
            <div className="flex items-center gap-2.5">
              <TriangleAlert className="h-4 w-4 shrink-0 text-destructive" />
              <span className="text-[13px] font-semibold">
                {conflicts.length === 1
                  ? "1 ticket was scanned at two doors"
                  : `${conflicts.length} tickets were scanned at two doors`}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              Found on sync
            </span>
          </div>
          <hr className="ticket-perforation" />
          <div className="px-4 py-1 pb-2.5 sm:px-5">
            {conflicts.slice(0, 5).map((conflict) => (
              <div
                key={`${conflict.ticketCode}-${conflict.rescannedAt}`}
                className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2.5"
              >
                <span className="text-[13px] font-semibold">
                  {conflict.attendeeName || conflict.ticketCode}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {conflict.ticketCode}
                </span>
                <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                  admitted {conflict.admittedLane ?? "unknown door"}
                  {conflict.admittedAt ? ` ${clockLabel(conflict.admittedAt)}` : ""}
                  {" · "}
                  rescanned {conflict.rescannedLane ?? "unknown door"}{" "}
                  {clockLabel(conflict.rescannedAt)}
                </span>
              </div>
            ))}
            {conflicts.length > 5 ? (
              <p className="py-2 text-xs text-muted-foreground tabular-nums">
                and {conflicts.length - 5} more
              </p>
            ) : null}
          </div>
        </Card>
      ) : null}

      <Card className="mb-3.5 flex-col items-stretch gap-4 px-4 py-4 sm:flex-row sm:items-center sm:gap-7 sm:px-5">
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

      <div className="flex flex-col gap-3.5 lg:flex-row lg:items-stretch">
        <div className="flex w-full lg:w-[452px] lg:shrink-0 flex-col gap-3">
          <QrScanner
            onDetect={(code) => void admit(code)}
            disabled={checkIn.isPending}
          />

          <form onSubmit={submit} className="flex gap-2">
            <OrganizerField
              ref={inputRef}
              value={code}
              onChange={(event_) => setCode(event_.target.value)}
              placeholder="Ticket reference"
              aria-label="Ticket reference"
              autoComplete="off"
              spellCheck={false}
              className="flex-1 font-sans"
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
          {localResult ? (
            <ScanResultPanel
              ok={localResult.outcome === "admitted"}
              headline={
                localResult.outcome === "admitted"
                  ? "Admitted"
                  : localResult.message
              }
              headlineTime={clockLabel(localResult.scannedAt)}
              eventName={event?.name}
              attendeeName={localResult.entry?.name ?? "Unknown ticket"}
              detailLine={
                localResult.entry
                  ? `${localResult.entry.tier}${
                      localResult.entry.seats > 1
                        ? ` · ${localResult.entry.seats} tickets`
                        : ""
                    }`
                  : "Not on this event's guest list"
              }
              reference={localResult.ticketCode}
              secondaryLabel={
                localResult.previouslyAdmittedAt ? "First scanned" : undefined
              }
              secondaryValue={
                localResult.previouslyAdmittedAt
                  ? clockLabel(localResult.previouslyAdmittedAt)
                  : undefined
              }
              stubLabel={
                localResult.outcome === "admitted" ? "Admitted" : "Refused"
              }
              stubTime={clockLabel(localResult.scannedAt)}
              note="Recorded on this device. It reaches the server on the next sync."
            />
          ) : result ? (
            <ScanResultPanel
              ok={Boolean(admittedNow)}
              headline={admittedNow ? "Admitted" : "Already used"}
              headlineTime={clockLabel(
                result.checkedInAt ?? result.ticket.usedAt,
              )}
              eventName={event?.name}
              attendeeName={result.ticket.attendeeName}
              detailLine={`${result.ticket.ticketCategoryName || "General"} · ${
                result.ticket.quantity
              } ${result.ticket.quantity === 1 ? "ticket" : "tickets"}`}
              reference={result.ticket.ticketCode}
              secondaryLabel="Bought"
              secondaryValue={new Intl.DateTimeFormat("en-NG", {
                day: "numeric",
                month: "short",
              }).format(
                new Date(result.ticket.paidAt || result.ticket.createdAt),
              )}
              stubLabel={admittedNow ? "Admitted" : "First used"}
              stubTime={clockLabel(result.checkedInAt ?? result.ticket.usedAt)}
            />
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
            <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5">
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
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 py-2.5"
                  >
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
                            {" "}
                            &middot;{" "}
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
