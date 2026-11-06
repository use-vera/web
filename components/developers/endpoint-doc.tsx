import MethodBadge from "@/components/developers/method-badge";
import CodeBlock from "@/components/ui/code-block";
import { buildExampleCurl } from "@/lib/developer-docs/build-curl";
import { type EndpointDoc, type EndpointParam } from "@/lib/developer-docs/endpoints";
import { ROUTES } from "@/lib/utils";
import { PlayCircle } from "lucide-react";
import Link from "next/link";

const LABEL = "mb-2 block text-[13px] font-bold";

const ParamsTable = ({ title, params }: { title: string; params: EndpointParam[] }) => (
  <div className="min-w-0">
    <p className={LABEL}>{title}</p>
    <ul className="divide-y-[1.5px] divide-border overflow-hidden rounded-[20px] border-[1.5px] border-border">
      {params.map((param) => (
        <li key={param.name} className="flex flex-col gap-1 px-4 py-3">
          <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <code className="font-mono text-[13px] font-bold">{param.name}</code>
            <span className="text-[13px] text-muted-foreground">{param.type}</span>
            {param.required ? (
              <span className="rounded-full border-[1.5px] border-foreground px-2 text-[11px] font-bold">required</span>
            ) : (
              <span className="text-[13px] text-muted-foreground">optional</span>
            )}
          </span>
          <span className="text-[13px] leading-relaxed text-muted-foreground">{param.description}</span>
        </li>
      ))}
    </ul>
  </div>
);

const EndpointDocBlock = ({ endpoint }: { endpoint: EndpointDoc }) => (
  <section id={endpoint.id} className="scroll-mt-24 rounded-[28px] border-[1.5px] border-border p-5 sm:p-6">
    <div className="flex flex-wrap items-center gap-2.5">
      <MethodBadge method={endpoint.method} />
      <code className="min-w-0 font-mono text-sm font-bold break-all">{endpoint.path}</code>
      <span className="rounded-full border-[1.5px] border-border px-2.5 py-0.5 font-mono text-xs font-semibold text-muted-foreground">{endpoint.scope}</span>

      {/* Reading an endpoint and trying it are a step apart, not a page
          apart: the sandbox opens on this endpoint with its example values
          already in the form. */}
      <Link
        href={`${ROUTES.DEVELOPERS_SANDBOX}?endpoint=${endpoint.id}`}
        className="ml-auto flex h-9 items-center gap-1.5 rounded-full bg-foreground px-3.5 text-[13px] font-bold text-background transition-opacity hover:opacity-90"
      >
        <PlayCircle className="h-4 w-4" />
        Try it
      </Link>
    </div>
    <h3 className="mt-4 text-[22px] leading-tight font-extrabold tracking-[-0.03em]">{endpoint.summary}</h3>
    <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">{endpoint.description}</p>

    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="flex min-w-0 flex-col gap-5">
        {endpoint.pathParams ? <ParamsTable title="Path parameters" params={endpoint.pathParams} /> : null}
        {endpoint.queryParams ? <ParamsTable title="Query parameters" params={endpoint.queryParams} /> : null}
        {endpoint.bodyParams ? <ParamsTable title="Body parameters" params={endpoint.bodyParams} /> : null}
        {!endpoint.pathParams && !endpoint.queryParams && !endpoint.bodyParams ? (
          <p className="rounded-[20px] border-[1.5px] border-dashed border-border px-4 py-5 text-center text-[13px] font-semibold text-muted-foreground">
            No parameters.
          </p>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-col gap-5">
        <div>
          <p className={LABEL}>Example request</p>
          <CodeBlock code={buildExampleCurl(endpoint)} lang="bash" />
        </div>
        {endpoint.bodyExamples?.map((example) => (
          <div key={example.label}>
            <p className={LABEL}>{example.label}</p>
            {example.note ? <p className="mb-2 text-[13px] text-muted-foreground">{example.note}</p> : null}
            <CodeBlock code={JSON.stringify(example.body, null, 2)} lang="json" />
          </div>
        ))}
        <div>
          <p className={LABEL}>Example response</p>
          <CodeBlock code={JSON.stringify(endpoint.exampleResponse, null, 2)} lang="json" />
        </div>
      </div>
    </div>
  </section>
);

export default EndpointDocBlock;
