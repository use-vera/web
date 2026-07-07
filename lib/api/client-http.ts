import axios from "axios";

/**
 * Browser-only axios instance. Talks to this Next.js app's own BFF routes
 * under /api/* — never directly to the real backend, and never carries a
 * bearer token (the BFF's session cookie handles that server-side).
 */
const clientHttp = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default clientHttp;
