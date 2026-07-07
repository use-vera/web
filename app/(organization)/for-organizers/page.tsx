import DownloadBand from "@/components/download-band";
import Reveal from "@/components/motion/reveal";
import OrganizerFaq from "@/components/organizer-faq";
import OrganizerFeatureGrid from "@/components/organizer-feature-grid";
import OrganizerFinalCta from "@/components/organizer-final-cta";
import OrganizerHero from "@/components/organizer-hero";
import OrganizerPricing from "@/components/organizer-pricing";
import OrganizerTrustStrip from "@/components/organizer-trust-strip";
import type { Metadata } from "next";

const title = "For Organizers — Vera handles the rest.";
const description =
  "Sell tickets, verify entry, control resale, and get discovered — all from one dashboard, with payouts that land automatically.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description },
  twitter: { title, description },
};

export default function ForOrganizersPage() {
  return (
    <main className="flex-1">
      <OrganizerHero />

      <Reveal>
        <OrganizerTrustStrip />
      </Reveal>

      <Reveal>
        <OrganizerFeatureGrid />
      </Reveal>

      <Reveal>
        <OrganizerPricing />
      </Reveal>

      <Reveal>
        <OrganizerFaq />
      </Reveal>

      <Reveal>
        <OrganizerFinalCta />
      </Reveal>

      <Reveal>
        <DownloadBand />
      </Reveal>
    </main>
  );
}
