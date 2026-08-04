'use client'

import { use, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
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
  sub_materials: SubMaterial[]
}

export default function MaterialsPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  const slug = resolvedParams.slug

  const [materials, setMaterials] = useState<Material[]>([])
  const [openMaterialId, setOpenMaterialId] = useState<string | null>(null)
  const [activeSubMaterial, setActiveSubMaterial] = useState<SubMaterial | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true)

  const supabase = createClient()

  useEffect(() => {
    let isMounted = true

    const fetchMaterialsBySlug = async () => {
      setIsLoading(true)
      try {
        const { data: subjectData, error: subjectError } = await supabase
          .from('subjects')
          .select('id')
          .eq('slug', slug)
          .single()

        if (subjectError || !subjectData) {
          console.error('Subject tidak ditemukan:', subjectError?.message)
          if (isMounted) setIsLoading(false)
          return
        }

        const { data, error } = await supabase
          .from('materials')
          .select(`
            id,
            title,
            sub_materials (
              id,
              title,
              content,
              order_index
            )
          `)
          .eq('subject_id', subjectData.id)
          .order('order_index', { referencedTable: 'sub_materials', ascending: true })

        if (error) {
          console.error('Gagal memuat materi:', error.message)
        } else if (data && isMounted) {
          setMaterials(data)
          if (data.length > 0) {
            setOpenMaterialId(data[0].id)
            if (data[0].sub_materials?.length > 0) {
              setActiveSubMaterial(data[0].sub_materials[0])
            }
          }
        }
      } catch (err) {
        console.error('Terjadi kesalahan tak terduga:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchMaterialsBySlug()

    return () => {
      isMounted = false
    }
  }, [slug])

  const toggleMaterial = (materialId: string) => {
    setOpenMaterialId(openMaterialId === materialId ? null : materialId)
  }

  const filteredMaterials = materials.filter((material) => {
    const matchesChapter = material.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSub = material.sub_materials?.some((sub) =>
      sub.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    return matchesChapter || matchesSub
  })

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-50 overflow-hidden relative font-sans">
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed lg:static z-30 inset-y-0 left-0 w-80 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none`}
      >
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <h2 className="font-bold text-base text-slate-900 tracking-tight">Daftar Bab Materi</h2>
            <p className="text-xs text-slate-500 mt-0.5">Pilih bab dan sub-bab untuk belajar</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            aria-label="Tutup Sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-3 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Cari materi atau sub-bab..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-3 overflow-y-auto flex-1 p-3 scrollbar-thin scrollbar-thumb-slate-200">
          {isLoading ? (
            <div className="space-y-3 pt-2">
              {[1, 2, 3].map((n) => (
                <div key={n} className="animate-pulse bg-slate-100 h-16 rounded-xl w-full" />
              ))}
            </div>
          ) : filteredMaterials.length > 0 ? (
            filteredMaterials.map((material) => {
              const isOpen = openMaterialId === material.id

              return (
                <div
                  key={material.id}
                  className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
                    isOpen ? 'border-blue-200 shadow-md bg-blue-50/10' : 'border-slate-200/80 hover:border-slate-300 bg-white shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between p-3.5 bg-linear-to-r from-slate-50/50 to-white">
                    <span className="font-semibold text-xs text-slate-800 line-clamp-2 pr-2 leading-relaxed">
                      {material.title}
                    </span>
                    <button
                      onClick={() => toggleMaterial(material.id)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all duration-200 shrink-0 shadow-sm ${
                        isOpen
                          ? 'bg-blue-600 text-white shadow-blue-500/20 hover:bg-blue-700'
                          : 'bg-white text-blue-600 border border-blue-100 hover:bg-blue-50'
                      }`}
                    >
                      {isOpen ? 'Tutup' : 'Buka'}
                    </button>
                  </div>

                  {isOpen && (
                    <div className="p-2 space-y-1 bg-white border-t border-slate-100">
                      {material.sub_materials?.length > 0 ? (
                        material.sub_materials.map((sub) => {
                          const isActive = activeSubMaterial?.id === sub.id
                          return (
                            <button
                              key={sub.id}
                              onClick={() => {
                                setActiveSubMaterial(sub)
                                if (window.innerWidth < 1024) setSidebarOpen(false)
                              }}
                              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all duration-150 flex items-center justify-between group ${
                                isActive
                                  ? 'bg-blue-600 text-white font-medium shadow-md shadow-blue-500/20'
                                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                              }`}
                            >
                              <span className="line-clamp-1 pr-2">{sub.title}</span>
                              <span
                                className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all ${
                                  isActive ? 'bg-white' : 'bg-transparent group-hover:bg-slate-300'
                                }`}
                              />
                            </button>
                          )
                        })
                      ) : (
                        <p className="text-xs text-slate-400 p-3 italic text-center">Belum ada sub-bab tersedia.</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <div className="text-center py-12 px-4">
              <svg className="w-10 h-10 mx-auto text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-xs text-slate-500 font-medium">Materi tidak ditemukan</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Coba kata kunci pencarian lain.</p>
            </div>
          )}
        </div>
      </aside>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs z-20 lg:hidden transition-opacity"
        />
      )}

      <main className="flex-1 flex flex-col h-full bg-slate-50/50 overflow-hidden relative">
        <div className="lg:hidden p-3 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-xs">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-semibold hover:bg-blue-100 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Buka Daftar Bab
          </button>
          <span className="text-xs font-medium text-slate-500 truncate max-w-50">
            {activeSubMaterial?.title || 'Pilih Materi'}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-12 flex justify-center">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6 sm:p-10 md:p-12 my-auto min-h-[75vh] flex flex-col justify-between transition-all">
            {isLoading ? (
              <div className="space-y-6 animate-pulse my-auto">
                <div className="h-8 bg-slate-100 rounded-xl w-3/4 mx-auto" />
                <div className="space-y-3 pt-6">
                  <div className="h-4 bg-slate-100 rounded-lg w-full" />
                  <div className="h-4 bg-slate-100 rounded-lg w-5/6 mx-auto" />
                  <div className="h-4 bg-slate-100 rounded-lg w-4/6 mx-auto" />
                </div>
              </div>
            ) : activeSubMaterial ? (
              <div className="space-y-8">
                <div className="border-b border-slate-100 pb-6 text-center">
                  <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 font-semibold text-xs rounded-full mb-3 uppercase tracking-wider">
                    Modul Pembelajaran
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                    {activeSubMaterial.title}
                  </h1>
                </div>

                <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm sm:text-base">
                  <MathText content={activeSubMaterial.content} />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center my-auto py-16 text-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Belum ada materi yang dipilih</h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  Silakan klik tombol <span className="font-semibold text-blue-600">&quot;Buka&quot;</span> pada salah satu bab di sebelah kiri untuk mulai membaca materi dan rumus.
                </p>
              </div>
            )}

            <div className="border-t border-slate-100 pt-6 mt-12 flex items-center justify-between text-xs text-slate-400">
              <span>Platform Pembelajaran TKA</span>
              <span>Modul Interaktif & KaTeX</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}