"use client";

import { BlockInspector } from "@/components/page-builder/block-inspector";
import { BlockOutline } from "@/components/page-builder/block-outline";
import { PageBlocks } from "@/components/page-blocks/blocks";
import { ThemePanel } from "@/components/page-builder/theme-panel";
import { ErrorState } from "@/components/organizer/organizer-primitives";
import Button from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api/error-message";
import {
  useEventPage,
  useSaveEventPage,
  useSetPageStatus,
} from "@/lib/hooks/use-event-page";
import { useOrganizerEvent } from "@/lib/hooks/use-organizer";
import { blockDefinition } from "@/lib/page-blocks-catalog";
import {
  type PageBlock,
  type PageTheme,
  isLockedBlock,
} from "@/lib/types/event-page";
import { cn } from "@/lib/utils";
import { ArrowLeft, Eye, Globe, Monitor, Palette, Smartphone } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type RightPanel = "block" | "theme";

const PageBuilder = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const eventQuery = useOrganizerEvent(eventId);
  const pageQuery = useEventPage(eventId);
  const savePage = useSaveEventPage(eventId);
  const setStatus = useSetPageStatus(eventId);

  const [draftBlocks, setDraftBlocks] = useState<PageBlock[] | null>(null);
  const [draftTheme, setDraftTheme] = useState<PageTheme | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [panel, setPanel] = useState<RightPanel>("block");

  const event = eventQuery.data?.event;
  const stored = pageQuery.data;

  /* Edits layer over what the server holds, so an untouched page picks up a
     refetch and there is no effect copying server state into local state. */
  const blocks = useMemo(
    () => draftBlocks ?? stored?.page?.blocks ?? stored?.starterBlocks ?? [],
    [draftBlocks, stored],
  );
  const theme = draftTheme ?? stored?.page?.theme ?? { preset: "paper" as const };
  const selected = blocks.find((block) => block.id === selectedId) ?? null;

  const updateBlock = (id: string, props: Record<string, unknown>) =>
    setDraftBlocks(
      blocks.map((block) =>
        block.id === id ? { ...block, props: { ...block.props, ...props } } : block,
      ),
    );

  const moveBlock = (from: number, to: number) => {
    if (to < 0 || to >= blocks.length) {
      return;
    }

    const next = [...blocks];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setDraftBlocks(next);
  };

  const removeBlock = (id: string) => {
    const block = blocks.find((item) => item.id === id);

    /* Tickets and the footer are what make a page able to sell and able to
       carry its terms. Movable, restylable, not removable. */
    if (!block || isLockedBlock(block.type)) {
      return;
    }

    setDraftBlocks(blocks.filter((item) => item.id !== id));
    setSelectedId(null);
  };

  const addBlock = (type: PageBlock["type"]) => {
    const definition = blockDefinition(type);

    if (!definition) {
      return;
    }

    const id = `${type}-${Date.now().toString(36)}`;
    /* Before the footer, which always sits last. */
    const footerAt = blocks.findIndex((block) => block.type === "footer");
    const next = [...blocks];
    const at = footerAt === -1 ? next.length : footerAt;

    next.splice(at, 0, { id, type, props: { ...definition.defaults } });
    setDraftBlocks(next);
    setSelectedId(id);
    setPanel("block");
  };

  const save = async () => {
    try {
      await savePage.mutateAsync({ blocks, theme });
      setDraftBlocks(null);
      setDraftTheme(null);
      toast.success("Page saved");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Couldn't save the page"));
    }
  };

  const publish = async () => {
    try {
      await savePage.mutateAsync({ blocks, theme });
      const page = await setStatus.mutateAsync("published");
      setDraftBlocks(null);
      setDraftTheme(null);
      toast.success(`Live at vera.tickets/${page.slug}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Couldn't publish the page"));
    }
  };

  if (eventQuery.isError || pageQuery.isError) {
    return (
      <ErrorState
        message="Couldn't open the page builder for this event."
        onRetry={() => {
          void eventQuery.refetch();
          void pageQuery.refetch();
        }}
      />
    );
  }

  if (!event || pageQuery.isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-[600px] w-full rounded-sm" />
      </div>
    );
  }

  const slug = stored?.page?.slug ?? stored?.suggestedSlug ?? "";
  const isPublished = stored?.page?.status === "published";
  const dirty = draftBlocks !== null || draftTheme !== null;

  return (
    <div className="flex min-h-screen flex-col lg:h-full lg:min-h-0">
      <header className="flex h-14 shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={`/organizer/events/${eventId}`}
            aria-label="Back to event"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-[15px] w-[15px]" />
          </Link>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{event.name}</div>
            <div className="text-[11px] text-muted-foreground">
              Event page · {isPublished ? "published" : "draft"}
              {dirty ? " · unsaved" : ""}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex gap-1 rounded-full bg-muted p-0.5">
            {([["desktop", Monitor], ["mobile", Smartphone]] as const).map(
              ([value, Icon]) => (
                <button
                  key={value}
                  type="button"
                  aria-label={`Preview on ${value}`}
                  aria-pressed={device === value}
                  onClick={() => setDevice(value)}
                  className={cn(
                    "flex h-7 w-9 cursor-pointer items-center justify-center rounded-full transition-colors",
                    device === value
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              ),
            )}
          </div>

          <button
            type="button"
            aria-label="Theme"
            onClick={() => setPanel(panel === "theme" ? "block" : "theme")}
            className={cn(
              "flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border transition-colors",
              panel === "theme"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            <Palette className="h-[15px] w-[15px]" />
          </button>

          {isPublished ? (
            <Link
              href={`/${slug}`}
              target="_blank"
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-semibold transition-colors hover:bg-secondary"
            >
              <Eye className="h-3.5 w-3.5" />
              View
            </Link>
          ) : null}

          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            disabled={!dirty}
            loading={savePage.isPending && !setStatus.isPending}
            onClick={save}
          >
            Save
          </Button>
          <Button
            size="sm"
            className="h-8 text-xs"
            loading={setStatus.isPending}
            onClick={publish}
          >
            <Globe className="h-3.5 w-3.5" />
            {isPublished ? "Update" : "Publish"}
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <BlockOutline
          blocks={blocks}
          selectedId={selectedId}
          slug={slug}
          published={isPublished}
          onSelect={(id) => {
            setSelectedId(id);
            setPanel("block");
          }}
          onMove={moveBlock}
          onAdd={addBlock}
        />

        {/* The preview renders through the same components the published page
            uses, so what an organizer arranges is what ships. */}
        <div className="flex min-h-0 flex-1 items-start justify-center bg-muted p-5 lg:overflow-y-auto lg:p-7">
          <div
            className={cn(
              "w-full overflow-hidden rounded-t-lg shadow-[0_-1px_0_var(--color-border),0_12px_32px_rgba(22,21,15,0.10)] transition-[max-width] duration-300",
              device === "mobile" ? "max-w-[390px]" : "max-w-[860px]",
            )}
          >
            {blocks.map((block) => (
              <button
                key={block.id}
                type="button"
                onClick={() => {
                  setSelectedId(block.id);
                  setPanel("block");
                }}
                className={cn(
                  "relative block w-full cursor-pointer text-left",
                  selectedId === block.id &&
                    "outline-2 -outline-offset-2 outline-primary",
                )}
              >
                {selectedId === block.id ? (
                  <span className="absolute top-0 left-3 z-10 rounded-b-md bg-primary px-2 py-0.5 text-[10px] font-bold tracking-[0.04em] text-primary-foreground uppercase">
                    {blockDefinition(block.type)?.label ?? block.type}
                  </span>
                ) : null}
                <PageBlocks
                  blocks={[block]}
                  event={event}
                  theme={theme}
                  interactive={false}
                />
              </button>
            ))}
          </div>
        </div>

        {panel === "theme" ? (
          <ThemePanel theme={theme} onChange={setDraftTheme} />
        ) : (
          <BlockInspector
            block={selected}
            onChange={updateBlock}
            onRemove={removeBlock}
          />
        )}
      </div>
    </div>
  );
};

export default PageBuilder;
