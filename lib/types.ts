export type SpecGroup = {
  label: string // 规格名，如"颜色"
  values: string[] // 可选值，如 ['红', '蓝']
}

export type Product = {
  id: string
  name: string
  description: string | null
  price: string // Supabase 的 numeric 类型会返回字符串
  stock: number
  category: string | null
  image_url: string | null
  image_urls: string[] | null
  variants: SpecGroup[] | null // 规格选项（尺寸/颜色）
  created_at: string
  updated_at: string
}

export type CartItem = {
  id: string
  name: string
  price: number
  image_url: string | null
  qty: number
  stock?: number // 加入购物车时的库存（数量上限，不能超过库存）
  variant?: string // 选中的规格（例：颜色:红 / 尺寸:M）
  variantKey?: string // 规格组合唯一标识（用于购物车合并判断）
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  price: string
  quantity: number
  image_url: string | null
  variant: string | null // 客户选择的规格
}

export type Order = {
  id: string
  user_id: string
  order_no: string
  total: string
  status: string
  email: string
  full_name: string
  country: string | null
  city: string | null
  address: string
  phone: string | null
  created_at: string
  order_items: OrderItem[]
}

export type CheckoutInfo = {
  full_name: string
  country: string
  city: string
  address: string
  phone: string
  variant?: string // 规格（单商品下单时使用，兼容旧客户端）
}

export type News = {
  id: string
  title: string
  content: string | null
  image_url: string | null
  created_at: string
}

// 费用设置（购物车结算时收取）
// 运费不固定：下单后由客服确认实际运费
export type FeeSettings = {
  serviceRate: number // 服务费比例（0.1 = 10%）
  packingJpy: number // 包装费（日元）
  settlementRate: number // 国际结算手续费比例（0.02 = 2%）
}
