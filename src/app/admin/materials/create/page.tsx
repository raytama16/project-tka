'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Subject = {
  id: string
  name: string
  slug: string
}

export default function CreateMaterialPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [subjectId, setSubjectId] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', isError: false })

  const router = useRouter()
  const supabase = createClient()

  // Ambil daftar mata pelajaran untuk pilihan dropdown
  useEffect(() => {
    async function fetchSubjects() {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name', { ascending: true })

      if (!error && data) {
        setSubjects(data)
        if (data.length > 0) setSubjectId(data[0].id)
      }
    }
    fetchSubjects()
  }, [supabase])

  // Fungsi saat form disubmit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ text: '', isError: false })

    if (!subjectId || !title || !content) {
      setMessage({ text: 'Semua kolom wajib diisi!', isError: true })
      setLoading(false)
      return
    }

    // Masukkan data ke tabel materials Supabase
    const { error } = await supabase.from('materials').insert([
      {
        subject_id: subjectId,
        title: title,
        content: content,
      },
    ])

    if (error) {
      setMessage({ text: `Gagal menyimpan: ${error.message}`, isError: true })
      setLoading(false)
    } else {
      setMessage({ text: 'Materi berhasil ditambahkan!', isError: false })
      setTitle('')
      setContent('')
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 flex flex-col">
        
        {/* Header & Navigasi */}
        <div className="mb-6">
          <Link 
            href="/dashboard" 
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 mb-4 transition"
          >
            &larr; Kembali ke Dashboard
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Tambah Materi Baru</h1>
          <p className="text-sm text-gray-600 mt-1">Gunakan format $rumus$ untuk menulis simbol matematika LaTeX.</p>
        </div>

        {/* Notifikasi Pesan */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-2xl text-sm font-medium ${message.isError ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
            {message.text}
          </div>
        )}

        {/* Form Input */}
        <form onSubmit={handleSubmit} className="space-y-5">
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
              placeholder="Contoh: Persamaan Kuadrat dan Akar-akarnya"
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
              placeholder="Tulis materi di sini... Contoh: Rumus abc adalah x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-gray-800 font-mono text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-sm disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : 'Simpan Materi'}
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