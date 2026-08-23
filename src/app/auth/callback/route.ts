// app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // 1. Tangkap error dari penyedia OAuth (Google / Supabase)
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
    
    // 2. Tukar code dengan session
    const { error: authError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (authError) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(authError.message)}`)
    }

    // 3. Ambil data user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Gagal mendapatkan data user dari sesi')}`)
    }

    // 4. Cek profil di database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      await supabase.auth.signOut()
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Database error: ' + profileError.message)}`)
    }

    // 5. Jika profil belum ada, buat baru
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

      // Wajib ke onboarding untuk user baru
      return NextResponse.redirect(`${origin}/onboarding`)
    }

    // 6. Jika profil sudah ada tapi full_name masih kosong/null (Aman dari TypeError)
    if (!profile.full_name || String(profile.full_name).trim() === '') {
      return NextResponse.redirect(`${origin}/onboarding`)
    }

    // 7. Sukses total, data sudah lengkap, baru ke halaman tujuan awal
    return NextResponse.redirect(`${origin}${nextParam}`)

  } catch (err: any) {
    const errorMessage = err?.message || 'Terjadi kesalahan sistem yang tidak diketahui'
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorMessage)}`)
  }
}