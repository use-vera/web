import serverHttp from "@/lib/api/server-http";
import { forwardBackendError } from "@/lib/api/route-helpers";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ slug: string }> };

/**
 * A vendor's public page. No session required: an organizer deciding whether
 * to invite someone should not have to be signed in to look at their menu,
 * and the backend only returns what is already on sale.
 *
 * Static segments (me, categories, directory) win over this one in Next's
 * router, so they keep their own handlers.
 */
export async function GET(_request: NextRequest, { params }: Params) {
  const { slug } = await params;

  try {
    /* The public mount, not /vendors/:slug: that one is behind the vendor
       router's auth middleware, and this request deliberately carries no
       session. */
    const response = await serverHttp.get(`/public/vendors/${slug}`);

    return NextResponse.json(response.data);
  } catch (error) {
    return forwardBackendError(error);
  }
}
