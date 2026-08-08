import { beforeEach, describe, expect, it } from 'vitest';
import { collectEligibleBlocks, findArticleRoot } from '@/content/article';
import { findOwnedNodes, OWNER_ATTRIBUTE } from '@/content/dom-tokens';
import { planPlacements } from '@/content/place-traps';
import { normalizedVisibleText } from '@/domain/normalize';
import { createEmptyProfile } from '@/domain/profile';
import { memoryArea } from '@/storage/area';
import { loadProfile, saveProfile } from '@/storage/profile-store';
import { flush, loadDemo, newSession, renderBody, renderHtml } from './helpers';

const NOW = new Date('2026-03-01T12:00:00.000Z');

function snapshotArticle(): string {
  const root = findArticleRoot(document);
  return normalizedVisibleText(root ?? document.body);
}

function tokens(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>(`[${OWNER_ATTRIBUTE}]`));
}

describe('Demo A activation', () => {
  beforeEach(() => {
    renderHtml(loadDemo('demo-a.html'));
  });

  it('places between two and four traps', async () => {
    const { session } = newSession();
    const result = await session.activate('ses_a');
    expect(result.ok, result.ok ? '' : result.error.message).toBe(true);
    if (!result.ok) return;

    expect(result.data.trapCount).toBeGreaterThanOrEqual(2);
    expect(result.data.trapCount).toBeLessThanOrEqual(4);
    expect(tokens()).toHaveLength(result.data.trapCount);
  });

  it('is deterministic across runs', async () => {
    const first = newSession();
    const a = await first.session.activate('ses_1');
    const conceptsA = a.ok ? [...a.data.conceptIds].sort() : [];
    await first.session.deactivate('ses_1');

    renderHtml(loadDemo('demo-a.html'));
    const second = newSession();
    const b = await second.session.activate('ses_2');
    const conceptsB = b.ok ? [...b.data.conceptIds].sort() : [];

    expect(conceptsA).toEqual(conceptsB);
    expect(conceptsA.length).toBeGreaterThan(0);
  });

  it('renders real buttons carrying owner, session and trap ids', async () => {
    const { session } = newSession();
    await session.activate('ses_a');

    for (const token of tokens()) {
      expect(token.tagName).toBe('BUTTON');
      expect(token.getAttribute('type')).toBe('button');
      expect(token.getAttribute(OWNER_ATTRIBUTE)).toBe('eclipse');
      expect(token.getAttribute('data-eclipse-session')).toBe('ses_a');
      expect(token.getAttribute('data-eclipse-trap')).toBeTruthy();
      expect(token.getAttribute('data-eclipse-concept')).toMatch(/^fr:/);
      expect(token.getAttribute('lang')).toBe('fr-FR');
      expect(token.getAttribute('aria-label')).toMatch(/French context challenge/);
      expect(token.textContent?.length).toBeGreaterThan(0);
      // Text only, never markup.
      expect(token.children).toHaveLength(0);
    }
  });

  it('never places a trap in an excluded region', async () => {
    const { session } = newSession();
    await session.activate('ses_a');

    for (const token of tokens()) {
      expect(token.closest('a')).toBeNull();
      expect(token.closest('nav')).toBeNull();
      expect(token.closest('header')).toBeNull();
      expect(token.closest('footer')).toBeNull();
      expect(token.closest('aside')).toBeNull();
      expect(token.closest('form')).toBeNull();
      expect(token.closest('pre')).toBeNull();
      expect(token.closest('code')).toBeNull();
      expect(token.closest('[contenteditable]')).toBeNull();
      expect(token.closest('[aria-hidden="true"]')).toBeNull();
      expect(token.closest('figcaption')).toBeNull();
    }
  });

  it('places at most one trap per block', async () => {
    const { session } = newSession();
    await session.activate('ses_a');

    const blocks = tokens().map((token) => token.closest('p, li, blockquote'));
    expect(new Set(blocks).size).toBe(blocks.length);
  });

  it('preserves the whitespace around every replaced span', async () => {
    const { session } = newSession();
    await session.activate('ses_a');

    for (const token of tokens()) {
      const before = token.previousSibling;
      const after = token.nextSibling;
      // The characters either side of the replaced range are untouched, so a
      // token never fuses with the words around it.
      if (before?.nodeType === 3) {
        expect((before as Text).data.endsWith(' ')).toBe(true);
      }
      if (after?.nodeType === 3) {
        const next = (after as Text).data;
        expect(next.length === 0 || /^[\s.,;:!?)'"]/.test(next)).toBe(true);
      }
    }
  });
});

describe('idempotent activation', () => {
  beforeEach(() => {
    renderHtml(loadDemo('demo-a.html'));
  });

  it('re-activating the same session changes nothing', async () => {
    const { session } = newSession();
    const first = await session.activate('ses_a');
    const countAfterFirst = tokens().length;

    const second = await session.activate('ses_a');
    expect(second.ok).toBe(true);
    expect(tokens()).toHaveLength(countAfterFirst);
    if (first.ok && second.ok) {
      expect(second.data.trapCount).toBe(first.data.trapCount);
    }
  });

  it('activating a new session replaces the old one without stacking tokens', async () => {
    const { session } = newSession();
    await session.activate('ses_a');
    const firstCount = tokens().length;

    const second = await session.activate('ses_b');
    expect(second.ok).toBe(true);
    expect(tokens()).toHaveLength(firstCount);
    for (const token of tokens()) {
      expect(token.getAttribute('data-eclipse-session')).toBe('ses_b');
    }
  });
});

describe('deactivation restores the page', () => {
  it('restores normalized visible text exactly', async () => {
    renderHtml(loadDemo('demo-a.html'));
    const before = snapshotArticle();

    const { session } = newSession();
    const activated = await session.activate('ses_a');
    expect(activated.ok).toBe(true);
    expect(snapshotArticle()).not.toBe(before);

    const stopped = await session.deactivate('ses_a');
    expect(stopped.ok).toBe(true);
    if (stopped.ok) {
      expect(stopped.data.restored).toBe(true);
      expect(stopped.data.textVerified).toBe(true);
    }
    expect(snapshotArticle()).toBe(before);
  });

  it('leaves no Eclipse-owned node behind', async () => {
    renderHtml(loadDemo('demo-a.html'));
    const { session } = newSession();
    await session.activate('ses_a');
    expect(findOwnedNodes(document).length).toBeGreaterThan(0);

    await session.deactivate('ses_a');
    expect(findOwnedNodes(document)).toHaveLength(0);
  });

  it('removes the overlay and the token stylesheet', async () => {
    renderHtml(loadDemo('demo-a.html'));
    const { session, host } = newSession();
    await session.activate('ses_a');
    expect(host.mounts).toHaveLength(1);
    expect(document.querySelector('[data-eclipse-test-styles]')).not.toBeNull();

    await session.deactivate('ses_a');
    expect(host.mounts).toHaveLength(0);
    expect(document.querySelector('[data-eclipse-test-styles]')).toBeNull();
  });

  it('is safe to call when nothing is active', async () => {
    renderBody('<p>Nothing here.</p>');
    const { session } = newSession();
    const result = await session.deactivate();
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.restored).toBe(false);
  });

  it('refuses to deactivate a session that is not the active one', async () => {
    renderHtml(loadDemo('demo-a.html'));
    const { session } = newSession();
    await session.activate('ses_a');
    const result = await session.deactivate('ses_other');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('SESSION_REPLACED');
  });
});

