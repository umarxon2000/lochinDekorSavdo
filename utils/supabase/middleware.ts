import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value }) =>
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

  // Foydalanuvchi sessiyasini tekshirish
  const { data: { user } } = await supabase.auth.getUser();
  const isLoginPage = request.nextUrl.pathname === '/login';

  // ⚠️ Static fayllar, rasmlar va api-larni middleware cheklovidan o'tkazib yuborish
  // Bu qator login sahifasidagi dizaynlar (Tailwind, rasmlar) buzilib ketmasligi uchun muhim
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return response;
  }

  // Tizimga kirmagan bo'lsa, login sahifasiga majburiy yo'naltirish
  if (!user && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Tizimga kirgan bo'lsa, login sahifasiga qayta kirmaslik
  if (user && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

// Next.js qaysi sahifalarda middleware ishlashini bilishi uchun konfiguratsiya
export const config = {
  matcher: [
    /*
     * Quyidagi formatlardan tashqari barcha sahifalarni tekshiradi:
     * - _next/static (statik fayllar)
     * - _next/image (tasvirlarni optimallashtirish fayllari)
     * - favicon.ico (sayt belgisi)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};