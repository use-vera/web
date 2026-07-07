import DownloadBand from "@/components/download-band";
import HowItWorksFaq from "@/components/how-it-works-faq";
import HowItWorksHero from "@/components/how-it-works-hero";
import HowItWorksOrganizerCta from "@/components/how-it-works-organizer-cta";
import HowItWorksSpotlight from "@/components/how-it-works-spotlight";
import HowItWorksSteps from "@/components/how-it-works-steps";
import Reveal from "@/components/motion/reveal";
import type { Metadata } from "next";

const title = "How Vera works — Find it. Book it. Live it.";
const description =
  "Exactly what happens from the moment you open Vera to the moment you're walking through the door — discovery, checkout, check-in, and the moments after.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description },
  twitter: { title, description },
};

export default function HowItWorksPage() {
  return (
    <main className="flex-1">
      <HowItWorksHero />

      <Reveal>
        <HowItWorksSteps />
      </Reveal>

      <Reveal>
        <HowItWorksSpotlight />
      </Reveal>

      <Reveal>
        <HowItWorksFaq />
      </Reveal>

      <Reveal>
        <HowItWorksOrganizerCta />
      </Reveal>

      <Reveal>
        <DownloadBand />
      </Reveal>
    </main>
  );
}
