import { NextResponse } from "next/server";
import { getAll } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { entity: string } },
) {
  const data = await getAll(params.entity);

  return NextResponse.json(data);
}
