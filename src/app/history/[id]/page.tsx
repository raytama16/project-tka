'use client'

import { use, useEffect, useState, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import MathText from '@/components/MathText'

type DetailItem = {
  question_id: string
  question_type: 'multiple_choice' | 'complex_multiple_choice' | 'true_false_matrix'
  question_text: string
  options: any
  user_answer: any
  correct_answer: any
  is_correct: boolean
  explanation: string
}

type ExamHistoryDetail = {
  id: string
  score: number
  created_at: string
  subjects: {
    name: string
  } | null
  answers_detail: DetailItem[]
}

export default function ExamDetailHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const historyId = resolvedParams.id
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [historyData, setHistoryData] = useState<ExamHistoryDetail | null>(null)
  
  // Fitur Filter & Pencarian Tambahan (Interaktif)
  const [filterType, setFilterType] = useState<'all' | 'correct' | 'incorrect'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchHistoryDetail()
  }, [historyId])

  const fetchHistoryDetail = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('exam_history')
      .select(`
        id,
        score,
        created_at,
        answers_detail,
        subjects (
          name
        )
      `)
      .eq('id', historyId)
      .single()

    if (!error && data) {
      setHistoryData(data as any)
    } else {
      console.error('Gagal memuat detail riwayat:', error)
    }

    setLoading(false)
  }

  // Statistik ringkas untuk ringkasan performa
  const stats = useMemo(() => {
    if (!historyData?.answers_detail) return { total: 0, correct: 0, incorrect: 0 }
    const total = historyData.answers_detail.length
    const correct = historyData.answers_detail.filter(item => item.is_correct).length
    return {
      total,
      correct,
      incorrect: total - correct
    }
  }, [historyData])

  // Filter daftar soal berdasarkan status dan kata kunci pencarian
  const filteredQuestions = useMemo(() => {
    if (!historyData?.answers_detail) return []
    return historyData.answers_detail.filter((item, index) => {
      // Filter Status (Semua / Benar / Salah)
      if (filterType === 'correct' && !item.is_correct) return false
      if (filterType === 'incorrect' && item.is_correct) return false

      // Filter Pencarian Teks Soal / Nomor
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase()
        const matchText = item.question_text?.toLowerCase().includes(query)
        const matchNumber = (index + 1).toString() === query
        if (!matchText && !matchNumber) return false
      }

      return true
    })
  }, [historyData, filterType, searchTerm])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center text-purple-600 dark:text-purple-400 font-semibold animate-pulse transition-colors">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Memuat detail pembahasan ujian...</span>
        </div>
      </div>
    )
  }

  if (!historyData) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 flex items-center justify-center transition-colors">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 text-center max-w-md w-full flex flex-col gap-4">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-950/50 text-red-500 rounded-2xl mx-auto flex items-center justify-center text-2xl font-bold">
            ✕
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Data Tidak Ditemukan</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Riwayat ujian ini tidak ditemukan atau telah dihapus dari sistem.</p>
          <button
            onClick={() => router.push('/history')}
            className="px-4 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition shadow-sm"
          >
            Kembali ke Riwayat
          </button>
        </div>
      </main>
    )
  }

  const formattedDate = new Date(historyData.created_at).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8 flex justify-center transition-colors">
      <div className="w-full max-w-4xl flex flex-col gap-6">
        
        {/* Header Info Banner */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900 rounded-full text-[11px] font-bold uppercase tracking-wider">
                Pembahasan & Analisis Ujian
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {historyData.subjects?.name || 'Mata Pelajaran'}
            </h1>
            <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
              <span>🕒 Dikerjakan pada: {formattedDate}</span>
            </span>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            <div className="text-center px-5 py-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900 rounded-2xl">
              <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Nilai Akhir</span>
              <span className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">{historyData.score}</span>
            </div>
            <button
              onClick={() => router.push('/history')}
              className="px-5 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl text-xs font-bold transition shadow-xs"
            >
              &larr; Kembali
            </button>
          </div>
        </div>

        {/* Panel Statistik & Filter Cepat Interaktif */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 block">Total Soal</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{stats.total} Soal</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
              📊
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 block">Jawaban Benar</span>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">{stats.correct} Soal</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400 flex items-center justify-center font-bold text-sm">
              ✓
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 block">Jawaban Salah</span>
              <span className="text-lg font-bold text-red-600 dark:text-red-400">{stats.incorrect} Soal</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-sm">
              ✕
            </div>
          </div>
        </div>

        {/* Bar Filter & Pencarian Soal */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                filterType === 'all' 
                  ? 'bg-purple-600 text-white shadow-sm' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Semua ({stats.total})
            </button>
            <button
              onClick={() => setFilterType('correct')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                filterType === 'correct' 
                  ? 'bg-green-600 text-white shadow-sm' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Benar ({stats.correct})
            </button>
            <button
              onClick={() => setFilterType('incorrect')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                filterType === 'incorrect' 
                  ? 'bg-red-600 text-white shadow-sm' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Salah ({stats.incorrect})
            </button>
          </div>

          <div className="w-full md:w-72">
            <input
              type="text"
              placeholder="Cari nomor atau teks soal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition"
            />
          </div>
        </div>

        {/* Daftar Soal & Pembahasan */}
        <div className="flex flex-col gap-4">
          {filteredQuestions.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 p-12 rounded-3xl border border-gray-100 dark:border-gray-800 text-center flex flex-col items-center gap-2">
              <span className="text-2xl">🔍</span>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tidak ada soal yang cocok dengan filter atau pencarian Anda.</p>
            </div>
          ) : (
            filteredQuestions.map((item, index) => {
              // Menemukan indeks asli dari soal sebelum difilter
              const originalIndex = historyData.answers_detail.findIndex(q => q.question_id === item.question_id)

              return (
                <div 
                  key={item.question_id || index}
                  className={`bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 shadow-sm border flex flex-col gap-6 transition-colors ${
                    item.is_correct ? 'border-green-100 dark:border-green-950/50' : 'border-red-100 dark:border-red-950/50'
                  }`}
                >
                  {/* Status Badge & Nomor Soal */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs flex items-center justify-center">
                        {originalIndex + 1}
                      </span>
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900">
                        {item.question_type === 'multiple_choice' && 'Pilihan Ganda'}
                        {item.question_type === 'complex_multiple_choice' && 'PG Kompleks'}
                        {item.question_type === 'true_false_matrix' && 'Matriks Benar / Salah'}
                      </span>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${
                      item.is_correct 
                        ? 'bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-900' 
                        : 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900'
                    }`}>
                      {item.is_correct ? 'Benar ✓' : 'Salah ✕'}
                    </span>
                  </div>

                  {/* Teks Pertanyaan */}
                  <div className="text-base font-semibold text-gray-900 dark:text-gray-100 leading-relaxed">
                    <MathText content={item.question_text} />
                  </div>

                  {/* Tampilan Opsi / Detail Jawaban Berdasarkan Tipe */}
                  {(item.question_type === 'multiple_choice' || item.question_type === 'complex_multiple_choice') && (
                    <div className="flex flex-col gap-2.5">
                      {Object.entries(item.options || {}).map(([key, val]) => {
                        const isUserChosen = item.question_type === 'multiple_choice'
                          ? item.user_answer === key
                          : (Array.isArray(item.user_answer) && item.user_answer.includes(key))

                        const isRealCorrect = item.question_type === 'multiple_choice'
                          ? item.correct_answer === key
                          : (Array.isArray(item.correct_answer) && item.correct_answer.includes(key))

                        let styleClass = 'bg-white dark:bg-gray-800/40 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'
                        if (isRealCorrect) {
                          styleClass = 'bg-green-50 dark:bg-green-950/40 border-green-300 dark:border-green-800 text-green-900 dark:text-green-200 font-bold'
                        } else if (isUserChosen && !isRealCorrect) {
                          styleClass = 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 font-bold'
                        }

                        return (
                          <div key={key} className={`flex items-center gap-3 p-3.5 rounded-2xl border text-sm transition ${styleClass}`}>
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                              isRealCorrect ? 'bg-green-600 text-white' : isUserChosen ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                            }`}>
                              {key}
                            </span>
                            <div className="text-sm flex-1 flex items-center">
                              <MathText content={val as string} inline={true} />
                            </div>
                            {isRealCorrect && <span className="text-xs font-semibold text-green-700 dark:text-green-400 ml-auto shrink-0">Kunci Jawaban</span>}
                            {isUserChosen && !isRealCorrect && <span className="text-xs font-semibold text-red-700 dark:text-red-400 ml-auto shrink-0">Pilihan Anda</span>}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {item.question_type === 'true_false_matrix' && (
                    <div className="flex flex-col gap-2.5">
                      {Object.entries(item.options || {}).map(([stKey, stText]) => {
                        const userChoice = (item.user_answer || {})[stKey] || '-'
                        const realChoice = (item.correct_answer || {})[stKey] || '-'
                        const isRowCorrect = userChoice === realChoice

                        return (
                          <div key={stKey} className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-sm">
                            <div className="text-gray-800 dark:text-gray-200 font-medium flex-1">
                              <MathText content={stText as string} />
                            </div>
                            <div className="flex items-center gap-4 text-xs shrink-0">
                              <span className="text-gray-500 dark:text-gray-400">
                                Jawaban Anda: <strong className={isRowCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>{userChoice}</strong>
                              </span>
                              <span className="text-gray-500 dark:text-gray-400">
                                Kunci: <strong className="text-green-600 dark:text-green-400">{realChoice}</strong>
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Kotak Pembahasan (Explanation) */}
                  {item.explanation && (
                    <div className="bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 rounded-2xl p-4 md:p-5 flex flex-col gap-2">
                      <span className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                        <span>💡</span> Pembahasan:
                      </span>
                      <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        <MathText content={item.explanation} />
                      </div>
                    </div>
                  )}

                </div>
              )
            })
          )}
        </div>

      </div>
    </main>
  )
}