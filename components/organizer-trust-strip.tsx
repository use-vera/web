import PerforatedDivider from "@/components/perforated-divider";
import { Clock, ShieldCheck, Wallet } from "lucide-react";

const items = [
  { icon: Wallet, label: "No setup fee" },
  { icon: Clock, label: "Payouts in 24–48h" },
  { icon: ShieldCheck, label: "Verified check-in" },
];

const OrganizerTrustStrip = () => {
  return (
    <section className="mx-auto max-w-6xl px-6">
      <PerforatedDivider />
      <div className="grid grid-cols-1 gap-6 py-8 sm:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-center gap-2.5 text-foreground"
          >
            <item.icon className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">{item.label}</span>
          </div>
        ))}
      </div>
      <PerforatedDivider />
    </section>
  );
};

export default OrganizerTrustStrip;
