/**
 * The docs' diagrams, hand-authored as inline SVG.
 *
 * Inline rather than exported images so they scale without blurring, carry
 * their own alt text, cost no request, and follow the page into dark mode:
 * every stroke is `currentColor`, inherited from the wrapper's text colour,
 * with the theme's primary reserved for the one mark each figure is about.
 *
 * The small layout helpers below are the only indirection. A sequence
 * diagram is lanes and evenly spaced messages, and computing those beats
 * eyeballing forty `x` attributes — uneven gaps are most of what makes a
 * hand-drawn diagram look accidental.
 */

interface Lane {
  id: string;
  label: string;
}

interface Step {
  from: string;
  to: string;
  label: string;
  /** Dashed: a reply, or something that did not arrive. */
  reply?: boolean;
  /** Picks up the theme's primary colour — the mark the figure is about. */
  accent?: boolean;
  /** Struck through, for a message that never lands. */
  lost?: boolean;
  /** A line of context under the message, in place of an arrow. */
  note?: string;
}

const WIDTH = 760;
const PAD = 12;
const HEAD_Y = 10;
const HEAD_H = 30;
const FIRST_STEP_Y = 80;
const STEP_GAP = 46;

const Figure = ({
  caption,
  label,
  height,
  children,
}: {
  caption: string;
  label: string;
  height: number;
  children: React.ReactNode;
}) => (
  <figure className="flex flex-col gap-2">
    <div className="overflow-hidden rounded-xl border border-border bg-card p-4 text-muted-foreground">
      <svg
        role="img"
        aria-label={label}
        viewBox={`0 0 ${WIDTH} ${height}`}
        style={{ width: "100%", height: "auto" }}
      >
        <defs>
          <marker
            id="doc-arrow"
            viewBox="0 0 8 8"
            refX="7"
            refY="4"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <polygon points="0,0 8,4 0,8" fill="currentColor" />
          </marker>
        </defs>
        {children}
      </svg>
    </div>
    <figcaption className="text-xs text-muted-foreground">{caption}</figcaption>
  </figure>
);

/** Lanes across the top, lifelines down, messages between them. */
const Sequence = ({
  lanes,
  steps,
  caption,
  label,
}: {
  lanes: Lane[];
  steps: Step[];
  caption: string;
  label: string;
}) => {
  const slot = (WIDTH - PAD * 2) / lanes.length;
  const laneX = (id: string) => {
    const index = lanes.findIndex((lane) => lane.id === id);
    return PAD + slot * index + slot / 2;
  };

  const height = FIRST_STEP_Y + steps.length * STEP_GAP + 6;
  const boxWidth = Math.min(slot - 14, 168);

  return (
    <Figure caption={caption} label={label} height={height}>
      {lanes.map((lane) => {
        const x = laneX(lane.id);

        return (
          <g key={lane.id}>
            <rect
              x={x - boxWidth / 2}
              y={HEAD_Y}
              width={boxWidth}
              height={HEAD_H}
              rx="8"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.35"
            />
            <text
              x={x}
              y={HEAD_Y + 20}
              textAnchor="middle"
              fontSize="12.5"
              fontWeight="600"
              fill="currentColor"
            >
              {lane.label}
            </text>
            <line
              x1={x}
              y1={HEAD_Y + HEAD_H + 4}
              x2={x}
              y2={height - 6}
              stroke="currentColor"
              strokeOpacity="0.22"
              strokeDasharray="4 5"
            />
          </g>
        );
      })}

      {steps.map((step, index) => {
        const y = FIRST_STEP_Y + index * STEP_GAP;
        const from = laneX(step.from);
        const to = laneX(step.to);
        const mid = (from + to) / 2;
        const rightwards = to > from;
        /* Stop short of the lifeline so the head does not sit on it. */
        const x1 = from + (rightwards ? 6 : -6);
        const x2 = to + (rightwards ? -8 : 8);

        return (
          <g
            key={`${step.label}-${index}`}
            className={step.accent ? "text-primary" : undefined}
            opacity={step.lost ? 0.75 : 1}
          >
            <text
              x={mid}
              y={y - 8}
              textAnchor="middle"
              fontSize="12"
              fontWeight={step.accent ? "600" : "400"}
              fill="currentColor"
            >
              {step.label}
            </text>

            <line
              x1={x1}
              y1={y}
              x2={x2}
              y2={y}
              stroke="currentColor"
              strokeWidth={step.accent ? "1.75" : "1.25"}
              strokeDasharray={step.reply ? "5 4" : undefined}
              markerEnd="url(#doc-arrow)"
            />

            {/* The message that never arrives, struck through where it died. */}
            {step.lost ? (
              <g>
                <line
                  x1={mid - 7}
                  y1={y - 7}
                  x2={mid + 7}
                  y2={y + 7}
                  stroke="currentColor"
                  strokeWidth="1.75"
                />
                <line
                  x1={mid - 7}
                  y1={y + 7}
                  x2={mid + 7}
                  y2={y - 7}
                  stroke="currentColor"
                  strokeWidth="1.75"
                />
              </g>
            ) : null}

            {step.note ? (
              <text
                x={mid}
                y={y + 16}
                textAnchor="middle"
                fontSize="11"
                fill="currentColor"
                fillOpacity="0.7"
              >
                {step.note}
              </text>
            ) : null}
          </g>
        );
      })}
    </Figure>
  );
};

