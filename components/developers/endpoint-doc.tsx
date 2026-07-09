import MethodBadge from "@/components/developers/method-badge";
import Badge from "@/components/ui/badge";
import CodeBlock from "@/components/ui/code-block";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buildExampleCurl } from "@/lib/developer-docs/build-curl";
import {
  type EndpointDoc,
  type EndpointParam,
} from "@/lib/developer-docs/endpoints";

const ParamsTable = ({
  title,
  params,
}: {
  title: string;
  params: EndpointParam[];
}) => (
  <div>
    <p className="mb-2 text-sm font-semibold  tracking-wide text-muted-foreground">
      {title}
    </p>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Required</TableHead>
          <TableHead>Description</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {params.map((param) => (
          <TableRow key={param.name}>
            <TableCell className="font-mono text-sm">{param.name}</TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {param.type}
            </TableCell>
            <TableCell className="text-sm">
              {param.required ? (
                <Badge variant="outline">required</Badge>
              ) : (
                <span className="text-muted-foreground">optional</span>
              )}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {param.description}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

const EndpointDocBlock = ({ endpoint }: { endpoint: EndpointDoc }) => (
  <section
    id={endpoint.id}
    className="scroll-mt-24 border-b border-border py-10"
  >
    <div className="flex flex-wrap items-center gap-3">
      <MethodBadge method={endpoint.method} />
      <code className="text-sm font-semibold text-foreground">
        {endpoint.path}
      </code>
      <Badge variant="outline">{endpoint.scope}</Badge>
    </div>
    <h3 className="mt-3 text-xl font-bold text-foreground">
      {endpoint.summary}
    </h3>
    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
      {endpoint.description}
    </p>

    <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="flex flex-col gap-6">
        {endpoint.pathParams ? (
          <ParamsTable title="Path parameters" params={endpoint.pathParams} />
        ) : null}
        {endpoint.queryParams ? (
          <ParamsTable title="Query parameters" params={endpoint.queryParams} />
        ) : null}
        {endpoint.bodyParams ? (
          <ParamsTable title="Body parameters" params={endpoint.bodyParams} />
        ) : null}
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Example request
          </p>
          <CodeBlock code={buildExampleCurl(endpoint)} lang="bash" />
        </div>
        {endpoint.bodyExamples?.map((example) => (
          <div key={example.label}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {example.label}
            </p>
            {example.note ? (
              <p className="mb-2 text-xs text-muted-foreground">{example.note}</p>
            ) : null}
            <CodeBlock code={JSON.stringify(example.body, null, 2)} lang="json" />
          </div>
        ))}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Example response
          </p>
          <CodeBlock
            code={JSON.stringify(endpoint.exampleResponse, null, 2)}
            lang="json"
          />
        </div>
      </div>
    </div>
  </section>
);

export default EndpointDocBlock;
