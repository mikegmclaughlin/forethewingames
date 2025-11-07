
import Link from 'next/link';

export default function Home() {
  return (
    <section className="card">
      <h1 className="big">Fore the Win Games</h1>
      <p className="small">Squarespace front site. This app powers the live game.</p>
      <ul>
        <li><Link href="/join">Join (teams)</Link></li>
        <li><Link href="/scoreboard">Scoreboard (projector)</Link></li>
        <li><Link href="/host">Host panel</Link></li>
      </ul>
    </section>
  );
}
