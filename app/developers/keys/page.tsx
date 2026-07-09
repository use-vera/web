"use client";

import CreateApiKeyDialog from "@/components/developers/create-api-key-dialog";
import RevealSecretDialog from "@/components/developers/reveal-secret-dialog";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
import { cn } from "@/lib/utils";
import { Loader2, MoreHorizontal, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const MODE_STYLES: Record<ApiKeyApi["mode"], string> = {
  test: "bg-muted text-muted-foreground",
  live: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300",
};

const STATUS_STYLES: Record<ApiKeyApi["status"], string> = {
  active:
    "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300",
  revoked: "bg-red-500/10 text-red-700 dark:bg-red-400/10 dark:text-red-300",
};

const formatDate = (value?: string | null) => {
  if (!value) return "Never";
  return new Date(value).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const keyPreview = (key: ApiKeyApi) => `${key.publishableKey.slice(0, 12)}···`;

const ApiKeysPage = () => {
  const { workspace } = useCurrentWorkspace();
  const workspaceId = workspace?._id ?? null;
  const keysQuery = useApiKeys(workspaceId);
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

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="mt-2 text-3xl font-bold text-foreground">
            Keys for {workspace?.name ?? "your workspace"}.
          </h1>
          <p className="mt-2 max-w-lg text-sm text-muted-foreground">
            Secret keys are shown once, at creation. Publishable keys are safe
            to embed in client-side code and can only read events.
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          disabled={!workspaceId}
          className="shrink-0 gap-2"
        >
          <Plus className="h-4 w-4" />
          Create key
        </Button>
      </div>

      <div className="mt-8 overflow-hidden rounded-sm ring-1 ring-foreground/10">
        {keysQuery.isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : keysQuery.data && keysQuery.data.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Scopes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last used</TableHead>
                <TableHead>Created</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {keysQuery.data.map((key) => (
                <TableRow key={key._id}>
                  <TableCell className="font-semibold text-foreground">
                    <div className="flex items-center gap-2 text-sm">
                      {key.label || "Untitled key"}
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-[12px] font-semibold capitalize",
                          MODE_STYLES[key.mode],
                        )}
                      >
                        {key.mode}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm text-muted-foreground">
                      {keyPreview(key)}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-nowrap items-center gap-1">
                      {key.scopes.slice(0, 1).map((scope) => (
                        <Badge
                          key={scope}
                          className="shrink-0 whitespace-nowrap text-xs"
                        >
                          {scope}
                        </Badge>
                      ))}
                      {key.scopes.length > 2 ? (
                        <Badge
                          variant="outline"
                          className="shrink-0 whitespace-nowrap text-xs"
                          title={key.scopes.slice(1).join(", ")}
                        >
                          +{key.scopes.length - 1}
                        </Badge>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-sm font-semibold capitalize",
                        STATUS_STYLES[key.status],
                      )}
                    >
                      {key.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-muted-foreground">
                    {formatDate(key.lastUsedAt)}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-muted-foreground">
                    {formatDate(key.createdAt)}
                  </TableCell>
                  <TableCell>
                    {key.status === "active" ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
                          aria-label="Key actions"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {key.mode === "test" ? (
                            <DropdownMenuItem
                              onClick={() => setUpgradeTarget(key)}
                            >
                              Switch to live
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuItem
                            onClick={() => setRevokeTarget(key)}
                            className="text-destructive"
                          >
                            Revoke
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <p className="text-sm font-semibold text-foreground">
              No API keys yet
            </p>
            <p className="text-sm text-muted-foreground">
              Create one to start calling the Vera API.
            </p>
          </div>
        )}
      </div>

      {workspaceId ? (
        <CreateApiKeyDialog
          open={createOpen}
          workspaceId={workspaceId}
          onOpenChange={setCreateOpen}
          onCreated={setRevealedKey}
        />
      ) : null}

      <RevealSecretDialog
        secretKey={revealedKey?.secretKey ?? null}
        onClose={() => setRevealedKey(null)}
      />

      <Dialog
        open={Boolean(revokeTarget)}
        onOpenChange={(open) => {
          if (!open) setRevokeTarget(null);
        }}
      >
        <DialogContent aria-describedby={undefined} className="max-w-sm">
          <div className="flex flex-col gap-4 p-6 pt-10 text-center">
            <h2 className="text-lg font-bold text-foreground">
              Revoke this key?
            </h2>
            <p className="text-sm text-muted-foreground">
              &quot;{revokeTarget?.label || "This API key"}&quot; will stop
              working immediately. This can&apos;t be undone.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setRevokeTarget(null)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-destructive text-destructive-foreground hover:opacity-90"
                loading={revokeApiKey.isPending}
                onClick={() => void handleRevoke()}
              >
                Revoke
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(upgradeTarget)}
        onOpenChange={(open) => {
          if (!open) setUpgradeTarget(null);
        }}
      >
        <DialogContent aria-describedby={undefined} className="max-w-sm">
          <div className="flex flex-col gap-4 p-6 pt-10 text-center">
            <h2 className="text-lg font-bold text-foreground">
              Switch to live?
            </h2>
            <p className="text-sm text-muted-foreground">
              &quot;{upgradeTarget?.label || "This API key"}&quot; will get a
              new live secret key, and its current test key will stop working
              immediately. You&apos;ll need to update anywhere the old key is
              used.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setUpgradeTarget(null)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                loading={upgradeApiKeyToLive.isPending}
                onClick={() => void handleUpgrade()}
              >
                Switch to live
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApiKeysPage;
