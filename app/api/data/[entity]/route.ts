// app/api/data/[entity]/route.ts
import { NextResponse } from "next/server";
import { fetchFromGAS } from "@/lib/gas";
import { getSession } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { entity: string } },
) {
  const { entity } = await params;
  const session = await getSession();

  if (!session)
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });

  try {
    const data = await fetchFromGAS({
      method: "GET",
      data: { entity },
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: "Erro ao buscar dados" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { entity: string } },
) {
  const { entity } = await params;
  const session = await getSession();

  if (!session)
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });

  try {
    const body = await request.json();

    // Injetamos o ID do usuário logado como owner_id automaticamente no servidor!
    const payload = {
      ...body,
      entity,
      owner_id: session.id,
    };

    const result = await fetchFromGAS({
      method: "POST",
      data: payload,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: "Erro ao salvar dados" },
      { status: 500 },
    );
  }
}
