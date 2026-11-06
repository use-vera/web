"use client";

import { Skeleton } from "@/components/ui/skeleton";
import DisplayHeading from "@/components/vera/display-heading";
import EventRow from "@/components/vera/event-row";
import { useEvents } from "@/lib/hooks/use-events";
import Link from "next/link";

/** Real upcoming events in the app's list rows. Quietly absent if there are none. */
const HomeComingUp = () => {
  const eventsQuery = useEvents({ filter: "upcoming", limit: 4 });
  const events = eventsQuery.data?.items ?? [];

  if (!eventsQuery.isLoading && !events.length) {
    return null;
  }

  return (
    <section aria-labelledby="coming-up" className="mx-auto max-w-[1240px] px-[clamp(16px,4vw,40px)] pb-[clamp(64px,8vw,112px)]">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <DisplayHeading id="coming-up" lead="coming" accent="up." className="text-[clamp(40px,5.4vw,72px)]" />
        <Link href="/events" className="text-base font-semibold transition-colors hover:text-primary">
          All events →
        </Link>
      </div>
      <div className="border-t border-border">
        {eventsQuery.isLoading
          ? Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="flex items-center gap-5 border-b border-border py-[18px]">
                <Skeleton className="h-[72px] w-[72px] rounded-2xl" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-6 w-2/3" />
                </div>
              </div>
            ))
          : events.map((event) => <EventRow key={event._id} event={event} />)}
      </div>
    </section>
  );
};

export default HomeComingUp;
