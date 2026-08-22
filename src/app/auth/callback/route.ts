// app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/onboarding'

  if (code) {
    const supabase = await createClient()
    
    // 1. Tukar code dengan session Google
    const { error: authError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!authError) {
      // 2. Ambil data user yang sedang login
      const { data: { user } } = await supabase.auth.getUser()

      if (user && user.email) {
        // 3. Cek apakah email user sudah terdaftar di tabel 'profiles'
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id) // atau sesuaikan .eq('email', user.email) jika tabel profiles pakai kolom email
          .maybeSingle()

        // 4. Jika profil belum ada di database, gagalkan login!
        if (profileError || !existingProfile) {
          // Sign out agar sesi loginnya terhapus
          await supabase.auth.signOut()

          // Lempar kembali ke halaman login dengan pesan error
          return NextResponse.redirect(
            `${origin}/login?error=Akun belum terdaftar. Silakan hubungi admin atau daftar terlebih dahulu.`
          )
        }
      }

      // Jika email sudah terdaftar, lanjutkan ke tujuan (onboarding / dashboard)
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Jika kode gagal atau tidak valid
  return NextResponse.redirect(`${origin}/login?error=Gagal melakukan autentikasi Google`)
}