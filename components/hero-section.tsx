"use client";

import Button from "@/components/ui/button";
import { IMAGES } from "@/lib/images";
import { ROUTES } from "@/lib/utils";
import { ShieldCheck, Ticket } from "lucide-react";
import { motion, type Variants } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const EASE = [0.22, 1, 0.36, 1] as const;

const textContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const textItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const illustrationVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.92 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, delay: 0.15, ease: EASE },
  },
};

const chipVariants: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 18 },
  },
};

const HeroSection = () => {
  // Hooks
  const router = useRouter();

  // Helpers
  const handleDownloadClick = () => {
    router.push(ROUTES.DOWNLOAD);
  };
  return (
    <section className="relative mx-auto grid max-w-6xl gap-16 overflow-x-clip px-6 py-20 md:grid-cols-2 md:items-center md:py-14">
      <motion.div
        className="flex flex-col items-start gap-8"
        initial="hidden"
        animate="visible"
        variants={textContainer}
      >
        <motion.h1
          variants={textItem}
          className="text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-6xl"
        >
          {/* Buy the ticket.
          <br />
          Keep <span className="text-primary">the moment</span>. */}
          Wherever life <span className="text-primary">happens</span>.
        </motion.h1>

        <motion.p
          variants={textItem}
          className="max-w-md text-base text-muted-foreground sm:text-lg"
        >
          Vera is where you find events, grab tickets safely, and relive them
          through the moments your circle shares.
        </motion.p>

        <motion.div
          variants={textItem}
          className="flex flex-col items-start gap-4 sm:flex-row sm:items-center"
        >
          <Button size="lg" onClick={handleDownloadClick}>
            Download Vera
          </Button>
          <Link
            href="#organizers"
            className="text-sm font-semibold text-foreground underline-offset-4 hover:underline"
          >
            Hosting an event? List it free →
          </Link>
        </motion.div>
      </motion.div>

      <div className="flex justify-center md:justify-end">
        <div className="relative inline-block">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 m-auto h-56 w-56 rounded-full bg-accent blur-3xl sm:h-72 sm:w-72"
          />

          <motion.div
            initial="hidden"
            animate="visible"
            variants={illustrationVariants}
            className="relative h-100 w-100 sm:h-125 sm:w-125"
          >
            <Image
              src={IMAGES.hero}
              alt="A colorful illustration of the Vera community"
              fill
              unoptimized
              className="object-contain"
            />
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={chipVariants}
            transition={{ delay: 0.7 }}
            className="absolute -left-6 top-6 -rotate-6 sm:-left-10"
          >
            <div className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-lg">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Verified organizer
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={chipVariants}
            transition={{ delay: 0.9 }}
            className="absolute -right-2 bottom-24 hidden rotate-6 sm:-right-6 sm:block"
          >
            <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3 shadow-lg">
              <Ticket className="h-4 w-4 shrink-0 text-primary" />
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] font-semibold text-muted-foreground">
                  One-tap check-in
                </span>
                <span className="text-xs font-bold text-foreground">
                  Scanned in 0.4s
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
