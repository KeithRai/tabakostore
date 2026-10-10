-- ============================================
-- TabakoStore 数据库增量更新 003（在 SQL Editor 中粘贴运行）
-- 如果提示"关系已存在"等错误，可直接忽略
-- ============================================

-- 新闻：图片字段
alter table public.news add column if not exists image_url text;

-- 全局设置表（用于商家说明等）
create table if not exists public.settings (
  id text primary key,
  content text,
  updated_at timestamptz not null default now()
);

alter table public.settings enable row level security;

create policy "settings_public_read"
  on public.settings for select
  using (true);
