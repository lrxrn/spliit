import { NextRequest, NextResponse } from 'next/server'

// Auth checks are enforced at the tRPC layer via protectedProcedure.
// This middleware is intentionally a passthrough — it exists to ensure
// the request chain is in place for future edge-level auth guards.
export function middleware(_req: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
