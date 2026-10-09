export type Product = {
  id: string
  name: string
  description: string | null
  price: string // Supabase 的 numeric 类型会返回字符串
  stock: number
  image_url: string | null
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
  address: string
  phone: string | null
  created_at: string
  order_items: OrderItem[]
}

export type CheckoutInfo = {
  full_name: string
  country: string
  address: string
  phone: string
}
