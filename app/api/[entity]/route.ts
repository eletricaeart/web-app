import { NextResponse } from "next/server";
import * as db from "@/lib/sheets/db";

export async function GET(
  req: Request,
  { params }: { params: { entity: string } },
) {
  const data = await db.getAll(params.entity);

  return NextResponse.json(data);
}

export async function POST(
  req: Request,
  { params }: { params: { entity: string } },
) {
  const body = await req.json();

  const result = await db.create(params.entity, body);

  return NextResponse.json(result);
}

export async function DELETE(
  req: Request,
  { params }: { params: { entity: string } },
) {
  const { id } = await req.json();

  const result = await db.remove(params.entity, id);

  return NextResponse.json(result);
}
