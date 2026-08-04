'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateChapterPage() {
    const router = useRouter()
    const supabase = createClient()

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [subjectId, setSubjectId] = useState('')
    const [subjects, setSubjects] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    // Ambil daftar mata pelajaran (subjects) untuk pilihan dropdown
    useEffect(() => {
        const fetchSubjects = async () => {
            const { data, error } = await supabase
                .from('subjects') // Pastikan nama tabel mata pelajaranmu 'subjects'
                .select('id, name')
                .order('name', { ascending: true })

            if (!error && data) {
                setSubjects(data)
                if (data.length > 0) setSubjectId(data[0].id) // Default pilih yang pertama
            }
        }

        fetchSubjects()
    }, [supabase])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim() || !subjectId) {
            alert('Judul dan Mata Pelajaran wajib diisi!')
            return
        }

        setLoading(true)

        const { error } = await supabase
            .from('practice_chapters')
            .insert([
                {
                    title,
                    description,
                    subject_id: subjectId, // Menyimpan ID mapel yang dipilih (misal: Matematika, B. Indo, B. Inggris)
                }
            ])

        setLoading(false)

        if (error) {
            alert('Gagal membuat bab: ' + error.message)
        } else {
            router.push('/admin/practice')
            router.refresh()
        }
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
                    <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Tambah Bab Latihan Baru</h1>
                    <p className="text-xs text-gray-500 mt-1">Pilih mata pelajaran dan tentukan judul bab.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-5">
                    
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
                            {subjects.map((sub) => (
                                <option key={sub.id} value={sub.id}>
                                    {sub.name}
                                </option>
                            ))}
                        </select>
                        <p className="text-[11px] text-gray-400 mt-1">Contoh: Matematika, Bahasa Indonesia, atau Bahasa Inggris.</p>
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
                            disabled={loading}
                            className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
                        >
                            {loading ? 'Menyimpan...' : 'Simpan Bab'}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    )
}