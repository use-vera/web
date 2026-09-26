"use client";

import EventVendorsPanel from "@/components/organizer/event-vendors-panel";
import { useParams } from "next/navigation";

const EventVendorsPage = () => {
  const params = useParams<{ eventId: string }>();

  return <EventVendorsPanel eventId={params.eventId} />;
};

export default EventVendorsPage;
