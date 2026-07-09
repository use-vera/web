import CodeBlock from "@/components/ui/code-block";
import { cn } from "@/lib/utils";

export interface SandboxResponse {
  status: number;
  ok: boolean;
  durationMs: number;
  body: unknown;
}

const ResponseViewer = ({ response }: { response: SandboxResponse | null }) => {
  if (!response) {
    return (
      <div className="flex h-full min-h-64 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
        Send a request to see the response here.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 text-sm">
        <span
          className={cn(
            "rounded-md px-2 py-0.5 font-mono text-xs font-bold",
            response.ok
              ? "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"
              : "bg-red-500/10 text-red-700 dark:bg-red-400/10 dark:text-red-300",
          )}
        >
          {response.status}
        </span>
        <span className="text-muted-foreground">{response.durationMs}ms</span>
      </div>
      <CodeBlock code={JSON.stringify(response.body, null, 2)} lang="json" />
    </div>
  );
};

export default ResponseViewer;
