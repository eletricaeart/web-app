// proxy.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Segredo da URL do admin, vindo do .env (nunca comitado no código)
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

  // 1. IMPORTANTE: getUser() é o método seguro que valida o token no servidor
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // 2. DEFINIÇÃO DE ROTAS PÚBLICAS (site aberto ao visitante/cliente comum)
  const isPublicAuthPage = path === '/login' || path === '/cadastro';
  const isPublicSharedPage = path.startsWith('/validar');
  const isApiAuth = path.startsWith('/api/auth');

  // 3. DEFINIÇÃO DE ROTAS DO PAINEL ADMINISTRATIVO
  const adminLoginPath = `/painel/${ADMIN_SECRET_PATH}/login`;
  const isAdminLoginPage = path === adminLoginPath;
  const isAdminArea = path.startsWith('/painel') && !isAdminLoginPage;

  // 4. PROTEÇÃO DO PAINEL: exige usuário logado E presente em admin_users
  if (isAdminArea) {
    if (!user) {
      return NextResponse.redirect(new URL(adminLoginPath, request.url));
    }

    // Usamos o cliente com Service Role Key aqui porque admin_users tem RLS
    // ativo sem nenhuma policy — o cliente autenticado comum não conseguiria
    // ler essa tabela de forma nenhuma, nem para o próprio usuário.
    const adminClient = createAdminClient();
    const { data: adminRecord } = await adminClient
      .from('admin_users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (!adminRecord) {
      // Usuário existe mas não é admin: nunca deixamos entrar no painel
      return NextResponse.redirect(new URL('/', request.url));
    }

    return supabaseResponse;
  }

  // 5. Se já logado como admin e tentar acessar a tela de login do admin, manda pro painel
  if (user && isAdminLoginPage) {
    const adminClient = createAdminClient();
    const { data: adminRecord } = await adminClient
      .from('admin_users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (adminRecord) {
      return NextResponse.redirect(new URL('/painel', request.url));
    }
  }

  // 6. LÓGICA DA PARTE PÚBLICA (site/app do cliente comum)
  // Por enquanto, liberado para todos - a proteção de rotas privadas do
  // usuário comum (ex: "/minha-conta") será adicionada quando essas
  // páginas existirem.
  if (
    !user &&
    !isPublicAuthPage &&
    !isPublicSharedPage &&
    !isApiAuth &&
    !isAdminLoginPage
  ) {
    // Ainda não bloqueamos nada na parte pública além do próprio /login;
    // isso será refinado quando tivermos as páginas privadas do site público.
    return supabaseResponse;
  }

  return supabaseResponse;
}

export const config = {
  // Matcher refinado para ignorar arquivos estáticos e pastas de assets
  matcher: [
    /*
     * Aplica o middleware em todas as rotas exceto:
     * - api (rotas de API)
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagens)
     * - favicon.ico, sitemap.xml, robots.txt, manifest.json (arquivos de SEO)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.json|pix|fonts).*)',
  ],
};
