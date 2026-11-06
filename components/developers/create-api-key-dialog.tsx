"use client";

import DevInput from "@/components/developers/dev-input";
import Button from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { getApiErrorMessage } from "@/lib/api/error-message";
import { useCreateApiKey } from "@/lib/hooks/use-api-keys";
import {
  ALL_API_KEY_SCOPES,
  API_KEY_SCOPE_DESCRIPTIONS,
  type ApiKeyScope,
  type CreateApiKeyResponse,
} from "@/lib/types/workspace";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
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
      // Every key starts in test mode. Switch to live from the API keys
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
      <DialogContent aria-describedby={undefined} className="max-w-lg rounded-[28px] border-[1.5px] border-border bg-background">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 sm:p-7">
          <div className="pr-10">
            <DialogTitle style={{ lineHeight: 0.95 }} className="text-[32px] font-extrabold tracking-[-0.045em]">
              new <span className="text-primary">key.</span>
            </DialogTitle>
            <p className="mt-2 text-[15px] text-muted-foreground">Scope it to only what your integration needs. Every key starts in test mode.</p>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-bold">Label</span>
            <DevInput value={label} onChange={(event) => setLabel(event.target.value)} placeholder="e.g. Production website" maxLength={80} />
          </label>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-bold">Scopes</legend>
            <div className="flex flex-col gap-2">
              {ALL_API_KEY_SCOPES.map((scope) => {
                const checked = scopes.includes(scope);
                return (
                  <label
                    key={scope}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-[18px] border-[1.5px] px-4 py-3 transition-colors",
                      checked ? "border-foreground" : "border-border hover:border-foreground/40",
                    )}
                  >
                    <input type="checkbox" checked={checked} onChange={() => toggleScope(scope)} className="sr-only" />
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-[1.5px]",
                        checked ? "border-foreground bg-foreground text-background" : "border-border",
                      )}
                    >
                      {checked ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="font-mono text-[13px] font-bold">{scope}</span>
                      <span className="text-[13px] text-muted-foreground">{API_KEY_SCOPE_DESCRIPTIONS[scope]}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <Button type="submit" variant="ink" loading={createApiKey.isPending}>
            Create key
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateApiKeyDialog;
