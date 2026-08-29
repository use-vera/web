/**
 * Must match the server's `hashTicketCode` exactly. HMAC-SHA-256 over the
 * upper-cased, trimmed code, hex, truncated to 32 characters. If the two ever
 * diverge, every scan silently rejects as unknown, so the contract is covered
 * by a backend test.
 */
const keyCache = new Map<string, Promise<CryptoKey>>();

const importKey = (rosterKeyHex: string) => {
  const cached = keyCache.get(rosterKeyHex);

  if (cached) {
    return cached;
  }

  const bytes = new Uint8Array(
    rosterKeyHex.match(/.{2}/g)?.map((pair) => parseInt(pair, 16)) ?? [],
  );

  const promise = crypto.subtle.importKey(
    "raw",
    bytes,
    { name: "HMAC", hash: "SHA-256" },
    /* Non-extractable: once imported, the raw key cannot be read back out. */
    false,
    ["sign"],
  );

  keyCache.set(rosterKeyHex, promise);

  return promise;
};

export const hashTicketCode = async (rosterKeyHex: string, code: string) => {
  const key = await importKey(rosterKeyHex);
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(code.trim().toUpperCase()),
  );

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
};
