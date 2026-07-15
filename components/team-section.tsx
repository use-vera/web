"use client";

import Reveal from "@/components/motion/reveal";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TEAM_MEMBERS, type TeamMember } from "@/lib/team-members";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";

interface MemberPortraitProps {
  member: TeamMember;
  size: "card" | "modal";
}

const getInitials = (name: string) => {
  const nameArr = name?.split(" ");
  const firstNameFirstLetter = nameArr?.[0]?.[0];
  const lastNameFirstletter = nameArr?.[1]?.[0];

  return `${firstNameFirstLetter}${lastNameFirstletter}`;
};

const MemberPortrait = ({ member, size }: MemberPortraitProps) => {
  const dimensions = size === "card" ? "h-72 w-full" : "h-88 w-80";

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-2xl",
        dimensions,
      )}
    >
      {member.imageUrl ? (
        <Image
          src={member.imageUrl}
          alt={member.name}
          fill
          sizes={size === "card" ? "256px" : "320px"}
          className="object-cover"
        />
      ) : (
        <div
          className={cn(
            "flex h-full w-full items-center justify-center bg-accent font-bold text-accent-foreground",
            size === "card" ? "text-6xl" : "text-7xl",
          )}
        >
          {getInitials(member?.name)}
        </div>
      )}
    </div>
  );
};

const TeamSection = () => {
  const [selected, setSelected] = useState<TeamMember | null>(null);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 flex flex-col gap-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          The team
        </span>
        <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
          Built by people who go out too.
        </h2>
      </div>

      <div className="mt-12 flex items-stretch justify-center flex-wrap gap-8">
        {TEAM_MEMBERS.map((member, index) => (
          <Reveal key={member.name} delay={index * 0.08} y={20}>
            <motion.button
              type="button"
              onClick={() => setSelected(member)}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="flex w-94 flex-col items-center gap-4 rounded-2xl p-4 text-center transition-colors hover:bg-secondary/60"
            >
              <MemberPortrait member={member} size="card" />
              <div className="flex flex-col gap-0.5">
                <span className="text-base font-bold text-foreground">
                  {member.name}
                </span>
                <span className="text-sm font-semibold text-primary">
                  {member.title}
                </span>
              </div>
              <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {member.bio}
              </p>
            </motion.button>
          </Reveal>
        ))}
      </div>

      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent aria-describedby={undefined}>
          {selected ? (
            <div className="flex flex-col items-center gap-4 p-8 pt-12 text-center">
              <MemberPortrait member={selected} size="modal" />
              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-bold text-card-foreground">
                  {selected.name}
                </h3>
                <span className="text-sm font-semibold text-primary">
                  {selected.title}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {selected.bio}
              </p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default TeamSection;
