/**
 * Request/response over a long-lived port.
 *
 * The properties worth guaranteeing are the ones a hung promise in a content
 * script would otherwise violate silently: every request settles, a dropped
 * connection fails the calls waiting on it, and a reply is matched to the
 * request that asked for it rather than to whichever came back first.
 */

import { describe, expect, it, vi } from 'vitest';
import { PortRpc, type PortLike } from '@/paraphrase/port-rpc';
import { CHANNEL } from '@/paraphrase/protocol';
import { failure, success } from '@/domain/errors';

/** A pair of in-memory ports wired to each other, as Chrome would wire them. */
function portPair(): { left: PortLike; right: PortLike; cut: () => void } {
  const listeners = { left: [] as ((m: unknown) => void)[], right: [] as ((m: unknown) => void)[] };
  const closers = { left: [] as (() => void)[], right: [] as (() => void)[] };
  let open = true;

  const make = (self: 'left' | 'right', peer: 'left' | 'right'): PortLike => ({
    postMessage(message) {
      if (!open) throw new Error('port closed');
      // Asynchronous, like the real thing: a synchronous hand-off would hide
      // ordering bugs that only appear across a process boundary.
      queueMicrotask(() => {
        for (const listener of listeners[peer]) listener(message);
      });
    },
    disconnect() {
      cut();
    },
    onMessage: {
      addListener(listener) {
        listeners[self].push(listener);
      },
    },
    onDisconnect: {
      addListener(listener) {
        closers[self].push(listener);
      },
    },
  });

  function cut(): void {
    if (!open) return;
    open = false;
    for (const side of ['left', 'right'] as const) {
      for (const listener of closers[side]) listener();
    }
  }

  return { left: make('left', 'right'), right: make('right', 'left'), cut };
}

describe('request and response', () => {
  it('carries a handler result back to the caller', async () => {
    const { left, right } = portPair();
    const client = new PortRpc(left);
    const server = new PortRpc(right);
    server.serve(async (payload) => success({ echoed: payload }));

    const result = await client.request<{ echoed: unknown }>({ type: 'HELLO' });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.echoed).toEqual({ type: 'HELLO' });
  });

  it('carries a typed failure back without throwing', async () => {
    const { left, right } = portPair();
    const client = new PortRpc(left);
    new PortRpc(right).serve(async () => failure('NO_ARTICLE'));

    const result = await client.request({ type: 'ACTIVATE' });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('NO_ARTICLE');
  });

  it('matches each reply to the request that asked for it', async () => {
    const { left, right } = portPair();
    const client = new PortRpc(left);
    const server = new PortRpc(right);

    // The slow request is issued first and answered last.
    server.serve(async (payload) => {
      const delay = (payload as { delay: number }).delay;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return success({ delay });
    });

    const [slow, fast] = await Promise.all([
      client.request<{ delay: number }>({ delay: 30 }),
      client.request<{ delay: number }>({ delay: 1 }),
    ]);

    expect(slow.ok && slow.data.delay).toBe(30);
    expect(fast.ok && fast.data.delay).toBe(1);
  });

  it('turns a handler that throws into a typed failure', async () => {
    const { left, right } = portPair();
    const client = new PortRpc(left);
    new PortRpc(right).serve(async () => {
      throw new Error('boom');
    });

    const result = await client.request({ type: 'HELLO' });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('UNKNOWN_ERROR');
    expect(result.error.message).toBe('boom');
  });

  it('answers rather than going silent when the peer serves nothing', async () => {
    const { left, right } = portPair();
    const client = new PortRpc(left);
    new PortRpc(right);

    const result = await client.request({ type: 'HELLO' });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('MESSAGE_UNSUPPORTED');
  });
});

describe('failure modes', () => {
  it('fails pending calls when the connection drops', async () => {
    const { left, right, cut } = portPair();
    const client = new PortRpc(left);
    new PortRpc(right).serve(
      () => new Promise(() => undefined) as Promise<ReturnType<typeof success>>,
    );

    const pending = client.request({ type: 'ACTIVATE' });
    cut();

    const result = await pending;
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('CONTENT_SCRIPT_UNAVAILABLE');
    expect(client.isClosed).toBe(true);
  });

  it('refuses a request on an already-closed channel instead of hanging', async () => {
    const { left, cut } = portPair();
    const client = new PortRpc(left);
    cut();

    const result = await client.request({ type: 'HELLO' });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('CONTENT_SCRIPT_UNAVAILABLE');
  });

  it('times out rather than waiting forever on a silent peer', async () => {
    vi.useFakeTimers();
    try {
      const { left, right } = portPair();
      const client = new PortRpc(left);
      new PortRpc(right).serve(
        () => new Promise(() => undefined) as Promise<ReturnType<typeof success>>,
      );

      const pending = client.request({ type: 'HELLO' }, 50);
      await vi.advanceTimersByTimeAsync(60);

      const result = await pending;
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.error.code).toBe('PROVIDER_TIMEOUT');
    } finally {
      vi.useRealTimers();
    }
  });

  it('ignores a message that is not part of this channel', async () => {
    const { left, right } = portPair();
    const client = new PortRpc(left);
    const seen: unknown[] = [];
    client.onEvent((payload) => seen.push(payload));

    right.postMessage({ channel: 'something-else', kind: 'event', payload: 'x' });
    right.postMessage({ kind: 'event' });
    right.postMessage({ channel: CHANNEL, kind: 'event', payload: 'kept' });
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(seen).toEqual(['kept']);
  });
});

describe('events', () => {
  it('delivers one-way pushes to every listener', async () => {
    const { left, right } = portPair();
    const client = new PortRpc(left);
    const server = new PortRpc(right);

    const seen: unknown[] = [];
    const stop = client.onEvent((payload) => seen.push(payload));
    server.emit({ type: 'SNAPSHOT' });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(seen).toEqual([{ type: 'SNAPSHOT' }]);

    stop();
    server.emit({ type: 'SNAPSHOT' });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(seen).toHaveLength(1);
  });

  it('keeps the channel alive when a listener throws', async () => {
    const { left, right } = portPair();
    const client = new PortRpc(left);
    const server = new PortRpc(right);

    const seen: unknown[] = [];
    client.onEvent(() => {
      throw new Error('listener exploded');
    });
    client.onEvent((payload) => seen.push(payload));

    server.emit({ type: 'SNAPSHOT' });
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(seen).toEqual([{ type: 'SNAPSHOT' }]);
    expect(client.isClosed).toBe(false);
  });
});
