import AskAiButtons from "@/components/developers/ask-ai-buttons";
import DocBlocks from "@/components/developers/doc-blocks";
import DocsRail from "@/components/developers/docs-rail";
import {
  GUIDES,
  getGuide,
  guideHeadings,
  guideToPlainText,
} from "@/lib/developer-docs/content";
import { DESK } from "@/components/organizer/desk";
import { cn, ROUTES } from "@/lib/utils";
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
    <div className={cn(DESK, "flex gap-12")}>
      <article className="min-w-0 flex-1 pt-[clamp(20px,3vw,40px)]">
        <header className="flex flex-col gap-4 border-b-[1.5px] border-border pb-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href={ROUTES.DEVELOPERS_DOCS}
              className="inline-flex h-9 w-fit items-center gap-1.5 rounded-full border-[1.5px] border-border px-3.5 text-[13px] font-semibold transition-colors hover:border-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {guide.section}
            </Link>
            <AskAiButtons title={guide.title} path={`${ROUTES.DEVELOPERS_DOCS}/${guide.slug}`} plainText={guideToPlainText(guide)} />
          </div>

          <h1 style={{ lineHeight: 0.98 }} className="max-w-3xl text-[clamp(34px,4.4vw,56px)] font-extrabold tracking-[-0.045em] text-balance">
            {guide.title}
          </h1>
          <p className="max-w-2xl text-[17px] leading-relaxed text-muted-foreground">{guide.summary}</p>

          {guide.readingMinutes ? (
            <p className="flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              {guide.readingMinutes} min read
            </p>
          ) : null}
        </header>

        <div className="max-w-3xl pt-8">
          <DocBlocks guide={guide} />
        </div>

        <nav aria-label="More guides" className="mt-14 grid max-w-3xl gap-3 sm:grid-cols-2">
          {previous ? (
            <Link
              href={`${ROUTES.DEVELOPERS_DOCS}/${previous.slug}`}
              className="group flex flex-col gap-1.5 rounded-[24px] border-[1.5px] border-border p-5 transition-colors hover:border-foreground"
            >
              <span className="flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground">
                <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden />
                Previous
              </span>
              <span className="text-base font-bold">{previous.title}</span>
            </Link>
          ) : (
            <span />
          )}

          {next ? (
            <Link
              href={`${ROUTES.DEVELOPERS_DOCS}/${next.slug}`}
              className="group flex flex-col items-end gap-1.5 rounded-[24px] bg-foreground p-5 text-right text-background transition-opacity hover:opacity-90 sm:col-start-2"
            >
              <span className="flex items-center gap-1.5 text-[13px] font-semibold opacity-70">
                Next
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </span>
              <span className="text-base font-bold">{next.title}</span>
            </Link>
          ) : null}
        </nav>
      </article>

      <DocsRail headings={headings} />
    </div>
  );
};

export default GuidePage;
