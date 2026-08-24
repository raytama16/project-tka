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
  Search,
  Crown,
  ShieldCheck,
  X,
  MessageCircle
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
  is_premium?: boolean
  updated_at?: string
}

// Daftar variasi tema warna modern untuk card mapel (Warna solid & bersih tanpa transparan bawah)
const cardColorThemes = [
  {
    bg: 'bg-emerald-50/90 hover:bg-emerald-50',
    border: 'border-emerald-200/80 hover:border-emerald-300',
    accent: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700',
    text: 'text-emerald-700',
    iconBg: 'bg-emerald-100 text-emerald-600',
    shadow: 'hover:shadow-emerald-100/60',
  },
  {
    bg: 'bg-amber-50/90 hover:bg-amber-50',
    border: 'border-amber-200/80 hover:border-amber-300',
    accent: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-700',
    text: 'text-amber-700',
    iconBg: 'bg-amber-100 text-amber-600',
    shadow: 'hover:shadow-amber-100/60',
  },
  {
    bg: 'bg-indigo-50/90 hover:bg-indigo-50',
    border: 'border-indigo-200/80 hover:border-indigo-300',
    accent: 'bg-indigo-500',
    badge: 'bg-indigo-100 text-indigo-700',
    text: 'text-indigo-700',
    iconBg: 'bg-indigo-100 text-indigo-600',
    shadow: 'hover:shadow-indigo-100/60',
  },
  {
    bg: 'bg-rose-50/90 hover:bg-rose-50',
    border: 'border-rose-200/80 hover:border-rose-300',
    accent: 'bg-rose-500',
    badge: 'bg-rose-100 text-rose-700',
    text: 'text-rose-700',
    iconBg: 'bg-rose-100 text-rose-600',
    shadow: 'hover:shadow-rose-100/60',
  },
  {
    bg: 'bg-cyan-50/90 hover:bg-cyan-50',
    border: 'border-cyan-200/80 hover:border-cyan-300',
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
  
  // State untuk kontrol Modal Popup Pembelian Premium
  const [isModalOpen, setIsModalOpen] = useState(false)
  
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

      // 2. Ambil Profil User (termasuk kolom is_premium)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, school_name, is_premium')
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

  // Fungsi untuk mengarahkan ke WhatsApp dengan pesan otomatis
  const handleWhatsAppCheckout = () => {
    const phoneNumber = '6285792108262' // Ganti dengan nomor WhatsApp kamu
    const userName = profile?.full_name || 'User'
    const message = `Halo Admin, saya ${userName} ingin mengaktifkan akun Premium Palisademy TKA saya. Mohon info proses selanjutnya.`
    const encodedMessage = encodeURIComponent(message)
    
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank')
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
    <main className="min-h-screen bg-slate-50/60 text-gray-900 dark:bg-slate-50 dark:text-gray-900 selection:bg-blue-600 selection:text-white pb-20 relative">
      
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

          {/* Quick Stat & Akun Status Card (1 Kolom) */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between gap-4">
            
            {/* Total Mapel Info */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 font-bold block">Total Mapel Tersedia</span>
                <span className="text-base font-black text-blue-600">{subjects.length} Mata Pelajaran</span>
              </div>
              <Link 
                href="/mapel-tka" 
                className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition shadow-sm shadow-blue-500/20"
                title="Lihat Semua"
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Status Akun (Premium / Free User) */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Status Akun</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {profile?.is_premium ? (
                      <span className="inline-flex items-center gap-1 text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        <Crown className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>PREMIUM</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-black text-gray-600 bg-gray-200/70 px-2.5 py-0.5 rounded-full">
                        <span>FREE USER</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${profile?.is_premium ? 'bg-amber-100 text-amber-600' : 'bg-gray-200 text-gray-600'}`}>
                  <Crown className="w-4 h-4" />
                </div>
              </div>

              {!profile?.is_premium && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full mt-1 py-2.5 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-extrabold shadow-sm shadow-orange-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Upgrade ke Premium</span>
                </button>
              )}
            </div>

          </div>

        </div>

        {/* ================= SECTION HEADER & SEARCH ================= */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Daftar Mata Pelajaran TKA</h2>
            <p className="text-xs text-gray-500 mt-0.5">Pilih salah satu mapel di bawah untuk mulai belajar dan mengerjakan latihan soal.</p>
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
                        TKA Wajib
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

      {/* ================= MODAL POPUP UPGRADE PREMIUM ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-gray-100 relative animate-scale-up">
            
            {/* Tombol Close */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4 border border-amber-100 shadow-inner">
                <Crown className="w-8 h-8 fill-amber-500 text-amber-500" />
              </div>

              <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full mb-2">
                Eksklusif Akses Tanpa Batas
              </span>

              <h3 className="text-xl font-black text-gray-900 mb-2">
                Upgrade ke Akun Premium
              </h3>

              <p className="text-xs text-gray-500 leading-relaxed mb-6">
                Nikmati akses penuh ke seluruh bank soal eksklusif, pembahasan mendalam tanpa jeda, serta simulasi ujian TKA prioritas tinggi.
              </p>

              <div className="w-full bg-slate-50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-2.5 mb-6 text-left">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Akses Seluruh Modul Mata Pelajaran</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Analisis Grafik Skor &amp; Riwayat Lengkap</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Dukungan Prioritas Konsultasi Belajar</span>
                </div>
              </div>

              {/* Tombol Aksi WhatsApp */}
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl text-xs font-bold transition cursor-pointer"
                >
                  Nanti Saja
                </button>
                <button
                  onClick={handleWhatsAppCheckout}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Beli via WhatsApp</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </main>
  )
}