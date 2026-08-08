import type { ContextTrapsRequest, ModelOutput } from '../schema';

export type ProviderOutcome =
  | { readonly kind: 'ok'; readonly output: ModelOutput }
  | { readonly kind: 'disabled' }
  | { readonly kind: 'unavailable'; readonly detail: string }
  | { readonly kind: 'timeout' }
  | { readonly kind: 'invalid'; readonly detail: string };

export interface TrapProvider {
  readonly name: string;
  readonly model?: string;
  generate(request: ContextTrapsRequest, signal: AbortSignal): Promise<ProviderOutcome>;
}
