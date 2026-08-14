import { Suspense } from 'react'
import PortalLoginForm from './LoginForm'

export const metadata = { title: 'Sign In', robots: 'noindex' }

export default function PortalLoginPage() {
  return (
    <Suspense>
      <PortalLoginForm />
    </Suspense>
  )
}
