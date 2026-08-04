'use client'

import { Geist, Geist_Mono } from 'next/font/google'
import { usePathname } from 'next/navigation'
import './globals.css'
import Navbar from '@/components/Navbar'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()

  // Navbar HANYA akan dirender jika path BUKAN halaman utama ('/')
  // Artinya saat di '/', Navbar otomatis tidak muncul.
  const showNavbar = pathname !== '/'

  return (
    <html lang="id">
      <head>
        <title>Web Latihan TKA</title>
        <meta name="description" content="Platform latihan dan ujian TKA online" />
        {/* Tambahkan CDN KaTeX CSS di sini agar font-nya dimuat dengan benar */}
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css" 
          crossOrigin="anonymous" 
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}>
        {showNavbar && <Navbar />}
        {children}
      </body>
    </html>
  )
}