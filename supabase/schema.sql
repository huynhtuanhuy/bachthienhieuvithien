create table if not exists public.registrations (
  id uuid primary key,
  student_name text not null,
  email text not null,
  school_name text not null,
  companion_choices text[] not null default '{}',
  companion_other text not null default '',
  companion text not null,
  parent_name text not null,
  phone text not null,
  created_at timestamptz not null default now()
);

alter table public.registrations enable row level security;

grant usage on schema public to anon, authenticated;
grant insert on public.registrations to anon, authenticated;

drop policy if exists "Anyone can submit registrations" on public.registrations;

create policy "Anyone can submit registrations"
on public.registrations
for insert
to anon, authenticated
with check (true);
