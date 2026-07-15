# Brand — Design Philosophy, Voice, Visual Identity

## Positioning

Bez Ambar is an independent fine jewelry designer and maker based in Los Angeles. The correct category is **private atelier** — not boutique, not online jeweler, not designer-brand. The distinction matters for every word on the site.

The website is built on the same principles that govern the presentation of Patek Philippe, Van Cleef & Arpels, Graff, and Harry Winston:

- Scarcity is real, not manufactured. Pieces are made to order.
- The relationship precedes the transaction. Inquiry comes first, always.
- The object speaks for itself. Copy supports; it does not oversell.
- Price is personal. It is shared in the context of a private conversation, never on a public page.

These are not stylistic choices — they are structural constraints that govern all content, copy, and UX decisions.

---

## Voice

### The Rules

**Spare.** No filler. No throat-clearing. If a sentence can be cut, cut it. If a word can go, it goes. Patek doesn't say "we are delighted to present." It says "Reference 5711."

**Declarative, not aspirational.** Aspirational copy is retail copy. We do not write about how a piece will make the customer feel. We state what the piece is, what it's made of, and what it does.

- ✗ "This stunning bracelet will elevate any look"
- ✓ "Forty-three princess-cut diamonds. Pavé-set across a single platinum track."

**Present tense.** The stone weighs 3.2 carats. The setting catches light at the edge. Not: "will catch," "is designed to," "you'll find."

**No retail language — ever.** A hard ban on the following words and phrases anywhere on the site:

| Banned | Use instead |
|---|---|
| shop / buy / purchase / add to cart | inquire / request / arrange |
| price / pricing / how much | by request / on inquiry |
| deal / sale / discount | — (don't reference these concepts) |
| affordable / accessible / value | — (not our positioning) |
| stunning / breathtaking / exquisite | state specifics instead |
| perfect gift | — (too retail) |
| collection sale / new arrivals sale | — |

**Specificity over adjective.** Every adjective is a potential cut. When you can say what the stone weighs, say that instead. When you can say how many facets, say that. Numbers are more credible than words.

**Third-person authority.** Headlines and labels speak in authority, not in first person ("Discover" is borderline; "Book a consultation" is fine as a CTA; "We are thrilled" is not fine).

### Tone by Context

| Context | Tone |
|---|---|
| Homepage hero | Silent / pure image + minimal logotype |
| Collection lede | Atmospheric. One sentence. Sets mood without selling. |
| Product editorial | Material-first. Precise. No hype. |
| Blog / journal | Thoughtful, informed. Can go longer. First person (Bez) is appropriate. |
| CTA buttons | Direct imperative: "Inquire", "Request Details", "Arrange a Viewing" |
| Error / 404 | Dry wit. On-brand. Not apologetic. |
| Footer | Functional. Exact. Addresses, hours, categories. |

---

## Visual Identity

### Logo

"BEZ AMBAR" wordmark in Open Sans, uppercase, wide tracking. No icon, no symbol, no monogram used as primary logo. The wordmark IS the mark.

### Color Palette

The full palette is in [colors.md](colors.md). The essential rules:

- `--accent` (`#95826b`) — warm sand/gold. CTAs, active states, eyebrow labels, decorative rules.
- `--dark-bg` (`#0d0d0d`) — near-black. Heroes, dark-section backdrops.
- `--paper` (`#faf7f2`) — warm off-white. Primary editorial section background.
- `--white` (`#ffffff`) — pure white. Default page background.
- `--ink` (`#1a1a1a`) — primary body text on light pages.
- Gold tone is warm, never yellow. Never bright. Never metallic-effect-on-screen.

### Typography

Full spec in [typography.md](typography.md). The essential rules:

**Open Sans** — all navigational, UI, label, and heading elements. Always uppercase. Letter-spacing 0.

**Lyon Text** — body text, editorial text, pull quotes, and hero display when atmospheric serif is needed. Loaded via Fontstand CDN (production only).

**Cormorant Garamond** — fallback serif (npm package, always available). Same role as Lyon Text; lower quality, used when Fontstand CDN is unavailable.

**Rule:** Never use Open Sans for body paragraphs. Never use a serif for navigation, labels, or UI chrome.

### Photography & Video

All product media is either:
1. Real-piece photography (studio or lifestyle)
2. AI-rendered concept imagery using Bez Ambar AI styles

AI styles in use (documented in workspace memory):
- **Livia** — hand-shot muse for ring mockups
- **Stone Sketch** — stones on pencil sketch, mid-gray paper
- **Bulgari Sketch** — archival design plate style
- **Graff Drawing** — multi-view watercolor atelier style

Video is Cloudinary MP4. Used on:
- Product cards (looping, autoplay, muted, no controls)
- Product page heroes
- Archive page modal

Video serves one purpose: showing how the piece moves in natural light. Every video on the site is a piece in motion.

### Layout Principles

**Significant white space.** Elements do not crowd each other. Let the piece breathe.

**Cinematic heroes.** Full-viewport video or image on homepage, collection pages, and individual product pages. No text overlay except a minimal wordmark or lede.

**Two-column product layout.** Media left, details right. Consistent across all product pages. See the `single-row` collection page as the canonical reference.

**No decorative elements.** No borders for decoration, no background patterns, no gradient fills on UI. If a border exists, it's structural (separating sections). If a gradient exists, it's in a photograph.

---

## Naming Conventions

**Collections** — proper-noun named, never generic: "The Bloom Collection", "Dentelle". Not "Flower Collection" or "Lace Jewelry."

**Pieces** — named or described by the defining characteristic: "Single Row Flex Bracelet", "Baguette Line Bracelet". The sku/ref code is internal only — never shown to customers.

**Cut names** — specific rules apply (see HARD RULES below).

---

## HARD RULES

### No Public Alara Cut Until Patent Granted

The **Alara Cut** is patent-pending. It must not appear on any public-facing surface (website copy, meta tags, schema.org, product names, social posts, email copy, AI-crawlable files like `llms.txt`) until USPTO grants the patent.

**Acceptable cut credits today:**
- Princess Cut
- Blaze® (with ® symbol)
- Elysian Cut™ (with ™ symbol)

This applies to every developer, every AI assistant, every copy edit. No exceptions.

⚠️ **Pending:** `llms.txt` on the live Vercel site currently names the Alara Cut at lines 3 and 23. This needs Bez's decision — options are: remove the file, leave it intentionally (prior-art signal), or replace with "patent-pending cut" language. Do not touch it until Bez decides.

---

## Anti-Patterns to Avoid

These have appeared in past drafts and are explicitly banned:

- Saying "luxury" about ourselves. Show it; don't say it.
- Using "bespoke" as an adjective for every single piece. Use it once if it's accurate; not as a vibe word.
- "One-of-a-kind" for pieces that are made-to-order but can be replicated. Say "made to order."
- Long explanatory copy on product pages. Under 80 words is the target.
- Numbered prices in any format (don't even write "starting at...").
- Modal windows that feel like popups. The InquiryDrawer is a panel, not a popup.
- Social proof language ("loved by thousands", "as seen in"). If press exists, it's in the Press section. Not on the homepage.
