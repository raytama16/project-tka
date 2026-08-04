'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

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
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    setLoading(true)

    // Ambil user yang sedang login
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Silakan login terlebih dahulu.')
      router.push('/login')
      return
    }

    // Ambil data exam_history di-join dengan tabel subjects (mengambil kolom 'name')
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-purple-600 font-semibold animate-pulse">
        Memuat riwayat ujian...
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-3xl flex flex-col gap-6">
        
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider block mb-0.5">Aktivitas Belajar</span>
            <h1 className="text-xl font-bold text-gray-900">Riwayat Ujian (Exam History)</h1>
          </div>
          <button
            onClick={() => router.push('/subjects')}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition"
          >
            Daftar Mapel
          </button>
        </div>

        {/* List Riwayat */}
        {historyList.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 text-center flex flex-col items-center gap-4">
            <p className="text-sm text-gray-500">Anda belum pernah menyelesaikan ujian apapun.</p>
            <button
              onClick={() => router.push('/subjects')}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Mulai Ujian Sekarang
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {historyList.map(item => {
              const formattedDate = new Date(item.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })

              return (
                <div 
                  key={item.id}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between gap-4 transition hover:border-purple-200"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-extrabold border shrink-0 ${
                      item.score >= 75 
                        ? 'bg-green-50 text-green-700 border-green-100' 
                        : item.score >= 50 
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-100' 
                        : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {item.score}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900">
                        {item.subjects?.name || 'Mata Pelajaran Dihapus'}
                      </h2>
                      <span className="text-xs text-gray-400 mt-0.5 block">
                        Dikerjakan pada: {formattedDate}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push(`/history/${item.id}`)}
                    className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold transition border border-purple-100 shrink-0"
                  >
                    Lihat Pembahasan &rarr;
                  </button>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </main>
  )
}