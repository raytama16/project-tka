'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Subject = {
  [x: string]: any
  id: string
  name: string
  description: string | null
  created_at: string
}

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setSubjects(data)
    }
    setLoading(false)
  }


  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    setSubmitting(true)
    const { error } = await supabase.from('subjects').insert([
      { title: newTitle, description: newDesc }
    ])

    if (!error) {
      setNewTitle('')
      setNewDesc('')
      setShowModal(false)
      fetchSubjects()
    } else {
      alert('Gagal menambah mata pelajaran: ' + error.message)
    }
    setSubmitting(false)
  }

  const handleDeleteSubject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation() // Mencegah agar card tidak ikut terklik (redirect)
    if (!confirm('Apakah Anda yakin ingin menghapus mapel ini? Semua materi & soal terkait bisa ikut terhapus!')) return

    const { error } = await supabase.from('subjects').delete().eq('id', id)
    if (!error) {
      fetchSubjects()
    } else {
      alert('Gagal menghapus mapel: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-purple-600 font-semibold animate-pulse">
        Memuat daftar mata pelajaran...
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 flex flex-col">
        
        {/* Header Title & Tombol Tambah */}
        <div className="mb-8 pb-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1 block">Panel Administrator</span>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Daftar Mata Pelajaran</h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-2 shrink-0"
          >
            + Tambah Mata Pelajaran
          </button>
        </div>

        {/* Grid List Mata Pelajaran */}
        {subjects.length === 0 ? (
          <div className="bg-gray-50 p-12 rounded-2xl border border-gray-200 text-center flex flex-col items-center justify-center gap-3">
            <p className="text-sm font-medium text-gray-500">Belum ada mata pelajaran yang terdaftar.</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl text-xs font-bold transition"
            >
              Buat Mapel Pertama
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map((subj) => (
              <div
                key={subj.id}
                onClick={() => router.push(`/admin/subjects/${subj.id}/exams`)}
                className="p-5 rounded-2xl border border-gray-200 bg-white hover:border-purple-300 hover:shadow-md cursor-pointer transition flex flex-col justify-between gap-4 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100 group-hover:bg-purple-600 group-hover:text-white transition">
                      Buka Ujian &rarr;
                    </span>
                    <button
                      onClick={(e) => handleDeleteSubject(subj.id, e)}
                      className="text-xs font-bold text-red-500 hover:text-red-700 px-2 py-1 bg-red-50 hover:bg-red-100 rounded-lg transition"
                    >
                      Hapus
                    </button>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 group-hover:text-purple-700 transition">
                    {subj.name}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {subj.description || 'Tidak ada deskripsi mata pelajaran.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-medium">
                  <span>Dibuat: {new Date(subj.created_at).toLocaleDateString('id-ID')}</span>
                  <span className="font-semibold text-purple-600">Kelola Exams</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Tambah Mata Pelajaran */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-xl border border-gray-100 flex flex-col gap-4 animate-in fade-in zoom-in duration-200">
              <h2 className="text-xl font-bold text-gray-900">Tambah Mata Pelajaran</h2>
              
              <form onSubmit={handleCreateSubject} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Judul Mata Pelajaran</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Contoh: Matematika Lanjut"
                    className="w-full p-3 text-gray-700 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Deskripsi (Opsional)</label>
                  <textarea
                    rows={3}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Deskripsi singkat mengenai mata pelajaran..."
                    className="w-full p-3 text-gray-700 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition disabled:opacity-50"
                  >
                    {submitting ? 'Menyimpan...' : 'Simpan Mapel'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="pt-6 mt-12 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400 font-medium">&copy; 2026 TKA Master &middot; Panel Administrator</p>
        </div>

      </div>
    </main>
  )
}