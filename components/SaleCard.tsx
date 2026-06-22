"use client"
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCartStore } from '@/store/useCartStore';
import { Product, ProductVariant } from '@/types/product';
import { Package, Hash, Layers, CheckCircle2 } from "lucide-react";

export default function SaleCard({ product }: { product: Product }) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  
  const [inputValue, setInputValue] = useState<string>('');
  const addItem = useCartStore((state) => state.addItem);

  const unitType = product.unit_type;
  const price = selectedVariant?.price ? Number(selectedVariant.price) : Number(product.price_per_unit || 0);
  
  const L = Number(product.length || 0);
  const W = Number(product.width || 0);
  const inPkg = Number(product.in_package || 1);

  const val = parseFloat(inputValue) || 0;

  let pieces = 0;
  let totalCash = 0;
  let actualVolume = 0;

  // --- HISOBLASH MANTIQI ---
  if (val > 0) {
    switch (unitType) {
      case 'm2': {
        const areaPerPiece = (W * L) / 1000000;
        if (areaPerPiece > 0) {
          pieces = Math.ceil(val / areaPerPiece);
          actualVolume = pieces * areaPerPiece;
          totalCash = actualVolume * price;
        }
        break;
      }
      case 'metr': {
        const lengthInMeters = L / 1000;
        if (lengthInMeters > 0) {
          pieces = Math.ceil(val / lengthInMeters);
          actualVolume = pieces * lengthInMeters;
          totalCash = actualVolume * price;
        }
        break;
      }
      case 'dona': {
        pieces = Math.ceil(val);
        actualVolume = pieces;
        totalCash = pieces * price;
        break;
      }
    }
  }

  const packages = inPkg > 1 ? Math.ceil(pieces / inPkg) : 0;

  const handleAddToCart = () => {
    if (pieces > 0) {
      const variantText = selectedVariant 
        ? ` (${selectedVariant.color || ''} ${selectedVariant.series || ''})`.trim() 
        : '';
      
      addItem({
        cartItemId: `${product.id}-${selectedVariant?.id || 'default'}`,
        id: product.id,
        variantId: selectedVariant?.id,
        name: `${product.name}${variantText ? ' - ' + variantText : ''}`,
        price_per_unit: price,
        unit_type: unitType,
        input_value: val,
        calculated_pieces: pieces,
        total_price: totalCash,
        width: W,
        length: L,
        thickness: Number(product.thickness || 0),
        category: product.category || ""
      });
      setInputValue('');
    }
  };

  return (
    <Card className="w-full shadow-sm border-none bg-white rounded-3xl overflow-hidden hover:shadow-md transition-all duration-300 border border-slate-100">
      <CardHeader className="p-4 sm:p-5 bg-slate-50/60 space-y-3">
        <div className="space-y-1">
          <CardTitle className="text-lg sm:text-xl font-black text-slate-800 leading-tight">
            {product.name}
          </CardTitle>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            <span className="text-[9px] sm:text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-md uppercase font-black tracking-tight italic">
              {product.category === 'yogoch' ? 'Yog‘och' : product.category === 'dekor' ? 'Dekor' : 'Karniz'}
            </span>
            <span className="text-[9px] sm:text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md font-extrabold uppercase">
              {price.toLocaleString()} so‘m / {unitType === 'm2' ? 'm²' : unitType}
            </span>
          </div>
        </div>

        {/* Variantlarni tanlash (Select) */}
        {product.variants && product.variants.length > 0 && (
          <div className="space-y-1">
            <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase ml-0.5 flex items-center gap-1 tracking-wider">
              <Layers size={11} /> Turini tanlang (Rangi / Seriyasi):
            </label>
            <div className="relative">
              <select 
                className="w-full h-10 sm:h-11 bg-white border border-slate-200 rounded-xl px-3 font-bold text-slate-700 outline-none focus:border-blue-500 appearance-none transition-all cursor-pointer text-xs sm:text-sm"
                onChange={(e) => setSelectedVariant(JSON.parse(e.target.value))}
              >
                {product.variants.map((v, i) => (
                  <option key={i} value={JSON.stringify(v)}>
                    {v.color || 'Standart'} {v.series ? `| Seriya: ${v.series}` : ''} {v.factory ? `| Zavod: ${v.factory}` : ''}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <CheckCircle2 size={15} />
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Miqdor kiritish */}
        <div className="space-y-1">
          <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest px-0.5">
            Sotiladigan miqdor ({unitType === 'm2' ? 'm²' : unitType}):
          </label>
          <div className="relative">
            <Input 
              type="number" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="0.00"
              className="text-xl sm:text-2xl font-black h-12 sm:h-14 border border-slate-100 bg-slate-50/80 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500/20 pr-14 pl-4 transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-slate-300 text-sm sm:text-base uppercase italic">
              {unitType === 'm2' ? 'm²' : unitType === 'metr' ? 'm' : 'dona'}
            </span>
          </div>
        </div>

        {/* Natijalar paneli */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50/40 p-3 rounded-xl border border-blue-100/30 relative overflow-hidden">
             <Hash className="absolute -right-2 -bottom-2 text-blue-100/60" size={50} />
             <span className="text-[9px] sm:text-[10px] font-bold text-blue-400 uppercase block mb-0.5 relative z-10">Soni</span>
             <span className="text-lg sm:text-xl font-black text-blue-700 relative z-10">{pieces} <small className="text-[10px] font-normal text-blue-400">dona</small></span>
          </div>
          <div className="bg-indigo-50/40 p-3 rounded-xl border border-indigo-100/30 relative overflow-hidden">
             <Package className="absolute -right-2 -bottom-2 text-indigo-100/60" size={50} />
             <span className="text-[9px] sm:text-[10px] font-bold text-indigo-400 uppercase block mb-0.5 relative z-10">Qadoq (Pachka)</span>
             <span className="text-lg sm:text-xl font-black text-indigo-700 relative z-10">{packages}</span>
          </div>
        </div>

        {/* Jami summa va Tugma */}
        <div className="flex items-center justify-between pt-3 border-t border-dashed border-slate-100">
          <div className="space-y-0.5">
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase block">Umumiy Summa</span>
            <div className="text-base sm:text-lg font-black text-emerald-600 tracking-tight">
              {Math.round(totalCash).toLocaleString()} <span className="text-[10px] font-bold text-emerald-400 uppercase">uzs</span>
            </div>
          </div>
          <Button 
            onClick={handleAddToCart}
            disabled={pieces === 0}
            className="h-11 sm:h-11 px-5 sm:px-6 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl active:scale-95 transition-all uppercase text-xs tracking-wider"
          >
            Savatga +
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}