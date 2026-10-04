import { type DiagramName } from "@/components/developers/doc-diagrams";
import { ERROR_CODES } from "@/lib/developer-docs/endpoints";

/**
 * The block vocabulary every guide page is written in.
 *
 * Guides are data rather than JSX so that the shell, the table of contents
 * and the "ask an assistant" buttons can all read the same source: a page's
 * headings become its contents list, and its prose becomes the context an
 * assistant is handed. Writing them as components would hide the text inside
 * markup none of those three can read.
 */
export type DocBlock =
  | { kind: "text"; body: string }
  | { kind: "heading"; text: string }
  | { kind: "code"; lang: string; code: string; label?: string }
  | {
      kind: "callout";
      tone: "tip" | "warning" | "note";
      title: string;
      body: string;
    }
  | {
      kind: "steps";
      items: {
        title: string;
        body: string;
        code?: { lang: string; code: string };
      }[];
    }
  /* With `src` this is a real screenshot; without one it stays a labelled
     slot whose alt text is the brief for whoever takes it. */
  | {
      kind: "image";
      alt: string;
      caption?: string;
      ratio?: "wide" | "tall";
      src?: string;
      width?: number;
      height?: number;
    }
  | { kind: "table"; columns: string[]; rows: string[][] }
  | { kind: "list"; items: string[] }
  /** Renders as a link into the API reference for that endpoint id. */
  | { kind: "endpoints"; ids: string[]; title?: string }
  /* Renders the real ERROR_CODES catalogue. A hand-written copy here would
     be a second list to keep in step with the backend, and the one that
     drifts is always the one in the prose. */
  | { kind: "errorCodes" }
  /** A prominent link out — to the demo app, or anywhere worth a click. */
  | { kind: "link"; href: string; title: string; body: string }
  /* A hand-drawn figure from doc-diagrams.tsx. Separate from `image`, which
     reserves a slot for a screenshot nobody has taken yet: these exist. */
  | { kind: "diagram"; name: DiagramName };

export interface Guide {
  slug: string;
  title: string;
  /** One line, shown under the title and in the guide index. */
  summary: string;
  /** Grouping in the sidebar. */
  section: "Getting started" | "Core concepts" | "Build a flow" | "Going live";
  /** Minutes, for the index cards. Omitted where it would be guesswork. */
  readingMinutes?: number;
  blocks: DocBlock[];
}

export const GUIDE_SECTIONS: Guide["section"][] = [
  "Getting started",
  "Core concepts",
  "Build a flow",
  "Going live",
];

const BASE_URL = "https://api.vera.dev";

