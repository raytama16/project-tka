'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

type Chapter = {
    id: string
    title: string
    description: string
}

export default function SubjectPracticeChaptersPage() {
    const params = useParams()
    const subjectSlug = params.slug as string
    
    const [chapters, setChapters] = useState<Chapter[]>([])
    const [subjectName, setSubjectName] = useState<string>('Mata Pelajaran')
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchChapters = async () => {
            if (!subjectSlug) {
                setLoading(false)
                return
            }
            setLoading(true)

            // PERBAIKAN: Cari berdasarkan kolom 'slug' (bukan 'id') di tabel subjects
            const { data: subjectData, error: subjectError } = await supabase
                .from('subjects')
                .select('id, name')
                .eq('slug', subjectSlug) // <-- Menggunakan .eq('slug', ...) agar tidak error 400 Bad Request
                .single()

            if (subjectError || !subjectData) {
                console.log("Error subject:", subjectError)
                setLoading(false)
                return
            }

            setSubjectName(subjectData.name)

            // Ambil daftar bab dari tabel 'practice_chapters' menggunakan subject_id yang valid
            const { data: chaptersData, error: chaptersError } = await supabase
                .from('practice_chapters')
                .select('id, title, description')
                .eq('subject_id', subjectData.id)
                .order('created_at', { ascending: true })

            if (!chaptersError && chaptersData) {
                setChapters(chaptersData)
            }
            setLoading(false)
        }

        fetchChapters()
    }, [subjectSlug, supabase])

    return (
        <main className="min-h-screen bg-gray-50 p-4 md:p-8 flex justify-center">
            <div className="w-full max-w-4xl bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 flex flex-col">
                <div className="mb-8 pb-6 border-b border-gray-100">
                    <Link
                        href={`/subjects/${subjectSlug}`}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 mb-2 transition"
                    >
                        &larr; Kembali ke Mata Pelajaran
                    </Link>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Latihan Soal: {subjectName}</h1>
                    <p className="text-sm text-gray-600 mt-1">Pilih bab di bawah ini untuk mulai mengerjakan paket 30-50 soal.</p>
                </div>

                {loading ? (
                    <div className="py-20 text-center text-blue-600 font-semibold animate-pulse">
                        Memuat daftar bab...
                    </div>
                ) : chapters.length === 0 ? (
                    <div className="bg-gray-50 p-12 rounded-2xl border border-gray-200 text-center text-gray-500">
                        Belum ada bab latihan soal untuk mata pelajaran ini.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {chapters.map((chap, index) => (
                            <div 
                                key={chap.id}
                                className="p-6 rounded-2xl border border-gray-100 hover:border-blue-200 bg-white hover:bg-blue-50/20 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                            >
                                <div>
                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block mb-2">
                                        Bab {index + 1}
                                    </span>
                                    <h2 className="text-lg font-bold text-gray-900">{chap.title}</h2>
                                    <p className="text-xs text-gray-500 mt-1">{chap.description || "Paket latihan soal interaktif."}</p>
                                </div>
                                <Link
                                    href={`/practice/${chap.id}`}
                                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition text-center shadow-sm"
                                >
                                    Mulai Latihan &rarr;
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}