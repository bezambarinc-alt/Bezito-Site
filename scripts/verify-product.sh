#!/bin/bash
BASE="https://bezambar-nextjs.vercel.app"
for URL in "/jewelry/jewelry/1C3S" "/jewelry/jewelry/VEGA" "/jewelry/jewelry/C0895"; do
  echo "=== $URL ==="
  curl -s -o /tmp/prod.html -w "HTTP:%{http_code} bytes:%{size_download}\n" -A "Mozilla/5.0" "$BASE$URL"
  echo "markers:"
  grep -oiE "hero-video|<video|ba-post|breadcrumb|Specifications|Gem Stone|Metal|Request a Private|One Stone|Vega|Golden Hour|Ref\." /tmp/prod.html | sort | uniq -c | head
  echo ""
done