export const GUIDES: Guide[] = [
  {
    slug: "introduction",
    title: "Introduction",
    summary:
      "What the Vera API does, what you can build with it, and how the pieces fit together.",
    section: "Getting started",
    readingMinutes: 4,
    blocks: [
      {
        kind: "text",
        body: "The Vera API lets you sell tickets, admit people at the door and issue refunds from your own site, app or back office. Everything the Vera apps do with tickets, your integration can do too, over one REST API.",
      },
      {
        kind: "text",
        body: "It is a JSON API over HTTPS. Requests authenticate with an API key, responses always come back in the same envelope, and every endpoint belongs to one of five groups: Events, Checkout Sessions, Orders, Tickets and Refunds.",
      },
      { kind: "heading", text: "What you can build" },
      {
        kind: "list",
        items: [
          "A ticket-buying flow on your own site, with Vera handling payment and ticket issuance.",
          "A door app that scans a code and admits the holder.",
          "A back office that lists orders and refunds them.",
          "A listings page that shows what is on sale, using a key that is safe to ship to a browser.",
        ],
      },
      { kind: "heading", text: "Base URL" },
      {
        kind: "text",
        body: `Every endpoint lives under \`${BASE_URL}/v1\`. There is no separate host for testing — your API key decides whether a request is test or live.`,
      },
      { kind: "code", lang: "bash", code: `${BASE_URL}/v1` },
      { kind: "heading", text: "The response envelope" },
      {
        kind: "text",
        body: "Every successful response has `success: true` and a `data` field. Lists add a `meta` object with the paging details. Nothing else is ever at the top level, so you can write one response handler and reuse it everywhere.",
      },
      {
        kind: "code",
        lang: "json",
        label: "A single resource",
        code: `{
  "success": true,
  "data": {
    "id": "6703f2a1b4c8e91d2a7f0011",
    "name": "Lagos Tech Mixer"
  }
}`,
      },
      {
        kind: "code",
        lang: "json",
        label: "A list",
        code: `{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalItems": 48,
    "totalPages": 3,
    "hasNextPage": true
  }
}`,
      },
      {
        kind: "callout",
        tone: "note",
        title: "Errors never use this shape",
        body: "A failed request returns `success: false` and an `error` object instead of `data`. Check `success` before reading `data` — see the Errors guide for the full list of codes.",
      },
      { kind: "heading", text: "How a sale actually happens" },
      {
        kind: "text",
        body: "The shortest path from a visitor on your site to a valid ticket is three calls, and only the first one needs anything from you beyond an event id.",
      },
      { kind: "diagram", name: "checkout" },
      {
        kind: "endpoints",
        title: "Start here",
        ids: ["list-events", "create-checkout-session"],
      },
    ],
  },
  {
    slug: "quickstart",
    title: "Quickstart",
    summary:
      "Create a key and make your first authenticated call in about five minutes.",
    section: "Getting started",
    readingMinutes: 5,
    blocks: [
      {
        kind: "text",
        body: "This walks from nothing to a real response. You need a Vera account; everything else is on this page.",
      },
      {
        kind: "steps",
        items: [
          {
            title: "Create a test key",
            body: "Open the API keys page and create a key in test mode. You will see the secret once, at creation — copy it then. Vera stores only a hash, so a lost secret cannot be recovered, only replaced.",
          },
          {
            title: "Call the API",
            body: "Ask for your events. A brand-new workspace returns an empty list, which is still a successful call and proves your key works.",
            code: {
              lang: "bash",
              code: `curl "${BASE_URL}/v1/events" \\
  -H "Authorization: Bearer sk_test_..."`,
            },
          },
          {
            title: "Read the response",
            body: "A 200 with `success: true` means you are through. A 401 means the key is wrong or inactive; a 403 means the key is valid but lacks the scope the endpoint needs.",
            code: {
              lang: "json",
              code: `{
  "success": true,
  "data": [],
  "meta": { "page": 1, "limit": 20, "totalItems": 0, "totalPages": 0, "hasNextPage": false }
}`,
            },
          },
          {
            title: "Send one from the browser",
            body: "The Sandbox has every endpoint with its parameters already filled in, so you can see a real request and response without writing a client first.",
          },
        ],
      },
      {
        kind: "link",
        href: "/vera-api-demo.html",
        title: "Open the demo app",
        body: "A pretend ticket shop running against the real API. Paste your test key and walk the whole loop — browse, checkout, door, refund — before writing a line of your own.",
      },
      {
        kind: "callout",
        tone: "warning",
        title: "Keep secret keys on your server",
        body: "An `sk_` key can move money and admit people. It belongs in server-side code or a secrets manager, never in a browser bundle, a mobile app or a git repository. Ship a `pk_` key instead when the code runs on someone else's device.",
      },
      {
        kind: "image",
        src: "/docs/api-keys-reveal.png",
        width: 620,
        height: 560,
        alt: "The dialog shown right after creating a key. The secret key is marked 'Shown once', with a note that Vera stores only a hash. Below it the publishable key is marked 'Always available', with a note that it is safe in a browser and can only read events.",
        caption:
          "Both halves of a new key. The secret is the one you cannot come back for.",
      },
    ],
  },
  {
    slug: "authentication",
    title: "Authentication",
    summary:
      "Key types, test and live modes, and exactly what each kind of key is allowed to do.",
    section: "Core concepts",
    readingMinutes: 5,
    blocks: [
      {
        kind: "text",
        body: "Every request carries an API key in the `Authorization` header as a bearer token. There are no session cookies and no signing step.",
      },
      {
        kind: "code",
        lang: "bash",
        code: `curl "${BASE_URL}/v1/events" \\
  -H "Authorization: Bearer sk_live_..."`,
      },
      { kind: "heading", text: "Two kinds of key" },
      {
        kind: "text",
        body: "Creating a key mints both at once: one publishable `pk_` and one secret `sk_`, belonging to the same key and the same scopes. You are not choosing between them — you get a pair, and you use whichever suits where the code runs.",
      },
      {
        kind: "table",
        columns: ["Prefix", "Where it belongs", "What it can do"],
        rows: [
          [
            "pk_",
            "Anywhere, including browsers and mobile apps",
            "Read events only. Capped in the backend, whatever scopes the key was given.",
          ],
          [
            "sk_",
            "Server-side only",
            "Everything its scopes allow, including payments, check-in and refunds.",
          ],
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        title: "A publishable key cannot be escalated",
        body: "The read-only cap on `pk_` keys is enforced when the request is authenticated, not when the key is created. Granting a publishable key extra scopes in the dashboard does not widen what it can reach, so a leaked one still cannot sell, refund or admit anyone.",
      },
      { kind: "heading", text: "Test and live" },
      {
        kind: "text",
        body: "Keys are created in either test or live mode, and the mode travels with the key rather than the URL. The same base URL and the same endpoints serve both, so moving to production means swapping one environment variable.",
      },
      {
        kind: "callout",
        tone: "warning",
        title: "Secrets are shown once",
        body: "Vera stores a hash of each secret key, never the key. If you lose it, create a replacement and retire the old one — nobody, including Vera support, can read it back to you.",
      },
      { kind: "heading", text: "When authentication fails" },
      {
        kind: "table",
        columns: ["Status", "Code", "What went wrong"],
        rows: [
          [
            "401",
            "UNAUTHORIZED",
            "No header, a malformed key, or a key that is not active.",
          ],
          [
            "403",
            "MISSING_SCOPE",
            "The key is valid but lacks a scope this endpoint requires.",
          ],
        ],
      },
    ],
  },
  {
    slug: "scopes",
    title: "Scopes",
    summary:
      "The six permissions a key can hold, and which endpoints need each one.",
    section: "Core concepts",
    readingMinutes: 3,
    blocks: [
      {
        kind: "text",
        body: "Each key carries a set of scopes. An endpoint declares the one scope it requires, and a request without it fails with `403 MISSING_SCOPE` before any work happens. Grant a key only what its job needs: a door app has no business issuing refunds.",
      },
      {
        kind: "table",
        columns: ["Scope", "Grants"],
        rows: [
          [
            "events:read",
            "List events, read one event, list its ticket types.",
          ],
          ["checkout:write", "Create and read checkout sessions."],
          ["orders:read", "List orders and read a single order."],
          [
            "tickets:verify",
            "Check whether a ticket code is valid, without admitting anyone.",
          ],
          [
            "tickets:checkin",
            "Admit a ticket holder and mark the ticket used.",
          ],
          ["refunds:write", "Refund an order."],
        ],
      },
      {
        kind: "callout",
        tone: "note",
        title: "Publishable keys ignore the rest",
        body: "A `pk_` key behaves as though it holds `events:read` and nothing else, no matter which scopes are stored against it.",
      },
    ],
  },
  {
    slug: "errors",
    title: "Errors",
    summary:
      "One error shape for every failure, with stable codes you can branch on.",
    section: "Core concepts",
    readingMinutes: 4,
    blocks: [
      {
        kind: "text",
        body: "Failures return the same envelope everywhere. Branch on `error.code`, which is stable, and show `error.message` to humans — the wording can change without notice.",
      },
      {
        kind: "code",
        lang: "json",
        code: `{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Order not found"
  }
}`,
      },
      {
        kind: "text",
        body: "Validation failures add a `details` field describing which field was wrong.",
      },
      { kind: "heading", text: "Codes" },
      {
        kind: "text",
        body: "The transport-level codes are the ones every endpoint can return. The rest are specific: `INSUFFICIENT_INVENTORY` tells you the event sold out between your two calls, `TICKET_ALREADY_REFUNDED` that somebody got there first.",
      },
      { kind: "errorCodes" },
      {
        kind: "callout",
        tone: "note",
        title: '404 also means "not yours"',
        body: "Resources are scoped to the workspace that owns the key. Asking for an event from another workspace returns 404 rather than 403, so the API never confirms that an id you cannot reach exists.",
      },
      {
        kind: "callout",
        tone: "warning",
        title: "Never retry a charge blindly",
        body: "A network timeout does not tell you whether the request landed. For checkout sessions, send an `Idempotency-Key` and retry with the same one — see Selling tickets.",
      },
    ],
  },
  {
    slug: "pagination",
    title: "Pagination",
    summary:
      "How list endpoints page, and the meta block that tells you where you are.",
    section: "Core concepts",
    readingMinutes: 2,
    blocks: [
      {
        kind: "text",
        body: "List endpoints take `page` and `limit` as query parameters and return a `meta` block alongside the data.",
      },
      {
        kind: "table",
        columns: ["Parameter", "Default", "Range"],
        rows: [
          ["page", "1", "1 and up"],
          ["limit", "20", "1 to 100"],
        ],
      },
      {
        kind: "code",
        lang: "bash",
        code: `curl "${BASE_URL}/v1/orders?page=2&limit=50" \\
  -H "Authorization: Bearer sk_live_..."`,
      },
      {
        kind: "code",
        lang: "json",
        code: `{
  "meta": {
    "page": 2,
    "limit": 50,
    "totalItems": 128,
    "totalPages": 3,
    "hasNextPage": true
  }
}`,
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Loop on hasNextPage",
        body: "It already accounts for an empty result set, where `totalPages` is 0 and there is no next page. Comparing `page` against `totalPages` yourself is one off-by-one waiting to happen.",
      },
      {
        kind: "callout",
        tone: "warning",
        title: "A limit above 100 is rejected",
        body: "Asking for more returns `400 VALIDATION_ERROR` rather than silently clamping, so a client that assumes it got everything cannot quietly miss rows.",
      },
    ],
  },
  {
    slug: "selling-tickets",
    title: "Sell tickets from your own site",
    summary:
      "The full checkout flow: pick an event, create a session, take payment, confirm the tickets.",
    section: "Build a flow",
    readingMinutes: 8,
    blocks: [
      {
        kind: "text",
        body: "A checkout session is a held reservation with a payment page attached. You create one, send the buyer to Vera to pay, and read the session back afterwards to find out what they ended up with. Vera issues the tickets, handles the money and emails the buyer.",
      },
      {
        kind: "link",
        href: "/vera-api-demo.html",
        title: "Watch this flow run first",
        body: "The demo app does every step on this page against your own test key, and shows each request and response as it goes.",
      },
      { kind: "diagram", name: "checkout" },
      { kind: "heading", text: "1. Find what is on sale" },
      {
        kind: "text",
        body: "List your events, or read one directly if you already know the id. Each event reports its sale phase and how many tickets remain, so you can hide what nobody can buy. If the event has several ticket types, list those too and let the buyer choose one.",
      },
      {
        kind: "code",
        lang: "bash",
        code: `curl "${BASE_URL}/v1/events/6703f2a1b4c8e91d2a7f0011/tickets" \\
  -H "Authorization: Bearer sk_live_..."`,
      },
      { kind: "heading", text: "2. Create the session" },
      {
        kind: "text",
        body: "Post the event, the quantity and the buyer's email. `successUrl` and `cancelUrl` are where Vera returns the buyer afterwards. Anything you put in `metadata` comes back untouched when you read the session, which is the simplest way to tie a sale to a row in your own database.",
      },
      {
        kind: "code",
        lang: "bash",
        code: `curl -X POST "${BASE_URL}/v1/checkout/sessions" \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: order-2291" \\
  -d '{
    "eventId": "6703f2a1b4c8e91d2a7f0011",
    "quantity": 2,
    "customerEmail": "ada@example.com",
    "successUrl": "https://yoursite.com/thanks",
    "cancelUrl": "https://yoursite.com/tickets",
    "metadata": { "orderId": "2291" }
  }'`,
      },
      {
        kind: "callout",
        tone: "warning",
        title: "Always send an Idempotency-Key",
        body: "If the connection drops you cannot tell whether the session was created. Retrying with the same key returns the original session instead of holding a second set of tickets and charging twice. Use something from your own order, not a random value you cannot reproduce on the retry.",
      },
      { kind: "diagram", name: "idempotency" },
      {
        kind: "text",
        body: "You get back a `201` with the session. Two fields decide what happens next:",
      },
      {
        kind: "table",
        columns: ["Field", "Meaning"],
        rows: [
          [
            "requiresPayment",
            "False for a free event. There is nothing to pay and no checkout page — the tickets are already issued.",
          ],
          [
            "checkoutUrl",
            "Where to send the buyer when payment is required. Empty when it is not.",
          ],
        ],
      },
      {
        kind: "callout",
        tone: "note",
        title: "A reservation is held for 30 minutes",
        body: "`expiresAt` is 30 minutes out. If the buyer has not paid by then the session becomes `expired` and the tickets go back on sale, so do not treat a session as a sale until you have read its status back.",
      },
      { kind: "heading", text: "3. Send the buyer to pay" },
      {
        kind: "text",
        body: "Redirect to `checkoutUrl`. Vera takes the payment, issues the tickets and emails them, then returns the buyer to your `successUrl`.",
      },
      { kind: "heading", text: "4. Confirm, server-side" },
      {
        kind: "text",
        body: "When the buyer lands back on your success page, read the session. Its status is the only thing that tells you a sale completed — the fact that someone reached your success URL does not.",
      },
      {
        kind: "code",
        lang: "bash",
        code: `curl "${BASE_URL}/v1/checkout/sessions/6704a1b2c3d4e5f6a7b8c9d0" \\
  -H "Authorization: Bearer sk_live_..."`,
      },
      {
        kind: "table",
        columns: ["status", "What it means"],
        rows: [
          [
            "reserved",
            "Held, not paid for yet. Still inside the 30-minute window.",
          ],
          ["purchased", "Paid and issued. `tickets` lists what the buyer got."],
          [
            "expired",
            "The window closed without payment. The tickets went back on sale.",
          ],
          ["cancelled", "The session was abandoned deliberately."],
        ],
      },
      { kind: "diagram", name: "session-states" },
      {
        kind: "callout",
        tone: "warning",
        title: "A 200 is not a payment",
        body: "Never mark an order paid because the buyer reached your success URL, or because creating the session returned 200. Treat a sale as real only when the session reads back as `purchased`.",
      },
      {
        kind: "text",
        body: "A purchased session also carries `pricingBreakdown` and the issued `tickets`, so your confirmation page can show exactly what was charged without a second call.",
      },
      {
        kind: "endpoints",
        title: "Endpoints in this flow",
        ids: [
          "list-events",
          "get-event",
          "list-event-ticket-types",
          "create-checkout-session",
          "get-checkout-session",
        ],
      },
    ],
  },
  {
    slug: "door-check-in",
    title: "Check people in at the door",
    summary:
      "Verify a code before you admit anyone, then admit them exactly once.",
    section: "Build a flow",
    readingMinutes: 5,
    blocks: [
      {
        kind: "text",
        body: 'Two endpoints, deliberately separate. Verify answers "is this real?" and changes nothing. Check-in admits the holder and marks the ticket used. Keeping them apart means a scanner can show the door staff who is in front of them before anything is spent.',
      },
      { kind: "diagram", name: "door" },
      { kind: "heading", text: "Verify first" },
      {
        kind: "text",
        body: "Send the code from the QR. Pass `eventId` too when the door only serves one event, so a valid ticket for next week's show is not waved through tonight.",
      },
      {
        kind: "code",
        lang: "bash",
        code: `curl -X POST "${BASE_URL}/v1/tickets/verify" \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{ "code": "VERA-8KQ2-77ZD", "eventId": "6703f2a1b4c8e91d2a7f0011" }'`,
      },
      { kind: "heading", text: "Then admit" },
      {
        kind: "text",
        body: "Check-in is the write. A ticket that has already been used will be refused, which is the whole point — it is what stops one code admitting a queue.",
      },
      {
        kind: "code",
        lang: "bash",
        code: `curl -X POST "${BASE_URL}/v1/tickets/check-in" \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{ "code": "VERA-8KQ2-77ZD", "eventId": "6703f2a1b4c8e91d2a7f0011" }'`,
      },
      {
        kind: "callout",
        tone: "warning",
        title: "override is for a human decision",
        body: "Passing `override: true` admits a holder the normal rules would turn away. It exists for the supervisor standing at the door who has decided to let someone in, not as a way to make a failing scanner stop complaining.",
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Give the two jobs two keys",
        body: "A scanner needs `tickets:verify` and `tickets:checkin`, nothing more. A phone at a gate is the easiest key to lose, and one that cannot refund anything is a much smaller loss.",
      },
      {
        kind: "image",
        src: "/docs/door-verify.png",
        width: 1200,
        height: 588,
        alt: "The demo app's door screen after verifying a real ticket code. A green panel reads 'Come on in' above the ticket holder's name, Ada Obi. The Verify, Admit and Admit anyway buttons sit above it.",
        caption:
          "Verify answers who is at the door, and changes nothing. Admit is the next button along.",
      },
      {
        kind: "link",
        href: "/vera-api-demo.html",
        title: "Try the door flow",
        body: "The demo app's Door step verifies and admits a real ticket code. Check the same code in twice to see the refusal.",
      },
      {
        kind: "endpoints",
        title: "Endpoints in this flow",
        ids: ["verify-ticket", "check-in-ticket"],
      },
    ],
  },
  {
    slug: "orders-and-refunds",
    title: "Look up orders and refund them",
    summary: "Find what someone bought, then give the money back.",
    section: "Build a flow",
    readingMinutes: 4,
    blocks: [
      {
        kind: "text",
        body: "Orders are the record of what was sold. List them for a back-office view, or read one when a customer is on the phone.",
      },
      {
        kind: "code",
        lang: "bash",
        code: `curl "${BASE_URL}/v1/orders?page=1&limit=20" \\
  -H "Authorization: Bearer sk_live_..."`,
      },
      { kind: "heading", text: "Refunding" },
      {
        kind: "text",
        body: "A refund takes the ticket id and an optional reason, which is worth sending — it is what your own team reads later when they are trying to work out what happened.",
      },
      {
        kind: "code",
        lang: "bash",
        code: `curl -X POST "${BASE_URL}/v1/refunds" \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{ "ticketId": "6704a1b2c3d4e5f6a7b8c9d0", "reason": "Customer could not attend" }'`,
      },
      {
        kind: "callout",
        tone: "warning",
        title: "Refunds are not idempotent — do not blind-retry",
        body: "Unlike checkout sessions, this endpoint takes no idempotency key. If a refund call times out, read the order back and look at its state before sending another one.",
      },
      {
        kind: "endpoints",
        title: "Endpoints in this flow",
        ids: ["list-orders", "get-order", "create-refund"],
      },
    ],
  },
  {
    slug: "going-live",
    title: "Going live",
    summary: "What to check before real money moves through your integration.",
    section: "Going live",
    readingMinutes: 4,
    blocks: [
      {
        kind: "text",
        body: "Moving to production is a key swap — same base URL, same endpoints. Everything worth checking is on your side.",
      },
      {
        kind: "list",
        items: [
          "Your live secret key is in a secrets manager or environment variable, not in the repository.",
          "Each key holds only the scopes its job needs, and anything client-side uses a `pk_` key.",
          "Every checkout session is created with an `Idempotency-Key` you can reproduce on a retry.",
          "You confirm sales by reading the session back, not by trusting the success redirect.",
          "You handle `expired` sessions — buyers do walk away mid-payment.",
          "Your error handling branches on `error.code`, never on message text.",
          "5xx responses retry with backoff; refunds do not retry blindly.",
        ],
      },
      {
        kind: "callout",
        tone: "note",
        title: "No webhooks yet",
        body: "Vera does not currently call your server when something changes. Confirm outcomes by reading the resource back at the point you need to know — after the success redirect, or when your own job runs.",
      },
      {
        kind: "callout",
        tone: "note",
        title: "No published rate limits yet",
        body: "There is no per-key request ceiling on the API today, so none is documented here rather than quoting a number that is not enforced. Build in backoff on 429 and 5xx anyway: this will change, and a client that already retries politely will not need revisiting.",
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Test the unhappy paths first",
        body: "The Sandbox will happily send a refund for a ticket id that does not exist, a check-in for an already-used code, and a session for a sold-out event. Those are the responses your code will meet in production; see them once before your customers do.",
      },
    ],
  },
];

export const getGuide = (slug: string) =>
  GUIDES.find((guide) => guide.slug === slug) ?? null;

/** Headings become the on-page contents list. */
export const guideHeadings = (guide: Guide) =>
  guide.blocks
    .filter(
      (block): block is Extract<DocBlock, { kind: "heading" }> =>
        block.kind === "heading",
    )
    .map((block) => ({
      id: block.text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
      label: block.text,
    }));

export const headingId = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/**
 * Flattens a guide back to plain text, for handing to an assistant.
 *
 * Tables and code keep their shape because that is the part someone is most
 * likely to be asking about; an image placeholder contributes its alt text,
 * which is the only thing it has to say.
 */
export const guideToPlainText = (guide: Guide): string => {
  const lines: string[] = [guide.title, guide.summary, ""];

  for (const block of guide.blocks) {
    switch (block.kind) {
      case "heading":
        lines.push(`## ${block.text}`, "");
        break;
      case "text":
        lines.push(block.body, "");
        break;
      case "code":
        lines.push("```" + block.lang, block.code, "```", "");
        break;
      case "callout":
        lines.push(`> ${block.title}: ${block.body}`, "");
        break;
      case "list":
        lines.push(...block.items.map((item) => `- ${item}`), "");
        break;
      case "steps":
        block.items.forEach((item, index) => {
          lines.push(`${index + 1}. ${item.title} — ${item.body}`);
          if (item.code) {
            lines.push("```" + item.code.lang, item.code.code, "```");
          }
        });
        lines.push("");
        break;
      case "table":
        lines.push(
          `| ${block.columns.join(" | ")} |`,
          `| ${block.columns.map(() => "---").join(" | ")} |`,
          ...block.rows.map((row) => `| ${row.join(" | ")} |`),
          "",
        );
        break;
      case "image":
        lines.push(`[image: ${block.alt}]`, "");
        break;
      case "endpoints":
        lines.push(
          `${block.title ?? "Reference"}: ${block.ids.join(", ")}`,
          "",
        );
        break;
      case "link":
        lines.push(`${block.title}: ${block.href} — ${block.body}`, "");
        break;
      case "diagram":
        lines.push(`[diagram: ${block.name}]`, "");
        break;
      case "errorCodes":
        lines.push(
          ...ERROR_CODES.map(
            (entry) => `${entry.status} ${entry.code} — ${entry.meaning}`,
          ),
          "",
        );
        break;
    }
  }

  return lines.join("\n").trim();
};
