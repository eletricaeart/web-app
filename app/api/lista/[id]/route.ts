// app/api/lista/[id]/route.ts
import { NextResponse } from 'next/server';
import { createClient as createDirectClient } from '@supabase/supabase-js';

function getSupabaseServerClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    '';

  const keyToUse = serviceRoleKey || anonKey;
  if (!url || !keyToUse) {
    return null;
  }

  return createDirectClient(url, keyToUse, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: 'ID da lista não fornecido' },
        { status: 400 },
      );
    }

    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Credenciais do Supabase não configuradas no servidor' },
        { status: 500 },
      );
    }

    const { data: row, error } = await supabase
      .from('listas_materiais')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('[API /api/lista/[id]] Erro no Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!row) {
      return NextResponse.json(
        { error: 'Lista não encontrada' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, data: row },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      },
    );
  } catch (err: any) {
    console.error('[API /api/lista/[id]] Exceção não tratada:', err);
    return NextResponse.json(
      { error: err?.message || 'Erro interno no servidor' },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: 'ID da lista não fornecido' },
        { status: 400 },
      );
    }

    const body = await request.json();
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Credenciais do Supabase não configuradas no servidor' },
        { status: 500 },
      );
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (body.items !== undefined) {
      updatePayload.items = body.items;
    }

    const { data, error } = await supabase
      .from('listas_materiais')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('[API /api/lista/[id]] Erro ao atualizar:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('[API /api/lista/[id]] Exceção no PATCH:', err);
    return NextResponse.json(
      { error: err?.message || 'Erro interno no servidor' },
      { status: 500 },
    );
  }
}
