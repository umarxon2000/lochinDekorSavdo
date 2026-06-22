import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import BottomNav from "@/components/BottomNav"; // Biz yaratgan menyu
import AuthWatcher from "@/components/authWatcher"; // Storega user yuklovchi

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#2563eb',
};

export const metadata: Metadata = {
  title: "Lochin Dekor Savdo",
  description: "Qurilish mollari do'koni",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Lochin Dekor" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={cn("h-full antialiased", geistSans.variable, geistMono.variable, inter.variable, "font-sans")}>
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 pb-20 md:pb-0">
        {/* AuthWatcher - tizimga kirgan odamni storega yozib qo'yadi */}
        <AuthWatcher />
        
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>

        {/* Pastki navigatsiya barcha sahifalarda chiqadi */}
        <BottomNav />
      </body>
    </html>
  );
}