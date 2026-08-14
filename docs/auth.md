# Auth Model

Three independent auth layers. Each has its own cookie, JWT payload, and session TTL.

---

## 1. Admin auth

**Cookie:** `session` (httpOnly, secure, sameSite: strict)  
**TTL:** 2 hours  
**Library:** `lib/auth.ts`

### Login flow

```
POST /api/auth/login
  { email, password, trustDevice? }
      │
      ├─ Rate limit check (login_attempts table — 5 / 15 min)
      ├─ Neon: SELECT admin_users WHERE email = $1
      ├─ bcrypt compare (always runs — dummy hash if no user found)
      │    ← timing-safe: prevents revealing whether email exists
      ├─ On success: SignJWT({ role, sub: email, method: 'password' })
      ├─ If trustDevice: INSERT whitelisted_ips (30-day)
      ├─ audit('auth.login.success' | 'auth.login.failed', email, { ip, location })
      └─ Set 'session' cookie
```

### Verify in Server Components / API routes

```typescript
import { getSession } from '@/lib/auth'

const session = await getSession()
if (!session) redirect('/admin/login')  // or return 401

// session.sub  = email
// session.role = 'bez' | 'kevin' | 'admin'
```

### Progressive auth (PIN on trusted devices)

When an IP is in `whitelisted_ips`, the admin can log in with PIN only:

```
POST /api/auth/pin
  { pin: string }
      │
      ├─ Verify IP is in whitelisted_ips (not expired)
      ├─ bcrypt compare against admin_settings.admin_pin
      └─ Set 'session' cookie (same JWT, method: 'pin')
```

---

## 2. Client portal auth

**Cookie:** `client_session` (httpOnly, secure, sameSite: lax)  
**TTL:** 8 hours  
**Library:** `lib/client-auth.ts`

`sameSite: lax` (vs. admin's `strict`) — the portal is accessed via direct URL navigation which requires lax to carry the cookie.

### Login flow

```
POST /api/portal/auth
  { email, password }
      │
      ├─ Rate limit check (same login_attempts table)
      ├─ Neon: SELECT clients WHERE contact_email = $1 AND active = true
      ├─ bcrypt compare (DUMMY hash if no match — timing-safe)
      ├─ On success: SignJWT({ sub: email, clientId, clientSlug, role: 'client' })
      └─ Set 'client_session' cookie
```

### Verify in Server Components / API routes

```typescript
import { getClientSession } from '@/lib/client-auth'

const session = await getClientSession()
if (!session) redirect('/portal/login')  // or return 401

// session.sub       = contact_email
// session.clientId  = clients.id
// session.clientSlug = clients.slug
// session.role      = 'client'
```

Defense-in-depth: `getClientSession()` explicitly checks `payload.role === 'client'` even after JWT verification succeeds.

---

## 3. Preview PIN

**Cookie:** `ba_preview_${slug}` (httpOnly, secure, sameSite: strict)  
**TTL:** 48 hours (matches `pin_expires_at`)  
**No library** — handled inline in `preview/[slug]/page.tsx` and `/api/preview/[slug]/verify-pin`

### Flow

```
Client (portal) → generates PIN via POST /api/portal/pages/[slug]/pin
    │   crypto.randomInt(1000, 9999) — 4-digit cryptographically random
    │   Stored plain text in pages.customer_pin (not hashed — it's a short-lived one-time code)
    │   Expiry: now + 48h
    └─ Client shares URL: /preview/[slug]

Customer → visits /preview/[slug]
    │
    ├─ Page fetched from Neon (must be live + showcase)
    ├─ PIN check: customer_pin IS NOT NULL AND pin_expires_at > now()
    ├─ Cookie ba_preview_<slug> present? → render page
    └─ No cookie → render <PinGate> (client-side PIN entry)
           │
           └─ POST /api/preview/[slug]/verify-pin { pin: string }
                   │
                   ├─ Fetch page from Neon
                   ├─ Compare pin (plain text — timing-safe via constant-time string compare)
                   ├─ Check pin_expires_at > now()
                   └─ Set ba_preview_<slug> cookie (48h) → redirect to /preview/[slug]
```

### Admin bypass

Preview page accepts `?tpl=<templateId>` with a valid `session` cookie (admin JWT). This skips the PIN entirely for template preview in the admin UI.

---

## 4. Client page gate (legacy)

**Cookie:** `ba_page_access` (list of unlocked slugs, comma-separated)  
**Used for:** `/client/[slug]` marketing pages (password-protected, not PIN-protected)  
**Library:** `lib/page-gate.ts`

---

## Rate limiting

Shared table `login_attempts` applies to all login endpoints:

| Setting | Value |
|---|---|
| Window | 15 minutes |
| Max attempts | 5 |
| Response | 429 with `Retry-After: 900` |
| Scope | Per IP address |

Cleanup: old attempts are not auto-deleted by the application — migration 004 adds a Postgres scheduled cleanup or the table grows indefinitely. Monitor size in production.

---

## JWT payload shapes

**Admin:**
```typescript
{ sub: string, role: string, method: 'password' | 'pin', iat, exp }
```

**Client:**
```typescript
{ sub: string, clientId: number, clientSlug: string, role: 'client', iat, exp }
```

Both signed with `JWT_SECRET` using HS256.

---

## Security notes

- **Timing-safe auth:** bcrypt `compare()` always runs even when the email/email doesn't exist. A dummy hash ensures constant-time behavior.
- **Cookie attributes:** all session cookies are `httpOnly` (no JS access) + `secure` (HTTPS only).
- **JWT secret:** shared between admin and client sessions. Rotation requires all sessions to be invalidated (no refresh token mechanism).
- **No cross-auth confusion:** `getSession()` reads the `session` cookie; `getClientSession()` reads `client_session`. They cannot interfere.
