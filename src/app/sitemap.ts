import { MetadataRoute } from 'next'
import { createClient } from '@/utils/supabase/client' // Sesuaikan path Supabase client kamu jika berbeda

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://palisademy.web.id'

  // 1. Halaman statis utama website kamu
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0, // Prioritas tertinggi untuk halaman utama
    },
    {
      url: `${baseUrl}/mapel-tka`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/history`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ]

  // 2. (Opsional) Mengambil data dinamis dari Supabase 
  // Jika kamu punya tabel mata pelajaran atau artikel, masukkan ke sitemap agar diindeks Google
  let dynamicPages: MetadataRoute.Sitemap = []
  
  try {
    const supabase = createClient()
    const { data: subjects } = await supabase.from('subjects').select('slug, updated_at') // Ganti 'subjects' & 'slug' sesuai tabel database kamu

    if (subjects) {
      dynamicPages = subjects.map((subject: any) => ({
        url: `${baseUrl}/mapel-tka/${subject.slug}`,
        lastModified: subject.updated_at ? new Date(subject.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      }))
    }
  } catch (error) {
    console.error('Gagal mengambil data untuk sitemap:', error)
  }

  // Gabungkan halaman statis dan dinamis
  return [...staticPages, ...dynamicPages]
}