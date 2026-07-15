# Colors

All tokens defined in `:root` in `src/styles/global.css`.

## Light Mode (default)

```css
--ink:         #1a1a1a   /* primary text */
--ink-soft:    #4a4a4a   /* secondary text */
--ink-muted:   #888888   /* tertiary / placeholder text */
--accent:      #95826b   /* brand gold — used for eyebrows, links, highlights */
--accent-warm: #c9b896   /* lighter gold — hover states, decorative */
--paper:       #faf7f2   /* warm off-white — section backgrounds */
--white:       #ffffff   /* pure white — page background default */
--border:      rgba(0,0,0,0.08)   /* subtle dividers */
--border-warm: #e8e4de             /* warm dividers */
--light-bg:    #f7f5f2             /* alternate light section background */
```

## Dark Mode / Dark Sections

```css
--dark-bg:      #0d0d0d                  /* near-black page background */
--dark-surface: #141414                  /* raised surface on dark bg */
--dark-raised:  #1a1a1a                  /* further raised element */
--dark-border:  rgba(255,255,255,0.08)   /* subtle border on dark bg */
```

Dark sections are triggered by the `page-dark` body class (set via `theme="dark"` on `<Layout>`), or by scoping styles under `.page-dark` or `.ba-dark-section` in global.css.

## Brand Accent

`--accent` (`#95826b`) is the single brand color. It appears on:
- Eyebrow labels (`.ba-eyebrow`)
- Active nav indicators
- CTA button borders
- Decorative rules and separators

Do not introduce additional brand colors without updating this doc.
