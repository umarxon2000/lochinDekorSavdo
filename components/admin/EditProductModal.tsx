"use client"
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

// TypeScript interfeyslari - Netlify build silliq o'tishi uchun
export interface ProductVariant {
  id?: string; // variantlarni unikal aniqlash uchun (key uchun muhim)
  color: string;
  series: string;
  stock: number;
}

interface ProductData {
  id?: string | null;
  name: string;
  variants?: ProductVariant[];
}

interface EditProductModalProps {
  product: ProductData;
  onSave: (updatedData: { name: string; variants: ProductVariant[] }) => void;
}

export default function EditProductModal({ product, onSave }: EditProductModalProps) {
  const [name, setName] = useState<string>(product.name || '');
  
  // Har bir variantga unikal vaqtinchalik ID beramiz, agar ID bo'lmasa
 const [variants, setVariants] = useState<ProductVariant[]>(() => {
    return (product.variants || []).map((v, i) => ({ 
      ...v, 
      id: v.id || `var-${Math.random().toString(36).substr(2, 9)}-${i}` 
    }));
  });

  const addVariant = () => {
    setVariants([
      ...variants, 
      { id: `var-${Date.now()}-${variants.length}`, color: '', series: '', stock: 0 }
    ]);
  };

  const removeVariant = (id: string) => {
    setVariants(variants.filter(v => v.id !== id));
  };

  // State-ni mutatsiya qilmasdan, chuqur nusxa olib yangilash (Immutability)
  const updateVariant = (id: string, field: keyof ProductVariant, value: string | number) => {
    setVariants(prevVariants =>
      prevVariants.map(v => 
        v.id === id ? { ...v, [field]: value } : v
      )
    );
  };

  return (
    <div className="space-y-6 p-4 bg-white rounded-3xl">
      {/* Mahsulot nomi kiritish */}
      <div className="space-y-2">
        <label className="text-xs font-black uppercase text-slate-400 ml-1">Mahsulot Nomi</label>
        <Input 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          className="h-12 rounded-2xl bg-slate-50 border-none focus-visible:ring-blue-500 font-medium" 
          placeholder="Masalan: Alukobond Panel"
        />
      </div>

      {/* Variantlar ro'yxati */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-xs font-black uppercase text-slate-400 ml-1">Variantlar (Rang/Seriya)</label>
          <Button 
            onClick={addVariant} 
            size="sm" 
            variant="outline" 
            className="rounded-xl border-blue-500 text-blue-600 hover:bg-blue-50 font-bold active:scale-95 transition-all"
          >
            <Plus size={16} className="mr-1" /> {"Qo'shish"}
          </Button>
        </div>

        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
          {variants.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-4 bg-slate-50 rounded-2xl border border-dashed">
              {"Hali hech qanday variant qo'shilmagan."}
            </p>
          ) : (
            variants.map((v) => (
              <div key={v.id} className="flex gap-3 items-end bg-slate-50/70 border border-slate-100 p-4 rounded-2xl relative shadow-sm">
                <div className="flex-1 space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Rang</span>
                  <Input 
                    value={v.color} 
                    onChange={(e) => updateVariant(v.id!, 'color', e.target.value)} 
                    className="rounded-xl bg-white border-slate-200/60 h-10 text-sm font-semibold"
                    placeholder="Masalan: Oltin, Kumush" 
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Seriya</span>
                  <Input 
                    value={v.series} 
                    onChange={(e) => updateVariant(v.id!, 'series', e.target.value)} 
                    className="rounded-xl bg-white border-slate-200/60 h-10 text-sm font-semibold"
                    placeholder="Masalan: A-101, B-202" 
                  />
                </div>
                <Button 
                  onClick={() => removeVariant(v.id!)} 
                  variant="ghost" 
                  size="icon"
                  className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl h-10 w-10 transition-colors"
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Saqlash tugmasi */}
      <Button 
        onClick={() => onSave({ name, variants })} 
        className="w-full h-14 bg-blue-600 hover:bg-blue-700 rounded-2xl font-black text-white shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
      >
        SAQLASH
      </Button>
    </div>
  );
}