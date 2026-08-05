'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import {
  BookOpen,
  Sparkles,
  GraduationCap,
  ArrowRight,
  Clock,
  Send,
  CheckCircle2,
  HelpCircle,
  Award,
  Users,
  Layers,
  ChevronDown,
  ChevronUp,
  ShieldCheck
} from 'lucide-react'

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/pagination'

export default function LandingPage() {
  const router = useRouter()
  const [state, setState] = useState<{ message?: string; success?: boolean }>({})
  const [isPending, setIsPending] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  
  // State untuk melacak status user login
  const [user, setUser] = useState<any>(null)
  const [loadingUser, setLoadingUser] = useState(true)

  // Inisialisasi client supabase browser
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
      setLoadingUser(false)
    }
    checkUser()
  }, [supabase])

  // Fungsi tombol utama navbar & card
  const handleMainButtonClick = () => {
    if (user) {
      router.push('/#modul')
    } else {
      router.push('/login') // Sesuaikan dengan halaman loginmu jika ada
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setState({})

    const formData = new FormData(e.currentTarget)

    // Masukkan Access Key Web3Forms kamu di sini
    formData.append("access_key", "6cf059f6-7846-4ad3-a1f9-95a895b1c2cf")

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      })
      const data = await response.json()

      if (data.success) {
        setState({
          message: 'Terima kasih! Kritik dan saran Anda berhasil dikirim.',
          success: true,
        })
        ; (e.target as HTMLFormElement).reset()
      } else {
        throw new Error(data.message || 'Gagal mengirim pesan.')
      }
    } catch (err: any) {
      setState({
        message: err.message || 'Terjadi kesalahan jaringan.',
        success: false,
      })
    } finally {
      setIsPending(false)
    }
  }

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const faqData = [
    {
      question: "Apa itu Platform Simulasi Ujian TKA?",
      answer: "Platform ini adalah media pembelajaran dan evaluasi digital mandiri yang dirancang untuk membantu siswa melatih kemampuan akademik secara terstruktur dengan sistem penilaian otomatis."
    },
    {
      question: "Apakah modul latihan ini bisa diakses secara gratis?",
      answer: "Ya! Modul Latihan & Ujian TKA saat ini dapat diakses secara bebas untuk mendukung proses belajar siswa tanpa dipungut biaya."
    },
    {
      question: "Kapan modul SNBT dan Ujian Mandiri dirilis?",
      answer: "Modul tambahan seperti SNBT/UTBK serta Ujian Mandiri/Kedinasan sedang dalam tahap pengembangan intensif dan akan segera dirilis dalam waktu dekat."
    },
    {
      question: "Bagaimana cara mengirimkan masukan atau melaporkan kendala sistem?",
      answer: "Anda dapat menggunakan formulir Kritik & Saran yang tersedia di bagian bawah halaman ini. Setiap pesan akan langsung terkirim ke tim pengembang."
    }
  ]

  return (
    <main className="min-h-screen bg-linear-to-b from-slate-50 via-white to-indigo-50/30 flex flex-col justify-between selection:bg-purple-600 selection:text-white font-sans text-gray-900">

      {/* ================= TOP NAVBAR ================= */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-linear-to-tr from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-200">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight block text-gray-900">Platform Ujian</span>
            <span className="block text-[10px] font-extrabold text-purple-600 uppercase tracking-widest">Edukasi Digital</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-xs font-bold text-gray-600">
          <a href="#fitur" className="hover:text-purple-600 transition">Fitur Unggulan</a>
          <a href="#modul" className="hover:text-purple-600 transition">Modul Ujian</a>
          <a href="#faq" className="hover:text-purple-600 transition">FAQ</a>
          <a href="#kontak" className="hover:text-purple-600 transition">Kritik &amp; Saran</a>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleMainButtonClick}
            disabled={loadingUser}
            className="flex items-center gap-2 text-xs font-extrabold text-white bg-purple-600 hover:bg-purple-700 px-5 py-3 rounded-2xl shadow-md shadow-purple-200 transition cursor-pointer disabled:opacity-50"
          >
            <span>{user ? "Mulai Belajar" : "Login / Register"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* ================= HERO SECTION ================= */}
      <section className="w-full max-w-6xl mx-auto px-6 py-12 md:py-16 flex flex-col items-center text-center">

        {/* Badge Pengumuman */}
        <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 px-4 py-2 rounded-full text-purple-700 text-xs font-bold mb-6 shadow-sm animate-pulse">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Platform Simulasi Ujian &amp; Latihan Interaktif Modern</span>
        </div>

        {/* Judul Utama */}
        <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight max-w-4xl leading-[1.15]">
          Persiapkan Ujian Terbaikmu Bersama <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-600 via-indigo-600 to-blue-600">Sistem Evaluasi Terpadu</span>
        </h1>

        {/* Deskripsi Web */}
        <p className="text-sm md:text-base text-gray-500 mt-6 max-w-2xl leading-relaxed">
          Website ini dirancang khusus untuk membantu siswa menguji kemampuan akademik melalui bank soal terstruktur, latihan berbasis bobot nilai yang akurat, serta materi pembelajaran mendalam.
        </p>

        {/* Statistik Singkat */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-3xl mt-10 pt-10 border-t border-gray-100">
          <div className="flex flex-col items-center">
            <span className="text-2xl md:text-3xl font-black text-gray-900">100+</span>
            <span className="text-xs text-gray-400 font-medium mt-1">Bank Soal Tervalidasi</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl md:text-3xl font-black text-gray-900">24/7</span>
            <span className="text-xs text-gray-400 font-medium mt-1">Akses Belajar Fleksibel</span>
          </div>
          <div className="col-span-2 md:col-span-1 flex flex-col items-center">
            <span className="text-2xl md:text-3xl font-black text-gray-900">100%</span>
            <span className="text-xs text-gray-400 font-medium mt-1">Sistem Penilaian Otomatis</span>
          </div>
        </div>

        {/* ================= CONTAINER CARD PILIHAN MODUL ================= */}
        <div id="modul" className="w-full mt-16 scroll-mt-20">

          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-gray-900">Pilih Modul Pembelajaran</h2>
            <p className="text-xs text-gray-500 mt-1">Geser atau pilih modul ujian yang ingin kamu kerjakan sekarang.</p>
          </div>

          {/* Tampilan Desktop (Grid 3 Kolom) */}
          <div className="hidden md:grid grid-cols-3 gap-6 text-left">

            {/* Card 1: Coming Soon Kiri */}
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-gray-200/60 shadow-sm flex flex-col items-center justify-center text-center h-72 relative overflow-hidden opacity-75">
              <div className="absolute top-4 right-4 bg-gray-100 text-gray-500 text-[10px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                <Clock className="w-3 h-3" /> Coming Soon
              </div>
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 mb-4 shadow-inner">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-base font-extrabold text-gray-400 tracking-tight">Latihan SNBT / UTBK</h3>
            </div>

            {/* Card 2: UTAMA - Latihan TKA (Tengah - Fokus Utama) */}
            <div
              onClick={handleMainButtonClick}
              className="bg-white rounded-3xl p-8 border-2 border-purple-500 shadow-2xl shadow-purple-200/50 hover:shadow-3xl hover:scale-[1.03] transition-all cursor-pointer flex flex-col justify-between text-left group relative overflow-hidden h-72"
            >
              <div className="absolute top-4 right-4 bg-purple-600 text-white text-[10px] font-extrabold px-3.5 py-1 rounded-full shadow-md">
                Tersedia Sekarang
              </div>

              <div className="flex flex-col gap-4">
                <div className="w-14 h-14 bg-purple-50 group-hover:bg-purple-600 rounded-2xl flex items-center justify-center text-purple-600 group-hover:text-white transition-all shadow-sm">
                  <BookOpen className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 group-hover:text-purple-600 transition-colors tracking-tight">
                    Latihan &amp; Ujian TKA
                  </h3>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-2">
                    Akses materi, bank soal pilihan ganda, PG kompleks, dan matriks dengan sistem penilaian otomatis.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-purple-600 group-hover:translate-x-1 transition-transform">
                <span>{user ? "Mulai Belajar Sekarang" : "Login untuk Akses"}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Card 3: Coming Soon Kanan */}
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-gray-200/60 shadow-sm flex flex-col items-center justify-center text-center h-72 relative overflow-hidden opacity-75">
              <div className="absolute top-4 right-4 bg-gray-100 text-gray-500 text-[10px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                <Clock className="w-3 h-3" /> Coming Soon
              </div>
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 mb-4 shadow-inner">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-base font-extrabold text-gray-400 tracking-tight">Ujian Mandiri / Kedinasan</h3>
            </div>

          </div>

          {/* Tampilan Mobile (Swiper Slider Responsif) */}
          <div className="block md:hidden w-full pb-6">
            <Swiper
              modules={[Pagination]}
              spaceBetween={16}
              slidesPerView={1.15}
              centeredSlides={true}
              initialSlide={1}
              pagination={{ clickable: true }}
              className="w-full pb-12"
            >
              {/* Slide 0: Coming Soon Kiri */}
              <SwiperSlide>
                <div className="bg-white/85 backdrop-blur-sm rounded-3xl p-6 border border-gray-200/60 shadow-sm flex flex-col items-center justify-center text-center h-64 relative overflow-hidden">
                  <div className="absolute top-4 right-4 bg-gray-100 text-gray-500 text-[10px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> Coming Soon
                  </div>
                  <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 mb-3">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-extrabold text-gray-400">Latihan SNBT / UTBK</h3>
                </div>
              </SwiperSlide>

              {/* Slide 1: UTAMA - Latihan TKA */}
              <SwiperSlide>
                <div
                  onClick={handleMainButtonClick}
                  className="bg-white rounded-3xl p-6 border-2 border-purple-500 shadow-2xl shadow-purple-100/50 cursor-pointer flex flex-col justify-between text-left relative overflow-hidden h-64"
                >
                  <div className="absolute top-4 right-4 bg-purple-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-sm">
                    Tersedia Sekarang
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gray-900 tracking-tight">
                        Latihan &amp; Ujian TKA
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
                        Akses materi, bank soal pilihan ganda, PG kompleks, dan matriks penilaian otomatis.
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-purple-600">
                    <span>{user ? "Mulai Belajar" : "Login untuk Akses"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </SwiperSlide>

              {/* Slide 2: Coming Soon Kanan */}
              <SwiperSlide>
                <div className="bg-white/85 backdrop-blur-sm rounded-3xl p-6 border border-gray-200/60 shadow-sm flex flex-col items-center justify-center text-center h-64 relative overflow-hidden">
                  <div className="absolute top-4 right-4 bg-gray-100 text-gray-500 text-[10px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> Coming Soon
                  </div>
                  <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 mb-3">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-extrabold text-gray-400">Ujian Mandiri / Kedinasan</h3>
                </div>
              </SwiperSlide>
            </Swiper>
          </div>

        </div>

      </section>

      {/* ================= SECTION FITUR UNGGULAN ================= */}
      <section id="fitur" className="w-full bg-white py-16 border-y border-gray-100 scroll-mt-20">
        <div className="w-full max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3.5 py-1 rounded-full border border-purple-100">
              Keunggulan Platform
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mt-3 tracking-tight">
              Kenapa Harus Belajar di Sini?
            </h2>
            <p className="text-xs md:text-sm text-gray-500 mt-2">
              Fitur-fitur modern yang dirancang khusus untuk memaksimalkan hasil belajarmu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50/70 p-8 rounded-3xl border border-gray-100 flex flex-col gap-4">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-purple-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-gray-900">Penilaian Real-Time</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Dapatkan hasil nilai secara instan setelah menyelesaikan latihan soal lengkap dengan analisis jawaban.
              </p>
            </div>

            <div className="bg-slate-50/70 p-8 rounded-3xl border border-gray-100 flex flex-col gap-4">
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-indigo-200">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-gray-900">Variasi Soal Lengkap</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Mulai dari pilihan ganda standar, PG kompleks, hingga matriks evaluasi yang menantang kemampuan berpikir kritis.
              </p>
            </div>

            <div className="bg-slate-50/70 p-8 rounded-3xl border border-gray-100 flex flex-col gap-4">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-blue-200">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-gray-900">Akses Tanpa Batas</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Bisa diakses kapan saja dan di mana saja menggunakan perangkat komputer maupun smartphone secara responsif.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION FAQ INTERAKTIF ================= */}
      <section id="faq" className="w-full max-w-4xl mx-auto px-6 py-16 scroll-mt-20">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3.5 py-1 rounded-full border border-purple-100">
            Pertanyaan Umum
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mt-3 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-gray-500 mt-2">
            Temukan jawaban atas pertanyaan seputar penggunaan platform ujian ini.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {faqData.map((item, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm transition"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 font-extrabold text-sm text-gray-800 hover:text-purple-600 transition"
              >
                <span>{item.question}</span>
                {openFaq === index ? (
                  <ChevronUp className="w-5 h-5 text-purple-600 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                )}
              </button>
              {openFaq === index && (
                <div className="px-6 pb-6 text-xs text-gray-500 leading-relaxed border-t border-gray-50 pt-4">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ================= SECTION KRITIK & SARAN (WEB3FORMS) ================= */}
      <section id="kontak" className="w-full max-w-3xl mx-auto px-6 py-8 mb-16 scroll-mt-20">
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-xl shadow-slate-100 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/50 rounded-full blur-3xl pointer-events-none" />

          <div className="mb-8">
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3.5 py-1 rounded-full border border-purple-100">
              Masukan &amp; Evaluasi
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mt-3 tracking-tight">Kritik &amp; Saran</h2>
            <p className="text-xs md:text-sm text-gray-500 mt-2 leading-relaxed">
              Punya masukan berharga atau menemukan kendala pada platform ini? Kirimkan langsung melalui formulir di bawah agar kami bisa terus meningkatkannya.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-700">Nama Anda</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Contoh: Budi Santoso"
                  className="px-4 py-3.5 rounded-2xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50/50 font-medium"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-700">Email (Opsional)</label>
                <input
                  type="email"
                  name="email"
                  placeholder="budi@email.com"
                  className="px-4 py-3.5 rounded-2xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50/50 font-medium"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-700">Pesan, Kritik, atau Saran</label>
              <textarea
                name="message"
                rows={4}
                required
                placeholder="Tuliskan masukan atau laporan kendala di sini..."
                className="px-4 py-3.5 rounded-2xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50/50 resize-none font-medium"
              />
            </div>

            {state?.message && (
              <div className={`p-4 text-xs font-bold rounded-2xl border ${state.success ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-600'}`}>
                {state.message}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="mt-2 py-4 px-6 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-purple-200 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isPending ? 'Mengirim Pesan...' : 'Kirim Masukan'}</span>
            </button>
          </form>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="w-full bg-white border-t border-gray-100 py-8 text-xs text-gray-400">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-gray-800">Platform Simulasi Ujian</span>
            <span>&bull;</span>
            <span>Edukasi Digital Indonesia</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} All rights reserved.
          </div>
        </div>
      </footer>

    </main>
  )
}