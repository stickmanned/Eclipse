# Eclipse Design System Tokens

## Design Thesis

Eclipse is a compact lunar reading instrument, not a generic dark dashboard. One eclipse/orbit motif carries the identity; cards, glows, and motion remain restrained so French vocabulary stays primary.

## Color

| Token          | Value                    | Role                                    |
| -------------- | ------------------------ | --------------------------------------- |
| Cosmic Void    | `#070A14`                | Primary background                      |
| Orbit Indigo   | `#11182C`                | Raised dark surface                     |
| Orbit Deep     | `#0C1122`                | Recessed surface                        |
| Glass          | `rgba(18, 24, 43, 0.78)` | Popup glass surface                     |
| Celestial Gold | `#F7C948`                | Primary action and learning highlight   |
| Starlight Gold | `#F9D76E`                | Hover and high-emphasis gold            |
| Nebula Violet  | `#8B5CF6`                | Context and phrase accent               |
| Aurora Teal    | `#2DD4BF`                | Correct and ready state                 |
| Ruby Rose      | `#FB7185`                | Incorrect, error, and destructive state |
| Text Primary   | `#F8FAFC`                | Headings and primary copy               |
| Text Secondary | `#CBD5E1`                | Body copy                               |
| Text Muted     | `#94A3B8`                | Supporting copy                         |
| Text Faint     | `#64748B`                | Utility metadata                        |

All translucent borders, shadows, and state washes are derived from these colors. Components do not introduce independent palette values.

## Typography

- Display and French vocabulary: `'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif`
- Controls and body: `'Avenir Next', Avenir, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- Metrics, keycaps, and utility labels: `'SFMono-Regular', Consolas, 'Liberation Mono', monospace`
- No network-loaded fonts. The extension remains CSP-safe and visually complete offline.

## Geometry

- Popup boundary: `340px × 600px`
- Spacing scale: `4, 8, 12, 16, 20, 24px`
- Radius scale: `8, 12, 18px`, plus `999px` pills
- Control minimum: `40px`; primary actions: `44px`
- Overlay maximum width: `520px`; viewport padding: `24px`

## Motion

- Standard transition: `160ms cubic-bezier(0.2, 0.8, 0.2, 1)`
- Overlay reveal: `220ms`
- Signature motion: eclipse terminator/orbit reveal only
- `prefers-reduced-motion` reduces all animation and transition durations to effectively zero

## Component Inventory

1. Instrument Header — live mastery moon and local AI beacon.
2. Accessible Tab Rail — Session, Vocab, Stats, Settings with APG keyboard behavior.
3. Session Hero — eclipse orbit, article state, and single start/stop action.
4. Vocabulary Deck — search, moon-phase filters, grouped contextual items, due states.
5. Stats & Moon — orbit accuracy gauge, counts, phase distribution, recalibration.
6. Settings & AI — provider health, contract version, privacy, destructive reset.
7. Diagnostic — lunar progress rail, French passage, keycap choices, skill breakdown.
8. Injected Token — opaque indigo capsule with gold translation seam.
9. Challenge Modal — command header, contextual sentence, `1`–`3` shortcuts.
10. Truth Card — verdict band, translation pair, clue, why/why-not, mastery phase.

## Accessibility Invariants

- Normal text contrast targets WCAG AA (`4.5:1`); controls and large text target `3:1`.
- State never depends on color alone.
- Tabs expose `tablist`, `tab`, `tabpanel`, `aria-selected`, and arrow-key navigation.
- Overlay traps focus, closes with Escape, answers with `1`–`3`, and restores token focus.
- Forced-colors and reduced-motion modes retain complete meaning and operation.
