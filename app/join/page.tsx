
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function Join() {
  const [teamName, setTeamName] = useState('');
  const [pin, setPin] = useState('');
  const [gameId, setGameId] = useState<string>('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    (async () => {
      const { data: game } = await supabase.from('games').select('id').order('starts_at', { ascending: false }).limit(1).single();
      if (game) setGameId(game.id);
      else {
        const { data, error } = await supabase.from('games').insert({ name: 'Tonight\'s Trivia' }).select('id').single();
        if (!error && data) setGameId(data.id);
      }
    })();
  }, []);

  function randomPin() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async function createTeam() {
    setStatus('');
    const thePin = pin || randomPin();
    const { data, error } = await supabase.from('teams').insert({ game_id: gameId, name: teamName, pin: thePin }).select('id');
    if (error) { setStatus('Error: ' + error.message); return; }
    localStorage.setItem('fw_team_name', teamName);
    localStorage.setItem('fw_team_pin', thePin);
    localStorage.setItem('fw_game_id', gameId);
    setStatus('Team created! Your PIN: ' + thePin + '. Go to Round 1 when it opens.');
  }

  return (
    <section className="card">
      <h2>Join the game</h2>
      <p>Enter your team name. You’ll get a 6‑digit PIN.</p>
      <div style={{display:'grid', gap:12, maxWidth:420}}>
        <input placeholder="Team name" value={teamName} onChange={e=>setTeamName(e.target.value)} />
        <input placeholder="(optional) custom PIN" value={pin} onChange={e=>setPin(e.target.value)} />
        <button onClick={createTeam} disabled={!teamName || !gameId}>Create team</button>
        <div>{status}</div>
      </div>
    </section>
  );
}
