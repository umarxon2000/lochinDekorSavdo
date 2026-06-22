"use client"
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AddProduct() {
  const [formData, setFormData] = useState({
    name: '',
    width: '',
    height: '',
    inPackage: '',
    price: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Bazaga yuboriladigan ma'lumot:", formData);
    // Bu yerda API orqali bazaga saqlash kodi bo'ladi
    alert("Mahsulot qo'shildi!");
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded-xl border space-y-4 shadow-sm">
      <h2 className="text-xl font-bold">{"Yangi mahsulot qo'shish"}</h2>
      
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label>Mahsulot nomi</Label>
          <Input placeholder="Masalan: Gipsokarton Knauf" onChange={e => setFormData({...formData, name: e.target.value})} />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Eni (mm)</Label>
            <Input type="number" placeholder="1200" onChange={e => setFormData({...formData, width: e.target.value})} />
          </div>
          <div>
            <Label>{"Bo'yi (mm)"}</Label>
            <Input type="number" placeholder="2500" onChange={e => setFormData({...formData, height: e.target.value})} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Pachkada (dona)</Label>
            <Input type="number" placeholder="1" onChange={e => setFormData({...formData, inPackage: e.target.value})} />
          </div>
          <div>
            <Label>Narxi (dona uchun)</Label>
            <Input type="number" placeholder="45000" onChange={e => setFormData({...formData, price: e.target.value})} />
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
        Saqlash
      </Button>
    </form>
  );
}