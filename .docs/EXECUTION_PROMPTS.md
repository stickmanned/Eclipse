# Execution Prompts — Eclipse UI & UX Refinement

## Global execution rules (apply to every goal)
- Use atomic commits, no attribution, and reviewable changes.
- Run `npm run check && npx playwright test` at each step.
- Preserve 100% of underlying business logic and message validation contracts.

### M1 — Theme & CSS Tokens
```text
/goal Upgrade design system tokens in src/content/ui/theme.ts and src/entrypoints/popup/popup.css with glassmorphism backdrop blurs, ambient radial glows, and smooth cubic-bezier transitions.
```

### M2 — Popup UI Polish
```text
/goal Polish Popup UI in src/entrypoints/popup/App.tsx with enhanced DELF selection cards, diagnostic breakdown hero layout, stat counter badges, and smooth action button states.
```

### M3 — In-Page Overlay & Truth Card
```text
/goal Elevate In-Page Challenge Overlay in src/content/ui/ChallengeOverlay.tsx with smooth modal entrance animation, keyboard shortcut badges (1, 2, 3), and glowing truth cards.
```

### M4 — Full E2E Verification
```text
/goal Verify all 325 unit/DOM tests and 41 Playwright E2E tests pass cleanly with wxt build production output.
```
