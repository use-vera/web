import EndpointDocBlock from "@/components/developers/endpoint-doc";
import Badge from "@/components/ui/badge";
import CodeBlock from "@/components/ui/code-block";
import {
  ENDPOINTS,
  ENDPOINT_GROUPS,
  ERROR_CODES,
} from "@/lib/developer-docs/endpoints";

const TOC_SECTIONS = [
  { id: "authentication", label: "Authentication" },
  { id: "scopes", label: "Scopes" },
  { id: "errors", label: "Errors" },
];

const AUTH_EXAMPLE = `curl "https://api.vera.dev/v1/events" \\
  -H "Authorization: Bearer sk_live_..."`;

const DevelopersDocsPage = () => {
  return (
    <div className="mx-auto flex max-w-6xl gap-10 px-6 py-16">
      <aside className="hidden w-48 shrink-0 lg:block">
        <nav className="sticky top-8 flex flex-col gap-1 text-sm">
          {TOC_SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="rounded-sm px-2 py-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground font-medium"
            >
              {section.label}
            </a>
          ))}
          {ENDPOINT_GROUPS.map((group) => (
            <div key={group} className="mt-6">
              <p className="px-2 text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
                {group}
              </p>
              {ENDPOINTS.filter((endpoint) => endpoint.group === group).map(
                (endpoint) => (
                  <a
                    key={endpoint.id}
                    href={`#${endpoint.id}`}
                    className="block truncate rounded-sm px-2 py-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground font-medium"
                  >
                    {endpoint.summary}
                  </a>
                ),
              )}
            </div>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">
          Vera API reference.
        </h1>
        <p className="mt-3 max-w-xl text-base text-muted-foreground">
          Everything you need to sell tickets from your own site or app, check
          attendees in, and manage refunds — all over one REST API.
        </p>

        <section
          id="authentication"
          className="scroll-mt-24 border-b border-border py-10"
        >
          <h2 className="text-2xl font-bold text-foreground">Authentication</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Every request needs an <code>Authorization: Bearer</code> header
            with an API key from your{" "}
            <a
              href="/developers/keys"
              className="font-semibold text-foreground underline underline-offset-2"
            >
              API keys
            </a>{" "}
            page.
          </p>
          <div className="mt-4 flex flex-col gap-5 text-sm text-muted-foreground">
            <p>
              <code className="font-semibold text-foreground">pk_live_...</code>{" "}
              publishable keys are safe to use in client-side code. They can
              only call read-only, <code>events:read</code>, scoped endpoints,
              regardless of what scopes are stored on the key.
            </p>
            <p>
              <code className="font-semibold text-foreground">sk_live_...</code>{" "}
              secret keys can call anything their scopes allow. Keep them on
              your server; never ship one in a browser bundle or mobile app.
            </p>
          </div>
          <div className="mt-4">
            <CodeBlock code={AUTH_EXAMPLE} lang="bash" />
          </div>
        </section>

        <section
          id="scopes"
          className="scroll-mt-24 border-b border-border py-10"
        >
          <h2 className="text-2xl font-bold text-foreground">Scopes</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Each key is granted one or more scopes. Requests fail with{" "}
            <code>403 MISSING_SCOPE</code> if the key doesn&apos;t have every
            scope an endpoint requires.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              "events:read",
              "checkout:write",
              "orders:read",
              "tickets:verify",
              "tickets:checkin",
              "refunds:write",
            ].map((scope) => (
              <Badge key={scope} variant="outline">
                {scope}
              </Badge>
            ))}
          </div>
        </section>

        <section
          id="errors"
          className="scroll-mt-24 border-b border-border py-10"
        >
          <h2 className="text-2xl font-bold text-foreground">Errors</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Errors always look like this, <code>error.code</code> is
            machine-readable and stable; <code>error.message</code> is for
            humans and can change.
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

          <div className="mt-6 flex flex-col gap-2">
            {ERROR_CODES.map((entry) => (
              <div
                key={entry.code}
                className="flex items-center gap-3 px-3 py-2"
              >
                <Badge variant="outline" className="shrink-0">
                  {entry.status}
                </Badge>
                <div>
                  <code className="text-xs font-semibold text-foreground">
                    {entry.code}
                  </code>
                  <p className="text-xs text-muted-foreground">
                    {entry.meaning}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {ENDPOINT_GROUPS.map((group) => (
          <div key={group}>
            <h2 className="mt-10 text-2xl font-bold text-foreground">
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
    </div>
  );
};

export default DevelopersDocsPage;
