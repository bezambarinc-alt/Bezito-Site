# Typography

## Font Stacks

Defined in `:root` in `src/styles/global.css`:

```css
--sans:  'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif
--serif: 'Lyon Text', 'Cormorant GaramondVariable', 'Cormorant Garamond', Georgia, serif
--prose: 'Lyon Text', 'Cormorant GaramondVariable', 'Cormorant Garamond', Georgia, serif
```

`--serif` and `--prose` are the same stack. `--prose` is the semantic alias for running body copy.

## Font Loading

Loaded in `src/layouts/Layout.astro` frontmatter:

- **Open Sans** — `@fontsource/open-sans` npm package, weights 300–700
- **Cormorant Garamond** — `@fontsource-variable/cormorant-garamond` npm package (variable font)
- **Lyon Text** — external Fontstand license: `https://webfonts.fontstand.com/WF-099839-...css` (production only; falls back to Cormorant Garamond in dev if the license link is blocked)

## Sans-Font Tokens

All elements using `var(--sans)` also carry these two paired tokens:

```css
--sans-transform:       uppercase
--sans-letter-spacing:  0
```

Every `font-family: var(--sans)` rule in the codebase is paired with:

```css
text-transform: var(--sans-transform, none);
letter-spacing: var(--sans-letter-spacing, normal);
```

To change the global sans casing or tracking, edit only the token in `:root`. Do not add hardcoded `text-transform` or `letter-spacing` to individual sans rules.

## Base Rules

```css
body {
  font-family: var(--serif);   /* Lyon Text for all running text */
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--sans);    /* Open Sans, uppercase, letter-spacing 0 */
  text-transform: var(--sans-transform, none);
  letter-spacing: var(--sans-letter-spacing, normal);
}
```

## Hero Heading Overrides

Several hero-level heading classes override `h1` back to serif. This is intentional — large display headlines in hero sections use Lyon Text for impact:

| Selector | Font | Notes |
|---|---|---|
| `.ba-inner-hero h1` | `var(--serif)`, weight 400 | Dark full-bleed hero sections |
| `.ba-light-hero h1` | `var(--serif)`, weight 300, no uppercase | Light-background hero sections |
| `.ba-category-hero__text h1` | `var(--serif)`, weight 300 | Category page hero |
| `.ba-collection-tile__title` | `var(--serif)`, weight 300 | Collection index cards |
| `.ba-portrait-hero__title` | `var(--sans)` | Collection/category portrait hero — stays sans |

## Blog Exception

Blog is the **only page type** with different typography rules. All other pages follow the base rules above.

Blog overrides (in `src/styles/templates/blog.css`):

- `ba-post-hero h1` → Lyon Text, italic, weight 400 (serif, not sans)
- `ba-post-content h2`, `h3` → Lyon Text, italic (serif body headings)
- Body copy in `ba-post-content` → Lyon Text (same as base, no change)

Do not apply blog typography rules to any other page type.

## Type Scale Tokens

```css
--type-display:  clamp(2.5rem, 5vw, 4rem)
--type-heading:  clamp(1.75rem, 3vw, 2.5rem)
--type-subhead:  clamp(1.125rem, 2vw, 1.5rem)
--type-label:    0.9375rem  /* 15px */
```
