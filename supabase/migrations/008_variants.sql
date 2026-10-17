-- ============================================
-- TabakoStore 数据库增量更新 008（在 SQL Editor 中粘贴运行）
-- 商品规格选项（尺寸/颜色）+ 订单明细规格字段
-- ============================================

-- 商品：规格选项 JSON
-- 格式：[{"label":"颜色","values":["红","蓝"]},{"label":"尺寸","values":["S","M","L"]}]
alter table public.products
  add column if not exists variants jsonb;

-- 订单明细：记录客户选择的规格（例：颜色:红 / 尺寸:M）
alter table public.order_items
  add column if not exists variant text;
