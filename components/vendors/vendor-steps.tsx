import { Eyebrow } from "@/components/vera/display-heading";
import VendorPhoto from "@/components/vendors/vendor-photo";
import { VENDOR_STEPS } from "@/lib/vendor-content";

const VendorSteps = () => {
  return (
    <section
      id="how-it-works"
      className="mx-auto max-w-[1240px] scroll-mt-24 px-[clamp(16px,4vw,40px)] py-[clamp(64px,8vw,120px)]"
    >
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <Eyebrow>How it works</Eyebrow>
          <h2 style={{ lineHeight: 0.92 }} className="mt-5 text-[clamp(40px,5.5vw,80px)] font-extrabold tracking-[-0.05em] text-foreground">
            three things happen.
            <span className="block text-primary">you only do one.</span>
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
            Vera handles the taking of the order and the money. You cook and
            hand over.
          </p>

          <VendorPhoto
            hint="Photo: a vendor handing an order over at a stall"
            alt="A vendor handing an order to a customer at an event"
            className="mt-10 hidden aspect-4/3 overflow-hidden rounded-[32px] lg:block"
            sizes="(min-width: 1024px) 40vw, 100vw"
            src="/images/vendor-how-it-works.png"
          />
        </div>

        <ol className="relative flex flex-col gap-10">
          <span
            aria-hidden="true"
            className="absolute top-4 bottom-4 left-[1.4375rem] w-px bg-border"
          />

          {VENDOR_STEPS.map((step, index) => (
            <li key={step.title} className="relative flex gap-6">
              <span className="z-10 flex h-11.5 w-11.5 shrink-0 items-center justify-center rounded-full bg-foreground text-base font-extrabold text-background">
                {index + 1}
              </span>
              <div className="pt-1.5">
                <h3 className="text-2xl font-extrabold tracking-[-0.02em] text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2.5 max-w-md text-base leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default VendorSteps;
