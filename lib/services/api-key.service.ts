import clientHttp from "@/lib/api/client-http";
import {
  type ApiKeyApi,
  type CreateApiKeyPayload,
  type CreateApiKeyResponse,
  type UpdateApiKeyPayload,
} from "@/lib/types/workspace";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export const apiKeyService = {
  listApiKeys: async (workspaceId: string): Promise<ApiKeyApi[]> => {
    const response = await clientHttp.get<ApiEnvelope<ApiKeyApi[]>>(
      `/workspaces/${workspaceId}/api-keys`,
    );
    return response.data.data;
  },

  createApiKey: async (
    workspaceId: string,
    payload: CreateApiKeyPayload,
  ): Promise<CreateApiKeyResponse> => {
    const response = await clientHttp.post<ApiEnvelope<CreateApiKeyResponse>>(
      `/workspaces/${workspaceId}/api-keys`,
      payload,
    );
    return response.data.data;
  },

  updateApiKey: async (
    workspaceId: string,
    keyId: string,
    payload: UpdateApiKeyPayload,
  ): Promise<ApiKeyApi> => {
    const response = await clientHttp.patch<ApiEnvelope<ApiKeyApi>>(
      `/workspaces/${workspaceId}/api-keys/${keyId}`,
      payload,
    );
    return response.data.data;
  },

  upgradeApiKeyToLive: async (
    workspaceId: string,
    keyId: string,
  ): Promise<CreateApiKeyResponse> => {
    const response = await clientHttp.post<ApiEnvelope<CreateApiKeyResponse>>(
      `/workspaces/${workspaceId}/api-keys/${keyId}/upgrade-to-live`,
    );
    return response.data.data;
  },

  revokeApiKey: async (workspaceId: string, keyId: string): Promise<ApiKeyApi> => {
    const response = await clientHttp.delete<ApiEnvelope<ApiKeyApi>>(
      `/workspaces/${workspaceId}/api-keys/${keyId}`,
    );
    return response.data.data;
  },
};
