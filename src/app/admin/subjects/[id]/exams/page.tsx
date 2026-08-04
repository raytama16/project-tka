'use client'

import { use, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import MathText from '@/components/MathText'
import router from 'next/router'

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
  created_at: string
}

type Subject = {
  id: string
  title: string
}

export default function AdminSubjectExamsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const subjectId = resolvedParams.id
  const supabase = createClient()

  const [subject, setSubject] = useState<Subject | null>(null)
  const [materialsMap, setMaterialsMap] = useState<Record<string, string>>({})
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [adminEmail, setAdminEmail] = useState<string | null>(null)

  useEffect(() => {
    fetchExamsData()
  }, [subjectId])

  const fetchExamsData = async () => {
    setLoading(true)

    // 1. Ambil detail Subject
    const { data: subjData } = await supabase
      .from('subjects')
      .select('id, title')
      .eq('id', subjectId)
      .single()

    if (subjData) setSubject(subjData)

    // 2. Ambil daftar Materials untuk mapping nama bab
    const { data: matData } = await supabase
      .from('materials')
      .select('id, title')
      .eq('subject_id', subjectId)

    if (matData) {
      const map: Record<string, string> = {}
      matData.forEach((m) => {
        map[m.id] = m.title
      })
      setMaterialsMap(map)
    }

    // 3. Ambil daftar soal khusus type 'exam'
    const { data: qData, error } = await supabase
      .from('questions')
      .select('*')
      .eq('subject_id', subjectId)
      .eq('type', 'exam')
      .order('created_at', { ascending: false })

    if (!error && qData) {
      setQuestions(qData)
    }

    setLoading(false)
  }

  const handleDelete = async (q: Question) => {
    const qId = q.id || q.question_id
    if (!qId) {
      alert('ID soal tidak valid!')
      return
    }

    if (!confirm('Apakah Anda yakin ingin menghapus soal ujian ini?')) return

    const pkColumn = q.id ? 'id' : 'question_id'
    const { error } = await supabase.from('questions').delete().eq(pkColumn, qId)

    if (error) {
      alert('Gagal menghapus soal: ' + error.message)
    } else {
      setMessage('Soal ujian berhasil dihapus.')
      fetchExamsData()
      setTimeout(() => setMessage(''), 3000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-purple-600 font-semibold animate-pulse">
        Memuat daftar soal ujian...
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 flex flex-col">
        
        {/* Header Navigasi & Judul */}
        <div className="mb-6 pb-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link
              href="/admin/subjects"
              className="text-xs font-bold text-purple-600 hover:text-purple-700 inline-flex items-center gap-1 mb-2 transition"
            >
              &larr; Kembali ke Daftar Mata Pelajaran
            </Link>
            <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Bank Soal Ujian (Exam)</span>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {subject ? subject.title : 'Mata Pelajaran'}
            </h1>
          </div>

          <Link
            href={`/admin/subjects/${subjectId}/exams/create`}
            className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-2 shrink-0"
          >
            + Buat Soal Ujian
          </Link>
        </div>

        {message && (
          <div className="mb-6 p-4 rounded-2xl bg-green-50 text-green-600 border border-green-100 text-sm font-medium">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 flex flex-col">
            <span className="text-xs font-semibold text-purple-600 uppercase">Total Soal Ujian</span>
            <span className="text-2xl font-extrabold text-purple-900 mt-1">{questions.length}</span>
          </div>
        </div>

        {/* Daftar Soal */}
        <div className="space-y-4">
          {questions.length === 0 ? (
            <div className="bg-gray-50 p-12 rounded-2xl border border-gray-200 text-center flex flex-col items-center justify-center gap-3">
              <p className="text-sm font-medium text-gray-500">Belum ada soal ujian yang dibuat untuk mata pelajaran ini.</p>
              <Link
                href={`/admin/subjects/${subjectId}/exams/create`}
                className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl text-xs font-bold transition"
              >
                Buat Soal Pertama Sekarang
              </Link>
            </div>
          ) : (
            questions.map((q, index) => {
              const qId = q.id || q.question_id
              return (
                <div 
                  key={qId || index} 
                  className="p-5 rounded-2xl border border-gray-200 bg-white flex flex-col gap-3 shadow-xs hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-gray-400">#{index + 1}</span>
                      <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full uppercase border border-purple-100">
                        Exam
                      </span>
                      <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                        {q.question_type === 'multiple_choice' && 'Pilihan Ganda'}
                        {q.question_type === 'complex_multiple_choice' && 'PG Kompleks'}
                        {q.question_type === 'true_false_matrix' && 'Matriks B/S'}
                      </span>
                      {q.material_id ? (
                        <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                          Bab: {materialsMap[q.material_id] || 'Sub-Bab Terkait'}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                          Ujian Umum (Semua Bab)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/subjects/${subjectId}/exams/${qId}/edit`}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-600 text-amber-700 hover:text-white rounded-xl text-xs font-bold transition border border-amber-200"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(q)}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-xl text-xs font-bold transition border border-red-100"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>

                  <div className="text-sm font-semibold text-gray-900 mt-1">
                    <MathText content={q.question_text} />
                  </div>

                  <div className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-100 flex items-center justify-between">
                    <span>
                      <strong>Kunci Jawaban:</strong>{' '}
                      {Array.isArray(q.correct_answer)
                        ? q.correct_answer.join(', ')
                        : typeof q.correct_answer === 'object' && q.correct_answer !== null
                        ? Object.entries(q.correct_answer)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(' | ')
                        : q.correct_answer}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="pt-6 mt-12 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400 font-medium">&copy; 2026 TKA Master &middot; Panel Administrator</p>
        </div>

      </div>
    </main>
  )
}