-- ============================================
-- TabakoStore 数据库增量更新 005（在 SQL Editor 中粘贴运行）
-- 如果提示"关系已存在"等错误，可直接忽略
-- ============================================

-- 商品评价表（每个用户对每个商品限评价一次）
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null,
  nickname text,
  rating smallint not null check (rating between 1 and 5),
  content text not null,
  created_at timestamptz default now(),
  unique (product_id, user_id)
);

create index if not exists reviews_product_idx
  on public.reviews (product_id);

alter table public.reviews enable row level security;

create policy "reviews_public_read"
  on public.reviews for select
  using (true);

create policy "reviews_user_insert"
  on public.reviews for insert
  with check (auth.uid() = user_id);

create policy "reviews_user_delete"
  on public.reviews for delete
  using (auth.uid() = user_id);