describe('typed failures', () => {
  it('reports NO_ARTICLE on a page without readable prose', async () => {
    renderBody('<div><p>Too short to be an article.</p></div>');
    const { session } = newSession();
    const result = await session.activate('ses_a');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NO_ARTICLE');
  });

  it('reports NO_ELIGIBLE_TRAPS on a long article the catalog cannot match', async () => {
    const filler =
      'Nothing in this paragraph corresponds to any curated French concept whatsoever. '.repeat(6);
    renderBody(
      `<article><p>${filler}</p><p>${filler}</p><p>${filler}</p><p>${filler}</p></article>`,
    );
    const { session } = newSession();
    const result = await session.activate('ses_a');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NO_ELIGIBLE_TRAPS');
    expect(findOwnedNodes(document)).toHaveLength(0);
  });

  it('propagates PROFILE_INCOMPATIBLE without touching the page', async () => {
    renderHtml(loadDemo('demo-a.html'));
    const before = snapshotArticle();
    const area = memoryArea({ 'eclipse:profile:v1': { schemaVersion: 99 } });
    const { session } = newSession(area);

    const result = await session.activate('ses_a');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('PROFILE_INCOMPATIBLE');
    expect(snapshotArticle()).toBe(before);
    expect(findOwnedNodes(document)).toHaveLength(0);
  });
});

