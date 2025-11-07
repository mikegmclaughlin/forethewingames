
-- Core schema for Fore the Win Games

create extension if not exists pgcrypto; -- for gen_random_uuid on some Postgres
create table if not exists games (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  starts_at timestamptz default now()
);

create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references games(id) on delete cascade,
  name text not null,
  pin text not null,
  created_at timestamptz default now(),
  unique(game_id, name)
);

create table if not exists rounds (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references games(id) on delete cascade,
  round_number int not null,
  is_open boolean default true,
  answers_revealed boolean default false,
  timer_ends_at timestamptz,
  unique(game_id, round_number)
);

create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  round_id uuid references rounds(id) on delete cascade,
  q_number int not null,
  prompt text not null,
  correct_answer text,
  points int default 1,
  unique(round_id, q_number)
);

create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade,
  question_id uuid references questions(id) on delete cascade,
  answer text,
  submitted_at timestamptz default now(),
  unique(team_id, question_id)
);

create table if not exists scores (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade,
  question_id uuid references questions(id) on delete cascade,
  awarded_points int not null default 0,
  auto_marked boolean default false,
  updated_at timestamptz default now(),
  unique(team_id, question_id)
);

create or replace view team_totals as
select
  t.game_id,
  t.id as team_id,
  t.name as team_name,
  coalesce(sum(s.awarded_points),0) as total_points
from teams t
left join scores s on s.team_id = t.id
group by t.game_id, t.id, t.name;
