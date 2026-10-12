-- ============================================
-- TabakoStore 数据库增量更新 006（在 SQL Editor 中粘贴运行）
-- 如果提示"关系已存在"等错误，可直接忽略
-- ============================================

-- 订单发货时间（用于"发货 14 天后自动确认收货"）
alter table public.orders add column if not exists shipped_at timestamptz;
