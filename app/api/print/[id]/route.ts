// app/api/print/[id]/route.ts
import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const printUrl = `${baseUrl}/orcamentos/${id}?print=true`;

  try {
    const browser = await puppeteer.launch({
      // No Ubuntu, se o puppeteer foi instalado via pnpm,
      // ele geralmente baixa um chromium interno.
      // Se não definires executablePath, ele tenta usar o interno.
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage", // Importante para Linux (evita falta de memória)
      ],
    });

    const page = await browser.newPage();

    // IMPORTANTE: Como o Puppeteer não tem o teu LocalStorage,
    // a página vai abrir vazia se não for buscar ao GS.
    await page.goto(printUrl, {
      waitUntil: "networkidle0",
      timeout: 0,
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
    });

    await browser.close();

    // Transformamos o Uint8Array em um Buffer ou Blob para o NextResponse aceitar
    const pdfBuffer = Buffer.from(pdf);

    return new NextResponse(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Orcamento_${id}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("ERRO NO LINUX:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
