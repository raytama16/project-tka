// app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '../../../utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Jika 'next' ada, arahkan ke sana (misal: /onboarding), kalau tidak ada default ke /onboarding
  const next = searchParams.get('next') ?? '/onboarding'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Jika terjadi error, kembalikan ke halaman login
  return NextResponse.redirect(`${origin}/login?error=Gagal login dengan Google`)
}