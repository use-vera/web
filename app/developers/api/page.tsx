import AskAiButtons from "@/components/developers/ask-ai-buttons";
import DocsRail from "@/components/developers/docs-rail";
import EndpointDocBlock from "@/components/developers/endpoint-doc";
import { DESK } from "@/components/organizer/desk";
import { PageHeader } from "@/components/organizer/organizer-primitives";
import CodeBlock from "@/components/ui/code-block";
import {
  ENDPOINTS,
  ENDPOINT_GROUPS,
  ERROR_CODES,
} from "@/lib/developer-docs/endpoints";
import { cn, ROUTES } from "@/lib/utils";
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
const groupId = (group: string) => group.toLowerCase().replace(/[^a-z0-9]+/g, "-");

const API_HEADINGS = [
  { id: "base-url", label: "Base URL" },
  { id: "scopes", label: "Scopes" },
  { id: "authentication", label: "Authentication" },
  { id: "errors", label: "Errors" },
  ...ENDPOINT_GROUPS.map((group) => ({ id: groupId(group), label: group })),
];

const INLINE_LINK = "font-semibold text-foreground underline underline-offset-2";
const CODE = "rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[0.85em] text-foreground";

const IntroSection = ({ id, title, children, className }: { id: string; title: string; children: React.ReactNode; className?: string }) => (
  <section aria-labelledby={id} className={cn("flex min-w-0 flex-col gap-4 rounded-[28px] border-[1.5px] border-border p-5 sm:p-6", className)}>
    <h2 id={id} className="scroll-mt-24 text-[22px] leading-tight font-extrabold tracking-[-0.03em]">
      {title}
    </h2>
    {children}
  </section>
);

const DevelopersApiPage = () => (
  <div className={cn(DESK, "flex gap-12")}>
    <div className="min-w-0 flex-1">
      <PageHeader
        lead="api"
        accent="reference."
        description={
          <>
            Every endpoint, with the parameters it takes, the scope it needs and what it sends back. Starting from scratch? The{" "}
            <Link href={`${ROUTES.DEVELOPERS_DOCS}/quickstart`} className={INLINE_LINK}>
              quickstart
            </Link>{" "}
            gets you a working call first.
          </>
        }
        actions={<AskAiButtons title="Vera API reference" path={ROUTES.DEVELOPERS_API} plainText={REFERENCE_SUMMARY} />}
      />

      <div className="grid gap-3 lg:grid-cols-2">
        <IntroSection id="base-url" title="Base URL">
          <p className="text-[15px] leading-relaxed text-muted-foreground">
            One host serves both test and live. Your API key decides which environment a request runs against, so going live is a key swap and nothing
            else.
          </p>
          <CodeBlock code="https://api.vera.dev/v1" lang="text" />
        </IntroSection>

        <IntroSection id="scopes" title="Scopes">
          <p className="text-[15px] leading-relaxed text-muted-foreground">
            Each endpoint below lists the one scope it requires. A key without it gets <code className={CODE}>403 MISSING_SCOPE</code> before any work
            happens.
          </p>
          <div className="flex flex-wrap gap-2">
            {[...new Set(ENDPOINTS.map((endpoint) => endpoint.scope))].map((scope) => (
              <span key={scope} className="rounded-full border-[1.5px] border-border px-3 py-1 font-mono text-[13px] font-semibold">
                {scope}
              </span>
            ))}
          </div>
        </IntroSection>

        <IntroSection id="authentication" title="Authentication" className="lg:col-span-2">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="flex flex-col gap-3 text-[15px] leading-relaxed text-muted-foreground">
              <p>
                Send your key as a bearer token on every request. Keys come from the{" "}
                <Link href={ROUTES.DEVELOPERS_KEYS} className={INLINE_LINK}>
                  API keys
                </Link>{" "}
                page.
              </p>
              <p>
                <code className={CODE}>pk_</code> keys are safe in client-side code and can only read events, whatever scopes they were given.{" "}
                <code className={CODE}>sk_</code> keys can do anything their scopes allow and belong on your server only. The{" "}
                <Link href={`${ROUTES.DEVELOPERS_DOCS}/authentication`} className={INLINE_LINK}>
                  authentication guide
                </Link>{" "}
                covers both in full.
              </p>
            </div>
            <CodeBlock code={AUTH_EXAMPLE} lang="bash" />
          </div>
        </IntroSection>

        <IntroSection id="errors" title="Errors" className="lg:col-span-2">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <p className="text-[15px] leading-relaxed text-muted-foreground">
                Every failure uses one shape. <code className={CODE}>error.code</code> is stable and safe to branch on;{" "}
                <code className={CODE}>error.message</code> is for people and can change.
              </p>
              <CodeBlock code={JSON.stringify({ success: false, error: { code: "NOT_FOUND", message: "Order not found" } }, null, 2)} lang="json" />
            </div>

            <ul className="divide-y-[1.5px] divide-border overflow-hidden rounded-[22px] border-[1.5px] border-border">
              {ERROR_CODES.map((entry) => (
                <li key={entry.code} className="flex items-start gap-3 px-4 py-3">
                  <span className="w-10 shrink-0 pt-0.5 font-mono text-[13px] font-extrabold">{entry.status}</span>
                  <span className="min-w-0">
                    <code className="font-mono text-[13px] font-semibold">{entry.code}</code>
                    <span className="mt-0.5 block text-[13px] leading-relaxed text-muted-foreground">{entry.meaning}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </IntroSection>
      </div>

      {ENDPOINT_GROUPS.map((group) => (
        <section key={group} aria-labelledby={groupId(group)} className="mt-14 flex flex-col gap-3">
          <h2 id={groupId(group)} style={{ lineHeight: 1 }} className="mb-1 scroll-mt-24 text-[clamp(28px,3vw,40px)] font-extrabold tracking-[-0.04em]">
            {group.toLowerCase()}.
          </h2>
          {ENDPOINTS.filter((endpoint) => endpoint.group === group).map((endpoint) => (
            <EndpointDocBlock key={endpoint.id} endpoint={endpoint} />
          ))}
        </section>
      ))}
    </div>

    <DocsRail headings={API_HEADINGS} />
  </div>
);

export default DevelopersApiPage;
