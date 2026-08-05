'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { signOut } from '@/utils/supabase/auth'
import Link from 'next/link'

export default function Navbar() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false)
  
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  // Sembunyikan navbar di halaman login & register
  
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
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
        
        {/* Logo / Brand */}
        <Link href="/" className="text-xl font-bold text-blue-600 flex items-center gap-2">
          <span>TKA</span>
        </Link>

        {/* Menu Navigasi Desktop */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link 
            href="/" 
            className={`transition hover:text-blue-600 ${pathname === '/' ? 'text-blue-600 font-semibold' : ''}`}
          >
            Dashboard
          </Link>
          <Link 
            href="/mapel-tka" 
            className={`transition hover:text-blue-600 ${pathname === '/mapel-tka' ? 'text-blue-600 font-semibold' : ''}`}
          >
            Mapel
          </Link>
          <Link 
            href="/history" 
            className={`transition hover:text-blue-600 ${pathname === '/history' ? 'text-blue-600 font-semibold' : ''}`}
          >
            Exam History
          </Link>
        </div>

        {/* Bagian Kanan Desktop (Account Dropdown) */}
        <div className="hidden md:flex items-center relative" ref={dropdownRef}>
          <button
            onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition text-sm font-medium text-gray-700"
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="max-w-30 truncate">{userEmail || 'Akun'}</span>
            <svg className={`w-4 h-4 transition-transform ${isAccountDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu Account */}
          {isAccountDropdownOpen && (
            <div className="absolute right-0 top-12 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs text-gray-400">Signed in as</p>
                <p className="text-sm font-semibold text-gray-800 truncate">{userEmail}</p>
              </div>
              <Link 
                href="/account" 
                onClick={() => setIsAccountDropdownOpen(false)}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                Account Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition font-medium"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Tombol Hamburger Mobile */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-600 hover:text-blue-600 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

      </div>

      {/* Menu Dropdown Mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-4 space-y-2">
          <div className="py-2 border-b border-gray-100 mb-2">
            <p className="text-xs text-gray-400">Login sebagai:</p>
            <p className="text-sm font-semibold text-gray-800 truncate">{userEmail}</p>
          </div>
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
          >
            Dashboard
          </Link>
          <Link
            href="/mapel-tka"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
          >
          Mapel
          </Link>
          <Link
            href="/history"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
          >
            Exam History
          </Link>
          <Link
            href="/account"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
          >
            Account Settings
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  )
}