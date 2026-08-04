'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

type Subject = {
  id: string
  name: string
  slug: string
}

export default function EditMaterialPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [subjectId, setSubjectId] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ text: '', isError: false })

  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const id = params.id as string

  useEffect(() => {
    async function fetchData() {
      // 1. Ambil daftar mata pelajaran untuk dropdown
      const { data: subData, error: subError } = await supabase
        .from('subjects')
        .select('*')
        .order('name', { ascending: true })

      if (!subError && subData) {
        setSubjects(subData)
      }

      // 2. Ambil data materi berdasarkan ID
      const { data: matData, error: matError } = await supabase
        .from('materials')
        .select('*')
        .eq('id', id)
        .single()

      if (matError || !matData) {
        setMessage({ text: 'Materi tidak ditemukan!', isError: true })
      } else {
        setTitle(matData.title)
        setSubjectId(matData.subject_id)
        setContent(matData.content)
      }

      setLoading(false)
    }

    if (id) {
      fetchData()
    }
  }, [id, supabase])

  // Fungsi saat form update disubmit
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ text: '', isError: false })

    if (!subjectId || !title || !content) {
      setMessage({ text: 'Semua kolom wajib diisi!', isError: true })
      setSaving(false)
      return
    }

    const { error } = await supabase
      .from('materials')
      .update({
        subject_id: subjectId,
        title: title,
        content: content,
      })
      .eq('id', id)

    if (error) {
      setMessage({ text: `Gagal memperbarui: ${error.message}`, isError: true })
      setSaving(false)
    } else {
      setMessage({ text: 'Materi berhasil diperbarui!', isError: false })
      setTimeout(() => {
        router.push('/admin/materials')
      }, 1500)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-blue-600 font-semibold animate-pulse">Memuat data materi...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 flex flex-col">
        
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/admin/materials" 
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 mb-4 transition"
          >
            &larr; Kembali ke Admin Dashboard
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Materi</h1>
          <p className="text-sm text-gray-600 mt-1">Perbarui judul, mata pelajaran, atau isi konten materi.</p>
        </div>

        {/* Notifikasi */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-2xl text-sm font-medium ${message.isError ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
            {message.text}
          </div>
        )}

        {/* Form Edit */}
        <form onSubmit={handleUpdate} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Mata Pelajaran</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-gray-800 bg-white"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Judul Materi / Bab</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Isi Konten Materi <span className="text-xs text-gray-400 font-normal">(Gunakan tanda $ untuk LaTeX)</span>
            </label>
            <textarea
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-gray-800 font-mono text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-sm disabled:opacity-50"
          >
            {saving ? 'Menyimpan Perubahan...' : 'Simpan Perubahan'}
          </button>
        </form>

        {/* Footer */}
        <div className="pt-6 mt-8 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500 font-medium">
            &copy; 2026 TKA Master &middot; Admin Panel
          </p>
        </div>

      </div>
    </main>
  )
}