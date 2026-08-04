'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function EditChapterPage({ params }: { params: { chapterid: string } | Promise<{ chapterid: string }> }) {
    const router = useRouter()
    const supabase = createClient()

    const [chapterId, setChapterId] = useState<string>('')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [subjectId, setSubjectId] = useState('')
    const [subjects, setSubjects] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // 1. Unwrap parameter rute [chapterid]
    useEffect(() => {
        Promise.resolve(params).then((resolvedParams) => {
            if (resolvedParams?.chapterid) {
                setChapterId(resolvedParams.chapterid)
            }
        })
    }, [params])

    // 2. Ambil daftar mata pelajaran DAN data bab yang mau diedit
    useEffect(() => {
        if (!chapterId) return

        const fetchData = async () => {
            setLoading(true)

            // Ambil pilihan mata pelajaran untuk dropdown
            const { data: subData } = await supabase
                .from('subjects')
                .select('id, name')
                .order('name', { ascending: true })

            if (subData) {
                setSubjects(subData)
            }

            // Ambil data bab yang sedang diedit berdasarkan ID-nya
            const { data: chapData, error } = await supabase
                .from('practice_chapters')
                .select('title, description, subject_id')
                .eq('id', chapterId)
                .single()

            if (error) {
                alert('Gagal memuat data bab: ' + error.message)
            } else if (chapData) {
                setTitle(chapData.title)
                setDescription(chapData.description || '')
                setSubjectId(chapData.subject_id || '')
            }

            setLoading(false)
        }

        fetchData()
    }, [chapterId, supabase])

    // 3. Handle Update ke Database
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim() || !subjectId) {
            alert('Judul dan Mata Pelajaran wajib diisi!')
            return
        }

        setSaving(true)

        const { error } = await supabase
            .from('practice_chapters')
            .update({
                title,
                description,
                subject_id: subjectId,
            })
            .eq('id', chapterId)

        setSaving(false)

        if (error) {
            alert('Gagal memperbarui bab: ' + error.message)
        } else {
            router.push(`/admin/practice`)
            router.refresh()
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh] bg-white text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-gray-50 text-gray-900 p-6 md:p-10">
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <button 
                        onClick={() => router.back()} 
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 mb-2 inline-flex items-center gap-1.5"
                    >
                        ← Kembali
                    </button>
                    <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Edit Bab Latihan</h1>
                    <p className="text-xs text-gray-500 mt-1">Perbarui informasi mata pelajaran, judul, atau deskripsi bab.</p>
                </div>

                <form onSubmit={handleUpdate} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-5">
                    
                    {/* Pilihan Mata Pelajaran */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                            Mata Pelajaran
                        </label>
                        <select
                            value={subjectId}
                            onChange={(e) => setSubjectId(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="" disabled>Pilih Mata Pelajaran</option>
                            {subjects.map((sub) => (
                                <option key={sub.id} value={sub.id}>
                                    {sub.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Judul Bab */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                            Judul Bab
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Misal: Persamaan Kuadrat"
                            required
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Deskripsi */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                            Deskripsi (Opsional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Ringkasan singkat mengenai bab ini..."
                            rows={3}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-4 py-2.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
                        >
                            {saving ? 'Menyimpan Perubahan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    )
}