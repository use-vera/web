import { useSession } from "@/lib/hooks/use-auth";
import { workspaceService } from "@/lib/services/workspace.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

const WORKSPACES_KEY = ["workspaces", "mine"];

export const useMyWorkspaces = () =>
  useQuery({
    queryKey: WORKSPACES_KEY,
    queryFn: () => workspaceService.listWorkspaces(),
  });

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: workspaceService.createWorkspace,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: WORKSPACES_KEY });
    },
  });
};

/**
 * Resolves "the workspace this session's Developer Portal operates on" —
 * the first workspace the user belongs to, auto-creating one silently if
 * they have none yet (zero-friction onboarding, matching how the mobile
 * wallet row is always visible rather than gated behind an explicit
 * "become an organizer" step).
 */
export const useCurrentWorkspace = () => {
  const sessionQuery = useSession();
  const workspacesQuery = useMyWorkspaces();
  const createWorkspace = useCreateWorkspace();
  const hasTriggeredCreate = useRef(false);

  const user = sessionQuery.data?.user;
  const workspaces = workspacesQuery.data ?? [];
  const hasResolvedEmpty = workspacesQuery.isSuccess && workspaces.length === 0;
  const { mutate: createWorkspaceMutate } = createWorkspace;

  useEffect(() => {
    if (hasResolvedEmpty && user && !hasTriggeredCreate.current) {
      hasTriggeredCreate.current = true;
      createWorkspaceMutate({ name: `${user.fullName}'s Workspace` });
    }
  }, [hasResolvedEmpty, user, createWorkspaceMutate]);

  const isProvisioning = hasResolvedEmpty && (createWorkspace.isPending || createWorkspace.isSuccess);

  return {
    workspace: workspaces[0]?.workspace ?? createWorkspace.data?.workspace ?? null,
    isLoading: sessionQuery.isLoading || workspacesQuery.isLoading || isProvisioning,
    isError: workspacesQuery.isError || createWorkspace.isError,
  };
};
