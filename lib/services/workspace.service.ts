import clientHttp from "@/lib/api/client-http";
import {
  type CreateWorkspacePayload,
  type CreateWorkspaceResponse,
  type WorkspaceMembershipEntry,
} from "@/lib/types/workspace";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export const workspaceService = {
  listWorkspaces: async (): Promise<WorkspaceMembershipEntry[]> => {
    const response =
      await clientHttp.get<ApiEnvelope<WorkspaceMembershipEntry[]>>("/workspaces");
    return response.data.data;
  },

  createWorkspace: async (
    payload: CreateWorkspacePayload,
  ): Promise<CreateWorkspaceResponse> => {
    const response = await clientHttp.post<ApiEnvelope<CreateWorkspaceResponse>>(
      "/workspaces",
      payload,
    );
    return response.data.data;
  },
};
