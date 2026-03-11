import { NextResponse } from "next/server";
import {
  getOrcamentos,
  createOrcamento,
  deleteOrcamento,
} from "@/lib/orcamentos";

export async function GET() {
  const data = await getOrcamentos();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();

  const result = await createOrcamento(body);

  return NextResponse.json(result);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();

  await deleteOrcamento(id);

  return NextResponse.json({ success: true });
}
