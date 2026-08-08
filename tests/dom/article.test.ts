import { describe, expect, it } from 'vitest';
import {
  MIN_ELIGIBLE_BLOCKS,
  MIN_READABLE_CHARACTERS,
  collectEligibleBlocks,
  countEligibleWords,
  findArticleRoot,
  hasExcludedAncestor,
  isArticleEligible,
  resolveRange,
  splitSentences,
} from '@/content/article';
import { loadDemo, renderBody, renderHtml } from './helpers';

const LOREM =
  'The platform fills slowly on a Thursday evening and passengers arrive with more luggage than a commuter would carry. ';

function longProse(times = 6): string {
  return LOREM.repeat(times);
}

describe('article detection order', () => {
  it('prefers a visible <article>', () => {
    renderBody(`
      <main><p>${longProse()}</p></main>
      <article id="target"><p>${longProse()}</p><p>${longProse()}</p><p>${longProse()}</p></article>
    `);
    expect(findArticleRoot(document)?.id).toBe('target');
  });

  it('falls back to <main> when there is no article', () => {
    renderBody(`
      <main id="target"><p>${longProse()}</p><p>${longProse()}</p><p>${longProse()}</p></main>
    `);
    expect(findArticleRoot(document)?.tagName).toBe('MAIN');
  });

  it('falls back to the largest paragraph container', () => {
    renderBody(`
      <div id="chrome"><p>Short.</p></div>
      <div id="target">
        <p>${longProse()}</p><p>${longProse()}</p><p>${longProse()}</p>
      </div>
    `);
    const root = findArticleRoot(document);
    expect(root).not.toBeNull();
    expect(root?.id === 'target' || root?.contains(document.getElementById('target'))).toBe(true);
  });

  it('falls back to generic visible text blocks when semantic article markup is absent', () => {
    renderBody(`
      <div>${longProse(2)}</div>
      <section>${longProse(2)}</section>
      <div>${longProse(2)}</div>
    `);

    const root = findArticleRoot(document);
    expect(root).toBe(document.body);
    expect(isArticleEligible(collectEligibleBlocks(root!))).toBe(true);
  });

  it('returns null when there is not enough readable text', () => {
    renderBody('<article><p>Too short.</p></article>');
    expect(findArticleRoot(document)).toBeNull();
  });

  it('skips a display:none article', () => {
    renderBody(`
      <article style="display:none"><p>${longProse()}</p><p>${longProse()}</p></article>
    `);
    expect(findArticleRoot(document)?.tagName).not.toBe('ARTICLE');
  });
});

describe('article eligibility thresholds', () => {
  it(`needs at least ${MIN_ELIGIBLE_BLOCKS} blocks`, () => {
    renderBody(`<article><p>${longProse()}</p><p>${longProse()}</p></article>`);
    const root = document.querySelector('article')!;
    expect(isArticleEligible(collectEligibleBlocks(root))).toBe(false);
  });

  it(`needs at least ${MIN_READABLE_CHARACTERS} readable characters`, () => {
    renderBody('<article><p>One.</p><p>Two.</p><p>Three.</p></article>');
    const root = document.querySelector('article')!;
    expect(isArticleEligible(collectEligibleBlocks(root))).toBe(false);
  });

  it('accepts a real article', () => {
    renderBody(
      `<article><p>${longProse()}</p><p>${longProse()}</p><p>${longProse()}</p></article>`,
    );
    const root = document.querySelector('article')!;
    expect(isArticleEligible(collectEligibleBlocks(root))).toBe(true);
  });
});

describe('excluded ancestors', () => {
  const cases: Array<[string, string]> = [
    ['script', '<script>const wait = 1;</script>'],
    ['style', '<style>.wait { color: red }</style>'],
    ['code', '<p><code>wait for the bus</code></p>'],
    ['pre', '<pre>wait for the bus</pre>'],
    ['input', '<input value="wait for the bus" />'],
    ['textarea', '<textarea>wait for the bus</textarea>'],
    ['select', '<select><option>wait for the bus</option></select>'],
    ['form', '<form><p>wait for the bus</p></form>'],
    ['anchor', '<p><a href="/x">wait for the bus</a></p>'],
    ['button', '<p><button>wait for the bus</button></p>'],
    ['nav', '<nav><p>wait for the bus</p></nav>'],
    ['header', '<header><p>wait for the bus</p></header>'],
    ['footer', '<footer><p>wait for the bus</p></footer>'],
    ['aside', '<aside><p>wait for the bus</p></aside>'],
    ['contenteditable', '<div contenteditable="true"><p>wait for the bus</p></div>'],
    ['aria-hidden', '<p aria-hidden="true">wait for the bus</p>'],
  ];

  for (const [name, markup] of cases) {
    it(`never offers text under ${name} for replacement`, () => {
      renderBody(
        `<article>${markup}<p>${longProse()}</p><p>${longProse()}</p><p>${longProse()}</p></article>`,
      );
      const root = document.querySelector('article')!;
      const blocks = collectEligibleBlocks(root);

      const replaceable = blocks.flatMap((block) => block.nodes.map((node) => node.node.data));
      expect(replaceable.join(' ')).not.toContain('wait for the bus');
    });
  }

  it('reports excluded ancestors directly', () => {
    renderBody('<article><p id="p"><a href="/x" id="link">text</a></p></article>');
    const root = document.querySelector('article')!;
    const link = document.getElementById('link')!;
    const paragraph = document.getElementById('p')!;
    expect(hasExcludedAncestor(link.firstChild!, root)).toBe(true);
    expect(hasExcludedAncestor(paragraph, root)).toBe(false);
  });

  it('keeps link text in the block sentence while refusing to replace it', () => {
    renderBody(
      `<article><p id="p">Readers who <a href="/x">book through the site</a> report savings.</p>
       <p>${longProse()}</p><p>${longProse()}</p></article>`,
    );
    const root = document.querySelector('article')!;
    const block = collectEligibleBlocks(root).find((b) => b.element.id === 'p');
    expect(block).toBeDefined();
    // The sentence the reader sees is complete...
    expect(block!.text).toContain('book through the site');
    // ...but the link's own text node is not offered for replacement.
    expect(block!.nodes.map((n) => n.node.data).join('')).not.toContain('book through the site');
  });
});

