// app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // Ambil parameter 'next' jika ada, default ke '/'
  const nextParam = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    
    // 1. Tukar code dengan session Google
    const { error: authError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (authError) {
      console.error("Gagal exchange code:", authError.message)
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(authError.message)}`)
    }

    // 2. Ambil data user yang sedang login
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.redirect(`${origin}/login?error=Gagal+mendapatkan+data+user`)
    }

    // 3. Cek apakah profil user sudah ada di tabel 'profiles'
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error("Gagal mengambil profil:", profileError.message)
    }

    // 4. Logika Penentuan Halaman Tujuan & Onboarding
    // Jika profil belum ada sama sekali:
    if (!profile) {
      const { error: insertError } = await supabase.from('profiles').insert([
        { 
          id: user.id, 
          email: user.email,
        }
      ])

      if (insertError) {
        console.error("GAGAL INSERT PROFILES:", insertError.message)
      }

      // Lempar ke halaman onboarding karena data baru dibuat
      return NextResponse.redirect(`${origin}/onboarding`)
    }

    // Jika profil sudah ada, tapi nama lengkap (full_name) belum diisi/kosong
    if (!profile.full_name) {
      return NextResponse.redirect(`${origin}/onboarding`)
    }

    // 5. Jika profil SUDAH ADA dan lengkap, langsung ke halaman tujuan awal
    return NextResponse.redirect(`${origin}${nextParam}`)
  }

  // Jika parameter 'code' tidak ada di URL
  return NextResponse.redirect(`${origin}/login?error=Kode+autentikasi+tidak+ditemukan`)
}