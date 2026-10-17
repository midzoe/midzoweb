# Midzowe Tourism — Luxury/Elegant Design System

## Color Palette

### Primary Colors (Neutral Luxury Base)
- **Slate-900**: `#0F172A` - Deep navy backgrounds, primary text
- **Slate-50**: `#F8FAFC` - Light backgrounds, cards
- **Stone-100**: `#F5F3F0` - Warm cream backgrounds

### Accent Colors (Premium)
- **Gold**: `#D4AF37` - Primary accent, luxury touch
- **Teal**: `#0D9488` - Secondary accent, nature/wellness
- **Amber**: `#B45309` - Warm secondary, events
- **Slate-600**: `#475569` - Muted text, secondary content

### Status Colors
- **Success**: `#10B981` (emerald-600)
- **Warning**: `#F59E0B` (amber-500)
- **Error**: `#EF4444` (red-500)

---

## Typography

### Font Stack
- **Headings**: Inter, system-ui, sans-serif
  - h1: 48px, weight 700, letter-spacing -1px
  - h2: 36px, weight 700
  - h3: 24px, weight 600
- **Body**: Inter, system-ui, sans-serif
  - Regular: 16px, weight 400, line-height 1.6
  - Small: 14px, weight 500
  - Caption: 12px, weight 500, color slate-600

### Text Hierarchy
- Primary text: slate-900
- Secondary text: slate-600 (min 4.5:1 contrast)
- Muted text: slate-500 (min 3:1 contrast on light bg)
- Light backgrounds require slate-900 for body text

---

## Component Styles

### Card Patterns
```
Base: bg-white rounded-lg shadow-sm border border-slate-100/50
Hover: shadow-md (not scale, no layout shift)
Interior padding: p-6 or p-8
Subtle border: border-slate-200 (not white/10 in light mode)
```

### Icons
- **Icon Set**: Heroicons or Lucide (24x24 viewBox)
- **No Emojis** in UI — replace with SVG equivalents
- **Icon Colors**: slate-600 (primary), gold-500 (accent)
- **Sizing**: w-6 h-6 (24px standard)

### Buttons
```
Primary: bg-gold-500 text-slate-900 hover:bg-gold-600
Secondary: bg-slate-900 text-white hover:bg-slate-800
Tertiary: border border-slate-300 text-slate-900 hover:bg-slate-50
Disabled: bg-slate-200 text-slate-500 cursor-not-allowed
Padding: px-6 py-3
Rounded: rounded-lg
Transitions: transition-colors duration-200
```

### Images
- Use high-quality travel/lifestyle photography
- Apply subtle gradient overlay: `from-black/0 via-black/10 to-black/30`
- Lazy loading: `loading="lazy"`
- Responsive sizes: `srcset` with 800w, 1200w variants
- Use WebP with JPEG fallback

### Navigation
- Navbar: bg-white border-b border-slate-100 shadow-sm
- Floating navbar: top-4 left-4 right-4 backdrop-blur-md bg-white/80
- Z-index: 40 (floating), 30 (sticky)
- Never hide content behind fixed elements

### Forms & Inputs
- Border: border-slate-200
- Focus: ring-2 ring-gold-500/50 border-gold-500
- Placeholder: text-slate-400
- Label: font-semibold text-slate-700

---

## Animation & Transitions

### Micro-interactions
- Duration: 150-300ms (prefer 200ms)
- Easing: cubic-bezier(0.4, 0, 0.2, 1) [ease-in-out]
- Prefer: opacity, transform (translate, scale)
- Avoid: width, height changes (causes layout shift)

### Examples
```
Hover: opacity & shadow → transition-all duration-200
Link: opacity & translate-x → group-hover:translate-x-1
Button: bg color → transition-colors duration-200
Scroll: fade-in with opacity → transition-opacity duration-500
```

### Loading States
- Use skeleton screens (light gray pulse)
- Prefer spinners for < 2s, skeleton for 2-5s
- Respect `prefers-reduced-motion`

---

## Spacing Scale

| Token | Value | Use Case |
|-------|-------|----------|
| xs | 4px | Small gaps, icon spacing |
| sm | 8px | Form elements, list items |
| md | 16px | Section padding |
| lg | 24px | Component spacing |
| xl | 32px | Section padding (desktop) |
| 2xl | 48px | Major sections |

---

## Layout Rules

### Container Max-widths
- Mobile: full width - 2rem padding
- Tablet: max-w-4xl (56rem) centered
- Desktop: max-w-7xl (80rem) centered
- Ultra-wide: max-w-7xl capped

### Responsive Breakpoints (Tailwind)
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px

### Grid Guidelines
- Desktop: 2-3 columns
- Tablet: 2 columns
- Mobile: 1 column full width

---

## Dark Mode (Future)

When implementing:
- Text: Use lighter slate colors (slate-100, slate-200)
- Backgrounds: slate-900, slate-800, slate-950
- Cards: slate-800 with border-slate-700
- Gold accents: Increase brightness slightly (#E5C158)
- Ensure 4.5:1 contrast ratio always

---

## Accessibility Checklist

- ✓ Color contrast: 4.5:1 minimum for normal text
- ✓ Focus rings: Visible `focus:ring-2 ring-gold-500`
- ✓ Alt text: All images have descriptive alt
- ✓ ARIA labels: Icon buttons have aria-label
- ✓ Keyboard nav: Tab order matches visual order
- ✓ Form labels: Associated with inputs via for/id
- ✓ Motion: Respect `prefers-reduced-motion` media query
- ✓ Touch targets: 44x44px minimum (buttons, links)

---

## Anti-Patterns to Avoid

❌ **No Emojis as Icons** — Use SVG instead (🎊 → event icon)
❌ **No White/10 Borders** in light mode — Use slate-200 minimum
❌ **No Unvisited Link Colors** — Keep text blue consistent
❌ **No Layout Shift on Hover** — Use opacity/transform only
❌ **No Animations > 500ms** — Keep interaction snappy
❌ **No Content Behind Fixed Headers** — Account for navbar height
❌ **No Generic Color Names** — Use semantic tokens (primary, secondary)

---

## Implementation Priority

1. **HIGH** - Color palette + remove emojis → svg icons
2. **HIGH** - Typography hierarchy (font sizes, weights)
3. **HIGH** - Card & button refinement
4. **MEDIUM** - Spacing & layout improvements
5. **MEDIUM** - Animation smoothness
6. **LOW** - Dark mode preparation (future phase)
