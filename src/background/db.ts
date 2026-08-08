/**
 * Saving to IndexedDB.
 *
 * A Manifest V3 service worker is shut down after about thirty seconds of
 * doing nothing, and everything in memory goes with it. So nothing may live
 * only in memory: the learner's record is written back after every screen, and
 * read again whenever the worker wakes up.
 */

const DB_NAME = "eclipse";
const DB_VERSION = 1;

/** The learner's whole record, as one lump of bytes. */
const STORE_STATE = "state";
/** Every answer ever given. Append only. This is the part we can never rebuild. */
const STORE_LOG = "log";
/** Mixed sentences we have already paid for. */
const STORE_CACHE = "cache";

export interface LogRow {
  ts: number;
  wordId: number;
  shownAs: string;
  typed: string;
  correct: boolean;
  host: string;
}

let opening: Promise<IDBDatabase> | undefined;

function open(): Promise<IDBDatabase> {
  opening ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_STATE)) db.createObjectStore(STORE_STATE);
      if (!db.objectStoreNames.contains(STORE_LOG)) {
        db.createObjectStore(STORE_LOG, { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(STORE_CACHE)) db.createObjectStore(STORE_CACHE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return opening;
}

function run<T>(store: string, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(store, mode);
        const req = fn(tx.objectStore(store));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }),
  );
}

// ---------------------------------------------------------------------------

export const saveState = (bytes: Uint8Array) =>
  run(STORE_STATE, "readwrite", (s) => s.put(bytes, "learner"));

export const loadState = () =>
  run<Uint8Array | undefined>(STORE_STATE, "readonly", (s) => s.get("learner"));

/**
 * The answer log is the only thing here we could not rebuild.
 *
 * The learner's record is a summary of these rows. If the memory model ever
 * changes, we replay the log and build a new summary. Without the log that
 * option is gone forever, so it is written first and never edited.
 */
export const appendLog = (row: LogRow) => run(STORE_LOG, "readwrite", (s) => s.add(row));

export const readLog = () => run<LogRow[]>(STORE_LOG, "readonly", (s) => s.getAll());

// ---------------------------------------------------------------------------
// Cache. Scrolling back up, or reopening a page, must be free — the request
// budget is 750 per thirty minutes and a long article would eat it.
// ---------------------------------------------------------------------------

export const cacheGet = (key: string) =>
  run<unknown>(STORE_CACHE, "readonly", (s) => s.get(key));

export const cachePut = (key: string, value: unknown) =>
  run(STORE_CACHE, "readwrite", (s) => s.put(value, key));

export const clearAll = async () => {
  for (const store of [STORE_STATE, STORE_LOG, STORE_CACHE]) {
    await run(store, "readwrite", (s) => s.clear());
  }
};

/** A short, stable key for a sentence and the exact words we chose for it. */
export function cacheKey(sentence: string, wordIds: readonly number[]): string {
  let h = 2166136261;
  const s = `${sentence}|${wordIds.join(",")}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}
