'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { BookOpen, Layers, FileQuestion, ArrowRight, ShieldCheck, LogOut } from 'lucide-react'

export default function AdminDashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [adminEmail, setAdminEmail] = useState<string>('gpraya257@gmail.com')

  // Kita hanya mengambil data user yang sedang login untuk ditampilkan di UI,
  // karena urusan keamanan/redirect sudah di-handle otomatis oleh Middleware.
  useEffect(() => {
    async function getUserEmail() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setAdminEmail(user.email)
      }
    }
    getUserEmail()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  // Daftar menu navigasi utama admin
  const adminMenus = [
    {
      title: 'Kelola Mata Pelajaran',
      description: 'Tambah, ubah, atau hapus daftar mata pelajaran (Subjects) yang tersedia pada platform.',
      icon: <BookOpen className="w-6 h-6 text-purple-600" />,
      path: '/admin/subjects',
      badge: 'Subjects'
    },
    {
      title: 'Kelola Materi Pembelajaran',
      description: 'Buat dan atur ringkasan materi atau modul belajar untuk setiap mata pelajaran.',
      icon: <Layers className="w-6 h-6 text-blue-600" />,
      path: '/admin/materials',
      badge: 'Materials'
    },
    {
      title: 'Kelola Bank Soal (Ujian & Latihan)',
      description: 'Atur soal pilihan ganda, PG kompleks, dan matriks benar-salah untuk latihan maupun ujian.',
      icon: <FileQuestion className="w-6 h-6 text-emerald-600" />,
      path: '/admin/practice', // atau sesuaikan dengan path rute manajemen soal Anda
      badge: 'Questions'
    }
  ]

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12 flex justify-center">
      <div className="w-full max-w-5xl flex flex-col gap-8">
        
        {/* Header Dashboard */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center border border-purple-100">
              <ShieldCheck className="w-7 h-7 text-purple-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                  Panel Administrator
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 mt-1">Dashboard Admin</h1>
              <p className="text-xs text-gray-500 mt-0.5">Masuk sebagai <strong className="text-gray-700">{adminEmail}</strong></p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/subjects')}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition"
            >
              Kembali ke Beranda Siswa
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Keluar
            </button>
          </div>
        </div>

        {/* Grid Menu Navigasi */}
        <div>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Menu Pengelolaan Sistem</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {adminMenus.map((menu, index) => (
              <div
                key={index}
                onClick={() => router.push(menu.path)}
                className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:border-purple-200 hover:shadow-md transition cursor-pointer flex flex-col justify-between gap-6 group"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-purple-50 transition">
                      {menu.icon}
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
                      {menu.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-purple-600 transition">
                      {menu.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                      {menu.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-purple-600 pt-4 border-t border-gray-50 group-hover:translate-x-1 transition-transform">
                  <span>Akses Menu</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}