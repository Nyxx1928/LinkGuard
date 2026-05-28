# Design System Notes

## Tokens
- Brand: brand-50 through brand-950 with cyan-forward accents.
- Risk: safe/caution/danger semantic colors.
- Neutral: neutral-50 through neutral-950 for backgrounds.

## Typography
- Sans: Inter for UI text.
- Mono: JetBrains Mono for technical values.
- Scale: xs through 6xl with line-height tuned in Tailwind.

## Spacing
- Core: spacing-4 through spacing-16 for section separation.
- Cards: padding-md for standard content, padding-lg for key panels.

## Glassmorphism
- Use `glass-card`, `glass-elevated`, or `glass-subtle` for panels.
- Prefer soft borders (white/10) and avoid low contrast text on glass.
- For popups, use `maplibregl-popup-content` styles from glassmorphism.css.

## Responsive Rules
- Base: mobile-first layout with stacked sections.
- sm: split into two columns where appropriate.
- lg: allow three-column metric grids and wide charts.
