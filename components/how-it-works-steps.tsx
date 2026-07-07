import { HOW_IT_WORKS_STEPS } from "@/lib/how-it-works-content";
import { cn } from "@/lib/utils";

const OFFSETS = ["md:mt-0", "md:mt-16", "md:mt-4", "md:mt-20"];

const HowItWorksSteps = () => {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-6">
        {HOW_IT_WORKS_STEPS.map((step, index) => (
          <div
            key={step.number}
            className={cn("relative", OFFSETS[index % OFFSETS.length])}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-10 -left-2 text-[7rem] leading-none font-extrabold text-foreground/5 select-none"
            >
              {step.number}
            </span>

            <div className="relative flex flex-col gap-3 rounded-2xl border border-border bg-card p-6">
              <span className="text-xs font-bold text-primary">
                {step.number}
              </span>
              <h3 className="text-xl font-bold text-card-foreground">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorksSteps;
