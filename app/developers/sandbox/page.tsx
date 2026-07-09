"use client";

import DevInput from "@/components/developers/dev-input";
import MethodBadge from "@/components/developers/method-badge";
import ResponseViewer, {
  type SandboxResponse,
} from "@/components/developers/response-viewer";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import CodeEditor from "@/components/ui/code-editor";
import {
  ENDPOINTS,
  ENDPOINT_GROUPS,
  type EndpointDoc,
} from "@/lib/developer-docs/endpoints";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const SANDBOX_KEY_STORAGE = "vera_sandbox_api_key";

const readStoredApiKey = () => {
  if (typeof window === "undefined") {
    return "";
  }

  return window.sessionStorage.getItem(SANDBOX_KEY_STORAGE) || "";
};

const buildDefaultValues = (endpoint: EndpointDoc) => {
  const pathValues: Record<string, string> = {};
  for (const param of endpoint.pathParams ?? []) {
    pathValues[param.name] = String(param.example ?? "");
  }

  const queryValues: Record<string, string> = {};
  for (const param of endpoint.queryParams ?? []) {
    if (param.example !== undefined) {
      queryValues[param.name] = String(param.example);
    }
  }

  const bodyText = endpoint.exampleRequestBody
    ? JSON.stringify(endpoint.exampleRequestBody, null, 2)
    : "";

  return { pathValues, queryValues, bodyText };
};

interface SandboxRequestPanelProps {
  endpoint: EndpointDoc;
  apiKey: string;
}

/**
 * Owns everything that needs to reset when the selected endpoint changes
 * (form values, in-flight/response state) — mounted with key={endpoint.id}
 * by the parent so switching endpoints reinitializes via lazy useState
 * initializers instead of an effect that resets state.
 */
