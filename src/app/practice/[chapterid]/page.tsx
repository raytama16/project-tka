'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { InlineMath } from 'react-katex'
import parse from 'html-react-parser'
import { 
    ArrowLeft, 
    CheckCircle2, 
    XCircle, 
    HelpCircle, 
    Sparkles, 
    BookOpen, 
    RotateCcw, 
    Check, 
    AlertCircle 
} from 'lucide-react'

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

    // Memperbaiki masalah halaman terbuka di tengah-tengah
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [loading])

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
                if (part.startsWith('$') && part.endsWith('$')) {
                    const mathContent = part.slice(1, -1)
                    return <InlineMath key={index} math={mathContent} />
                }
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

    const getQuestionScore = (q: Question) => {
        const userAns = selectedAnswers[q.id]
        if (!userAns) return 0

        if (q.question_type === 'multiple_choice') {
            return userAns === q.correct_answer ? 1 : 0
        } else if (q.question_type === 'complex_multiple_choice') {
            const userArr = (userAns as string[]) || []
            const correctArr = (q.correct_answer as string[]) || []
            if (correctArr.length === 0) return 0

            let earned = 0
            userArr.forEach(item => {
                if (correctArr.includes(item)) {
                    earned++
                } else {
                    earned -= 0.5 
                }
            })
            return Math.max(0, Math.min(1, earned / correctArr.length))
        } else if (q.question_type === 'true_false_matrix') {
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
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-2xl animate-spin flex items-center justify-center text-white shadow-lg">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <p className="text-xs font-bold text-gray-500 dark:text-slate-400">Menyiapkan sesi latihan soal...</p>
            </div>
        )
    }

    if (questions.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 flex flex-col items-center justify-center">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-gray-100 dark:border-slate-800 text-center max-w-md w-full shadow-xl">
                    <BookOpen className="w-12 h-12 mx-auto text-gray-300 dark:text-slate-700 mb-3" />
                    <h2 className="text-base font-black text-gray-900 dark:text-white mb-1">Belum Ada Soal</h2>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-6">Bab ini belum memiliki daftar soal latihan.</p>
                    <button 
                        onClick={() => router.back()} 
                        className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-extrabold transition shadow-md shadow-purple-200 dark:shadow-none cursor-pointer"
                    >
                        Kembali
                    </button>
                </div>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 p-4 sm:p-6 md:p-10 flex justify-center font-sans transition-colors duration-200">
            <div className="w-full max-w-3xl flex flex-col gap-6">

                {/* Header Informasi */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-100 dark:shadow-none border border-gray-100 dark:border-slate-800 p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-36 h-36 bg-purple-100/50 dark:bg-purple-900/20 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-center justify-between gap-4 relative z-10">
                        <div>
                            <span className="inline-flex items-center gap-1.5 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[10px] font-extrabold px-3 py-1 rounded-full border border-purple-100 dark:border-purple-900/50 mb-2">
                                <Sparkles className="w-3.5 h-3.5" /> Sesi Latihan Aktif
                            </span>
                            <h1 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-tight">{chapterTitle}</h1>
                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                                Progress: <strong className="text-purple-600 dark:text-purple-400">{answeredCount}</strong> dari {totalQuestions} soal dikerjakan
                            </p>
                        </div>
                        <button 
                            onClick={() => router.back()} 
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-2xl text-xs font-extrabold transition cursor-pointer shrink-0"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Kembali</span>
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-100 dark:bg-slate-800 h-2 rounded-full mt-5 overflow-hidden">
                        <div 
                            className="bg-linear-to-r from-purple-600 to-indigo-600 h-full transition-all duration-500 rounded-full"
                            style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                        />
                    </div>
                </div>

                {/* List Semua Soal */}
                {questions.map((q, index) => {
                    const isSubmitted = submittedQuestions[q.id]

                    return (
                        <div 
                            key={q.id} 
                            className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-100 dark:shadow-none border border-gray-100 dark:border-slate-800 p-6 sm:p-8 flex flex-col relative transition-all"
                        >
                            {/* Header Nomor Soal & Tipe */}
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-slate-800">
                                <span className="text-xs font-extrabold text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                                    Soal {index + 1} dari {questions.length}
                                </span>
                                <span className="text-[10px] font-extrabold text-purple-600 dark:text-purple-400 uppercase bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900/50 px-2.5 py-1 rounded-full">
                                    {q.question_type.replace(/_/g, ' ')}
                                </span>
                            </div>

                            {/* Teks Soal */}
                            <div className="mb-6 text-sm sm:text-base font-semibold text-gray-900 dark:text-slate-100 leading-relaxed">
                                {renderMathText(q.question_text)}
                            </div>

                            {/* Opsi Pilihan Ganda Biasa */}
                            {q.question_type === 'multiple_choice' && (
                                <div className="space-y-3 mb-6">
                                    {Object.entries(q.options).map(([key, value]) => {
                                        const isSelected = selectedAnswers[q.id] === key
                                        const status = getOptionStatus(q, key)

                                        let borderStyle = 'border-gray-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300'
                                        let badgeStyle = 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400'

                                        if (status === 'correct') {
                                            borderStyle = 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                                            badgeStyle = 'bg-emerald-600 text-white'
                                        } else if (status === 'wrong') {
                                            borderStyle = 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
                                            badgeStyle = 'bg-rose-600 text-white'
                                        } else if (isSelected) {
                                            borderStyle = 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/50 text-purple-900 dark:text-purple-200'
                                            badgeStyle = 'bg-purple-600 text-white'
                                        }

                                        return (
                                            <button
                                                key={key}
                                                disabled={isSubmitted}
                                                onClick={() => handleSelectOption(q.id, key, 'multiple_choice')}
                                                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 cursor-pointer ${borderStyle}`}
                                            >
                                                <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 shadow-sm ${badgeStyle}`}>
                                                    {key}
                                                </span>
                                                <span className="text-xs sm:text-sm font-medium flex-1">{renderMathText(String(value))}</span>
                                                {status === 'correct' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                                                {status === 'wrong' && <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Opsi Kompleks Multiple Choice */}
                            {q.question_type === 'complex_multiple_choice' && (
                                <div className="space-y-3 mb-6">
                                    {!isSubmitted && (
                                        <div className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-950/60 p-3 rounded-xl border border-purple-100 dark:border-purple-900/50 mb-3">
                                            <AlertCircle className="w-4 h-4 shrink-0" />
                                            <span>Soal Kompleks: Pilih lebih dari satu jawaban yang benar.</span>
                                        </div>
                                    )}
                                    {Object.entries(q.options).map(([key, value]) => {
                                        const currentList = (selectedAnswers[q.id] as string[]) || []
                                        const isSelected = currentList.includes(key)
                                        const status = getOptionStatus(q, key)

                                        let borderStyle = 'border-gray-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300'
                                        let badgeStyle = 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400'

                                        if (status === 'correct') {
                                            borderStyle = 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                                            badgeStyle = 'bg-emerald-600 text-white'
                                        } else if (status === 'wrong') {
                                            borderStyle = 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
                                            badgeStyle = 'bg-rose-600 text-white'
                                        } else if (isSelected) {
                                            borderStyle = 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/50 text-purple-900 dark:text-purple-200'
                                            badgeStyle = 'bg-purple-600 text-white'
                                        }

                                        return (
                                            <button
                                                key={key}
                                                disabled={isSubmitted}
                                                onClick={() => handleSelectOption(q.id, key, 'complex_multiple_choice')}
                                                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 cursor-pointer ${borderStyle}`}
                                            >
                                                <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 shadow-sm ${badgeStyle}`}>
                                                    {key}
                                                </span>
                                                <span className="text-xs sm:text-sm font-medium flex-1">{renderMathText(String(value))}</span>
                                                {status === 'correct' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                                                {status === 'wrong' && <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Opsi True False Matrix */}
                            {q.question_type === 'true_false_matrix' && (
                                <div className="space-y-3 mb-6">
                                    {!isSubmitted && (
                                        <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/60 p-3 rounded-xl border border-blue-100 dark:border-blue-900/50 mb-3">
                                            <AlertCircle className="w-4 h-4 shrink-0" />
                                            <span>Tentukan Benar atau Salah untuk setiap pernyataan di bawah ini:</span>
                                        </div>
                                    )}
                                    {Object.entries(q.options).map(([stKey, stText]) => {
                                        const userChoice = (selectedAnswers[q.id] as Record<string, string>)?.[stKey]
                                        const correctChoice = q.correct_answer?.[stKey]

                                        return (
                                            <div key={stKey} className="p-4 rounded-2xl border border-gray-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                                <span className="text-xs sm:text-sm font-medium text-gray-800 dark:text-slate-200 flex-1">{renderMathText(String(stText))}</span>
                                                <div className="flex gap-2 w-full sm:w-auto shrink-0">
                                                    {['Benar', 'Salah'].map(val => {
                                                        const isChosen = userChoice === val
                                                        let btnStyle = 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-800 hover:border-gray-300'

                                                        if (isSubmitted) {
                                                            if (val === correctChoice) {
                                                                btnStyle = 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                                            } else if (isChosen && val !== correctChoice) {
                                                                btnStyle = 'bg-rose-600 text-white border-rose-600 shadow-sm'
                                                            }
                                                        } else if (isChosen) {
                                                            btnStyle = val === 'Benar' 
                                                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                                                                : 'bg-rose-600 text-white border-rose-600 shadow-sm'
                                                        }

                                                        return (
                                                            <button
                                                                key={val}
                                                                disabled={isSubmitted}
                                                                onClick={() => handleMatrixChange(q.id, stKey, val)}
                                                                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${btnStyle}`}
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

                            {/* Tombol Cek Jawaban Per Soal / Kotak Pembahasan */}
                            {!isSubmitted ? (
                                <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-slate-800">
                                    <button
                                        onClick={() => handleCheckSingleQuestion(q)}
                                        disabled={!selectedAnswers[q.id]}
                                        className="px-6 py-3 bg-purple-600 text-white rounded-2xl text-xs font-extrabold hover:bg-purple-700 disabled:opacity-40 transition-all shadow-md shadow-purple-200 dark:shadow-none cursor-pointer"
                                    >
                                        Cek Jawaban Soal Ini
                                    </button>
                                </div>
                            ) : (
                                q.explanation && (
                                    <div className="mt-2 p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 text-xs sm:text-sm leading-relaxed">
                                        <span className="font-extrabold flex items-center gap-1.5 text-amber-800 dark:text-amber-300 mb-1.5">
                                            <HelpCircle className="w-4 h-4" /> Pembahasan Soal:
                                        </span>
                                        {renderMathText(q.explanation)}
                                    </div>
                                )
                            )}

                        </div>
                    )
                })}

                {/* Kartu Rekapitulasi Nilai Akhir */}
                {isAllFinished && (
                    <div className="bg-linear-to-br from-purple-600 to-indigo-700 text-white rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col items-center text-center animate-fade-in relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                        
                        <span className="bg-white/20 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-3 backdrop-blur-md">
                            Sesi Selesai Dengan Baik
                        </span>
                        
                        <h2 className="text-xl sm:text-2xl font-black mb-2 tracking-tight">
                            Selamat! Anda telah menyelesaikan latihan: {chapterTitle}
                        </h2>
                        
                        <p className="text-purple-100 text-xs sm:text-sm mb-6 max-w-md leading-relaxed">
                            Seluruh pertanyaan telah berhasil dikerjakan. Berikut adalah rekapitulasi nilai dan hasil evaluasi belajar Anda:
                        </p>

                        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 w-full max-w-xs border border-white/20 mb-8 flex flex-col items-center shadow-lg">
                            <span className="text-[10px] uppercase tracking-widest text-purple-200 font-extrabold mb-1">Nilai Akhir Anda</span>
                            <span className="text-5xl sm:text-6xl font-black mb-2 tracking-tight">{finalScore}</span>
                            <span className="text-xs text-purple-100 font-semibold bg-white/10 px-3 py-1 rounded-full">
                                Sempurna {fullyCorrectCount} dari {totalQuestions} soal
                            </span>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex-1 px-5 py-3.5 bg-white text-purple-700 rounded-2xl text-xs font-extrabold hover:bg-purple-50 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                            >
                                <RotateCcw className="w-4 h-4" />
                                <span>Ulangi Latihan</span>
                            </button>
                            <button
                                onClick={() => router.back()}
                                className="flex-1 px-5 py-3.5 bg-white/20 hover:bg-white/30 text-white rounded-2xl text-xs font-extrabold transition-all backdrop-blur-md cursor-pointer"
                            >
                                Selesai & Keluar
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </main>
    )
}