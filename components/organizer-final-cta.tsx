import Button from "@/components/ui/button";

const OrganizerFinalCta = () => {
  return (
    <section className="mx-auto max-w-4xl px-6 pb-4 text-center">
      <div className="flex flex-col items-center gap-5 rounded-3xl border border-border bg-card px-8 py-14">
        <h2 className="text-3xl font-bold text-card-foreground sm:text-4xl">
          Ready to host your first event?
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          It takes about five minutes to list your first event and start
          selling tickets.
        </p>
        <Button size="lg">Start hosting free</Button>
      </div>
    </section>
  );
};

export default OrganizerFinalCta;
