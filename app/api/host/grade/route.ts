import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // server key, set in Vercel env
);

export async function POST(req: Request) {
  const { team_id, question_id, awarded_points }:
    { team_id: string, question_id: string, awarded_points: number } = await req.json();

  if (!team_id || !question_id || awarded_points === undefined || awarded_points === null) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const { error } = await supabase.from('scores').upsert(
    {
      team_id,
      question_id,
      awarded_points,
      auto_marked: false
    },
    { onConflict: 'team_id,question_id' }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
