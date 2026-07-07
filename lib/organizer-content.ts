export interface OrganizerFeature {
  icon:
    | "ticket"
    | "wallet"
    | "qrcode"
    | "shield"
    | "sparkles"
    | "message";
  title: string;
  description: string;
}

export const ORGANIZER_FEATURES: OrganizerFeature[] = [
  {
    icon: "ticket",
    title: "Sell every tier you need",
    description:
      "General admission, VIP, early bird — set up as many ticket tiers as your event needs, in minutes.",
  },
  {
    icon: "wallet",
    title: "Get paid in 24–48 hours",
    description:
      "Payouts land automatically after your event ends. No invoices to chase, no manual payout requests.",
  },
  {
    icon: "qrcode",
    title: "Verify entry in one scan",
    description:
      "Every ticket is a unique QR code. Your door staff scan it once, and a duplicate or screenshot simply won't work twice.",
  },
  {
    icon: "shield",
    title: "Resale that can't get scalped",
    description:
      "Fans can resell a ticket they can't use anymore, but only at face value — nobody profits off your event but you.",
  },
  {
    icon: "sparkles",
    title: "Get in front of more people",
    description:
      "Paid featured placement puts your event where people are already browsing, on top of organic discovery.",
  },
  {
    icon: "message",
    title: "Community built in",
    description:
      "Every ticket holder gets access to your event's group chat and moments feed — no extra setup required.",
  },
];

export interface OrganizerFaq {
  question: string;
  answer: string;
}

export const ORGANIZER_FAQS: OrganizerFaq[] = [
  {
    question: "How much does it cost to list an event?",
    answer:
      "Listing is free. Vera takes a 5% service fee only on tickets that actually sell — no monthly subscription, no setup cost.",
  },
  {
    question: "When do I get paid?",
    answer:
      "Payouts are released automatically 24–48 hours after your event ends, straight to the bank account on your organizer profile.",
  },
  {
    question: "What if I need to cancel my event?",
    answer:
      "You can cancel from your organizer dashboard at any time before the event starts. Every ticket holder is refunded automatically and notified immediately.",
  },
  {
    question: "How does featured placement work?",
    answer:
      "Featured slots are paid and limited per day, shown in the Events tab's discovery section. You can activate one from your event's manage screen.",
  },
  {
    question: "Do I need a registered business to host?",
    answer:
      "No. Individuals and registered businesses can both host events on Vera — you'll just need a valid bank account for payouts.",
  },
  {
    question: "Can I manage more than one event at a time?",
    answer:
      "Yes, your organizer dashboard lists every event you host, with its own sales, check-in, and chat, all in one place.",
  },
];
