import VendorPhoto from "@/components/vendors/vendor-photo";
import { VENDOR_STEPS } from "@/lib/vendor-content";

const VendorSteps = () => {
  return (
    <section
      id="how-it-works"
      className="mx-auto max-w-6xl scroll-mt-24 px-6 py-16 sm:py-24"
    >
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            How it works
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.01em] text-foreground sm:text-4xl">
            Three things happen.
            <br />
            You only do one of them.
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-foreground/70">
            Vera handles the taking of the order and the money. You cook and
            hand over.
          </p>

          <VendorPhoto
            hint="Photo: a vendor handing an order over at a stall"
            alt="A vendor handing an order to a customer at an event"
            className="mt-10 hidden aspect-4/3 lg:block"
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
              <span className="z-10 flex h-11.5 w-11.5 shrink-0 items-center justify-center rounded-full border border-border bg-card text-base font-extrabold text-primary">
                {index + 1}
              </span>
              <div className="pt-1.5">
                <h3 className="text-xl font-bold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2.5 max-w-md text-[15px] leading-relaxed text-foreground/70">
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
