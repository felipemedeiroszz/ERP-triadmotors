export type Role = 'admin' | 'employee'
export type PaymentMethod = 'cash' | 'pix' | 'debit' | 'credit' | 'credit_term'
export type ReceiptFormat = '58' | '80' | 'a4'

export interface Profile {
  id: string
  full_name: string
  email: string | null
  role: Role
  active: boolean
  created_at: string
}

export interface CompanySettings {
  name: string
  slogan: string | null
  cnpj: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  logo_url: string | null
  receipt_footer: string | null
  receipt_format: ReceiptFormat
  allow_negative_stock: boolean
  default_min_stock: number
  employee_max_discount_pct: number
  employee_can_create_customers: boolean
  max_image_mb: number
  default_due_days: number
}

export interface Option {
  id: string
  name: string
}

export interface ProductListItem {
  id: string
  sku: string
  barcode: string | null
  name: string
  description: string | null
  application: string | null
  unit: string
  sale_price: number
  stock: number
  min_stock: number
  active: boolean
  category_id: string | null
  brand_id: string | null
  supplier_id: string | null
  category_name: string | null
  brand_name: string | null
  image_url: string | null
  stock_status: 'ok' | 'low' | 'out'
  created_at: string
  updated_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  storage_path: string
  url: string
  is_primary: boolean
  position: number
}

export interface Customer {
  id: string
  name: string
  document: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  address: string | null
  address_number: string | null
  district: string | null
  city: string | null
  state: string | null
  zip: string | null
  notes: string | null
  credit_limit: number
  active: boolean
  created_at: string
}

export interface CustomerListItem extends Customer {
  commands_count: number
  open_count: number
  paid_count: number
  overdue_count: number
  open_total: number
  overdue_total: number
}

export interface SaleListItem {
  id: string
  number: number
  customer_id: string | null
  user_id: string
  subtotal: number
  items_discount: number
  discount: number
  total: number
  payment_method: PaymentMethod
  amount_received: number | null
  change_amount: number
  status: 'completed' | 'cancelled'
  notes: string | null
  cancelled_at: string | null
  cancel_reason: string | null
  created_at: string
  customer_name: string | null
  user_name: string | null
  command_number: number | null
  command_id: string | null
  command_due_date: string | null
  command_balance: number | null
}

export interface SaleItem {
  id: string
  product_id: string | null
  sku: string
  name: string
  unit: string
  quantity: number
  unit_price: number
  discount: number
  total: number
}

export interface CommandListItem {
  id: string
  number: number
  sale_id: string
  customer_id: string
  total: number
  paid_amount: number
  balance: number
  due_date: string
  status: 'open' | 'paid' | 'cancelled'
  effective_status: 'open' | 'paid' | 'cancelled' | 'overdue'
  paid_at: string | null
  created_at: string
  customer_name: string
  customer_phone: string | null
  sale_number: number
}

export interface CommandPayment {
  id: string
  command_id: string
  amount: number
  method: Exclude<PaymentMethod, 'credit_term'>
  notes: string | null
  created_at: string
}

export interface ExpenseListItem {
  id: string
  description: string
  category: string
  amount: number
  date: string
  due_date: string | null
  payment_method: string | null
  status: 'pending' | 'paid' | 'cancelled'
  effective_status: 'pending' | 'paid' | 'cancelled' | 'overdue'
  recurrence: 'none' | 'weekly' | 'monthly' | 'yearly'
  notes: string | null
  paid_at: string | null
}

export interface CashRegister {
  id: string
  opened_by: string
  opened_at: string
  opening_amount: number
  status: 'open' | 'closed'
  closed_at: string | null
  informed_amount: number | null
  expected_cash: number | null
  difference: number | null
  summary: CashSummary | null
  notes: string | null
}

export interface CashSummary {
  opening_amount: number
  cash: number
  pix: number
  debit: number
  credit: number
  credit_term: number
  receipts_cash: number
  receipts_other: number
  supply: number
  withdrawal: number
  total_sold: number
  expected_cash: number
  sales_count: number
}
