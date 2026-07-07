import { cn } from "@/lib/utils";
import { Bookmark, Heart, MessageCircle, Send, Ticket } from "lucide-react";

type PhoneMockupVariant = "feed" | "ticket" | "chat";

interface PhoneMockupProps {
  variant: PhoneMockupVariant;
  className?: string;
}

const FeedScreen = () => (
  <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-[#0c8f5a] via-[#16150f] to-[#16150f]">
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />

    <div className="relative flex h-full flex-col justify-between p-4">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full border-2 border-white/40 bg-white/20" />
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-white">
            Afrobeats Night — Lagos
          </span>
          <span className="text-[10px] text-white/60">2h ago</span>
        </div>
      </div>

      <div className="flex items-end justify-between gap-3">
        <p className="max-w-[65%] text-sm font-medium leading-snug text-white">
          The moment the whole floor sang the hook back 🔥
        </p>

        <div className="flex flex-col items-center gap-3">
          <div className="flex flex-col items-center gap-1">
            <Heart className="h-6 w-6 fill-white text-white" />
            <span className="text-[10px] font-semibold text-white">482</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <MessageCircle className="h-6 w-6 text-white" />
            <span className="text-[10px] font-semibold text-white">96</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Bookmark className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const TicketScreen = () => (
  <div className="flex h-full w-full flex-col bg-background p-4">
    <span className="mb-3 text-xs font-semibold text-muted-foreground">
      My ticket
    </span>

    <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex flex-col gap-1 p-4">
        <div className="flex items-center gap-1.5 text-primary">
          <Ticket className="h-3.5 w-3.5" />
          <span className="text-[10px] font-semibold uppercase tracking-wide">
            General admission
          </span>
        </div>
        <span className="text-sm font-bold text-card-foreground">
          Afrobeats Night — Lagos
        </span>
        <span className="text-xs text-muted-foreground">
          Sat, Jul 12 · 9:00 PM · Landmark Beach
        </span>
      </div>

      <div className="ticket-perforation" />

      <div className="flex flex-1 items-center justify-center gap-3 p-4">
        <div className="grid h-16 w-16 shrink-0 grid-cols-4 grid-rows-4 gap-0.5 rounded-md bg-foreground p-1.5">
          {Array.from({ length: 16 }, (_, i) => (
            <div
              key={i}
              className={cn(
                "rounded-[1px]",
                [1, 2, 5, 8, 11, 14].includes(i)
                  ? "bg-background"
                  : "bg-transparent",
              )}
            />
          ))}
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-muted-foreground">
            Ticket holder
          </span>
          <span className="text-xs font-semibold text-card-foreground">
            Amara O.
          </span>
          <span className="mt-1 text-[10px] text-muted-foreground">
            Scan at the door
          </span>
        </div>
      </div>
    </div>
  </div>
);

const ChatScreen = () => (
  <div className="flex h-full w-full flex-col justify-end gap-2 bg-background p-4">
    <div className="mb-2 flex items-center gap-2">
      <div className="h-7 w-7 rounded-full bg-accent" />
      <span className="text-xs font-semibold text-foreground">
        Afrobeats Night chat
      </span>
    </div>

    <div className="flex flex-col gap-2">
      <div className="max-w-[75%] self-start rounded-2xl rounded-bl-sm bg-secondary px-3 py-2 text-xs text-secondary-foreground">
        anyone know if there&apos;s parking nearby?
      </div>
      <div className="max-w-[75%] self-end rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-xs text-primary-foreground">
        yes! valet right at the gate 🙌
      </div>
      <div className="max-w-[75%] self-start rounded-2xl rounded-bl-sm bg-secondary px-3 py-2 text-xs text-secondary-foreground">
        see you all there tonight
      </div>
    </div>

    <div className="mt-2 flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2">
      <span className="flex-1 text-xs text-muted-foreground">
        Message the group
      </span>
      <Send className="h-4 w-4 text-primary" />
    </div>
  </div>
);

const screensByVariant: Record<PhoneMockupVariant, React.FC> = {
  feed: FeedScreen,
  ticket: TicketScreen,
  chat: ChatScreen,
};

const PhoneMockup = ({ variant, className }: PhoneMockupProps) => {
  const Screen = screensByVariant[variant];

  return (
    <div
      className={cn(
        "relative aspect-[9/18.5] w-[240px] rounded-[2.5rem] border-[6px] border-foreground bg-foreground shadow-2xl",
        className,
      )}
    >
      <div className="absolute left-1/2 top-0 z-10 h-5 w-24 -translate-x-1/2 rounded-b-xl bg-foreground" />
      <div className="h-full w-full overflow-hidden rounded-[2rem]">
        <Screen />
      </div>
    </div>
  );
};

export default PhoneMockup;
