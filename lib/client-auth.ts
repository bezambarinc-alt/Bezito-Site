import 'server-only'
import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)
const COOKIE = 'client_session'
const TTL = 60 * 60 * 8 // 8h

export interface ClientSessionPayload {
  sub: string          // contact_email
  clientId: number
  clientSlug: string
  role: 'client'
  [key: string]: unknown
}

export async function getClientSession(): Promise<ClientSessionPayload | null> {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    // Defense-in-depth: always verify role even if middleware passed
    if (payload.role !== 'client') return null
    return payload as ClientSessionPayload
  } catch {
    return null
  }
}

export async function createClientSession(payload: Omit<ClientSessionPayload, 'iat' | 'exp'>): Promise<void> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${TTL}s`)
    .sign(JWT_SECRET)

  ;(await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: TTL,
  })
}

export async function destroyClientSession(): Promise<void> {
  ;(await cookies()).delete(COOKIE)
}
