'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  BookOpen,
  CheckSquare,
  Zap,
  Lock,
  Sparkles,
  X,
  MessageCircle,
  ArrowLeft,
  ShieldCheck,
  Clock,
  HelpCircle
} from 'lucide-react'

type Subject = {
  id: string
  name: string
  slug: string
}

export default function SubjectDetailPage() {
  const [subject, setSubject] = useState<Subject | null>(null)
  const [loading, setLoading] = useState(true)
  const [showExamConfirm, setShowExamConfirm] = useState(false)
  const [checkingExam, setCheckingExam] = useState(false)

  // State baru untuk sistem verifikasi akses premium Exam
  const [isPremium, setIsPremium] = useState(false)
  const [showExamLockModal, setShowExamLockModal] = useState(false)

  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const slug = params.slug as string

  useEffect(() => {
    async function fetchSubjectAndProfile() {
      setLoading(true)

      // 1. Cek status user login & status is_premium dari tabel profiles
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('is_premium')
          .eq('id', user.id)
          .single()

        if (profileData) {
          setIsPremium(!!profileData.is_premium)
        }
      }

      // 2. Ambil data Subject berdasarkan slug
      const { data: subjectData, error: subjectError } = await supabase
        .from('subjects')
        .select('*')
        .eq('slug', slug)
        .single()

      if (subjectError || !subjectData) {
        router.push('/mapel-tka')
        return
      }

      setSubject(subjectData)
      setLoading(false)
    }

    if (slug) {
      fetchSubjectAndProfile()
    }
  }, [slug, supabase, router])

  // Fungsi pengecekan sebelum masuk ke halaman exam (Mengecek Premium & Riwayat Exam)
  const handleExamClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    if (!subject) return

    // Jika user belum premium, cegah masuk dan tampilkan pop-up Lock WhatsApp
    if (!isPremium) {
      setShowExamLockModal(true)
      return
    }

    setCheckingExam(true)

    // 1. Ambil user yang sedang login
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    // 2. Cek apakah sudah ada history exam untuk subject dan user ini
    const { data: historyData, error } = await supabase
      .from('exam_history')
      .select('id')
      .eq('user_id', user.id)
      .eq('subject_id', subject.id)

    setCheckingExam(false)

    if (!error && historyData && historyData.length > 0) {
      // Jika sudah pernah exam, tampilkan pop-up konfirmasi reset history
      setShowExamConfirm(true)
    } else {
      // Jika belum pernah, langsung masuk ke halaman exam
      router.push(`/subjects/${slug}/exam`)
    }
  }

  // Jika user klik "Oke" pada pop-up konfirmasi reset riwayat exam
  const handleConfirmExam = async () => {
    if (!subject) return
    setShowExamConfirm(false)
    setCheckingExam(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // Hapus data history sebelumnya berdasarkan user_id dan subject_id
      await supabase
        .from('exam_history')
        .delete()
        .eq('user_id', user.id)
        .eq('subject_id', subject.id)
    }

    setCheckingExam(false)
    router.push(`/subjects/${slug}/exam`)
  }

  // Detail nomor WhatsApp admin
  const adminWhatsAppNumber = "6285792108262"
  const messageText = encodeURIComponent("Halo Admin, saya ingin berlangganan akun Premium Palisademy untuk membuka akses penuh ke menu Exam (Simulasi Ujian).")
  const whatsappUrl = `https://wa.me/${adminWhatsAppNumber}?text=${messageText}`

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-gray-950 gap-3 transition-colors">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 animate-bounce">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <p className="text-xs font-extrabold text-blue-600 dark:text-blue-400 tracking-wider uppercase">Memuat menu mata pelajaran...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-gray-100 flex items-center justify-center p-4 sm:p-6 md:p-12 relative font-sans selection:bg-blue-600 selection:text-white transition-colors duration-300">

      {/* ================= MODAL KONFIRMASI RESET HISTORY EXAM ================= */}
      {showExamConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 dark:border-gray-800 flex flex-col gap-4 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/60 dark:bg-amber-900/20 rounded-full blur-2xl pointer-events-none" />

            <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-100 dark:border-amber-900/50 shadow-inner">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <div>
              <span className="inline-block px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-extrabold text-[10px] rounded-full mb-2 border border-amber-100 dark:border-amber-900">
                Riwayat Ujian Ditemukan
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-gray-100 tracking-tight">Perhatian Ulang Ujian</h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-2 leading-relaxed">
                Anda sudah pernah melakukan exam untuk mata pelajaran ini. Memulai ujian baru akan menghapus data riwayat skor dan jawaban Anda sebelumnya.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowExamConfirm(false)}
                className="flex-1 py-3.5 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-300 rounded-2xl text-xs font-extrabold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmExam}
                className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-extrabold transition shadow-lg shadow-blue-500/25 cursor-pointer"
              >
                Oke, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL POP-UP LOCK EXAM (BELUM PREMIUM) ================= */}
      {showExamLockModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 dark:border-gray-800 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/60 dark:bg-amber-900/20 rounded-full blur-2xl pointer-events-none" />

            <button
              onClick={() => setShowExamLockModal(false)}
              className="absolute top-4 right-4 w-9 h-9 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-500 dark:text-gray-400 rounded-full flex items-center justify-center transition cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-orange-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-amber-500/25">
              <Lock className="w-8 h-8" />
            </div>

            <div className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[10px] font-extrabold px-3 py-1 rounded-full border border-amber-100 dark:border-amber-900 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fitur Khusus Akun Premium</span>
            </div>

            <h3 className="text-xl font-black text-slate-900 dark:text-gray-100 tracking-tight">
              Exam (Simulasi) Terkunci
            </h3>

            <p className="text-xs text-slate-500 dark:text-gray-400 mt-2 leading-relaxed">
              Simulasi ujian TKA penuh dengan batas waktu ketat ini eksklusif hanya untuk pengguna berstatus <strong className="text-slate-800 dark:text-gray-200">Premium</strong>. Upgrade sekarang untuk menguji kemampuanmu secara maksimal!
            </p>

            <div className="mt-8 flex flex-col gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>Langganan via Chat WhatsApp</span>
              </a>

              <button
                onClick={() => setShowExamLockModal(false)}
                className="w-full py-3 px-6 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-600 dark:text-gray-300 font-bold text-xs rounded-2xl transition cursor-pointer"
              >
                Nanti Saja
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= CONTAINER UTAMA ================= */}
      <div className="w-full max-w-5xl bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-gray-800 p-6 sm:p-10 md:p-12 flex flex-col relative overflow-hidden transition-colors">

        {/* Hiasan background tipis di pojok */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 dark:bg-blue-950/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header Navigasi & Informasi Mapel */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100 dark:border-gray-800 relative z-10">
          <div>
            <Link
              href="/mapel-tka"
              className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-600 dark:text-gray-300 bg-slate-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 px-4 py-2.5 rounded-2xl border border-slate-200/80 dark:border-gray-700 shadow-2xs transition-all mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Daftar Mata Pelajaran</span>
            </Link>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-gray-100 tracking-tight flex items-center gap-3">
              <span>{subject?.name}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-1">
              Pilih menu pembelajaran di bawah untuk mendalami materi, berlatih soal, atau mengambil simulasi ujian.
            </p>
          </div>

          {isPremium ? (
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-extrabold px-4 py-2.5 rounded-2xl shadow-md shadow-blue-500/20 flex items-center gap-2 shrink-0 self-start sm:self-center">
              <Sparkles className="w-4 h-4" />
              <span>Akun Premium Aktif</span>
            </div>
          ) : (
            <div className="bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/50 text-xs font-extrabold px-4 py-2.5 rounded-2xl flex items-center gap-2 shrink-0 self-start sm:self-center shadow-2xs">
              <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Akun Reguler (Free)</span>
            </div>
          )}
        </div>

        {/* ================= GRID 3 CARD MENU UTAMA ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 relative z-10">

          {/* 1. Modul (Materi) */}
          <Link
            href={`/subjects/${slug}/materials`}
            className="bg-gradient-to-b from-blue-50/60 dark:from-gray-800/60 to-white dark:to-gray-900 hover:from-blue-50 hover:to-blue-50/30 dark:hover:from-gray-800 dark:hover:to-gray-800/80 border border-blue-100 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700/60 p-6 sm:p-7 rounded-3xl transition-all duration-300 flex flex-col justify-between group shadow-2xs hover:shadow-xl hover:shadow-blue-500/5 dark:hover:shadow-none"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-2xs">
                <BookOpen className="w-7 h-7" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-extrabold text-blue-700 dark:text-blue-300 bg-blue-100/80 dark:bg-blue-950/80 px-2.5 py-0.5 rounded-full">
                  Teori & Konsep
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight">
                Modul (Materi)
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
                Pelajari rangkuman rumus lengkap, konsep mendalam, dan sub-materi interaktif untuk {subject?.name}.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-blue-100/60 dark:border-gray-800 flex items-center justify-between text-xs font-extrabold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
              <span>Buka Modul Materi</span>
              <span>&rarr;</span>
            </div>
          </Link>

          {/* 2. Latihan Soal (Kuis) */}
          <Link
            href={`/subjects/${slug}/practice`}
            className="bg-gradient-to-b from-emerald-50/60 dark:from-gray-800/60 to-white dark:to-gray-900 hover:from-emerald-50 hover:to-emerald-50/30 dark:hover:from-gray-800 dark:hover:to-gray-800/80 border border-emerald-100 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700/60 p-6 sm:p-7 rounded-3xl transition-all duration-300 flex flex-col justify-between group shadow-2xs hover:shadow-xl hover:shadow-emerald-500/5 dark:hover:shadow-none"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-2xs">
                <CheckSquare className="w-7 h-7" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full">
                  Bank Soal Bab
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-gray-100 mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors tracking-tight">
                Latihan Soal (Kuis)
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
                Uji pemahamanmu secara bertahap pada setiap bab latihan soal untuk mata pelajaran {subject?.name}.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-emerald-100/60 dark:border-gray-800 flex items-center justify-between text-xs font-extrabold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
              <span>Mulai Latihan</span>
              <span>&rarr;</span>
            </div>
          </Link>

          {/* 3. Tryout / Exam (Simulasi) - Dilindungi Status Premium & Pengecekan Riwayat */}
          <Link
            href={`/subjects/${slug}/exam`}
            onClick={handleExamClick}
            className={`bg-gradient-to-b ${isPremium 
              ? 'from-amber-50/60 dark:from-gray-800/60 hover:from-amber-50 dark:hover:from-gray-800 border-amber-100 dark:border-gray-800 hover:border-amber-300 dark:hover:border-amber-700/60 hover:shadow-amber-500/5' 
              : 'from-slate-50 dark:from-gray-800/40 hover:from-slate-100/80 dark:hover:from-gray-800 border-slate-200/80 dark:border-gray-800'} to-white dark:to-gray-900 p-6 sm:p-7 rounded-3xl transition-all duration-300 flex flex-col justify-between group shadow-2xs hover:shadow-xl relative overflow-hidden`}
          >
            {checkingExam && (
              <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xs rounded-3xl flex flex-col items-center justify-center z-20 gap-2">
                <div className="w-6 h-6 border-2 border-amber-600 dark:border-amber-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300 animate-pulse">Memeriksa status ujian...</span>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-2xs ${
                  isPremium
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white'
                    : 'bg-slate-200 dark:bg-gray-800 text-slate-500 dark:text-gray-400'
                }`}>
                  {isPremium ? <Zap className="w-7 h-7" /> : <Lock className="w-7 h-7 text-amber-600 dark:text-amber-400" />}
                </div>

                {!isPremium && (
                  <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-2xs">
                    <Lock className="w-3 h-3" /> Premium Only
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 90 Menit
                </span>
              </div>

              <h3 className="text-lg font-black text-slate-900 dark:text-gray-100 mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors tracking-tight">
                Exam (Simulasi)
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
                Simulasikan ujian TKA penuh dengan sistem penilaian akurat dan batasan waktu untuk {subject?.name}.
              </p>
            </div>

            <div className={`mt-6 pt-4 border-t flex items-center justify-between text-xs font-extrabold transition-transform ${
              isPremium 
                ? 'border-amber-100 dark:border-gray-800 text-amber-600 dark:text-amber-400 group-hover:translate-x-1' 
                : 'border-slate-200 dark:border-gray-800 text-slate-400 dark:text-gray-500'
            }`}>
              <span>{isPremium ? 'Mulai Simulasi Ujian' : 'Terkunci (Butuh Premium)'}</span>
              <span>{isPremium ? '→' : '🔒'}</span>
            </div>
          </Link>

        </div>

        {/* Bantuan / Info Box Tambahan di Bagian Bawah */}
        <div className="bg-slate-50 dark:bg-gray-800/40 border border-slate-100 dark:border-gray-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-gray-200">Butuh bantuan panduan belajar atau kendala akses?</h4>
              <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-0.5">Tim support kami siap membantu kendala teknis maupun aktivasi akun premium Anda.</p>
            </div>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-200 text-xs font-extrabold rounded-xl border border-slate-200 dark:border-gray-700 transition shadow-2xs flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600 fill-current" />
            <span>Hubungi Admin</span>
          </a>
        </div>

        {/* Footer Hak Cipta */}
        <div className="pt-8 mt-6 border-t border-slate-100 dark:border-gray-800 text-center relative z-10">
          <p className="text-xs text-slate-400 dark:text-gray-500 font-medium flex items-center justify-center gap-1.5">
            <span>&copy; 2026 TKA Master</span>
            <span>&middot;</span>
            <span className="inline-flex items-center gap-1 text-slate-500 dark:text-gray-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Hak Cipta Dilindungi Undang-Undang
            </span>
          </p>
        </div>

      </div>
    </main>
  )
}