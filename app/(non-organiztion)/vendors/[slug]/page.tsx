import VendorPublicPage from "@/components/vendors/vendor-public-page";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  /* Named from the slug rather than a fetch: the page itself loads the vendor,
     and a second request on the server only to title the tab is not worth it. */
  const readable = slug.replace(/-[a-z0-9]{5}$/, "").replace(/-/g, " ");

  return {
    title: `${readable} on Vera`,
    description: "See what this vendor sells at events on Vera.",
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;

  return <VendorPublicPage slug={slug} />;
}
