"use client"

import { useCartStore } from '@/store/useCartStore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ShoppingCart, 
  Trash2, 
  FileText, 
  User, 
  Phone, 
  CheckCircle2, 
  Loader2, 
  ArrowLeft, 
  PackageX 
} from "lucide-react";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generatePDF, type CartItem } from '@/utils/generatePDF';
import { createClient } from '@/utils/supabase/client';

export default function CartPage() {
  const router = useRouter();
  const { 
    items, 
    removeItem, 
    clearCart, 
    customerName, 
    customerPhone, 
    setCustomerInfo 
  } = useCartStore();

  const [loading, setLoading] = useState<boolean>(false);
  const supabase = createClient();

  // 1. Jami summani strict (qat'iy) raqam ko'rinishida hisoblash
  const totalSum = items?.reduce((sum: number, item: CartItem) => sum + (Number(item.total_price) || 0), 0) || 0;

  const handleFinalCheckout = async (): Promise<void> => {
    if (!customerName.trim()) {
      alert("Iltimos, mijoz ismini kiriting!");
      return;
    }
    
    setLoading(true);
    try {
      // Supabase RPC chaqiruvi turlari qat'iy belgilangan
      const { error } = await supabase.rpc('complete_sale_transaction', {
        p_customer_name: customerName,
        p_customer_phone: customerPhone || null,
        p_total_amount: totalSum,
        p_items: items.map((item: CartItem) => ({
          product_id: item.id,
          variant_id: item.variantId || null,
          quantity_pieces: item.calculated_pieces, 
          quantity_value: item.input_value,
          price_at_sale: item.total_price
        }))
      });

      if (error) throw error;

      // PDF formatida chek yuklash
      generatePDF(items, totalSum, { name: customerName, phone: customerPhone });
      
      alert("Sotuv muvaffaqiyatli yakunlandi va bazaga yozildi!");
      clearCart();
      router.push('/'); // Sotuv tugagach asosiy sahifaga qaytarish
    } catch (error: unknown) {
      console.error("Sotuvni rasmiylashtirishda xatolik:", error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Xatolik yuz berdi. Internet aloqasini tekshiring.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔴 SAVAT BO'SH BO'LGANDAGI CHUQRUR DIZAYN (Empty State)
  if (!items || items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl max-w-sm w-full border border-slate-100 flex flex-col items-center">
          <div className="bg-slate-100 p-5 rounded-full text-slate-400 mb-5">
            <PackageX size={48} className="stroke-[1.5]" />
          </div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">{"Savat bo'sh"}</h2>
          <p className="text-sm text-slate-400 font-medium mt-2 mb-6">
           {" Hozircha hech qanday mahsulot qo'shilmadi. Xarid qilishni boshlashingiz mumkin."}
          </p>
          <Button 
            onClick={() => router.push('/')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black h-12 rounded-xl shadow-lg shadow-blue-100"
          >
            <ArrowLeft size={16} className="mr-2" /> MAHSULOTLARGA QAYTISH
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans antialiased">
      
      {/* 🔹 Yuqori navigatsiya qismi (Header) */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-4 py-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200/80 px-4 py-2.5 rounded-xl transition-all"
          >
            <ArrowLeft size={16} /> Qaytish
          </button>
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-600/10 p-2 rounded-xl text-blue-600">
              <ShoppingCart size={22} className="stroke-[2.5]" />
            </div>
            <h1 className="text-lg font-black uppercase tracking-tight text-slate-800">Buyurtmani rasmiylashtirish</h1>
          </div>
          <div className="text-xs bg-blue-50 text-blue-600 font-black px-3 py-1.5 rounded-lg">
            {items.length} TA MAHSULOT
          </div>
        </div>
      </header>

      {/* 🔹 Asosiy Kontent paneli (Ikki ustunli Grid sxemasi) */}
      <main className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 👈 CHAP USTUN: Mahsulotlar ro'yxati (Grid-8) */}
        <section className="lg:col-span-7 space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Tanlangan mahsulotlar</h3>
            <button 
              onClick={() => {
                if (confirm("Savatni butunlay bo'shatmoqchimisiz?")) clearCart();
              }}
              className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
            >
              <Trash2 size={14} /> Savatni tozalash
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item: CartItem) => (
              <div 
                key={item.cartItemId} 
                className="flex justify-between items-center p-4 md:p-5 border border-slate-200/60 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex-1 space-y-1">
                  <h4 className="font-bold text-slate-800 text-base leading-tight">{item.name}</h4>
                  <p className="text-xs text-slate-400 font-semibold flex items-center gap-2">
                   {" Kiritilgan o'lcham:"} <span className="text-slate-700 font-bold">{item.input_value} {item.unit_type === 'm2' ? 'm²' : item.unit_type}</span>
                    &rarr;
                    <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md font-black text-[11px]">
                      {item.calculated_pieces} dona ketadi
                    </span>
                  </p>
                </div>
                
                <div className="flex flex-col items-end gap-2 ml-4">
                  <span className="font-black text-slate-900 text-base">
                    {(item.total_price || 0).toLocaleString()} {"so'm"}
                  </span>
                  <button 
                    onClick={() => removeItem(item.cartItemId)}
                    className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all"
                    title="O'chirish"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 👉 O'NG USTUN: Mijoz ma'lumotlari va To'lov kvitansiyasi (Grid-5) */}
        <section className="lg:col-span-5 space-y-6">
          
          {/* Mijoz Ma'lumotlari Formasi */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <CheckCircle2 size={16} className="text-blue-600" />
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{"Mijoz ma'lumotlari"}</h3>
            </div>
            
            <div className="space-y-3">
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input 
                  placeholder="Ism sharifi (Majburiy)"
                  value={customerName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerInfo(e.target.value, customerPhone)}
                  className="pl-11 bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500 rounded-xl h-12 font-semibold text-sm"
                />
              </div>
              <div className="relative">
                <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input 
                  placeholder="Telefon raqami (Ixtiyoriy)"
                  value={customerPhone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerInfo(customerName, e.target.value)}
                  className="pl-11 bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500 rounded-xl h-12 font-semibold text-sm"
                />
              </div>
            </div>
          </div>

          {/* Jami Hisob-Faktura bloki */}
          <div className="bg-slate-950 text-white p-6 rounded-3xl shadow-xl space-y-6 relative overflow-hidden">
            {/* Minimalist dizayn uchun fonga dekorativ doira rang berish */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
            
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-3">
              {"To'lov kvitansiyasi"}
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between text-sm text-slate-400 font-medium">
                <span>Mahsulotlar soni:</span>
                <span className="text-white font-bold">{items.length} xil</span>
              </div>
              <div className="flex justify-between text-sm text-slate-400 font-medium">
                <span>Yetkazib berish:</span>
                <span className="text-emerald-400 font-black uppercase text-xs bg-emerald-500/10 px-2 py-0.5 rounded">Bepul</span>
              </div>
              <div className="pt-4 border-t border-slate-800 flex justify-between items-baseline">
                <span className="text-sm text-slate-400 font-black uppercase tracking-tight">Jami Summa:</span>
                <span className="text-2xl font-black text-blue-400">
                  {totalSum.toLocaleString()} <span className="text-xs text-white font-medium">{"so'm"}</span>
                </span>
              </div>
            </div>

            {/* Harakatlar Tugmasi */}
            <div className="pt-2 space-y-3">
              <Button 
                onClick={() => generatePDF(items, totalSum, { name: customerName, phone: customerPhone })}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold h-12 rounded-xl transition-all"
              >
                <FileText size={18} className="mr-2 text-emerald-400" />
                PDF CHEK YUKLAB OLISH
              </Button>

              <Button 
                onClick={handleFinalCheckout}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black h-14 text-base rounded-xl shadow-lg shadow-blue-900/20 disabled:bg-slate-800 disabled:text-slate-500 transition-all"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={18} /> BAZAGA INTEGRATSIYA...
                  </span>
                ) : (
                  "SOTUVNI YAKUNLASH (BAZAGA)"
                )}
              </Button>
            </div>
          </div>

        </section>

      </main>
    </div>
  );
}