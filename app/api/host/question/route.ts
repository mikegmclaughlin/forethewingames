
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { roundNumber, qNumber, prompt, points } = await req.json();


  const { data: game } = await supabase.from('games').select('id').order('starts_at', { ascending: false }).limit(1).single();
  const gid = game?.id;

  let { data: round } = await supabase.from('rounds').select('id').match({ game_id: gid, round_number: roundNumber }).single();
  if (!round) {
    const res = await supabase.from('rounds').insert({ game_id: gid, round_number: roundNumber }).select('id').single();
    round = res.data;
  }

  const { error } = await supabase.from('questions').upsert({
    round_id: round?.id,
    q_number: qNumber,
    prompt
  }, { onConflict: 'round_id,q_number' });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
