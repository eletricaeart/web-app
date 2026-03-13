/** app/api/data/[entity]/route.ts */
import { NextResponse } from "next/server";
import * as db from "@/lib/sheets/db";
import { getSession } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ entity: string }> },
) {
  try {
    const { entity } = await params; // DESEMBRULHAR AQUI

    const session = await getSession();
    if (!session)
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });

    const data = await db.getAll(params.entity);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/* export async function DELETE(
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
} */

export async function POST(
  req: Request,
  { params }: { params: Promise<{ entity: string }> },
) {
  try {
    const { entity } = await params; // DESEMBRULHAR AQUI

    const session = await getSession();
    const body = await req.json();

    // Se estiver em modo de emergência sem sessão, use um ID padrão
    const ownerId = session?.id || "SISTEMA_OFFLINE";

    /*const result = await db.create(params.entity, {
      ...body,
      owner_id: ownerId,
    });*/
    const result = await db.create(entity, {
      ...body,
      owner_id: ownerId,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
