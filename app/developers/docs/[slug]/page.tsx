import AskAiButtons from "@/components/developers/ask-ai-buttons";
import DocBlocks from "@/components/developers/doc-blocks";
import DocsRail from "@/components/developers/docs-rail";
import {
  GUIDES,
  getGuide,
  guideHeadings,
  guideToPlainText,
} from "@/lib/developer-docs/content";
import { ROUTES } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const generateStaticParams = () =>
  GUIDES.map((guide) => ({ slug: guide.slug }));

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const guide = getGuide(slug);

  return guide
    ? { title: `${guide.title} · Vera API`, description: guide.summary }
    : {};
};

const GuidePage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const guide = getGuide(slug);

  if (!guide) {
    notFound();
  }

  const headings = guideHeadings(guide);
  const index = GUIDES.findIndex((entry) => entry.slug === guide.slug);
  const previous = index > 0 ? GUIDES[index - 1] : null;
  const next = index < GUIDES.length - 1 ? GUIDES[index + 1] : null;

  return (
    <div className="mx-auto flex max-w-6xl gap-12 px-6 py-14 sm:px-10">
      <article className="min-w-0 flex-1">
        <header className="flex flex-col gap-3 border-b border-border pb-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {guide.section}
            </p>
            <AskAiButtons
              title={guide.title}
              path={`${ROUTES.DEVELOPERS_DOCS}/${guide.slug}`}
              plainText={guideToPlainText(guide)}
            />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {guide.title}
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
            {guide.summary}
          </p>

          {guide.readingMinutes ? (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" aria-hidden />
              {guide.readingMinutes} min read
            </p>
          ) : null}
        </header>

        <div className="pt-7">
          <DocBlocks guide={guide} />
        </div>

        <nav
          aria-label="More guides"
          className="mt-12 grid gap-3 border-t border-border pt-6 sm:grid-cols-2"
        >
          {previous ? (
            <Link
              href={`${ROUTES.DEVELOPERS_DOCS}/${previous.slug}`}
              className="group flex flex-col gap-1 rounded-sm border border-border p-4 transition-colors hover:bg-muted/40"
            >
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ArrowLeft className="h-3 w-3" aria-hidden />
                Previous
              </span>
              <span className="text-sm font-semibold text-foreground">
                {previous.title}
              </span>
            </Link>
          ) : (
            <span />
          )}

          {next ? (
            <Link
              href={`${ROUTES.DEVELOPERS_DOCS}/${next.slug}`}
              className="group flex flex-col items-end gap-1 rounded-sm border border-border p-4 text-right transition-colors hover:bg-muted/40 sm:col-start-2"
            >
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                Next
                <ArrowRight className="h-3 w-3" aria-hidden />
              </span>
              <span className="text-sm font-semibold text-foreground">
                {next.title}
              </span>
            </Link>
          ) : null}
        </nav>
      </article>

      <DocsRail headings={headings} />
    </div>
  );
};

export default GuidePage;
