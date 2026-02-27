// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { fetchFromGAS } from "@/lib/gas";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 1. Busca os usuários direto do Google (pelo servidor, sem expor a URL)
    const users = await fetchFromGAS({
      method: "GET",
      data: { entity: "usuarios" },
    });

    // 2. Valida as credenciais
    const user = users.find(
      (u: any) => u.email === email && String(u.password) === String(password),
    );

    if (!user) {
      return NextResponse.json(
        { message: "E-mail ou senha incorretos" },
        { status: 401 },
      );
    }

    // CRIA A SESSÃO NO COOKIE SEGURO
    const sessionData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    await createSession(sessionData);

    // 3. Aqui depois vamos implementar a Sessão (Cookies),
    // por enquanto vamos apenas retornar o sucesso
    return NextResponse.json(sessionData);
  } catch (error) {
    return NextResponse.json(
      { message: "Erro interno no servidor" },
      { status: 500 },
    );
  }
}
