const KEY = 'ba_user_profile'

export interface UserProfile {
  name: string
  email: string
  phone: string
}

const EMPTY: UserProfile = { name: '', email: '', phone: '' }

export function readProfile(): UserProfile {
  if (typeof window === 'undefined') return EMPTY
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? 'null') ?? EMPTY
  } catch {
    return EMPTY
  }
}

export function saveProfile(patch: Partial<UserProfile>): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ ...readProfile(), ...patch }))
  } catch {
    // sessionStorage unavailable (e.g. Safari private browsing with strict settings)
  }
}
