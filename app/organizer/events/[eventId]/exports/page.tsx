"use client";

import { Eyebrow } from "@/components/organizer/organizer-primitives";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api/error-message";
import { organizerService } from "@/lib/services/organizer.service";
import {
  useCreateEventExport,
  useEventExportPreview,
  useEventExports,
} from "@/lib/hooks/use-organizer";
import {
  type EventExportApi,
  type ExportFormat,
  type ExportKind,
} from "@/lib/types/organizer";
import { Pagination } from "@/components/pagination";
import { cn } from "@/lib/utils";
import { ChevronDown, Download, FileText, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const KINDS: { value: ExportKind; label: string; description: string }[] = [
  {
    value: "attendees",
    label: "Guest list",
    description: "Who is coming, and whether they have been scanned in.",
  },
  {
    value: "tickets",
    label: "Tickets",
    description: "Every ticket issued, with its reference and status.",
  },
  {
    value: "finance",
    label: "Finance",
    description: "What sold, what it earned, and what the fee took.",
  },
];

const FORMATS: ExportFormat[] = ["csv", "json"];

const ExportsPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [kind, setKind] = useState<ExportKind>("attendees");
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const [exportsPage, setExportsPage] = useState(1);
  const exportsQuery = useEventExports(eventId, exportsPage);
  const createExport = useCreateEventExport(eventId);
  const previewQuery = useEventExportPreview(eventId, previewId);

  const build = async () => {
    try {
      const created = await createExport.mutateAsync({ kind, format });
      setPreviewId(created._id);
      toast.success(`Built ${created.fileName}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Couldn't build that export"));
    }
  };

  /**
   * The BFF streams the file back; the browser gets it via a temporary object
   * URL rather than navigating away from the dashboard.
   */
  const download = async (item: EventExportApi) => {
    setDownloadingId(item._id);

    try {
      const blob = await organizerService.downloadExport(eventId, item._id);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = item.fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Couldn't download that file"));
    } finally {
      setDownloadingId(null);
    }
  };

  const exports = exportsQuery.data?.items ?? [];
  const preview = previewQuery.data;

  return (
    <div className="flex flex-col items-stretch gap-3.5 px-4 lg:flex-row lg:items-start py-5 pb-8 sm:px-6 lg:px-8">
      <div className="flex min-w-0 flex-1 flex-col gap-3.5">
        <Card className="gap-0 py-0">
          <div className="px-4 py-3.5 sm:px-5 sm:py-4">
            <div className="text-base leading-snug font-semibold">
              Build an export
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              Pick what your door team, sponsor or accountant actually needs.
            </div>
          </div>
          <hr className="ticket-perforation" />

          <div className="px-5 py-4.5">
            <div className="flex flex-col gap-4 sm:flex-row">
              <label className="flex-1">
                <span className="mb-2 block text-[13px] font-semibold">
                  Who to include
                </span>
                <div className="relative">
                  <select
                    value={kind}
                    onChange={(input) => setKind(input.target.value as ExportKind)}
                    className="h-12 w-full cursor-pointer appearance-none rounded-md border border-border bg-background px-4 pr-10 text-sm text-foreground transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
                  >
                    {KINDS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </label>

              <label className="flex-1">
                <span className="mb-2 block text-[13px] font-semibold">
                  Format
                </span>
                <div className="relative">
                  <select
                    value={format}
                    onChange={(input) =>
                      setFormat(input.target.value as ExportFormat)
                    }
                    className="h-12 w-full cursor-pointer appearance-none rounded-md border border-border bg-background px-4 pr-10 text-sm text-foreground uppercase transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
                  >
                    {FORMATS.map((option) => (
                      <option key={option} value={option}>
                        {option.toUpperCase()}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </label>
            </div>

            <p className="mt-2.5 text-xs text-muted-foreground">
              {KINDS.find((option) => option.value === kind)?.description}
            </p>

            <span className="mt-5 mb-2 block text-[13px] font-semibold">
              Columns
            </span>
            {preview && preview.columns.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {preview.columns.map((column) => (
                  <Badge key={column}>{column}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Vera picks the columns for each kind of export. Build one to see
                exactly what it contains.
              </p>
            )}

            <p className="mt-4 text-xs text-muted-foreground">
              Exports carry personal data. Share them only with people who need
              them.
            </p>
          </div>

          <div className="flex items-center justify-between bg-muted/60 px-4 py-3 sm:px-5 sm:py-3.5">
            <span className="text-xs text-muted-foreground tabular-nums">
              {preview
                ? `${preview.rowCount.toLocaleString("en-NG")} rows · ${preview.columns.length} columns`
                : "Built fresh each time you ask."}
            </span>
            <Button size="sm" onClick={build} loading={createExport.isPending}>
              <FileText className="h-4 w-4" />
              Build export
            </Button>
          </div>
        </Card>

        {previewId ? (
          <Card className="gap-0 py-0">
            <div className="flex items-center justify-between px-4 py-3.5 sm:px-5 sm:py-4">
              <div className="text-base leading-snug font-semibold">Preview</div>
              {preview ? (
                <span className="text-xs font-medium text-muted-foreground tabular-nums">
                  First {preview.previewRows.length} of{" "}
                  {preview.rowCount.toLocaleString("en-NG")}
                </span>
              ) : null}
            </div>
            <hr className="ticket-perforation" />
            <div className="overflow-x-auto px-4 py-3 sm:px-5 sm:py-3.5 pb-4.5">
              {previewQuery.isLoading ? (
                <Skeleton className="h-24 w-full rounded-md" />
              ) : !preview || preview.previewRows.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  This export came back empty.
                </p>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      {preview.columns.map((column) => (
                        <th
                          key={column}
                          className="px-2 py-2.5 text-left text-[11px] font-semibold tracking-[0.06em] whitespace-nowrap uppercase text-muted-foreground"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.previewRows.map((row, index) => (
                      <tr key={index} className="border-b border-border/60 last:border-0">
                        {preview.columns.map((column) => (
                          <td
                            key={column}
                            className="px-2 py-3 text-[13px] whitespace-nowrap"
                          >
                            {String(row[column] ?? "-")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        ) : null}
      </div>

      <Card className="w-full lg:w-[392px] lg:shrink-0 gap-0 py-0">
        <div className="px-4 py-3.5 sm:px-5 sm:py-4">
          <div className="text-base leading-snug font-semibold">
            Recent exports
          </div>
        </div>
        <hr className="ticket-perforation" />
        <div className="px-3 py-1.5 pb-2.5">
          {exportsQuery.isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="my-2 h-12 w-full rounded-md" />
            ))
          ) : exports.length === 0 ? (
            <p className="px-2 py-8 text-center text-[13px] text-muted-foreground">
              Nothing built yet.
            </p>
          ) : (
            exports.map((item) => (
              <div key={item._id} className="flex items-center gap-3 px-2 py-3">
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    item.status === "ready"
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <FileText className="h-[15px] w-[15px]" />
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewId(item._id)}
                  className="min-w-0 flex-1 cursor-pointer text-left"
                >
                  <span className="block truncate text-[13px] font-semibold">
                    {item.fileName}
                  </span>
                  <span className="block text-xs text-muted-foreground tabular-nums">
                    {item.status === "ready"
                      ? `${item.rowCount.toLocaleString("en-NG")} rows`
                      : item.errorMessage || "Failed"}
                  </span>
                </button>
                {item.status === "ready" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 shrink-0 text-xs"
                    onClick={() => download(item)}
                    disabled={downloadingId === item._id}
                  >
                    {downloadingId === item._id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    {item.format.toUpperCase()}
                  </Button>
                ) : null}
              </div>
            ))
          )}
        </div>
        <Pagination
          page={exportsQuery.data?.page ?? 1}
          totalPages={exportsQuery.data?.totalPages ?? 1}
          totalItems={exportsQuery.data?.totalItems ?? 0}
          pageSize={10}
          onPageChange={setExportsPage}
          noun="export"
          className="border-t border-border"
        />
        <div className="bg-muted/60 px-4 py-3 sm:px-5 sm:py-3.5">
          <Eyebrow>Heads up</Eyebrow>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            An export is a snapshot. Build a new one for the latest numbers.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ExportsPage;
