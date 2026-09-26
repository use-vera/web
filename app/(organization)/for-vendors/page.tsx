import DownloadBand from "@/components/download-band";
import Reveal from "@/components/motion/reveal";
import VendorFaq from "@/components/vendors/vendor-faq";
import VendorFeatureGrid from "@/components/vendors/vendor-feature-grid";
import VendorFees from "@/components/vendors/vendor-fees";
import VendorFinalCta from "@/components/vendors/vendor-final-cta";
import VendorHero from "@/components/vendors/vendor-hero";
import VendorSteps from "@/components/vendors/vendor-steps";
import type { Metadata } from "next";

const title = "For vendors: sell at events without the queue.";
const description =
  "Take orders and payments from attendees at events on Vera. Build a menu once, work the queue from your phone, and get paid to your bank after every event.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description },
  twitter: { title, description },
};

export default function ForVendorsPage() {
  return (
    <main className="flex-1">
      <VendorHero />

      <Reveal>
        <VendorSteps />
      </Reveal>

      <Reveal>
        <VendorFeatureGrid />
      </Reveal>

      <Reveal>
        <VendorFees />
      </Reveal>

      <Reveal>
        <VendorFaq />
      </Reveal>

      <Reveal>
        <VendorFinalCta />
      </Reveal>

      <Reveal>
        <DownloadBand />
      </Reveal>
    </main>
  );
}
