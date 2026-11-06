import { DESK } from "@/components/organizer/desk";
import { PageHeader, Panel } from "@/components/organizer/organizer-primitives";
import { buttonVariants } from "@/components/ui/button";
import CodeBlock from "@/components/ui/code-block";
import { POSTER_TONES, type PosterTone } from "@/components/vera/event-poster";
import { GUIDES } from "@/lib/developer-docs/content";
import { ENDPOINTS } from "@/lib/developer-docs/endpoints";
import { cn, ROUTES } from "@/lib/utils";
import { ArrowRight, ArrowUpRight, BookOpen, Code2, Key, PlayCircle, TerminalSquare, type LucideIcon } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Vera for developers",
  description:
    "Sell tickets, admit people at the door and issue refunds with the Vera API.",
};

const FIRST_CALL = `curl "https://api.vera.dev/v1/events" \\
  -H "Authorization: Bearer sk_test_..."`;

const ENTRY_POINTS: { href: string; icon: LucideIcon; title: string; body: string; tone: PosterTone; external?: boolean }[] = [
  {
    href: ROUTES.DEVELOPERS_API,
    icon: Code2,
    title: "API reference",
    body: "Every endpoint, parameter, scope and example response.",
    tone: "yellow",
  },
  {
    href: ROUTES.DEVELOPERS_SANDBOX,
    icon: TerminalSquare,
    title: "Sandbox",
    body: "Send real requests from the browser, before writing any code.",
    tone: "blue",
  },
  {
    href: ROUTES.DEVELOPERS_DEMO,
    icon: PlayCircle,
    title: "Demo app",
    body: "A working ticket shop you can drive with your own test key, then download as a starting point.",
    tone: "pink",
    external: true,
  },
  {
    href: ROUTES.DEVELOPERS_KEYS,
    icon: Key,
    title: "API keys",
    body: "Create test and live keys, and retire the ones you have finished with.",
    tone: "ink",
  },
];

const FLOWS = GUIDES.filter((guide) => guide.section === "Build a flow");

const DevelopersOverviewPage = () => (
  <div className={DESK}>
    <PageHeader
      lead="build on"
      accent="vera."
      description={
        <>
          {ENDPOINTS.length} endpoints over one REST API: list what is on sale, take the payment, admit people at the door, refund when plans change. Read
          everything here without an account. You only need one when you want keys.
        </>
      }
      actions={
        <>
          <Link href={ROUTES.DEVELOPERS_API} className={buttonVariants({ variant: "line" })}>
            Browse the API
          </Link>
          <Link href={`${ROUTES.DEVELOPERS_DOCS}/quickstart`} className={buttonVariants({ variant: "ink" })}>
            Start building
            <ArrowRight className="h-4 w-4" />
          </Link>
        </>
      }
    />

    <section aria-label="Where to start" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {/* The quickstart is the front door, so it gets the room and carries the first call. */}
      <div
        className="flex flex-col gap-5 rounded-[32px] p-[clamp(20px,2.4vw,32px)] sm:col-span-2 lg:col-span-1 lg:row-span-2"
        style={{ backgroundColor: POSTER_TONES.green.bg, color: POSTER_TONES.green.fg }}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#0B1D14] text-[#15C67C]">
          <BookOpen className="h-5 w-5" />
        </span>
        <span className="flex flex-col gap-2">
          <Link
            href={`${ROUTES.DEVELOPERS_DOCS}/quickstart`}
            style={{ lineHeight: 0.95 }}
            className="text-[clamp(30px,3vw,40px)] font-extrabold tracking-[-0.045em] underline-offset-4 hover:underline"
          >
            quickstart.
          </Link>
          <span className="text-[15px] font-semibold opacity-80">From no account to a real response, in about five minutes.</span>
        </span>
        <span className="mt-auto flex flex-col gap-2">
          <span className="text-[13px] font-bold opacity-75">Your first call</span>
          <CodeBlock code={FIRST_CALL} lang="bash" />
        </span>
        <Link
          href={`${ROUTES.DEVELOPERS_DOCS}/quickstart`}
          className="group flex h-12 w-fit items-center gap-2 rounded-full bg-[#0B1D14] px-5 text-[15px] font-bold text-[#F5F3EF] transition-opacity hover:opacity-90"
        >
          Start the quickstart
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {ENTRY_POINTS.map((entry) => {
        const colours = POSTER_TONES[entry.tone];
        return (
          <Link
            key={entry.href}
            href={entry.href}
            /* The demo is a standalone page, not part of the portal shell. */
            target={entry.external ? "_blank" : undefined}
            rel={entry.external ? "noopener noreferrer" : undefined}
            className="group flex min-h-[200px] flex-col gap-4 rounded-[28px] p-6"
            style={{ backgroundColor: colours.bg, color: colours.fg }}
          >
            <span className="flex items-center justify-between">
              <entry.icon className="h-6 w-6" strokeWidth={2.2} />
              {entry.external ? (
                <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              ) : (
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              )}
            </span>
            <span className="mt-auto flex flex-col gap-1.5">
              <span className="text-[22px] leading-tight font-extrabold tracking-[-0.03em]">{entry.title}</span>
              <span className="text-sm leading-relaxed font-medium opacity-80">{entry.body}</span>
            </span>
          </Link>
        );
      })}
    </section>

    <section className="mt-14 flex flex-col gap-4">
      <div>
        <h2 style={{ lineHeight: 1 }} className="text-[clamp(24px,2.4vw,32px)] font-extrabold tracking-[-0.035em]">
          build a flow.
        </h2>
        <p className="mt-2 text-[15px] text-muted-foreground">Complete journeys, with every request and the responses you should expect back.</p>
      </div>

      <Panel>
        <ul className="divide-y-[1.5px] divide-border">
          {FLOWS.map((guide, index) => (
            <li key={guide.slug}>
              <Link href={`${ROUTES.DEVELOPERS_DOCS}/${guide.slug}`} className="group flex items-center gap-4 p-4 transition-colors hover:bg-secondary sm:p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-foreground text-[15px] font-extrabold text-background tabular-nums">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-bold transition-colors group-hover:text-primary">{guide.title}</span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-muted-foreground">{guide.summary}</span>
                </span>
                <ArrowRight className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5")} />
              </Link>
            </li>
          ))}
        </ul>
      </Panel>
    </section>
  </div>
);

export default DevelopersOverviewPage;
