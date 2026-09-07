import { NextResponse } from 'next/server'

// Serves the Bez Ambar newsletter welcome email template.
// Used as content_url when creating Zoho Campaigns email campaigns.
// Zoho fetches this URL at campaign-creation time; the HTML is then
// stored inside Zoho Campaigns and this route is no longer needed for delivery.
export const dynamic = 'force-dynamic'

export async function GET() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Bez Ambar</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f5f0eb; font-family: Georgia, 'Times New Roman', serif; }
    .wrapper { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background-color: #1a1a1a; padding: 40px 48px 32px; text-align: center; }
    .logo { color: #d4af7a; font-size: 26px; letter-spacing: 0.35em; text-transform: uppercase; font-weight: normal; }
    .tagline { color: #a09080; font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; margin-top: 6px; }
    .hero { background-color: #1a1a1a; padding: 0 48px 48px; text-align: center; }
    .hero h1 { color: #ffffff; font-size: 28px; font-weight: normal; line-height: 1.4; margin: 0 0 16px; letter-spacing: 0.05em; }
    .hero p { color: #c0b0a0; font-size: 15px; line-height: 1.7; margin: 0; }
    .divider { height: 1px; background: linear-gradient(to right, transparent, #d4af7a, transparent); margin: 0; }
    .body { padding: 48px 48px 32px; }
    .body h2 { color: #1a1a1a; font-size: 18px; font-weight: normal; letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 16px; }
    .body p { color: #4a4040; font-size: 15px; line-height: 1.8; margin: 0 0 24px; }
    .cta-wrap { text-align: center; margin: 32px 0 40px; }
    .cta { display: inline-block; background-color: #1a1a1a; color: #d4af7a; text-decoration: none; padding: 14px 36px; font-size: 12px; letter-spacing: 0.25em; text-transform: uppercase; }
    .signature { padding: 0 48px 48px; border-top: 1px solid #f0ece8; margin-top: 8px; }
    .signature p { color: #4a4040; font-size: 14px; line-height: 1.8; margin: 24px 0 0; }
    .signature .name { color: #1a1a1a; font-size: 16px; }
    .footer { background-color: #f5f0eb; padding: 24px 48px; text-align: center; }
    .footer p { color: #9a9090; font-size: 11px; line-height: 1.6; margin: 0; }
    .footer a { color: #9a9090; }
    @media (max-width: 600px) {
      .header, .hero, .body, .signature, .footer { padding-left: 24px; padding-right: 24px; }
      .hero h1 { font-size: 22px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo">Bez Ambar</div>
      <div class="tagline">Bespoke Fine Jewelry · Los Angeles</div>
    </div>
    <div class="hero">
      <h1>Welcome, %%First Name%%</h1>
      <p>You are now part of a small, curated circle of collectors<br>who appreciate jewelry made to last generations.</p>
    </div>
    <div class="divider"></div>
    <div class="body">
      <h2>What to expect</h2>
      <p>
        As a Bez Ambar insider, you will be the first to see new pieces as they leave the atelier —
        before they are published anywhere else. You will also receive invitations to private viewings,
        early access to limited collections, and the occasional story behind a stone that found its perfect setting.
      </p>
      <p>
        Every piece we create begins with a conversation. If you have something in mind —
        a stone you have been thinking about, an occasion approaching, a vision without words yet —
        we are here to help you bring it to life.
      </p>
      <div class="cta-wrap">
        <a href="https://bezambar.com" class="cta">Explore the Collection</a>
      </div>
    </div>
    <div class="signature">
      <p>With gratitude for your trust,</p>
      <p class="name">Bez Ambar</p>
      <p style="color:#9a9090;font-size:13px;">Los Angeles · bezambar.com</p>
    </div>
    <div class="footer">
      <p>
        You received this because you subscribed at bezambar.com.<br>
        <a href="%%unsubscribe%%">Unsubscribe</a> &nbsp;·&nbsp;
        <a href="%%webversion%%">View in browser</a>
      </p>
    </div>
  </div>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
