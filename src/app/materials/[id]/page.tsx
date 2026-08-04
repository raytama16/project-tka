'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import MathText from '@/components/MathText'

type Material = {
  id: string
  title: string
  content: string
  subject_id: string
  subjects?: {
    name: string
    slug: string
  }
}

export default function MaterialDetailPage() {
  const [material, setMaterial] = useState<Material | null>(null)
  const [loading, setLoading] = useState(true)
  

  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const id = params.id as string

  useEffect(() => {
    async function fetchMaterialDetail() {
      // Ambil detail materi beserta informasi nama mapelnya (relasi tabel)
      const { data, error } = await supabase
        .from('materials')
        .select(`
          *,
          subjects (
            name,
            slug
          )
        `)
        .eq('id', id)
        .single()

      if (error || !data) {
        router.push('/dashboard')
        return
      }

      setMaterial(data)
      setLoading(false)
    }

    if (id) {
      fetchMaterialDetail()
    }
  }, [id, supabase, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-blue-600 font-semibold animate-pulse">Memuat isi materi...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4 md:p-8">
      {/* Container Putih Besar di Tengah */}
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 flex flex-col justify-between min-h-137.5">
        
        <div>
          {/* Tombol Kembali ke Daftar Materi */}
          <div className="mb-6 flex items-center justify-between">
            <Link 
              href={material?.subjects ? `/subjects/${material.subjects.slug}/materials` : '/dashboard'} 
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 transition"
            >
              &larr; Kembali ke Daftar Materi
            </Link>
            <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
              {material?.subjects?.name || 'Mata Pelajaran'}
            </span>
          </div>

          {/* Judul Materi */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {material?.title}
          </h1>

          <hr className="border-gray-100 mb-6" />

          {/* Isi Konten Materi */}
          <div className="prose max-w-none text-gray-700 leading-relaxed space-y-4 text-base md:text-lg whitespace-pre-line">
            <MathText content={material?.content || ''} />
          </div>
        </div>

        {/* Footer Hak Cipta di Bawah Card */}
        <div className="pt-8 mt-12 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500 font-medium">
            &copy; 2026 TKA Master &middot; Hak Cipta Dilindungi Undang-Undang
          </p>
        </div>

      </div>
    </main>
  )
}