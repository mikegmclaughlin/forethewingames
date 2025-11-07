
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

export default function RoundPage({ params }: { params: { n: string }}) {
  const roundNo = parseInt(params.n, 10);
  const [gameId, setGameId] = useState<string>('');
  const [teamInfo, setTeamInfo] = useState<{id?: string, name?: string}|null>(null);
  const [roundId, setRoundId] = useState<string>('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string,string>>({});
  const [status, setStatus] = useState('');

  useEffect(() => {
    const gid = localStorage.getItem('fw_game_id') || '';
    const name = localStorage.getItem('fw_team_name') || '';
    const pin = localStorage.getItem('fw_team_pin') || '';
    setGameId(gid);
    (async () => {
      const { data: team } = await supabase.from('teams').select('id,name').match({ game_id: gid, name, pin }).single();
      setTeamInfo(team || {});
      let { data: rnd } = await supabase.from('rounds').select('id,is_open').match({ game_id: gid, round_number: roundNo }).single();
      if (!rnd) {
        const res = await supabase.from('rounds').insert({ game_id: gid, round_number: roundNo }).select('id').single();
        rnd = res.data;
      }
      setRoundId(rnd?.id || '');
      const { data: qs } = await supabase.from('questions').select('id,q_number,prompt').eq('round_id', rnd?.id).order('q_number');
      setQuestions(qs || []);
    })();
  }, [roundNo]);

  async function submitAnswers() {
    if (!teamInfo?.id) { setStatus('Team not found. Re‑join.'); return; }
    const payload = Object.entries(answers).map(([qid, ans]) => ({ team_id: teamInfo.id, question_id: qid, answer: ans }));
    for (const row of payload) {
      await supabase.from('submissions').upsert(row, { onConflict: 'team_id,question_id' });
    }
    setStatus('Submitted!');
  }

  return (
    <section className="card">
      <h2>Round {roundNo}</h2>
      {questions.length === 0 && <p>No questions yet. Waiting for host…</p>}
      <div style={{display:'grid', gap:12}}>
        {questions.map(q => (
          <div key={q.id}>
            <div><strong>{q.q_number}.</strong> {q.prompt}</div>
            <input placeholder="Your answer" onChange={e=>setAnswers({...answers, [q.id]: e.target.value})} />
          </div>
        ))}
      </div>
      <div style={{marginTop:16}}>
        <button onClick={submitAnswers} disabled={!questions.length}>Submit answers</button>
        <div>{status}</div>
      </div>
    </section>
  );
}
