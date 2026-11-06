import { POSTER_TONES } from "@/components/vera/event-poster";
import { HOW_IT_WORKS_STEPS } from "@/lib/how-it-works-content";

/* One poster colour per step, in the app's order, so the four read as a set. */
const STEP_TONES = [POSTER_TONES.yellow, POSTER_TONES.pink, POSTER_TONES.blue, POSTER_TONES.green];

/** Four steps as four flat poster tiles: the number set huge, the words under it. */
const HowItWorksSteps = () => {
  return (
    <section aria-label="The steps" className="mx-auto max-w-[1240px] px-[clamp(16px,4vw,40px)] py-[clamp(32px,5vw,64px)]">
      <ol className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
        {HOW_IT_WORKS_STEPS.map((step, index) => {
          const tone = STEP_TONES[index % STEP_TONES.length];
          return (
            <li
              key={step.number}
              className="flex min-h-[340px] flex-col justify-between gap-6 rounded-[28px] p-7"
              style={{ backgroundColor: tone.bg, color: tone.fg }}
            >
              <span aria-hidden="true" style={{ lineHeight: 0.85 }} className="text-[96px] font-extrabold tracking-[-0.06em]">
                {step.number}
              </span>
              <span className="flex flex-col gap-2.5">
                <h3 className="text-2xl font-extrabold tracking-[-0.02em]">{step.title}</h3>
                <p className="text-[15px] leading-relaxed opacity-80">{step.description}</p>
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
};

export default HowItWorksSteps;
