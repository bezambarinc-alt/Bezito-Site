import { Suspense } from 'react'
import { headers } from 'next/headers'
import { isIpWhitelisted } from '@/lib/whitelist'
import { getClientIp } from '@/lib/client-ip'
import LoginForm from './LoginForm'

/**
 * Server component — checks IP whitelist before rendering the login form.
 * Whitelisted IP → default to PIN tab (simpler, faster).
 * Unknown/new IP  → default to Sign In tab (full UN+PW first visit).
 */
export default async function LoginPage() {
  const hdrs = await headers()
  // Same extraction as /api/auth/pin, so the tab default matches what the
  // server will actually accept.
  const ip = getClientIp(hdrs)
  const whitelisted = await isIpWhitelisted(ip)

  return (
    <Suspense>
      <LoginForm defaultTab={whitelisted ? 'pin' : 'signin'} />
    </Suspense>
  )
}
