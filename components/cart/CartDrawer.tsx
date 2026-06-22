"use client"
import { useCartStore } from '@/store/useCartStore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Trash2, FileText, User, Phone, CheckCircle2 } from "lucide-react";
import { useState } from 'react';
import { generatePDF } from '@/utils/generatePDF';
import { createClient } from '@/utils/supabase/client'; // Supabase clientingizni tekshiring

export default function CartDrawer() {
  const { items, removeItem, clearCart, customerName, customerPhone, setCustomerInfo } = useCartStore();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const totalSum = items.reduce((sum, item) => sum + item.totalPrice, 0);

  if (items.length === 0) return null;

 const handleFinalCheckout = async () => {
  if (!customerName) return alert("Iltimos, mijoz ismini kiriting!");
  
  setLoading(true);
  try {
    // RPC orqali bitta so'rov yuboramiz
    const { error } = await supabase.rpc('complete_sale_transaction', {
      p_customer_name: customerName,
      p_customer_phone: customerPhone,
      p_total_amount: totalSum,
      p_items: items.map(item => ({
        product_id: item.id,
        quantity_pieces: item.calculatedPieces,
        quantity_value: item.inputValue,
        price_at_sale: item.totalPrice
      }))
    });

    if (error) throw error;

    // PDF yaratish va savatni tozalash
    generatePDF(items, totalSum, { name: customerName, phone: customerPhone });
    alert("Sotuv muvaffaqiyatli yakunlandi!");
    clearCart();
    setIsOpen(false);
  } catch (error) {
    console.error("Xatolik:", error);
    alert("Xatolik yuz berdi. Internetni tekshiring.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-md mx-auto bg-white border-2 border-blue-600 shadow-2xl rounded-t-3xl overflow-hidden">
        
        {/* Header - Toggle */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="bg-blue-600 p-4 flex justify-between items-center cursor-pointer text-white hover:bg-blue-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="relative bg-white/20 p-2 rounded-lg">
              <ShoppingCart size={20} />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                {items.length}
              </span>
            </div>
            <span className="font-bold tracking-tight">Savat ({totalSum.toLocaleString()} {"so'm"})</span>
          </div>
          <span className="text-xs bg-white/20 px-2 py-1 rounded font-bold uppercase">
            {isOpen ? "Yopish" : "Ochish"}
          </span>
        </div>

        {isOpen && (
          <div className="max-h-[75vh] overflow-y-auto p-4 space-y-4 bg-white">
            
            {/* Mijoz Inputlari */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 size={14} className="text-blue-600" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{"Mijoz ma'lumotlari"}</span>
              </div>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input 
                  placeholder="Ism sharifi"
                  value={customerName}
                  onChange={(e) => setCustomerInfo(e.target.value, customerPhone)}
                  className="pl-10 bg-white border-slate-200 focus:ring-blue-500 rounded-xl h-12"
                />
              </div>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input 
                  placeholder="Telefon raqami"
                  value={customerPhone}
                  onChange={(e) => setCustomerInfo(customerName, e.target.value)}
                  className="pl-10 bg-white border-slate-200 focus:ring-blue-500 rounded-xl h-12"
                />
              </div>
            </div>

            {/* Mahsulotlar ro'yxati */}
            <div className="space-y-2">
               {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 border border-slate-100 rounded-2xl bg-white shadow-sm">
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {item.inputValue} {item.unit === 'm2' ? 'm²' : item.unit} &rarr; <span className="text-blue-600 font-bold">{item.calculatedPieces} dona</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-black text-slate-900 text-sm">{item.totalPrice.toLocaleString()}</span>
                    <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 p-1">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Amallar */}
            <div className="pt-4 border-t space-y-3">
              <div className="flex gap-2">
                <Button 
                  onClick={() => generatePDF(items, totalSum, { name: customerName, phone: customerPhone })}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-xl"
                >
                  <FileText size={18} className="mr-2" />
                  PDF Chek
                </Button>
                <Button onClick={clearCart} variant="outline" className="border-red-100 text-red-500 h-12 rounded-xl px-4">
                  <Trash2 size={20} />
                </Button>
              </div>

              <Button 
                onClick={handleFinalCheckout}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-800 text-white font-black h-14 text-lg rounded-2xl shadow-xl transition-all disabled:bg-slate-300"
              >
                {loading ? "SAQLANMOQDA..." : "SOTUVNI YAKUNLASH"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}