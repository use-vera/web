import clientHttp from "@/lib/api/client-http";
import { io, type Socket } from "socket.io-client";

interface Handshake {
  token: string;
  url: string;
}

let socket: Socket | null = null;
let starting: Promise<Socket | null> | null = null;

/* The token minted to learn the socket URL, saved so the first connection
   does not immediately mint a second one. */
let firstToken: string | null = null;

/**
 * Asks our own BFF for a handshake token.
 *
 * The session's real bearer token stays in an httpOnly cookie, so this is
 * the only credential the browser ever holds: socket-only, and good for a
 * couple of minutes.
 */
const mintHandshake = async (): Promise<Handshake | null> => {
  try {
    const { data } = await clientHttp.post("/realtime/token");
    const issued = data?.data as Partial<Handshake> | undefined;

    return issued?.token && issued?.url
      ? { token: issued.token, url: issued.url }
      : null;
  } catch {
    return null;
  }
};

export const getRealtimeSocket = () => socket;

export const disconnectRealtimeSocket = () => {
  socket?.removeAllListeners();
  socket?.disconnect();
  socket = null;
  starting = null;
  firstToken = null;
};

/**
 * The browser's one socket, shared by every screen that wants pushes.
 *
 * Returns null rather than throwing when there is no session or the backend
 * is unreachable: realtime is an improvement on a screen, never the thing
 * the screen depends on.
 */
export const connectRealtimeSocket = async (): Promise<Socket | null> => {
  if (socket) {
    return socket;
  }

  if (starting) {
    return starting;
  }

  starting = (async () => {
    const handshake = await mintHandshake();

    if (!handshake) {
      return null;
    }

    firstToken = handshake.token;
    socket = io(handshake.url, {
      transports: ["websocket", "polling"],
      auth: (done) => {
        /* Called again on every reconnect, by which time the token from the
           last one has expired, so each attempt gets a fresh one. */
        const token = firstToken;
        firstToken = null;

        if (token) {
          done({ token });
          return;
        }

        void mintHandshake().then((next) => done({ token: next?.token ?? "" }));
      },
    });

    return socket;
  })();

  try {
    return await starting;
  } finally {
    starting = null;
  }
};
