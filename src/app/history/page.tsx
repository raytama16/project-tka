'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { 
  History, 
  Award, 
  BookOpen, 
  ArrowRight, 
  Search, 
  Filter, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Clock,
  RotateCcw,
  Sparkles,
  BarChart3,
  ShieldCheck,
  ChevronRight
} from 'lucide-react'

type ExamHistoryItem = {
  id: string
  score: number
  created_at: string
  subjects: {
    name: string
  } | null
}

export default function ExamHistoryPage() {
  const [historyList, setHistoryList] = useState<ExamHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pass' | 'warning' | 'fail'>('all')
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    setLoading(true)

    // 1. Ambil user yang sedang login
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Silakan login terlebih dahulu.')
      router.push('/login')
      return
    }

    // 2. Ambil data exam_history di-join dengan tabel subjects
    const { data, error } = await supabase
      .from('exam_history')
      .select(`
        id,
        score,
        created_at,
        subjects (
          name
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setHistoryList(data as any)
    } else {
      console.error('Gagal memuat riwayat ujian:', error)
    }

    setLoading(false)
  }

  // Statistik Ringkasan Performa Ujian
  const stats = useMemo(() => {
    const totalExams = historyList.length
    if (totalExams === 0) return { totalExams: 0, avgScore: 0, passCount: 0, highestScore: 0 }

    const totalScore = historyList.reduce((acc, curr) => acc + (curr.score || 0), 0)
    const avgScore = Math.round(totalScore / totalExams)
    const passCount = historyList.filter(item => item.score >= 75).length
    const highestScore = Math.max(...historyList.map(item => item.score || 0))

    return { totalExams, avgScore, passCount, highestScore }
  }, [historyList])

  // Filter & Pencarian Riwayat Ujian
  const filteredHistory = useMemo(() => {
    return historyList.filter(item => {
      const subjectName = item.subjects?.name?.toLowerCase() || ''
      const matchesSearch = subjectName.includes(searchQuery.toLowerCase())

      if (selectedFilter === 'pass') return matchesSearch && item.score >= 75
      if (selectedFilter === 'warning') return matchesSearch && item.score >= 50 && item.score < 75
      if (selectedFilter === 'fail') return matchesSearch && item.score < 50
      return matchesSearch
    })
  }, [historyList, searchQuery, selectedFilter])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3 dark:bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-blue-600 font-extrabold text-xs tracking-wider uppercase animate-pulse">Memuat Riwayat Ujian...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 text-gray-900 dark:bg-slate-50 dark:text-gray-900 selection:bg-blue-600 selection:text-white pb-24">
      
      {/* ================= NAVBAR TERPISAH ================= */}
      <Navbar />

      {/* ================= CONTAINER UTAMA ================= */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8">
        
        {/* ================= HEADER BANNER ================= */}
        <div className="relative bg-linear-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-8 md:p-10 text-white shadow-xl shadow-blue-500/10 mb-8 overflow-hidden">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 right-20 w-48 h-48 bg-purple-400/20 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full text-blue-100 text-xs font-bold mb-3 border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>Arsip Evaluasi Akademik</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-2">
                Riwayat Ujian &amp; Skor 📊
              </h1>
              <p className="text-blue-100 text-xs md:text-sm leading-relaxed max-w-xl">
                Pantau perkembangan nilai latihan soal TKA-mu dari waktu ke waktu. Analisis kembali pembahasan jawaban untuk hasil ujian yang lebih maksimal.
              </p>
            </div>

            <button
              onClick={() => router.push('/mapel-tka')}
              className="bg-white text-blue-700 hover:bg-blue-50 px-5 py-3 rounded-2xl text-xs font-black transition shadow-md flex items-center gap-2 cursor-pointer shrink-0"
            >
              <BookOpen className="w-4 h-4" />
              <span>Pilih Mapel Lain</span>
            </button>
          </div>
        </div>

        {/* ================= STATISTIK KARTU RINGKASAN ================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between dark:bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Total Tes</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>
            <span className="text-2xl font-black text-gray-900">{stats.totalExams}</span>
            <span className="text-[11px] text-gray-500 mt-1">Ujian dikerjakan</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between dark:bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Rata-rata Skor</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <span className="text-2xl font-black text-indigo-600">{stats.avgScore}</span>
            <span className="text-[11px] text-gray-500 mt-1">Skor keseluruhan</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between dark:bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Skor Tertinggi</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <span className="text-2xl font-black text-emerald-600">{stats.highestScore}</span>
            <span className="text-[11px] text-gray-500 mt-1">Pencapaian terbaik</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between dark:bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Lulus Kriteria</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <span className="text-2xl font-black text-purple-600">{stats.passCount}</span>
            <span className="text-[11px] text-gray-500 mt-1">Skor &ge; 75</span>
          </div>

        </div>

        {/* ================= FILTER & SEARCH BAR ================= */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4 dark:bg-white">
          
          {/* Input Pencarian */}
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan nama mapel..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-2xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Tombol Kategori Filter */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedFilter === 'all' 
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Semua ({historyList.length})
            </button>
            <button
              onClick={() => setSelectedFilter('pass')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedFilter === 'pass' 
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20' 
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Lulus (&ge; 75)
            </button>
            <button
              onClick={() => setSelectedFilter('warning')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedFilter === 'warning' 
                  ? 'bg-amber-600 text-white shadow-sm shadow-amber-500/20' 
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              Cukup (50-74)
            </button>
            <button
              onClick={() => setSelectedFilter('fail')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedFilter === 'fail' 
                  ? 'bg-rose-600 text-white shadow-sm shadow-rose-500/20' 
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              Remidi (&lt; 50)
            </button>
          </div>

        </div>

        {/* ================= DAFTAR RIWAYAT UJIAN ================= */}
        {filteredHistory.length === 0 ? (
          <div className="bg-white p-16 rounded-3xl border border-gray-100 text-center flex flex-col items-center justify-center gap-3 shadow-sm dark:bg-white">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mb-1">
              <History className="w-8 h-8" />
            </div>
            <h3 className="text-base font-black text-gray-800">Tidak Ada Riwayat Ujian</h3>
            <p className="text-xs text-gray-500 max-w-sm mb-4">
              {historyList.length === 0 
                ? 'Kamu belum pernah menyelesaikan ujian apapun di platform ini. Yuk mulai latihan soal pertamamu!'
                : 'Tidak ada riwayat ujian yang cocok dengan kriteria pencarian atau filter yang kamu pilih.'}
            </p>
            {historyList.length === 0 && (
              <button
                onClick={() => router.push('/subjects')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-extrabold transition shadow-md shadow-blue-500/20 flex items-center gap-2"
              >
                <span>Mulai Ujian Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredHistory.map(item => {
              const formattedDate = new Date(item.created_at).toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })

              const isPass = item.score >= 75
              const isWarning = item.score >= 50 && item.score < 75

              return (
                <div 
                  key={item.id}
                  className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition hover:shadow-md hover:border-blue-200 dark:bg-white"
                >
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    {/* Kotak Nilai Skor */}
                    <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border shrink-0 shadow-xs ${
                      isPass 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : isWarning 
                        ? 'bg-amber-50 text-amber-700 border-amber-200' 
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      <span className="text-lg font-black leading-none">{item.score}</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider mt-1 opacity-80">Skor</span>
                    </div>

                    {/* Informasi Mapel & Waktu */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-base font-black text-gray-900 tracking-tight">
                          {item.subjects?.name || 'Mata Pelajaran Dihapus'}
                        </h2>
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          isPass ? 'bg-emerald-100 text-emerald-700' : isWarning ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {isPass ? 'Lulus' : isWarning ? 'Cukup' : 'Remidi'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{formattedDate}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tombol Lihat Pembahasan */}
                  <button
                    onClick={() => router.push(`/history/${item.id}`)}
                    className="w-full md:w-auto px-5 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-2xl text-xs font-black transition border border-blue-100 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                  >
                    <span>Lihat Pembahasan</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* ================= FOOTER INFORMASI ================= */}
        <div className="mt-16 pt-8 border-t border-gray-200/60 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-700">Palisademy TKA System</span>
            <span>&bull;</span>
            <span>Arsip Ujian &amp; Analisis Belajar</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} All rights reserved.
          </div>
        </div>

      </div>
    </main>
  )
}