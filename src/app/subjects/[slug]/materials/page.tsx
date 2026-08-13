'use client'

import { use, useEffect, useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import MathText from '@/components/MathText'
import { Lock, Sparkles, X, MessageCircle, CheckCircle2, Search, BookOpen, Menu, ChevronRight } from 'lucide-react'

type SubMaterial = {
  id: string
  title: string
  content: string
  order_index: number
  is_free: boolean
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
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)

  // State untuk sistem pengecekan premium user & modal WhatsApp
  const [isPremium, setIsPremium] = useState<boolean>(false)
  const [showModal, setShowModal] = useState<boolean>(false)

  // Ref untuk kontainer scroll konten agar bisa di-reset ke atas
  const contentContainerRef = useRef<HTMLDivElement>(null)

  const supabase = createClient()

  useEffect(() => {
    let isMounted = true

    const fetchMaterialsBySlug = async () => {
      setIsLoading(true)
      try {
        // 1. Cek status user login & status is_premium dari tabel profiles
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('is_premium')
            .eq('id', user.id)
            .single()
          
          if (profileData && isMounted) {
            setIsPremium(!!profileData.is_premium)
          }
        }

        // 2. Ambil ID subject berdasarkan slug
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

        // 3. Ambil data materials beserta sub_materials
        const { data, error } = await supabase
          .from('materials')
          .select(`
            id,
            title,
            sub_materials (
              id,
              title,
              content,
              order_index,
              is_free
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
  }, [slug, supabase])

  // Efek untuk mereset posisi scroll ke paling atas setiap kali sub-materi diganti
  useEffect(() => {
    if (contentContainerRef.current) {
      contentContainerRef.current.scrollTop = 0
    }
  }, [activeSubMaterial])

  const toggleMaterial = (materialId: string) => {
    setOpenMaterialId(openMaterialId === materialId ? null : materialId)
  }

  // Handler saat sub-materi diklik di sidebar
  const handleSubMaterialClick = (sub: SubMaterial) => {
    if (sub.is_free || isPremium) {
      setActiveSubMaterial(sub)
      setSidebarOpen(false) // Otomatis tutup sidebar di HP setelah diklik
    } else {
      setShowModal(true)
    }
  }

  const filteredMaterials = materials.filter((material) => {
    const matchesChapter = material.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSub = material.sub_materials?.some((sub) =>
      sub.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    return matchesChapter || matchesSub
  })

  // Kontak WhatsApp Admin
  const adminWhatsAppNumber = "6285792108262" 
  const messageText = encodeURIComponent("Halo Admin, saya ingin berlangganan akun Premium Platform Belajar untuk membuka semua akses materi dan modul pembelajaran.")
  const whatsappUrl = `https://wa.me/${adminWhatsAppNumber}?text=${messageText}`

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-100 overflow-hidden relative font-sans">
      
      {/* ================= SIDEBAR DESKTOP & MOBILE DRAWER ================= */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-80 sm:w-88 bg-white border-r border-slate-200/80 flex flex-col h-full shrink-0 transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header Sidebar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-slate-900 tracking-tight">Daftar Bab Materi</h2>
              <p className="text-[11px] text-slate-500">Pilih bab & sub-bab belajar</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Tutup Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Pencarian */}
        <div className="p-3.5 border-b border-slate-100 bg-slate-50/60 shrink-0">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Cari materi atau sub-bab..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
            />
          </div>
        </div>

        {/* List Bab & Sub-Bab */}
        <div className="space-y-3 overflow-y-auto flex-1 p-3.5 scrollbar-thin scrollbar-thumb-slate-200">
          {isLoading ? (
            <div className="space-y-3 pt-2">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="animate-pulse bg-slate-100 h-16 rounded-2xl w-full" />
              ))}
            </div>
          ) : filteredMaterials.length > 0 ? (
            filteredMaterials.map((material) => {
              const isOpen = openMaterialId === material.id

              return (
                <div
                  key={material.id}
                  className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
                    isOpen ? 'border-blue-300 shadow-sm bg-blue-50/10' : 'border-slate-200/80 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between p-3.5 bg-linear-to-r from-slate-50/60 to-white">
                    <span className="font-semibold text-xs sm:text-sm text-slate-800 line-clamp-2 pr-2 leading-relaxed">
                      {material.title}
                    </span>
                    <button
                      onClick={() => toggleMaterial(material.id)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all duration-200 shrink-0 shadow-2xs cursor-pointer ${
                        isOpen
                          ? 'bg-blue-600 text-white shadow-blue-500/20 hover:bg-blue-700'
                          : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
                      }`}
                    >
                      {isOpen ? 'Tutup' : 'Buka'}
                    </button>
                  </div>

                  {isOpen && (
                    <div className="p-2 space-y-1.5 bg-white border-t border-slate-100">
                      {material.sub_materials?.length > 0 ? (
                        material.sub_materials.map((sub) => {
                          const isActive = activeSubMaterial?.id === sub.id
                          const isAccessible = sub.is_free || isPremium

                          return (
                            <button
                              key={sub.id}
                              onClick={() => handleSubMaterialClick(sub)}
                              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs sm:text-sm transition-all duration-150 flex items-center justify-between group cursor-pointer ${
                                isActive
                                  ? 'bg-blue-600 text-white font-medium shadow-md shadow-blue-500/25'
                                  : isAccessible 
                                    ? 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                                    : 'text-slate-400 hover:bg-slate-50 bg-slate-50/60'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 pr-2 min-w-0">
                                {!isAccessible && <Lock className="w-3.5 h-3.5 shrink-0 text-amber-500" />}
                                <span className="truncate">{sub.title}</span>
                              </div>

                              <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${isActive ? 'text-white translate-x-0.5' : 'text-slate-300 group-hover:text-slate-400'}`} />
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
              <Search className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-[1.5]" />
              <p className="text-xs sm:text-sm text-slate-600 font-semibold">Materi tidak ditemukan</p>
              <p className="text-xs text-slate-400 mt-0.5">Coba gunakan kata kunci pencarian lain.</p>
            </div>
          )}
        </div>
      </aside>

      {/* Backdrop Sidebar Mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden transition-opacity"
        />
      )}

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="flex-1 flex flex-col h-full bg-slate-100/70 overflow-hidden relative min-w-0">
        
        {/* Mobile Top Navigation Bar */}
        <div className="lg:hidden p-3.5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-2xs z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition cursor-pointer"
          >
            <Menu className="w-4 h-4" />
            <span>Daftar Bab</span>
          </button>
          <span className="text-xs font-semibold text-slate-700 truncate max-w-45 sm:max-w-xs px-2">
            {activeSubMaterial?.title || 'Pilih Materi'}
          </span>
        </div>

        {/* Content Scrollable Container (Dilengkapi ref untuk auto-scroll ke atas) */}
        <div 
          ref={contentContainerRef} 
          className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6 md:p-10 flex justify-center"
        >
          <div className="w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/80 p-5 sm:p-10 md:p-12 my-auto min-h-[75vh] flex flex-col justify-between transition-all">
            
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
              <div className="space-y-6 sm:space-y-8 min-w-0">
                {/* Judul & Badge Header */}
                <div className="border-b border-slate-100 pb-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 font-bold text-[10px] sm:text-xs rounded-full uppercase tracking-wider">
                      Modul Pembelajaran
                    </span>
                    {activeSubMaterial.is_free ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-extrabold rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Gratis
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200/60 text-[10px] font-extrabold rounded-full">
                        <Lock className="w-3 h-3" /> Premium
                      </span>
                    )}
                  </div>
                  <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-snug wrap-break-word px-2">
                    {activeSubMaterial.title}
                  </h1>
                </div>

                {/* Konten Materi (Anti Meluber / Overflow Fix) */}
                <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm sm:text-base wrap-break-word overflow-x-hidden">
                  <MathText content={activeSubMaterial.content} />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center my-auto py-16 text-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">Belum ada materi yang dipilih</h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm px-4">
                  Silakan klik tombol <span className="font-semibold text-blue-600">&quot;Buka&quot;</span> pada salah satu bab di sebelah kiri untuk mulai membaca materi dan rumus.
                </p>
              </div>
            )}

            {/* Footer Kartu Materi */}
            <div className="border-t border-slate-100 pt-6 mt-12 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2 text-center sm:text-left">
              <span>Platform Pembelajaran TKA</span>
              <span>Modul Interaktif & KaTeX</span>
            </div>
          </div>
        </div>
      </main>

      {/* ================= MODAL POP-UP LANGGANAN WHATSAPP ================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative border border-slate-100 text-center overflow-hidden">
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/60 rounded-full blur-2xl pointer-events-none" />

            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 w-9 h-9 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 bg-linear-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-500/25">
              <Lock className="w-8 h-8" />
            </div>

            <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-[10px] font-extrabold px-3 py-1 rounded-full border border-blue-100 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Konten Khusus Premium</span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Akses Terbatas ke Sub-Materi Ini
            </h3>

            <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed px-2">
              Materi dan pembahasan mendalam ini hanya terbuka untuk akun yang telah berlangganan paket Premium. Hubungi admin untuk upgrade sekarang!
            </p>

            <div className="mt-8 flex flex-col gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>Langganan via Chat WhatsApp</span>
              </a>

              <button
                onClick={() => setShowModal(false)}
                className="w-full py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs sm:text-sm rounded-2xl transition cursor-pointer"
              >
                Nanti Saja
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}