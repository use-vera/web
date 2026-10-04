import AskAiButtons from "@/components/developers/ask-ai-buttons";
import DocsRail from "@/components/developers/docs-rail";
import EndpointDocBlock from "@/components/developers/endpoint-doc";
import Badge from "@/components/ui/badge";
import CodeBlock from "@/components/ui/code-block";
import {
  ENDPOINTS,
  ENDPOINT_GROUPS,
  ERROR_CODES,
} from "@/lib/developer-docs/endpoints";
import { ROUTES } from "@/lib/utils";
import Link from "next/link";

export const metadata = {
  title: "Vera API reference",
  description:
    "Every Vera API endpoint, with its parameters, scopes and example responses.",
};

const AUTH_EXAMPLE = `curl "https://api.vera.dev/v1/events" \\
  -H "Authorization: Bearer sk_live_..."`;

/* Handed to an assistant alongside the page URL. The reference itself is
   generated from the endpoint catalogue, so this summarises the rules that
   are not visible in any single endpoint's row. */
const REFERENCE_SUMMARY = `The Vera API reference. Base URL https://api.vera.dev/v1.
Every request sends "Authorization: Bearer <key>". pk_ keys are read-only (events:read) no matter what scopes they hold; sk_ keys are server-side only.
Success responses are {success: true, data, meta?}. Errors are {success: false, error: {code, message, details?}}.
Lists take page (default 1) and limit (default 20, max 100).
Endpoints:
${ENDPOINTS.map((endpoint) => `${endpoint.method} ${endpoint.path} — ${endpoint.summary} (scope: ${endpoint.scope})`).join("\n")}`;

/* The page's own landmarks, so the rail works the same here as on a guide.
   The endpoint groups each get an anchor below. */
const API_HEADINGS = [
  { id: "base-url", label: "Base URL" },
  { id: "authentication", label: "Authentication" },
  { id: "scopes", label: "Scopes" },
  { id: "errors", label: "Errors" },
  ...ENDPOINT_GROUPS.map((group) => ({
    id: group.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    label: group,
  })),
];

const DevelopersApiPage = () => (
  <div className="mx-auto flex max-w-6xl gap-12 px-6 py-14 sm:px-10">
    <div className="min-w-0 flex-1">
    <header className="flex flex-col gap-3 border-b border-border pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Badge variant="outline" className="w-fit">
          API reference
        </Badge>
        <AskAiButtons
          title="Vera API reference"
          path={ROUTES.DEVELOPERS_API}
          plainText={REFERENCE_SUMMARY}
        />
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        API reference.
      </h1>
      <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
        Every endpoint, with the parameters it takes, the scope it needs and
        what it sends back. If you are starting from scratch, the{" "}
        <Link
          href={`${ROUTES.DEVELOPERS_DOCS}/quickstart`}
          className="font-semibold text-foreground underline underline-offset-2"
        >
          quickstart
        </Link>{" "}
        gets you a working call first.
      </p>
    </header>

    <section className="border-b border-border py-10">
      <h2 id="base-url" className="scroll-mt-24 text-xl font-bold text-foreground">Base URL</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        One host serves both test and live. Your API key decides which
        environment a request runs against, so going live is a key swap and
        nothing else.
      </p>
      <div className="mt-4">
        <CodeBlock code="https://api.vera.dev/v1" lang="text" />
      </div>
    </section>

    <section className="border-b border-border py-10">
      <h2 id="authentication" className="scroll-mt-24 text-xl font-bold text-foreground">Authentication</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Send your key as a bearer token on every request. Keys come from the{" "}
        <Link
          href={ROUTES.DEVELOPERS_KEYS}
          className="font-semibold text-foreground underline underline-offset-2"
        >
          API keys
        </Link>{" "}
        page.
      </p>
      <div className="mt-4">
        <CodeBlock code={AUTH_EXAMPLE} lang="bash" />
      </div>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        <code className="font-semibold text-foreground">pk_</code> keys are safe
        in client-side code and can only read events, whatever scopes they were
        given. <code className="font-semibold text-foreground">sk_</code> keys
        can do anything their scopes allow and belong on your server only. The{" "}
        <Link
          href={`${ROUTES.DEVELOPERS_DOCS}/authentication`}
          className="font-semibold text-foreground underline underline-offset-2"
        >
          authentication guide
        </Link>{" "}
        covers both in full.
      </p>
    </section>

    <section className="border-b border-border py-10">
      <h2 id="scopes" className="scroll-mt-24 text-xl font-bold text-foreground">Scopes</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Each endpoint below lists the one scope it requires. A key without it
        gets <code>403 MISSING_SCOPE</code> before any work happens.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {[...new Set(ENDPOINTS.map((endpoint) => endpoint.scope))].map(
          (scope) => (
            <Badge key={scope} variant="outline">
              {scope}
            </Badge>
          ),
        )}
      </div>
    </section>

    <section className="border-b border-border py-10">
      <h2 id="errors" className="scroll-mt-24 text-xl font-bold text-foreground">Errors</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Every failure uses one shape. <code>error.code</code> is stable and safe
        to branch on; <code>error.message</code> is for people and can change.
      </p>
      <div className="mt-4">
        <CodeBlock
          code={JSON.stringify(
            {
              success: false,
              error: { code: "NOT_FOUND", message: "Order not found" },
            },
            null,
            2,
          )}
          lang="json"
        />
      </div>

      <div className="mt-6 flex flex-col gap-1">
        {ERROR_CODES.map((entry) => (
          <div key={entry.code} className="flex items-center gap-3 px-1 py-2">
            <Badge variant="outline" className="shrink-0">
              {entry.status}
            </Badge>
            <div>
              <code className="text-xs font-semibold text-foreground">
                {entry.code}
              </code>
              <p className="text-xs text-muted-foreground">{entry.meaning}</p>
            </div>
          </div>
        ))}
      </div>
    </section>

    {ENDPOINT_GROUPS.map((group) => (
      <div key={group}>
        <h2
          id={group.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
          className="mt-12 scroll-mt-24 text-2xl font-bold text-foreground"
        >
          {group}
        </h2>
        {ENDPOINTS.filter((endpoint) => endpoint.group === group).map(
          (endpoint) => (
            <EndpointDocBlock key={endpoint.id} endpoint={endpoint} />
          ),
        )}
      </div>
    ))}
    </div>

    <DocsRail headings={API_HEADINGS} />
  </div>
);

export default DevelopersApiPage;
