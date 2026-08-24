'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  Award, 
  TrendingUp, 
  Clock, 
  LogOut, 
  User, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  GraduationCap
} from 'lucide-react'

type Subject = {
  id: string
  name: string
  slug: string
  description?: string
  total_modules?: number
}

type Profile = {
  full_name: string
  school_name: string
  updated_at?: string
}

// Daftar variasi tema warna modern untuk card mapel (Glassmorphism & Gradient accents)
const cardColorThemes = [
  {
    bg: 'bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/30 hover:from-emerald-100/80 hover:to-emerald-50/50',
    border: 'border-emerald-100/80 hover:border-emerald-300',
    accent: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700',
    text: 'text-emerald-700',
    iconBg: 'bg-emerald-100 text-emerald-600',
    shadow: 'hover:shadow-emerald-100',
  },
  {
    bg: 'bg-gradient-to-br from-amber-50/80 via-white to-amber-50/30 hover:from-amber-100/80 hover:to-amber-50/50',
    border: 'border-amber-100/80 hover:border-amber-300',
    accent: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-700',
    text: 'text-amber-700',
    iconBg: 'bg-amber-100 text-amber-600',
    shadow: 'hover:shadow-amber-100',
  },
  {
    bg: 'bg-gradient-to-br from-indigo-50/80 via-white to-indigo-50/30 hover:from-indigo-100/80 hover:to-indigo-50/50',
    border: 'border-indigo-100/80 hover:border-indigo-300',
    accent: 'bg-indigo-500',
    badge: 'bg-indigo-100 text-indigo-700',
    text: 'text-indigo-700',
    iconBg: 'bg-indigo-100 text-indigo-600',
    shadow: 'hover:shadow-indigo-100',
  },
  {
    bg: 'bg-gradient-to-br from-rose-50/80 via-white to-rose-50/30 hover:from-rose-100/80 hover:to-rose-50/50',
    border: 'border-rose-100/80 hover:border-rose-300',
    accent: 'bg-rose-500',
    badge: 'bg-rose-100 text-rose-700',
    text: 'text-rose-700',
    iconBg: 'bg-rose-100 text-rose-600',
    shadow: 'hover:shadow-rose-100',
  },
  {
    bg: 'bg-gradient-to-br from-cyan-50/80 via-white to-cyan-50/30 hover:from-cyan-100/80 hover:to-cyan-50/50',
    border: 'border-cyan-100/80 hover:border-cyan-300',
    accent: 'bg-cyan-500',
    badge: 'bg-cyan-100 text-cyan-700',
    text: 'text-cyan-700',
    iconBg: 'bg-cyan-100 text-cyan-600',
    shadow: 'hover:shadow-cyan-100',
  },
]

