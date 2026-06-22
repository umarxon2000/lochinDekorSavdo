import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

// setAll uchun kerak bo'ladigan cookie obyekti strukturasini belgilaymiz
interface CookieToSet {
  name: string;
  value: string;
  options?: Partial<ResponseCookie>;
}

export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {
            // Server Component ichida middleware yoki server action-dan tashqari 
            // holatlarda cookie-ni o'zgartirish (set qilish) taqiqlangan.
            // Next.js arxitekturasi bo'yicha buni yutib yuborish xavfsiz hisoblanadi.
            void error; 
          }
        },
      },
    }
  );
};