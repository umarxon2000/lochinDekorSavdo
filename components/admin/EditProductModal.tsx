// components/admin/EditProductModal.tsx
"use client"
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, X } from "lucide-react";

export default function EditProductModal({ product, onSave }) {
  const [name, setName] = useState(product.name);
  const [variants, setVariants] = useState(product.variants || []);

  const addVariant = () => {
    setVariants([...variants, { color: '', series: '', stock: 0 }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: string, value: any) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  return (
    <div className="space-y-6 p-4">
      <div className="space-y-2">
        <label className="text-xs font-black uppercase text-slate-400">Mahsulot Nomi</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} className="h-12 rounded-xl" />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-xs font-black uppercase text-slate-400">Variantlar (Rang/Seriya)</label>
          <Button onClick={addVariant} size="sm" variant="outline" className="rounded-full border-blue-500 text-blue-600">
            <Plus size={16} /> Qo'shish
          </Button>
        </div>

        {variants.map((v, index) => (
          <div key={index} className="flex gap-2 items-end bg-slate-50 p-3 rounded-2xl relative">
            <div className="flex-1 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Rang</span>
              <Input value={v.color} onChange={(e) => updateVariant(index, 'color', e.target.value)} placeholder="Oltin" />
            </div>
            <div className="flex-1 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Seriya</span>
              <Input value={v.series} onChange={(e) => updateVariant(index, 'series', e.target.value)} placeholder="A-101" />
            </div>
            <Button onClick={() => removeVariant(index)} variant="ghost" className="text-red-500 p-2">
              <Trash2 size={18} />
            </Button>
          </div>
        ))}
      </div>

      <Button onClick={() => onSave({ name, variants })} className="w-full h-14 bg-blue-600 rounded-2xl font-black">
        SAQLASH
      </Button>
    </div>
  );
}