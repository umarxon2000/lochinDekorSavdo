"use client"
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from "@/components/ui/button";
import { LogOut, UserPlus, Trash2 } from "lucide-react";

export default function ProfilePage() {
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
  const [sellers, setSellers] = useState<any[]>([]);

  useEffect(() => {
    // Profilni va agar admin bo'lsa sotuvchilar ro'yxatini olish
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user?.id).single();
      setProfile(prof);

      if (prof?.role === 'admin') {
        const { data: list } = await supabase.from('profiles').select('*').eq('role', 'seller');
        setSellers(list || []);
      }
    };
    getData();
  }, []);

  return (
    <div className="p-6 pb-24 space-y-8">
      {/* User Info */}
      <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white">
        <h2 className="text-3xl font-black italic">{profile?.nickname}</h2>
        <p className="text-blue-200 font-bold uppercase text-xs">{profile?.role}</p>
      </div>

      {/* Admin uchun Sotuvchilarni boshqarish */}
      {profile?.role === 'admin' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-black uppercase text-slate-800">Sotuvchilar ro'yxati</h3>
            <Button size="sm" className="rounded-full bg-emerald-500 hover:bg-emerald-600">
              <UserPlus size={18} />
            </Button>
          </div>
          <div className="space-y-2">
            {sellers.map(s => (
              <div key={s.id} className="flex justify-between p-4 bg-slate-50 rounded-2xl items-center">
                <span className="font-bold text-slate-700">{s.nickname}</span>
                <Button variant="ghost" className="text-red-500"><Trash2 size={18} /></Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logout */}
      <Button 
        onClick={async () => { await supabase.auth.signOut(); window.location.href = '/login'; }}
        className="w-full h-16 bg-slate-100 hover:bg-red-50 text-red-600 font-black rounded-2xl border-none shadow-none"
      >
        <LogOut className="mr-2" /> TIZIMDAN CHIQISH
      </Button>
    </div>
  );
}