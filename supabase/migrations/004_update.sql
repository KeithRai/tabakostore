-- ============================================
-- TabakoStore 数据库增量更新 004（在 SQL Editor 中粘贴运行）
-- ============================================

-- 订单：新增城市字段
alter table public.orders add column if not exists city text;
