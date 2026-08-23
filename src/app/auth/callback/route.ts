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

  const nextParam = searchParams.get('next') ?? '/'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Kode autentikasi tidak ditemukan')}`)
  }

  try {
    const supabase = await createClient()
    
    const { error: authError } = await supabase.auth.exchangeCodeForSession(code)
    if (authError) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(authError.message)}`)
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Gagal mendapatkan data user dari sesi')}`)
    }

    // Ambil data profil dari database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      await supabase.auth.signOut()
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Database error: ' + profileError.message)}`)
    }

    // KONDISI 1: Jika profil sama sekali belum ada di database
    if (!profile) {
      const { error: insertError } = await supabase.from('profiles').insert([
        { 
          id: user.id, 
          email: user.email,
          full_name: null, 
        }
      ])

      if (insertError) {
        await supabase.auth.signOut()
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Database error saving new user: ' + insertError.message)}`)
      }

      // PAKSA MUTLAK KE ONBOARDING (Abaikan parameter next!)
      return NextResponse.redirect(`${origin}/onboarding`)
    }

    // KONDISI 2: Jika profil sudah ada, tapi full_name masih kosong / null
    const isNameEmpty = 
      profile.full_name === null || 
      profile.full_name === undefined || 
      String(profile.full_name).trim() === '' ||
      String(profile.full_name).toLowerCase() === 'null'

    if (isNameEmpty) {
      // PAKSA MUTLAK KE ONBOARDING (Abaikan parameter next!)
      return NextResponse.redirect(`${origin}/onboarding`)
    }

    // KONDISI 3: Hanya jika data sudah lengkap, boleh ke halaman tujuan awal (nextParam)
    return NextResponse.redirect(`${origin}${nextParam}`)

  } catch (err: any) {
    const errorMessage = err?.message || 'Terjadi kesalahan sistem yang tidak diketahui'
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorMessage)}`)
  }
}