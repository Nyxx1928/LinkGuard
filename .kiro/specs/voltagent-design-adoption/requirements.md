# Requirements Document: Voltagent Design Adoption

## Introduction

This document specifies requirements for adopting the Voltagent design language — a developer-focused, dark-only aesthetic — into the LinkGuard frontend application. The adoption replaces the existing glassmorphism + gradient design system with a cleaner, hairline-bordered, near-black canvas design featuring a single electric-green brand accent. The migration covers all shared UI primitives, component variants, design tokens, typography, and page-level surfaces across the application.

## Glossary

- **Voltagent_Design**: The design system outlined in `DESIGN-voltagent.md` — a dark-canvas-only, hairline-bordered, electric-green-accented developer aesthetic
- **Design_Token**: A named CSS custom property or Tailwind config value representing color, spacing, typography, or radius
- **UI_Primitive**: Shared atomic components (Button, Card, Input, Alert, Toast) in `src/ui/` and `src/components/ui/`
- **Page_Surface**: Full-page wrapper (PageContainer) that provides the background canvas and max-width constraints
- **Hairline_Border**: A 1px solid border using the `hairline` color (`#3d3a39`), used in place of shadows and glass effects
- **Canvas**: The near-black background color `#101010` — the only page surface in the system
- **Electric_Green**: The single brand accent color `#00d992`, reserved for CTAs, status indicators, and the brand logo
- **Elevation_Level**: Voltagent's approach to depth — flat (no border), hairline (1px border), inset glow, and modal stack — replacing material shadows
- **Risk_Semantic_Colors**: Existing green/yellow/red risk indicators (safe/caution/danger) that must be preserved during the rebrand

## Requirements

### Requirement 1: Design Token Migration

**User Story:** As a developer, I want all design tokens to be updated to the Voltagent color, spacing, typography, and radius system, so that the UI consistently reflects the new brand.

#### Acceptance Criteria

