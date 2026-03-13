// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import * as db from "@/lib/sheets/db";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // LOG DE DEPURAÇÃO: Verificando o que o usuário digitou
    console.log("-----------------------------------------");
    console.log("DADOS RECEBIDOS NO LOGIN:");
    console.log("E-mail digitado:", email);
    console.log("Senha digitada:", password);
    console.log("-----------------------------------------");

    const users = await db.getAll("usuarios");

    // LOG DE DEPURAÇÃO: Verificando se a lista de usuários veio da planilha
    console.log("Total de usuários encontrados na planilha:", users.length);

    const user = users.find((u: any) => {
      const uEmail = u["E-mail"] || u["Email"] || u["email"];
      const uPass = u["Senha"] || u["senha"] || u["password"];

      // Log individual para comparação se o e-mail coincidir
      if (uEmail === email) {
        console.log(
          `Usuário encontrado! Comparando Senha Planilha: [${uPass}] com Digitada: [${password}]`,
        );
      }

      return uEmail === email && String(uPass) === String(password);
    });

    if (!user) {
      return NextResponse.json(
        { message: "E-mail ou senha incorretos" },
        { status: 401 },
      );
    }

    const sessionData = {
      id: user.id,
      name: user["Nome"] || "Usuário",
      email: email,
      role: user["Role"] || "user",
    };

    await createSession(sessionData);
    return NextResponse.json(sessionData);
  } catch (error: any) {
    console.error("ERRO CRÍTICO NO LOGIN:", error.message);
    return NextResponse.json(
      {
        message: "Erro de autenticação com o banco de dados",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
