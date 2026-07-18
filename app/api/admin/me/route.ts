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

  const adminClient = createAdminClient();
  const { data: adminRecord } = await adminClient
    .from('admin_users')
    .select(
      'role, can_manage_admins, can_manage_finance, can_manage_content, is_active',
    )
    .eq('id', user.id)
    .maybeSingle();

  if (!adminRecord || !adminRecord.is_active) {
    return NextResponse.json({ isAdmin: false }, { status: 403 });
  }

  return NextResponse.json({ isAdmin: true, ...adminRecord });
}
