'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  User, 
  Mail, 
  Building2, 
  MapPin, 
  Save, 
  ArrowLeft, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  LogOut
} from 'lucide-react'

export default function AccountPage() {
  const [email, setEmail] = useState<string | null>(null)
  const [fullName, setFullName] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [province, setProvince] = useState('')
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function getProfileData() {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        router.push('/login')
        return
      }
      setEmail(user.email || null)

      // Ambil data profil dari tabel profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setFullName(profileData.full_name || '')
        setSchoolName(profileData.school_name || '')
        setProvince(profileData.province || '')
      }
      setLoading(false)
    }
    getProfileData()
  }, [supabase, router])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setMessage(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        school_name: schoolName,
        province: province,
      })
      .eq('id', user.id)

    if (error) {
      setError(error.message)
    } else {
      setMessage('Profil berhasil diperbarui!')
    }
    setSaving(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/30 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 bg-purple-600 rounded-2xl animate-spin flex items-center justify-center text-white shadow-lg shadow-purple-200 mb-4">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <p className="text-xs font-bold text-gray-500 tracking-wide uppercase">Memuat Pengaturan Akun...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/30 py-12 px-4 sm:px-6 font-sans text-gray-900 selection:bg-purple-600 selection:text-white">
      <div className="max-w-3xl mx-auto">
        
        {/* Top Navigation / Back Button */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/mapel-tka')}
            className="inline-flex items-center gap-2 text-xs font-extrabold text-gray-600 bg-white hover:bg-purple-50 hover:text-purple-600 px-4 py-2.5 rounded-2xl border border-gray-200/80 shadow-sm transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Menu Utama</span>
          </button>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 text-xs font-extrabold text-red-600 bg-white hover:bg-red-50 px-4 py-2.5 rounded-2xl border border-red-100 shadow-sm transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Akun</span>
          </button>
        </div>

        {/* Main Card Container */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-2xl shadow-slate-100 relative overflow-hidden">
          
          {/* Decorative background blur */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-100/50 rounded-full blur-3xl pointer-events-none" />

          {/* Header Section */}
          <div className="flex items-start gap-4 mb-8 pb-6 border-b border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-200 shrink-0">
              <User className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 text-[10px] font-extrabold px-3 py-1 rounded-full border border-purple-100 mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Akun Terverifikasi</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Pengaturan Akun &amp; Profil</h1>
              <p className="text-xs text-gray-500 mt-1">Perbarui informasi identitas diri dan asal sekolahmu untuk keperluan akademik.</p>
            </div>
          </div>

          {/* Error & Success Notification Banners */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-xs font-bold flex items-center gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl text-xs font-bold flex items-center gap-3 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
              <span>{message}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            
            {/* Email Field (Disabled) */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-extrabold text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-600" />
                <span>Email Terdaftar</span>
                <span className="text-[10px] font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md ml-auto">Tidak dapat diubah</span>
              </label>
              <input
                type="email"
                disabled
                value={email || ''}
                className="w-full px-4 py-3.5 bg-gray-50/80 border border-gray-200/80 rounded-2xl text-xs text-gray-500 font-medium cursor-not-allowed select-none"
              />
            </div>

            {/* Full Name Field */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-extrabold text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4 text-purple-600" />
                <span>Nama Lengkap</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200/80 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white text-gray-900 font-medium transition-all shadow-sm"
              />
            </div>

            {/* School Name Field */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-extrabold text-gray-700 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-600" />
                <span>Nama Sekolah / Instansi</span>
              </label>
              <input
                type="text"
                required
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Contoh: SMAN 1 Jakarta / SMK Negeri 2"
                className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200/80 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white text-gray-900 font-medium transition-all shadow-sm"
              />
            </div>

            {/* Province Field */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-extrabold text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-600" />
                <span>Daerah / Provinsi</span>
              </label>
              <input
                type="text"
                required
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                placeholder="Contoh: DKI Jakarta / Jawa Timur"
                className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200/80 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white text-gray-900 font-medium transition-all shadow-sm"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-4 px-6 bg-purple-600 text-white rounded-2xl font-extrabold text-xs shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Menyimpan Perubahan...' : 'Simpan Perubahan Profil'}</span>
              </button>
            </div>

          </form>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8 text-xs text-gray-400 font-medium">
          Platform Simulasi Ujian &bull; Seluruh data profilmu aman dan terenkripsi.
        </div>

      </div>
    </main>
  )
}