import { type ApiKeyScope } from "@/lib/types/workspace";

export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

export interface EndpointParam {
  name: string;
  type: "string" | "number" | "boolean";
  required: boolean;
  description: string;
  example?: string | number | boolean;
}

export type EndpointGroup =
  | "Events"
  | "Checkout Sessions"
  | "Orders"
  | "Tickets"
  | "Refunds";

export interface EndpointDoc {
  /** Slug used for anchor links in the docs page and the sandbox picker. */
  id: string;
  group: EndpointGroup;
  method: HttpMethod;
  /** May contain :param placeholders, e.g. "/events/:eventId". */
  path: string;
  scope: ApiKeyScope;
  summary: string;
  description: string;
  pathParams?: EndpointParam[];
  queryParams?: EndpointParam[];
  bodyParams?: EndpointParam[];
  exampleRequestBody?: Record<string, unknown>;
  /**
   * Alternate request-body presets for endpoints whose payload meaningfully
   * differs by scenario (e.g. an event with ticket categories vs without).
   * Rendered as extra labeled examples in the docs and as loadable presets
   * in the sandbox, alongside the primary exampleRequestBody.
   */
  bodyExamples?: { label: string; note?: string; body: Record<string, unknown> }[];
  exampleResponse: unknown;
}

/**
 * Single source of truth for both the API documentation page and the
 * sandbox's endpoint picker/form — every /v1 endpoint from Vera's Phase 1
 * Developer Platform API lives here exactly once.
 */
