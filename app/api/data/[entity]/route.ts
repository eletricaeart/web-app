import { NextResponse } from "next/server";
import { fetchFromGAS } from "@/lib/gas";
import { getSession } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ entity: string }> }, // Ajuste para Promise
) {
  const { entity } = await params;
  const session = await getSession();

  if (!session)
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const data = await fetchFromGAS({
      method: "GET",
      data: id ? { entity, id } : { entity },
    });

    // Se o GAS retornar erro, não mandamos um array vazio, mandamos o erro
    if (data && data.status === "error") {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ entity: string }> },
) {
  const { entity } = await params;
  const session = await getSession();

  if (!session)
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });

  try {
    const body = await request.json();
    const payload = { ...body, entity, owner_id: session.id };

    const result = await fetchFromGAS({
      method: "POST",
      data: payload,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
