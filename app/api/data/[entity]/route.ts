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

    // if (action === "update" && id) {
    if (action === "update" && dataToSave.id) {
      const result = await db.update(entity, dataToSave.id, dataToSave);
      return NextResponse.json({ status: "updated", ...result });
    }

    // const result = await db.create(entity, body);
    const result = await db.create(entity, {
      ...dataToSave,
      ownerId: ownerId,
    });

    return NextResponse.json({ status: "created", ...result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
