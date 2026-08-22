// app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // Tangkap error bawaan dari Google / Supabase OAuth di URL awal
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
    
    // 1. Tukar code dengan session Google
    const { error: authError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (authError) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(authError.message)}`)
    }

    // 2. Ambil data user yang sedang login
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Gagal mendapatkan data user dari sesi')}`)
    }

    // 3. Cek apakah profil user sudah ada di tabel 'profiles'
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      // Jika database error, amankan dengan signout paksa lalu lempar ke login
      await supabase.auth.signOut()
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Database error: ' + profileError.message)}`)
    }

    // 4. Jika profil belum ada, coba buat baru
    if (!profile) {
      const { error: insertError } = await supabase.from('profiles').insert([
        { 
          id: user.id, 
          email: user.email,
        }
      ])

      if (insertError) {
        // Jika gagal insert (misal database menolak), signout paksa user & lempar error ke /login
        await supabase.auth.signOut()
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Database error saving new user: ' + insertError.message)}`)
      }

      // Lempar ke onboarding jika data baru
      return NextResponse.redirect(`${origin}/onboarding`)
    }

    // Jika profil sudah ada tapi full_name kosong
    if (!profile.full_name) {
      return NextResponse.redirect(`${origin}/onboarding`)
    }

    // 5. Sukses total, masuk ke tujuan awal
    return NextResponse.redirect(`${origin}${nextParam}`)

  } catch (err: any) {
    // Menangkap error tak terduga (unexpected failure) di server
    const errorMessage = err?.message || 'Terjadi kesalahan sistem yang tidak diketahui'
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorMessage)}`)
  }
}