const SandboxRequestPanel = ({
  endpoint,
  apiKey,
}: SandboxRequestPanelProps) => {
  const defaults = buildDefaultValues(endpoint);
  const [pathValues, setPathValues] = useState(defaults.pathValues);
  const [queryValues, setQueryValues] = useState(defaults.queryValues);
  const [bodyText, setBodyText] = useState(defaults.bodyText);
  const [activeExampleNote, setActiveExampleNote] = useState<string | null>(
    null,
  );
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [response, setResponse] = useState<SandboxResponse | null>(null);

  const handleSend = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_DEV_PLATFORM_API_URL;

    if (!baseUrl) {
      setSendError(
        "NEXT_PUBLIC_DEV_PLATFORM_API_URL isn't configured for this deployment.",
      );
      return;
    }

    if (!apiKey.trim()) {
      setSendError("Paste an API key first.");
      return;
    }

    let path = endpoint.path;
    for (const param of endpoint.pathParams ?? []) {
      path = path.replace(
        `:${param.name}`,
        encodeURIComponent(pathValues[param.name] ?? ""),
      );
    }

    const query = new URLSearchParams();
    for (const param of endpoint.queryParams ?? []) {
      const value = queryValues[param.name];
      if (value) {
        query.set(param.name, value);
      }
    }
    const qs = query.toString();

    setSending(true);
    setSendError(null);
    setResponse(null);

    const startedAt = performance.now();

    try {
      const res = await fetch(`${baseUrl}${path}${qs ? `?${qs}` : ""}`, {
        method: endpoint.method,
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          ...(endpoint.bodyParams
            ? { "Content-Type": "application/json" }
            : {}),
        },
        body: endpoint.bodyParams ? bodyText : undefined,
      });
      const durationMs = Math.round(performance.now() - startedAt);
      const body = await res.json().catch(() => null);
      setResponse({ status: res.status, ok: res.ok, durationMs, body });
    } catch {
      setSendError(
        "The request failed to send — check the API base URL and that the backend is reachable.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div className="min-w-0 flex flex-col gap-5">
        <div className="flex items-center gap-2 flex-wrap">
          <MethodBadge method={endpoint.method} />
          <code className="text-sm font-semibold text-foreground">
            {endpoint.path}
          </code>
          <Badge variant="outline">{endpoint.scope}</Badge>
        </div>

        {endpoint.pathParams?.length ? (
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Path parameters
            </p>
            {endpoint.pathParams.map((param) => (
              <div key={param.name} className="flex flex-col gap-1.5">
                <label
                  htmlFor={`path-${param.name}`}
                  className="flex items-baseline gap-1.5 font-mono text-xs font-semibold text-foreground"
                >
                  {param.name}
                  <span className="font-sans text-[11px] font-normal text-muted-foreground">
                    {param.type}
                    {param.required ? "" : " · optional"}
                  </span>
                </label>
                <DevInput
                  id={`path-${param.name}`}
                  value={pathValues[param.name] ?? ""}
                  onChange={(event) =>
                    setPathValues((current) => ({
                      ...current,
                      [param.name]: event.target.value,
                    }))
                  }
                  placeholder={param.description}
                />
              </div>
            ))}
          </div>
        ) : null}

        {endpoint.queryParams?.length ? (
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Query parameters
            </p>
            {endpoint.queryParams.map((param) => (
              <div key={param.name} className="flex flex-col gap-1.5">
                <label
                  htmlFor={`query-${param.name}`}
                  className="flex items-baseline gap-1.5 font-mono text-xs font-semibold text-foreground"
                >
                  {param.name}
                  <span className="font-sans text-[11px] font-normal text-muted-foreground">
                    {param.type}
                    {param.required ? "" : " · optional"}
                  </span>
                </label>
                <DevInput
                  id={`query-${param.name}`}
                  value={queryValues[param.name] ?? ""}
                  onChange={(event) =>
                    setQueryValues((current) => ({
                      ...current,
                      [param.name]: event.target.value,
                    }))
                  }
                  placeholder={param.description}
                />
              </div>
            ))}
          </div>
        ) : null}

        {endpoint.bodyParams?.length ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Body (JSON)
              </p>
              {endpoint.bodyExamples?.length ? (
                <div className="flex flex-wrap items-center gap-1.5">
                  {endpoint.bodyExamples.map((example) => (
                    <button
                      key={example.label}
                      type="button"
                      onClick={() => {
                        setBodyText(JSON.stringify(example.body, null, 2));
                        setActiveExampleNote(example.note ?? null);
                      }}
                      className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground flex items-center justify-center"
                    >
                      {example.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            {activeExampleNote ? (
              <p className="text-xs text-muted-foreground">
                {activeExampleNote}
              </p>
            ) : null}
            <CodeEditor value={bodyText} onChange={setBodyText} lang="json" />
          </div>
        ) : null}

        {sendError ? (
          <p className="text-sm text-destructive">{sendError}</p>
        ) : null}

        <Button
          onClick={() => void handleSend()}
          loading={sending}
          className="w-fit"
        >
          Send request
        </Button>
      </div>

      <div className="min-w-0">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Response
        </p>
        <ResponseViewer response={response} />
      </div>
    </>
  );
};

const SandboxPage = () => {
  const [apiKey, setApiKey] = useState(readStoredApiKey);
  const [selectedId, setSelectedId] = useState(ENDPOINTS[0].id);
  const endpoint =
    ENDPOINTS.find((item) => item.id === selectedId) ?? ENDPOINTS[0];

  useEffect(() => {
    if (apiKey) {
      window.sessionStorage.setItem(SANDBOX_KEY_STORAGE, apiKey);
    }
  }, [apiKey]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">
        Test the API live.
      </h1>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground">
        Requests here go straight from your browser to the real Vera API using
        the key you paste in, nothing is sent to or stored by Vera beyond this
        page&apos;s session.
      </p>

      <div className="mt-6 flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          API key
        </label>
        <DevInput
          value={apiKey}
          onChange={(event) => setApiKey(event.target.value)}
          placeholder="pk_live_... or sk_live_..."
          className="max-w-md font-mono text-xs"
        />
      </div>

      <div className="mt-15 grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr_1fr]">
        <div className="flex flex-col gap-8">
          {ENDPOINT_GROUPS.map((group) => (
            <div key={group}>
              <p className="mb-5 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group}
              </p>
              <div className="flex flex-col gap-2">
                {ENDPOINTS.filter((item) => item.group === group).map(
                  (item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className={cn(
                        "flex items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm font-medium font-sans",
                        item.id === selectedId
                          ? "bg-secondary text-foreground"
                          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                      )}
                    >
                      <MethodBadge method={item.method} />
                      <span className="truncate">{item.summary}</span>
                    </button>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>

        <SandboxRequestPanel
          key={endpoint.id}
          endpoint={endpoint}
          apiKey={apiKey}
        />
      </div>
    </div>
  );
};

export default SandboxPage;
