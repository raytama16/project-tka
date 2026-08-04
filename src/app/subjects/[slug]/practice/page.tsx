'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  BookOpen, 
  ArrowLeft, 
  Lock, 
  Unlock, 
  Sparkles, 
  X, 
  MessageCircle, 
  CheckCircle2,
  ChevronRight
} from 'lucide-react'

type Chapter = {
    id: string
    title: string
    description: string
    is_free: boolean
}

export default function SubjectPracticeChaptersPage() {
    const params = useParams()
    const router = useRouter()
    const subjectSlug = params.slug as string
    
    const [chapters, setChapters] = useState<Chapter[]>([])
    const [subjectName, setSubjectName] = useState<string>('Mata Pelajaran')
    const [loading, setLoading] = useState(true)
    
    // State untuk sistem pengecekan premium user
    const [isPremium, setIsPremium] = useState(false)
    const [showModal, setShowModal] = useState(false)
    
    const supabase = createClient()

    useEffect(() => {
        async function fetchInitialData() {
            if (!subjectSlug) {
                setLoading(false)
                return
            }
            setLoading(true)

            // 1. Cek status user login & status is_premium dari tabel profiles
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('is_premium')
                    .eq('id', user.id)
                    .single()
                
                if (profileData) {
                    setIsPremium(!!profileData.is_premium)
                }
            }

            // 2. Ambil data Subject berdasarkan slug
            const { data: subjectData, error: subjectError } = await supabase
                .from('subjects')
                .select('id, name')
                .eq('slug', subjectSlug)
                .single()

            if (subjectError || !subjectData) {
                console.log("Error subject:", subjectError)
                setLoading(false)
                return
            }

            setSubjectName(subjectData.name)

            // 3. Ambil daftar bab dari tabel 'practice_chapters' (pastikan kolom is_free ikut diambil)
            const { data: chaptersData, error: chaptersError } = await supabase
                .from('practice_chapters')
                .select('id, title, description, is_free')
                .eq('subject_id', subjectData.id)
                .order('created_at', { ascending: true })

            if (!chaptersError && chaptersData) {
                setChapters(chaptersData)
            }
            setLoading(false)
        }

        fetchInitialData()
    }, [subjectSlug, supabase])

    // Handler ketika bab diklik
    const handleChapterClick = (chapter: Chapter) => {
        // Jika bab gratis ATAU user sudah premium, izinkan akses masuk ke soal
        if (chapter.is_free || isPremium) {
            router.push(`/practice/${chapter.id}`)
        } else {
            // Jika terkunci, tampilkan pop-up langganan WhatsApp
            setShowModal(true)
        }
    }

    // Detail nomor WhatsApp admin (Ganti dengan nomor aslimu, format: 628xxxxxxxxxx)
    const adminWhatsAppNumber = "6281234567890" 
    const messageText = encodeURIComponent("Halo Admin, saya ingin berlangganan akun Premium Platform Ujian untuk membuka semua modul latihan soal.")
    const whatsappUrl = `https://wa.me/${adminWhatsAppNumber}?text=${messageText}`

    return (
        <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/30 p-4 sm:p-6 md:p-12 font-sans text-gray-900 selection:bg-purple-600 selection:text-white">
            <div className="max-w-4xl mx-auto">
                
                {/* Header Navigasi Kembali */}
                <div className="mb-8">
                    <Link
                        href={`/subjects/${subjectSlug}`}
                        className="inline-flex items-center gap-2 text-xs font-extrabold text-gray-600 bg-white hover:bg-purple-50 hover:text-purple-600 px-4 py-2.5 rounded-2xl border border-gray-200/80 shadow-sm transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali ke Mata Pelajaran</span>
                    </Link>
                </div>

                {/* Banner Judul */}
                <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-xl shadow-slate-100 relative overflow-hidden mb-8">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-purple-100/50 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                        <div>
                            <div className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 text-[10px] font-extrabold px-3 py-1 rounded-full border border-purple-100 mb-3">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Bank Soal Terstruktur</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                                Latihan Soal: {subjectName}
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-xl leading-relaxed">
                                Pilih bab di bawah ini untuk mulai mengerjakan paket latihan soal interaktif dengan sistem penilaian otomatis.
                            </p>
                        </div>

                        {isPremium && (
                            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-extrabold px-4 py-2.5 rounded-2xl shadow-md flex items-center gap-2 shrink-0 self-start sm:self-center">
                                <Sparkles className="w-4 h-4" />
                                <span>Akun Premium Aktif</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Konten Daftar Bab */}
                {loading ? (
                    <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-xl animate-spin flex items-center justify-center text-white shadow-md">
                            <Sparkles className="w-5 h-5 animate-pulse" />
                        </div>
                        <span className="text-xs font-bold text-gray-500">Memuat daftar bab latihan...</span>
                    </div>
                ) : chapters.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl border border-gray-200/80 text-center text-gray-500 shadow-sm">
                        <BookOpen className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                        <p className="text-xs font-bold text-gray-700">Belum ada bab latihan soal untuk mata pelajaran ini.</p>
                        <p className="text-[11px] text-gray-400 mt-1">Silakan periksa kembali dalam waktu dekat.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {chapters.map((chap, index) => {
                            const isAccessible = chap.is_free || isPremium

                            return (
                                <div 
                                    key={chap.id}
                                    onClick={() => handleChapterClick(chap)}
                                    className={`p-6 sm:p-7 rounded-3xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-5 cursor-pointer group relative overflow-hidden ${
                                        isAccessible 
                                            ? 'bg-white border-gray-100 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-100/50' 
                                            : 'bg-slate-50/80 border-gray-200/60 hover:bg-slate-100/80'
                                    }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-colors ${
                                            isAccessible 
                                                ? 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white' 
                                                : 'bg-gray-200 text-gray-500'
                                        }`}>
                                            {isAccessible ? <BookOpen className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className="text-[10px] font-extrabold text-gray-500 bg-gray-100 px-3 py-0.5 rounded-full">
                                                    Bab {index + 1}
                                                </span>
                                                {chap.is_free ? (
                                                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3" /> Gratis
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-extrabold text-purple-700 bg-purple-50 border border-purple-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                                        <Lock className="w-3 h-3" /> Premium
                                                    </span>
                                                )}
                                            </div>

                                            <h2 className="text-base sm:text-lg font-black text-gray-900 group-hover:text-purple-600 transition-colors tracking-tight">
                                                {chap.title}
                                            </h2>
                                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                                {chap.description || "Paket latihan soal interaktif komprehensif."}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Tombol Aksi di Kanan Card */}
                                    <div className="self-end sm:self-center shrink-0">
                                        {isAccessible ? (
                                            <div className="px-5 py-2.5 bg-purple-600 group-hover:bg-purple-700 text-white text-xs font-extrabold rounded-2xl transition shadow-md shadow-purple-200 flex items-center gap-1.5">
                                                <span>Mulai Latihan</span>
                                                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                            </div>
                                        ) : (
                                            <div className="px-5 py-2.5 bg-gray-900 text-white text-xs font-extrabold rounded-2xl transition shadow-md flex items-center gap-2">
                                                <Lock className="w-3.5 h-3.5 text-purple-400" />
                                                <span>Terkunci (Premium)</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

            </div>

            {/* ================= MODAL POP-UP LANGGANAN WHATSAPP ================= */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative border border-gray-100 text-center overflow-hidden">
                        
                        {/* Dekorasi blur */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/60 rounded-full blur-2xl pointer-events-none" />

                        {/* Tombol Close */}
                        <button 
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 w-9 h-9 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full flex items-center justify-center transition cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Icon Lock */}
                        <div className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-purple-200">
                            <Lock className="w-8 h-8" />
                        </div>

                        <div className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 text-[10px] font-extrabold px-3 py-1 rounded-full border border-purple-100 mb-3">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Konten Khusus Premium</span>
                        </div>

                        <h3 className="text-xl font-black text-gray-900 tracking-tight">
                            Akses Terbatas ke Bab Ini
                        </h3>

                        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                            Bab latihan ini hanya terbuka untuk akun yang telah berlangganan paket Premium. Upgrade sekarang untuk membuka seluruh bank soal dan pembahasan lengkap!
                        </p>

                        {/* Tombol Aksi WhatsApp */}
                        <div className="mt-8 flex flex-col gap-3">
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-200 transition flex items-center justify-center gap-2.5 cursor-pointer"
                            >
                                <MessageCircle className="w-5 h-5 fill-current" />
                                <span>Langganan via Chat WhatsApp</span>
                            </a>

                            <button
                                onClick={() => setShowModal(false)}
                                className="w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs rounded-2xl transition cursor-pointer"
                            >
                                Nanti Saja
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </main>
    )
}