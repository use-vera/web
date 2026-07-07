import Link from "next/link";

const ManifestoBand = () => {
  return (
    <section className="ticket-dot-texture">
      <div className="mx-auto max-w-2xl px-6 py-20 text-center sm:py-24">
        <p className="text-xl leading-relaxed text-foreground sm:text-2xl">
          Group chats lose the flyer. Screenshots get faked. Scalpers double
          the price by the door.{" "}
          <span className="text-muted-foreground">
            Going out shouldn&apos;t take this much work.
          </span>
        </p>

        <p className="mt-6 text-xl leading-relaxed text-foreground sm:text-2xl">
          So Vera puts the whole night in one place: find it, buy it at a
          real price, get in with one scan, and keep the moment after.
        </p>

        <Link
          href="/about"
          className="mt-8 inline-flex text-sm font-semibold text-foreground underline-offset-4 hover:underline"
        >
          Read our story →
        </Link>
      </div>
    </section>
  );
};

export default ManifestoBand;
