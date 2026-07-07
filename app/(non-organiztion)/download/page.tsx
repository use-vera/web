"use client";

import AppStore from "@/components/assets/other/app-store.";
import PlayStore from "@/components/assets/other/play-store";
import LogoMark from "@/components/logo-mark";
import PerforatedDivider from "@/components/perforated-divider";
import QrCodePlaceholder from "@/components/qr-code-placeholder";
import { Images, Ticket, Users } from "lucide-react";
import { motion, type Variants } from "motion/react";
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

const qrVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 220, damping: 20, delay: 0.2 },
  },
};

const reasons = [
  {
    icon: Ticket,
    text: "Your ticket QR, ready to scan the second you get to the door",
  },
  {
    icon: Images,
    text: "Post the moment straight from the night, no waiting till morning",
  },
  {
    icon: Users,
    text: "Follow friends and organizers, see who's going before you buy",
  },
];

const DownloadPage = () => {
  return (
    <main className="flex-1">
      <section className="relative mx-auto grid max-w-6xl gap-16 overflow-x-clip px-6 py-20 md:grid-cols-2 md:items-center md:py-24">
        <motion.div
          className="flex flex-col items-start gap-8"
          initial="hidden"
          animate="visible"
          variants={textContainer}
        >
          <motion.span
            variants={textItem}
            className="text-xs font-semibold uppercase tracking-[0.14em] text-primary"
          >
            Get the app
          </motion.span>

          <motion.h1
            variants={textItem}
            className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-5xl"
          >
            Vera, right in your <span className="text-primary">pocket</span>.
          </motion.h1>

          <motion.p
            variants={textItem}
            className="max-w-md text-base text-muted-foreground sm:text-base"
          >
            Scan the QR code or grab it from your app store. Everything you buy
            on the web shows up there too, same account, same tickets.
          </motion.p>

          <motion.ul variants={textItem} className="flex flex-col gap-2">
            {reasons.map((reason) => (
              <li
                key={reason.text}
                className="flex items-start gap-3 text-sm font-medium text-foreground"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent">
                  <reason.icon className="h-3.5 w-3.5 text-accent-foreground" />
                </span>
                {reason.text}
              </li>
            ))}
          </motion.ul>

          <motion.div
            variants={textItem}
            className="flex flex-col items-start gap-3 sm:flex-row"
          >
            <AppStore />
            <PlayStore />
          </motion.div>

          <motion.div variants={textItem}>
            <Link
              href="/events"
              className="text-sm font-semibold text-foreground underline-offset-4 hover:underline"
            >
              Prefer the web? Browse events right here →
            </Link>
          </motion.div>
        </motion.div>

        <div className="flex justify-center md:justify-end">
          <div className="relative inline-block">
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 m-auto h-64 w-64 rounded-full bg-accent blur-3xl sm:h-80 sm:w-80"
            />

            <motion.div
              initial="hidden"
              animate="visible"
              variants={qrVariants}
              className="flex flex-col items-center gap-6 rounded-3xl border border-border bg-card p-10 shadow-2xl sm:p-12"
            >
              <QrCodePlaceholder className="h-52 w-52 sm:h-64 sm:w-64" />

              <PerforatedDivider className="w-full" />

              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-foreground">
                  Scan to get
                </span>
                <span className="flex items-end">
                  <LogoMark className="h-5 w-5" />
                  <span className="text-sm font-bold text-foreground">
                    Vera
                  </span>
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <PerforatedDivider className="mx-auto max-w-6xl" />
    </main>
  );
};

export default DownloadPage;
