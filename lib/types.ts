export type Product = {
  id: string
  name: string
  description: string | null
  price: string // Supabase 的 numeric 类型会返回字符串
  stock: number
  category: string | null
  image_url: string | null
  image_urls: string[] | null
  created_at: string
  updated_at: string
}

export type CartItem = {
  id: string
  name: string
  price: number
  image_url: string | null
  qty: number
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  price: string
  quantity: number
  image_url: string | null
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
