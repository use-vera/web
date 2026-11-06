"use client";

import AppStore from "@/components/assets/other/app-store.";
import PlayStore from "@/components/assets/other/play-store";
import QrCodePlaceholder from "@/components/qr-code-placeholder";
import { Eyebrow } from "@/components/vera/display-heading";
import { IMAGES } from "@/lib/images";
import { motion, type Variants } from "motion/react";
import Image from "next/image";
import Link from "next/link";

const EASE = [0.22, 1, 0.36, 1] as const;

const textContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const textItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const reasons = [
  "Your ticket QR, ready to scan the second you get to the door",
  "Post the moment straight from the event, while it's still happening",
  "Follow friends and organizers, see who's going before you buy",
];

/** The app's welcome on the left; on the right, the code to scan, hanging over the "on the phone" illustration. */
const DownloadPage = () => {
  return (
    <main className="flex-1">
      <section className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-[clamp(40px,6vw,80px)] px-[clamp(16px,4vw,40px)] pt-[clamp(24px,5vw,64px)] pb-[clamp(48px,7vw,96px)]">
        <motion.div className="flex min-w-0 flex-[1_1_460px] flex-col items-start gap-7" initial="hidden" animate="visible" variants={textContainer}>
          <motion.span variants={textItem}>
            <Eyebrow>Get the app</Eyebrow>
          </motion.span>

          <motion.h1 variants={textItem} style={{ lineHeight: 0.92 }} className="text-[clamp(48px,6vw,88px)] font-extrabold tracking-[-0.05em] text-foreground">
            vera, right in
            <span className="block text-primary">your pocket.</span>
          </motion.h1>

          <motion.p variants={textItem} className="max-w-md text-lg leading-relaxed text-muted-foreground">
            Scan the code or grab it from your app store. Everything you buy on the web shows up there too, same account, same
            tickets.
          </motion.p>

          <motion.ol variants={textItem} className="w-full max-w-[480px] border-t border-border">
            {reasons.map((reason, index) => (
              <li key={reason} className="flex gap-3.5 border-b border-border py-3.5 text-[15px] text-foreground">
                <span className="font-bold text-primary">{String(index + 1).padStart(2, "0")}</span>
                {reason}
              </li>
            ))}
          </motion.ol>

          <motion.div variants={textItem} className="flex flex-wrap items-center gap-3">
            <AppStore />
            <PlayStore />
          </motion.div>

          <motion.div variants={textItem}>
            <Link href="/events" className="text-base font-semibold transition-colors hover:text-primary">
              Prefer the web? Browse events right here →
            </Link>
          </motion.div>
        </motion.div>

        <div className="flex min-w-0 flex-[1_1_400px] flex-col">
          <div aria-hidden="true" className="flex h-[300px] items-end justify-center overflow-hidden rounded-[32px] bg-[#173B2A] px-6">
            <Image src={IMAGES.illustrationsOnPhone} alt="" width={1000} height={1000} priority className="h-[290px] w-auto" />
          </div>
          <div className="dark mx-6 -mt-24 flex flex-col items-center gap-4 rounded-[32px] border-4 border-[#F5F3EF] bg-background p-8 text-foreground">
            <QrCodePlaceholder className="h-52 w-52 rounded-3xl p-3 sm:h-60 sm:w-60" />
            <span className="text-base font-bold">Scan to get Vera</span>
          </div>
        </div>
      </section>
    </main>
  );
};

export default DownloadPage;
