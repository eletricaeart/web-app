// app/api/admin/create-admin/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    // 1. Confirma que quem está chamando essa rota já é um admin autenticado
    const supabase = await createClient();
    const {
      data: { user: requester },
    } = await supabase.auth.getUser();

    if (!requester) {
      return NextResponse.json({ message: 'Não autenticado' }, { status: 401 });
    }

    const { data: requesterAdmin } = await supabase
      .from('admin_users')
      .select('role, can_manage_admins')
      .eq('id', requester.id)
      .maybeSingle();

    // Só quem tem can_manage_admins = true (tipicamente os 'owner') pode criar outro admin
    if (!requesterAdmin || !requesterAdmin.can_manage_admins) {
      return NextResponse.json(
        { message: 'Sem permissão para criar administradores' },
        { status: 403 },
      );
    }

    // 2. Lê os dados do novo admin a ser criado
    const {
      name,
      email,
      password,
      role,
      can_manage_admins,
      can_manage_finance,
      can_manage_content,
    } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Nome, e-mail e senha são obrigatórios' },
        { status: 400 },
      );
    }

    const adminClient = createAdminClient();

    // 3. Cria o usuário direto no Supabase Auth (já confirmado, sem precisar de e-mail)
    const { data: newUser, error: createUserError } =
      await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (createUserError || !newUser.user) {
      return NextResponse.json(
        { message: createUserError?.message || 'Erro ao criar usuário' },
        { status: 500 },
      );
    }

    // 4. Cria o perfil (tabela profiles) — mesma estrutura usada hoje pela equipe
    await adminClient.from('profiles').insert({
      id: newUser.user.id,
      name,
      email,
      role: 'Administrativo',
    });

    // 5. Insere na tabela admin_users, concedendo os atributos de permissão
    const { error: adminInsertError } = await adminClient
      .from('admin_users')
      .insert({
        id: newUser.user.id,
        role: role || 'staff',
        can_manage_admins: !!can_manage_admins,
        can_manage_finance: !!can_manage_finance,
        can_manage_content: can_manage_content ?? true,
      });

    if (adminInsertError) {
      return NextResponse.json(
        { message: adminInsertError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ status: 'created', id: newUser.user.id });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Erro interno' },
      { status: 500 },
    );
  }
}
