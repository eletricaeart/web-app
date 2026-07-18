// app/api/admin/me/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ isAdmin: false }, { status: 401 });
  }

  // Usa a Service Role Key porque admin_users não tem policy nenhuma
  const adminClient = createAdminClient();
  const { data: adminRecord } = await adminClient
    .from('admin_users')
    .select('role, can_manage_admins, can_manage_finance, can_manage_content')
    .eq('id', user.id)
    .maybeSingle();

  if (!adminRecord) {
    return NextResponse.json({ isAdmin: false }, { status: 403 });
  }

  return NextResponse.json({ isAdmin: true, ...adminRecord });
}
