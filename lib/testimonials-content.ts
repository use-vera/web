export interface Testimonial {
  quote: string;
  name: string;
  context: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Bought a resale ticket for a sold-out show two hours before doors and it scanned fine. No 'the seller ghosted me' drama.",
    name: "Amara O.",
    context: "Ticket holder, Lagos",
  },
  {
    quote:
      "I follow three people whose taste I actually trust and Vera just tells me when they're going somewhere. That's the whole feature I wanted.",
    name: "Damilare A.",
    context: "Attendee, Abuja",
  },
  {
    quote:
      "Set up ticket tiers, capped resale, and check-in in one afternoon. Door staff scan, we walk away, no clipboard.",
    name: "Chiamaka E.",
    context: "Organizer, Port Harcourt",
  },
];
