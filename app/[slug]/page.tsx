import { PageBlocks } from "@/components/page-blocks/blocks";
import { resolveTheme } from "@/components/page-blocks/theme";
import serverHttp from "@/lib/api/server-http";
import { type PublicEventPage } from "@/lib/types/event-page";
import { type Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

/**
 * The published event page, at vera.tickets/<slug>.
 *
 * This is a root-level dynamic segment, so it only ever runs for paths no
 * static route claims. Next resolves /events, /organizer, /account and the
 * rest first. The backend additionally refuses to issue a slug that matches an
 * app route, so a collision cannot be created in the first place.
 *
 * Rendered on the server: a crawler and a browser must see the same page, and
 * the bound blocks are resolved server-side anyway.
 */
const fetchPage = async (slug: string): Promise<PublicEventPage | null> => {
  try {
    const response = await serverHttp.get(`/public/events/pages/${slug}`);

    return response.data.data as PublicEventPage;
  } catch {
    return null;
  }
};

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> => {
  const { slug } = await params;
  const page = await fetchPage(slug);

  if (!page) {
    return { title: "Page not found" };
  }

  const title = page.seo.title || page.event.name;
  const description =
    page.seo.description ||
    page.event.description?.slice(0, 200) ||
    `Tickets for ${page.event.name}`;
  const image = page.seo.imageUrl || page.event.imageUrl;

  return {
    title,
    description,
    robots: page.seo.indexable === false ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      type: "website",
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
  };
};

const EventLandingPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const page = await fetchPage(slug);

  if (!page) {
    notFound();
  }

  /* Reached through a retired address. Send people to the current one so
     shares and search results settle on a single URL. */
  if (page.redirected) {
    permanentRedirect(`/${page.canonicalSlug}`);
  }

  const theme = resolveTheme(page.theme);

  return (
    <main style={{ background: theme.ground, minHeight: "100vh" }}>
      <PageBlocks
        blocks={page.blocks}
        event={page.event}
        theme={page.theme}
        ratings={page.ratings}
        resale={page.resale}
      />
    </main>
  );
};

export default EventLandingPage;
