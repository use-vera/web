import Badge from "@/components/ui/badge";
import CodeBlock from "@/components/ui/code-block";
import { GUIDES } from "@/lib/developer-docs/content";
import { ENDPOINTS } from "@/lib/developer-docs/endpoints";
import { ROUTES } from "@/lib/utils";
import {
  ArrowRight,
  BookOpen,
  Code2,
  Key,
  PlayCircle,
  TerminalSquare,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Vera for developers",
  description:
    "Sell tickets, admit people at the door and issue refunds with the Vera API.",
};

const FIRST_CALL = `curl "https://api.vera.dev/v1/events" \\
  -H "Authorization: Bearer sk_test_..."`;

const ENTRY_POINTS = [
  {
    href: `${ROUTES.DEVELOPERS_DOCS}/quickstart`,
    icon: BookOpen,
    title: "Quickstart",
    body: "From no account to a real response, in about five minutes.",
  },
  {
    href: ROUTES.DEVELOPERS_API,
    icon: Code2,
    title: "API reference",
    body: "Every endpoint, parameter, scope and example response.",
  },
  {
    href: ROUTES.DEVELOPERS_DEMO,
    icon: PlayCircle,
    title: "Demo app",
    body: "A working ticket shop you can drive with your own test key, then download as a starting point.",
    external: true,
  },
  {
    href: ROUTES.DEVELOPERS_SANDBOX,
    icon: TerminalSquare,
    title: "Sandbox",
    body: "Send real requests from the browser, before writing any code.",
  },
  {
    href: ROUTES.DEVELOPERS_KEYS,
    icon: Key,
    title: "API keys",
    body: "Create test and live keys, and retire the ones you have finished with.",
  },
];

const FLOWS = GUIDES.filter((guide) => guide.section === "Build a flow");

const DevelopersOverviewPage = () => (
  <div className="mx-auto max-w-5xl px-6 py-14 sm:px-10">
    <header className="flex flex-col gap-4">
      <Badge variant="outline" className="w-fit">
        Developer platform
      </Badge>
      <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
        Put Vera&apos;s ticketing inside your own product.
      </h1>
      <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
        {ENDPOINTS.length} endpoints over one REST API: list what is on sale,
        take the payment, admit people at the door, refund when plans change.
        Read everything here without an account — you only need one when you
        want keys.
      </p>

      <div className="mt-2 flex flex-wrap gap-3">
        <Link
          href={`${ROUTES.DEVELOPERS_DOCS}/quickstart`}
          className="flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Start building
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href={ROUTES.DEVELOPERS_API}
          className="flex h-11 items-center rounded-full border border-border px-5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          Browse the API
        </Link>
      </div>
    </header>

    <section className="mt-12">
      <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Your first call
      </p>
      <CodeBlock code={FIRST_CALL} lang="bash" />
    </section>

    <section className="mt-12 grid gap-3 sm:grid-cols-2">
      {ENTRY_POINTS.map((entry) => (
        <Link
          key={entry.href}
          href={entry.href}
          /* The demo is a standalone page, not part of the portal shell. */
          target={entry.external ? "_blank" : undefined}
          rel={entry.external ? "noopener noreferrer" : undefined}
          className="group flex gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-foreground/20 hover:bg-muted/40"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent">
            <entry.icon className="h-4.5 w-4.5 text-primary" />
          </span>
          <span className="flex min-w-0 flex-col gap-1">
            <span className="text-[15px] font-bold text-card-foreground">
              {entry.title}
            </span>
            <span className="text-sm leading-relaxed text-muted-foreground">
              {entry.body}
            </span>
          </span>
        </Link>
      ))}
    </section>

    <section className="mt-14">
      <h2 className="text-lg font-bold text-foreground">Build a flow</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">
        Complete journeys, with every request and the responses you should
        expect back.
      </p>

      <div className="mt-4 divide-y divide-border rounded-2xl border border-border">
        {FLOWS.map((guide) => (
          <Link
            key={guide.slug}
            href={`${ROUTES.DEVELOPERS_DOCS}/${guide.slug}`}
            className="group flex items-center gap-4 p-5 transition-colors hover:bg-muted/40"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-bold text-foreground">
                {guide.title}
              </p>
              <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                {guide.summary}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </section>
  </div>
);

export default DevelopersOverviewPage;
