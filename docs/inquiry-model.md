# Inquiry Model

The site has no cart, no checkout, and no prices. Every conversion action leads to a human conversation.

---

## Funnel

```
Visitor sees piece
    ↓
Watches hero video (Cloudinary MP4, looped, muted)
    ↓
Clicks inquiry CTA (ProdPill, InquireCta block, or InquireFooter)
    ↓
InquiryDrawer opens (slide-right panel)
    ↓
Submits name + email + message
    ↓
POST /api/lead → Neon (durable) → Freshsales CRM (best-effort)
    ↓
Bez / team follows up by phone or email
```

---

## InquiryDrawer

Global panel — present on every public page via `DrawerProvider` in `app/(public)/layout.tsx`.

**Open it from anywhere:**
```typescript
const { openInquiryDrawer } = useDrawers()

openInquiryDrawer({
  intent?: string,    // e.g. 'consultation', 'inquiry', 'custom'
  sku?: string,       // pre-fills piece context
  title?: string,     // pre-fills piece title
})
```

**On submit:** `POST /api/lead` with `{ name, email, message, intent, sku }`.

The drawer is always in the DOM (zero open latency). Not mounted on demand — that would introduce a visible flicker on the primary conversion action.

---

## ConciergeDrawer

Separate panel for service-related inquiries — care, custom work, consultation booking.
Opened via the concierge bell icon in the header or the "Service" nav item.

Not the same as the InquiryDrawer. Do not conflate.

---

## Entry points

| Entry point | Component | Intent |
|---|---|---|
| Header concierge bell | `Header` → `openConcierge()` | Service |
| Menu "Service" item | `MenuOverlay` ROOT | Service |
| Product page floating pill | `ProdPill` | Piece inquiry |
| Product page footer | `InquireFooter` block | Piece inquiry |
| Inline product CTA | `InquireCta` block | Piece inquiry |
| Homepage | `ConciergeCtaButton` | General |
| Newsletter form | `Newsletter` | Newsletter subscribe |
| Archive modal | `ArchiveModal` | Archive piece inquiry |
| Contact page | `ContactForm` | General contact |

---

## Lead data model

```sql
leads (
  id          -- auto
  page_slug   -- FK → pages.slug (only for real page slugs, not SKUs)
  sku         -- piece SKU if piece-specific
  intent      -- consultation | inquiry | newsletter | custom | etc.
  name        -- optional
  email       -- required
  message     -- optional free text
  crm_status  -- pending | synced | failed
  crm_id      -- Freshsales contact ID if synced
  created_at
)
```

Leads are written to Neon first — always. CRM push is best-effort. `crm_status='failed'` leads are visible in `/admin/leads` and can be retried.

---

## Copy rules

Never use retail language in CTAs or body copy:

| ❌ Never | ✅ Instead |
|---|---|
| Shop | Browse / Explore |
| Buy / Purchase | Inquire / Commission |
| Add to cart | Request |
| Price / Cost | Available by inquiry |
| Deal / Sale | — (never) |
| Affordable | — (never) |

See [docs/brand.md](brand.md) for full voice rules.
