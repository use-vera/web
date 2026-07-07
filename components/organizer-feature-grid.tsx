import {
  ORGANIZER_FEATURES,
  type OrganizerFeature,
} from "@/lib/organizer-content";
import {
  MessageCircle,
  QrCode,
  ShieldCheck,
  Sparkles,
  Ticket,
  Wallet,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<OrganizerFeature["icon"], LucideIcon> = {
  ticket: Ticket,
  wallet: Wallet,
  qrcode: QrCode,
  shield: ShieldCheck,
  sparkles: Sparkles,
  message: MessageCircle,
};

const OrganizerFeatureGrid = () => {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          Everything you need
        </span>
        <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
          One dashboard, from listing to payout.
        </h2>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ORGANIZER_FEATURES.map((feature) => {
          const Icon = iconMap[feature.icon];

          return (
            <div
              key={feature.title}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-card-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default OrganizerFeatureGrid;
