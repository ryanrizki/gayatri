import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { token?: string } | null
  if (!body?.token || typeof body.token !== 'string') {
    return NextResponse.json({ error: 'token required' }, { status: 400 })
  }
  cookies().set('gayatri_admin', body.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 8 * 60 * 60,
    path: '/'
  })
  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  cookies().delete('gayatri_admin')
  return NextResponse.json({ ok: true })
}
