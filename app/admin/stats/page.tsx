"use client"
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';'zingizni pathingiz
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, DollarSign, ShoppingBag } from "lucide-react";

export default function SellerStats() {
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: sales } = await supabase
        .from('sales')
        .select('total_price, seller_email')
        .gte('created_at', new Date().toISOString().split('T')[0]); // Faqat bugungi

      // Ma'lumotlarni sotuvchilar bo'yicha guruhlash
      const grouped = sales?.reduce((acc: any, sale: any) => {
        const email = sale.seller_email || "Noma'lum";
        if (!acc[email]) {
          acc[email] = { email, total: 0, count: 0 };
        }
        acc[email].total += sale.total_price;
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
        {stats.map((seller: any) => (
          <Card key={seller.email} className="rounded-[2rem] border-none shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-slate-500">{seller.email}</CardTitle>
              <User className="text-blue-600" size={20} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-slate-800">
                {seller.total.toLocaleString()} so'm
              </div>
              <p className="text-xs text-slate-400 mt-1 font-bold uppercase">
                {seller.count} ta savdo amalga oshirildi
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}