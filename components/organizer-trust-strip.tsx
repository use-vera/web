const items = ["No setup fee", "Payouts in 24–48h", "Verified check-in"];

/** Three plain promises, set large between hairlines. */
const OrganizerTrustStrip = () => {
  return (
    <section className="mx-auto max-w-[1240px] px-[clamp(16px,4vw,40px)]">
      <ul className="grid grid-cols-1 border-y border-border sm:grid-cols-3">
        {items.map((item, index) => (
          <li
            key={item}
            className="flex items-center gap-3 border-border py-7 text-[clamp(22px,2.4vw,30px)] font-extrabold tracking-[-0.03em] sm:border-l sm:pl-6 sm:first:border-l-0 sm:first:pl-0 [&:not(:first-child)]:border-t sm:[&:not(:first-child)]:border-t-0"
          >
            <span className="text-sm font-bold text-primary">{String(index + 1).padStart(2, "0")}</span>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default OrganizerTrustStrip;
