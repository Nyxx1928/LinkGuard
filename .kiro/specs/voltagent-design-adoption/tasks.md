# Implementation Plan: Voltagent Design Adoption

## Overview

The migration is organized into **5 phases** following a token-first, component-second, page-third approach. Each phase is independently verifiable and has explicit checkpoints. The total migration touches approximately 15+ files across `src/styles/`, `src/ui/`, `src/components/layout/`, `src/components/ui/`, `src/pages/`, and `src/App.js`.

**Key principle**: No behavioral/functional logic changes — only CSS values, Tailwind classes, and inline styles are modified. Navbar layout and animations are explicitly preserved.

## Tasks

### Phase 1: Design Tokens & Configuration

*Goal: Establish the Voltagent token system as the single source of truth before any component is updated.*

- [ ] **1. Update `src/styles/design-tokens.css`**
  - Replace brand colors (cyan scale) with Voltagent palette: `--color-primary`, `--color-primary-soft`, `--color-primary-deep`, `--color-on-primary`, `--color-canvas`, `--color-canvas-soft`, `--color-hairline`, `--color-hairline-soft`, `--color-ink`, `--color-ink-strong`, `--color-body`, `--color-mute`, `--color-canvas-text-soft`
  - Replace spacing system with Voltagent 11-token scale (2px–64px)
  - Replace radius tokens with Voltagent 5-token scale (0px, 4px, 6px, 8px, 9999px)
  - Remove all `--shadow-*` and `--shadow-glow-*` tokens
  - **Preserve** all `--color-risk-*` and `--color-semantic-*` tokens exactly as-is
  - Add new font-sans variable (Inter only) and font-mono variable (SF Mono substitute)
  - _Requirements: 1.1, 1.5_

- [ ] **2. Update `tailwind.config.js`**
  - Add `canvas`, `canvas-soft`, `hairline`, `hairline-soft`, `ink`, `ink-strong`, `body`, `mute`, `canvas-text-soft` to `theme.extend.colors`
  - Replace `primary` DEFAULT with `#00d992`; add `primary-soft` and `primary-deep`; add `on-primary`
  - Remove `brand-50..950` cyan scale from colors
  - Remove `backdropBlur` glass entries
  - Remove `boxShadow` glow-* and glass-* entries
  - Add Voltagent `fontSize` tokens (`display-xl` through `button-md`)
  - Update `fontFamily.sans` to Inter-only; update `fontFamily.mono` to SF Mono substitute
  - Remove custom spacing duplicates (e.g., `18`, `88`, `128`) that conflict or are unused
  - _Requirements: 1.2, 1.3, 2.2, 2.3_

- [ ] **3. Update shadcn CSS variables in `src/index.css`**
  - **Remove** `:root` (light mode) block entirely
  - Update `.dark` block HSL values to match Voltagent colors (see Design doc)
  - Remove any `.light` selectors if present
  - Update base `h1`–`h6` styles to use new Voltagent typography scale
  - Update Google Fonts import: remove Space Grotesk, remove JetBrains Mono, keep Inter
  - _Requirements: 1.3, 1.4, 2.1, 2.4_

- [ ] **4. Checkpoint — Token Layer Complete**
  - Run `npm start` and verify no CSS compilation errors
  - Verify new Voltagent tokens are accessible in browser DevTools (e.g., `--color-canvas`, `--color-primary`)
  - Verify `.dark` is the only active theme block
  - _Requirements: 1.1, 1.2, 1.3_

### Phase 2: Core UI Primitives

*Goal: Update all 5 shared UI primitives in `src/ui/` to Voltagent specs.*

- [ ] **5. Re-style `src/ui/Button.jsx`**
  - Replace variant map: remove `{ default, ghost, destructive }`, add `{ primary, outline, ghost, pill }`
  - Apply Voltagent color/border/radius/typography classes per variant
  - Remove focus ring references to sky-300/slate-200; use `ring-primary`
  - _Requirements: 3.1_

- [ ] **6. Re-style `src/ui/Card.jsx`**
  - Replace `bg-white shadow-sm rounded-md p-4` with `bg-canvas text-ink border border-hairline rounded-md p-2xl`
  - Add optional `emphasized` variant with `border-2 border-primary`
  - _Requirements: 3.2, 6.4_

- [ ] **7. Re-style `src/ui/Input.jsx`**
  - Replace classes: `bg-white border-slate-200` → `bg-canvas-soft border-hairline`, update focus ring
  - _Requirements: 3.3_

