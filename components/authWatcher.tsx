"use client"
import { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useCartStore } from '@/store/useCartStore';

export default function AuthWatcher() {
  const supabase = createClient();
  const setSellerInfo = useCartStore((state) => state.setSellerInfo);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Supabase user metadata ichidan nickname-ni olamiz
        const nickname = user.user_metadata?.nickname || user.email?.split('@')[0];
        setSellerInfo(user.id, nickname);
      }
    };
    getUser();
  }, [setSellerInfo]);

  return null; // Hech narsa ko'rsatmaydi
}