import DisplayHeading, { Eyebrow } from "@/components/vera/display-heading";
import { IMAGES } from "@/lib/images";
import Image from "next/image";

/* The Together screen's people list. Ring colours as in the app: green has a ticket, gold owes, dashed is invited. */
const PEOPLE = [
  { initials: "YO", avatar: "bg-[#DDF3E9] text-[#0C8F5A]", ring: "border-primary", name: "You", note: "Has a ticket · started the group", noteClass: "text-[#0C8F5A]" },
  { initials: "AO", avatar: "bg-[#FBE3EA] text-[#8E3A50]", ring: "border-[#9a6a14]", name: "Ada", note: "Has your second ticket · owes her share", noteClass: "text-[#9a6a14]", action: "Nudge" },
  { initials: "CO", avatar: "bg-[#DCEBF6] text-[#1F5577]", ring: "border-primary", name: "Chidi", note: "Bought his own", noteClass: "text-[#0C8F5A]" },
  { initials: "TA", avatar: "bg-[#ECE8DC] text-[#4A4A40]", ring: "border-dashed border-muted-foreground", name: "Tola", note: "Invited 2h ago", noteClass: "text-muted-foreground", action: "Remind" },
];

/** One buys, everyone's in: the old friends illustration on poster pink, the group's list over its foot. */
const HomeTogether = () => (
  <section aria-labelledby="together" className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-[clamp(40px,6vw,80px)] px-[clamp(16px,4vw,40px)] py-[clamp(64px,8vw,120px)]">
    <div className="flex min-w-0 flex-[1_1_400px] flex-col gap-6">
      <Eyebrow>Going together</Eyebrow>
      <DisplayHeading id="together" lead="one buys." accent="everyone's in." breakBeforeAccent />
      <p className="max-w-[440px] text-lg leading-relaxed text-muted-foreground">
        Start a group for the event, send your friends their tickets, and let them pay you back in the app. The group gets
        its own chat, and a nudge goes to whoever forgot.
      </p>
    </div>

    <div className="flex w-full min-w-0 max-w-[520px] flex-[1_1_420px] flex-col" aria-hidden="true">
      <div className="flex h-[340px] items-start justify-center overflow-hidden rounded-[32px] bg-[#F0B9C7] pt-5">
        <Image src={IMAGES.illustrationsFriends} alt="" width={1000} height={1000} className="h-[300px] w-auto" />
      </div>
      <div className="mx-5 -mt-24 flex flex-col rounded-3xl bg-background px-5 pt-1 pb-2">
        {PEOPLE.map((person) => (
          <div key={person.name} className="flex items-center gap-3.5 border-b border-border py-3.5 last:border-b-0">
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 ${person.ring}`}>
              <span className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-extrabold ${person.avatar}`}>
                {person.initials}
              </span>
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-base font-bold">{person.name}</span>
              <span className={`text-[13px] ${person.noteClass}`}>{person.note}</span>
            </span>
            {person.action ? (
              <span className="flex h-9 items-center rounded-full border-[1.5px] border-border px-3.5 text-[13px] font-semibold">
                {person.action}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HomeTogether;
