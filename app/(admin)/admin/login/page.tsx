import { Suspense } from 'react'
import { headers } from 'next/headers'
import { isIpWhitelisted } from '@/lib/whitelist'
import LoginForm from './LoginForm'

/**
 * Server component — checks IP whitelist before rendering the login form.
 * Whitelisted IP → default to PIN tab (simpler, faster).
 * Unknown/new IP  → default to Sign In tab (full UN+PW first visit).
 */
export default async function LoginPage() {
  const hdrs = await headers()
  const ip = hdrs.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const whitelisted = await isIpWhitelisted(ip)

  return (
    <Suspense>
      <LoginForm defaultTab={whitelisted ? 'pin' : 'signin'} />
    </Suspense>
  )
}
