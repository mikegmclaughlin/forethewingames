
'use client';
import { supabase } from '../../lib/supabaseClient';
import { useEffect, useState } from 'react';

type Row = { team_name: string, total_points: number };

export default function Scoreboard() {
  const [rows, setRows] = useState<Row[]>([]);

  async function load() {
    const { data } = await supabase.from('team_totals').select('team_name,total_points');
    setRows((data || []).sort((a:any,b:any)=>b.total_points-a.total_points));
  }

  useEffect(() => {
    load();
    const channel = supabase.channel('scores-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scores' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <section className="card" style={{background:'#020617', borderColor:'#0b1220'}}>
      <h1 className="big">Live Scoreboard</h1>
      <table className="table">
        <thead><tr><th>#</th><th>Team</th><th>Total</th></tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.team_name}><td>{i+1}</td><td>{r.team_name}</td><td><strong>{r.total_points}</strong></td></tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
