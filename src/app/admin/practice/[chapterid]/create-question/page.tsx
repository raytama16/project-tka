'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { InlineMath } from 'react-katex'

export default function CreateQuestionPage({ params }: { params: Promise<{ chapterid: string }> }) {
    const resolvedParams = use(params)
    const chapterId = resolvedParams.chapterid // Disesuaikan dengan folder [chapterid]
    
    const router = useRouter()
    const supabase = createClient()

    const [qText, setQText] = useState('')
    const [qType, setQType] = useState<'multiple_choice' | 'complex_multiple_choice' | 'true_false_matrix'>('multiple_choice')
    const [qExplanation, setQExplanation] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const [optionsObj, setOptionsObj] = useState<Record<string, string>>({ A: '', B: '', C: '', D: '' })
    const [correctAnsMC, setCorrectAnsMC] = useState<string>('A')
    const [correctAnsComplex, setCorrectAnsComplex] = useState<string[]>([])
    const [correctAnsMatrix, setCorrectAnsMatrix] = useState<Record<string, string>>({})

    const renderMathText = (text: string) => {
        if (!text) return null
        const parts = text.split(/(\$.*?\$)/g)
        return (
            <span>
                {parts.map((part, index) => {
                    if (part.startsWith('$') && part.endsWith('$')) {
                        const mathContent = part.slice(1, -1)
                        return <InlineMath key={index} math={mathContent} />
                    }
                    return <span key={index}>{part}</span>
                })}
            </span>
        )
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
            alert('Minimal 2 opsi!')
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
            alert('Minimal 1 pernyataan!')
            return
        }
        const updated = { ...optionsObj }
        delete updated[key]
        setOptionsObj(updated)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!qText.trim()) return

        let finalCorrectAnswer: any = null
        if (qType === 'multiple_choice') finalCorrectAnswer = correctAnsMC
        else if (qType === 'complex_multiple_choice') finalCorrectAnswer = correctAnsComplex
        else if (qType === 'true_false_matrix') finalCorrectAnswer = correctAnsMatrix

        setSubmitting(true)
        
        const { error } = await supabase.from('questions').insert([{
            chapter_id: chapterId,
            type: 'practice',
            question_text: qText,
            question_type: qType,
            options: optionsObj,
            correct_answer: finalCorrectAnswer,
            explanation: qExplanation
        }])

        if (!error) {
            router.push(`/admin/practice/${chapterId}`)
            router.refresh()
        } else {
            console.error('SUPABASE ERROR:', error)
            alert('Gagal membuat soal: ' + error.message)
            setSubmitting(false)
        }
    }

    return (
        <main className="min-h-screen bg-gray-50 p-4 md:p-8 flex flex-col items-center">
            <div className="w-full max-w-2xl bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-extrabold text-gray-900">Tambah Soal Baru</h1>
                    <button type="button" onClick={() => router.back()} className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-xs font-bold transition">
                        Kembali
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Tipe Soal</label>
                        <select
                            value={qType}
                            onChange={e => handleTypeChange(e.target.value)}
                            className="w-full text-gray-700 p-3 border border-gray-300 rounded-2xl text-sm font-medium focus:outline-none focus:border-blue-600"
                        >
                            <option value="multiple_choice">Pilihan Ganda (Satu Jawaban)</option>
                            <option value="complex_multiple_choice">Pilihan Ganda Kompleks (Banyak Jawaban)</option>
                            <option value="true_false_matrix">Matriks Benar / Salah</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Teks Soal (Dukung LaTeX $...$)</label>
                        <textarea
                            required
                            rows={3}
                            value={qText}
                            onChange={e => setQText(e.target.value)}
                            placeholder="Tulis pertanyaan..."
                            className="w-full p-3 text-gray-700 border border-gray-300 rounded-2xl text-sm focus:outline-none focus:border-blue-600 resize-none"
                        />
                        {qText && (
                            <div className="mt-2 p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-xs text-blue-900">
                                <span className="font-bold block mb-1">Pratinjau:</span>
                                {renderMathText(qText)}
                            </div>
                        )}
                    </div>

                    {/* Opsi Pilihan Ganda / Kompleks */}
                    {(qType === 'multiple_choice' || qType === 'complex_multiple_choice') && (
                        <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-700 uppercase">Opsi Jawaban</span>
                                <button type="button" onClick={addMcOption} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold">
                                    + Tambah Opsi
                                </button>
                            </div>
                            {Object.entries(optionsObj).map(([key, val]) => (
                                <div key={key} className="flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-white border flex items-center justify-center text-xs font-bold text-gray-700">{key}</span>
                                    <input
                                        type="text"
                                        required
                                        value={val}
                                        onChange={e => setOptionsObj({ ...optionsObj, [key]: e.target.value })}
                                        placeholder={`Opsi ${key}`}
                                        className="flex-1 p-2.5 bg-white border text-gray-700 rounded-xl text-xs focus:outline-none"
                                    />
                                    {qType === 'multiple_choice' ? (
                                        <label className="flex items-center gap-1 text-xs font-bold text-green-700 cursor-pointer bg-green-50 px-3 py-2 rounded-xl border">
                                            <input type="radio" name="mc" checked={correctAnsMC === key} onChange={() => setCorrectAnsMC(key)} /> Kunci
                                        </label>
                                    ) : (
                                        <label className="flex items-center gap-1 text-xs font-bold text-purple-700 cursor-pointer bg-purple-50 px-3 py-2 rounded-xl border">
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
                                        <button type="button" onClick={() => removeMcOption(key)} className="p-2 text-red-500 text-xs font-bold">Hapus</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Opsi Matriks */}
                    {qType === 'true_false_matrix' && (
                        <div className="flex flex-col gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-blue-900 uppercase">Pernyataan Matriks</span>
                                <button type="button" onClick={addMatrixStatement} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold">
                                    + Tambah Pernyataan
                                </button>
                            </div>
                            {Object.entries(optionsObj).map(([stKey, stText]) => (
                                <div key={stKey} className="flex gap-3 p-3 bg-white border rounded-xl items-center">
                                    <input
                                        type="text"
                                        required
                                        value={stText}
                                        onChange={e => setOptionsObj({ ...optionsObj, [stKey]: e.target.value })}
                                        placeholder="Pernyataan..."
                                        className="flex-1 p-2 text-gray-700 bg-gray-50 border rounded-lg text-xs"
                                    />
                                    <select
                                        value={correctAnsMatrix[stKey] || 'Benar'}
                                        onChange={e => setCorrectAnsMatrix({ ...correctAnsMatrix, [stKey]: e.target.value })}
                                        className="p-2 text-gray-700 bg-gray-50 border rounded-lg text-xs font-bold"
                                    >
                                        <option value="Benar">Benar</option>
                                        <option value="Salah">Salah</option>
                                    </select>
                                    {Object.keys(optionsObj).length > 1 && (
                                        <button type="button" onClick={() => removeMatrixStatement(stKey)} className="text-red-500 text-xs font-bold">Hapus</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Pembahasan (Opsional)</label>
                        <textarea
                            rows={3}
                            value={qExplanation}
                            onChange={e => setQExplanation(e.target.value)}
                            placeholder="Penjelasan..."
                            className="w-full text-gray-700 p-3 border border-gray-300 rounded-2xl text-sm focus:outline-none resize-none"
                        />
                    </div>

                    <div className="flex gap-3 justify-end pt-2">
                        <button type="button" onClick={() => router.back()} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold">Batal</button>
                        <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm">
                            {submitting ? 'Menyimpan...' : 'Simpan Soal'}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    )
}