- [ ] **8. Re-style `src/ui/Alert.jsx`**
  - Update info/error/success/warning background/text colors for Voltagent dark canvas
  - Use Voltagent-compatible tones (e.g., `bg-red-900/50` → `bg-red-950`, etc.)
  - _Requirements: 3.4_

- [ ] **9. Re-style `src/ui/Toast.jsx`**
  - Replace `bg-slate-900 text-white shadow-lg` with `bg-canvas text-ink border border-hairline rounded-md`
  - _Requirements: 3.5_

- [ ] **10. Create `src/ui/CodeMockup.jsx`**
  - New component with `code-mockup` spec: `bg-canvas border border-hairline rounded-md p-xl font-code text-ink`
  - Include a copy-to-clipboard button (`CopyButton` component already exists in `src/components/`)
  - Export from `src/ui/index.js`
  - _Requirements: 6.1_

- [ ] **11. Create `src/ui/CodeInlineChip.jsx`**
  - New component with `code-inline-chip` spec: `bg-canvas-soft text-canvas-text-soft rounded-xs px-sm py-xxs font-code`
  - Export from `src/ui/index.js`
  - _Requirements: 6.2_

- [ ] **12. Checkpoint — UI Primitives Complete**
  - Visually inspect Button (4 variants), Card (default + emphasized), Input, Alert, Toast, CodeMockup, CodeInlineChip
  - Verify all use `bg-canvas` or `bg-canvas-soft`, no white backgrounds, no shadows
  - Verify typography matches Voltagent spec
  - _Requirements: 3.1–3.5, 6.1–6.4_

### Phase 3: Layout & Navigation

*Goal: Update PageContainer, App.js root, CardNav, and MobileNav — preserving all layout and animation.*

- [ ] **13. Update `src/components/layout/PageContainer.jsx`**
  - Replace gradient background class with `bg-canvas`
  - Remove `dark` class wrapper (Voltagent is always dark)
  - Keep `max-w-7xl`, padding, and `main` element structure unchanged
  - _Requirements: 4.1_

- [ ] **14. Update `src/App.js` root container**
  - Replace `bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50` with `bg-canvas text-ink`
  - Re-style session warning banner with Voltagent colors
  - _Requirements: 4.2, 4.3_

- [ ] **15. Update `src/components/ui/CardNav.js` — colors & fonts only**
  - Change default props: `baseColor="#101010"`, `menuColor="#f2f2f2"`, `buttonBgColor="#00d992"`, `buttonTextColor="#101010"`
  - Update nav background/text/border colors in the JSX to use Voltagent tokens
  - **DO NOT modify** GSAP animation logic, expand/collapse, hamburger, resize handlers, card structure, or any interaction code
  - Update inline link item styles to use Voltagent `body-sm` typography
  - Only functional change: update `onCtaClick` colors to use button-primary styling
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] **16. Update `MobileNav` component — colors & fonts only**
  - Replace background/text/border colors with Voltagent tokens
  - Preserve all layout, animation, and interaction code
  - _Requirements: 5.5_

- [ ] **17. Checkpoint — Layout & Navigation Complete**
  - Verify PageContainer renders solid `#101010` background
  - Verify App.js root has no gradient
  - Verify CardNav opens/closes/animate identically to before (only colors changed)
  - Verify MobileNav works correctly on mobile viewport
  - _Requirements: 4.1–4.3, 5.1–5.5_

### Phase 4: Elevation System & Glassmorphism Replacement

*Goal: Replace `glassmorphism.css` with `volt-elevation.css` and remove all shadow/glass/gradient classes from the codebase.*

- [ ] **18. Create `src/styles/volt-elevation.css`**
  - Copy over from `glassmorphism.css`: reduced motion support, skeleton loading states, map popup styling
  - Remove: `.glass-card`, `.glass-elevated`, `.glass-subtle`, `.glass-brand`, `.glass-nav`, all `.glow-*` classes, all `.gradient-*` classes
  - Add: `.card-hover-glow`, `.hairline`, `.hairline-dashed`, `.green-divider`, `.modal-shadow`
  - Update map popup styling with Voltagent colors
  - Delete or empty `glassmorphism.css`
  - Update import in `index.css` from `glassmorphism.css` to `volt-elevation.css`
  - _Requirements: 7.2, 7.3_

