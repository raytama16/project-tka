import { createClient } from './client'

// Fungsi untuk Register (Sign Up) dengan data profil tambahan
export async function signUp(email: string, pass: string, fullName: string, schoolName: string, province: string) {
  const supabase = createClient()
  
  // 1. Daftarkan akun auth Supabase
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: pass,
  })

  if (authError) return { data: null, error: authError }

  // 2. Jika berhasil, masukkan data tambahan ke tabel profiles
  if (authData.user) {
    const { error: profileError } = await supabase.from('profiles').insert([
      {
        id: authData.user.id,
        full_name: fullName,
        school_name: schoolName,
        province: province,
      }
    ])

    if (profileError) {
      return { data: null, error: profileError }
    }
  }

  return { data: authData, error: null }
}

// Fungsi untuk Login (Sign In)
export async function signIn(email: string, pass: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pass,
  })
  return { data, error }
}

// Fungsi untuk Logout
export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}