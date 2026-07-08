import axios from "axios";

/**
 * Server-only axios instance. Talks directly to the real Trackr backend and
 * is only ever imported from Next.js Route Handlers (app/api/**\/route.ts) —
 * never from client components. Attach the session's bearer token per-request
 * via the `Authorization` header rather than baking it in here.
 */
const serverHttp = axios.create({
  baseURL: process.env.BACKEND_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default serverHttp;
