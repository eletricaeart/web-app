// app/api/generate-blueprint/route.ts

import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';

export async function POST(request: NextRequest) {
  try {
    const { data } = await request.json();

    if (!data || !data.rooms) {
      return NextResponse.json(
        { error: 'Dados insuficientes' },
        { status: 400 },
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const encodedData = encodeURIComponent(JSON.stringify(data));
    const blueprintUrl = `${baseUrl}/blueprint?data=${encodedData}`;

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 2 });
    await page.goto(blueprintUrl, { waitUntil: 'networkidle0' });

    await page.waitForSelector('.blueprint-container', { timeout: 5000 });

    const element = await page.$('.blueprint-container');
    if (!element) {
      throw new Error('Elemento blueprint-container não encontrado');
    }

    // Puppeteer retorna Uint8Array, convertemos para Buffer
    const screenshotBuffer = await element.screenshot({ type: 'png' });
    const buffer = Buffer.from(screenshotBuffer);

    await browser.close();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'attachment; filename=blueprint.png',
      },
    });
  } catch (error) {
    console.error('Erro ao gerar blueprint:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar imagem' },
      { status: 500 },
    );
  }
}
