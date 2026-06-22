"use client"
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from "@/components/ui/button";
import { LogOut, UserPlus, Trash2, ShieldUser, Users } from "lucide-react";
import { useRouter } from 'next/navigation';

// TypeScript interfeysi - Netlify build xatolarining oldini olish uchun
interface Profile {
  id: string;
  nickname: string;
  role: 'admin' | 'seller';
  created_at?: string;
}

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sellers, setSellers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        
        // 1. Tizimga kirgan foydalanuvchini olish
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          router.push('/login');
          return;
        }

        // 2. Foydalanuvchi profilini olish
        const { data: prof, error: profError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profError) throw profError;
        
        const currentProfile = prof as Profile;
        setProfile(currentProfile);

        // 3. Agar roli admin bo'lsa, sotuvchilar ro'yxatini olish
        if (currentProfile?.role === 'admin') {
          const { data: list, error: listError } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'seller')
            .order('nickname', { ascending: true });

          if (listError) throw listError;
          setSellers((list as Profile[]) || []);
        }
      } catch (error) {
        console.error("Profil ma'lumotlarini yuklashda xatolik:", error);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [supabase, router]);

  const handleLogout = async () => {
    if (!confirm("Tizimdan chiqmoqchimisiz?")) return;
    try {
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error("Chiqishda xatolik:", error);
    }
  };

  const handleDeleteSeller = async (id: string, nickname: string) => {
    if (!confirm(`Haqiqatan ham "${nickname}" sotuvchisini o'chirmoqchimisiz?`)) return;
    
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      
      // Ro'yxatni qayta yangilash (State orqali tezkor o'chirish)
      setSellers(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error("Sotuvchini o'chirishda xatolik:", error);
      alert("O'chirishda xatolik yuz berdi!");
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center font-bold animate-pulse text-blue-600">
        {"Profil ma'lumotlari yuklanmoqda..."}
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6 pb-24 min-h-screen bg-slate-50/50">
      {/* Foydalanuvchi Ma'lumotlari Kartochkasi */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-[2rem] text-white shadow-xl shadow-blue-500/10 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase opacity-70 tracking-widest">Foydalanuvchi</p>
          <h2 className="text-3xl font-black italic tracking-tight">{profile?.nickname || "Noma'lum"}</h2>
          <span className="inline-flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mt-1">
            <ShieldUser size={12} /> {profile?.role === 'admin' ? 'Adminstrator' : 'Sotuvchi'}
          </span>
        </div>
      </div>

      {/* Admin paneli - Faqat Adminlar uchun sotuvchilarni boshqarish */}
      {profile?.role === 'admin' && (
        <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-black uppercase text-sm text-slate-800 flex items-center gap-2">
              <Users size={18} className="text-blue-500" /> {"Sotuvchilar ro'yxati"} ({sellers.length})
            </h3>
            <Button size="icon" className="rounded-xl bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-100 active:scale-95 transition-all">
              <UserPlus size={18} />
            </Button>
          </div>
          
          <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
            {sellers.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-4">Sotuvchilar mavjud emas.</p>
            ) : (
              sellers.map(s => (
                <div key={s.id} className="flex justify-between p-3 bg-slate-50 rounded-2xl items-center border border-slate-100/50 hover:bg-slate-100/50 transition-colors">
                  <span className="font-bold text-sm text-slate-700">{s.nickname}</span>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeleteSeller(s.id, s.nickname)}
                    className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tizimdan Chiqish Tugmasi */}
      <Button 
        onClick={handleLogout}
        className="w-full h-14 bg-white hover:bg-red-50 text-red-500 hover:text-red-600 font-black rounded-2xl border border-slate-200/60 hover:border-red-100 shadow-sm transition-all active:scale-[0.98]"
      >
        <LogOut className="mr-2" size={18} /> TIZIMDAN CHIQISH
      </Button>
    </div>
  );
}