describe('scanning limits', () => {
  it('keeps scanning after Wikipedia-style inline links and citations', () => {
    const inlineNoise = Array.from(
      { length: 550 },
      (_, i) => `<a href="/wiki/${i}">linked term ${i}</a><sup>[${i}]</sup> `,
    ).join('');
    renderBody(`<main><p>${inlineNoise}</p><p id="late-1">${longProse()}</p><p id="late-2">${longProse()}</p><p id="late-3">${longProse()}</p></main>`);
    const root = document.querySelector('main')!;
    const blocks = collectEligibleBlocks(root);

    expect(blocks.some((block) => block.element.id === 'late-3')).toBe(true);
  });

  it('retains a defensive text-node cap on pathological pages', () => {
    const many = Array.from(
      { length: 6_000 },
      (_, i) => `<p>Paragraph number ${i} of prose.</p>`,
    ).join('');
    renderBody(`<article>${many}</article>`);
    const root = document.querySelector('article')!;
    const blocks = collectEligibleBlocks(root);
    expect(blocks.length).toBeLessThanOrEqual(5_000);
  });
});

describe('sentence splitting', () => {
  it('splits on terminal punctuation', () => {
    const sentences = splitSentences('One thing. Two things! Three things?', 'block:0');
    expect(sentences.map((s) => s.text)).toEqual(['One thing.', 'Two things!', 'Three things?']);
  });

  it('does not split common abbreviations', () => {
    const sentences = splitSentences('Dr. Meyer arrived. She was late.', 'block:0');
    expect(sentences.map((s) => s.text)).toEqual(['Dr. Meyer arrived.', 'She was late.']);
  });

  it('returns offsets that slice back to the sentence', () => {
    const text = '  One thing.  Two things.  ';
    for (const sentence of splitSentences(text, 'block:0')) {
      expect(text.slice(sentence.start, sentence.end)).toBe(sentence.text);
    }
  });

  it('gives each sentence a unique key within its block', () => {
    const keys = splitSentences('A. B. C.', 'block:3').map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys[0]).toBe('block:3#0');
  });
});

describe('range resolution', () => {
  it('maps a block offset onto a single text node', () => {
    renderBody('<article><p id="p">We had to wait for the bus.</p></article>');
    const root = document.querySelector('article')!;
    const block = collectEligibleBlocks(root)[0]!;
    const start = block.text.indexOf('wait');
    const resolved = resolveRange(block, start, start + 4);
    expect(resolved).not.toBeNull();
    expect(resolved!.node.data.slice(resolved!.start, resolved!.end)).toBe('wait');
  });

  it('refuses a range that crosses an inline element', () => {
    renderBody('<article><p id="p">We had to <em>wait for</em> the bus.</p></article>');
    const root = document.querySelector('article')!;
    const block = collectEligibleBlocks(root)[0]!;
    const start = block.text.indexOf('to wait');
    expect(resolveRange(block, start, start + 10)).toBeNull();
  });
});

describe('word counting', () => {
  it('counts only replaceable words', () => {
    renderBody('<article><p>one two three <a href="/x">four five</a> six</p></article>');
    const root = document.querySelector('article')!;
    const blocks = collectEligibleBlocks(root);
    expect(countEligibleWords(blocks)).toBe(4);
  });
});

describe('the demo pages', () => {
  it('Demo A resolves to its <article>', () => {
    renderHtml(loadDemo('demo-a.html'));
    const root = findArticleRoot(document);
    expect(root?.tagName).toBe('ARTICLE');
    expect(isArticleEligible(collectEligibleBlocks(root!))).toBe(true);
  });

  it('Demo B resolves to its <main>, exercising the second detection branch', () => {
    renderHtml(loadDemo('demo-b.html'));
    const root = findArticleRoot(document);
    expect(root?.tagName).toBe('MAIN');
    expect(isArticleEligible(collectEligibleBlocks(root!))).toBe(true);
  });
});
