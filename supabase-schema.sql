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

-- ==== Storage gambar (kop surat dan tanda tangan) ====
-- Jalankan juga bagian ini sekali di SQL Editor. Aman dijalankan ulang.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('surat-tu', 'surat-tu', true, 2097152, array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 2097152, allowed_mime_types = array['image/png','image/jpeg','image/webp'];

drop policy if exists "surat-tu baca"  on storage.objects;
drop policy if exists "surat-tu tambah" on storage.objects;
drop policy if exists "surat-tu ubah"  on storage.objects;
drop policy if exists "surat-tu hapus" on storage.objects;

create policy "surat-tu baca"   on storage.objects for select to anon using (bucket_id = 'surat-tu');
create policy "surat-tu tambah" on storage.objects for insert to anon with check (bucket_id = 'surat-tu');
create policy "surat-tu ubah"   on storage.objects for update to anon using (bucket_id = 'surat-tu') with check (bucket_id = 'surat-tu');
create policy "surat-tu hapus"  on storage.objects for delete to anon using (bucket_id = 'surat-tu');
