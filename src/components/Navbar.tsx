'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { signOut } from '@/utils/supabase/auth'
import Link from 'next/link'
import { GraduationCap } from 'lucide-react'

export default function Navbar() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  // Efek bayangan/blur saat halaman di-scroll
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

  // Ambil data user dari Supabase
  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email || null)
      }
    }
    getUser()
  }, [supabase])
    
  // Menutup dropdown account ketika klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAccountDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await signOut()
    router.push('/')
    router.refresh()
  }

  const hideNavbarPaths = ['/login', '/register']
  if (hideNavbarPaths.includes(pathname)) {
    return null
  }

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      scrolled 
        ? 'bg-white/85 dark:bg-gray-900/85 backdrop-blur-md shadow-sm border-b border-gray-100/80 dark:border-gray-800/80' 
        : 'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800'
    }`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex justify-between items-center">
        
        {/* Sisi Kiri: Logo & Tombol Kembali (Desktop) */}
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-linear-to-tr from-purple-600 via-indigo-600 to-violet-500 rounded-2xl flex items-center justify-center text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition duration-300 shrink-0">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <span className="text-sm sm:text-base font-extrabold tracking-tight block text-gray-900 dark:text-white group-hover:text-purple-600 transition">Palisademy</span>
                <span className="block text-[9px] sm:text-[10px] font-extrabold text-purple-600 uppercase tracking-widest">Edukasi Digital</span>
              </div>
            </div>
          </Link>

          {/* Tombol Kembali Cepat (Desktop) */}
          <Link
            href="/"
            className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/60 dark:hover:bg-gray-800 active:scale-95 transition"
            title="Kembali ke halaman utama"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Kembali</span>
          </Link>
        </div>

        {/* Menu Navigasi Desktop (Di Tengah) */}
        <div className="hidden md:flex items-center gap-1 bg-gray-50/80 dark:bg-gray-800/80 p-1.5 rounded-full border border-gray-200/60 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300">
          <Link 
            href="/mapel-tka" 
            className={`px-4 py-2 rounded-full transition ${
              pathname === '/mapel-tka' 
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-xs font-extrabold' 
                : 'hover:bg-white dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            Mapel
          </Link>
          <Link 
            href="/history" 
            className={`px-4 py-2 rounded-full transition ${
              pathname === '/history' 
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-xs font-extrabold' 
                : 'hover:bg-white dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            Exam History
          </Link>
        </div>

        {/* Bagian Kanan Desktop */}
        <div className="hidden md:flex items-center gap-3">
          {/* Account Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl hover:bg-gray-100/80 dark:hover:bg-gray-800 active:scale-95 transition border border-transparent hover:border-gray-200 dark:hover:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold shadow-sm shadow-blue-500/20">
                {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="max-w-30 truncate text-xs font-bold text-gray-800 dark:text-gray-200">{userEmail || 'Akun'}</span>
              <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isAccountDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu Account */}
            {isAccountDropdownOpen && (
              <div className="absolute right-0 top-14 w-60 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 mx-2 rounded-xl mb-1">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Signed in as</p>
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate mt-0.5">{userEmail}</p>
                </div>
                <Link 
                  href="/account" 
                  onClick={() => setIsAccountDropdownOpen(false)}
                  className="flex items-center gap-2.5 mx-2 px-3 py-2.5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Account Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 mx-2 px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition mt-0.5 cursor-pointer"
                  style={{ width: 'calc(100% - 16px)' }}
                >
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sisi Kanan Mobile: Tombol Kembali Cepat & Tombol Hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/"
            className="p-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition active:scale-95 flex items-center justify-center"
            aria-label="Kembali ke Beranda"
            title="Kembali"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2.5 rounded-2xl bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition active:scale-95 cursor-pointer"
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

      </nav>

      {/* Menu Dropdown Mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-4 right-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border border-gray-100 dark:border-gray-800 shadow-2xl rounded-3xl p-5 flex flex-col gap-3 mt-3 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          
          {/* Info User */}
          <div className="flex items-center gap-3">
            <div className="flex-1 px-4 py-3 bg-blue-50/60 dark:bg-gray-800 rounded-2xl border border-blue-100/60 dark:border-gray-700 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Login Sebagai:</p>
                <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate mt-0.5">{userEmail || 'Pengguna'}</p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1 pt-1">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>← Kembali ke Utama</span>
            </Link>

            <Link
              href="/mapel-tka"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition ${
                pathname === '/mapel-tka' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <span>📚 Mapel</span>
            </Link>
            <Link
              href="/history"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition ${
                pathname === '/history' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <span>🕒 Exam History</span>
            </Link>
            <Link
              href="/account"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition ${
                pathname === '/account' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <span>⚙️ Account Settings</span>
            </Link>
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false)
                handleLogout()
              }}
              className="w-full flex items-center justify-center gap-2 text-xs font-extrabold text-red-600 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 active:scale-95 py-3 rounded-2xl transition cursor-pointer"
            >
              <span>Logout Keluar Akun</span>
            </button>
          </div>
        </div>
      )}
    </header>
  )
}