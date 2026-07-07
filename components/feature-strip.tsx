import PerforatedDivider from "@/components/perforated-divider";
import { QrCode, ShieldCheck, Users } from "lucide-react";

const items = [
  {
    icon: ShieldCheck,
    label: "Verified organizers",
  },
  {
    icon: QrCode,
    label: "One-tap check-in",
  },
  {
    icon: Users,
    label: "Follow real taste",
  },
];

const FeatureStrip = () => {
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

export default FeatureStrip;
