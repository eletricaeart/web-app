/** app/api/data/[entity]/route.ts */
import { NextResponse } from "next/server";
import * as db from "@/lib/sheets/db";
import { getSession } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ entity: string }> }, // Tipagem direta e explícita
) {
  try {
    const { entity } = await params;
    const data = await db.getAll(entity);
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ entity: string }> }, // E aqui também
) {
  try {
    const { entity } = await params;
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "o ID não foi fornecido" },
        { status: 400 },
      );
    }

    await db.remove(entity, id);
    return NextResponse.json({ status: "deleted" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ entity: string }> }, // Mesma coisa aqui
) {
  try {
    const { entity } = await params;
    const body = await req.json();

    // Lógica de Create/Update
    // const { action, id, ...data } = body;
    const { action, entity: _, ...dataToSave } = body;

    const session = await getSession();
    const ownerId = session?.id || "SISTEMA_OFFLINE";

    // AÇÃO: DELETE (via POST)
    if (action === "delete") {
      if (!dataToSave.id)
        return NextResponse.json(
          { error: "ID necessário para deletar" },
          { status: 400 },
        );
      await db.remove(entity, dataToSave.id);
      return NextResponse.json({ status: "deleted" });
    }

    // AÇÃO: UPDATE
    if (action === "update" && dataToSave.id) {
      const result = await db.update(entity, dataToSave.id, dataToSave);
      return NextResponse.json({ status: "updated", ...result });
    }

    // AÇÃO: CREATE (Só acontece se não caiu nos 'ifs' acima)
    if (action === "create" || !action) {
      const result = await db.create(entity, {
        ...dataToSave,
        ownerId: ownerId,
      });
      return NextResponse.json({ status: "created", ...result });
    }

    /* // if (action === "update" && id) {
    if (action === "update" && dataToSave.id) {
      const result = await db.update(entity, dataToSave.id, dataToSave);
      return NextResponse.json({ status: "updated", ...result });
    }

    // const result = await db.create(entity, body);
    const result = await db.create(entity, {
      ...dataToSave,
      ownerId: ownerId,
    }); */

    // return NextResponse.json({ status: "created", ...result });
    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
