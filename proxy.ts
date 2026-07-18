// proxy.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const ADMIN_SECRET_PATH = process.env.ADMIN_SECRET_PATH || '';

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  const isPublicAuthPage = path === '/login' || path === '/cadastro';
  const isPublicSharedPage = path.startsWith('/validar');
  const isApiAuth = path.startsWith('/api/auth');

  const adminLoginPath = `/painel/${ADMIN_SECRET_PATH}/login`;
  const isAdminLoginPage = path === adminLoginPath;
  const isAdminArea = path.startsWith('/painel') && !isAdminLoginPage;

  if (isAdminArea) {
    if (!user) {
      return NextResponse.redirect(new URL(adminLoginPath, request.url));
    }

    const adminClient = createAdminClient();
    const { data: adminRecord } = await adminClient
      .from('admin_users')
      .select('id, is_active')
      .eq('id', user.id)
      .maybeSingle();

    // Sem registro, ou registro banido/desativado: nunca entra no painel
    if (!adminRecord || !adminRecord.is_active) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return supabaseResponse;
  }

  if (user && isAdminLoginPage) {
    const adminClient = createAdminClient();
    const { data: adminRecord } = await adminClient
      .from('admin_users')
      .select('id, is_active')
      .eq('id', user.id)
      .maybeSingle();

    if (adminRecord && adminRecord.is_active) {
      return NextResponse.redirect(new URL('/painel', request.url));
    }
  }

  if (
    !user &&
    !isPublicAuthPage &&
    !isPublicSharedPage &&
    !isApiAuth &&
    !isAdminLoginPage
  ) {
    return supabaseResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.json|pix|fonts).*)',
  ],
};
