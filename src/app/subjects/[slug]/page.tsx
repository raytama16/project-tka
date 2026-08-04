'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

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
  
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const slug = params.slug as string

  useEffect(() => {
    async function fetchSubject() {
      const { data: subjectData, error: subjectError } = await supabase
        .from('subjects')
        .select('*')
        .eq('slug', slug)
        .single()

      if (subjectError || !subjectData) {
        router.push('/dashboard')
        return
      }

      setSubject(subjectData)
      setLoading(false)
    }

    if (slug) {
      fetchSubject()
    }
  }, [slug, supabase, router])

  // Fungsi pengecekan sebelum masuk ke halaman exam
  const handleExamClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    if (!subject) return

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
      // Jika sudah pernah exam, tampilkan pop-up
      setShowExamConfirm(true)
    } else {
      // Jika belum pernah, langsung masuk ke halaman exam
      router.push(`/subjects/${slug}/exam`)
    }
  }

  // Jika user klik "Oke" pada pop-up konfirmasi
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-blue-600 font-semibold animate-pulse">Memuat menu mapel...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4 md:p-8 relative">
      
      {/* Pop-up Konfirmasi Jika Sudah Pernah Exam */}
      {showExamConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-xl border border-gray-100 flex flex-col gap-4 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-100">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Perhatian</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Anda sudah pernah melakukan exam. Jika Anda ingin melakukan exam lagi, maka data history Anda sebelumnya akan terhapus.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowExamConfirm(false)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmExam}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                Oke, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Container Putih Besar di Tengah */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 flex flex-col">
        
        {/* Tombol Kembali */}
        <div className="mb-6">
          <Link 
            href="/mapel-tka" 
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 transition"
          >
            &larr; Kembali
          </Link>
        </div>

        {/* Grid 3 Card Menu Utama */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* 1. Modul (Materi) */}
          <Link
            href={`/subjects/${slug}/materials`}
            className="bg-blue-50/50 hover:bg-blue-50 border border-blue-100 hover:border-blue-300 p-6 rounded-2xl transition-all duration-200 flex flex-col justify-between group shadow-sm"
          >
            <div>
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Modul (Materi)</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Pelajari rangkuman rumus, konsep, dan materi {subject?.name}.
              </p>
            </div>
          </Link>

          {/* 2. Latihan Soal (Kuis) */}
          <Link
            href={`/subjects/${slug}/practice`}
            className="bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100 hover:border-emerald-300 p-6 rounded-2xl transition-all duration-200 flex flex-col justify-between group shadow-sm"
          >
            <div>
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Latihan Soal (Kuis)</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Uji pemahamanmu pada setiap materi untuk mata pelajaran {subject?.name}.
              </p>
            </div>
          </Link>

          {/* 3. Tryout (Simulasi) - Diberikan Handler Pengecekan Exam */}
          <Link
            href={`/subjects/${slug}/exam`}
            onClick={handleExamClick}
            className="bg-amber-50/50 hover:bg-amber-50 border border-amber-100 hover:border-amber-300 p-6 rounded-2xl transition-all duration-200 flex flex-col justify-between group shadow-sm relative"
          >
            {checkingExam && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-xs rounded-2xl flex items-center justify-center">
                <span className="text-xs font-bold text-amber-700 animate-pulse">Memeriksa data...</span>
              </div>
            )}
            <div>
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Exam (Simulasi)</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Simulasikan ujian TKA penuh untuk {subject?.name} dengan batas waktu 90 menit.
              </p>
            </div>
          </Link>

        </div>

        {/* Footer Hak Cipta di Bawah Card */}
        <div className="pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500 font-medium">
            &copy; 2026 TKA Master &middot; Hak Cipta Dilindungi Undang-Undang
          </p>
        </div>

      </div>
    </main>
  )
}