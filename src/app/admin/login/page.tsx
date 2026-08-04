'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { ShieldAlert, Lock, Mail, ArrowRight } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Tentukan satu-satunya email khusus admin di sini
  const SPECIAL_ADMIN_EMAIL = "gpraya257@gmail.com" // Ganti dengan email khusus Anda

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')

    // Validasi awal email sebelum hit database
    if (email.trim().toLowerCase() !== SPECIAL_ADMIN_EMAIL.toLowerCase()) {
      setErrorMessage('Akses ditolak: Email ini tidak memiliki hak akses sebagai Administrator khusus.')
      setLoading(false)
      return
    }

    // Proses login via Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMessage(error.message || 'Gagal masuk. Periksa kembali email dan password Anda.')
      setLoading(false)
      return
    }

    // Pastikan dobel check user yang login benar-benar email admin khusus
    if (data.user?.email?.toLowerCase() !== SPECIAL_ADMIN_EMAIL.toLowerCase()) {
      await supabase.auth.signOut()
      setErrorMessage('Akses ilegal terdeteksi. Akun ini bukan akun administrator utama.')
      setLoading(false)
      return
    }

    // Jika lolos, arahkan ke dashboard admin
    router.push('/admin')
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col gap-6">
        
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center border border-purple-100 text-purple-600">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold text-gray-900 mt-2">Login Administrator</h1>
          <p className="text-xs text-gray-500">Panel khusus terbatas untuk satu akun pengelola utama.</p>
        </div>

        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <span className="text-xs text-red-700 leading-relaxed">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700">Email Admin Khusus</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-gray-400 absolute left-4" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@itedukasi.com"
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:border-purple-500 transition"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700">Password</label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-gray-400 absolute left-4" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:border-purple-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading}</span>
            <span>{loading ? 'Memverifikasi...' : 'Masuk ke Panel Admin'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="pt-4 border-t border-gray-100 text-center">
          <button
            onClick={() => router.push('/login')}
            className="text-xs font-semibold text-gray-500 hover:text-purple-600 transition"
          >
            &larr; Kembali ke Login Siswa Umum
          </button>
        </div>

      </div>
    </main>
  )
}