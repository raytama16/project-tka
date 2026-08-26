// app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  const oauthError = searchParams.get('error_description') || searchParams.get('error')
  if (oauthError) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(oauthError)}`)
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Kode autentikasi tidak ditemukan')}`)
  }

  try {
    const supabase = await createClient()
    
    // 1. Tukar code dengan session
    const { error: authError } = await supabase.auth.exchangeCodeForSession(code)
    if (authError) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(authError.message)}`)
    }

    // 2. Ambil data user yang sedang login
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Gagal mendapatkan data user dari sesi')}`)
    }

    // 3. Cek apakah profil sudah ada di database (opsional, buat amankan data row-nya)
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    // Kalau profil belum ada, insert baris dasarnya dulu biar gak error di onboarding
    if (!profile) {
      await supabase.from('profiles').insert([
        { 
          id: user.id, 
          email: user.email,
          full_name: null, 
        }
      ])
    }
    // 4. PAKSA 100% LANGSUNG MASUK KE ONBOARDING TANPA PENGECEKAN LAIN
    return NextResponse.redirect(`${origin}/onboarding`)

  } catch (err: any) {
    const errorMessage = err?.message || 'Terjadi kesalahan sistem yang tidak diketahui'
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorMessage)}`)
  }
}