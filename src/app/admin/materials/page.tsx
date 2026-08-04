'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Material = {
    id: string
    title: string
    created_at: string
    subjects?: {
        name: string
    } | { name: string }[] | null
}

export default function AdminDashboardPage() {
    const [materials, setMaterials] = useState<Material[]>([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState('')

    const supabase = createClient()
    const router = useRouter()

    // Ambil semua daftar materi beserta nama mapelnya
    const fetchMaterials = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('materials')
            .select(`
        id,
        title,
        created_at,
        subject_id,
        subjects:subject_id (
          name
        )
      `)
            .order('created_at', { ascending: false })

        if (!error && data) {
            setMaterials(data)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchMaterials()
    }, [supabase])

    // Fungsi untuk menghapus materi
    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation() // Mencegah navigasi card saat tombol hapus diklik
        if (!confirm('Apakah kamu yakin ingin menghapus materi ini?')) return

        const { error } = await supabase
            .from('materials')
            .delete()
            .eq('id', id)

        if (error) {
            alert(`Gagal menghapus: ${error.message}`)
        } else {
            setMessage('Materi berhasil dihapus!')
            fetchMaterials() // Refresh data list
            setTimeout(() => setMessage(''), 3000)
        }
    }

    return (
        <main className="min-h-screen bg-gray-50 p-4 md:p-8 flex justify-center">
            <div className="w-full max-w-4xl bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 flex flex-col">

                {/* Header & Tombol Aksi */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
                    <div>
                        <Link
                            href="/dashboard"
                            className="text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 mb-2 transition"
                        >
                            &larr; Kembali ke Dashboard Utama
                        </Link>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard Materi</h1>
                        <p className="text-sm text-gray-600 mt-1">Kelola seluruh modul materi TKA di satu tempat. Klik pada baris bab untuk mengelola sub-bab.</p>
                    </div>
                    <Link
                        href="/admin/materials/create"
                        className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition text-center shadow-sm text-sm"
                    >
                        + Tambah Materi Baru
                    </Link>
                </div>

                {/* Notifikasi */}
                {message && (
                    <div className="mb-6 p-4 rounded-2xl bg-green-50 text-green-600 border border-green-100 text-sm font-medium">
                        {message}
                    </div>
                )}

                {/* Daftar Tabel Materi */}
                {loading ? (
                    <div className="py-20 text-center text-blue-600 font-semibold animate-pulse">
                        Memuat data admin...
                    </div>
                ) : materials.length === 0 ? (
                    <div className="bg-gray-50 p-12 rounded-2xl border border-gray-200 text-center text-gray-500">
                        Belum ada materi yang tersimpan di database.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    <th className="py-3 px-4">Judul Materi (Bab)</th>
                                    <th className="py-3 px-4">Mata Pelajaran</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {materials.map((mat) => (
                                    <tr 
                                        key={mat.id} 
                                        onClick={() => router.push(`/admin/materials/${mat.id}/sub`)}
                                        className="hover:bg-blue-50/40 transition cursor-pointer group"
                                        title="Klik untuk mengelola sub-bab"
                                    >
                                        <td className="py-4 px-4 font-bold text-gray-800 group-hover:text-blue-600 transition">
                                            {mat.title}
                                            <span className="block text-[11px] font-normal text-gray-400 mt-0.5">Klik untuk atur sub-bab &rarr;</span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold">
                                                {Array.isArray(mat.subjects)
                                                    ? mat.subjects.length > 0
                                                        ? mat.subjects[0].name
                                                        : 'Umum'
                                                    : mat.subjects
                                                        ? mat.subjects.name
                                                        : 'Umum'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                                            <Link
                                                href={`/admin/materials/edit/${mat.id}`}
                                                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-600 text-amber-600 hover:text-white rounded-lg text-xs font-semibold transition inline-block"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={(e) => handleDelete(mat.id, e)}
                                                className="px-3 py-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-lg text-xs font-semibold transition"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Footer */}
                <div className="pt-6 mt-12 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-500 font-medium">
                        &copy; 2026 TKA Master &middot; Panel Administrator
                    </p>
                </div>

            </div>
        </main>
    )
}