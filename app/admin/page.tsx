"use client"
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit, Package, Save, Loader2, Trash2, AlertTriangle, TrendingUp, } from "lucide-react";
import { Product } from '@/types/product';
import Link from 'next/link';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<any>({
    id: null, name: '', category: 'yogoch', price_per_unit: '', 
    unit_type: 'metr', length: '', width: '', thickness: '', 
    in_package: '', stock_quantity: ''
  });

  const supabase = createClient();

  const categories = [
    { label: "Yog'och mahsulotlari", value: "yogoch" },
    { label: "Dekor panellar", value: "dekor" },
    { label: "Karnizlar", value: "karniz" }
  ];

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  // Statistika hisoblash
  const stats = {
    totalStock: products.length,
    lowStock: products.filter(p => (p.stock_quantity || 0) <= 10).length,
    totalValue: products.reduce((sum, p) => sum + ((p.stock_quantity || 0) * (p.price_per_unit || 0)), 0)
  };

  const openDialog = (product: any = null) => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({
        id: null, name: '', category: 'yogoch', price_per_unit: '', 
        unit_type: 'metr', length: '', width: '', thickness: '', 
        in_package: '', stock_quantity: 0
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price_per_unit) return alert("Nom va narx majburiy!");
    
    setIsSaving(true);
    const { id, created_at, ...dataToSave } = formData;

    try {
      if (id) {
        await supabase.from('products').update(dataToSave).eq('id', id);
      } else {
        await supabase.from('products').insert([dataToSave]);
      }
      setIsDialogOpen(false);
      fetchProducts();
    } catch (error) {
      console.error(error);
      alert("Xatolik yuz berdi!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Haqiqatan ham o'chirmoqchimisiz?")) return;
    await supabase.from('products').delete().eq('id', id);
    fetchProducts();
  };

  if (loading) return <div className="p-10 text-center font-bold animate-pulse text-blue-600">Yuklanmoqda...</div>;

    const handleLogout = async () => {
  await supabase.auth.signOut();
  router.push('/login');
  router.refresh();
};

  return (
    <div className="p-4 max-w-6xl mx-auto pb-24 bg-slate-50/50 min-h-screen">
      {/* Header & Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase flex items-center gap-3">
            <Package className="text-blue-600" size={32} /> Ombor
          </h1>
         
        </div>
        <Button onClick={() => openDialog()} className="bg-blue-600 hover:bg-blue-700 font-bold rounded-2xl h-12 px-6 shadow-lg shadow-blue-200 transition-all active:scale-95">
          <Plus size={20} className="mr-2" /> Yangi Mahsulot
        </Button>
      </div>

      {/* Statistika Kartochkalari */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-2xl text-blue-600"><Package /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Jami mahsulot</p>
            <p className="text-2xl font-black text-slate-800">{stats.totalStock} <span className="text-sm font-medium text-slate-400">turda</span></p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-orange-50 p-3 rounded-2xl text-orange-600"><AlertTriangle /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Kam qolgan</p>
            <p className="text-2xl font-black text-orange-600">{stats.lowStock} <span className="text-sm font-medium text-slate-400">ta</span></p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600"><TrendingUp /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Ombor qiymati</p>
            <p className="text-2xl font-black text-emerald-600">{stats.totalValue.toLocaleString()} <span className="text-xs font-medium text-slate-400">{"so'm"}</span></p>
          </div>
        </div>
      </div>

      {/* Mahsulotlar Jadvali */}
      <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-xl shadow-slate-200/50">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="font-black text-slate-500 uppercase text-[10px] pl-6">Mahsulot</TableHead>
              <TableHead className="font-black text-slate-500 uppercase text-[10px]">Narxi</TableHead>
              <TableHead className="font-black text-slate-500 uppercase text-[10px]">Qoldiq</TableHead>
              <TableHead className="font-black text-slate-500 uppercase text-[10px] text-right pr-6">Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                <TableCell className="pl-6 py-4">
                  <div className="font-bold text-slate-800">{p.name}</div>
                  <div className="text-[10px] text-blue-500 font-black uppercase tracking-tighter">{p.category}</div>
                </TableCell>
                <TableCell className="font-bold text-slate-600">
                   {p.price_per_unit?.toLocaleString()} <span className="text-[10px] font-medium opacity-50">{"so'm"}</span>
                </TableCell>
                <TableCell>
                  <span className={`px-3 py-1 rounded-full text-xs font-black ${p.stock_quantity <= 10 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {p.stock_quantity || 0} dona
                  </span>
                </TableCell>
                <TableCell className="text-right pr-6 space-x-1">
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl" onClick={() => openDialog(p)}>
                    <Edit size={18} />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl" onClick={() => handleDelete(p.id)}>
                    <Trash2 size={18} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog (Tahrirlash/Yangi) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md bg-white rounded-[2.5rem] p-8 border-none shadow-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black italic tracking-tighter text-slate-800">
              {formData.id ? "TAHRIRLASH" : "YANGI MAHSULOT"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-5 py-6">
            <div className="col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Mahsulot nomi</label>
              <Input 
                className="rounded-2xl bg-slate-50 border-none h-12 focus-visible:ring-blue-500 font-medium"
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                placeholder="Masalan: Luvr Dekor Panel" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Kategoriya</label>
              <select 
                className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Birlik turi</label>
              <select 
                className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.unit_type} 
                onChange={e => setFormData({...formData, unit_type: e.target.value})}
              >
                <option value="metr">Metr</option>
                <option value="m2">M²</option>
                <option value="dona">Dona</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Narxi (1 birlik)</label>
              <Input className="rounded-2xl bg-slate-50 border-none h-12 font-medium" type="number" value={formData.price_per_unit} onChange={e => setFormData({...formData, price_per_unit: Number(e.target.value)})} />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Paketda (dona)</label>
              <Input className="rounded-2xl bg-slate-50 border-none h-12 font-medium" type="number" value={formData.in_package} onChange={e => setFormData({...formData, in_package: Number(e.target.value)})} />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Uzunligi (mm)</label>
              <Input className="rounded-2xl bg-slate-50 border-none h-12 font-medium" type="number" value={formData.length} onChange={e => setFormData({...formData, length: Number(e.target.value)})} />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Eni (mm)</label>
              <Input className="rounded-2xl bg-slate-50 border-none h-12 font-medium" type="number" value={formData.width} onChange={e => setFormData({...formData, width: Number(e.target.value)})} />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Qalinligi (mm)</label>
              <Input className="rounded-2xl bg-slate-50 border-none h-12 font-medium" type="number" value={formData.thickness} onChange={e => setFormData({...formData, thickness: Number(e.target.value)})} />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Ombor (dona)</label>
              <Input className="rounded-2xl bg-slate-50 border-none h-12 font-medium text-blue-600" type="number" value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: Number(e.target.value)})} />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleSave} disabled={isSaving} className="w-full bg-blue-600 hover:bg-blue-800 font-black h-14 rounded-2xl shadow-xl shadow-blue-100 transition-all active:scale-95">
              {isSaving ? <Loader2 className="animate-spin" /> : <Save className="mr-2" />}
              {"MA'LUMOTLARNI SAQLASH"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}