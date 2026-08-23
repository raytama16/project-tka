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

    // Ambil data profil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      await supabase.auth.signOut()
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Database error: ' + profileError.message)}`)
    }

    // --- DEBUGGING LOG (Cek di terminal/log hostingmu) ---
    console.log("DATA USER ID:", user.id)
    console.log("DATA PROFILE DARI DB:", profile)
    console.log("NILAI FULL_NAME:", profile?.full_name, typeof profile?.full_name)
    // --------------------------------------------------

    if (!profile) {
      console.log("-> Kondisi 1: Profil belum ada, melakukan INSERT...")
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

      console.log("-> Hasil INSERT sukses, mengarahkan ke /onboarding")
      return NextResponse.redirect(`${origin}/onboarding`)
    }

    // Pengecekan ketat status full_name
    const isNameEmpty = 
      profile.full_name === null || 
      profile.full_name === undefined || 
      String(profile.full_name).trim() === '' ||
      String(profile.full_name).toLowerCase() === 'null'

    console.log("-> Apakah nama kosong?", isNameEmpty)

    if (isNameEmpty) {
      console.log("-> Mengarahkan ke /onboarding karena nama kosong.")
      return NextResponse.redirect(`${origin}/onboarding`)
    }

    console.log("-> Profil lengkap! Masuk ke tujuan:", nextParam)
    return NextResponse.redirect(`${origin}${nextParam}`)

  } catch (err: any) {
    console.log("TERJADI ERROR CATCH:", err)
    const errorMessage = err?.message || 'Terjadi kesalahan sistem yang tidak diketahui'
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorMessage)}`)
  }
}