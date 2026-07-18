// app/api/admin/list/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user: requester },
  } = await supabase.auth.getUser();

  if (!requester) {
    return NextResponse.json({ message: 'Não autenticado' }, { status: 401 });
  }

  const adminClient = createAdminClient();

  const { data: requesterAdmin } = await adminClient
    .from('admin_users')
    .select('can_manage_admins, is_active')
    .eq('id', requester.id)
    .maybeSingle();

  if (!requesterAdmin?.is_active || !requesterAdmin.can_manage_admins) {
    return NextResponse.json(
      { message: 'Sem permissão para listar administradores' },
      { status: 403 },
    );
  }

  const { data: admins, error } = await adminClient
    .from('admin_users')
    .select(
      'id, role, can_manage_admins, can_manage_finance, can_manage_content, is_active, created_at',
    )
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  // Junta com os dados de perfil (nome, e-mail, foto) de cada admin
  const ids = admins.map((a) => a.id);
  const { data: profiles } = await adminClient
    .from('profiles')
    .select('id, name, email, photo_url')
    .in('id', ids);

  const merged = admins.map((admin) => ({
    ...admin,
    profile: profiles?.find((p) => p.id === admin.id) || null,
  }));

  return NextResponse.json({ admins: merged });
}
