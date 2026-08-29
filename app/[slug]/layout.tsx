import { PAGE_FONT_VARIABLES } from "@/lib/page-fonts";
import { type ReactNode } from "react";

/* The published page wears whichever family the organizer's theme names. */
const EventPageLayout = ({ children }: { children: ReactNode }) => (
  <div className={PAGE_FONT_VARIABLES}>{children}</div>
);

export default EventPageLayout;
