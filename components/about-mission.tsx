/** The one paragraph that says what Vera is, set large on a hairline, like a pull quote. */
const AboutMission = () => {
  return (
    <section className="mx-auto max-w-[1240px] px-[clamp(16px,4vw,40px)] py-[clamp(40px,6vw,80px)]">
      <p className="max-w-[960px] border-t border-border pt-8 text-[clamp(24px,3vw,38px)] leading-[1.25] font-semibold tracking-[-0.02em] text-foreground">
        Vera is the all-in-one events app built for how people actually go out: find something happening near you, grab a
        ticket without a markup or a scam, follow the people whose taste you trust, and keep the moments from an event worth
        remembering. <span className="text-muted-foreground">All in one place, from the first announcement to the last photo dump.</span>
      </p>
    </section>
  );
};

export default AboutMission;
