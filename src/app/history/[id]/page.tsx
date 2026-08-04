'use client'

import { use, useEffect, useState } from 'react'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-purple-600 font-semibold animate-pulse">
        Memuat detail pembahasan...
      </div>
    )
  }

  if (!historyData) {
    return (
      <main className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center max-w-md w-full flex flex-col gap-4">
          <h1 className="text-xl font-bold text-gray-900">Data Tidak Ditemukan</h1>
          <p className="text-sm text-gray-500">Riwayat ujian ini tidak ditemukan atau telah dihapus.</p>
          <button
            onClick={() => router.push('/history')}
            className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition"
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
    <main className="min-h-screen bg-gray-50 p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-4xl flex flex-col gap-6">
        
        {/* Header Info */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider block mb-0.5">Pembahasan Ujian</span>
            <h1 className="text-xl font-bold text-gray-900">{historyData.subjects?.name || 'Mata Pelajaran'}</h1>
            <span className="text-xs text-gray-400 mt-1 block">Dikerjakan pada: {formattedDate}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center px-4 py-2 bg-purple-50 border border-purple-100 rounded-2xl">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Nilai Akhir</span>
              <span className="text-xl font-extrabold text-purple-600">{historyData.score}</span>
            </div>
            <button
              onClick={() => router.push('/history')}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition"
            >
              &larr; Kembali
            </button>
          </div>
        </div>

        {/* Daftar Soal & Pembahasan */}
        <div className="flex flex-col gap-4">
          {historyData.answers_detail.map((item, index) => {
            return (
              <div 
                key={index}
                className={`bg-white rounded-3xl p-6 md:p-8 shadow-sm border flex flex-col gap-6 ${
                  item.is_correct ? 'border-green-100' : 'border-red-100'
                }`}
              >
                {/* Status Badge & Nomor */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-gray-100 text-gray-700 font-bold text-xs flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                      {item.question_type === 'multiple_choice' && 'Pilihan Ganda'}
                      {item.question_type === 'complex_multiple_choice' && 'PG Kompleks'}
                      {item.question_type === 'true_false_matrix' && 'Matriks Benar / Salah'}
                    </span>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    item.is_correct 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {item.is_correct ? 'Benar ✓' : 'Salah ✕'}
                  </span>
                </div>

                {/* Teks Pertanyaan */}
                <div className="text-base font-semibold text-gray-900">
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

                      let styleClass = 'bg-white border-gray-200 text-gray-700'
                      if (isRealCorrect) {
                        styleClass = 'bg-green-50 border-green-300 text-green-900 font-bold'
                      } else if (isUserChosen && !isRealCorrect) {
                        styleClass = 'bg-red-50 border-red-300 text-red-900 font-bold'
                      }

                      return (
                        <div key={key} className={`flex items-center gap-3 p-3.5 rounded-2xl border text-sm ${styleClass}`}>
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                            isRealCorrect ? 'bg-green-600 text-white' : isUserChosen ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {key}
                          </span>
                          <div className="text-sm flex-1 flex items-center">
                            <MathText content={val as string} inline={true} />
                          </div>
                          {isRealCorrect && <span className="text-xs font-semibold text-green-700 ml-auto">Kunci Jawaban</span>}
                          {isUserChosen && !isRealCorrect && <span className="text-xs font-semibold text-red-700 ml-auto">Pilihan Anda</span>}
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
                        <div key={stKey} className="p-3.5 rounded-2xl border border-gray-200 bg-gray-50/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-sm">
                          <div className="text-gray-800 font-medium flex-1">
                            <MathText content={stText as string} />
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="text-gray-500">
                              Jawaban Anda: <strong className={userChoice === realChoice ? 'text-green-600' : 'text-red-600'}>{userChoice}</strong>
                            </span>
                            <span className="text-gray-500">
                              Kunci: <strong className="text-green-600">{realChoice}</strong>
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Kotak Pembahasan (Explanation) */}
                {item.explanation && (
                <div className="bg-purple-50/60 border border-purple-100 rounded-2xl p-4 flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Pembahasan:</span>
                    <div className="text-sm text-gray-700 leading-relaxed">
                    <MathText content={item.explanation} />
                    </div>
                </div>
                )}

              </div>
            )
          })}
        </div>

      </div>
    </main>
  )
}