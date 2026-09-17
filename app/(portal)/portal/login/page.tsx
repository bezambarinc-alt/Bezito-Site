import { Suspense } from 'react'
import PortalLoginForm from './LoginForm'

export const metadata = { title: 'Sign In', robots: 'noindex' }

// This page must not prerender — see app/(portal)/layout.tsx, which forces the
// whole group dynamic so the strict CSP has a nonce to attach to.

export default function PortalLoginPage() {
  return (
    <Suspense>
      <PortalLoginForm />
    </Suspense>
  )
}