/* ------------------------------------------------------------- the figures */

const CheckoutSequence = () => (
  <Sequence
    caption="A sale, end to end. The last two messages are the ones that decide whether it happened."
    label="Sequence diagram. The buyer picks tickets on your site. Your server posts to /checkout/sessions with an Idempotency-Key and gets back a reserved session, a checkout URL and a thirty minute hold. You send the buyer to the payment page. After paying, the buyer is returned to your success URL. Your server then reads the session back from Vera, which reports status purchased and the issued tickets."
    lanes={[
      { id: "buyer", label: "Buyer" },
      { id: "you", label: "Your server" },
      { id: "vera", label: "Vera API" },
      { id: "pay", label: "Payment page" },
    ]}
    steps={[
      { from: "buyer", to: "you", label: "picks tickets" },
      {
        from: "you",
        to: "vera",
        label: "POST /checkout/sessions",
        note: "Idempotency-Key: order-2291",
      },
      {
        from: "vera",
        to: "you",
        label: "201 · reserved · checkoutUrl",
        reply: true,
        note: "tickets held 30 minutes",
      },
      { from: "you", to: "buyer", label: "redirect to checkoutUrl", reply: true },
      { from: "buyer", to: "pay", label: "pays" },
      {
        from: "pay",
        to: "buyer",
        label: "returns to your successUrl",
        reply: true,
        note: "arriving here is not proof of payment",
      },
      {
        from: "you",
        to: "vera",
        label: "GET /checkout/sessions/:id",
        accent: true,
      },
      {
        from: "vera",
        to: "you",
        label: "purchased · tickets[]",
        reply: true,
        accent: true,
        note: "now the sale is real",
      },
    ]}
  />
);

const IdempotencySequence = () => (
  <Sequence
    caption="A dropped response is not a failed request. The same key makes the retry safe."
    label="Sequence diagram. Your server posts a checkout session with Idempotency-Key order-2291. Vera creates session s_1 and holds two tickets, but the response is lost on the way back, so your server does not know what happened. Your server retries with the same body and the same idempotency key. Vera recognises the key and returns the original session s_1, rather than reserving a second pair of tickets."
    lanes={[
      { id: "you", label: "Your server" },
      { id: "vera", label: "Vera API" },
    ]}
    steps={[
      {
        from: "you",
        to: "vera",
        label: "POST /checkout/sessions",
        note: "Idempotency-Key: order-2291",
      },
      { from: "vera", to: "you", label: "201 · session s_1", reply: true, lost: true, note: "response lost — 2 tickets are already held" },
      {
        from: "you",
        to: "vera",
        label: "retry · same body, same key",
        accent: true,
      },
      {
        from: "vera",
        to: "you",
        label: "201 · session s_1 again",
        reply: true,
        accent: true,
        note: "no second reservation, no second charge",
      },
    ]}
  />
);

const DoorSequence = () => (
  <Sequence
    caption="Verify reads, check-in writes. The second scan is the whole reason they are two calls."
    label="Sequence diagram. The scanner posts a ticket code to /tickets/verify and Vera answers valid, not yet checked in, changing nothing. The scanner then posts the same code to /tickets/check-in and Vera admits the holder, marking the ticket used. When the same code is presented again, check-in refuses it because the ticket has already been used."
    lanes={[
      { id: "door", label: "Door scanner" },
      { id: "vera", label: "Vera API" },
    ]}
    steps={[
      { from: "door", to: "vera", label: "POST /tickets/verify" },
      {
        from: "vera",
        to: "door",
        label: "valid · not yet checked in",
        reply: true,
        note: "nothing changed",
      },
      { from: "door", to: "vera", label: "POST /tickets/check-in" },
      {
        from: "vera",
        to: "door",
        label: "admitted · ticket now used",
        reply: true,
      },
      {
        from: "door",
        to: "vera",
        label: "same code, scanned again",
        accent: true,
      },
      {
        from: "vera",
        to: "door",
        label: "refused · already checked in",
        reply: true,
        accent: true,
        note: "one ticket cannot admit a queue",
      },
    ]}
  />
);

