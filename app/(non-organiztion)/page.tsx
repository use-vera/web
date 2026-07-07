import DownloadBand from "@/components/download-band";
import FeatureRow from "@/components/feature-row";
import FeatureStrip from "@/components/feature-strip";
import HeroSection from "@/components/hero-section";
import HomeFaq from "@/components/home-faq";
import ManifestoBand from "@/components/manifesto-band";
import MomentsCollage from "@/components/moments-collage";
import Reveal from "@/components/motion/reveal";
import OrganizerBand from "@/components/organizer-band";
import TestimonialsSection from "@/components/testimonials-section";
import { IMAGES } from "@/lib/images";
import { Images, MessageCircle, Ticket } from "lucide-react";

export default function Home() {
  return (
    <main className="flex-1">
      <HeroSection />

      <Reveal>
        <FeatureStrip />
      </Reveal>

      <Reveal>
        <ManifestoBand />
      </Reveal>

      <Reveal>
        <FeatureRow
          id="moments"
          eyebrow="Moments"
          eyebrowIcon={Images}
          title="A feed built for what actually happened."
          description="For You, This Week, My Circle — photos, videos and text updates from events you care about, with real comments, not just likes."
          bullets={[
            "Multi-photo and video moments in one post",
            "Comment threads on every moment",
            "Follow-based feeds, not just algorithms",
          ]}
          image={IMAGES.moments}
        />
      </Reveal>

      <Reveal>
        <FeatureRow
          id="tickets"
          eyebrow="Events & Tickets"
          eyebrowIcon={Ticket}
          title="Tickets that don't get complicated."
          description="Buy direct, resell at a capped price instead of a scalper markup, and check in with one tap at the door."
          bullets={[
            "Secure resale, capped at face value",
            "One-tap QR check-in at the gate",
            "No fake tickets, ever",
          ]}
          image={IMAGES.tickets}
          reverse
          tinted
        />
      </Reveal>

      <Reveal>
        <FeatureRow
          eyebrow="Community"
          eyebrowIcon={MessageCircle}
          title="Follow the people whose taste you trust."
          description="Follow friends and organizers, see who's going before you buy, and keep the event's chat open until doors close."
          bullets={[
            "Follow friends and organizers",
            "See who's going before you commit",
            "Group chat for every event",
          ]}
          image={IMAGES.people}
        />
      </Reveal>

      <MomentsCollage />

      <TestimonialsSection />

      <Reveal>
        <HomeFaq />
      </Reveal>

      <Reveal>
        <OrganizerBand />
      </Reveal>

      <Reveal>
        <DownloadBand />
      </Reveal>
    </main>
  );
}
