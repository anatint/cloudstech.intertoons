import { NextResponse } from 'next/server'

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://intertoons.com'

export function GET() {
  const content = `User-agent: *
Allow: /

Disallow: /admin/
Disallow: /api/
Disallow: /_next/

Sitemap: ${BASE_URL}/sitemap.xml
`

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
