'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Chapter = {
    id: string
    title: string
    description?: string
}

export default function AdminPracticeDashboard() {
    const router = useRouter()
    const supabase = createClient()
    const [chapters, setChapters] = useState<Chapter[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchChapters()
    }, [])

    const fetchChapters = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('practice_chapters')
            .select('*')
            .order('title', { ascending: true })

        if (!error && data) {
            setChapters(data)
        }
        setLoading(false)
    }

    const handleDeleteChapter = async (chapId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!confirm('Menghapus bab ini juga akan menghapus seluruh soal di dalamnya. Lanjutkan?')) return

        await supabase.from('questions').delete().eq('chapter_id', chapId)
        const { error } = await supabase.from('practice_chapters').delete().eq('id', chapId)

        if (!error) {
            setChapters(prev => prev.filter(c => c.id !== chapId))
        } else {
            alert('Gagal menghapus bab.')
        }
    }

    return (
        <main className="min-h-screen bg-gray-50 p-4 md:p-8 flex flex-col items-center">
            <div className="w-full max-w-4xl flex flex-col gap-6">
                
                {/* Header */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full uppercase">
                            Admin Panel
                        </span>
                        <h1 className="text-2xl font-extrabold text-gray-900 mt-2">Manajemen Latihan Soal</h1>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => router.back()}
                            className="px-4 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-xs font-bold transition"
                        >
                            Kembali
                        </button>
                        <button
                            onClick={() => router.push('/admin/practice/create-chapter')}
                            className="px-4 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition shadow-sm"
                        >
                            + Buat Bab Baru
                        </button>
                    </div>
                </div>

                {/* List Bab */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
                    <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Daftar Bab Latihan</h2>

                    {loading ? (
                        <p className="text-xs text-blue-600 py-8 text-center animate-pulse">Memuat daftar bab...</p>
                    ) : chapters.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-sm text-gray-400 mb-4">Belum ada bab latihan yang dibuat.</p>
                            <button
                                onClick={() => router.push('/admin/practice/create-chapter')}
                                className="px-4 py-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-xl text-xs font-bold transition"
                            >
                                Buat Bab Pertama
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {chapters.map(chap => (
                                <div
                                    key={chap.id}
                                    onClick={() => router.push(`/admin/practice/${chap.id}`)}
                                    className="p-5 rounded-2xl border border-gray-200 bg-white hover:border-purple-300 hover:shadow-md transition cursor-pointer flex items-center justify-between"
                                >
                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-base font-bold text-gray-900">{chap.title}</h3>
                                        {chap.description && (
                                            <p className="text-xs text-gray-500 line-clamp-1">{chap.description}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                        <button
                                            onClick={() => router.push(`/admin/practice/${chap.id}/edit`)}
                                            className="px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-xs font-bold transition"
                                        >
                                            Edit Bab
                                        </button>
                                        <button
                                            onClick={(e) => handleDeleteChapter(chap.id, e)}
                                            className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition"
                                        >
                                            Hapus
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