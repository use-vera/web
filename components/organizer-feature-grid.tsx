import DisplayHeading, { Eyebrow } from "@/components/vera/display-heading";
import { ORGANIZER_FEATURES } from "@/lib/organizer-content";

/** What the dashboard does, numbered on hairlines: no icon cards. */
const OrganizerFeatureGrid = () => {
  return (
    <section className="mx-auto flex max-w-[1240px] flex-col gap-12 px-[clamp(16px,4vw,40px)] py-[clamp(64px,8vw,120px)]">
      <div className="flex flex-col gap-5">
        <Eyebrow>Everything you need</Eyebrow>
        <DisplayHeading lead="one dashboard, from listing" accent="to payout." breakBeforeAccent />
      </div>

      <ol className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] border-t border-border">
        {ORGANIZER_FEATURES.map((feature, index) => (
          <li key={feature.title} className="flex flex-col gap-2 border-b border-border py-7 pr-8">
            <span className="text-[13px] font-bold text-primary">{String(index + 1).padStart(2, "0")}</span>
            <h3 className="text-xl font-bold tracking-[-0.01em]">{feature.title}</h3>
            <p className="text-[15px] leading-relaxed text-muted-foreground">{feature.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default OrganizerFeatureGrid;
