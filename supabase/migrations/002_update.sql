-- ============================================
-- TabakoStore 数据库增量更新（在 SQL Editor 中粘贴运行）
-- 如果提示"关系已存在"等错误，可直接忽略
-- ============================================

-- 商品：新增分类字段
alter table public.products add column if not exists category text;

-- 商品：新增多图字段（数组，第一张为封面）
alter table public.products add column if not exists image_urls text[] default '{}';

-- 新闻表
create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text,
  created_at timestamptz not null default now()
);

alter table public.news enable row level security;

create policy "news_public_read"
  on public.news for select
  using (true);

-- 用户头像存储桶（公开可读，登录用户可上传自己的头像）
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars_authenticated_upload"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
