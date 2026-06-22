"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, BarChart3, Package, UserCircle, ShoppingCart } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  
  // Login sahifasida menyuni ko'rsatmaymiz
  if (pathname === '/login') return null;

  const navItems = [
    { name: 'Savdo', href: '/', icon: LayoutGrid },
    { name: 'Ombor', href: '/admin', icon: Package },
    { name: 'Statistika', href: '/admin/sales', icon: BarChart3 },
    { name: 'cart', href: '/cart', icon: ShoppingCart },
    { name: 'Profil', href: '/profile', icon: UserCircle }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-100 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-50">
      <div className="flex justify-around items-center h-20 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1.5 px-4 py-2 transition-all active:scale-90">
              <div className={cn(
                "p-2 rounded-2xl transition-all",
                isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-400"
              )}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={cn(
                "text-[10px] font-black uppercase tracking-tighter",
                isActive ? "text-blue-600" : "text-slate-400"
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// cn funksiyasi (lib/utils ichida bo'lmasa)
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}