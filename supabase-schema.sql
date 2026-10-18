-- Buku Surat TU: skema database Supabase
-- Jalankan sekali di Supabase > SQL Editor. Aman dijalankan ulang.

create table if not exists public.app_state (
  id         text primary key,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

drop policy if exists "anon baca"   on public.app_state;
drop policy if exists "anon tambah" on public.app_state;
drop policy if exists "anon ubah"   on public.app_state;

create policy "anon baca"   on public.app_state for select to anon using (true);
create policy "anon tambah" on public.app_state for insert to anon with check (true);
create policy "anon ubah"   on public.app_state for update to anon using (true) with check (true);

-- Catatan keamanan: kebijakan di atas mengizinkan siapa pun yang memegang
-- kunci publik (ada di index.html) untuk membaca dan mengubah data.
-- Jangan bagikan alamat aplikasi ke sembarang orang.
