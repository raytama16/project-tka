'use client'

import { use, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import MathText from '@/components/MathText'
import parse from 'html-react-parser'
import { InlineMath } from 'react-katex'

type Question = {
  id?: string
  question_id?: string
  subject_id: string
  material_id: string | null
  type: 'practice' | 'exam'
  question_type: 'multiple_choice' | 'complex_multiple_choice' | 'true_false_matrix'
  question_text: string
  options: any
  correct_answer: any
  explanation: string
}

export default function StudentExamPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  const slug = resolvedParams.slug
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [subjectId, setSubjectId] = useState<string | null>(null)
  const [subjectTitle, setSubjectTitle] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  // Menyimpan jawaban siswa: { [questionId]: answerValue }
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({})
  const [submitting, setSubmitting] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [scoreResult, setScoreResult] = useState<{ totalCorrect: number; totalScore: number } | null>(null)

  useEffect(() => {
    console.log("URL Slug / Identifier diterima:", slug)
    fetchExamData()
  }, [slug])

  const renderMathText = (text: string) => {
          if (!text) return null
          const parts = text.split(/(\$.*?\$)/g)
          return (
              <span>
                 {parts.map((part, index) => {
                  // Kalau bagian ini adalah rumus LaTeX ($...$)
                  if (part.startsWith('$') && part.endsWith('$')) {
                      const mathContent = part.slice(1, -1)
                      return <InlineMath key={index} math={mathContent} />
                  }
                  
                  // Kalau bukan LaTeX, parsing teks biasa YANG MUNGKIN ADA TAG HTML-NYA (<p>, <br>, dll)
                  return <span key={index}>{parse(part)}</span>
              })}
              </span>
          )
      }
      
  const fetchExamData = async () => {
    setLoading(true)
    let foundSubject = null

    // 1. Coba cari berdasarkan kolom 'slug'
    let { data: subjBySlug } = await supabase
      .from('subjects')
      .select('id, name, slug')
      .eq('slug', slug.toLowerCase())
      .maybeSingle()

    if (subjBySlug) {
      foundSubject = subjBySlug
    } else {
      // 2. Coba cari berdasarkan kolom 'id' (jika berupa UUID)
      let { data: subjById } = await supabase
        .from('subjects')
        .select('id, name, slug')
        .eq('id', slug)
        .maybeSingle()

      if (subjById) {
        foundSubject = subjById
      } else {
        // 3. Coba cari berdasarkan kecocokan teks pada kolom 'name'
        const cleanQuery = slug.replace(/-/g, ' ')
        let { data: subjByName } = await supabase
          .from('subjects')
          .select('id, name, slug')
          .ilike('name', `%${cleanQuery}%`)
          .maybeSingle()

        if (subjByName) foundSubject = subjByName
      }
    }

    console.log("Hasil pencarian mata pelajaran:", foundSubject)

    if (!foundSubject) {
      alert(`Mata pelajaran dengan identifier "${slug}" tidak ditemukan di database!`)
      setLoading(false)
      return
    }

    setSubjectId(foundSubject.id)
    setSubjectTitle(foundSubject.name)

    // Cek user yang sedang login & hapus data history exam lama jika ada
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('exam_history')
        .delete()
        .eq('user_id', user.id)
        .eq('subject_id', foundSubject.id)
    }

    await loadQuestions(foundSubject.id)

    setLoading(false)
  }

  const loadQuestions = async (subId: string) => {
    const { data: qData, error } = await supabase
      .from('questions')
      .select('*')
      .eq('subject_id', subId)
      .eq('type', 'exam')

    if (!error && qData) {
      console.log("Soal exam berhasil dimuat:", qData.length)
      setQuestions(qData)
    } else {
      console.error("Gagal memuat soal exam:", error)
    }
  }

  const handleAnswerChange = (qId: string, qType: string, val: any, optionKey?: string) => {
    if (qType === 'multiple_choice') {
      setUserAnswers(prev => ({ ...prev, [qId]: val }))
    } else if (qType === 'complex_multiple_choice') {
      const currentSelected = userAnswers[qId] || []
      if (currentSelected.includes(val)) {
        setUserAnswers(prev => ({ ...prev, [qId]: currentSelected.filter((item: string) => item !== val) }))
      } else {
        setUserAnswers(prev => ({ ...prev, [qId]: [...currentSelected, val] }))
      }
    } else if (qType === 'true_false_matrix') {
      const currentMatrix = userAnswers[qId] || {}
      setUserAnswers(prev => ({
        ...prev,
        [qId]: { ...currentMatrix, [optionKey!]: val }
      }))
    }
  }

  // Kalkulasi & Simpan Hasil Ujian ke exam_history (Dengan Bobot Poin & Desimal)
  const handleSubmitExam = async () => {
    if (!confirm('Apakah Anda yakin ingin menyelesaikan dan mengumpulkan ujian ini?')) return

    setSubmitting(true)

    // Ambil data user yang sedang login saat ini
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Sesi Anda telah berakhir atau belum login. Silakan login kembali.')
      setSubmitting(false)
      return
    }

    let totalPossiblePoints = 0
    let earnedPoints = 0
    let correctQuestionCount = 0 
    const answersDetailList: any[] = []

    questions.forEach(q => {
      const qId = q.id || q.question_id!
      const studentAns = userAnswers[qId] || null
      const realAns = q.correct_answer
      let isCorrect = false
      let questionScore = 0
      let maxQuestionScore = 1

      if (q.question_type === 'multiple_choice') {
        maxQuestionScore = 1
        totalPossiblePoints += maxQuestionScore
        if (studentAns === realAns) {
          isCorrect = true
          earnedPoints += 1
          questionScore = 1
        }
      } 
      else if (q.question_type === 'complex_multiple_choice') {
        maxQuestionScore = 1
        totalPossiblePoints += maxQuestionScore
        if (Array.isArray(studentAns) && Array.isArray(realAns)) {
          const sortedStudent = [...studentAns].sort()
          const sortedReal = [...realAns].sort()
          if (JSON.stringify(sortedStudent) === JSON.stringify(sortedReal)) {
            isCorrect = true
            earnedPoints += 1
            questionScore = 1
          }
        }
      } 
      else if (q.question_type === 'true_false_matrix') {
        const statements = Object.keys(realAns || {})
        const subWeight = 1 
        let correctSubCount = 0

        maxQuestionScore = statements.length * subWeight
        totalPossiblePoints += maxQuestionScore

        if (typeof studentAns === 'object' && studentAns !== null) {
          statements.forEach(k => {
            if (studentAns[k] === realAns[k]) {
              correctSubCount++
            }
          })
        }

        questionScore = correctSubCount * subWeight
        earnedPoints += questionScore

        if (correctSubCount === statements.length) {
          isCorrect = true
        }
      }

      if (isCorrect) correctQuestionCount++

      // Susun detail per soal untuk disimpan ke JSONB
      answersDetailList.push({
        question_id: qId,
        question_type: q.question_type,
        question_text: q.question_text,
        options: q.options,
        user_answer: studentAns,
        correct_answer: realAns,
        is_correct: isCorrect,
        score_obtained: questionScore,
        max_score: maxQuestionScore,
        explanation: q.explanation
      })
    })

    // Hitung skala nilai akhir 0 - 100 dengan dukungan 2 digit desimal (koma)
    const rawScore = totalPossiblePoints > 0 ? (earnedPoints / totalPossiblePoints) * 100 : 0
    const finalScore = parseFloat(rawScore.toFixed(2))

    // Simpan ke tabel exam_history di Supabase
    const { error: insertError } = await supabase
      .from('exam_history')
      .insert({
        user_id: user.id,
        subject_id: subjectId,
        score: finalScore,
        answers_detail: answersDetailList
      })

    if (insertError) {
      console.error('Gagal menyimpan exam history:', insertError.message)
      alert('Terjadi kesalahan saat menyimpan riwayat ujian ke database.')
      setSubmitting(false)
      return
    }

    setScoreResult({ totalCorrect: correctQuestionCount, totalScore: finalScore })
    setIsFinished(true)
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-purple-600 font-semibold animate-pulse">
        Mempersiapkan sesi ujian...
      </div>
    )
  }

  if (!subjectId || questions.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center max-w-md w-full flex flex-col gap-4">
          <h1 className="text-xl font-bold text-gray-900">{subjectTitle || 'Ujian'}</h1>
          <p className="text-sm text-gray-500">
            {!subjectId 
              ? `Mata pelajaran dengan identifier "${slug}" tidak ditemukan di database.` 
              : 'Belum ada soal ujian (exam) yang tersedia untuk mata pelajaran ini.'}
          </p>
          <button
            onClick={() => router.push('/subjects')}
            className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition"
          >
            Kembali ke Daftar Mapel
          </button>
        </div>
      </main>
    )
  }

  if (isFinished && scoreResult) {
    return (
      <main className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center gap-6">
          <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center text-2xl font-extrabold text-purple-600 border border-purple-100">
            {scoreResult.totalScore}
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Hasil Ujian &middot; {subjectTitle}</span>
            <h1 className="text-2xl font-bold text-gray-900">Ujian Telah Selesai!</h1>
            <p className="text-sm text-gray-500 mt-2">
              Anda menyelesaikan soal dengan rincian benar penuh sebanyak <strong className="text-purple-600">{scoreResult.totalCorrect}</strong> dari total <strong className="text-gray-900">{questions.length}</strong> soal (Penilaian berbasis bobot poin). Riwayat & pembahasan telah disimpan.
            </p>
          </div>
          <div className="flex gap-3 w-full pt-4 border-t border-gray-100">
            <button
              onClick={() => router.push('/subjects')}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition"
            >
              Daftar Mapel
            </button>
            <button
              onClick={() => router.push('/history')}
              className="flex-1 py-3 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition shadow-sm"
            >
              Cek Pembahasan
            </button>
          </div>
        </div>
      </main>
    )
  }

  const currentQ = questions[currentIndex]
  const currentQId = currentQ.id || currentQ.question_id!

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-4xl flex flex-col gap-6">
        
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider block mb-0.5">Sesi Ujian TKA</span>
            <h1 className="text-xl font-bold text-gray-900">{subjectTitle}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-purple-50 border border-purple-100 rounded-xl text-xs font-bold text-purple-700">
              Soal {currentIndex + 1} dari {questions.length}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-3 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-6">
              
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                  {currentQ.question_type === 'multiple_choice' && 'Pilihan Ganda'}
                  {currentQ.question_type === 'complex_multiple_choice' && 'PG Kompleks (Banyak Jawaban)'}
                  {currentQ.question_type === 'true_false_matrix' && 'Matriks Benar / Salah'}
                </span>
              </div>

              <div className="text-base font-semibold text-gray-900">
                {/* <MathText content={currentQ.question_text} /> */}
                {renderMathText(currentQ.question_text)}
              </div>

              {(currentQ.question_type === 'multiple_choice' || currentQ.question_type === 'complex_multiple_choice') && (
                <div className="flex flex-col gap-3">
                  {Object.entries(currentQ.options || {}).map(([key, val]) => {
                    const isSelected = currentQ.question_type === 'multiple_choice'
                      ? userAnswers[currentQId] === key
                      : (userAnswers[currentQId] || []).includes(key)

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleAnswerChange(currentQId, currentQ.question_type, key)}
                        className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition ${
                          isSelected 
                            ? 'bg-purple-50 border-purple-300 text-purple-900 font-bold shadow-xs' 
                            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                          isSelected ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {key}
                        </span>
                        <div className="text-sm flex-1 flex items-center">
                          <MathText content={val as string} inline={true} />
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {currentQ.question_type === 'true_false_matrix' && (
                <div className="flex flex-col gap-3">
                  {Object.entries(currentQ.options || {}).map(([stKey, stText]) => {
                    const currentMatrixVal = (userAnswers[currentQId] || {})[stKey] || ''

                    return (
                      <div key={stKey} className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="text-sm text-gray-800 font-medium flex-1">
                          <MathText content={stText as string} />
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {['Benar', 'Salah'].map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleAnswerChange(currentQId, currentQ.question_type, opt, stKey)}
                              className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                                currentMatrixVal === opt
                                  ? opt === 'Benar' ? 'bg-green-600 text-white border-green-600 shadow-xs' : 'bg-red-600 text-white border-red-600 shadow-xs'
                                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

            </div>

            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition disabled:opacity-40"
              >
                &larr; Sebelumnya
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Selanjutnya &rarr;
                </button>
              ) : (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmitExam}
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Kumpulkan Ujian'}
                </button>
              )}
            </div>

          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4 h-fit">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Navigasi Soal</span>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const qId = q.id || q.question_id!
                const ansObj = userAnswers[qId]
                let isAnswered = false
                if (ansObj !== undefined && ansObj !== null) {
                  if (typeof ansObj === 'string') isAnswered = ansObj.trim() !== ''
                  else if (Array.isArray(ansObj)) isAnswered = ansObj.length > 0
                  else if (typeof ansObj === 'object') isAnswered = Object.keys(ansObj).length > 0
                }
                const isCurrent = currentIndex === idx

                return (
                  <button
                    key={qId}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-10 h-10 rounded-xl text-xs font-bold transition flex items-center justify-center border ${
                      isCurrent
                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                        : isAnswered
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmitExam}
              className="mt-4 w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Menyimpan...' : 'Selesai & Kumpulkan'}
            </button>
          </div>

        </div>

      </div>
    </main>
  )
}