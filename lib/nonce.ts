import 'server-only'
import { headers } from 'next/headers'

export async function getNonce(): Promise<string> {
  return (await headers()).get('x-nonce') ?? ''
}
