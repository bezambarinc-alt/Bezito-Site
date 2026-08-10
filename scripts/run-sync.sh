#!/bin/bash
# Trigger the Plytix sync on the live production deployment (has Vercel env keys).
echo "=== hitting /api/cron/plytix-sync on production ==="
curl -s -A "Mozilla/5.0" -w "\nHTTP:%{http_code}\n" "https://bezambar-nextjs.vercel.app/api/cron/plytix-sync"
