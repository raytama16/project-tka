'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { InlineMath } from 'react-katex'
import parse from 'html-react-parser'

type Question = {
    id: string
    question_text: string
    question_type: 'multiple_choice' | 'complex_multiple_choice' | 'true_false_matrix'
    options: any
    correct_answer: any
    explanation?: string
}

export default function PracticeSessionPage() {
    const params = useParams()
    const chapterId = (params.chapterid || params.chapterId) as string
    const router = useRouter()

    const [questions, setQuestions] = useState<Question[]>([])
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, any>>({})
    const [submittedQuestions, setSubmittedQuestions] = useState<Record<string, boolean>>({})
    const [loading, setLoading] = useState(true)
    const [chapterTitle, setChapterTitle] = useState('Latihan Soal')

    const supabase = createClient()

    useEffect(() => {
        const fetchQuestionsAndChapter = async () => {
            if (!chapterId) {
                setLoading(false)
                return
            }
            setLoading(true)

            const { data: chapterData } = await supabase
                .from('practice_chapters')
                .select('title')
                .eq('id', chapterId)
                .single()

            if (chapterData) {
                setChapterTitle(chapterData.title)
            }

            const { data: questionsData, error } = await supabase
                .from('questions')
                .select('id, question_text, question_type, options, correct_answer, explanation')
                .eq('chapter_id', chapterId)

            if (!error && questionsData) {
                setQuestions(questionsData)
            }
            setLoading(false)
        }

        fetchQuestionsAndChapter()
    }, [chapterId, supabase])

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

    const handleSelectOption = (questionId: string, optionKey: string, type: string) => {
        if (submittedQuestions[questionId]) return

        if (type === 'multiple_choice') {
            setSelectedAnswers(prev => ({ ...prev, [questionId]: optionKey }))
        } else if (type === 'complex_multiple_choice') {
            setSelectedAnswers(prev => {
                const currentList = (prev[questionId] as string[]) || []
                if (currentList.includes(optionKey)) {
                    return { ...prev, [questionId]: currentList.filter(item => item !== optionKey) }
                } else {
                    return { ...prev, [questionId]: [...currentList, optionKey] }
                }
            })
        }
    }

    const handleMatrixChange = (questionId: string, statementKey: string, value: string) => {
        if (submittedQuestions[questionId]) return
        setSelectedAnswers(prev => {
            const currentObj = (prev[questionId] as Record<string, string>) || {}
            return {
                ...prev,
                [questionId]: { ...currentObj, [statementKey]: value }
            }
        })
    }

    const handleCheckSingleQuestion = (q: Question) => {
        if (!selectedAnswers[q.id]) return
        setSubmittedQuestions(prev => ({ ...prev, [q.id]: true }))
    }

    const getOptionStatus = (q: Question, optionKey: string) => {
        const isSubmitted = submittedQuestions[q.id]
        if (!isSubmitted) return 'default'

        if (q.question_type === 'multiple_choice') {
            const userAns = selectedAnswers[q.id]
            if (optionKey === q.correct_answer) return 'correct'
            if (userAns === optionKey && optionKey !== q.correct_answer) return 'wrong'
        } else if (q.question_type === 'complex_multiple_choice') {
            const userArr = (selectedAnswers[q.id] as string[]) || []
            const correctArr = (q.correct_answer as string[]) || []
            const isCorrectOption = correctArr.includes(optionKey)
            const isUserPicked = userArr.includes(optionKey)

            if (isCorrectOption) return 'correct'
            if (isUserPicked && !isCorrectOption) return 'wrong'
        }
        return 'default'
    }

    // Fungsi untuk mengecek apakah sebuah soal dijawab benar sepenuhnya
    const isQuestionCorrect = (q: Question) => {
        if (q.question_type === 'multiple_choice') {
            return selectedAnswers[q.id] === q.correct_answer
        } else if (q.question_type === 'complex_multiple_choice') {
            const userArr = ((selectedAnswers[q.id] as string[]) || []).slice().sort()
            const correctArr = ((q.correct_answer as string[]) || []).slice().sort()
            return JSON.stringify(userArr) === JSON.stringify(correctArr)
        } else if (q.question_type === 'true_false_matrix') {
            const userObj = (selectedAnswers[q.id] as Record<string, string>) || {}
            const correctObj = q.correct_answer || {}
            const keys = Object.keys(correctObj)
            if (keys.length === 0) return false
            return keys.every(key => userObj[key] === correctObj[key])
        }
        return false
    }

    // Hitung bobot nilai parsial per soal (mendukung penilaian sebagian)
    const getQuestionScore = (q: Question) => {
        const userAns = selectedAnswers[q.id]
        if (!userAns) return 0

        if (q.question_type === 'multiple_choice') {
            return userAns === q.correct_answer ? 1 : 0
        }

        else if (q.question_type === 'complex_multiple_choice') {
            const userArr = (userAns as string[]) || []
            const correctArr = (q.correct_answer as string[]) || []
            if (correctArr.length === 0) return 0

            let earned = 0
            userArr.forEach(item => {
                if (correctArr.includes(item)) {
                    earned++
                } else {
                    earned -= 0.5 // Penalti kecil jika salah memilih opsi
                }
            })
            return Math.max(0, Math.min(1, earned / correctArr.length))
        }

        else if (q.question_type === 'true_false_matrix') {
            const userObj = (userAns as Record<string, string>) || {}
            const correctObj = q.correct_answer || {}
            const keys = Object.keys(correctObj)
            if (keys.length === 0) return 0

            let correctSubCount = 0
            keys.forEach(key => {
                if (userObj[key] === correctObj[key]) {
                    correctSubCount++
                }
            })

            return correctSubCount / keys.length
        }

        return 0
    }

    // Hitung total skor & statistik
    const totalQuestions = questions.length
    const answeredCount = Object.keys(submittedQuestions).length
    const isAllFinished = totalQuestions > 0 && answeredCount === totalQuestions

    const totalEarnedPoints = questions.reduce((acc, q) => {
        if (submittedQuestions[q.id]) {
            return acc + getQuestionScore(q)
        }
        return acc
    }, 0)

    const finalScore = totalQuestions > 0 ? Math.round((totalEarnedPoints / totalQuestions) * 100) : 0

    const fullyCorrectCount = questions.reduce((acc, q) => {
        if (submittedQuestions[q.id] && isQuestionCorrect(q)) {
            return acc + 1
        }
        return acc
    }, 0)

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-blue-600 font-semibold animate-pulse">Memuat soal...</p>
            </div>
        )
    }

    if (questions.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
                <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center max-w-md w-full shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Belum Ada Soal</h2>
                    <p className="text-xs text-gray-500 mb-6">Bab ini belum memiliki soal.</p>
                    <button onClick={() => router.back()} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition">
                        Kembali
                    </button>
                </div>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-gray-50 p-4 md:p-8 flex justify-center">
            <div className="w-full max-w-3xl flex flex-col gap-6">

                {/* Header Informasi */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">
                            Sesi Latihan
                        </span>
                        <h1 className="text-xl font-bold text-gray-900 mt-2">{chapterTitle}</h1>
                    </div>
                    <button onClick={() => router.back()} className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-xs font-bold transition">
                        Kembali
                    </button>
                </div>

                {/* List Semua Soal Memanjang Ke Bawah */}
                {questions.map((q, index) => {
                    const isSubmitted = submittedQuestions[q.id]

                    return (
                        <div key={q.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col">

                            {/* Header Nomor Soal & Tipe */}
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                                <span className="text-xs font-bold text-gray-500">Soal {index + 1} dari {questions.length}</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase bg-gray-50 px-2.5 py-1 rounded-md">
                                    {q.question_type.replace(/_/g, ' ')}
                                </span>
                            </div>

                            {/* Teks Soal */}
                            {/* <div 
                            className="mb-6 text-sm md:text-base font-medium text-gray-900 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: q.question_text }}
                            >
                                {renderMathText(q.question_text)}
                            </div> */}

                            <div
                                className="mb-6 text-sm md:text-base font-medium text-gray-900 leading-relaxed"
                            >
                                {renderMathText(q.question_text)}
                            </div>

                            {/* Opsi Pilihan Ganda */}
                            {q.question_type === 'multiple_choice' && (
                                <div className="space-y-3 mb-6">
                                    {Object.entries(q.options).map(([key, value]) => {
                                        const isSelected = selectedAnswers[q.id] === key
                                        const status = getOptionStatus(q, key)

                                        let borderStyle = 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                                        let badgeStyle = 'bg-gray-100 text-gray-600'

                                        if (status === 'correct') {
                                            borderStyle = 'border-green-500 bg-green-50/60 text-green-900'
                                            badgeStyle = 'bg-green-600 text-white'
                                        } else if (status === 'wrong') {
                                            borderStyle = 'border-red-500 bg-red-50/60 text-red-900'
                                            badgeStyle = 'bg-red-600 text-white'
                                        } else if (isSelected) {
                                            borderStyle = 'border-blue-600 bg-blue-50/50 text-blue-900'
                                            badgeStyle = 'bg-blue-600 text-white'
                                        }

                                        return (
                                            <button
                                                key={key}
                                                disabled={isSubmitted}
                                                onClick={() => handleSelectOption(q.id, key, 'multiple_choice')}
                                                className={`w-full text-left p-4 rounded-2xl border transition flex items-center gap-4 ${borderStyle}`}
                                            >
                                                <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${badgeStyle}`}>
                                                    {key}
                                                </span>
                                                <span className="text-sm font-medium">{renderMathText(String(value))}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Opsi Kompleks Multiple Choice */}
                            {q.question_type === 'complex_multiple_choice' && (
                                <div className="space-y-3 mb-6">
                                    {!isSubmitted && <p className="text-xs text-purple-600 font-semibold mb-2">* Pilih lebih dari satu jawaban yang benar</p>}
                                    {Object.entries(q.options).map(([key, value]) => {
                                        const currentList = (selectedAnswers[q.id] as string[]) || []
                                        const isSelected = currentList.includes(key)
                                        const status = getOptionStatus(q, key)

                                        let borderStyle = 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                                        let badgeStyle = 'bg-gray-100 text-gray-600'

                                        if (status === 'correct') {
                                            borderStyle = 'border-green-500 bg-green-50/60 text-green-900'
                                            badgeStyle = 'bg-green-600 text-white'
                                        } else if (status === 'wrong') {
                                            borderStyle = 'border-red-500 bg-red-50/60 text-red-900'
                                            badgeStyle = 'bg-red-600 text-white'
                                        } else if (isSelected) {
                                            borderStyle = 'border-purple-600 bg-purple-50/50 text-purple-900'
                                            badgeStyle = 'bg-purple-600 text-white'
                                        }

                                        return (
                                            <button
                                                key={key}
                                                disabled={isSubmitted}
                                                onClick={() => handleSelectOption(q.id, key, 'complex_multiple_choice')}
                                                className={`w-full text-left p-4 rounded-2xl border transition flex items-center gap-4 ${borderStyle}`}
                                            >
                                                <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${badgeStyle}`}>
                                                    {key}
                                                </span>
                                                <span className="text-sm font-medium">{renderMathText(String(value))}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Opsi True False Matrix */}
                            {q.question_type === 'true_false_matrix' && (
                                <div className="space-y-3 mb-6">
                                    {!isSubmitted && <p className="text-xs text-blue-600 font-semibold mb-2">* Tentukan Benar atau Salah untuk setiap pernyataan:</p>}
                                    {Object.entries(q.options).map(([stKey, stText]) => {
                                        const userChoice = (selectedAnswers[q.id] as Record<string, string>)?.[stKey]
                                        const correctChoice = q.correct_answer?.[stKey]

                                        return (
                                            <div key={stKey} className="p-4 rounded-2xl border border-gray-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                                <span className="text-sm font-medium text-gray-800">{renderMathText(String(stText))}</span>
                                                <div className="flex gap-2 w-full sm:w-auto">
                                                    {['Benar', 'Salah'].map(val => {
                                                        const isChosen = userChoice === val
                                                        let btnStyle = 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'

                                                        if (isSubmitted) {
                                                            if (val === correctChoice) {
                                                                btnStyle = 'bg-green-600 text-white border-green-600'
                                                            } else if (isChosen && val !== correctChoice) {
                                                                btnStyle = 'bg-red-600 text-white border-red-600'
                                                            }
                                                        } else if (isChosen) {
                                                            btnStyle = val === 'Benar' ? 'bg-green-600 text-white border-green-600' : 'bg-red-600 text-white border-red-600'
                                                        }

                                                        return (
                                                            <button
                                                                key={val}
                                                                disabled={isSubmitted}
                                                                onClick={() => handleMatrixChange(q.id, stKey, val)}
                                                                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold border transition ${btnStyle}`}
                                                            >
                                                                {val}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Tombol Cek Jawaban Per Soal */}
                            {!isSubmitted ? (
                                <div className="flex justify-end pt-2 border-t border-gray-100">
                                    <button
                                        onClick={() => handleCheckSingleQuestion(q)}
                                        disabled={!selectedAnswers[q.id]}
                                        className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 disabled:opacity-40 transition shadow-sm"
                                    >
                                        Cek Jawaban
                                    </button>
                                </div>
                            ) : (
                                /* Kotak Pembahasan Per Soal */
                                q.explanation && (
                                    <div className="mt-2 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs md:text-sm leading-relaxed">
                                        <span className="font-bold block mb-1 text-amber-800">Pembahasan:</span>
                                        {renderMathText(q.explanation)}
                                    </div>
                                )
                            )}

                        </div>
                    )
                })}

                {/* Kartu Rekapitulasi Nilai (Muncul Otomatis Ketika Semua Soal Selesai) */}
                {isAllFinished && (
                    <div className="bg-linear-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-6 md:p-8 shadow-lg flex flex-col items-center text-center animate-fade-in">
                        <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                            Sesi Selesai
                        </span>
                        <h2 className="text-xl md:text-2xl font-extrabold mb-1">
                            Selamat sudah menyelesaikan latihan soal: {chapterTitle}
                        </h2>
                        <p className="text-blue-100 text-xs md:text-sm mb-6">
                            Kamu telah menjawab semua pertanyaan dengan tuntas. Berikut adalah hasil rekapitulasi latihanmu:
                        </p>

                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 w-full max-w-xs border border-white/20 mb-6 flex flex-col items-center">
                            <span className="text-xs uppercase tracking-widest text-blue-200 font-bold mb-1">Nilai Akhir</span>
                            <span className="text-4xl md:text-5xl font-black mb-2">{finalScore}</span>
                            <span className="text-xs text-blue-100 font-medium">
                                Sempurna {fullyCorrectCount} dari {totalQuestions} soal
                            </span>
                        </div>

                        <div className="flex gap-3 w-full max-w-xs">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex-1 px-4 py-3 bg-white text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-50 transition shadow-sm"
                            >
                                Ulangi Latihan
                            </button>
                            <button
                                onClick={() => router.back()}
                                className="flex-1 px-4 py-3 bg-white/20 text-white rounded-xl text-xs font-bold hover:bg-white/30 transition"
                            >
                                Selesai
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </main>
    )
}