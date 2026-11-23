-- js4cut Supabase 스키마 (SQL Editor에서 순서대로 실행)

-- 1. 프레임
create table public.frames (
  id uuid primary key default gen_random_uuid(),
  image_path text not null            -- frames 버킷 내 경로
);

-- 2. 메인보드에 올라가는 사진 (전시에 동의한 사진만 저장)
create table public.photos (
  id uuid primary key default gen_random_uuid(),
  frame_id uuid references public.frames(id),
  image_path text not null,           -- results 버킷 내 경로
  show_on_board boolean not null default true,
  created_at timestamptz not null default now()
);

-- 3. 메일 발송 기록
--    photo_id는 nullable: 전시하지 않은 사진은 저장하지 않으므로 photos 행이 없음
--    (사진이 삭제돼도 발송 기록은 남기도록 on delete set null)
create table public.email_logs (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid references public.photos(id) on delete set null,
  email text not null,
  status text not null default 'pending',  -- pending / sent / failed
  error text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.frames enable row level security;
alter table public.photos enable row level security;
alter table public.email_logs enable row level security;

create policy "frames readable" on public.frames for select using (true);
create policy "board photos readable" on public.photos
  for select using (show_on_board = true);
-- email_logs, photos insert는 정책 없음 → 서버(service role)만 접근

-- 4. Storage 버킷 (Dashboard > Storage에서 만들어도 됨)
--    frames : public, 허용 MIME image/png, image/webp (투명 영역 필요 → jpeg 제외 권장)
--    results: public, 허용 MIME image/jpeg, image/png, image/webp, 파일 크기 10MB
insert into storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
values
  ('frames',  'frames',  true, array['image/png','image/webp'], 10485760),
  ('results', 'results', true, array['image/jpeg','image/png','image/webp'], 10485760)
on conflict (id) do nothing;
