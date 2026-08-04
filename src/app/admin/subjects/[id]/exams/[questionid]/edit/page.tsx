'use client'

import { use, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MathText from '@/components/MathText'

type Material = {
  id: string
  title: string
}

export default function EditExamPage({ 
  params 
}: { 
  params: Promise<{ id: string; questionid: string }> 
}) {
  const resolvedParams = use(params)
  const subjectId = resolvedParams.id
  const questionId = resolvedParams.questionid // Sesuai dengan nama folder [questionid]
  
  const router = useRouter()
  const supabase = createClient()

  const [materials, setMaterials] = useState<Material[]>([])
  const [loadingMaterials, setLoadingMaterials] = useState(true)
  const [loadingData, setLoadingData] = useState(true)

  // State Form Sesuai Tabel questions
  const [materialId, setMaterialId] = useState<string>('') 
  const [qType, setQType] = useState<'multiple_choice' | 'complex_multiple_choice' | 'true_false_matrix'>('multiple_choice')
  const [qText, setQText] = useState('')
  const [qExplanation, setQExplanation] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // State Dinamis untuk Opsi & Kunci Jawaban
  const [optionsObj, setOptionsObj] = useState<Record<string, string>>({ A: '', B: '', C: '', D: '' })
  const [correctAnsMC, setCorrectAnsMC] = useState<string>('A')
  const [correctAnsComplex, setCorrectAnsComplex] = useState<string[]>([])
  const [correctAnsMatrix, setCorrectAnsMatrix] = useState<Record<string, string>>({})

  useEffect(() => {
    console.log("URL Param questionid:", questionId)
    fetchInitialData()
  }, [subjectId, questionId])

  const fetchInitialData = async () => {
    setLoadingMaterials(true)
    setLoadingData(true)

    // 1. Ambil daftar materials untuk dropdown
    const { data: matData } = await supabase
      .from('materials')
      .select('id, title')
      .eq('subject_id', subjectId)

    if (matData) setMaterials(matData)
    setLoadingMaterials(false)

    // 2. Ambil data soal dengan mencoba berbagai kemungkinan kolom primary key
    let qData = null

    let res = await supabase.from('questions').select('*').eq('id', questionId).maybeSingle()
    if (res.data) {
      qData = res.data
    } else {
      res = await supabase.from('questions').select('*').eq('question_id', questionId).maybeSingle()
      if (res.data) {
        qData = res.data
      } else {
        res = await supabase.from('questions').select('*').eq('questionid', questionId).maybeSingle()
        if (res.data) qData = res.data
      }
    }

    console.log("Hasil fetch data soal:", qData)

    if (!qData) {
      alert(`Soal dengan ID "${questionId}" tidak ditemukan di database.`)
      router.push(`/admin/subjects/${subjectId}/exams`)
      return
    }

    // Set state dengan data dari database
    setMaterialId(qData.material_id || '')
    setQType(qData.question_type || 'multiple_choice')
    setQText(qData.question_text || '')
    setQExplanation(qData.explanation || '')
    setOptionsObj(qData.options || {})

    if (qData.question_type === 'multiple_choice') {
      setCorrectAnsMC(qData.correct_answer || 'A')
    } else if (qData.question_type === 'complex_multiple_choice') {
      setCorrectAnsComplex(Array.isArray(qData.correct_answer) ? qData.correct_answer : [])
    } else if (qData.question_type === 'true_false_matrix') {
      setCorrectAnsMatrix(qData.correct_answer || {})
    }

    setLoadingData(false)
  }

  const handleTypeChange = (newType: any) => {
    setQType(newType)
    if (newType === 'multiple_choice') {
      setOptionsObj({ A: '', B: '', C: '', D: '' })
      setCorrectAnsMC('A')
    } else if (newType === 'complex_multiple_choice') {
      setOptionsObj({ A: '', B: '', C: '', D: '' })
      setCorrectAnsComplex([])
    } else if (newType === 'true_false_matrix') {
      setOptionsObj({ stmt1: '', stmt2: '' })
      setCorrectAnsMatrix({ stmt1: 'Benar', stmt2: 'Salah' })
    }
  }

  const addMcOption = () => {
    const nextKey = String.fromCharCode(65 + Object.keys(optionsObj).length)
    setOptionsObj(prev => ({ ...prev, [nextKey]: '' }))
  }

  const removeMcOption = (key: string) => {
    if (Object.keys(optionsObj).length <= 2) {
      alert('Minimal harus ada 2 opsi pilihan!')
      return
    }
    const updated = { ...optionsObj }
    delete updated[key]
    setOptionsObj(updated)
  }

  const addMatrixStatement = () => {
    const nextKey = `stmt_${Date.now()}`
    setOptionsObj(prev => ({ ...prev, [nextKey]: '' }))
    setCorrectAnsMatrix(prev => ({ ...prev, [nextKey]: 'Benar' }))
  }

  const removeMatrixStatement = (key: string) => {
    if (Object.keys(optionsObj).length <= 1) {
      alert('Minimal harus ada 1 pernyataan matriks!')
      return
    }
    const updated = { ...optionsObj }
    delete updated[key]
    setOptionsObj(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!qText.trim()) {
      alert('Teks pertanyaan tidak boleh kosong!')
      return
    }

    let finalCorrectAnswer: any = null
    if (qType === 'multiple_choice') finalCorrectAnswer = correctAnsMC
    else if (qType === 'complex_multiple_choice') finalCorrectAnswer = correctAnsComplex
    else if (qType === 'true_false_matrix') finalCorrectAnswer = correctAnsMatrix

    setSubmitting(true)

    const payload = {
      material_id: materialId ? materialId : null,
      question_type: qType,
      question_text: qText,
      options: optionsObj,
      correct_answer: finalCorrectAnswer,
      explanation: qExplanation,
    }

    // Update data dengan mendeteksi kolom primary key
    let updateRes = await supabase.from('questions').update(payload).eq('id', questionId)
    if (updateRes.error) {
      updateRes = await supabase.from('questions').update(payload).eq('question_id', questionId)
      if (updateRes.error) {
        updateRes = await supabase.from('questions').update(payload).eq('questionid', questionId)
      }
    }

    if (!updateRes.error) {
      router.push(`/admin/subjects/${subjectId}/exams`)
      router.refresh()
    } else {
      console.error('SUPABASE ERROR:', updateRes.error)
      alert('Gagal memperbarui soal ujian: ' + updateRes.error.message)
      setSubmitting(false)
    }
  }

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-purple-600 font-semibold animate-pulse">
        Memuat data soal ujian...
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 flex flex-col gap-6">
        
        <div className="flex items-center justify-between border-b border-gray-100 pb-6">
          <div>
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1 block">Modul Ujian (Exam) &middot; Edit</span>
            <h1 className="text-2xl font-bold text-gray-900">Ubah Soal Ujian</h1>
          </div>
          <Link
            href={`/admin/subjects/${subjectId}/exams`}
            className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-xs font-bold transition"
          >
            &larr; Kembali
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Format Soal</label>
              <select
                value={qType}
                onChange={e => handleTypeChange(e.target.value)}
                className="w-full text-gray-700 p-3 border border-gray-200 rounded-2xl text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="multiple_choice">Pilihan Ganda (Satu Jawaban)</option>
                <option value="complex_multiple_choice">Pilihan Ganda Kompleks (Banyak Jawaban)</option>
                <option value="true_false_matrix">Matriks Benar / Salah</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Pilih Bab / Material (Opsional)</label>
              <select
                value={materialId}
                onChange={e => setMaterialId(e.target.value)}
                disabled={loadingMaterials}
                className="w-full text-gray-700 p-3 border border-gray-200 rounded-2xl text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="">-- Soal Ujian Umum (Semua Bab) --</option>
                {materials.map(mat => (
                  <option key={mat.id} value={mat.id}>{mat.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Teks Pertanyaan (Mendukung LaTeX $...$)</label>
            <textarea
              required
              rows={4}
              value={qText}
              onChange={e => setQText(e.target.value)}
              placeholder="Tuliskan teks soal ujian..."
              className="w-full p-3 text-gray-700 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none font-mono"
            />
            {qText && (
              <div className="mt-3 p-4 bg-purple-50/40 border border-purple-100 rounded-2xl text-sm text-gray-800">
                <span className="font-bold block mb-1 text-xs text-purple-700 uppercase tracking-wider">Pratinjau Soal:</span>
                <MathText content={qText} />
              </div>
            )}
          </div>

          {(qType === 'multiple_choice' || qType === 'complex_multiple_choice') && (
            <div className="flex flex-col gap-3 p-5 bg-gray-50 rounded-2xl border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Opsi Jawaban & Kunci</span>
                <button type="button" onClick={addMcOption} className="px-3 py-1.5 bg-purple-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-purple-700 transition">
                  + Tambah Opsi
                </button>
              </div>

              {Object.entries(optionsObj).map(([key, val]) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-700 shrink-0">
                    {key}
                  </span>
                  <input
                    type="text"
                    required
                    value={val as string}
                    onChange={e => setOptionsObj({ ...optionsObj, [key]: e.target.value })}
                    placeholder={`Teks pilihan ${key}`}
                    className="flex-1 p-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                  
                  {qType === 'multiple_choice' ? (
                    <label className="flex items-center gap-1.5 text-xs font-bold text-green-700 cursor-pointer bg-green-50 px-3 py-2 rounded-xl border border-green-200 shrink-0">
                      <input type="radio" name="mc" checked={correctAnsMC === key} onChange={() => setCorrectAnsMC(key)} /> Kunci
                    </label>
                  ) : (
                    <label className="flex items-center gap-1.5 text-xs font-bold text-purple-700 cursor-pointer bg-purple-50 px-3 py-2 rounded-xl border border-purple-200 shrink-0">
                      <input
                        type="checkbox"
                        checked={correctAnsComplex.includes(key)}
                        onChange={() => {
                          if (correctAnsComplex.includes(key)) setCorrectAnsComplex(correctAnsComplex.filter(k => k !== key))
                          else setCorrectAnsComplex([...correctAnsComplex, key])
                        }}
                      /> Benar
                    </label>
                  )}

                  {Object.keys(optionsObj).length > 2 && (
                    <button type="button" onClick={() => removeMcOption(key)} className="p-2 text-red-500 text-xs font-bold hover:text-red-700 transition">
                      Hapus
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {qType === 'true_false_matrix' && (
            <div className="flex flex-col gap-3 p-5 bg-purple-50/30 rounded-2xl border border-purple-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">Pernyataan Matriks</span>
                <button type="button" onClick={addMatrixStatement} className="px-3 py-1.5 bg-purple-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-purple-700 transition">
                  + Tambah Pernyataan
                </button>
              </div>

              {Object.entries(optionsObj).map(([stKey, stText]) => (
                <div key={stKey} className="flex gap-3 p-3 bg-white border border-gray-200 rounded-xl items-center shadow-xs">
                  <input
                    type="text"
                    required
                    value={stText as string}
                    onChange={e => setOptionsObj({ ...optionsObj, [stKey]: e.target.value })}
                    placeholder="Tuliskan teks pernyataan..."
                    className="flex-1 p-2 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none"
                  />
                  <select
                    value={correctAnsMatrix[stKey] || 'Benar'}
                    onChange={e => setCorrectAnsMatrix({ ...correctAnsMatrix, [stKey]: e.target.value })}
                    className="p-2 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold focus:outline-none"
                  >
                    <option value="Benar">Benar</option>
                    <option value="Salah">Salah</option>
                  </select>
                  {Object.keys(optionsObj).length > 1 && (
                    <button type="button" onClick={() => removeMatrixStatement(stKey)} className="text-red-500 text-xs font-bold hover:text-red-700 transition px-1">
                      Hapus
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Pembahasan Soal</label>
            <textarea
              rows={3}
              value={qExplanation}
              onChange={e => setQExplanation(e.target.value)}
              placeholder="Tuliskan pembahasan lengkap jawaban..."
              className="w-full text-gray-700 p-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none font-mono"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-xs font-bold transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition disabled:opacity-50"
            >
              {submitting ? 'Menyimpan Perubahan...' : 'Perbarui Soal Ujian'}
            </button>
          </div>

        </form>
      </div>
    </main>
  )
}