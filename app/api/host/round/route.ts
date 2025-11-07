
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.json();
  const n = Number(body.n);
  const isOpen = !!body.isOpen;

  const { data: game } = await supabase.from('games').select('id').order('starts_at', { ascending: false }).limit(1).single();
  const gid = game?.id;

  let { data: round } = await supabase.from('rounds').select('id').match({ game_id: gid, round_number: n }).single();
  if (!round) {
    const res = await supabase.from('rounds').insert({ game_id: gid, round_number: n, is_open: isOpen }).select('id').single();
    round = res.data;
  } else {
    await supabase.from('rounds').update({ is_open: isOpen }).eq('id', round.id);
  }

  return NextResponse.json({ ok: true });
}
