'use client';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';

type Team = { id: string; name: string };
type Question = { id: string; q_number: number; points: number };

export default function ReviewRound({ params }: { params: { n: string }}) {
  const roundNo = parseInt(params.n, 10);
  const [gameId, setGameId] = useState<string>('');
  const [teams, setTeams] = useState<Team[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({}); // key = `${teamId}|${qId}`

  useEffect(() => {
    const gid = localStorage.getItem('fw_game_id') || '';
    setGameId(gid);

    (async () => {
      // 1) Find the round
      const { data: round } = await supabase
        .from('rounds')
        .select('id')
        .match({ game_id: gid, round_number: roundNo })
        .maybeSingle();
      if (!round?.id) return;

      // 2) Teams for this game
      const { data: teamRows } = await supabase
        .from('teams')
        .select('id,name')
        .eq('game_id', gid)
        .order('name');
      setTeams(teamRows || []);

      // 3) Questions for this round (with points)
      const { data: qRows } = await supabase
        .from('questions')
        .select('id,q_number,points')
        .eq('round_id', round.id)
        .order('q_number');
      setQuestions(qRows || []);

      // 4) Existing scores → so checks persist on reload
      const { data: scoreRows } = await supabase
        .from('scores')
        .select('team_id,question_id,awarded_points');

      const map: Record<string, number> = {};
      (scoreRows || []).forEach((r: any) => {
        if (r.awarded_points != null) {
          map[`${r.team_id}|${r.question_id}`] = r.awarded_points;
        }
      });
      setScores(map);
    })();
  }, [roundNo]);

  async function toggle(teamId: string, q: Question) {
    const key = `${teamId}|${q.id}`;
    const currently = scores[key] || 0;
    const next = currently > 0 ? 0 : (q.points || 1);

    // Optimistic UI: flip the check immediately
    setScores(prev => ({ ...prev, [key]: next }));

    await fetch('/api/host/grade', {
      method: 'POST',
      body: JSON.stringify({
        team_id: teamId,
        question_id: q.id,
        awarded_points: next
      })
    });
  }

  const grid = useMemo(() => {
    return teams.map(t => ({
      team: t,
      cells: questions.map(q => ({
        q,
        key: `${t.id}|${q.id}`,
        checked: (scores[`${t.id}|${q.id}`] || 0) > 0
      }))
    }));
  }, [teams, questions, scores]);

  return (
    <section className="card">
      <h2 className="big">Review Round {roundNo}</h2>
      {!questions.length && <p className="small">No questions yet for Round {roundNo}. Add them in the Host panel, then refresh this page.</p>}
      <div style={{overflowX:'auto'}}>
        <table className="table" style={{minWidth: 700}}>
          <thead>
            <tr>
              <th>Team</th>
              {questions.map(q => (
                <th key={q.id}>
                  Q{q.q_number}
                  <div className="small">{q.points || 1} pt</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map(row => (
              <tr key={row.team.id}>
                <td><strong>{row.team.name}</strong></td>
                {row.cells.map(c => (
                  <td key={c.key} style={{textAlign:'center'}}>
                    <input
                      type="checkbox"
                      checked={c.checked}
                      onChange={() => toggle(row.team.id, c.q)}
                      aria-label={`Mark ${row.team.name} Q${c.q.q_number} correct`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="small" style={{marginTop:12}}>
        Keep <code>/scoreboard</code> open on the TV — totals update live as you click.
      </p>
    </section>
  );
}
