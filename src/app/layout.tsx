import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
// import ClientLayoutWrapper from '@/components/ClientLayoutWrapper' // Opsional atau bisa langsung bungkus Navbar

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

// ==========================================
// KONFIGURASI SEO GLOBAL (Mendukung Google Search)
// ==========================================
export const metadata: Metadata = {
  title: {
    default: 'Palisademy - Platform Latihan & Tryout TKA Online Terbaik',
    template: '%s | Palisademy TKA',
  },
  description: 'Platform latihan soal, tryout, dan evaluasi Tes Kompetensi Akademik (TKA) online terlengkap dengan pembahasan interaktif, rumus matematika KaTeX, dan pemetaan materi terstruktur.',
  keywords: [
    'TKA online',
    'latihan soal TKA',
    'tryout TKA',
    'soal TKA SMA SMK',
    'belajar TKA online',
    'Palisademy',
    'bank soal TKA',
    'evaluasi akademik digital',
  ],
  authors: [{ name: 'Tim Palisademy' }],
  creator: 'Palisademy',
  publisher: 'Palisademy',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://palisademy.web.id', // Ganti dengan domain aslimu nanti
    siteName: 'Palisademy TKA',
    title: 'Palisademy - Platform Latihan & Tryout TKA Online',
    description: 'Tingkatkan skor TKA kamu dengan ribuan bank soal latihan, simulasi ujian berbasis waktu, dan pembahasan lengkap.',
    images: [
      {
        url: '/logo.png', // Pastikan kamu membuat gambar banner ukuran 1200x630px di folder public
        width: 1200,
        height: 630,
        alt: 'Palisademy TKA Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Palisademy - Platform Latihan & Tryout TKA Online',
    description: 'Latihan soal dan tryout TKA online terlengkap untuk siswa.',
    images: ['/logo.png'],
  },
  verification: {
    google: 't_rVh_A55HQoJQk8bUPPCtDHan0uait9QsKQeW4GSBE', // Nanti diisi dari Google Search Console
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
        {/* Favicon & Icons */}
        <link rel="icon" href="/logo.svg" sizes="any" />
        
        {/* CDN KaTeX CSS untuk merender rumus matematika/sains dengan rapi */}
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css" 
          crossOrigin="anonymous" 
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50/50 text-gray-900 min-h-screen flex flex-col selection:bg-blue-600 selection:text-white`}>
        {children}
      </body>
    </html>
  )
}