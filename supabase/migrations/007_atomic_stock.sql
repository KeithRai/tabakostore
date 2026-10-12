-- ============================================
-- TabakoStore 数据库增量更新 007（在 SQL Editor 中粘贴运行）
-- 修复并发下单超卖问题：库存改为数据库原子扣减
-- ============================================

-- 原子扣减库存：库存不足时返回 -1（行级锁保证并发安全）
create or replace function public.decrement_stock(
  p_product_id uuid,
  p_qty integer
)
returns integer
language plpgsql
as $$
declare
  remaining integer;
begin
  update public.products
     set stock = stock - p_qty,
         updated_at = now()
   where id = p_product_id
     and stock >= p_qty
  returning stock into remaining;

  if remaining is null then
    return -1;   -- 库存不足
  end if;
  return remaining;
end;
$$;

-- 原子增加库存（取消订单 / 下单失败回滚时使用）
create or replace function public.increment_stock(
  p_product_id uuid,
  p_qty integer
)
returns integer
language plpgsql
as $$
declare
  new_stock integer;
begin
  update public.products
     set stock = stock + p_qty,
         updated_at = now()
   where id = p_product_id
  returning stock into new_stock;

  return coalesce(new_stock, -1);
end;
$$;

-- 只允许服务器（service_role）调用，前端无法篡改库存
revoke execute on function public.decrement_stock(uuid, integer)
  from public, anon, authenticated;
revoke execute on function public.increment_stock(uuid, integer)
  from public, anon, authenticated;

grant execute on function public.decrement_stock(uuid, integer)
  to service_role;
grant execute on function public.increment_stock(uuid, integer)
  to service_role;
