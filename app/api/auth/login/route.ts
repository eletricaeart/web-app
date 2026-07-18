// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const supabase = await createClient();

    // Tenta fazer o login no Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }

    // Opcional: Buscar dados extras do perfil na tabela 'profiles'
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    // Retornamos os dados para o front-end (o cookie já foi setado pelo server client)
    return NextResponse.json({
      id: data.user.id,
      email: data.user.email,
      name: profile?.name || 'Usuário',
      role: profile?.role || 'user',
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Erro interno no servidor de autenticação' },
      { status: 500 },
    );
  }
}
