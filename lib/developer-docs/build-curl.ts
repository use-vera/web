import { type EndpointDoc } from "@/lib/developer-docs/endpoints";

const EXAMPLE_BASE_URL = "https://api.vera.dev";

/** Fills a "/events/:eventId" path with each param's example value. */
export const fillExamplePath = (endpoint: EndpointDoc) => {
  let path = endpoint.path;

  for (const param of endpoint.pathParams ?? []) {
    path = path.replace(`:${param.name}`, String(param.example ?? `{${param.name}}`));
  }

  return path;
};

export const buildExampleCurl = (endpoint: EndpointDoc) => {
  const url = `${EXAMPLE_BASE_URL}${fillExamplePath(endpoint)}`;
  const keyPlaceholder = endpoint.scope === "events:read" ? "pk_live_..." : "sk_live_...";

  const lines = [
    `curl -X ${endpoint.method} "${url}" \\`,
    `  -H "Authorization: Bearer ${keyPlaceholder}"`,
  ];

  if (endpoint.exampleRequestBody) {
    lines[lines.length - 1] += " \\";
    lines.push(`  -H "Content-Type: application/json" \\`);
    lines.push(`  -d '${JSON.stringify(endpoint.exampleRequestBody, null, 2).replace(/\n/g, "\n  ")}'`);
  }

  return lines.join("\n");
};
