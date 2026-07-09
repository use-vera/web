import { apiKeyService } from "@/lib/services/api-key.service";
import { type UpdateApiKeyPayload } from "@/lib/types/workspace";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const apiKeysKey = (workspaceId: string) => ["workspaces", workspaceId, "api-keys"];

export const useApiKeys = (workspaceId: string | null | undefined) =>
  useQuery({
    queryKey: apiKeysKey(workspaceId || ""),
    queryFn: () => apiKeyService.listApiKeys(workspaceId as string),
    enabled: Boolean(workspaceId),
  });

export const useCreateApiKey = (workspaceId: string | null | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof apiKeyService.createApiKey>[1]) =>
      apiKeyService.createApiKey(workspaceId as string, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: apiKeysKey(workspaceId || "") });
    },
  });
};

export const useUpdateApiKey = (workspaceId: string | null | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ keyId, payload }: { keyId: string; payload: UpdateApiKeyPayload }) =>
      apiKeyService.updateApiKey(workspaceId as string, keyId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: apiKeysKey(workspaceId || "") });
    },
  });
};

export const useUpgradeApiKeyToLive = (workspaceId: string | null | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (keyId: string) =>
      apiKeyService.upgradeApiKeyToLive(workspaceId as string, keyId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: apiKeysKey(workspaceId || "") });
    },
  });
};

export const useRevokeApiKey = (workspaceId: string | null | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (keyId: string) => apiKeyService.revokeApiKey(workspaceId as string, keyId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: apiKeysKey(workspaceId || "") });
    },
  });
};
