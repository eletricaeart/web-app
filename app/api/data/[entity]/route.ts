import { NextResponse } from "next/server";
import { fetchFromGAS } from "@/lib/gas";
import { getSession } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ entity: string }> },
) {
  const { entity } = await params;
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const data = await fetchFromGAS({
      method: "GET",
      data: id ? { entity, id } : { entity },
    });

    console.log("GET GAS response:", data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET ERROR:", error);

    return NextResponse.json(
      { status: "error", message: String(error) },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ entity: string }> },
) {
  const { entity } = await params;
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const payload = {
      ...body,
      entity,
      owner_id: session.id,
    };

    console.log("POST payload:", payload);

    const result = await fetchFromGAS({
      method: "POST",
      data: payload,
    });

    console.log("POST GAS response:", result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("POST ERROR:", error);

    return NextResponse.json(
      { status: "error", message: String(error) },
      { status: 500 },
    );
  }
}
