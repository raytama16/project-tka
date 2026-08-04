'use server'

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendFeedbackAction(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const message = formData.get('message') as string

  if (!name || !message) {
    return { success: false, message: 'Nama dan pesan wajib diisi.' }
  }

  try {
    const data = await resend.emails.send({
      from: 'Platform Ujian <onboarding@resend.dev>', // Ganti dengan domain Anda jika sudah diverifikasi di Resend
      to: [process.env.ADMIN_EMAIL || 'gpraya257@gmail.com'],
      subject: `[Kritik & Saran] Pesan Baru dari ${name}`,
      text: `Nama: ${name}\nEmail: ${email || 'Tidak disertakan'}\n\nPesan:\n${message}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #7c3aed;">Pesan Kritik & Saran Baru</h2>
          <p><strong>Nama:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email || 'Tidak disertakan'}</p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
          <p><strong>Pesan:</strong></p>
          <p style="background: #f9fafb; padding: 15px; border-radius: 8px; white-space: pre-wrap;">${message}</p>
        </div>
      `,
    })

    if (data.error) {
      return { success: false, message: data.error.message }
    }

    return { success: true, message: 'Terima kasih! Kritik dan saran Anda berhasil dikirim.' }
  } catch (error: any) {
    return { success: false, message: error.message || 'Gagal mengirim email.' }
  }
}