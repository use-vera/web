export interface HowItWorksStep {
  number: string;
  title: string;
  description: string;
}

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    number: "01",
    title: "Find it.",
    description:
      "For You, This Week, or My Circle, a feed built around events you'd actually want to go to, not just whatever's nearby.",
  },
  {
    number: "02",
    title: "Book it.",
    description:
      "Pick a tier, see the real total upfront, and pay. No refreshing a queue, no scalper markup, no surprise fees at checkout.",
  },
  {
    number: "03",
    title: "Walk in.",
    description:
      "Your ticket is a QR code, not a screenshot someone can duplicate. One scan at the door and you're in.",
  },
  {
    number: "04",
    title: "Relive it.",
    description:
      "Post the moment, comment on everyone else's, and follow the people whose taste got you there in the first place.",
  },
];

export interface HowItWorksFaq {
  question: string;
  answer: string;
}

export const HOW_IT_WORKS_FAQS: HowItWorksFaq[] = [
  {
    question: "How do I know a ticket is real?",
    answer:
      "Every ticket on Vera is a unique QR code tied to your account and generated at the point of sale. It can't be screenshotted and reused — the gate scanner marks it used the moment you walk in.",
  },
  {
    question: "Can I resell a ticket if I can't go anymore?",
    answer:
      "Yes. List it from your ticket screen and it goes into that event's resale marketplace, capped at face value — no scalper pricing, and the buyer gets a fresh verified ticket.",
  },
  {
    question: "What happens if an event is cancelled?",
    answer:
      "You're refunded automatically to your original payment method. You'll also get a notification as soon as the organizer marks the event cancelled.",
  },
  {
    question: "Is my payment information safe?",
    answer:
      "Vera never stores your card details. Payments run through Paystack's secure checkout, and we only ever see the confirmation, not your card.",
  },
  {
    question: "Do I need a ticket to see an event's moments?",
    answer:
      "No — public event feeds are open to everyone. You only need a ticket to unlock that event's group chat.",
  },
  {
    question: "What if I bought the wrong ticket tier?",
    answer:
      "Reach out from the ticket detail screen before the event starts. Organizers can approve a tier change or a refund, and most respond within a day.",
  },
];
