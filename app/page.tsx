"use client"
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import SaleCard from '@/components/SaleCard';
import CartDrawer from '@/components/cart/CartDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Product } from '@/types/product'; // To'g'ri interfeysni ulaymiz
import { Search, Loader2 } from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const supabase = createClient();

  // Imlo xatolari tuzatilgan kategoriyalar ro'yxati
  const categories = [
    { label: "Yog‘ochlar", value: "yogoch" },
    { label: "Dekorlar", value: "dekor" },
    { label: "Karnizlar", value: "karniz" }
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      
      // Diqqat! Agar variantlar alohida jadvalda bo'lsa, select('*, variants(*)') qilamiz.
      // Agar JSONB ustunida bo'lsa, select('*') yetarli. Biz har ikkala holatga moslab chaqiramiz.
      const { data, error } = await supabase
        .from('products')
        .select('*, variants(*)') 
        .order('name', { ascending: true });

      if (error) {
        // Agar variants jadvali hali ulanmagan bo'lsa, faqat mahsulotlarni o'zini qayta oladi
        const { data: fallbackData } = await supabase
          .from('products')
          .select('*')
          .order('name', { ascending: true });
        setProducts((fallbackData as Product[]) || []);
      } else {
        setProducts((data as Product[]) || []);
      }
      
      setLoading(false);
    };
    fetchProducts();
  }, []);

  // Kengaytirilgan "Smart qidiruv": Nomidan tashqari variant rangi yoki seriyasi bo'yicha ham qidiradi
  const filteredProducts = products.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    
    const matchesName = p.name.toLowerCase().includes(searchLower);
    
    // Variantlar ichidan (rangi yoki seriyasidan) qidirish
    const matchesVariant = p.variants?.some(v => 
      v.color?.toLowerCase().includes(searchLower) || 
      v.series?.toLowerCase().includes(searchLower) ||
      v.factory?.toLowerCase().includes(searchLower)
    ) || false;

    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    
    return (matchesName || matchesVariant) && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-slate-50 pb-32">
      {/* Yopishqoq (Sticky) Header: Mobil uchun ixcham o'lchamlar */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm p-3 sm:p-4 space-y-3">
        <div className="max-w-4xl mx-auto space-y-2.5">
          <header className="flex justify-between items-center px-0.5">
            <h1 className="text-lg sm:text-xl font-black text-slate-950 italic uppercase tracking-tight">
              Lochin Dekor <span className="text-xs font-bold text-blue-600 not-italic lowercase">savdo</span>
            </h1>
            <div className="h-1.5 w-8 bg-blue-600 rounded-full"></div>
          </header>

          {/* Qidiruv input oynasi */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input 
              placeholder="Mahsulot nomi, turi yoki seriyasini kiriting..." 
              className="pl-9 rounded-xl bg-slate-100/80 border-none h-11 text-xs sm:text-sm focus-visible:ring-2 focus-visible:ring-blue-500/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Gorizontal Kategoriya tugmalari (Telefonda suriladigan) */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0">
            <Button 
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              className={`rounded-xl px-4 h-8 text-[11px] font-black uppercase tracking-wider transition-all shadow-none border-slate-200/60 ${
                selectedCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'
              }`}
            >
              Hammasi
            </Button>
            {categories.map(cat => (
              <Button 
                key={cat.value}
                variant={selectedCategory === cat.value ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat.value)}
                className={`rounded-xl px-4 h-8 text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all shadow-none border-slate-200/60 ${
                  selectedCategory === cat.value ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'
                }`}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Mahsulotlar ro'yxati (Grid) */}
      <div className="max-w-4xl mx-auto p-3 sm:p-4 mt-2">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="animate-spin text-blue-600" size={28} />
          </div>
        ) : (
          <>
            {/* Telefonda grid-cols-1 qilinishi siqilish va shrift buzilishining oldini oladi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredProducts.map((product) => (
                <SaleCard 
                  key={product.id} 
                  product={product} // To'liq obyektni turlari bilan uzatamiz
                />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 p-6">
                <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">
                  Bunday mahsulot topilmadi
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <CartDrawer />
    </main>
  );
}