/**
 * Copy and commercial terms for the vendor marketing page.
 *
 * The fee numbers are not settled yet. They live here so the whole page moves
 * when the decision is made, rather than being buried in six components.
 */
export const VENDOR_TERMS = {
  /** Vera's cut of each order. */
  feePercent: 5,
  /** Hours after an event ends before a vendor's money is sent to their bank. */
  payoutDelayHours: 24,
} as const;

export interface VendorStep {
  title: string;
  body: string;
}

export const VENDOR_STEPS: VendorStep[] = [
  {
    title: "Get booked",
    body: "Organizers invite you to their events, or you apply to the ones taking vendors. You see the crowd size and the terms before you say yes.",
  },
  {
    title: "Take orders",
    body: "Attendees order and pay from their seats. Orders land in one list you work through, so nobody crowds your stall waiting.",
  },
  {
    title: "Hand over and get paid",
    body: `Check the pickup code, hand the order over, done. Your money reaches your bank ${VENDOR_TERMS.payoutDelayHours} hours after the event ends.`,
  },
];

export type VendorFeatureIcon =
  | "menu"
  | "stock"
  | "qr"
  | "codes"
  | "wallet"
  | "invites";

export interface VendorFeature {
  icon: VendorFeatureIcon;
  title: string;
  body: string;
}

export const VENDOR_FEATURES: VendorFeature[] = [
  {
    icon: "menu",
    title: "A menu you build once",
    body: "Add what you sell with a photo and a price, group it your own way, and reuse it at every event you work.",
  },
  {
    icon: "stock",
    title: "Sold out in one tap",
    body: "Switch an item off the moment it runs out and buyers stop seeing it straight away. No more apologising at the stall.",
  },
  {
    icon: "codes",
    title: "Pickup codes, not guesswork",
    body: "Every order carries a four-digit code. Check it, hand the food over, and nobody collects someone else's order.",
  },
  {
    icon: "qr",
    title: "A code for walk-ups",
    body: "Print your stall code. People standing in front of you scan, order and pay, and it joins the same list as everything else.",
  },
  {
    icon: "wallet",
    title: "Money you can count",
    body: "Every order is paid before you cook it. See what each event made you, after fees, before the payout lands.",
  },
  {
    icon: "invites",
    title: "Work more events",
    body: "A rating that follows you from event to event, so organizers can find you and book you again.",
  },
];

export interface VendorFaq {
  question: string;
  answer: string;
}

export const VENDOR_FAQS: VendorFaq[] = [
  {
    question: "What do I need to start selling?",
    answer:
      "A Nigerian bank account and one thing to sell. No CAC registration, no ID upload and no documents to start. We confirm your account name with your bank, and that is the whole check.",
  },
  {
    question: "When do I get my money?",
    answer: `Orders are paid for up front, so nothing is cooked on credit. Your share reaches your bank ${VENDOR_TERMS.payoutDelayHours} hours after the event ends, once the orders have been collected.`,
  },
  {
    question: "What does it cost?",
    answer: `Nothing to join and no monthly fee. Vera takes ${VENDOR_TERMS.feePercent}% of each order. Some organizers also charge a stall fee for the spot, and you see that in full before you accept an invitation.`,
  },
  {
    question: "What if I run out, or cannot make an order?",
    answer:
      "Switch the item off and it stops selling immediately. If an order you have already taken cannot be filled, cancel it and the buyer is refunded automatically. You are not charged a fee on it.",
  },
  {
    question: "How do organizers find me?",
    answer:
      "Once you are set up you have a vendor page organizers can search on Vera, with your menu and your rating. You can also send the link to an organizer yourself, or apply to events that are taking vendors.",
  },
  {
    question: "Do I need a laptop at the event?",
    answer:
      "No. Your orders page works in a phone browser, so a phone at the stall is enough. Add it to your home screen and it alerts you when a new order comes in.",
  },
];