/** The four states a checkout session can be in, and what moves it. */
const SessionStates = () => {
  const boxes = [
    { id: "reserved", label: "reserved", x: 300, y: 24, accent: false },
    { id: "purchased", label: "purchased", x: 560, y: 24, accent: true },
    { id: "expired", label: "expired", x: 560, y: 110, accent: false },
    { id: "cancelled", label: "cancelled", x: 560, y: 190, accent: false },
  ];
  const w = 128;
  const h = 40;

  return (
    <Figure
      height={250}
      caption="Where a session can go. Only one of these endings means you sold something."
      label="State diagram. Creating a session for a paid event produces a reserved session, held for thirty minutes. Paying moves it to purchased. The thirty minute window closing without payment moves it to expired and the tickets return to sale. Abandoning it moves it to cancelled. Creating a session for a free event skips reserved and arrives at purchased immediately."
    >
      <text x="20" y="20" fontSize="12" fill="currentColor" fillOpacity="0.7">
        POST /checkout/sessions
      </text>

      {/* Paid event: into the holding state. */}
      <line
        x1="20"
        y1="44"
        x2={300 - 6}
        y2="44"
        stroke="currentColor"
        strokeWidth="1.25"
        markerEnd="url(#doc-arrow)"
      />
      <text x="150" y="38" fontSize="11" fill="currentColor" fillOpacity="0.7">
        paid event
      </text>

      {/* Free event: straight to purchased, under the holding state. */}
      <polyline
        points={`20,52 20,224 ${300 + w / 2},224 ${560 - 6},224`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeDasharray="5 4"
        markerEnd="url(#doc-arrow)"
      />
      <text x="200" y="218" fontSize="11" fill="currentColor" fillOpacity="0.7">
        free event · no payment, tickets issued at once
      </text>
      <line
        x1={560 + w / 2 - 4}
        y1="224"
        x2={560 + w / 2 - 4}
        y2={24 + h + 6}
        stroke="currentColor"
        strokeWidth="1.25"
        strokeDasharray="5 4"
        markerEnd="url(#doc-arrow)"
      />

      {boxes.map((box) => (
        <g key={box.id} className={box.accent ? "text-primary" : undefined}>
          <rect
            x={box.x}
            y={box.y}
            width={w}
            height={h}
            rx="10"
            fill="none"
            stroke="currentColor"
            strokeOpacity={box.accent ? "0.9" : "0.35"}
            strokeWidth={box.accent ? "1.75" : "1.25"}
          />
          <text
            x={box.x + w / 2}
            y={box.y + 25}
            textAnchor="middle"
            fontSize="13"
            fontWeight="600"
            fill="currentColor"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          >
            {box.label}
          </text>
        </g>
      ))}

      {/* reserved → purchased */}
      <g className="text-primary">
        <line
          x1={300 + w + 4}
          y1="44"
          x2={560 - 6}
          y2="44"
          stroke="currentColor"
          strokeWidth="1.75"
          markerEnd="url(#doc-arrow)"
        />
        <text
          x={(300 + w + 560) / 2}
          y="36"
          textAnchor="middle"
          fontSize="11"
          fill="currentColor"
        >
          paid
        </text>
      </g>

      {/* reserved → expired */}
      <polyline
        points={`${300 + w / 2},${24 + h + 4} ${300 + w / 2},130 ${560 - 6},130`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        markerEnd="url(#doc-arrow)"
      />
      <text x={300 + w / 2 + 10} y="124" fontSize="11" fill="currentColor" fillOpacity="0.7">
        30 minutes pass · tickets go back on sale
      </text>

      {/* reserved → cancelled */}
      <polyline
        points={`${300 + w / 2},130 ${300 + w / 2},210 ${560 - 6},210`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        markerEnd="url(#doc-arrow)"
      />
      <text x={300 + w / 2 + 10} y="204" fontSize="11" fill="currentColor" fillOpacity="0.7">
        abandoned
      </text>
    </Figure>
  );
};

export const DIAGRAMS = {
  checkout: CheckoutSequence,
  idempotency: IdempotencySequence,
  door: DoorSequence,
  "session-states": SessionStates,
} as const;

export type DiagramName = keyof typeof DIAGRAMS;
