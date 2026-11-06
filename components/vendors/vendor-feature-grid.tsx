import DisplayHeading, { Eyebrow } from "@/components/vera/display-heading";
import { VENDOR_FEATURES } from "@/lib/vendor-content";

/** What a vendor gets, numbered on hairlines: no icon cards. */
const VendorFeatureGrid = () => {
  return (
    <section className="mx-auto flex max-w-[1240px] flex-col gap-12 px-[clamp(16px,4vw,40px)] py-[clamp(64px,8vw,120px)]">
      <div className="flex flex-col gap-5">
        <Eyebrow>What you get</Eyebrow>
        <DisplayHeading lead="built for a stall at" accent="a busy event." breakBeforeAccent />
      </div>

      <ol className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] border-t border-border">
        {VENDOR_FEATURES.map((feature, index) => (
          <li key={feature.title} className="flex flex-col gap-2 border-b border-border py-7 pr-8">
            <span className="text-[13px] font-bold text-primary">{String(index + 1).padStart(2, "0")}</span>
            <h3 className="text-xl font-bold tracking-[-0.01em]">{feature.title}</h3>
            <p className="text-[15px] leading-relaxed text-muted-foreground">{feature.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default VendorFeatureGrid;
