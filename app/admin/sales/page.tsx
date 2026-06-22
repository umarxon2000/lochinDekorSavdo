"use client"
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Phone, LogOut, ReceiptText } from "lucide-react";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

// TypeScript interfeyslari - Netlify "any" xatolarini yo'qotish uchun
interface SaleItem {
  product_name: string;
  quantity_pieces: number;
}

interface Sale {
  sale_id: string;
  created_at: string;
  total_amount: number;
  customer_name: string;
  customer_phone: string | null;
  items: SaleItem[];
}

export default function SalesHistory() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const { data, error } = await supabase
          .from('sales_with_details')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSales((data as Sale[]) || []);
      } catch (err) {
        console.error("Savdo tarixini yuklashda xatolik:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  const handleLogout = async () => {
    if (!confirm("Tizimdan chiqmoqchimisiz?")) return;
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="p-10 text-center font-bold animate-pulse text-blue-600">
        Savdo tarixi yuklanmoqda...
      </div>
    );
  }

  // Bugungi savdolarni xavfsiz va aniq filtrlash (Vaqt zonasi muammosiz)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayString = todayStart.toDateString();

  const todaySales = sales.filter(s => {
    return new Date(s.created_at).toDateString() === todayString;
  });

  const todayTotal = todaySales.reduce((sum, s) => sum + (s.total_amount || 0), 0);

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6 pb-20 bg-slate-50/50 min-h-screen">
      {/* Header / Navigatsiya */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
        <h1 className="text-2xl font-black text-slate-800 uppercase flex items-center gap-2">
          <ReceiptText className="text-blue-600" size={28} /> Savdo Tarixi
        </h1>
        <nav className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
          <div className="flex gap-4">
            <Link href="/admin" className="font-bold text-sm text-slate-400 hover:text-blue-600 pb-1 transition-colors">📦 Ombor</Link>
            <Link href="/admin/sales" className="font-bold text-sm text-blue-600 border-b-2 border-blue-600 pb-1"> Venetian Tarixi</Link>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-red-500 hover:bg-red-50 hover:text-red-600 font-bold rounded-xl gap-2 h-10 px-3"
          >
            <LogOut size={18} /> Chiqish
          </Button>
        </nav>
      </div>

      {/* Bugungi umumiy ko'rsatkichlar */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-[2rem] text-white shadow-xl shadow-blue-500/10">
        <p className="text-xs font-black uppercase opacity-70 tracking-widest">Bugungi umumiy savdo</p>
        <h2 className="text-4xl font-black mt-1">{todayTotal.toLocaleString()} {"so'm"}</h2>
        <p className="text-sm mt-2 opacity-90">{todaySales.length} ta sotuv amalga oshirildi</p>
      </div>

      {/* Savdolar ro'yxati */}
      <div className="grid grid-cols-1 gap-4">
        {sales.length === 0 ? (
          <p className="text-center text-slate-500 italic py-10 bg-white rounded-3xl border border-slate-100">
            Tizimda hali hech qanday savdo qayd etilmagan.
          </p>
        ) : (
          sales.map((sale) => (
            <Card key={sale.sale_id} className="rounded-2xl border border-slate-100/80 shadow-sm bg-white overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 px-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Calendar size={14} />
                    <span className="text-xs font-bold">
                      {new Date(sale.created_at).toLocaleString('uz-UZ', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none rounded-xl font-black text-xs px-3 py-1">
                    {sale.total_amount?.toLocaleString()} {"so'm"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-2 md:w-1/3">
                    <div className="flex items-center gap-2 font-bold text-slate-700">
                      <User size={16} className="text-blue-500" /> {sale.customer_name || "Noma'lum mijoz"}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Phone size={14} /> {sale.customer_phone || "Raqam kiritilmagan"}
                    </div>
                  </div>

                  <div className="bg-blue-50/60 border border-blue-100/30 rounded-2xl p-4 flex-1">
                    <span className="text-[10px] font-black uppercase text-blue-500 block mb-2 tracking-wider">Sotilgan mahsulotlar:</span>
                    <div className="space-y-2">
                      {sale.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs font-bold text-slate-700 border-b border-blue-100/40 pb-1 last:border-none last:pb-0">
                          <span className="text-slate-800">{item.product_name}</span>
                          <span className="bg-blue-100/70 text-blue-700 px-2 py-0.5 rounded-lg text-[10px] font-black">
                            {item.quantity_pieces} dona
                          </span>
                        </div>
                      )) || <p className="text-xs text-slate-400 italic">Tarkib topilmadi</p>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}