1. THE `design-tokens.css` file SHALL be updated to replace all existing brand colors (cyan/blue scale) with the Voltagent palette: `primary` (#00d992), `primary-soft` (#2fd6a1), `primary-deep` (#10b981), `canvas` (#101010), `canvas-soft` (#1a1a1a), `hairline` (#3d3a39), `hairline-soft` (#b8b3b0), `ink` (#f2f2f2), `ink-strong` (#ffffff), `body` (#bdbdbd), `mute` (#8b949e), `canvas-text-soft` (#f5f6f7)
2. THE `tailwind.config.js` SHALL be updated to extend the Voltagent color tokens, spacing system (2px–64px scale), border radius tokens (4px/6px/8px/9999px), and font sizes
3. THE existing shadcn CSS variable system in `index.css` (HSL variables for `--background`, `--foreground`, `--primary`, etc.) SHALL be updated to output the Voltagent color values
4. THE `.light` theme class SHALL be removed — the Voltagent system is dark-canvas-only
5. THE `design-tokens.css` SHALL preserve the existing `--color-risk-*`, `--color-semantic-*` token values (safe/caution/danger/warning/error/info) since these are data-driven semantic colors, not brand colors

### Requirement 2: Typography System Overhaul

**User Story:** As a developer, I want the typography system to match the Voltagent specification — Inter for all display/body roles, SF Mono (or substitute) for code, and no Space Grotesk.

#### Acceptance Criteria

1. THE Google Fonts import in `index.css` SHALL be updated to remove Space Grotesk and JetBrains Mono, keeping Inter (weights 300, 400, 500, 600, 700)
2. THE `fontFamily` in `tailwind.config.js` SHALL be updated: `sans` → Inter (400/500/600/700), `mono` → SF Mono (or JetBrains Mono / Geist Mono as substitute)
3. THE `fontSize` scale in `tailwind.config.js` SHALL be extended with the Voltagent-specific tokens: `display-xl` (60px/60px/-0.65px), `display-lg` (36px/40px/-0.9px), `display-md` (24px/32px/-0.6px), `display-sm` (20px/28px), `eyebrow-mono` (14px/20px/2.52px), `eyebrow-uppercase` (18px/28px/0.45px), `body-lg` (18px/28px), `body-md` (16px/26px), `body-sm` (14px/20px), `caption` (12px/16px), `code` (13px/18px), `button-md` (16px/24px)
4. THE base `h1`–`h6` styles in `index.css` SHALL be updated to reference the new typography tokens where appropriate
5. All inline `fontFamily` overrides using `"Space Grotesk", var(--font-sans)` SHALL be removed from all page files

### Requirement 3: UI Primitive Re-Styling

**User Story:** As a developer, I want all shared UI primitives (Button, Card, Input, Alert, Toast) to reflect the Voltagent component specifications.

#### Acceptance Criteria

1. THE `Button` component (`src/ui/Button.jsx`) SHALL be updated to support four Voltagent variants:
   - `button-primary`: background `#00d992`, text `#101010`, 6px radius
   - `button-outline-on-dark`: background `#101010`, text `#f2f2f2`, 1px hairline border, 6px radius
   - `button-ghost-green`: background transparent, text `#2fd6a1`, no border
   - `button-pill-tag`: background `#101010`, text `#f2f2f2`, hairline border, 9999px radius, `body-sm` typography
2. THE `Card` component (`src/ui/Card.jsx`) SHALL be updated to the `card-feature` spec: background `#101010`, text `#f2f2f2`, 1px hairline border (`#3d3a39`), 8px radius, 24px padding. No shadow, no glass effect, no backdrop blur.
3. THE `Input` component (`src/ui/Input.jsx`) SHALL be updated to the `text-input` spec: background `#1a1a1a`, text `#f2f2f2`, 1px hairline border, 6px radius, 12px/16px padding, `body-sm` typography
4. THE `Alert` component (`src/ui/Alert.jsx`) SHALL be updated to use Voltagent-compatible background/text colors for each type (info/error/success/warning) while maintaining readability on the `#101010` canvas
5. THE `Toast` component (`src/ui/Toast.jsx`) SHALL be updated to the `ex-toast` spec: background `#101010`, 8px radius, 12px/16px padding, `body-sm` typography, hairline border

### Requirement 4: Page Surface Migration

**User Story:** As a user, I want every page to render on the Voltagent dark canvas with consistent section bands, so that the experience feels cohesive.

#### Acceptance Criteria

1. THE `PageContainer` component SHALL be updated: background changed from gradient (`from-gray-900 via-gray-800 to-gray-900`) to solid `#101010` (Voltagent canvas). No gradient, no background patterns.
2. THE `App.js` root container SHALL be updated: background changed from `bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50` to solid `#101010`
3. THE session warning banner in `App.js` SHALL be re-styled with Voltagent colors
4. ALL inline gradient backgrounds on cards (e.g., `bg-gradient-to-br from-gray-900/70 via-gray-900/60 to-gray-800/60`) SHALL be replaced with solid `#101010` or `#1a1a1a` surfaces with hairline borders
5. ALL instances of `backdrop-blur` and glassmorphism classes (`glass-card`, `glass-elevated`, `glass-subtle`, `glass-brand`, `glass-nav`) SHALL be replaced with Voltagent hairline-bordered card equivalents
6. ALL inline `shadow-*` utility classes on cards and containers SHALL be removed

### Requirement 5: Navigation Migration

**User Story:** As a user, I want navigation to keep its existing layout and animation but use Voltagent colors and typography.

#### Acceptance Criteria

1. THE `CardNav` component SHALL keep **all existing layout, GSAP animation logic, card-expansion behavior, and interaction patterns** — only `backgroundColor`, `textColor`, `borderColor`, and `fontFamily` values SHALL change
2. THE hamburger menu animation, card stagger timing, `calculateHeight()`, resize handlers, and timeline creation SHALL remain **untouched**
3. THE `baseColor`, `menuColor`, `buttonBgColor`, `buttonTextColor` props will use new defaults: `baseColor="#101010"`, `menuColor="#f2f2f2"`, `buttonBgColor="#00d992"` (primary green), `buttonTextColor="#101010"` (on-primary)
4. The CTA button inside the nav SHALL use Voltagent `button-primary` colors (green fill, dark text)
5. THE `MobileNav` component SHALL similarly keep its layout and animation — only colors and fonts change

### Requirement 6: Component-Specific Patterns

**User Story:** As a developer, I want new Voltagent-specific components added for signature design elements like code mockups and green dividers.

#### Acceptance Criteria

1. A NEW `CodeMockup` component SHALL be created matching the `code-mockup` spec: background `#101010`, text `#f2f2f2`, hairline border, 13px SF Mono, 8px radius, 20px padding, with a copy-to-clipboard affordance
2. A NEW `CodeInlineChip` component SHALL be created matching the `code-inline-chip` spec: background `#1a1a1a`, text `#f5f6f7`, 13px code typography, 4px radius, 2px/8px padding
3. A NEW `Badge` variant (`badge.jsx`) SHALL be added for the `button-pill-tag` pattern (inline status pills with 9999px radius)
4. THE `Card` component SHALL support an `emphasized` variant with a 2px solid `#00d992` green border for featured/active states

### Requirement 7: Elevation & Depth Migration

**User Story:** As a developer, I want the elevation system to shift from material shadows + glassmorphism to Voltagent's hairline-border approach.

#### Acceptance Criteria

1. ALL `shadow-*`, `shadow-[*]`, and `box-shadow` utilities used on cards and surfaces SHALL be removed
2. THE existing `glassmorphism.css` SHALL be replaced or substantially rewritten: remove glass-card, glass-elevated, glass-subtle, glass-brand, glass-nav classes; replace with hairline-border utility classes
3. A NEW hover effect SHALL be added for interactive cards: `0 0 15px rgba(92, 88, 85, 0.2)` subtle outer glow (`Level 2 — Inset Glow` from the Voltagent spec)
4. All `border-white/*` utility borders SHALL be replaced with `border-[#3d3a39]` (or the Voltagent hairline token)

### Requirement 8: Responsive & Adaptive Behavior

**User Story:** As a user, I want the Voltagent design to work correctly at all breakpoints while maintaining the dark-only aesthetic.

#### Acceptance Criteria

1. THE responsive breakpoint behavior from the Voltagent spec SHALL be adopted: mobile (<768px) with 1-up cards, tablet (768–1023px) with 2-up cards, desktop (≥1024px) with full 3-up grids
2. THE hero typography SHALL scale fluidly: hero display 60px → 32px on mobile
3. ALL touch targets SHALL remain at minimum 44px height for WCAG AAA (buttons already meet this)
4. THE nav SHALL collapse to hamburger at mobile with the same green CTA pinned at bottom
5. No light-mode counterpart SHALL be introduced — Voltagent is dark-only

### Requirement 9: Preservation of Data Visualizations

**User Story:** As a user, I want existing data visualization components (RiskChart, GeoMap, MetricCard, ResultCard) to keep their data-driven styling while adopting the Voltagent surface chrome.

#### Acceptance Criteria

1. THE `RiskChart` and `LazyRiskChart` components SHALL keep their chart color semantics (green for safe, yellow for caution, red for danger) but adopt Voltagent card chrome for their containers
2. THE `GeoMap` component SHALL keep maplibre-gl styling but adopt Voltagent popup styling
3. THE `MetricCard` component SHALL be re-styled with Voltagent card chrome (hairline border, canvas background, body-sm typography)
4. THE `ResultCard` component SHALL be re-styled with Voltagent card chrome

## Scope

### In-Scope
- Complete replacement of color tokens (brand palette only — risk/semantic colors preserved)
- Typography migration (Space Grotesk → Inter-only for display, JetBrains Mono → SF Mono substitute)
- All 5 UI primitives in `src/ui/` (Button, Card, Input, Alert, Toast)
- PageContainer and App.js surface backgrounds
- CardNav navigation styling (colors/fonts only — preserve all layout and animation)
- MobileNav navigation styling (colors/fonts only)
- Removal/replacement of glassmorphism.css with hairline-border equivalents
- New components: CodeMockup, CodeInlineChip
- All inline Tailwind classes across pages (Landing, Login, Home, etc.) that use gradients, shadows, backdrop-blur, glass effects
- Elevation system migration (shadows → hairlines)

### Out-of-Scope
- Backend/Laravel code changes — visual only
- Functional/behavioral changes to components — styling only
- New feature pages or content — visual rebrand only
- Logo or favicon redesign — the Voltagent lightning glyph is noted but not specified as a deliverable
- Accessibility improvements beyond what the design change naturally requires
- Unit test refactoring for visual changes (snapshot tests may need updating)
