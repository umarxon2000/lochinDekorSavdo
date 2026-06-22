"use client"
import { useEffect } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { createClient } from '@/utils/supabase/client';

export default function AuthWatcher() {
  const supabase = createClient();
  // 1. Eski setSellerInfo o'rniga yangi setSelectedSeller funksiyasini olamiz
  const setSelectedSeller = useCartStore((state) => state.setSelectedSeller);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (!error && user) {
        // 2. Zustand store-ga sotuvchi obyektini qat'iy formatda yozamiz
        setSelectedSeller({
          id: user.id,
          name: user.user_metadata?.full_name || user.email || "Sotuvchi",
          phone: user.phone || null
        });
      } else {
        setSelectedSeller(null);
      }
    };

    getUser();

    // Avtorizatsiya holati o'zgarganda (logout yoki login bo'lganda) kuzatish
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setSelectedSeller({
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email || "Sotuvchi",
          phone: session.user.phone || null
        });
      } else {
        setSelectedSeller(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, setSelectedSeller]);

  return null; // Bu komponent faqat background'da kuzatuvchi bo'lib ishlaydi
}