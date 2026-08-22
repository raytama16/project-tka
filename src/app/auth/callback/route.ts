// app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // Ambil parameter 'next' jika ada, default kosong dulu karena kita mau cek onboarding
  const nextParam = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    
    // 1. Tukar code dengan session Google
    const { error: authError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!authError) {
      // 2. Ambil data user yang sedang login
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // 3. Cek apakah profil user sudah ada di tabel 'profiles'
        // Asumsi: Kita cek kolom penanda seperti 'full_name' atau 'onboarding_completed' atau cukup ada tidaknya baris data
        const { data: profile } = await supabase
          .from('profiles')
          .select('*') // Ambil semua kolom untuk dicek kelengkapannya
          .eq('id', user.id)
          .maybeSingle()

        // 4. Logika Penentuan Halaman Tujuan
        // Jika profil belum ada, atau kolom penting (misal nama/onboarding) belum diisi:
        if (!profile || !profile.full_name) {
          // Jika data profil belum ada sama sekali, kita buatkan baris dasarnya dulu (opsional tapi aman)
          if (!profile) {
            await supabase.from('profiles').insert([
              { 
                id: user.id, 
                email: user.email,
              }
            ])
          }
          
          // Lempar ke halaman onboarding karena belum lengkap
          return NextResponse.redirect(`${origin}/onboarding`)
        }

        // 5. Jika profil SUDAH ADA dan sudah lengkap, langsung ke halaman utama / tujuan awal
        return NextResponse.redirect(`${origin}${nextParam}`)
      }
    }
  }

  // Jika gagal autentikasi
  return NextResponse.redirect(`${origin}/login?error=Gagal melakukan autentikasi Google`)
}