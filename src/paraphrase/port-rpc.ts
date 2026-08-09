/**
 * Request/response over a long-lived extension port.
 *
 * A port is a stream, not a call. This adds the one thing the rest of Paraphrase
 * Mode needs on top of it — correlated replies — while keeping the two
 * properties the codebase already relies on everywhere else: nothing throws
 * across the boundary, and an unparseable message is answered rather than
 * dropped.
 *
 * Both ends run this same class. Whichever side is asking uses `request`,
 * whichever side is answering registers `serve`, and either may `emit` a
 * one-way event.
 */

import { CHANNEL, envelopeSchema } from './protocol';
import { failure, success, type Result } from '../domain/errors';

/**
 * The slice of `runtime.Port` this needs. Structural rather than imported so
 * the unit tests can drive it with a pair of in-memory ports.
 */
export interface PortLike {
  postMessage(message: unknown): void;
  disconnect(): void;
  readonly onMessage: { addListener(listener: (message: unknown) => void): void };
  readonly onDisconnect: { addListener(listener: () => void): void };
}

/** Generous: a generation batch legitimately takes tens of seconds. */
export const DEFAULT_RPC_TIMEOUT_MS = 30_000;

let counter = 0;

function nextId(): string {
  counter = (counter + 1) % 1_000_000;
  return `rpc_${Date.now().toString(36)}_${counter.toString(36)}_${Math.floor(
    Math.random() * 1e6,
  ).toString(36)}`;
}

export type RequestHandler = (payload: unknown) => Promise<Result<unknown>>;
export type EventListener = (payload: unknown) => void;

interface Pending {
  readonly resolve: (result: Result<unknown>) => void;
  readonly timer: ReturnType<typeof setTimeout>;
}

export class PortRpc {
  private readonly pending = new Map<string, Pending>();
  private handler: RequestHandler | null = null;
  private readonly eventListeners = new Set<EventListener>();
  private closed = false;

  constructor(private readonly port: PortLike) {
    port.onMessage.addListener((raw) => {
      this.receive(raw);
    });
    port.onDisconnect.addListener(() => {
      this.close('The Eclipse paraphrase channel closed.');
    });
  }

  get isClosed(): boolean {
    return this.closed;
  }

  /** Answer inbound requests with this handler. Replaces any previous one. */
  serve(handler: RequestHandler): void {
    this.handler = handler;
  }

  onEvent(listener: EventListener): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  emit(payload: unknown): void {
    if (this.closed) return;
    try {
      this.port.postMessage({ channel: CHANNEL, kind: 'event', payload });
    } catch {
      // The peer went away between the check and the post. Nothing to recover.
    }
  }

  async request<D>(payload: unknown, timeoutMs = DEFAULT_RPC_TIMEOUT_MS): Promise<Result<D>> {
    if (this.closed) {
      return failure('CONTENT_SCRIPT_UNAVAILABLE', 'The Eclipse paraphrase channel is closed.');
    }

    const id = nextId();
    const settled = new Promise<Result<unknown>>((resolve) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        resolve(failure('PROVIDER_TIMEOUT', `No answer within ${timeoutMs}ms.`));
      }, timeoutMs);
      this.pending.set(id, { resolve, timer });
    });

    try {
      this.port.postMessage({ channel: CHANNEL, kind: 'request', id, payload });
    } catch (cause) {
      const entry = this.pending.get(id);
      if (entry) {
        clearTimeout(entry.timer);
        this.pending.delete(id);
      }
      const detail = cause instanceof Error ? cause.message : 'the channel refused the request';
      return failure('CONTENT_SCRIPT_UNAVAILABLE', detail);
    }

    return (await settled) as Result<D>;
  }

  disconnect(): void {
    try {
      this.port.disconnect();
    } catch {
      // Already gone.
    }
    this.close('The Eclipse paraphrase channel was closed locally.');
  }

  private close(reason: string): void {
    if (this.closed) return;
    this.closed = true;
    // Every caller waiting on this port gets a typed failure rather than a
    // promise that never settles. A hung await in a content script is
    // indistinguishable, to a learner, from the extension being broken.
    for (const [, entry] of this.pending) {
      clearTimeout(entry.timer);
      entry.resolve(failure('CONTENT_SCRIPT_UNAVAILABLE', reason));
    }
    this.pending.clear();
    this.eventListeners.clear();
  }

  private receive(raw: unknown): void {
    const parsed = envelopeSchema.safeParse(raw);
    if (!parsed.success) return;
    const envelope = parsed.data;

    if (envelope.kind === 'response') {
      const entry = this.pending.get(envelope.id);
      if (!entry) return;
      clearTimeout(entry.timer);
      this.pending.delete(envelope.id);
      entry.resolve(envelope.result as Result<unknown>);
      return;
    }

    if (envelope.kind === 'event') {
      for (const listener of this.eventListeners) {
        try {
          listener(envelope.payload);
        } catch {
          // A listener that throws must not take the channel down with it.
        }
      }
      return;
    }

    void this.answer(envelope.id, envelope.payload);
  }

  private async answer(id: string, payload: unknown): Promise<void> {
    const handler = this.handler;
    let result: Result<unknown>;

    if (!handler) {
      result = failure('MESSAGE_UNSUPPORTED', 'This peer does not serve paraphrase requests.');
    } else {
      try {
        result = await handler(payload);
      } catch (cause) {
        const detail = cause instanceof Error ? cause.message : 'The paraphrase handler failed.';
        result = failure('UNKNOWN_ERROR', detail);
      }
    }

    if (this.closed) return;
    try {
      this.port.postMessage({ channel: CHANNEL, kind: 'response', id, result });
    } catch {
      // The asking side disconnected while we were working. Its own close path
      // has already failed the pending call.
    }
  }
}

/** Convenience for handlers that always succeed. */
export const ok = success;
export const fail = failure;