export default function DashboardPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      // 1. Cek Autentikasi User
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        router.push('/login')
        return
      }

      // 2. Ambil Profil User
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, school_name')
        .eq('id', user.id)
        .maybeSingle()

      if (profileData) {
        // Validasi jika nama kosong, paksa ke onboarding
        if (!profileData.full_name || profileData.full_name.trim() === '') {
          router.push('/onboarding')
          return
        }
        setProfile(profileData)
      } else {
        router.push('/onboarding')
        return
      }

      // 3. Ambil Data Mata Pelajaran
      const { data: subjectData, error: subjectError } = await supabase
        .from('subjects')
        .select('*')
        .order('name', { ascending: true })

      if (!subjectError && subjectData) {
        setSubjects(subjectData)
        setFilteredSubjects(subjectData)
      }
      
      setLoading(false)
    }

    fetchData()
  }, [supabase, router])

  // Fitur Pencarian / Filter Mata Pelajaran Real-time
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSubjects(subjects)
    } else {
      const filtered = subjects.filter((subj) =>
        subj.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredSubjects(filtered)
    }
  }, [searchQuery, subjects])

  // Fungsi Logout Aman
  const handleLogout = async () => {
    setIsLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-blue-600 font-extrabold text-xs tracking-wider uppercase animate-pulse">Memuat Dashboard Utama...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50/50 text-gray-900 selection:bg-blue-600 selection:text-white pb-16">
      
      {/* ================= HEADER / NAVBAR DASHBOARD ================= */}
      {/* <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-xs">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-linear-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-blue-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-gray-900 block">Palisademy</span>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block">Dashboard Siswa</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-gray-900">{profile?.full_name}</span>
              <span className="text-[11px] text-gray-400 font-medium">{profile?.school_name || 'Pelajar Mandiri'}</span>
            </div>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer disabled:opacity-50 border border-rose-100"
              title="Keluar Akun"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">{isLoggingOut ? 'Keluar...' : 'Logout'}</span>
            </button>
          </div>

        </div>
      </header> */}

      {/* ================= CONTAINER UTAMA ================= */}
      <div className="max-w-6xl mx-auto px-6 pt-8">
        
        {/* ================= WELCOME BANNER (MODERN GRADIENT) ================= */}
        <div className="relative bg-linear-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-8 md:p-10 text-white shadow-xl shadow-blue-500/10 mb-10 overflow-hidden">
          {/* Efek Lingkaran Blur Dekoratif */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 right-20 w-48 h-48 bg-purple-400/20 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full text-blue-100 text-xs font-bold mb-4 border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>Sesi Belajar Aktif &amp; Terverifikasi</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-black tracking-tight mb-3">
                Halo, {profile?.full_name || 'Pejuang TKA'}! 👋
              </h1>
              <p className="text-blue-100 text-xs md:text-sm leading-relaxed">
                Selamat datang kembali di platform latihan TKA {profile?.school_name ? `(${profile.school_name})` : ''}. Pilih mata pelajaran di bawah untuk menguji kemampuan akademikmu hari ini.
              </p>
            </div>

            {/* Statistik Cepat / Badge */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-5 rounded-2xl flex flex-col gap-2 min-w-45 shadow-inner">
              <div className="flex items-center gap-2 text-blue-200 text-xs font-bold">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Status Akun</span>
              </div>
              <span className="text-lg font-black text-white">Aktif &amp; Siap Ujian</span>
              <span className="text-[10px] text-blue-200/80">Akses Modul Terbuka Penuh</span>
            </div>
          </div>
        </div>

        {/* ================= SECTION FILTER & PENCARIAN MAPEL ================= */}
        {/* <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Pilih Mata Pelajaran</h2>
            <p className="text-xs text-gray-500 mt-0.5">Pilih salah satu mapel untuk mulai mengerjakan latihan soal.</p>
          </div> */}

          {/* Kotak Pencarian Interaktif */}
          {/* <div className="relative w-full md:w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari mata pelajaran..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs transition"
            />
          </div>
        </div> */}

        {/* ================= GRID DAFTAR MATA PELAJARAN ================= */}
        {filteredSubjects.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-gray-200/80 text-center flex flex-col items-center justify-center gap-3 shadow-xs">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-gray-800">Mata Pelajaran Tidak Ditemukan</h3>
            <p className="text-xs text-gray-400 max-w-sm">
              Tidak ada mapel yang cocok dengan kata kunci &quot;{searchQuery}&quot;. Coba cari dengan nama lain atau tambahkan data di database Supabase.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredSubjects.map((subject, index) => {
              // Mengambil tema warna dinamis secara berurutan
              const theme = cardColorThemes[index % cardColorThemes.length]

              return (
                <Link
                  key={subject.id}
                  href={`/subjects/${subject.slug}`}
                  className={`${theme.bg} p-7 rounded-3xl shadow-xs hover:shadow-xl ${theme.shadow} transition-all duration-300 border ${theme.border} flex flex-col justify-between group relative overflow-hidden`}
                >
                  {/* Aksen garis warna futuristik di atas card */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${theme.accent} opacity-90`} />

                  <div>
                    {/* Header Card dengan Badge Kecil */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 ${theme.iconBg} rounded-2xl flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform`}>
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full ${theme.badge}`}>
                        TKA Resmi
                      </span>
                    </div>

                    {/* Judul Mapel */}
                    <h3 className={`text-lg font-black text-gray-900 mb-2 group-hover:${theme.text} transition-colors tracking-tight`}>
                      {subject.name}
                    </h3>
                    
                    {/* Deskripsi Singkat */}
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                      {subject.description || 'Akses materi lengkap, bank latihan soal pilihan ganda, dan ujian simulasi berbasis waktu.'}
                    </p>
                  </div>

                  {/* Tombol Aksi di Bawah Card */}
                  <div className="mt-8 pt-4 border-t border-gray-200/60 flex items-center justify-between text-xs font-extrabold text-gray-800">
                    <span className={`group-hover:${theme.text} transition-colors flex items-center gap-1.5`}>
                      <span>Mulai Belajar</span>
                    </span>
                    <span className={`w-8 h-8 rounded-full bg-white shadow-xs flex items-center justify-center transform group-hover:translate-x-1 transition-transform ${theme.text}`}>
                      &rarr;
                    </span>
                  </div>

                </Link>
              )
            })}
          </div>
        )}

        {/* ================= FOOTER INFORMASI TAMBAHAN ================= */}
        <div className="mt-16 pt-8 border-t border-gray-200/60 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-700">Palisademy TKA System</span>
            <span>&bull;</span>
            <span>Platform Evaluasi Akademik Digital</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} All rights reserved.
          </div>
        </div>

      </div>

    </main>
  )
}