"use client"
import { useCartStore } from '@/store/useCartStore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Trash2, FileText, User, Phone, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from 'react';
import { generatePDF } from '@/utils/generatePDF';
import { createClient } from '@/utils/supabase/client';

export default function CartDrawer() {
  // Store-dan yangi maydon nomlari bo'yicha ma'lumotlarni olamiz
  const { 
    items, 
    removeItem, 
    clearCart, 
    customerName, 
    customerPhone, 
    setCustomerInfo 
  } = useCartStore();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const supabase = createClient();

  // Jami summani yangi `total_price` maydoni orqali hisoblaymiz
  const totalSum = items.reduce((sum, item) => sum + (item.total_price || 0), 0);

  // Savat bo'sh bo'lsa, pastki panel ekranda joy egallamaydi
  if (items.length === 0) return null;

  const handleFinalCheckout = async () => {
    if (!customerName.trim()) {
      alert("Iltimos, mijoz ismini kiriting!");
      return;
    }
    
    setLoading(true);
    try {
      // Supabase RPC-ga ma'lumotlarni yangi interfeys bo'yicha xavfsiz map qilamiz
      const { error } = await supabase.rpc('complete_sale_transaction', {
        p_customer_name: customerName,
        p_customer_phone: customerPhone || null,
        p_total_amount: totalSum,
        p_items: items.map(item => ({
          product_id: item.id,
          variant_id: item.variantId || null,
          quantity_pieces: item.calculated_pieces, 
          quantity_value: item.input_value,
          price_at_sale: item.total_price
        }))
      });

      if (error) throw error;

      // PDF chek yaratish
      generatePDF(items, totalSum, { name: customerName, phone: customerPhone });
      
      alert("Sotuv muvaffaqiyatli yakunlandi!");
      clearCart();
      setIsOpen(false);
   } catch (error: unknown) {
      console.error("Sotuvni rasmiylashtirishda xatolik:", error);
      
      // Xatolik standart Error obyekti ekanligini tekshiramiz
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Xatolik yuz berdi. Internetni tekshiring.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-gradient-to-t from-slate-900/10 to-transparent pointer-events-none">
      <div className="max-w-md mx-auto bg-white border border-slate-200/80 shadow-2xl rounded-t-[2.5rem] rounded-b-[2rem] overflow-hidden pointer-events-auto transition-all duration-300">
        
        {/* Header - Savat paneli */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="bg-blue-600 p-4 flex justify-between items-center cursor-pointer text-white hover:bg-blue-700 transition-colors select-none active:bg-blue-800"
        >
          <div className="flex items-center gap-3">
            <div className="relative bg-white/20 p-2.5 rounded-xl">
              <ShoppingCart size={20} />
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-black shadow-md">
                {items.length}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-black tracking-tight text-sm uppercase">Xarid Savati</span>
              <span className="text-xs text-blue-100 font-bold">{totalSum.toLocaleString()} {"so'm"}</span>
            </div>
          </div>
          <span className="text-[10px] bg-white/20 px-3 py-1.5 rounded-xl font-black uppercase tracking-wider">
            {isOpen ? "Yopish" : "Ochish"}
          </span>
        </div>

        {/* Savat ochiq holatda */}
        {isOpen && (
          <div className="max-h-[65vh] overflow-y-auto p-5 space-y-5 bg-white">
            
            {/* Mijoz Ma'lumotlari */}
            <div className="space-y-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-100/70">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 size={14} className="text-blue-600" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{"Mijoz ma'lumotlari"}</span>
              </div>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input 
                  placeholder="Ism sharifi (Majburiy)"
                  value={customerName}
                  onChange={(e) => setCustomerInfo(e.target.value, customerPhone)}
                  className="pl-10 bg-white border-slate-200/80 focus-visible:ring-blue-500 rounded-xl h-12 font-semibold text-sm"
                />
              </div>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input 
                  placeholder="Telefon raqami (Ixtiyoriy)"
                  value={customerPhone}
                  onChange={(e) => setCustomerInfo(customerName, e.target.value)}
                  className="pl-10 bg-white border-slate-200/80 focus-visible:ring-blue-500 rounded-xl h-12 font-semibold text-sm"
                />
              </div>
            </div>

            {/* Mahsulotlar ro'yxati */}
            <div className="space-y-2 max-h-[25vh] overflow-y-auto pr-1">
              {items.map((item) => (
                // Kalit sifatida unikal cartItemId ishlatamiz
                <div key={item.cartItemId} className="flex justify-between items-center p-3 border border-slate-100 rounded-xl bg-white shadow-sm hover:border-slate-200 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 text-sm leading-tight">{item.name}</h4>
                    <p className="text-[11px] text-slate-400 font-bold mt-0.5">
                      {item.input_value} {item.unit_type === 'm2' ? 'm²' : item.unit_type} &rarr;{' '}
                      <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-black text-[10px]">
                        {item.calculated_pieces} dona
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-2">
                    <span className="font-black text-slate-900 text-sm">{item.total_price?.toLocaleString()} {"so'm"}</span>
                    <button 
                      onClick={() => removeItem(item.cartItemId)} // o'chirishda ham cartItemId uzatamiz
                      className="text-slate-300 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pastki tugmalar */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex gap-2">
                <Button 
                  onClick={() => generatePDF(items, totalSum, { name: customerName, phone: customerPhone })}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-xl"
                >
                  <FileText size={18} className="mr-2" />
                  PDF Chek
                </Button>
                <Button 
                  onClick={() => {
                    if(confirm("Savatni butunlay bo'shatmoqchimisiz?")) clearCart();
                  }} 
                  variant="outline" 
                  className="border-red-100 text-red-500 hover:text-red-600 hover:bg-red-50 h-12 rounded-xl px-4"
                >
                  <Trash2 size={20} />
                </Button>
              </div>

              <Button 
                onClick={handleFinalCheckout}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black h-14 text-base rounded-2xl shadow-xl shadow-blue-100 disabled:bg-slate-200 disabled:text-slate-400"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={18} /> BAZAGA YOZILMOQDA...
                  </span>
                ) : (
                  "SOTUVNI YAKUNLASH"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}