import 'server-only'
import type { NextRequest } from 'next/server'
import { getClientIp } from './client-ip'

/**
 * Extract client IP + geolocation from request headers.
 * Works on Vercel (x-vercel-ip-*) and Cloudflare (cf-* headers).
 */
export interface GeoInfo {
  ip: string
  city?: string
  region?: string
  country?: string
}

export function getGeo(req: NextRequest): GeoInfo {
  // Platform-injected headers only — a client-supplied x-forwarded-for entry
  // must never become the rate-limit key. See lib/client-ip.ts.
  const ip = getClientIp(req.headers)

  // Vercel geo headers (present in production on Vercel)
  const city =
    req.headers.get('x-vercel-ip-city') ??
    req.headers.get('cf-ipcity') ??
    undefined
  const region =
    req.headers.get('x-vercel-ip-country-region') ??
    req.headers.get('cf-region') ??
    undefined
  const country =
    req.headers.get('x-vercel-ip-country') ??
    req.headers.get('cf-ipcountry') ??
    undefined

  return {
    ip,
    city: city ? decodeURIComponent(city) : undefined,
    region: region ? decodeURIComponent(region) : undefined,
    country,
  }
}

/** Human-readable location string, e.g. "Los Angeles, CA, US" */
export function formatLocation(geo: GeoInfo): string {
  return [geo.city, geo.region, geo.country].filter(Boolean).join(', ') || 'unknown'
}
