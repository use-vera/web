export interface WorkspaceApi {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  ownerUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMembershipApi {
  _id: string;
  workspaceId: string;
  userId: string;
  role: "owner" | "admin" | "member";
  status: "active" | "invited" | "pending" | "rejected";
  joinedAt: string;
}

/** listWorkspaces() shape — one entry per membership, workspace populated. */
export interface WorkspaceMembershipEntry {
  membership: WorkspaceMembershipApi;
  workspace: WorkspaceApi;
}

export interface CreateWorkspacePayload {
  name: string;
  description?: string;
}

export interface CreateWorkspaceResponse {
  workspace: WorkspaceApi;
  ownerMembership: WorkspaceMembershipApi;
}

export type ApiKeyScope =
  | "events:read"
  | "checkout:write"
  | "orders:read"
  | "tickets:verify"
  | "tickets:checkin"
  | "refunds:write";

export const ALL_API_KEY_SCOPES: ApiKeyScope[] = [
  "events:read",
  "checkout:write",
  "orders:read",
  "tickets:verify",
  "tickets:checkin",
  "refunds:write",
];

export const API_KEY_SCOPE_DESCRIPTIONS: Record<ApiKeyScope, string> = {
  "events:read": "Read published events and ticket types",
  "checkout:write": "Create and read checkout sessions",
  "orders:read": "Read orders (paid, used, and refunded tickets)",
  "tickets:verify": "Verify a ticket's validity without checking it in",
  "tickets:checkin": "Check attendees in at the door",
  "refunds:write": "Issue refunds",
};

export interface ApiKeyApi {
  _id: string;
  workspaceId: string;
  mode: "live" | "test";
  label: string;
  publishableKey: string;
  secretKeyLastFour: string;
  scopes: ApiKeyScope[];
  status: "active" | "revoked";
  createdByUserId: string;
  revokedAt?: string | null;
  lastUsedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApiKeyPayload {
  label?: string;
  mode: "live" | "test";
  scopes: ApiKeyScope[];
}

export interface CreateApiKeyResponse extends ApiKeyApi {
  // Shown exactly once, only on the creation response — never retrievable
  // again after this.
  secretKey: string;
}

export interface UpdateApiKeyPayload {
  label?: string;
  scopes?: ApiKeyScope[];
}
