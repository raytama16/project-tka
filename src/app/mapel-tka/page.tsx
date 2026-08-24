'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { 
  BookOpen, 
  Sparkles, 
  TrendingUp, 
  Award, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Flame,
  Target,
  Search
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
    shadow: 'hover:shadow-emerald-100/60',
  },
  {
    bg: 'bg-gradient-to-br from-amber-50/80 via-white to-amber-50/30 hover:from-amber-100/80 hover:to-amber-50/50',
    border: 'border-amber-100/80 hover:border-amber-300',
    accent: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-700',
    text: 'text-amber-700',
    iconBg: 'bg-amber-100 text-amber-600',
    shadow: 'hover:shadow-amber-100/60',
  },
  {
    bg: 'bg-gradient-to-br from-indigo-50/80 via-white to-indigo-50/30 hover:from-indigo-100/80 hover:to-indigo-50/50',
    border: 'border-indigo-100/80 hover:border-indigo-300',
    accent: 'bg-indigo-500',
    badge: 'bg-indigo-100 text-indigo-700',
    text: 'text-indigo-700',
    iconBg: 'bg-indigo-100 text-indigo-600',
    shadow: 'hover:shadow-indigo-100/60',
  },
  {
    bg: 'bg-gradient-to-br from-rose-50/80 via-white to-rose-50/30 hover:from-rose-100/80 hover:to-rose-50/50',
    border: 'border-rose-100/80 hover:border-rose-300',
    accent: 'bg-rose-500',
    badge: 'bg-rose-100 text-rose-700',
    text: 'text-rose-700',
    iconBg: 'bg-rose-100 text-rose-600',
    shadow: 'hover:shadow-rose-100/60',
  },
  {
    bg: 'bg-gradient-to-br from-cyan-50/80 via-white to-cyan-50/30 hover:from-cyan-100/80 hover:to-cyan-50/50',
    border: 'border-cyan-100/80 hover:border-cyan-300',
    accent: 'bg-cyan-500',
    badge: 'bg-cyan-100 text-cyan-700',
    text: 'text-cyan-700',
    iconBg: 'bg-cyan-100 text-cyan-600',
    shadow: 'hover:shadow-cyan-100/60',
  },
]

export default function DashboardPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-blue-600 font-extrabold text-xs tracking-wider uppercase animate-pulse">Memuat Dashboard Utama...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50/60 text-gray-900 selection:bg-blue-600 selection:text-white pb-20">
      
      {/* ================= NAVBAR TERPISAH ================= */}
      <Navbar />

      {/* ================= CONTAINER UTAMA ================= */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        
        {/* ================= WELCOME BANNER & STATS CARD ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          
          {/* Banner Utama (2 Kolom) */}
          <div className="lg:col-span-2 relative bg-linear-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-500/10 overflow-hidden flex flex-col justify-between">
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 right-20 w-48 h-48 bg-purple-400/20 rounded-full blur-xl pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full text-blue-100 text-xs font-bold mb-4 border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>Sesi Belajar Aktif &amp; Terverifikasi</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-2">
                Halo, {profile?.full_name || 'Pejuang TKA'}! 👋
              </h1>
              <p className="text-blue-100 text-xs md:text-sm leading-relaxed max-w-xl">
                Selamat datang kembali di platform latihan TKA {profile?.school_name ? `(${profile.school_name})` : ''}. Pilih mata pelajaran di bawah untuk menguji kemampuan akademikmu hari ini.
              </p>
            </div>

            <div className="relative z-10 mt-6 pt-6 border-t border-white/10 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300 font-bold">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-blue-200 uppercase tracking-wider font-bold">Status Target</p>
                  <p className="text-xs font-extrabold">Konsisten Belajar</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-yellow-300 font-bold">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-blue-200 uppercase tracking-wider font-bold">Akses Soal</p>
                  <p className="text-xs font-extrabold">Tanpa Batas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stat Card (1 Kolom) */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Ringkasan Cepat</span>
                <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <h3 className="text-base font-black text-gray-800 mb-1">Performa Belajar</h3>
              <p className="text-xs text-gray-500 mb-4">Selesaikan modul latihan secara rutin untuk meningkatkan skor rata-rata ujianmu.</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 font-bold block">Total Mapel Tersedia</span>
                <span className="text-lg font-black text-blue-600">{subjects.length} Mata Pelajaran</span>
              </div>
              <Link 
                href="/mapel-tka" 
                className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition shadow-sm shadow-blue-500/20"
                title="Lihat Semua"
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>

        {/* ================= SECTION HEADER & SEARCH ================= */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Daftar Mata Pelajaran TKA</h2>
            <p className="text-xs text-gray-500 mt-0.5">Pilih salah satu mapel di bawah untuk mulai mengerjakan latihan soal.</p>
          </div>

          {/* Kotak Pencarian Interaktif */}
          <div className="relative w-full md:w-72">
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
        </div>

        {/* ================= GRID DAFTAR MATA PELAJARAN ================= */}
        {filteredSubjects.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-gray-200/80 text-center flex flex-col items-center justify-center gap-3 shadow-xs">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-gray-800">Mata Pelajaran Tidak Ditemukan</h3>
            <p className="text-xs text-gray-400 max-w-sm">
              Tidak ada mapel yang cocok dengan kata kunci &quot;{searchQuery}&quot;. Coba cari dengan nama lain.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredSubjects.map((subject, index) => {
              const theme = cardColorThemes[index % cardColorThemes.length]

              return (
                <Link
                  key={subject.id}
                  href={`/subjects/${subject.slug}`}
                  className={`${theme.bg} p-7 rounded-3xl shadow-xs hover:shadow-xl ${theme.shadow} transition-all duration-300 border ${theme.border} flex flex-col justify-between group relative overflow-hidden`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${theme.accent} opacity-90`} />

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 ${theme.iconBg} rounded-2xl flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform`}>
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full ${theme.badge}`}>
                        TKA Resmi
                      </span>
                    </div>

                    <h3 className={`text-lg font-black text-gray-900 mb-2 group-hover:${theme.text} transition-colors tracking-tight`}>
                      {subject.name}
                    </h3>
                    
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                      {subject.description || 'Akses materi lengkap, bank latihan soal pilihan ganda, dan ujian simulasi berbasis waktu.'}
                    </p>
                  </div>

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