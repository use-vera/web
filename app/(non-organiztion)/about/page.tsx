import AboutHero from "@/components/about-hero";
import AboutMission from "@/components/about-mission";
import DownloadBand from "@/components/download-band";
import Reveal from "@/components/motion/reveal";
import TeamSection from "@/components/team-section";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Vera — Real events, real moments.",
  description:
    "Vera is the all-in-one events app for finding events, buying tickets safely, and keeping the moments that make a night worth remembering.",
};

export default function AboutPage() {
  return (
    <main className="flex-1">
      <AboutHero />

      <Reveal>
        <AboutMission />
      </Reveal>

      <TeamSection />

      <Reveal>
        <DownloadBand />
      </Reveal>
    </main>
  );
}
