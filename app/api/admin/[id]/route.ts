// app/api/admin/[id]/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: targetId } = await params;

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
      { message: 'Sem permissão para editar administradores' },
      { status: 403 },
    );
  }

  const body = await request.json();
  const {
    role,
    can_manage_admins,
    can_manage_finance,
    can_manage_content,
    is_active,
  } = body;

  // Proteção: ninguém pode desativar a própria conta por engano
  if (targetId === requester.id && is_active === false) {
    return NextResponse.json(
      { message: 'Você não pode desativar sua própria conta' },
      { status: 400 },
    );
  }

  const updatePayload: Record<string, any> = {};
  if (role !== undefined) updatePayload.role = role;
  if (can_manage_admins !== undefined)
    updatePayload.can_manage_admins = can_manage_admins;
  if (can_manage_finance !== undefined)
    updatePayload.can_manage_finance = can_manage_finance;
  if (can_manage_content !== undefined)
    updatePayload.can_manage_content = can_manage_content;
  if (is_active !== undefined) updatePayload.is_active = is_active;

  const { error } = await adminClient
    .from('admin_users')
    .update(updatePayload)
    .eq('id', targetId);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ status: 'updated' });
}