describe('host-page invalidation', () => {
  it('reports DOM_INVALIDATED and restores when a token is reparented', async () => {
    renderHtml(loadDemo('demo-a.html'));
    const { session, host } = newSession();
    await session.activate('ses_a');
    expect(tokens().length).toBeGreaterThan(0);

    // The host page rewrites a branch Eclipse owned.
    const token = tokens()[0]!;
    token.closest('p')!.remove();
    await flush();

    expect(host.invalidations).toBe(1);
    expect(session.isActive).toBe(false);
    // Eclipse stopped mutating rather than trying to rebuild the page.
    expect(findOwnedNodes(document)).toHaveLength(0);
  });

  it('does not fire on Eclipse own mutations', async () => {
    renderHtml(loadDemo('demo-a.html'));
    const { session, host } = newSession();
    await session.activate('ses_a');
    await flush();
    expect(host.invalidations).toBe(0);

    await session.deactivate('ses_a');
    await flush();
    expect(host.invalidations).toBe(0);
  });
});

describe('placement planning is pure', () => {
  it('produces the same plan for the same profile', async () => {
    renderHtml(loadDemo('demo-a.html'));
    const root = findArticleRoot(document)!;
    const blocks = collectEligibleBlocks(root);
    const context = { globalAbility: 0, mastery: {}, now: NOW };

    const first = planPlacements(blocks, context).map((p) => p.trap.conceptId);
    const second = planPlacements(blocks, context).map((p) => p.trap.conceptId);
    expect(first).toEqual(second);
    expect(first.length).toBeGreaterThanOrEqual(2);

    // Planning does not touch the DOM.
    expect(findOwnedNodes(document)).toHaveLength(0);
  });

  it('caps at four traps even when more match', async () => {
    renderHtml(loadDemo('demo-a.html'));
    const root = findArticleRoot(document)!;
    const blocks = collectEligibleBlocks(root);
    const plan = planPlacements(blocks, { globalAbility: 0, mastery: {}, now: NOW });
    expect(plan.length).toBeLessThanOrEqual(4);
  });

  it('respects the 3% density ceiling', async () => {
    renderHtml(loadDemo('demo-a.html'));
    const root = findArticleRoot(document)!;
    const blocks = collectEligibleBlocks(root);
    const words = blocks.reduce(
      (sum, block) =>
        sum +
        block.nodes.reduce(
          (inner, node) => inner + node.node.data.trim().split(/\s+/).filter(Boolean).length,
          0,
        ),
      0,
    );
    const plan = planPlacements(blocks, { globalAbility: 0, mastery: {}, now: NOW });
    expect(plan.length).toBeLessThanOrEqual(Math.floor(words * 0.03));
  });
});

describe('profile is untouched by activation alone', () => {
  it('does not write anything until an answer is given', async () => {
    renderHtml(loadDemo('demo-a.html'));
    const area = memoryArea();
    await saveProfile(area, { ...createEmptyProfile(), calibrationCompleted: true });
    const before = JSON.stringify((await loadProfile(area)).ok);

    const { session } = newSession(area);
    await session.activate('ses_a');
    await session.deactivate('ses_a');

    const after = await loadProfile(area);
    expect(after.ok).toBe(true);
    if (after.ok) {
      expect(after.data.profile.mastery).toEqual({});
      expect(after.data.profile.recentOutcomes).toEqual([]);
    }
    expect(before).toBe('true');
  });
});
