"use client"
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";

// Sotuvchi ma'lumotlari uchun aniq qat'iy tur (Type)
interface SellerStat {
  email: string;
  total: number;
  count: number;
}

export default function SellerStats() {
  const [stats, setStats] = useState<SellerStat[]>([]);
  // Supabase clientni shu yerda bitta o'zgaruvchiga yuklab olamiz
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      // Bugungi kun boshlanish vaqtini olish
      const today = new Date().toISOString().split('T')[0];

      const { data: sales } = await supabase
        .from('sales')
        .select('total_price, seller_email')
        .gte('created_at', today); // Faqat bugungi savdolar

      // Ma'lumotlarni sotuvchilar bo'yicha guruhlash
      const grouped = sales?.reduce((acc: Record<string, SellerStat>, sale) => {
        const email = sale.seller_email || "Noma'lum";
        if (!acc[email]) {
          acc[email] = { email, total: 0, count: 0 };
        }
        acc[email].total += sale.total_price || 0;
        acc[email].count += 1;
        return acc;
      }, {});

      setStats(Object.values(grouped || {}));
    };

    fetchStats();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-black text-slate-800 uppercase italic">Sotuvchilar statistikasi (Bugun)</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.length === 0 ? (
          <p className="text-sm text-slate-500 italic">Bugun hali savdo amalga oshirilmadi.</p>
        ) : (
          stats.map((seller) => (
            <Card key={seller.email} className="rounded-[2rem] border-none shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-bold text-slate-500">{seller.email}</CardTitle>
                <User className="text-blue-600" size={20} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-slate-800">
                  {seller.total.toLocaleString()} {"so'm"}
                </div>
                <p className="text-xs text-slate-400 mt-1 font-bold uppercase">
                  {seller.count} ta savdo amalga oshirildi
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}