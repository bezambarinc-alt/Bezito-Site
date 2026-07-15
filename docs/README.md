# Bez Ambar Site — Design & Dev Documentation

This folder is the source of truth for design decisions, brand rules, and development conventions. **Read the relevant doc before changing anything. Update the doc in the same commit when a decision changes.**

## Contents

### Design & Dev
- [Typography](typography.md) — font stacks, base rules, sans tokens, blog exception
- [Colors](colors.md) — all CSS custom property token values
- [Layout](layout.md) — Layout.astro shell, global components, global scripts
- [Pages](pages.md) — full route map, page types, dynamic data sources
- [Components](components.md) — all 6 components with behavior + integration notes

### Brand & Product
- [Brand](brand.md) — voice, visual language, positioning, Patek-style design philosophy, hard rules
- [Inquiry Model](inquiry-model.md) — why no cart, InquiryDrawer flow, Archive modal, CTA language, FreshSales handoff

### Integrations
- [Integrations](integrations.md) — Plytix (PXM), FreshSales (CRM), Cloudinary, Vercel, Pagefind, Fontstand

## Rules

1. If a design or brand decision isn't in these docs, ask before assuming.
2. Any decision that changes something here must update the doc in the same commit.
3. Blog is the one page type with different typography rules — see [typography.md](typography.md).
4. The Alara Cut must not appear on any public-facing surface until USPTO patent is granted — see [brand.md](brand.md).
5. Product data changes go into Plytix first. Do not hand-edit `src/content/products/` — see [integrations.md](integrations.md).
