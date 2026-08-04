'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Subject = {
  id: string
  name: string
  slug: string
}

type Profile = {
  full_name: string
  school_name: string
}

// Daftar variasi warna background untuk card mapel
const cardColorThemes = [
  {
    bg: 'bg-emerald-50/60 hover:bg-emerald-50',
    border: 'border-emerald-100 hover:border-emerald-300',
    accent: 'bg-emerald-500',
    text: 'text-emerald-700',
    subtext: 'text-emerald-600/80',
  },
  {
    bg: 'bg-amber-50/60 hover:bg-amber-50',
    border: 'border-amber-100 hover:border-amber-300',
    accent: 'bg-amber-500',
    text: 'text-amber-700',
    subtext: 'text-amber-600/80',
  },
  {
    bg: 'bg-indigo-50/60 hover:bg-indigo-50',
    border: 'border-indigo-100 hover:border-indigo-300',
    accent: 'bg-indigo-500',
    text: 'text-indigo-700',
    subtext: 'text-indigo-600/80',
  },
  {
    bg: 'bg-rose-50/60 hover:bg-rose-50',
    border: 'border-rose-100 hover:border-rose-300',
    accent: 'bg-rose-500',
    text: 'text-rose-700',
    subtext: 'text-rose-600/80',
  },
  {
    bg: 'bg-cyan-50/60 hover:bg-cyan-50',
    border: 'border-cyan-100 hover:border-cyan-300',
    accent: 'bg-cyan-500',
    text: 'text-cyan-700',
    subtext: 'text-cyan-600/80',
  },
]

export default function DashboardPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        router.push('/login')
        return
      }

      // Ambil data profil user untuk sapaan nama
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, school_name')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
      }

      // Ambil data mapel
      const { data: subjectData, error: subjectError } = await supabase
        .from('subjects')
        .select('*')

      if (!subjectError && subjectData) {
        setSubjects(subjectData)
      }
      setLoading(false)
    }

    fetchData()
  }, [supabase, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-blue-600 font-semibold animate-pulse">Memuat dashboard...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="max-w-5xl mx-auto p-6 md:p-8">
        
        {/* Welcome Banner (Tetap Biru Sesuai Keinginan) */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 md:p-8 text-white shadow-lg mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Halo, {profile?.full_name || 'Pejuang TKA'}! 👋
          </h1>
          <p className="text-blue-100 text-sm md:text-base max-w-2xl leading-relaxed">
            Selamat datang di platform latihan TKA {profile?.school_name ? `(${profile.school_name})` : ''}. Pilih mata pelajaran di bawah untuk mulai mendalami materi, latihan soal, dan menguji kemampuanmu.
          </p>
        </div>

        {/* Daftar Mata Pelajaran */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Pilih Mata Pelajaran</h2>
          <span className="text-sm text-gray-500 font-medium">{subjects.length} Mapel Tersedia</span>
        </div>

        {subjects.length === 0 ? (
          <div className="bg-gray-50 p-8 rounded-xl border border-gray-200 text-center text-gray-500">
            Belum ada mata pelajaran yang tersedia di database. Silakan tambahkan data mapel di Supabase.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subjects.map((subject, index) => {
              // Mengambil tema warna berbeda secara berurutan berdasarkan index mapel
              const theme = cardColorThemes[index % cardColorThemes.length]

              return (
                <Link
                  key={subject.id}
                  href={`/subjects/${subject.slug}`}
                  className={`${theme.bg} p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border ${theme.border} flex flex-col justify-between group relative overflow-hidden`}
                >
                  {/* Aksen garis warna kecil di atas card */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${theme.accent} opacity-80`}></div>
                  
                  <div>
                    {/* Logo M/B dihilangkan, langsung ke judul mapel */}
                    <h3 className={`text-xl font-bold text-gray-900 mb-2 group-hover:${theme.text} transition-colors`}>
                      {subject.name}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Akses materi lengkap, bank latihan soal, dan ujian simulasi resmi.
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-gray-200/60 flex items-center justify-between text-sm font-semibold text-gray-800">
                    <span className={`group-hover:${theme.text} transition-colors`}>Mulai Belajar</span>
                    <span className={`transform group-hover:translate-x-1 transition-transform ${theme.text}`}>&rarr;</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

      </div>
    </main>
  )
}