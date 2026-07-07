export interface HomeFaq {
  question: string;
  answer: string;
}

export const HOME_FAQS: HomeFaq[] = [
  {
    question: "Is Vera free to use?",
    answer:
      "Browsing, following, and posting moments are free. Organizers keep 100% of face value on every ticket, we just take a small, transparent service fee at checkout.",
  },
  {
    question: "How do I know a ticket is real?",
    answer:
      "Every ticket is a QR code tied to your account, not a screenshot. Resale only happens through Vera at a price capped at face value, so there's no scalper markup and no duplicate tickets at the door.",
  },
  {
    question: "Can I get a refund?",
    answer:
      "If an event is cancelled or rescheduled, you're refunded automatically. Otherwise, list your ticket for resale in the app at your original price, capped, no losses to a middleman.",
  },
  {
    question: "Do I need the app to buy a ticket?",
    answer:
      "You can browse and buy right here on the web. You'll just need the app to show your QR code at the door, follow people, and see the moments from the event afterward.",
  },
];
