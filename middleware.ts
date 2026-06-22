import { createServerClient, type NextRequest } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // .env.local faylingizdagi aniq nomlarni ishlatamiz
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  // Agar kalitlar topilmasa, xatolik chiqmasligi uchun tekshiruv
  if (!supabaseUrl || !supabaseAnonKey) {
    return response
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Foydalanuvchi seansini tekshirish
  const { data: { user } } = await supabase.auth.getUser()

  // HIMOYA MANTIQI:
  // Agar foydalanuvchi tizimga kirmagan bo'lsa va /admin bilan boshlanadigan sahifaga kirmoqchi bo'lsa
  if (!user && request.nextUrl.pathname.startsWith('/admin')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return response
}

// Qaysi sahifalar middleware orqali tekshirilishini belgilash
export const config = {
  matcher: [
    /*
     * Quyidagi yo'llardan tashqari barcha yo'llarni tekshirish:
     * - _next/static (statik fayllar)
     * - _next/image (tasvirlarni optimallashtirish)
     * - favicon.ico (belgi fayli)
     * Faqat /admin bilan boshlanadigan yo'llarda loginni talab qilamiz
     */
    '/admin/:path*',
  ],
}