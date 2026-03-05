import { NextResponse } from "next/server";
import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { html } = await req.json();

    if (!html) {
      return NextResponse.json(
        { error: "HTML não fornecido" },
        { status: 400 },
      );
    }

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(
        "https://github.com/sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar",
      ), // Link para o pack oficial
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=orcamento.pdf",
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao gerar PDF" }, { status: 500 });
  }
}
// 1
