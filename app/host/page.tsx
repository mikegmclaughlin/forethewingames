
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function Host() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [gameId, setGameId] = useState<string>('');
  const [rounds, setRounds] = useState<any[]>([]);
  const [qsRound, setQsRound] = useState<number>(1);
  const [qText, setQText] = useState('');
  const [qNum, setQNum] = useState<number>(1);

  useEffect(() => {
    (async () => {
      const { data: game } = await supabase.from('games').select('id').order('starts_at', { ascending: false }).limit(1).single();
      if (game) setGameId(game.id);
      else {
        const { data } = await supabase.from('games').insert({ name: 'Tonight\'s Trivia' }).select('id').single();
        if (data) setGameId(data.id);
      }
    })();
  }, []);

  async function login() {
    const res = await fetch('/api/host/login', { method:'POST', body: JSON.stringify({ password }) });
    setAuthed(res.ok);
  }

  async function toggleRound(n:number, isOpen:boolean) {
    const res = await fetch('/api/host/round', { method:'POST', body: JSON.stringify({ n, isOpen }) });
    if (res.ok) loadRounds();
  }

  async function addQuestion() {
    const res = await fetch('/api/host/question', { method:'POST', body: JSON.stringify({ roundNumber: qsRound, qNumber: qNum, prompt: qText }) });
    if (res.ok) { setQText(''); loadRounds(); }
  }

  async function loadRounds() {
    const { data: r } = await supabase.from('rounds').select('id, round_number, is_open').eq('game_id', gameId).order('round_number');
    setRounds(r || []);
  }

  useEffect(() => { if (gameId) loadRounds(); }, [gameId]);

return (
  <section className="card">
    <h2>Host panel</h2>

    {!authed && (
      <div style={{ display: 'grid', gap: 8, maxWidth: 320 }}>
        <input
          type="password"
          placeholder="Admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={login}>Enter</button>
      </div>
    )}

    {authed && (
      <div>
        <h3>Rounds</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              style={{
                border: '1px solid #1f2937',
                borderRadius: 8,
                padding: 8,
                minWidth: 120,
              }}
            >
              <div>
                <strong>Round {n}</strong>
              </div>
              <button onClick={() => toggleRound(n, true)}>Open</button>{' '}
              <button onClick={() => toggleRound(n, false)}>Close</button>
            </div>
          ))}
        </div>

        {/* 👇 Review links live INSIDE the authed area and INSIDE the same parent */}
        <p className="small" style={{ marginTop: 12 }}>
          Review pages:{' '}
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <a key={n} href={`/host/review/${n}`} style={{ marginRight: 8 }}>
              Round {n}
            </a>
          ))}
        </p>

        <h3 style={{ marginTop: 24 }}>Add question</h3>
        <div style={{ display: 'grid', gap: 8, maxWidth: 520 }}>
          <input
            type="number"
            min={1}
            max={8}
            value={qsRound}
            onChange={(e) => setQsRound(parseInt(e.target.value, 10))}
          />
          <input
            type="number"
            min={1}
            max={20}
            value={qNum}
            onChange={(e) => setQNum(parseInt(e.target.value, 10))}
          />
          <input
            placeholder="Question prompt"
            value={qText}
            onChange={(e) => setQText(e.target.value)}
          />
          <button onClick={addQuestion}>Add</button>
        </div>
      </div>
    )}
  </section>
);

}
