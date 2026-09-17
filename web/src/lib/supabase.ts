import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface Product {
  id: string
  name: string
  slug: string
  description: string
  short_desc: string
  price: number
  stock: number
  unit: string
  category: string
  images: string[]
  is_active: boolean
  created_at?: string
}

export interface Training {
  id: string
  title: string
  slug: string
  description: string
  full_description: string
  objectives: string[]
  date_start: string
  date_end: string
  location: string
  max_seats: number
  current_seats: number
  price: number
  image: string
  is_active: boolean
  created_at?: string
}

export interface Order {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  delivery_address: string
  city: string
  notes?: string
  items: OrderItem[]
  total: number
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled' | 'rejected'
  payment_method?: string
  created_at: string
}

export interface OrderItem {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
}
