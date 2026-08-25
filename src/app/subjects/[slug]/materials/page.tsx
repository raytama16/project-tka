'use client'

import { use, useEffect, useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import MathText from '@/components/MathText'
import { 
  Lock, Sparkles, X, MessageCircle, CheckCircle2, 
  Search, BookOpen, Menu, ChevronRight, ArrowLeft 
} from 'lucide-react'
import { useRouter } from 'next/navigation'

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
  const router = useRouter()

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
    <div className="flex h-[calc(100vh-4rem)] bg-slate-100 dark:bg-gray-950 overflow-hidden relative font-sans transition-colors duration-300">
      
      {/* ================= SIDEBAR DESKTOP & MOBILE DRAWER ================= */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-80 sm:w-88 bg-white dark:bg-gray-900 border-r border-slate-200/80 dark:border-gray-800 flex flex-col h-full shrink-0 transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header Sidebar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 shrink-0">
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => router.back()}
              className="p-2 rounded-xl bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition shadow-2xs cursor-pointer group"
              title="Kembali"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-slate-900 dark:text-gray-100 tracking-tight">Daftar Bab Materi</h2>
              <p className="text-[11px] text-slate-500 dark:text-gray-400">Pilih bab & sub-bab belajar</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-xl text-slate-400 dark:text-gray-400 hover:text-slate-600 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-800 transition cursor-pointer"
            aria-label="Tutup Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Pencarian */}
        <div className="p-3.5 border-b border-slate-100 dark:border-gray-800 bg-slate-50/60 dark:bg-gray-900/50 shrink-0">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 dark:text-gray-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Cari materi atau sub-bab..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
            />
          </div>
        </div>

        {/* List Bab & Sub-Bab */}
        <div className="space-y-3 overflow-y-auto flex-1 p-3.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-gray-800">
          {isLoading ? (
            <div className="space-y-3 pt-2">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="animate-pulse bg-slate-100 dark:bg-gray-800 h-16 rounded-2xl w-full" />
              ))}
            </div>
          ) : filteredMaterials.length > 0 ? (
            filteredMaterials.map((material) => {
              const isOpen = openMaterialId === material.id

              return (
                <div
                  key={material.id}
                  className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
                    isOpen 
                      ? 'border-blue-300 dark:border-blue-700/60 shadow-sm bg-blue-50/10 dark:bg-blue-950/20' 
                      : 'border-slate-200/80 dark:border-gray-800 hover:border-slate-300 dark:hover:border-gray-700 bg-white dark:bg-gray-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-slate-50/60 to-white dark:from-gray-800/40 dark:to-gray-800/20">
                    <span className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-gray-200 line-clamp-2 pr-2 leading-relaxed">
                      {material.title}
                    </span>
                    <button
                      onClick={() => toggleMaterial(material.id)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all duration-200 shrink-0 shadow-2xs cursor-pointer ${
                        isOpen
                          ? 'bg-blue-600 text-white shadow-blue-500/20 hover:bg-blue-700'
                          : 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {isOpen ? 'Tutup' : 'Buka'}
                    </button>
                  </div>

                  {isOpen && (
                    <div className="p-2 space-y-1.5 bg-white dark:bg-gray-900 border-t border-slate-100 dark:border-gray-800">
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
                                    ? 'text-slate-600 dark:text-gray-300 hover:bg-slate-100/80 dark:hover:bg-gray-800 hover:text-slate-900 dark:hover:text-gray-100'
                                    : 'text-slate-400 dark:text-gray-500 hover:bg-slate-50 dark:hover:bg-gray-800/50 bg-slate-50/60 dark:bg-gray-800/30'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 pr-2 min-w-0">
                                {!isAccessible && <Lock className="w-3.5 h-3.5 shrink-0 text-amber-500" />}
                                <span className="truncate">{sub.title}</span>
                              </div>

                              <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${isActive ? 'text-white translate-x-0.5' : 'text-slate-300 dark:text-gray-600 group-hover:text-slate-400 dark:group-hover:text-gray-400'}`} />
                            </button>
                          )
                        })
                      ) : (
                        <p className="text-xs text-slate-400 dark:text-gray-500 p-3 italic text-center">Belum ada sub-bab tersedia.</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <div className="text-center py-12 px-4">
              <Search className="w-10 h-10 mx-auto text-slate-300 dark:text-gray-700 mb-2 stroke-[1.5]" />
              <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-300 font-semibold">Materi tidak ditemukan</p>
              <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">Coba gunakan kata kunci pencarian lain.</p>
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
      <main className="flex-1 flex flex-col h-full bg-slate-100/70 dark:bg-gray-950 overflow-hidden relative min-w-0">
        
        {/* Mobile Top Navigation Bar */}
        <div className="lg:hidden p-3.5 bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 flex items-center justify-between shrink-0 shadow-2xs z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition cursor-pointer"
            >
              <Menu className="w-4 h-4" />
              <span>Daftar Bab</span>
            </button>
            <button
              onClick={() => router.back()}
              className="p-2 bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-gray-700 transition cursor-pointer"
              title="Kembali"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
          <span className="text-xs font-semibold text-slate-700 dark:text-gray-200 truncate max-w-36 sm:max-w-xs px-2">
            {activeSubMaterial?.title || 'Pilih Materi'}
          </span>
        </div>

        {/* Content Scrollable Container */}
        <div 
          ref={contentContainerRef} 
          className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6 md:p-10 flex justify-center"
        >
          <div className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/80 dark:border-gray-800 p-5 sm:p-10 md:p-12 my-auto min-h-[75vh] flex flex-col justify-between transition-all">
            
            {isLoading ? (
              <div className="space-y-6 animate-pulse my-auto">
                <div className="h-8 bg-slate-100 dark:bg-gray-800 rounded-xl w-3/4 mx-auto" />
                <div className="space-y-3 pt-6">
                  <div className="h-4 bg-slate-100 dark:bg-gray-800 rounded-lg w-full" />
                  <div className="h-4 bg-slate-100 dark:bg-gray-800 rounded-lg w-5/6 mx-auto" />
                  <div className="h-4 bg-slate-100 dark:bg-gray-800 rounded-lg w-4/6 mx-auto" />
                </div>
              </div>
            ) : activeSubMaterial ? (
              <div className="space-y-6 sm:space-y-8 min-w-0">
                {/* Judul & Badge Header */}
                <div className="border-b border-slate-100 dark:border-gray-800 pb-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <span className="inline-block px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold text-[10px] sm:text-xs rounded-full uppercase tracking-wider">
                      Modul Pembelajaran
                    </span>
                    {activeSubMaterial.is_free ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800 text-[10px] font-extrabold rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Gratis
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800 text-[10px] font-extrabold rounded-full">
                        <Lock className="w-3 h-3" /> Premium
                      </span>
                    )}
                  </div>
                  <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-gray-100 tracking-tight leading-snug wrap-break-word px-2">
                    {activeSubMaterial.title}
                  </h1>
                </div>

                {/* Konten Materi */}
                <div className="w-full overflow-x-hidden min-w-0">
                  <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base wrap-break-word whitespace-normal">
                    <MathText content={activeSubMaterial.content} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center my-auto py-16 text-center">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/40 text-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-gray-200 mb-1">Belum ada materi yang dipilih</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 max-w-sm px-4">
                  Silakan klik tombol <span className="font-semibold text-blue-600 dark:text-blue-400">&quot;Buka&quot;</span> pada salah satu bab di sebelah kiri untuk mulai membaca materi dan rumus.
                </p>
              </div>
            )}

            {/* Footer Kartu Materi */}
            <div className="border-t border-slate-100 dark:border-gray-800 pt-6 mt-12 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 dark:text-gray-500 gap-2 text-center sm:text-left">
              <span>Platform Pembelajaran TKA</span>
              <span>Modul Interaktif & KaTeX</span>
            </div>
          </div>
        </div>
      </main>

      {/* ================= MODAL POP-UP LANGGANAN WHATSAPP ================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative border border-slate-100 dark:border-gray-800 text-center overflow-hidden">
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/60 dark:bg-blue-900/20 rounded-full blur-2xl pointer-events-none" />

            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 w-9 h-9 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-500 dark:text-gray-400 rounded-full flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-500/25">
              <Lock className="w-8 h-8" />
            </div>

            <div className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[10px] font-extrabold px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Konten Khusus Premium</span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-gray-100 tracking-tight">
              Akses Terbatas ke Sub-Materi Ini
            </h3>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-2 leading-relaxed px-2">
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
                className="w-full py-3 px-6 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-600 dark:text-gray-300 font-bold text-xs sm:text-sm rounded-2xl transition cursor-pointer"
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