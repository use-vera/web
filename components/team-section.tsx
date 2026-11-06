"use client";

import Reveal from "@/components/motion/reveal";
import DisplayHeading, { Eyebrow } from "@/components/vera/display-heading";
import { POSTER_TONES, toneFor } from "@/components/vera/event-poster";
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
  const dimensions = size === "card" ? "aspect-[4/4.4] w-full" : "h-88 w-80";
  /* No photo yet: initials on a poster colour, the same as an event without artwork. */
  const tone = POSTER_TONES[toneFor(member.name)];

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-[28px]",
        dimensions,
      )}
      style={member.imageUrl ? undefined : { backgroundColor: tone.bg, color: tone.fg }}
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
            "flex h-full w-full items-end p-6 font-extrabold tracking-[-0.04em]",
            size === "card" ? "text-7xl" : "text-8xl",
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
    <section className="mx-auto flex max-w-[1240px] flex-col gap-4 px-[clamp(16px,4vw,40px)] py-[clamp(48px,7vw,96px)]">
      <div className="flex flex-col gap-5">
        <Eyebrow>The team</Eyebrow>
        <DisplayHeading lead="built by people who" accent="go out too." breakBeforeAccent />
      </div>

      <div className="mt-10 grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-x-6 gap-y-10">
        {TEAM_MEMBERS.map((member, index) => (
          <Reveal key={member.name} delay={index * 0.08} y={20}>
            <motion.button
              type="button"
              onClick={() => setSelected(member)}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="flex w-full cursor-pointer flex-col items-start gap-3.5 text-left"
            >
              <MemberPortrait member={member} size="card" />
              <div className="flex flex-col gap-0.5">
                <span className="text-xl font-bold tracking-[-0.015em] text-foreground">
                  {member.name}
                </span>
                <span className="text-sm font-semibold text-muted-foreground">
                  {member.title}
                </span>
              </div>
              <p className="line-clamp-2 text-[15px] leading-relaxed text-muted-foreground">
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
