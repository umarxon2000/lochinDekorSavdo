import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Foydalanuvchini tekshiramiz
  const { data: { user } } = await supabase.auth.getUser();

  const isLoginPage = request.nextUrl.pathname === '/login';

  // --- YANGI XAVFSIZLIK QOIDASI ---
  // Agar foydalanuvchi tizimga kirmagan bo'lsa VA hozir login sahifasida bo'lmasa,
  // uni AVTOMATIK ravishda login sahifasiga jo'natib yuboramiz.
  // Bu qoida barcha sahifalarni (shu jumladan '/' bosh sahifani ham) to'liq yopadi.
  if (!user && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Agar foydalanuvchi tizimga kirgan bo'lsa va login sahifasiga kirmoqchi bo'lsa,
  // uni asosiy savdo sahifasiga ('/') qaytaramiz
  if (user && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
};