
# Fore the Win Games — Multi‑Domain Trivia Starter (Next.js + Supabase)

Designed for Squarespace front site + Vercel app subdomains:
- **play.forethewingames.com** → `/join` (teams)
- **host.forethewingames.com** → `/host` (you only)
- **score.forethewingames.com** → `/scoreboard` (projector)

The app auto‑routes based on hostname via `middleware.ts`, so `https://play.../` lands on `/join`, etc.

## Quick start
1) Create a Supabase project → run `supabase/schema.sql` in SQL editor.
2) Copy `.env.example` → `.env.local` and fill in keys.
3) `npm install && npm run dev` → open http://localhost:3000
4) Deploy to Vercel. Add the three custom domains to the same Vercel project.
5) Set DNS:
   - **CNAME**: `play` → `cname.vercel-dns.com`
   - **CNAME**: `score` → `cname.vercel-dns.com`
   - **CNAME**: `host` → `cname.vercel-dns.com`
   Leave **www** and apex with Squarespace.

## Environment
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
HOST_ADMIN_PASSWORD=change-this
BRAND_NAME=Fore the Win Games
```

## Pages
- `/join` Teams create a name + PIN
- `/round/[n]` Answer form
- `/scoreboard` Live leaderboard (Supabase Realtime)
- `/host` Host panel (minimal admin password)

## Notes
- This starter stores Team PIN client-side (localStorage). For stricter security, add RLS policies and/or Supabase Auth.
- Auto‑scoring can be extended with synonyms and partial credit.
