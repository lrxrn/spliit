import 'server-only'

const AUTH_BASE_URL = (
  process.env.BETTER_AUTH_URL ?? 'https://auth.lrxrn.dev'
).replace(/\/$/, '')

export type Session = {
  session: {
    id: string
    userId: string
    token: string
    expiresAt: string
    ipAddress?: string | null
    userAgent?: string | null
    createdAt: string
    updatedAt: string
  }
  user: {
    id: string
    email: string
    name: string
    emailVerified: boolean
    image?: string | null
    createdAt: string
    updatedAt: string
  }
}

export async function getSession(
  requestHeaders: Headers,
): Promise<Session | null> {
  const cookie = requestHeaders.get('cookie') ?? ''
  if (!cookie) return null
  try {
    const res = await fetch(`${AUTH_BASE_URL}/api/auth/get-session`, {
      headers: { cookie },
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data: unknown = await res.json()
    if (!data || typeof data !== 'object' || !('user' in data)) return null
    return data as Session
  } catch {
    return null
  }
}
