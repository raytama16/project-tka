'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { signOut } from '@/utils/supabase/auth'
import Link from 'next/link'
import { 
  GraduationCap, 
  LayoutDashboard, 
  BookOpen, 
  History, 
  UserCog, 
  LogOut, 
  ChevronDown, 
  Sparkles, 
  Menu, 
  X,
  ShieldCheck
} from 'lucide-react'

export default function Navbar() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  // Efek untuk mendeteksi scroll halaman (efek shadow navbar saat digulir)
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Mengambil data user dan profil tambahannya
  useEffect(() => {
    async function getUserData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email || null)
        
        // Ambil nama lengkap dari tabel profiles jika ada
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle()

        if (profile?.full_name) {
          setUserName(profile.full_name)
        }
      }
    }
    getUserData()
  }, [supabase])
    
  // Menutup dropdown account ketika pengguna mengklik di luar area komponen
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAccountDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fungsi proses logout yang aman
  const handleLogout = async () => {
    await signOut()
    router.push('/')
    router.refresh()
  }

  // Sembunyikan navbar di halaman autentikasi tertentu
  const hideNavbarPaths = ['/login', '/register', '/onboarding']
  if (hideNavbarPaths.includes(pathname)) {
    return null
  }

  // Teks inisial untuk avatar
  const displayIdentifier = userName || userEmail || 'U'
  const initialAvatar = displayIdentifier.charAt(0).toUpperCase()

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-md shadow-slate-100/50' 
        : 'bg-white border-b border-gray-200'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex justify-between items-center">
        
        {/* ================= BRAND / LOGO UTAMA ================= */}
        <Link 
          href="/" 
          className="flex items-center gap-3 group focus:outline-none"
        >
          <div className="w-11 h-11 bg-linear-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-blue-200 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors">
              Palisademy
            </span>
            <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> TKA Platform
            </span>
          </div>
        </Link>

        {/* ================= MENU NAVIGASI DESKTOP ================= */}
        <nav className="hidden md:flex items-center gap-2 bg-slate-50/80 p-1.5 rounded-2xl border border-gray-200/60 shadow-xs">
          <Link 
            href="/" 
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 ${
              pathname === '/' 
                ? 'bg-white text-blue-600 shadow-sm border border-gray-100' 
                : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>

          <Link 
            href="/mapel-tka" 
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 ${
              pathname === '/mapel-tka' 
                ? 'bg-white text-blue-600 shadow-sm border border-gray-100' 
                : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Mata Pelajaran</span>
          </Link>

          <Link 
            href="/history" 
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 ${
              pathname === '/history' 
                ? 'bg-white text-blue-600 shadow-sm border border-gray-100' 
                : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Riwayat Ujian</span>
          </Link>
        </nav>

        {/* ================= BAGIAN KANAN DESKTOP (AKUN / DROPDOWN) ================= */}
        <div className="hidden md:flex items-center relative" ref={dropdownRef}>
          <button
            onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
            className="flex items-center gap-3 pl-3 pr-4 py-2 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-gray-200 text-xs font-bold text-gray-700 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-black shadow-sm">
              {initialAvatar}
            </div>
            <div className="flex flex-col text-left max-w-32.5">
              <span className="truncate text-gray-900 font-extrabold">{userName || 'Pejuang TKA'}</span>
              <span className="truncate text-[10px] text-gray-400 font-medium">{userEmail || 'Akun Pengguna'}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isAccountDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
          </button>

          {/* Dropdown Menu Account Modern */}
          {isAccountDropdownOpen && (
            <div className="absolute right-0 top-14 w-64 bg-white border border-gray-100 rounded-3xl shadow-xl shadow-slate-200/50 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-5 py-3 border-b border-gray-100">
                <p className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400">Masuk Sebagai</p>
                <p className="text-xs font-black text-gray-900 truncate mt-0.5">{userName || 'User TKA'}</p>
                <p className="text-[11px] font-medium text-gray-500 truncate">{userEmail}</p>
              </div>

              <div className="p-2 space-y-1">
                <Link 
                  href="/account" 
                  onClick={() => setIsAccountDropdownOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                >
                  <UserCog className="w-4 h-4" />
                  <span>Pengaturan Akun</span>
                </Link>
              </div>

              <div className="p-2 border-t border-gray-100 mt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar Akun</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ================= TOMBOL HAMBURGER MOBILE ================= */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2.5 rounded-2xl bg-slate-50 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition focus:outline-none cursor-pointer"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

      </div>

      {/* ================= MENU DROPDOWN MOBILE ================= */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-gray-200 px-6 pt-4 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top duration-300">
          
          {/* Identitas Ringkas Mobile */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-gray-100 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-sm">
              {initialAvatar}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-black text-gray-900 truncate">{userName || 'Pejuang TKA'}</span>
              <span className="text-[10px] text-gray-500 truncate">{userEmail}</span>
            </div>
          </div>

          <div className="space-y-1">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-extrabold transition ${
                pathname === '/' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Utama</span>
            </Link>

            <Link
              href="/mapel-tka"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-extrabold transition ${
                pathname === '/mapel-tka' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Mata Pelajaran TKA</span>
            </Link>

            <Link
              href="/history"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-extrabold transition ${
                pathname === '/history' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Riwayat Ujian</span>
            </Link>

            <Link
              href="/account"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-extrabold transition ${
                pathname === '/account' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <UserCog className="w-4 h-4" />
              <span>Pengaturan Akun</span>
            </Link>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-extrabold text-rose-600 bg-rose-50 hover:bg-rose-100 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar dari Akun</span>
            </button>
          </div>

        </div>
      )}
    </header>
  )
}