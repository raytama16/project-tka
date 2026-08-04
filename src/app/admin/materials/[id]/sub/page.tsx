'use client'

import { use, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import MathText from '@/components/MathText'

type SubMaterial = {
  id: string
  title: string
  content: string
  order_index: number
}

type Material = {
  id: string
  title: string
}

export default function AdminSubMaterialManagePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const materialId = resolvedParams.id

  const [material, setMaterial] = useState<Material | null>(null)
  const [subMaterials, setSubMaterials] = useState<SubMaterial[]>([])
  
  // State Form & Mode Edit
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [orderIndex, setOrderIndex] = useState(1)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form')

  const supabase = createClient()

  useEffect(() => {
    fetchMaterialAndSubs()
  }, [materialId])

  const fetchMaterialAndSubs = async () => {
    setLoading(true)
    // 1. Ambil detail Bab utama
    const { data: matData, error: matError } = await supabase
      .from('materials')
      .select('id, title')
      .eq('id', materialId)
      .single()

    if (matError) {
      console.error('Gagal memuat bab:', matError.message)
    } else {
      setMaterial(matData)
    }

    // 2. Ambil daftar sub-bab di bab ini
    const { data: subData, error: subError } = await supabase
      .from('sub_materials')
      .select('*')
      .eq('material_id', materialId)
      .order('order_index', { ascending: true })

    if (!subError && subData) {
      setSubMaterials(subData)
      // Jika sedang tidak mode edit, set default order_index berikutnya
      if (!editingId) {
        setOrderIndex(subData.length + 1)
      }
    }

    setLoading(false)
  }

  // Fungsi Submit (Bisa untuk Tambah Baru atau Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      alert('Judul dan isi konten sub-bab tidak boleh kosong!')
      return
    }

    setSubmitting(true)

    if (editingId) {
      // Mode Edit / Update
      const { error } = await supabase
        .from('sub_materials')
        .update({
          title,
          content,
          order_index: orderIndex,
        })
        .eq('id', editingId)

      if (error) {
        alert('Gagal memperbarui sub-bab: ' + error.message)
      } else {
        setMessage('Sub-bab berhasil diperbarui!')
        resetForm()
        fetchMaterialAndSubs()
        setTimeout(() => setMessage(''), 3000)
      }
    } else {
      // Mode Tambah Baru
      const { error } = await supabase.from('sub_materials').insert([
        {
          material_id: materialId,
          title,
          content,
          order_index: orderIndex,
        },
      ])

      if (error) {
        alert('Gagal menyimpan sub-bab: ' + error.message)
      } else {
        setMessage('Sub-bab berhasil ditambahkan!')
        resetForm()
        fetchMaterialAndSubs()
        setTimeout(() => setMessage(''), 3000)
      }
    }

    setSubmitting(false)
  }

  // Masuk ke Mode Edit
  const handleEditClick = (sub: SubMaterial) => {
    setEditingId(sub.id)
    setTitle(sub.title)
    setContent(sub.content)
    setOrderIndex(sub.order_index)
    setActiveTab('form') // Pindah otomatis ke tab form
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Reset Form kembali ke mode tambah
  const resetForm = () => {
    setEditingId(null)
    setTitle('')
    setContent('')
    setOrderIndex(subMaterials.length + 1)
  }

  const handleDeleteSub = async (subId: string) => {
    if (!confirm('Yakin ingin menghapus sub-bab ini?')) return

    const { error } = await supabase
      .from('sub_materials')
      .delete()
      .eq('id', subId)

    if (error) {
      alert('Gagal menghapus: ' + error.message)
    } else {
      setMessage('Sub-bab berhasil dihapus!')
      fetchMaterialAndSubs()
      if (editingId === subId) resetForm()
      setTimeout(() => setMessage(''), 3000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-blue-600 font-semibold animate-pulse">
        Memuat data bab dan sub-bab...
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 flex flex-col">
        
        {/* Header Navigasi */}
        <div className="mb-6 pb-6 border-b border-gray-100">
          <Link
            href="/admin/materials"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 mb-2 transition"
          >
            &larr; Kembali ke Daftar Bab
          </Link>
          <span className="block text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Pengelolaan Sub-Bab</span>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {material ? material.title : 'Bab Tidak Ditemukan'}
          </h1>
          <p className="text-sm text-gray-600 mt-1">Tambah, edit, dan atur sub-bab materi di bawah bab utama ini.</p>
        </div>

        {/* Notifikasi */}
        {message && (
          <div className="mb-6 p-4 rounded-2xl bg-green-50 text-green-600 border border-green-100 text-sm font-medium">
            {message}
          </div>
        )}

        {/* Tab Navigasi Form vs Daftar Sub-Bab */}
        <div className="flex items-center justify-between border-b border-gray-100 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (editingId) resetForm()
                setActiveTab('form')
              }}
              className={`pb-3 px-4 text-sm font-semibold transition border-b-2 ${
                activeTab === 'form'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {editingId ? 'Edit Sub-Bab' : '+ Tambah Sub-Bab Baru'}
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`pb-3 px-4 text-sm font-semibold transition border-b-2 ${
                activeTab === 'preview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              Daftar Sub-Bab ({subMaterials.length})
            </button>
          </div>

          {editingId && activeTab === 'form' && (
            <button
              onClick={resetForm}
              className="mb-2 text-xs text-red-500 hover:underline font-medium"
            >
              Batal Edit
            </button>
          )}
        </div>

        {activeTab === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {editingId && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-xs font-medium flex items-center justify-between">
                <span>Sedang dalam mode edit sub-bab.</span>
                <button type="button" onClick={resetForm} className="underline font-bold">Batalkan</button>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Judul Sub-Bab</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: 1.1 Pengertian Dasar & Rumus Utama"
                className="w-full text-gray-500 border border-gray-200 p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Urutan (Order Index)</label>
              <input
                type="number"
                value={orderIndex}
                onChange={(e) => setOrderIndex(Number(e.target.value))}
                className="w-full text-gray-500 border border-gray-200 p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Isi Materi (Mendukung Markdown & Rumus KaTeX $...$ / $$...$$)
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                placeholder="Tulis penjelasan materi di sini..."
                className="w-full text-gray-500 border border-gray-200 p-3 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                required
              />
            </div>

            {/* Preview Render KaTeX langsung di Admin */}
            {content.trim() && (
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Preview Tampilan Rumus:</span>
                <div className="prose text-sm text-gray-800">
                  <MathText content={content} />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={`w-full font-bold py-3 px-6 rounded-xl transition shadow-sm text-sm text-white ${
                editingId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {submitting ? 'Menyimpan...' : editingId ? 'Perbarui Sub-Bab' : 'Simpan Sub-Bab'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            {subMaterials.length === 0 ? (
              <div className="bg-gray-50 p-12 rounded-2xl border border-gray-200 text-center text-gray-500 text-sm">
                Belum ada sub-bab yang ditambahkan untuk bab ini.
              </div>
            ) : (
              subMaterials.map((sub) => (
                <div key={sub.id} className="p-4 rounded-2xl border border-gray-200 bg-white flex items-center justify-between gap-4 shadow-xs">
                  <div>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full mr-2">
                      Urutan: {sub.order_index}
                    </span>
                    <h3 className="font-bold text-gray-800 text-sm mt-1">{sub.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleEditClick(sub)}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-600 text-amber-600 hover:text-white rounded-lg text-xs font-semibold transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteSub(sub.id)}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-lg text-xs font-semibold transition"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))
            )}
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