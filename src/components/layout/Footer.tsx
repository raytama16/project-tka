import { Mail, MapPin, Phone } from 'lucide-react';
import SubscribeForm from './SubscribeForm';

const Footer = () => {
  return (
    <footer className="w-full border-t border-white/10 bg-slate-950 pt-12 pb-6 text-slate-400">
      <div className="container mx-auto grid grid-cols-1 gap-12 px-4 md:grid-cols-3">
        
        {/* Kolom 1: Kontak */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">SMK YAPALIS</h3>
          <div className="space-y-3 text-sm">
            <p className="flex items-start gap-3">
              <MapPin size={18} className="text-blue-500 shrink-0" />
              Jl. Raya Krian No. XX, Sidoarjo, Jawa Timur
            </p>
            <p className="flex items-center gap-3">
              <Phone size={18} className="text-blue-500" />
              (031) 1234567
            </p>
            <p className="flex items-center gap-3">
              <Mail size={18} className="text-blue-500" />
              info@smkyapalis.sch.id
            </p>
          </div>
        </div>

        {/* Kolom 2: Subscription */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Newsletter</h3>
          <p className="text-sm">Dapatkan update terbaru seputar dunia IT dan jurusan.</p>
          <SubscribeForm />
        </div>

        {/* Kolom 3: Maps Placeholder */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Lokasi Kami</h3>
          <div className="aspect-video w-full rounded-lg bg-slate-900 border border-white/5 overflow-hidden flex items-center justify-center">
            <span className="text-xs italic">[ Google Maps Embed Placeholder ]</span>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto mt-12 border-t border-white/5 pt-6 text-center text-xs">
        <p>&copy; {new Date().getFullYear()} Jurusan TKJ SMK Yapalis. Built with Next.js & TypeScript.</p>
      </div>
    </footer>
  );
};

export default Footer;