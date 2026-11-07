import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/retrieval';

export const dynamic = 'force-dynamic';

// Cheap database check, called on a schedule (.github/workflows/keepalive.yml) so the
// free-tier Supabase project keeps seeing activity and is not auto-paused.
export async function GET() {
  try {
    const { count, error } = await supabaseAdmin().from('documents').select('*', { count: 'exact', head: true });
    if (error) throw error;
    return NextResponse.json({ ok: true, documents: count });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
