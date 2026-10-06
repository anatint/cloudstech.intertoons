import { NextResponse } from 'next/server'
import { ADMIN_SESSION_COOKIE } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const response = NextResponse.redirect(new URL('/admin', req.url))
  response.cookies.delete(ADMIN_SESSION_COOKIE)
  return response
}
