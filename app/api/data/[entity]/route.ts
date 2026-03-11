/** app/api/data/[entity]/route.ts */
import { NextResponse } from "next/server";
import * as db from "@/lib/sheets/db";
import { getSession } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { entity: string } },
) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });

    const data = await db.getAll(params.entity);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar dados" },
      { status: 500 },
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { entity: string } },
) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });

    const body = await req.json();
    const result = await db.create(params.entity, {
      ...body,
      owner_id: session.id,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao salvar dados" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { entity: string } },
) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });

    const { id } = await req.json();
    const result = await db.remove(params.entity, id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao eliminar dado" },
      { status: 500 },
    );
  }
}