export const ENDPOINTS: EndpointDoc[] = [
  {
    id: "list-events",
    group: "Events",
    method: "GET",
    path: "/v1/events",
    scope: "events:read",
    summary: "List events",
    description:
      "Returns published events belonging to your workspace, newest first.",
    queryParams: [
      { name: "page", type: "number", required: false, description: "Page number (default 1).", example: 1 },
      { name: "limit", type: "number", required: false, description: "Items per page, max 100 (default 20).", example: 20 },
    ],
    exampleResponse: {
      success: true,
      data: [
        {
          id: "665f1a2b3c4d5e6f7a8b9c0d",
          name: "Afrobeats Night",
          description: "A night of live afrobeats.",
          imageUrl: "https://res.cloudinary.com/vera/afrobeats-night.jpg",
          address: "12 Adeola Odeku St, Victoria Island, Lagos",
          state: "Lagos",
          startsAt: "2026-08-14T19:00:00.000Z",
          endsAt: "2026-08-14T23:00:00.000Z",
          timezone: "Africa/Lagos",
          isPaid: true,
          currency: "NGN",
          salePhase: "main",
          remainingTickets: 214,
          soldTickets: 86,
        },
      ],
      meta: { page: 1, limit: 20, totalItems: 1, totalPages: 1, hasNextPage: false },
    },
  },
  {
    id: "get-event",
    group: "Events",
    method: "GET",
    path: "/v1/events/:eventId",
    scope: "events:read",
    summary: "Get an event",
    description: "Returns a single published event belonging to your workspace.",
    pathParams: [
      { name: "eventId", type: "string", required: true, description: "The event's id.", example: "665f1a2b3c4d5e6f7a8b9c0d" },
    ],
    exampleResponse: {
      success: true,
      data: {
        id: "665f1a2b3c4d5e6f7a8b9c0d",
        name: "Afrobeats Night",
        description: "A night of live afrobeats.",
        imageUrl: "https://res.cloudinary.com/vera/afrobeats-night.jpg",
        address: "12 Adeola Odeku St, Victoria Island, Lagos",
        state: "Lagos",
        startsAt: "2026-08-14T19:00:00.000Z",
        endsAt: "2026-08-14T23:00:00.000Z",
        timezone: "Africa/Lagos",
        isPaid: true,
        currency: "NGN",
        salePhase: "main",
        remainingTickets: 214,
        soldTickets: 86,
      },
    },
  },
  {
    id: "list-event-ticket-types",
    group: "Events",
    method: "GET",
    path: "/v1/events/:eventId/tickets",
    scope: "events:read",
    summary: "List ticket types",
    description:
      "Returns the ticket types (categories) for an event, with live availability and pricing.",
    pathParams: [
      { name: "eventId", type: "string", required: true, description: "The event's id.", example: "665f1a2b3c4d5e6f7a8b9c0d" },
    ],
    exampleResponse: {
      success: true,
      data: [
        {
          id: "665f1b0c3c4d5e6f7a8b9c11",
          name: "Regular",
          priceNaira: 15000,
          quantity: 250,
          remainingQuantity: 164,
          salePhase: "main",
        },
        {
          id: "665f1b0c3c4d5e6f7a8b9c12",
          name: "VIP",
          priceNaira: 40000,
          quantity: 50,
          remainingQuantity: 12,
          salePhase: "main",
        },
      ],
    },
  },
  {
    id: "create-checkout-session",
    group: "Checkout Sessions",
    method: "POST",
    path: "/v1/checkout/sessions",
    scope: "checkout:write",
    summary: "Create a checkout session",
    description:
      "Reserves tickets and starts a purchase. Free events (and paid events in dev-bypass mode) issue tickets instantly; paid events return a checkoutUrl to redirect the customer to. Supports an optional Idempotency-Key header so retries don't create duplicate sessions.",
    bodyParams: [
      { name: "eventId", type: "string", required: true, description: "The event to buy tickets for." },
      { name: "quantity", type: "number", required: false, description: "Number of tickets, 1-10 (default 1)." },
      { name: "ticketCategoryId", type: "string", required: false, description: "Ticket type id, if the event has categories." },
      { name: "customerEmail", type: "string", required: true, description: "The buyer's email — used to find or create their Vera account." },
      { name: "customerName", type: "string", required: false, description: "The buyer's name." },
      { name: "successUrl", type: "string", required: false, description: "Where to send the buyer after a successful payment." },
      { name: "cancelUrl", type: "string", required: false, description: "Where to send the buyer if they cancel." },
    ],
    exampleRequestBody: {
      eventId: "665f1a2b3c4d5e6f7a8b9c0d",
      quantity: 2,
      customerEmail: "attendee@example.com",
      customerName: "Ada Obi",
      successUrl: "https://your-site.example.com/checkout/success",
    },
    bodyExamples: [
      {
        label: "General admission",
        body: {
          eventId: "665f1a2b3c4d5e6f7a8b9c0d",
          quantity: 2,
          customerEmail: "attendee@example.com",
          customerName: "Ada Obi",
          successUrl: "https://your-site.example.com/checkout/success",
        },
      },
      {
        label: "With ticket categories",
        note: "Events with ticket categories require ticketCategoryId. Call List ticket types first and use one of the returned ids.",
        body: {
          eventId: "665f1a2b3c4d5e6f7a8b9c0d",
          quantity: 2,
          ticketCategoryId: "665f1b0c3c4d5e6f7a8b9c11",
          customerEmail: "attendee@example.com",
          customerName: "Ada Obi",
          successUrl: "https://your-site.example.com/checkout/success",
        },
      },
    ],
    exampleResponse: {
      success: true,
      data: {
        id: "665f1c1e3c4d5e6f7a8b9c20",
        status: "reserved",
        requiresPayment: true,
        checkoutUrl: "https://checkout.paystack.com/abc123",
        eventId: "665f1a2b3c4d5e6f7a8b9c0d",
        quantity: 2,
        ticketIds: ["665f1c1e3c4d5e6f7a8b9c21", "665f1c1e3c4d5e6f7a8b9c22"],
        customerEmail: "attendee@example.com",
        metadata: {},
        expiresAt: "2026-07-09T14:00:00.000Z",
        purchasedAt: null,
        createdAt: "2026-07-09T13:30:00.000Z",
        pricingBreakdown: {
          basePriceNaira: 15000,
          veraFeeNaira: 750,
          totalCheckoutNaira: 15750,
          organizerNetNaira: 15000,
          platformFeePercent: 5,
          feeMode: "absorbed_by_organizer",
        },
      },
    },
  },
  {
    id: "get-checkout-session",
    group: "Checkout Sessions",
    method: "GET",
    path: "/v1/checkout/sessions/:sessionId",
    scope: "checkout:write",
    summary: "Get a checkout session",
    description:
      "Returns a checkout session's current status. Opportunistically syncs with the payment provider on read, so polling this endpoint reflects payment completion without waiting on a webhook.",
    pathParams: [
      { name: "sessionId", type: "string", required: true, description: "The checkout session's id." },
    ],
    exampleResponse: {
      success: true,
      data: {
        id: "665f1c1e3c4d5e6f7a8b9c20",
        status: "purchased",
        requiresPayment: true,
        checkoutUrl: "https://checkout.paystack.com/abc123",
        eventId: "665f1a2b3c4d5e6f7a8b9c0d",
        quantity: 2,
        ticketIds: ["665f1c1e3c4d5e6f7a8b9c21", "665f1c1e3c4d5e6f7a8b9c22"],
        customerEmail: "attendee@example.com",
        metadata: {},
        expiresAt: "2026-07-09T14:00:00.000Z",
        purchasedAt: "2026-07-09T13:34:12.000Z",
        createdAt: "2026-07-09T13:30:00.000Z",
        tickets: [
          {
            id: "665f1c1e3c4d5e6f7a8b9c21",
            eventId: "665f1a2b3c4d5e6f7a8b9c0d",
            status: "paid",
            quantity: 1,
            unitPriceNaira: 15750,
            totalPriceNaira: 15750,
            currency: "NGN",
            ticketCode: "VRA-MRDJLDJT-W2EC8",
            attendeeName: "Ada Obi",
            attendeeEmail: "attendee@example.com",
            checkedIn: false,
            checkedInAt: null,
            purchasedAt: "2026-07-09T13:34:12.000Z",
            createdAt: "2026-07-09T13:30:00.000Z",
          },
        ],
      },
    },
  },
  {
    id: "list-orders",
    group: "Orders",
    method: "GET",
    path: "/v1/orders",
    scope: "orders:read",
    summary: "List orders",
    description: "Returns paid, used, and refunded tickets for your workspace.",
    queryParams: [
      { name: "page", type: "number", required: false, description: "Page number (default 1).", example: 1 },
      { name: "limit", type: "number", required: false, description: "Items per page, max 100 (default 20).", example: 20 },
    ],
    exampleResponse: {
      success: true,
      data: [
        {
          id: "665f1c1e3c4d5e6f7a8b9c21",
          eventId: "665f1a2b3c4d5e6f7a8b9c0d",
          status: "paid",
          quantity: 1,
          unitPriceNaira: 15750,
          totalPriceNaira: 15750,
          currency: "NGN",
          ticketCode: "VRA-MRDJLDJT-W2EC8",
          attendeeName: "Ada Obi",
          attendeeEmail: "attendee@example.com",
          checkedIn: false,
          checkedInAt: null,
          purchasedAt: "2026-07-09T13:34:12.000Z",
          createdAt: "2026-07-09T13:30:00.000Z",
        },
      ],
      meta: { page: 1, limit: 20, totalItems: 1, totalPages: 1, hasNextPage: false },
    },
  },
  {
    id: "get-order",
    group: "Orders",
    method: "GET",
    path: "/v1/orders/:ticketId",
    scope: "orders:read",
    summary: "Get an order",
    description: "Returns a single order (ticket) by id.",
    pathParams: [
      { name: "ticketId", type: "string", required: true, description: "The ticket's id." },
    ],
    exampleResponse: {
      success: true,
      data: {
        id: "665f1c1e3c4d5e6f7a8b9c21",
        eventId: "665f1a2b3c4d5e6f7a8b9c0d",
        status: "paid",
        quantity: 1,
        unitPriceNaira: 15750,
        totalPriceNaira: 15750,
        currency: "NGN",
        ticketCode: "VRA-MRDJLDJT-W2EC8",
        attendeeName: "Ada Obi",
        attendeeEmail: "attendee@example.com",
        checkedIn: false,
        checkedInAt: null,
        purchasedAt: "2026-07-09T13:34:12.000Z",
        createdAt: "2026-07-09T13:30:00.000Z",
      },
    },
  },
  {
    id: "verify-ticket",
    group: "Tickets",
    method: "POST",
    path: "/v1/tickets/verify",
    scope: "tickets:verify",
    summary: "Verify a ticket",
    description:
      "Checks whether a scanned ticket code is valid and usable, without checking it in. Use this to preview a ticket at the door before committing to a check-in.",
    bodyParams: [
      { name: "code", type: "string", required: true, description: "The scanned ticket code or barcode value." },
      { name: "eventId", type: "string", required: false, description: "Restrict verification to this event." },
    ],
    exampleRequestBody: {
      code: "VRA-MRDJLDJT-W2EC8",
      eventId: "665f1a2b3c4d5e6f7a8b9c0d",
    },
    exampleResponse: {
      success: true,
      data: {
        valid: true,
        alreadyCheckedIn: false,
        checkedInAt: null,
        reason: null,
        ticket: {
          id: "665f1c1e3c4d5e6f7a8b9c21",
          eventId: "665f1a2b3c4d5e6f7a8b9c0d",
          status: "paid",
          quantity: 1,
          unitPriceNaira: 15750,
          totalPriceNaira: 15750,
          currency: "NGN",
          ticketCode: "VRA-MRDJLDJT-W2EC8",
          attendeeName: "Ada Obi",
          attendeeEmail: "attendee@example.com",
          checkedIn: false,
          checkedInAt: null,
          purchasedAt: "2026-07-09T13:34:12.000Z",
          createdAt: "2026-07-09T13:30:00.000Z",
        },
        event: { id: "665f1a2b3c4d5e6f7a8b9c0d", name: "Afrobeats Night" },
      },
    },
  },
  {
    id: "check-in-ticket",
    group: "Tickets",
    method: "POST",
    path: "/v1/tickets/check-in",
    scope: "tickets:checkin",
    summary: "Check in a ticket",
    description:
      "Marks a ticket as used at the door. Safe to call twice — a second check-in on an already-used ticket returns alreadyCheckedIn: true instead of erroring.",
    bodyParams: [
      { name: "code", type: "string", required: true, description: "The scanned ticket code or barcode value." },
      { name: "eventId", type: "string", required: false, description: "Restrict check-in to this event." },
    ],
    exampleRequestBody: {
      code: "VRA-MRDJLDJT-W2EC8",
      eventId: "665f1a2b3c4d5e6f7a8b9c0d",
    },
    exampleResponse: {
      success: true,
      data: {
        alreadyCheckedIn: false,
        checkedInAt: "2026-08-14T19:04:22.000Z",
        ticket: {
          id: "665f1c1e3c4d5e6f7a8b9c21",
          eventId: "665f1a2b3c4d5e6f7a8b9c0d",
          status: "used",
          quantity: 1,
          unitPriceNaira: 15750,
          totalPriceNaira: 15750,
          currency: "NGN",
          ticketCode: "VRA-MRDJLDJT-W2EC8",
          attendeeName: "Ada Obi",
          attendeeEmail: "attendee@example.com",
          checkedIn: true,
          checkedInAt: "2026-08-14T19:04:22.000Z",
          purchasedAt: "2026-07-09T13:34:12.000Z",
          createdAt: "2026-07-09T13:30:00.000Z",
        },
      },
    },
  },
  {
    id: "create-refund",
    group: "Refunds",
    method: "POST",
    path: "/v1/refunds",
    scope: "refunds:write",
    summary: "Refund a ticket",
    description:
      "Refunds a paid ticket's payment provider charge and reverses the organizer wallet credit for the sale.",
    bodyParams: [
      { name: "ticketId", type: "string", required: true, description: "The ticket to refund." },
      { name: "reason", type: "string", required: false, description: "A short note on why this was refunded." },
    ],
    exampleRequestBody: {
      ticketId: "665f1c1e3c4d5e6f7a8b9c21",
      reason: "Event rescheduled",
    },
    exampleResponse: {
      success: true,
      data: {
        id: "665f1c1e3c4d5e6f7a8b9c21",
        eventId: "665f1a2b3c4d5e6f7a8b9c0d",
        status: "refunded",
        quantity: 1,
        unitPriceNaira: 15750,
        totalPriceNaira: 15750,
        currency: "NGN",
        ticketCode: "VRA-MRDJLDJT-W2EC8",
        attendeeName: "Ada Obi",
        attendeeEmail: "attendee@example.com",
        checkedIn: false,
        checkedInAt: null,
        purchasedAt: "2026-07-09T13:34:12.000Z",
        createdAt: "2026-07-09T13:30:00.000Z",
      },
    },
  },
];

