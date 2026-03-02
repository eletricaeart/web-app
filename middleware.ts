// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
// import type { NextRequest } from "next/request";
import { getSession } from "@/lib/auth";

// 1. Defina quais rotas são públicas (não precisam de login)
const publicRoutes = ["/login", "/api/auth/login"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(path);

  // 2. Verifica se existe sessão ativa
  const session = await getSession();

  // 3. Redirecionamento lógico
  if (!isPublicRoute && !session) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isPublicRoute && session && !path.startsWith("/api")) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
}

// Configura em quais caminhos o middleware deve rodar
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
