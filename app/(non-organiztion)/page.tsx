import DownloadBand from "@/components/download-band";
import HomeComingUp from "@/components/home/home-coming-up";
import HomeHero from "@/components/home/home-hero";
import HomeHosts from "@/components/home/home-hosts";
import HomeTickets from "@/components/home/home-tickets";
import HomeTogether from "@/components/home/home-together";
import HomeVera from "@/components/home/home-vera";
import Reveal from "@/components/motion/reveal";

/* The app's look on the web: bold lowercase headings, flat poster colours,
   hairline rows, and two ink bands. Each section shows a real screen of the
   app rather than describing it. */
export default function Home() {
  return (
    <main className="flex-1">
      <HomeHero />

      <HomeComingUp />

      <Reveal>
        <HomeVera />
      </Reveal>

      <Reveal>
        <HomeTogether />
      </Reveal>

      <Reveal>
        <HomeTickets />
      </Reveal>

      <Reveal>
        <HomeHosts />
      </Reveal>

      <Reveal>
        <DownloadBand />
      </Reveal>
    </main>
  );
}
