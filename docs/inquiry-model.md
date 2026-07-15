# Inquiry Model — Why No Cart, How Inquiry Works

## The Model

Bez Ambar does not sell online. There is no cart, no checkout, no "Buy Now" button, no price on any page. This is a deliberate structural decision, not a gap.

The product is a made-to-order fine jewelry piece from an independent atelier. It cannot be appropriately sold via a 2-minute checkout flow. The purchase decision involves budget discussions, stone selection, metal choice, sizing, and often custom modifications — all of which require a human conversation.

The site exists to do one thing: **generate a qualified inquiry that starts that conversation.**

### The Funnel

```
Visitor arrives (organic / campaign / referral)
       ↓
Engages with piece (video hero, product page, archive)
       ↓
Clicks inquiry CTA (button, nav CTA, or drawer trigger)
       ↓
InquiryDrawer opens (pre-filled with piece context)
       ↓
Visitor submits form (name, email)
       ↓
CF Worker receives POST → creates FreshSales contact + lead
       ↓
Bez / team sees new lead in FreshSales
       ↓
Personal follow-up within 24 hours
       ↓
Consultation → commission → piece made to order
```

Nothing in this flow involves a transaction. The form submission is the conversion. Everything after that is human.

---

## InquiryDrawer

The `InquiryDrawer` is a slide-right panel rendered by `Layout.astro` on every page. It is always present in the DOM; it's hidden until triggered.

### Opening It

```js
window.openInquiryDrawer({
  title: 'Single Row Flex Bracelet',   // optional — pre-fills piece title
  sku: 'C0754',                         // optional — passed in form payload
  intent: 'consultation'                // optional — must match FreshSales intent values (see below)
})
```

Intent values (must align with FreshSales dropdown on the `/contact` page):
- `'commission a piece'` — Bespoke Design links (Nav + Footer)
- `'consultation'` — Nav bottom CTA "Arrange a Private Consultation"
- `'collection piece'` — A Piece from the Collection
- `'atelier visit'` — Visit the Atelier
- `'repairs'` — Repairs & Cleaning
- `'resize'` — Ring Resizing

Called from:
- Product page "Inquire" CTA buttons
- Nav bottom CTA ("Arrange a Private Consultation")
- Header contact icon — **currently links to `/contact` page** (TODO: should open InquiryDrawer with contact-style form)
- Collection page CTAs
- Footer service links
- Any inline text link that should trigger inquiry

### Form Fields

Visible to visitor:
- Name (required)
- Email (required)

Hidden / auto-filled:
- `intent` — set programmatically via `openInquiryDrawer()` (e.g. `'consultation'`, `'commission a piece'`, `'repairs'`, `'resize'`)
- `pieceTitle` — passed via `openInquiryDrawer()`
- `pieceSku` — passed via `openInquiryDrawer()`
- `utmSource`, `utmMedium`, `utmCampaign` — captured from URL on load, stored in `sessionStorage`, auto-included in every submit

### Submission

POSTs JSON to: `https://bezito-forms.bezambarinc.workers.dev/api/contact`

The CF Worker:
1. Validates required fields
2. Creates or updates a FreshSales contact (matched by email)
3. Creates a FreshSales lead/deal with piece context
4. Returns `{ success: true }` — the drawer shows a confirmation state

On success: the form fields clear, a "We'll be in touch" message appears. Drawer can be closed.

On error: the error message appears inline. Form data is preserved. User can retry.

---

## Archive Modal

The Archive page (`/archive`) has its own inquiry mechanism — separate from `InquiryDrawer`. Do not confuse them.

**Archive modal:**
- Triggered by clicking a piece card in the archive grid
- Opens a full-width overlay (not a slide-panel)
- Left side: Cloudinary MP4 video (autoplay, looped, no controls)
- Right side: inquiry form — name + email fields, same POST endpoint as InquiryDrawer
- The piece context (title, sku) is injected from `archive-data.json` entry
- Closing dismisses the overlay; does not navigate away

The reason it's separate: the Archive layout is gallery-first, and the modal presentation fits the archive browsing context better than a slide panel.

---

## CTA Language

These are the approved CTA phrases. Use them consistently. Do not improvise.

| Context | Correct CTA |
|---|---|
| Product page primary | "Inquire About This Piece" |
| Product page secondary | "Request Details" |
| Collection page | "Inquire" |
| Nav bottom CTA | "Arrange a Private Consultation" |
| Homepage | "Explore the Collection" → then "Inquire" at piece level |
| Blog / editorial | "Inquire" (inline link) or no CTA |
| 404 | "Return Home" or "Browse the Archive" |
| Header icon | (no text — contact icon only) |

**Never use:** "Buy Now", "Shop Now", "Add to Cart", "Check Out", "Order", "Purchase."

---

## FreshSales CRM (Lead Destination)

All form submissions land in FreshSales Enterprise.

- **Domain:** `bezambar.myfreshworks.com`
- **API base:** `https://bezambar.myfreshworks.com/crm/sales/api`
- **Credentials:** `workspace/credentials/freshsales.json`
- **All Contacts view ID:** `127026373115`

Each inquiry creates:
- A **Contact** record (or updates the existing one if email matches)
- A **Deal/Lead** record linked to that contact, with piece title + SKU in the deal description
- Source is tagged "Website Inquiry"

The CF Worker handles this server-side — the site never makes API calls directly to FreshSales. All FreshSales API calls go through `bezito-forms.bezambarinc.workers.dev`.

---

## Why No Price

Price is omitted for two reasons:

1. **Piece-specific:** the price of a made-to-order piece depends on the exact stone sourced, metal choice, and any modifications. There is no single price to display.
2. **Qualification:** visitors who inquire are self-selected for seriousness. Showing a price would short-circuit that filter in both directions (underpricing the piece in context, or scaring off serious buyers who see a number without context).

If pressed to add price in any form: discuss with Bez first. This is a strategic brand decision, not a technical constraint.
