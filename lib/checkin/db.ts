import {
  type DoorMeta,
  type QueuedScan,
  type RosterEntry,
} from "@/lib/checkin/types";

/**
 * IndexedDB, not localStorage.
 *
 * localStorage is synchronous, so every scan would block the UI thread while
 * the queue is written. Exactly the stall this feature exists to remove. It
 * is also string-only and capped near 5MB, which a roster plus a night of
 * scans can reach.
 */
const DB_NAME = "vera-door";
const DB_VERSION = 1;

export const STORE = {
  roster: "roster",
  queue: "queue",
  admitted: "admitted",
  meta: "meta",
} as const;

let dbPromise: Promise<IDBDatabase> | null = null;

const openDb = () => {
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE.roster)) {
        db.createObjectStore(STORE.roster, { keyPath: "h" });
      }

      if (!db.objectStoreNames.contains(STORE.queue)) {
        /* autoIncrement gives every scan a monotonic clientSeq, which is what
           makes a retried batch idempotent server-side. */
        db.createObjectStore(STORE.queue, {
          keyPath: "clientSeq",
          autoIncrement: true,
        });
      }

      if (!db.objectStoreNames.contains(STORE.admitted)) {
        db.createObjectStore(STORE.admitted, { keyPath: "h" });
      }

      if (!db.objectStoreNames.contains(STORE.meta)) {
        db.createObjectStore(STORE.meta, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
};

const run = async <T,>(
  storeName: string,
  mode: IDBTransactionMode,
  work: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> => {
  const db = await openDb();

  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const request = work(transaction.objectStore(storeName));

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const doorDb = {
  /* --- roster --- */

  async replaceRoster(entries: RosterEntry[]) {
    const db = await openDb();

    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE.roster, "readwrite");
      const store = transaction.objectStore(STORE.roster);
      store.clear();
      entries.forEach((entry) => store.put(entry));

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  },

  /** Applies a delta: upserts what changed, deletes what was revoked. */
  async mergeRoster(entries: RosterEntry[], revoked: string[]) {
    const db = await openDb();

    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE.roster, "readwrite");
      const store = transaction.objectStore(STORE.roster);
      entries.forEach((entry) => store.put(entry));
      revoked.forEach((hash) => store.delete(hash));

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  },

  getRosterEntry: (hash: string) =>
    run<RosterEntry | undefined>(STORE.roster, "readonly", (store) =>
      store.get(hash),
    ),

  countRoster: () =>
    run<number>(STORE.roster, "readonly", (store) => store.count()),

  /* --- local used-set: the same-device duplicate check --- */

  markAdmitted: (hash: string, at: string) =>
    run(STORE.admitted, "readwrite", (store) => store.put({ h: hash, at })),

  getAdmitted: (hash: string) =>
    run<{ h: string; at: string } | undefined>(
      STORE.admitted,
      "readonly",
      (store) => store.get(hash),
    ),

  countAdmitted: () =>
    run<number>(STORE.admitted, "readonly", (store) => store.count()),

  /* --- queue --- */

  enqueue: (scan: Omit<QueuedScan, "clientSeq">) =>
    run<IDBValidKey>(STORE.queue, "readwrite", (store) => store.add(scan)),

  pending: async () => {
    const all = await run<QueuedScan[]>(STORE.queue, "readonly", (store) =>
      store.getAll(),
    );

    return all.filter((scan) => scan.syncState === "pending");
  },

  allScans: () =>
    run<QueuedScan[]>(STORE.queue, "readonly", (store) => store.getAll()),

  async settle(clientSeq: number, syncState: QueuedScan["syncState"], serverResult?: string) {
    const existing = await run<QueuedScan | undefined>(
      STORE.queue,
      "readonly",
      (store) => store.get(clientSeq),
    );

    if (!existing) {
      return;
    }

    await run(STORE.queue, "readwrite", (store) =>
      store.put({ ...existing, syncState, serverResult }),
    );
  },

  /* --- meta --- */

  getMeta: async () => {
    const row = await run<{ key: string; value: DoorMeta } | undefined>(
      STORE.meta,
      "readonly",
      (store) => store.get("door"),
    );

    return row?.value ?? null;
  },

  setMeta: (value: DoorMeta) =>
    run(STORE.meta, "readwrite", (store) =>
      store.put({ key: "door", value }),
    ),

  /** Wipes everything. Used when the roster expires or the event changes. */
  async clearAll() {
    const db = await openDb();

    return new Promise<void>((resolve, reject) => {
      const names = Object.values(STORE);
      const transaction = db.transaction(names, "readwrite");
      names.forEach((name) => transaction.objectStore(name).clear());

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  },
};