export const ENDPOINT_GROUPS: EndpointGroup[] = [
  "Events",
  "Checkout Sessions",
  "Orders",
  "Tickets",
  "Refunds",
];

export const ERROR_CODES: { code: string; status: number; meaning: string }[] = [
  { code: "VALIDATION_ERROR", status: 400, meaning: "The request body, query, or params failed validation." },
  { code: "UNAUTHORIZED", status: 401, meaning: "The API key is missing, malformed, or revoked." },
  { code: "FORBIDDEN", status: 403, meaning: "Generic permission failure." },
  { code: "MISSING_SCOPE", status: 403, meaning: "Your key doesn't have a scope this endpoint requires." },
  { code: "NOT_FOUND", status: 404, meaning: "The resource doesn't exist, or belongs to a different workspace." },
  { code: "CONFLICT", status: 409, meaning: "Generic state conflict." },
  { code: "INSUFFICIENT_INVENTORY", status: 409, meaning: "Not enough tickets remain for the requested quantity." },
  { code: "TICKET_EVENT_MISMATCH", status: 409, meaning: "The scanned ticket doesn't belong to the given event." },
  { code: "TICKET_PAYMENT_PENDING", status: 409, meaning: "The ticket's payment hasn't completed yet." },
  { code: "TICKET_NOT_REFUNDABLE", status: 409, meaning: "The ticket isn't in a refundable state." },
  { code: "TICKET_ALREADY_REFUNDED", status: 409, meaning: "The ticket was already refunded." },
  { code: "CHECKIN_WINDOW_CLOSED", status: 409, meaning: "It's too early or too late to check this ticket in." },
  { code: "INVALID_TICKET", status: 409, meaning: "The ticket is cancelled or expired." },
  { code: "UNPROCESSABLE_ENTITY", status: 422, meaning: "The request was well-formed but couldn't be processed." },
  { code: "NO_PAYMENT_REFERENCE", status: 422, meaning: "The ticket has no payment to refund (e.g. a free ticket)." },
  { code: "RATE_LIMITED", status: 429, meaning: "Too many requests (rate limiting is not yet enforced in this phase)." },
  { code: "SERVICE_UNAVAILABLE", status: 503, meaning: "A dependency (e.g. the payment provider) isn't configured." },
  { code: "INTERNAL_ERROR", status: 500, meaning: "An unexpected error on our side." },
];
