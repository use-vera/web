"use client";

import CreateApiKeyDialog from "@/components/developers/create-api-key-dialog";
import CopyField from "@/components/developers/copy-field";
import SignedInGate from "@/components/developers/signed-in-gate";
import RevealSecretDialog from "@/components/developers/reveal-secret-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DESK, EmptyState, ErrorState, PageHeader, Panel, StatStrip, TABLE_HEAD } from "@/components/organizer/organizer-primitives";
import Button from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { POSTER_TONES } from "@/components/vera/event-poster";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getApiErrorMessage } from "@/lib/api/error-message";
import {
  useApiKeys,
  useRevokeApiKey,
  useUpgradeApiKeyToLive,
} from "@/lib/hooks/use-api-keys";
import { useCurrentWorkspace } from "@/lib/hooks/use-workspace";
import {
  type ApiKeyApi,
  type CreateApiKeyResponse,
} from "@/lib/types/workspace";
import { Pagination } from "@/components/pagination";
import { cn } from "@/lib/utils";
import { Key, MoreHorizontal, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const KEYS_PER_PAGE = 10;

const formatDate = (value?: string | null) => {
  if (!value) return "Never";
  return new Date(value).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/* The layout no longer gates the whole portal, so this page carries its own
   sign-in requirement: it is the only one that needs an account. */
const ApiKeysPage = () => (
  <SignedInGate>
    <ApiKeysWorkspace />
  </SignedInGate>
);

const ApiKeysWorkspace = () => {
  const { workspace } = useCurrentWorkspace();
  const workspaceId = workspace?._id ?? null;
  const keysQuery = useApiKeys(workspaceId);
  const [page, setPage] = useState(1);

  /* The API returns every key for the workspace in one array, so paging is
     done here rather than with a page parameter. */
  const allKeys = keysQuery.data ?? [];
  const visibleKeys = allKeys.slice(
    (page - 1) * KEYS_PER_PAGE,
    page * KEYS_PER_PAGE,
  );
  const revokeApiKey = useRevokeApiKey(workspaceId);
  const upgradeApiKeyToLive = useUpgradeApiKeyToLive(workspaceId);

  const [createOpen, setCreateOpen] = useState(false);
  const [revealedKey, setRevealedKey] = useState<CreateApiKeyResponse | null>(
    null,
  );
  const [revokeTarget, setRevokeTarget] = useState<ApiKeyApi | null>(null);
  const [upgradeTarget, setUpgradeTarget] = useState<ApiKeyApi | null>(null);

  const handleRevoke = async () => {
    if (!revokeTarget) return;

    try {
      await revokeApiKey.mutateAsync(revokeTarget._id);
      toast.success(`Revoked "${revokeTarget.label || "API key"}"`);
      setRevokeTarget(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Couldn't revoke this key."));
    }
  };

  const handleUpgrade = async () => {
    if (!upgradeTarget) return;

    try {
      const upgraded = await upgradeApiKeyToLive.mutateAsync(upgradeTarget._id);
      setUpgradeTarget(null);
      setRevealedKey(upgraded);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Couldn't switch this key to live."),
      );
    }
  };

  const activeKeys = allKeys.filter((key) => key.status === "active");

  return (
    <div className={DESK}>
      <PageHeader
        lead="your api"
        accent="keys."
        description={
          <>
            For {workspace?.name ?? "your workspace"}. Secret keys are shown once, when you create them. Publishable keys are safe in client-side code
            and can only read events.
          </>
        }
        actions={
          <Button variant="ink" onClick={() => setCreateOpen(true)} disabled={!workspaceId}>
            <Plus className="h-4 w-4" />
            Create key
          </Button>
        }
      />

      {keysQuery.isLoading ? (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-[108px] rounded-[24px]" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-[28px]" />
        </div>
      ) : keysQuery.isError ? (
        <Panel>
          <ErrorState message="Couldn't load your keys." onRetry={() => keysQuery.refetch()} />
        </Panel>
      ) : allKeys.length > 0 ? (
        <div className="flex flex-col gap-4">
          <StatStrip
            cells={[
              { label: "Active", value: activeKeys.length.toLocaleString("en-NG"), note: "working right now" },
              { label: "Live", value: activeKeys.filter((key) => key.mode === "live").length.toLocaleString("en-NG"), note: "move real money" },
              { label: "Test", value: activeKeys.filter((key) => key.mode === "test").length.toLocaleString("en-NG"), note: "safe to play with" },
            ]}
          />

          <Panel>
            <Table>
              <TableHeader>
                <TableRow className="border-b-[1.5px] border-border hover:bg-transparent">
                  <TableHead className={cn(TABLE_HEAD, "pl-5 sm:pl-6")}>Label</TableHead>
                  <TableHead className={TABLE_HEAD}>Publishable key</TableHead>
                  <TableHead className={TABLE_HEAD}>Scopes</TableHead>
                  <TableHead className={TABLE_HEAD}>Status</TableHead>
                  <TableHead className={TABLE_HEAD}>Last used</TableHead>
                  <TableHead className={TABLE_HEAD}>Created</TableHead>
                  <TableHead className={cn(TABLE_HEAD, "pr-5 sm:pr-6")}>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleKeys.map((key) => {
                  const mode = POSTER_TONES[key.mode === "live" ? "green" : "yellow"];
                  const revoked = key.status === "revoked";
                  return (
                    <TableRow key={key._id} className={cn("border-b-[1.5px] border-border", revoked && "opacity-60")}>
                      <TableCell className="py-4 pl-5 sm:pl-6">
                        <div className="flex items-center gap-2 text-[15px] font-bold whitespace-nowrap">
                          {key.label || "Untitled key"}
                          <span className="rounded-full px-2 py-0.5 text-xs font-bold capitalize" style={{ backgroundColor: mode.bg, color: mode.fg }}>
                            {key.mode}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-4">
                        <CopyField value={key.publishableKey} label="publishable key" className="max-w-[300px] min-w-[220px]" />
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-nowrap items-center gap-1">
                          {key.scopes.slice(0, 1).map((scope) => (
                            <span key={scope} className="rounded-full border-[1.5px] border-border px-2.5 py-0.5 font-mono text-xs font-semibold whitespace-nowrap">
                              {scope}
                            </span>
                          ))}
                          {key.scopes.length > 1 ? (
                            <span
                              className="rounded-full bg-secondary px-2 py-0.5 text-xs font-bold whitespace-nowrap"
                              title={key.scopes.slice(1).join(", ")}
                            >
                              +{key.scopes.length - 1}
                            </span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="flex items-center gap-1.5 text-sm font-semibold whitespace-nowrap">
                          <span className={cn("h-2 w-2 rounded-full", revoked ? "bg-destructive" : "bg-primary")} />
                          {revoked ? "Revoked" : "Active"}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 text-sm whitespace-nowrap text-muted-foreground">{formatDate(key.lastUsedAt)}</TableCell>
                      <TableCell className="py-4 text-sm whitespace-nowrap text-muted-foreground">{formatDate(key.createdAt)}</TableCell>
                      <TableCell className="py-4 pr-5 sm:pr-6">
                        {key.status === "active" ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                              aria-label={`Actions for ${key.label || "this key"}`}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {key.mode === "test" ? <DropdownMenuItem onClick={() => setUpgradeTarget(key)}>Switch to live</DropdownMenuItem> : null}
                              <DropdownMenuItem onClick={() => setRevokeTarget(key)} className="text-destructive">
                                Revoke
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <Pagination
              page={page}
              totalPages={Math.max(1, Math.ceil(allKeys.length / KEYS_PER_PAGE))}
              totalItems={allKeys.length}
              pageSize={KEYS_PER_PAGE}
              onPageChange={setPage}
              noun="key"
            />
          </Panel>
        </div>
      ) : (
        <Panel>
          <EmptyState
            icon={<Key className="h-6 w-6" />}
            title="no api keys yet"
            description="Create a test key to start calling the Vera API. Switch it to live when you're ready."
            action={
              <Button variant="ink" size="sm" onClick={() => setCreateOpen(true)} disabled={!workspaceId}>
                <Plus className="h-4 w-4" />
                Create your first key
              </Button>
            }
          />
        </Panel>
      )}

      {workspaceId ? <CreateApiKeyDialog open={createOpen} workspaceId={workspaceId} onOpenChange={setCreateOpen} onCreated={setRevealedKey} /> : null}

      <RevealSecretDialog createdKey={revealedKey} onClose={() => setRevealedKey(null)} />

      <ConfirmDialog
        open={Boolean(revokeTarget)}
        onOpenChange={(open) => {
          if (!open) setRevokeTarget(null);
        }}
        title="Revoke this key?"
        description={<>&quot;{revokeTarget?.label || "This API key"}&quot; will stop working immediately. This can&apos;t be undone.</>}
        confirmLabel="Revoke key"
        cancelLabel="Keep it"
        loading={revokeApiKey.isPending}
        onConfirm={() => void handleRevoke()}
      />

      <ConfirmDialog
        open={Boolean(upgradeTarget)}
        onOpenChange={(open) => {
          if (!open) setUpgradeTarget(null);
        }}
        title="Switch to live?"
        description={
          <>
            &quot;{upgradeTarget?.label || "This API key"}&quot; will get a new live secret key, and its current test key will stop working immediately.
            You&apos;ll need to update anywhere the old key is used.
          </>
        }
        confirmLabel="Switch to live"
        cancelLabel="Not yet"
        loading={upgradeApiKeyToLive.isPending}
        onConfirm={() => void handleUpgrade()}
      />
    </div>
  );
};

export default ApiKeysPage;
