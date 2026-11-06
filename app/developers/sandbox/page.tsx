"use client";

import DevInput from "@/components/developers/dev-input";
import MethodBadge from "@/components/developers/method-badge";
import ResponseViewer, {
  type SandboxResponse,
} from "@/components/developers/response-viewer";
import { DESK, PageHeader } from "@/components/organizer/organizer-primitives";
import Button, { buttonVariants } from "@/components/ui/button";
import { POSTER_TONES } from "@/components/vera/event-poster";
import CodeEditor from "@/components/ui/code-editor";
import {
  ENDPOINTS,
  ENDPOINT_GROUPS,
  type EndpointDoc,
} from "@/lib/developer-docs/endpoints";
import { cn, ROUTES } from "@/lib/utils";
import { PlayCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const INLINE_LINK = "font-semibold text-foreground underline underline-offset-2";

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
 * (form values, in-flight/response state). Mounted with key={endpoint.id}
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
        "The request failed to send. Check the API base URL and that the backend is reachable.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-2">
      <div className="flex min-w-0 flex-col gap-5 rounded-[28px] border-[1.5px] border-border p-5 sm:p-6">
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <MethodBadge method={endpoint.method} />
            <span className="rounded-full border-[1.5px] border-border px-2.5 py-0.5 font-mono text-xs font-semibold text-muted-foreground">{endpoint.scope}</span>
          </div>
          <h2 className="text-[22px] leading-tight font-extrabold tracking-[-0.03em]">{endpoint.summary}</h2>
          <code className="font-mono text-[13px] font-semibold break-all text-muted-foreground">{endpoint.path}</code>
        </div>

        {endpoint.pathParams?.length ? (
          <div className="flex flex-col gap-4">
            <p className="text-[13px] font-bold">
              Path parameters
            </p>
            {endpoint.pathParams.map((param) => (
              <div key={param.name} className="flex flex-col gap-1.5">
                <label
                  htmlFor={`path-${param.name}`}
                  className="flex items-baseline gap-1.5 font-mono text-[13px] font-bold text-foreground"
                >
                  {param.name}
                  <span className="font-sans text-xs font-medium text-muted-foreground">
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
            <p className="text-[13px] font-bold">
              Query parameters
            </p>
            {endpoint.queryParams.map((param) => (
              <div key={param.name} className="flex flex-col gap-1.5">
                <label
                  htmlFor={`query-${param.name}`}
                  className="flex items-baseline gap-1.5 font-mono text-[13px] font-bold text-foreground"
                >
                  {param.name}
                  <span className="font-sans text-xs font-medium text-muted-foreground">
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
            <div className="flex flex-col gap-2">
              <p className="text-[13px] font-bold">
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
                      className="flex h-8 cursor-pointer items-center justify-center rounded-full border-[1.5px] border-border px-3 text-xs font-semibold transition-colors hover:border-foreground"
                    >
                      {example.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            {activeExampleNote ? (
              <p className="text-[13px] text-muted-foreground">
                {activeExampleNote}
              </p>
            ) : null}
            <CodeEditor value={bodyText} onChange={setBodyText} lang="json" />
          </div>
        ) : null}

        {sendError ? (
          <p
            className="rounded-[18px] p-3.5 text-[13px] font-semibold"
            style={{ backgroundColor: POSTER_TONES.pink.bg, color: POSTER_TONES.pink.fg }}
          >
            {sendError}
          </p>
        ) : null}

        <Button
          variant="ink"
          onClick={() => void handleSend()}
          loading={sending}
          className="w-fit"
        >
          Send request
        </Button>
      </div>

      <div className="min-w-0">
        <p className="mb-2 text-[13px] font-bold">Response</p>
        <ResponseViewer response={response} />
      </div>
    </div>
  );
};

const SandboxWorkbench = () => {
  const [apiKey, setApiKey] = useState(readStoredApiKey);

  /* "Try it" in the API reference links here with the endpoint it sat next
     to, so arriving from the docs lands on the right form rather than on
     whichever endpoint happens to be first. */
  const requestedId = useSearchParams().get("endpoint");
  const [selectedId, setSelectedId] = useState(
    () =>
      ENDPOINTS.find((item) => item.id === requestedId)?.id ?? ENDPOINTS[0].id,
  );
  const endpoint =
    ENDPOINTS.find((item) => item.id === selectedId) ?? ENDPOINTS[0];

  useEffect(() => {
    if (apiKey) {
      window.sessionStorage.setItem(SANDBOX_KEY_STORAGE, apiKey);
    }
  }, [apiKey]);

  return (
    <div className={DESK}>
      <PageHeader
        lead="try the"
        accent="api."
        description={
          <>
            Requests go straight from your browser to the real Vera API with the key you paste in. No key yet? Create a test one on the{" "}
            <Link href={ROUTES.DEVELOPERS_KEYS} className={INLINE_LINK}>
              API keys
            </Link>{" "}
            page, or read the{" "}
            <Link href={`${ROUTES.DEVELOPERS_DOCS}/quickstart`} className={INLINE_LINK}>
              quickstart
            </Link>{" "}
            first.
          </>
        }
        actions={
          <a href={ROUTES.DEVELOPERS_DEMO} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "line", size: "sm" })}>
            <PlayCircle className="h-4 w-4" />
            Demo app
          </a>
        }
      />

      <div
        className="flex flex-col gap-3 rounded-[28px] p-5 sm:flex-row sm:items-center sm:gap-5 sm:p-6"
        style={{ backgroundColor: POSTER_TONES.yellow.bg, color: POSTER_TONES.yellow.fg }}
      >
        <label htmlFor="sandbox-key" className="flex shrink-0 flex-col gap-0.5 sm:w-56">
          <span className="text-[15px] font-bold">Your API key</span>
          <span className="text-[13px] font-medium opacity-75">Kept in this tab only, never sent to Vera&apos;s web servers.</span>
        </label>
        <input
          id="sandbox-key"
          value={apiKey}
          onChange={(event) => setApiKey(event.target.value)}
          placeholder="pk_test_... or sk_test_..."
          autoComplete="off"
          spellCheck={false}
          className="h-12 w-full min-w-0 rounded-2xl border-[1.5px] border-current/30 bg-transparent px-4 font-mono text-[13px] outline-none placeholder:text-current placeholder:opacity-50 focus-visible:border-current"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <nav aria-label="Endpoints" className="flex flex-col gap-6 lg:sticky lg:top-6 lg:self-start">
          {ENDPOINT_GROUPS.map((group) => (
            <div key={group} className="flex flex-col gap-1">
              <p className="mb-1 px-3 text-[13px] font-bold">{group}</p>
              {ENDPOINTS.filter((item) => item.group === group).map((item) => {
                const active = item.id === selectedId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSelectedId(item.id)}
                    className={cn(
                      "flex min-h-10 cursor-pointer items-center gap-2.5 rounded-full px-2 py-1.5 text-left text-[13px] font-semibold transition-colors",
                      active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    <MethodBadge method={item.method} size="sm" />
                    <span className="min-w-0 truncate">{item.summary}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <SandboxRequestPanel key={endpoint.id} endpoint={endpoint} apiKey={apiKey} />
      </div>
    </div>
  );
};

/* useSearchParams opts its subtree out of server rendering, so it needs a
   Suspense boundary. The cost lands on a console that does nothing without
   JavaScript anyway — unlike the guides, which must arrive as HTML. */
const SandboxPage = () => (
  <Suspense fallback={null}>
    <SandboxWorkbench />
  </Suspense>
);

export default SandboxPage;
