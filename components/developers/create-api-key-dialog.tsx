"use client";

import DevInput from "@/components/developers/dev-input";
import Button from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getApiErrorMessage } from "@/lib/api/error-message";
import { useCreateApiKey } from "@/lib/hooks/use-api-keys";
import {
  ALL_API_KEY_SCOPES,
  API_KEY_SCOPE_DESCRIPTIONS,
  type ApiKeyScope,
  type CreateApiKeyResponse,
} from "@/lib/types/workspace";
import { useState } from "react";
import { toast } from "sonner";

interface CreateApiKeyDialogProps {
  open: boolean;
  workspaceId: string;
  onOpenChange: (open: boolean) => void;
  onCreated: (key: CreateApiKeyResponse) => void;
}

const CreateApiKeyDialog = ({
  open,
  workspaceId,
  onOpenChange,
  onCreated,
}: CreateApiKeyDialogProps) => {
  const [label, setLabel] = useState("");
  const [scopes, setScopes] = useState<ApiKeyScope[]>([]);
  const createApiKey = useCreateApiKey(workspaceId);

  const toggleScope = (scope: ApiKeyScope) => {
    setScopes((current) =>
      current.includes(scope)
        ? current.filter((value) => value !== scope)
        : [...current, scope],
    );
  };

  const reset = () => {
    setLabel("");
    setScopes([]);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (scopes.length === 0) {
      toast.error("Select at least one scope.");
      return;
    }

    try {
      // Every key starts in test mode — switch to live from the API keys
      // page once you're ready to go live.
      const key = await createApiKey.mutateAsync({ label, mode: "test", scopes });
      reset();
      onOpenChange(false);
      onCreated(key);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Couldn't create this API key."));
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent aria-describedby={undefined} className="max-w-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6 pt-10">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Create API key
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Scope it to only what your integration needs.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Label
            </label>
            <DevInput
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="e.g. Production website"
              maxLength={80}
            />
          </div>

          <p className="-mt-2 text-xs text-muted-foreground">
            Every key starts in test mode. Switch it to live from the API
            keys page once you&apos;re ready.
          </p>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Scopes
            </label>
            <div className="flex flex-col gap-2 rounded-sm border border-border p-3">
              {ALL_API_KEY_SCOPES.map((scope) => (
                <label
                  key={scope}
                  className="flex cursor-pointer items-center gap-2.5 rounded-sm py-1.5 px-3 hover:bg-secondary"
                >
                  <input
                    type="checkbox"
                    checked={scopes.includes(scope)}
                    onChange={() => toggleScope(scope)}
                    className="mt-0.5 h-4 w-4 accent-primary"
                  />
                  <span className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">
                      {scope}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {API_KEY_SCOPE_DESCRIPTIONS[scope]}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <Button type="submit" loading={createApiKey.isPending}>
            Create key
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateApiKeyDialog;
