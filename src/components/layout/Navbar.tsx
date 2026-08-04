import Link from 'next/link';
import { Monitor, Menu } from 'lucide-react';

const Navbar = () => {
  const navLinks = [
    { name: 'Beranda', href: '/' },
    { name: 'Tentang', href: '/tentang' },
    { name: 'Alumni', href: '/alumni' },
    { name: 'Blog', href: '/blog' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-blue-500">
          <Monitor size={28} />
          <span className="tracking-tighter text-white">TKJ YAPALIS</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex md:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="group relative text-sm font-medium text-slate-300 transition-colors hover:text-blue-400"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-blue-500 transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </div>

        {/* Mobile Toggle (Simplified) */}
        <button className="text-white md:hidden">
          <Menu />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;