import DocsRail from "@/components/developers/docs-rail";
import { DESK } from "@/components/organizer/desk";
import { PageHeader } from "@/components/organizer/organizer-primitives";
import { POSTER_TONES, type PosterTone } from "@/components/vera/event-poster";
import { GUIDES, GUIDE_SECTIONS } from "@/lib/developer-docs/content";
import { cn, ROUTES } from "@/lib/utils";
import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Vera API documentation",
  description:
    "Guides for selling tickets, admitting people at the door and issuing refunds with the Vera API.",
};

const SECTION_BLURBS: Record<string, string> = {
  "Getting started": "From nothing to your first authenticated call.",
  "Core concepts": "The handful of ideas every endpoint assumes you know.",
  "Build a flow": "Complete journeys, start to finish, with real requests.",
  "Going live": "What to check before real money moves.",
};

/* Each section keeps one colour, so its guides read as a set. */
const SECTION_TONES: Record<string, PosterTone> = {
  "Getting started": "green",
  "Core concepts": "yellow",
  "Build a flow": "blue",
  "Going live": "pink",
};

const sectionId = (section: string) => section.toLowerCase().replace(/[^a-z0-9]+/g, "-");

const DevelopersDocsIndexPage = () => (
  <div className={cn(DESK, "flex gap-12")}>
    <div className="min-w-0 flex-1">
      <PageHeader
        lead="the"
        accent="docs."
        description="Sell tickets from your own site, admit people at the door, and handle refunds, all over one REST API. Start with the quickstart, then follow the flow you are building."
      />

      <div className="flex flex-col gap-12">
        {GUIDE_SECTIONS.map((section) => {
          const guides = GUIDES.filter((guide) => guide.section === section);

          if (!guides.length) {
            return null;
          }

          const colours = POSTER_TONES[SECTION_TONES[section] ?? "cream"];

          return (
            <section key={section} id={sectionId(section)} className="flex scroll-mt-24 flex-col gap-4">
              <div>
                <h2 style={{ lineHeight: 1 }} className="text-[clamp(24px,2.4vw,32px)] font-extrabold tracking-[-0.035em]">
                  {section.toLowerCase()}.
                </h2>
                <p className="mt-2 text-[15px] text-muted-foreground">{SECTION_BLURBS[section]}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {guides.map((guide, index) => (
                  <Link
                    key={guide.slug}
                    href={`${ROUTES.DEVELOPERS_DOCS}/${guide.slug}`}
                    className="group flex flex-col gap-3 rounded-[26px] border-[1.5px] border-border p-5 transition-colors hover:border-foreground"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-[12px] text-sm font-extrabold tabular-nums"
                        style={{ backgroundColor: colours.bg, color: colours.fg }}
                      >
                        {index + 1}
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </div>

                    <h3 className="text-[17px] leading-snug font-bold tracking-[-0.01em] transition-colors group-hover:text-primary">{guide.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{guide.summary}</p>

                    {guide.readingMinutes ? (
                      <p className="mt-auto flex items-center gap-1.5 pt-1 text-[13px] font-semibold text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" aria-hidden />
                        {guide.readingMinutes} min read
                      </p>
                    ) : null}
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>

    <DocsRail headings={GUIDE_SECTIONS.filter((section) => GUIDES.some((guide) => guide.section === section)).map((section) => ({ id: sectionId(section), label: section }))} />
  </div>
);

export default DevelopersDocsIndexPage;
