-- ============================================
-- TabakoStore 数据库初始化脚本
-- 在 Supabase 控制台 → SQL Editor → New query 中粘贴并 Run
-- ============================================

-- 商品表
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null,
  stock integer not null default 0,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 订单表
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  order_no text not null unique,
  total numeric(10,2) not null,
  status text not null default 'pending',
  email text not null,
  full_name text not null,
  country text,
  address text not null,
  phone text,
  created_at timestamptz not null default now()
);

-- 订单明细表
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  product_name text not null,
  price numeric(10,2) not null,
  quantity integer not null,
  image_url text
);

-- 开启行级安全（RLS）
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- 商品：所有人可见
create policy "products_public_read"
  on public.products for select
  using (true);

-- 订单：用户只能查看和创建自己的订单
create policy "orders_user_read"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "orders_user_insert"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "order_items_user_read"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

-- 商品图片存储桶（公开可读，后台用服务密钥上传）
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "product_images_public"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- 示例商品（方便你第一次测试，后台可随时修改或删除）
insert into public.products (name, description, price, stock, image_url) values
  ('Building Blocks Set', '1000 pcs creative building blocks, ages 6+', 24.99, 50, 'https://picsum.photos/seed/blocks/600/600'),
  ('Plush Teddy Bear', 'Soft cuddly teddy bear, 30 cm', 15.50, 30, 'https://picsum.photos/seed/bear/600/600'),
  ('RC Racing Car', 'Fast remote control car with rechargeable battery', 32.00, 20, 'https://picsum.photos/seed/rcar/600/600');
