import { NextRequest } from 'next/server'

const AUTH_BASE_URL = (
  process.env.BETTER_AUTH_URL ?? 'https://auth.lrxrn.dev'
).replace(/\/$/, '')

async function handler(req: NextRequest): Promise<Response> {
  const { pathname, search } = new URL(req.url)
  const target = `${AUTH_BASE_URL}${pathname}${search}`

  const body =
    req.method === 'GET' || req.method === 'HEAD'
      ? undefined
      : await req.arrayBuffer()

  return fetch(target, {
    method: req.method,
    headers: req.headers,
    body,
  })
}

export const GET = handler
export const POST = handler
