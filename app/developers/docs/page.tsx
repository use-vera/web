import DocsRail from "@/components/developers/docs-rail";
import Badge from "@/components/ui/badge";
import { GUIDES, GUIDE_SECTIONS } from "@/lib/developer-docs/content";
import { ROUTES } from "@/lib/utils";
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

const DevelopersDocsIndexPage = () => (
  <div className="mx-auto flex max-w-6xl gap-12 px-6 py-14 sm:px-10">
    <div className="min-w-0 flex-1">
    <header className="flex flex-col gap-3">
      <Badge variant="outline" className="w-fit">
        Documentation
      </Badge>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Build on Vera.
      </h1>
      <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
        Sell tickets from your own site, admit people at the door, and handle
        refunds, all over one REST API. Start with the quickstart, then follow
        the flow you are building.
      </p>
    </header>

    <div className="mt-10 flex flex-col gap-10">
      {GUIDE_SECTIONS.map((section) => {
        const guides = GUIDES.filter((guide) => guide.section === section);

        if (!guides.length) {
          return null;
        }

        return (
          <section key={section} className="flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">{section}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {SECTION_BLURBS[section]}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {guides.map((guide) => (
                <Link
                  key={guide.slug}
                  href={`${ROUTES.DEVELOPERS_DOCS}/${guide.slug}`}
                  className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/20 hover:bg-muted/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-[15px] font-bold text-card-foreground">
                      {guide.title}
                    </h3>
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </div>

                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {guide.summary}
                  </p>

                  {guide.readingMinutes ? (
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" aria-hidden />
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

    <DocsRail />
  </div>
);

export default DevelopersDocsIndexPage;