- [ ] **19. Global search and replace — all pages**
  - Grep for all `shadow-*`, `shadow-[*]`, `backdrop-blur`, `backdrop-blur-*`, `bg-gradient-*`, `glass-*` classes across all files in `src/pages/`, `src/components/`, `src/App.js`, `src/ui/`
  - Replace with Voltagent equivalents per the Migration Class Mapping table in the Design doc
  - Key replacements:
    - `bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900` → `bg-canvas`
    - `bg-gradient-to-br from-gray-900/70 via-gray-900/60 to-gray-800/60` → `bg-canvas`
    - `bg-gray-900/70`, `bg-gray-900/60`, `bg-gray-950/50`, `bg-white/5`, `bg-white/10`, `bg-white/[0.03]` → `bg-canvas` or `bg-canvas-soft`
    - `border border-white/10`, `border border-white/5` → `border border-hairline`
    - All `shadow-*` classes → remove
    - All `backdrop-blur` → remove
    - `rounded-2xl` (16px), `rounded-3xl` (24px) → `rounded-md` (8px)
    - `rounded-xl` → `rounded-md` for cards, `rounded-sm` for inputs/buttons
  - _Requirements: 4.4, 4.5, 4.6, 7.1, 7.4_

- [ ] **20. Search and replace — typography-specific**
  - Grep for all `font-["Space Grotesk"...]` and `style={{ fontFamily: '"Space Grotesk"' }}` in all pages — remove
  - Grep for all `text-transparent bg-clip-text bg-gradient-to-r` (gradient text) — remove, replace with `text-primary` or `text-ink-strong`
  - Grep for all `text-cyan-*`, `bg-cyan-*`, `ring-cyan-*`, `border-cyan-*`, `hover:border-cyan-*`, `hover:bg-cyan-*`, `focus:ring-cyan-*` — replace with `primary` equivalents
  - Grep for all `text-sky-*`, `bg-sky-*` — replace with `primary` equivalents
  - _Requirements: 2.5, 4.4, 7.4_

- [ ] **21. Update Risk/semantic-colored badges and indicators**
  - Verify risk pills (`px-3 py-1 rounded-full border border-white/10 bg-white/5`) use Voltagent pill-tag spec
  - Update inline tag/chip styling across all pages
  - _Requirements: 6.3_

- [ ] **22. Checkpoint — Elevation & Typography Complete**
  - Run full grep for leftover `shadow-`, `backdrop-blur`, `glass-`, `bg-gradient-`, `Space Grotesk`, `text-cyan-` patterns — verify zero matches
  - Visually inspect each page for residual shadows, gradients, or glass effects
  - Verify hover glow works on interactive cards
  - _Requirements: 7.1–7.4, 2.5_

### Phase 5: Final Validation & Cleanup

*Goal: Verify complete migration, update tests, and ensure no regressions.*

- [ ] **23. Visual QA — every page**
  - Inspect: Landing, Login, Register, Home, Analyze, History, About, ComponentShowcase, PublicLookup
  - Verify: all cards have hairline borders, solid dark backgrounds, no shadows/glass/gradients
  - Verify: all buttons use correct Voltagent variant styling
  - Verify: all inputs use `bg-canvas-soft` with hairline borders
  - Verify: typography is Inter (no Space Grotesk)
  - Verify: primary accent is `#00d992` electric green (no cyan/blue)
  - Verify: risk colors (green/yellow/red) are preserved in charts and indicators
  - _Requirements: All_

- [ ] **24. Update snapshot tests**
  - Run `npm test -- -u` to update all Jest snapshot tests
  - Verify all tests pass after snapshot update
  - _Requirements: N/A (test maintenance)_

- [ ] **25. Final cleanup**
  - Remove any unused imports in pages (e.g., if Space Grotesk font import was removed)
  - Remove `App.css` default CRA styles if they no longer apply
  - Verify `index.css` imports only: Tailwind directives, `design-tokens.css`, and `volt-elevation.css`
  - _Requirements: N/A (cleanup)_

- [ ] **26. Final Checkpoint — Migration Complete**
  - `npm start` runs without warnings
  - `npm test` passes all tests
  - Full visual inspection passes
  - _Requirements: All_

## Notes

- **Phases are sequential**: Phase 1 must be completed before Phase 2, etc. This prevents intermediate states where some components use old tokens and others use new tokens.
- **CardNav preservation**: Every task touching CardNav explicitly states that only colors and fonts change — all layout, animation, and interaction code is preserved.
- **Risk colors are preserved**: The semantic safe/caution/danger palette (`#10b981`, `#f59e0b`, `#ef4444`) remains unchanged throughout.
- **No new behavioral tests**: Since this is a visual-only migration, no new functional tests are required. Snapshot updates handle test maintenance.
- **All tasks are required**: No optional tasks — every item is necessary for migration completeness.
