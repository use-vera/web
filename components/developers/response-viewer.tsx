import CodeBlock from "@/components/ui/code-block";
import { POSTER_TONES } from "@/components/vera/event-poster";

export interface SandboxResponse {
  status: number;
  ok: boolean;
  durationMs: number;
  body: unknown;
}

const ResponseViewer = ({ response }: { response: SandboxResponse | null }) => {
  if (!response) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-[28px] border-[1.5px] border-dashed border-border px-6 text-center text-[13px] font-semibold text-muted-foreground">
        Send a request to see the response here.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 text-sm">
        <span
          className="rounded-full px-3 py-1 font-mono text-[13px] font-extrabold"
          style={response.ok ? { backgroundColor: POSTER_TONES.green.bg, color: POSTER_TONES.green.fg } : { backgroundColor: POSTER_TONES.pink.bg, color: POSTER_TONES.pink.fg }}
        >
          {response.status}
        </span>
        <span className="text-[13px] font-semibold text-muted-foreground tabular-nums">{response.durationMs}ms</span>
      </div>
      {/* A response is whatever the server sent back — a page of 100 events
          is thousands of lines, and left whole it buries the request form
          and everything under it. */}
      <CodeBlock
        code={JSON.stringify(response.body, null, 2)}
        lang="json"
        collapsible
      />
    </div>
  );
};

export default ResponseViewer;
