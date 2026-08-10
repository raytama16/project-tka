'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ChapterDetailPage({ params }: { params: { chapterid: string } | Promise<{ chapterid: string }> }) {
    const router = useRouter()
    const supabase = createClient()

    const [chapterId, setChapterId] = useState<string>('')
    const [chapterTitle, setChapterTitle] = useState<string>('Detail Bab')
    const [questions, setQuestions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.resolve(params).then((resolvedParams) => {
            if (resolvedParams?.chapterid) {
                setChapterId(resolvedParams.chapterid)
            }
        })
    }, [params])

    useEffect(() => {
        if (!chapterId) return

        const fetchData = async () => {
            setLoading(true)

            const { data: chapData } = await supabase
                .from('practice_chapters')
                .select('title')
                .eq('id', chapterId)
                .single()

            if (chapData) {
                setChapterTitle(chapData.title)
            }

            const { data, error } = await supabase
                .from('questions')
                .select('*')
                .eq('chapter_id', chapterId)
                .order('created_at', { ascending: true })

            if (!error && data) {
                setQuestions(data)
            }
            setLoading(false)
        }

        fetchData()
    }, [chapterId, supabase])

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh] bg-white text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-gray-50 text-gray-900 p-6 md:p-10">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200">
                    <div>
                        <button 
                            onClick={() => router.back()} 
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 mb-3 inline-flex items-center gap-1.5 transition-colors"
                        >
                            ← Kembali ke Daftar Bab
                        </button>
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">{chapterTitle}</h1>
                        <p className="text-xs text-gray-400 mt-1 font-mono">ID: {chapterId}</p>
                    </div>

                    <button 
                        onClick={() => router.push(`/admin/practice/${chapterId}/create-question`)}
                        className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all active:scale-95"
                    >
                        + Tambah Soal Baru
                    </button>
                </div>

                {/* Content Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                            Daftar Soal ({questions.length})
                        </h2>
                    </div>

                    {questions.length === 0 ? (
                        <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-2xl shadow-xs">
                            <p className="text-sm text-gray-500 mb-3">Belum ada soal yang ditambahkan ke bab ini.</p>
                            <button 
                                onClick={() => router.push(`/admin/practice/${chapterId}/create-question`)}
                                className="text-xs font-semibold text-indigo-600 hover:underline"
                            >
                                Buat soal pertamamu sekarang →
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {questions.map((q, idx) => (
                                <div 
                                    key={q.id} 
                                    className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-gray-300 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                                >
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 text-xs font-bold rounded-md">
                                                #{idx + 1}
                                            </span>
                                            <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-md uppercase tracking-wide">
                                                {q.question_type ? q.question_type.replace(/_/g, ' ') : 'Multiple Choice'}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-800 mt-2 leading-relaxed">
                                            {q.question_text}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 self-end sm:self-center">
                                        <button 
                                            onClick={() => router.push(`/admin/practice/question/${q.id}/edit`)}
                                            className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 border border-gray-200 rounded-xl transition-all"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </main>
    )
}