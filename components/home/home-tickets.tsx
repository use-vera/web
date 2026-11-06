import DisplayHeading, { Eyebrow } from "@/components/vera/display-heading";
import { IMAGES } from "@/lib/images";
import Image from "next/image";

const PROMISES = [
  { title: "Resale, capped", text: "Can't make it? Resell inside Vera at a capped price. No scalper markups." },
  { title: "Send it to a friend", text: "Pass a ticket on by @handle or email. They get their own code." },
  { title: "One scan at the door", text: "Your code works offline, and the door checks it in a second." },
];

/* A plain QR-like mark for the sample ticket: decoration, not a scannable code. */
const QR_CELLS = [
  [0, 0, 7, 7], [14, 0, 7, 7], [0, 14, 7, 7], [9, 1, 2, 2], [8, 5, 3, 1], [12, 8, 2, 3], [9, 9, 2, 2],
  [15, 9, 4, 1], [17, 11, 2, 3], [9, 13, 3, 2], [13, 15, 2, 4], [16, 17, 3, 2], [9, 17, 2, 3], [1, 9, 4, 2], [3, 12, 2, 1],
];

/** Three plain promises beside a ticket hanging over the old sunglasses illustration. */
const HomeTickets = () => (
  <section aria-labelledby="tickets" className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-[clamp(40px,6vw,80px)] px-[clamp(16px,4vw,40px)] pb-[clamp(64px,8vw,120px)]">
    <div className="flex min-w-0 flex-[1_1_400px] flex-col gap-6">
      <Eyebrow>Tickets</Eyebrow>
      <DisplayHeading id="tickets" lead="tickets that" accent="behave." breakBeforeAccent />
      <dl className="max-w-[480px] border-t border-border">
        {PROMISES.map((promise) => (
          <div key={promise.title} className="flex flex-col gap-1 border-b border-border py-4">
            <dt className="text-[17px] font-bold">{promise.title}</dt>
            <dd className="text-[15px] leading-normal text-muted-foreground">{promise.text}</dd>
          </div>
        ))}
      </dl>
    </div>

    <div className="flex w-full min-w-0 max-w-[480px] flex-[1_1_380px] flex-col" aria-hidden="true">
      <div className="flex h-[300px] items-start justify-center overflow-hidden rounded-[32px] bg-[#8DC7EF] pt-4">
        <Image src={IMAGES.illustrationsSunglasses} alt="" width={1000} height={1000} className="h-[290px] w-auto" />
      </div>
      <div className="dark mx-5 -mt-28 flex flex-col gap-5 rounded-[32px] border-4 border-[#F5F3EF] bg-background p-7 text-foreground">
        <div className="flex items-center justify-between text-[13px] font-semibold text-muted-foreground">
          <span>Your ticket</span>
          <span>General</span>
        </div>
        <span className="text-4xl leading-[0.95] font-extrabold tracking-[-0.04em]">Saturday, sorted.</span>
        <div className="flex items-center gap-4 rounded-3xl bg-[#F5F3EF] p-4 text-[#16150F]">
          <svg viewBox="0 0 21 21" className="h-28 w-28 shrink-0" shapeRendering="crispEdges">
            {QR_CELLS.map(([x, y, w, h]) => (
              <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} fill="#16150F" />
            ))}
            <rect x="1" y="1" width="5" height="5" fill="#F5F3EF" />
            <rect x="15" y="1" width="5" height="5" fill="#F5F3EF" />
            <rect x="1" y="15" width="5" height="5" fill="#F5F3EF" />
            <rect x="2" y="2" width="3" height="3" fill="#16150F" />
            <rect x="16" y="2" width="3" height="3" fill="#16150F" />
            <rect x="2" y="16" width="3" height="3" fill="#16150F" />
          </svg>
          <span className="flex flex-col gap-2.5">
            <span className="flex flex-col">
              <span className="text-[11px] font-bold text-[#7A786C]">HOLDER</span>
              <span className="text-lg font-bold">You</span>
            </span>
            <span className="flex flex-col">
              <span className="text-[11px] font-bold text-[#7A786C]">ENTRY</span>
              <span className="text-lg font-bold">Scan at the door</span>
            </span>
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {["Send", "Resell", "Get there"].map((label) => (
            <span key={label} className="rounded-2xl border-[1.5px] border-border px-2 py-3.5 text-center text-[13px] font-semibold">
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default HomeTickets;
