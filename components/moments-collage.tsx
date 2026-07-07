"use client";

import { cn } from "@/lib/utils";
import { Heart, Images, MessageCircle } from "lucide-react";
import { motion, type Variants } from "motion/react";

interface MomentTile {
  caption: string;
  likes: number;
  comments: number;
  tone: "ink" | "primary" | "accent" | "secondary";
  rotate?: string;
}

const MOMENT_TILES: MomentTile[] = [
  {
    caption: "The moment the whole floor sang the hook back 🔥",
    likes: 482,
    comments: 96,
    tone: "ink",
    rotate: "-rotate-2",
  },
  {
    caption: "Front row, no regrets.",
    likes: 214,
    comments: 31,
    tone: "primary",
  },
  {
    caption: "Sunset set > everything else today",
    likes: 356,
    comments: 58,
    tone: "accent",
    rotate: "rotate-2",
  },
  {
    caption: "We actually found parking. Miracle.",
    likes: 89,
    comments: 12,
    tone: "secondary",
  },
  {
    caption: "Encore, encore, encore.",
    likes: 601,
    comments: 140,
    tone: "primary",
    rotate: "rotate-1",
  },
  {
    caption: "Last one out, first one in next time.",
    likes: 173,
    comments: 24,
    tone: "ink",
  },
];

const toneClasses: Record<MomentTile["tone"], string> = {
  ink: "bg-foreground text-background",
  primary: "bg-primary text-primary-foreground",
  accent: "bg-accent text-accent-foreground",
  secondary: "bg-secondary text-secondary-foreground",
};

const gridVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.09 },
  },
};

const tileVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.94 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const MomentsCollage = () => {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
      <div className="mx-auto mb-12 flex max-w-xl flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-2 text-primary">
          <Images className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-[0.14em]">
            The feed
          </span>
        </div>
        <h2 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">
          Real moments, not stock photos.
        </h2>
        <p className="text-base text-muted-foreground">
          Every post in Vera is from someone who was actually there — no curated
          grid, just what happened.
        </p>
      </div>

      <motion.div
        className="grid grid-cols-2 gap-4 sm:grid-cols-3"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={gridVariants}
      >
        {MOMENT_TILES.map((tile) => (
          <motion.div
            key={tile.caption}
            variants={tileVariants}
            whileHover={{ rotate: 0, scale: 1.03 }}
            className={cn(
              "flex aspect-square flex-col justify-between rounded-2xl p-4 shadow-sm sm:p-5",
              toneClasses[tile.tone],
              tile.rotate,
            )}
          >
            <p className="text-sm font-semibold leading-snug sm:text-base">
              {tile.caption}
            </p>

            <div className="flex items-center gap-4 text-xs font-semibold opacity-80">
              <span className="flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5" />
                {tile.likes}
              </span>
              <span className="flex items-center gap-1.5">
                <MessageCircle className="h-3.5 w-3.5" />
                {tile.comments}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default MomentsCollage;
