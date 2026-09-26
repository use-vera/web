import {
  VENDOR_FEATURES,
  type VendorFeatureIcon,
} from "@/lib/vendor-content";
import {
  CalendarCheck,
  KeySquare,
  QrCode,
  ToggleLeft,
  UtensilsCrossed,
  Wallet,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<VendorFeatureIcon, LucideIcon> = {
  menu: UtensilsCrossed,
  stock: ToggleLeft,
  qr: QrCode,
  codes: KeySquare,
  wallet: Wallet,
  invites: CalendarCheck,
};

const VendorFeatureGrid = () => {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          What you get
        </span>
        <h2 className="mt-3 text-3xl font-bold tracking-[-0.01em] text-foreground sm:text-4xl">
          Built for a stall on a busy night.
        </h2>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {VENDOR_FEATURES.map((feature) => {
          const Icon = iconMap[feature.icon];

          return (
            <div
              key={feature.title}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-card-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.body}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default VendorFeatureGrid;
