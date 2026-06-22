"use client"
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Phone, LogOut, } from "lucide-react";
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SalesHistory() {
    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchSales = async () => {
            const { data, error } = await supabase
                .from('sales_with_details')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error) setSales(data || []);
            setLoading(false);
        };
        fetchSales();
    }, []);
    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    if (loading) return <div className="p-10 text-center font-bold">Yuklanmoqda...</div>;
    const todaySales = sales.filter(s => {
        const saleDate = new Date(s.created_at).toDateString();
        const today = new Date().toDateString();
        return saleDate === today;
    });

    const todayTotal = todaySales.reduce((sum, s) => sum + s.total_amount, 0);

    return (
        <div className="p-4 max-w-6xl mx-auto space-y-6 pb-20">

            <div className="flex items-center gap-4">
                <nav className="hidden md:flex gap-6">
                    <Link href="/admin" className="font-bold text-sm text-blue-600 border-b-2 border-blue-600 pb-1">📦 Ombor</Link>
                    <Link href="/admin/sales" className="font-bold text-sm text-slate-400 hover:text-blue-500">📜 Savdo Tarixi</Link>
                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="text-red-500 hover:bg-red-50 hover:text-red-600 font-bold rounded-xl gap-2"
                    >
                        <LogOut size={18} /> Chiqish
                    </Button>
                </nav>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-[2rem] text-white shadow-xl mb-6">
                <p className="text-xs font-black uppercase opacity-70 tracking-widest">Bugungi umumiy savdo</p>
                <h2 className="text-4xl font-black mt-1">{todayTotal.toLocaleString()} so'm</h2>
                <p className="text-sm mt-2 opacity-90">{todaySales.length} ta sotuv amalga oshirildi</p>
            </div>
            <h1 className="text-2xl font-black text-slate-800 uppercase">Savdo Tarixi</h1>
            <div className="grid grid-cols-1 gap-4">
                {sales.map((sale) => (
                    <Card key={sale.sale_id} className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
                        <CardHeader className="bg-slate-50 border-b py-3 px-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Calendar size={14} />
                                    <span className="text-xs font-bold">
                                        {new Date(sale.created_at).toLocaleString('uz-UZ')}
                                    </span>
                                </div>
                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">
                                    {sale.total_amount.toLocaleString()} so'm
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 font-bold text-slate-700">
                                        <User size={16} className="text-blue-500" /> {sale.customer_name}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <Phone size={14} /> {sale.customer_phone || "Raqam kiritilmagan"}
                                    </div>
                                </div>

                                <div className="bg-blue-50 rounded-xl p-3 flex-1">
                                    <span className="text-[10px] font-black uppercase text-blue-400 block mb-1">Sotilgan mahsulotlar:</span>
                                    <div className="space-y-1">
                                        {sale.items.map((item: any, idx: number) => (
                                            <div key={idx} className="flex justify-between text-xs font-medium">
                                                <span>{item.product_name}</span>
                                                <span className="text-slate-400">{item.quantity_pieces} dona</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}