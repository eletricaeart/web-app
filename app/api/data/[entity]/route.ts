/** app/api/data/[entity]/route.ts */
import { NextResponse } from "next/server";
import * as db from "@/lib/sheets/db";
import { getSession } from "@/lib/auth";

type Props = { params: Promise<{ entity: string }> };

export async function GET(req: Request, { params }: { params: Props }) {
  try {
    const { entity } = await params; // DESEMBRULHAR AQUI

    const data = await db.getAll(entity);

    const session = await getSession();
    if (!session)
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });

    // const data = await db.getAll(params.entity);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: Props) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });

    const { entity } = await params;
    const { id } = await req.json();
    const result = await db.remove(entity, id);
    return NextResponse.json({ status: "deleted", ...result });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao eliminar dado: ", ...error.message },
      { status: 500 },
    );
  }
}

export async function POST(req: Request, { params }: { params: Props }) {
  try {
    const { entity } = await params; // DESEMBRULHAR AQUI

    const session = await getSession();
    const body = await req.json();
    const { action, id, ...data } = body;

    // Se estiver em modo de emergência sem sessão, use um ID padrão
    const ownerId = session?.id || "SISTEMA_OFFLINE";

    // Se o teu frontend enviar "action: update", chamamos o update
    if (action === "update" && id) {
      const result = await db.update(entity, id, data);
      return NextResponse.json({ status: "updated", ...result });
    }

    const result = await db.create(entity, {
      ...body,
      owner_id: ownerId,
    });

    return NextResponse.json({ status: "created", ...result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
