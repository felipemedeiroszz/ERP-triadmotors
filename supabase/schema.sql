-- TRIAD MOTO PARTS - Complete Database Schema
-- PostgreSQL + Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROFILES & AUTH
-- ============================================================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'employee')),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
CREATE POLICY "Admins can insert profiles" ON profiles
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;
CREATE POLICY "Admins can update profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'employee')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMPANY SETTINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS company_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  name TEXT NOT NULL DEFAULT 'TRIAD MOTO PARTS',
  slogan TEXT,
  cnpj TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  logo_url TEXT,
  receipt_footer TEXT DEFAULT 'COMPROVANTE DE VENDA — NÃO É DOCUMENTO FISCAL',
  receipt_format TEXT NOT NULL DEFAULT '80' CHECK (receipt_format IN ('58', '80', 'a4')),
  allow_negative_stock BOOLEAN NOT NULL DEFAULT false,
  default_min_stock INTEGER NOT NULL DEFAULT 5,
  employee_max_discount_pct NUMERIC(5,2) NOT NULL DEFAULT 10.00,
  employee_can_create_customers BOOLEAN NOT NULL DEFAULT true,
  max_image_mb INTEGER NOT NULL DEFAULT 5,
  default_due_days INTEGER NOT NULL DEFAULT 30,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view company settings" ON company_settings;
CREATE POLICY "Anyone can view company settings" ON company_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can update company settings" ON company_settings;
CREATE POLICY "Admins can update company settings" ON company_settings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP TRIGGER IF EXISTS update_company_settings_updated_at ON company_settings;
CREATE TRIGGER update_company_settings_updated_at
  BEFORE UPDATE ON company_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings
INSERT INTO company_settings (id, name, slogan)
VALUES (1, 'TRIAD MOTO PARTS', 'Mais controle para o seu negócio.')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- CATEGORIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
CREATE POLICY "Anyone can view categories" ON categories
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- BRANDS
-- ============================================================================

CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view brands" ON brands;
CREATE POLICY "Anyone can view brands" ON brands
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can manage brands" ON brands;
CREATE POLICY "Admins can manage brands" ON brands
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP TRIGGER IF EXISTS update_brands_updated_at ON brands;
CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SUPPLIERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  cnpj TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view suppliers" ON suppliers;
CREATE POLICY "Anyone can view suppliers" ON suppliers
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can manage suppliers" ON suppliers;
CREATE POLICY "Admins can manage suppliers" ON suppliers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP TRIGGER IF EXISTS update_suppliers_updated_at ON suppliers;
CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PRODUCTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku TEXT NOT NULL UNIQUE,
  barcode TEXT UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  application TEXT,
  unit TEXT NOT NULL DEFAULT 'UN',
  cost_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  sale_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  margin_pct NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE WHEN cost_price > 0
      THEN ROUND(((sale_price - cost_price) / cost_price * 100), 2)
      ELSE 0
    END
  ) STORED,
  stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 5,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP INDEX IF EXISTS idx_products_sku;
CREATE INDEX idx_products_sku ON products(sku);
DROP INDEX IF EXISTS idx_products_barcode;
CREATE INDEX idx_products_barcode ON products(barcode);
DROP INDEX IF EXISTS idx_products_name;
CREATE INDEX idx_products_name ON products(name);
DROP INDEX IF EXISTS idx_products_category;
CREATE INDEX idx_products_category ON products(category_id);
DROP INDEX IF EXISTS idx_products_brand;
CREATE INDEX idx_products_brand ON products(brand_id);
DROP INDEX IF EXISTS idx_products_active;
CREATE INDEX idx_products_active ON products(active);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Employees can view products but NOT cost_price, margin_pct
DROP POLICY IF EXISTS "Anyone can view products" ON products;
CREATE POLICY "Anyone can view products" ON products
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can view all product fields" ON products;
CREATE POLICY "Admins can view all product fields" ON products
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can manage products" ON products;
CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PRODUCT IMAGES
-- ============================================================================

CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP INDEX IF EXISTS idx_product_images_product;
CREATE INDEX idx_product_images_product ON product_images(product_id);

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view product images" ON product_images;
CREATE POLICY "Anyone can view product images" ON product_images
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can manage product images" ON product_images;
CREATE POLICY "Admins can manage product images" ON product_images
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Function to ensure only one primary image per product
CREATE OR REPLACE FUNCTION ensure_single_primary_image()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary = true THEN
    UPDATE product_images
    SET is_primary = false
    WHERE product_id = NEW.product_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_single_primary_image_trigger ON product_images;
CREATE TRIGGER ensure_single_primary_image_trigger
  BEFORE INSERT OR UPDATE ON product_images
  FOR EACH ROW EXECUTE FUNCTION ensure_single_primary_image();

-- ============================================================================
-- CUSTOMERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  document TEXT UNIQUE,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  address TEXT,
  address_number TEXT,
  district TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  notes TEXT,
  credit_limit NUMERIC(12,2) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP INDEX IF EXISTS idx_customers_name;
CREATE INDEX idx_customers_name ON customers(name);
DROP INDEX IF EXISTS idx_customers_document;
CREATE INDEX idx_customers_document ON customers(document);
DROP INDEX IF EXISTS idx_customers_phone;
CREATE INDEX idx_customers_phone ON customers(phone);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view customers" ON customers;
CREATE POLICY "Anyone can view customers" ON customers
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can manage customers" ON customers;
CREATE POLICY "Admins can manage customers" ON customers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Employees can create customers if allowed" ON customers;
CREATE POLICY "Employees can create customers if allowed" ON customers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN company_settings cs ON true
      WHERE p.id = auth.uid()
      AND (p.role = 'admin' OR cs.employee_can_create_customers = true)
    )
  );

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SALES
-- ============================================================================

CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  number INTEGER NOT NULL UNIQUE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  items_discount NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'pix', 'debit', 'credit', 'credit_term')),
  amount_received NUMERIC(12,2),
  change_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'cancelled')),
  notes TEXT,
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP INDEX IF EXISTS idx_sales_number;
CREATE INDEX idx_sales_number ON sales(number);
DROP INDEX IF EXISTS idx_sales_customer;
CREATE INDEX idx_sales_customer ON sales(customer_id);
DROP INDEX IF EXISTS idx_sales_user;
CREATE INDEX idx_sales_user ON sales(user_id);
DROP INDEX IF EXISTS idx_sales_date;
CREATE INDEX idx_sales_date ON sales(created_at);
DROP INDEX IF EXISTS idx_sales_status;
CREATE INDEX idx_sales_status ON sales(status);
DROP INDEX IF EXISTS idx_sales_payment;
CREATE INDEX idx_sales_payment ON sales(payment_method);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own sales" ON sales;
CREATE POLICY "Users can view their own sales" ON sales
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all sales" ON sales;
CREATE POLICY "Admins can view all sales" ON sales
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can manage sales" ON sales;
CREATE POLICY "Admins can manage sales" ON sales
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Users can create their own sales" ON sales;
CREATE POLICY "Users can create their own sales" ON sales
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    user_id = auth.uid()
  );

-- ============================================================================
-- SALE ITEMS
-- ============================================================================

CREATE TABLE IF NOT EXISTS sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL,
  discount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL,
  cost_price NUMERIC(12,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP INDEX IF EXISTS idx_sale_items_sale;
CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
DROP INDEX IF EXISTS idx_sale_items_product;
CREATE INDEX idx_sale_items_product ON sale_items(product_id);

ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their sale items" ON sale_items;
CREATE POLICY "Users can view their sale items" ON sale_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM sales WHERE id = sale_items.sale_id AND user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can view all sale items" ON sale_items;
CREATE POLICY "Admins can view all sale items" ON sale_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can manage sale items" ON sale_items;
CREATE POLICY "Admins can manage sale items" ON sale_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Users can create sale items for their sales" ON sale_items;
CREATE POLICY "Users can create sale items for their sales" ON sale_items
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM sales
      WHERE sales.id = sale_items.sale_id
      AND sales.user_id = auth.uid()
    )
  );

-- ============================================================================
-- COMMANDS (CONTAS A RECEBER)
-- ============================================================================

CREATE TABLE IF NOT EXISTS commands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  number INTEGER NOT NULL UNIQUE,
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  total NUMERIC(12,2) NOT NULL,
  paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  balance NUMERIC(12,2) GENERATED ALWAYS AS (total - paid_amount) STORED,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'paid', 'cancelled')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP INDEX IF EXISTS idx_commands_number;
CREATE INDEX idx_commands_number ON commands(number);
DROP INDEX IF EXISTS idx_commands_customer;
CREATE INDEX idx_commands_customer ON commands(customer_id);
DROP INDEX IF EXISTS idx_commands_sale;
CREATE INDEX idx_commands_sale ON commands(sale_id);
DROP INDEX IF EXISTS idx_commands_due_date;
CREATE INDEX idx_commands_due_date ON commands(due_date);
DROP INDEX IF EXISTS idx_commands_status;
CREATE INDEX idx_commands_status ON commands(status);

ALTER TABLE commands ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view commands" ON commands;
CREATE POLICY "Anyone can view commands" ON commands
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can manage commands" ON commands;
CREATE POLICY "Admins can manage commands" ON commands
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Users can create commands for their sales" ON commands;
CREATE POLICY "Users can create commands for their sales" ON commands
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM sales
      WHERE sales.id = commands.sale_id
      AND sales.user_id = auth.uid()
    )
  );

-- ============================================================================
-- COMMAND PAYMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS command_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  command_id UUID NOT NULL REFERENCES commands(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('cash', 'pix', 'debit', 'credit')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP INDEX IF EXISTS idx_command_payments_command;
CREATE INDEX idx_command_payments_command ON command_payments(command_id);

ALTER TABLE command_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view command payments" ON command_payments;
CREATE POLICY "Anyone can view command payments" ON command_payments
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can manage command payments" ON command_payments;
CREATE POLICY "Admins can manage command payments" ON command_payments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Function to update command paid_amount on payment
CREATE OR REPLACE FUNCTION update_command_paid_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE commands
    SET paid_amount = paid_amount + NEW.amount,
        paid_at = CASE WHEN (paid_amount + NEW.amount) >= total THEN NOW() ELSE paid_at END,
        status = CASE WHEN (paid_amount + NEW.amount) >= total THEN 'paid' ELSE status END
    WHERE id = NEW.command_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE commands
    SET paid_amount = paid_amount - OLD.amount,
        status = CASE WHEN paid_amount < total THEN 'open' ELSE status END
    WHERE id = OLD.command_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_command_paid_amount_trigger ON command_payments;
CREATE TRIGGER update_command_paid_amount_trigger
  AFTER INSERT OR DELETE ON command_payments
  FOR EACH ROW EXECUTE FUNCTION update_command_paid_amount();

-- ============================================================================
-- EXPENSES
-- ============================================================================

CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  date DATE NOT NULL,
  due_date DATE,
  payment_method TEXT CHECK (payment_method IN ('cash', 'pix', 'debit', 'credit', 'transfer')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  recurrence TEXT NOT NULL DEFAULT 'none' CHECK (recurrence IN ('none', 'weekly', 'monthly', 'yearly')),
  notes TEXT,
  receipt_url TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP INDEX IF EXISTS idx_expenses_date;
CREATE INDEX idx_expenses_date ON expenses(date);
DROP INDEX IF EXISTS idx_expenses_due_date;
CREATE INDEX idx_expenses_due_date ON expenses(due_date);
DROP INDEX IF EXISTS idx_expenses_status;
CREATE INDEX idx_expenses_status ON expenses(status);
DROP INDEX IF EXISTS idx_expenses_category;
CREATE INDEX idx_expenses_category ON expenses(category);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Only admins can view and manage expenses
DROP POLICY IF EXISTS "Admins can manage expenses" ON expenses;
CREATE POLICY "Admins can manage expenses" ON expenses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- STOCK MOVEMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('in', 'out', 'adjustment')),
  quantity NUMERIC(10,2) NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference_id UUID,
  reference_type TEXT,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP INDEX IF EXISTS idx_stock_movements_product;
CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
DROP INDEX IF EXISTS idx_stock_movements_date;
CREATE INDEX idx_stock_movements_date ON stock_movements(created_at);
DROP INDEX IF EXISTS idx_stock_movements_type;
CREATE INDEX idx_stock_movements_type ON stock_movements(type);

ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view stock movements" ON stock_movements;
CREATE POLICY "Anyone can view stock movements" ON stock_movements
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can manage stock movements" ON stock_movements;
CREATE POLICY "Admins can manage stock movements" ON stock_movements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- CASH REGISTERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS cash_registers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opened_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  opening_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  closed_at TIMESTAMPTZ,
  closed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  informed_amount NUMERIC(12,2),
  expected_cash NUMERIC(12,2),
  difference NUMERIC(12,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP INDEX IF EXISTS idx_cash_registers_status;
CREATE INDEX idx_cash_registers_status ON cash_registers(status);
DROP INDEX IF EXISTS idx_cash_registers_opened_at;
CREATE INDEX idx_cash_registers_opened_at ON cash_registers(opened_at);

ALTER TABLE cash_registers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view cash registers" ON cash_registers;
CREATE POLICY "Anyone can view cash registers" ON cash_registers
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can manage cash registers" ON cash_registers;
CREATE POLICY "Admins can manage cash registers" ON cash_registers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- CASH MOVEMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS cash_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cash_register_id UUID NOT NULL REFERENCES cash_registers(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('sale', 'receipt', 'supply', 'withdrawal')),
  amount NUMERIC(12,2) NOT NULL,
  method TEXT CHECK (method IN ('cash', 'pix', 'debit', 'credit')),
  description TEXT,
  reference_id UUID,
  reference_type TEXT,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP INDEX IF EXISTS idx_cash_movements_register;
CREATE INDEX idx_cash_movements_register ON cash_movements(cash_register_id);
DROP INDEX IF EXISTS idx_cash_movements_type;
CREATE INDEX idx_cash_movements_type ON cash_movements(type);
DROP INDEX IF EXISTS idx_cash_movements_date;
CREATE INDEX idx_cash_movements_date ON cash_movements(created_at);

ALTER TABLE cash_movements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view cash movements" ON cash_movements;
CREATE POLICY "Anyone can view cash movements" ON cash_movements
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can manage cash movements" ON cash_movements;
CREATE POLICY "Admins can manage cash movements" ON cash_movements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- AUDIT LOGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP INDEX IF EXISTS idx_audit_logs_user;
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
DROP INDEX IF EXISTS idx_audit_logs_entity;
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity);
DROP INDEX IF EXISTS idx_audit_logs_date;
CREATE INDEX idx_audit_logs_date ON audit_logs(created_at);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;
CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get next sale number
CREATE OR REPLACE FUNCTION get_next_sale_number()
RETURNS INTEGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(number), 0) + 1 INTO next_num FROM sales;
  RETURN next_num;
END;
$$ LANGUAGE plpgsql;

-- Function to get next command number
CREATE OR REPLACE FUNCTION get_next_command_number()
RETURNS INTEGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(number), 0) + 1 INTO next_num FROM commands;
  RETURN next_num;
END;
$$ LANGUAGE plpgsql;

-- Function to update product stock
CREATE OR REPLACE FUNCTION update_product_stock(
  p_product_id UUID,
  p_quantity INTEGER,
  p_type TEXT,
  p_reason TEXT,
  p_user_id UUID,
  p_reference_id UUID DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_previous_stock INTEGER;
  v_new_stock INTEGER;
BEGIN
  SELECT stock INTO v_previous_stock FROM products WHERE id = p_product_id;

  IF p_type = 'in' THEN
    v_new_stock := v_previous_stock + p_quantity;
  ELSIF p_type = 'out' THEN
    v_new_stock := v_previous_stock - p_quantity;
  ELSE
    v_new_stock := p_quantity;
  END IF;

  UPDATE products
  SET stock = v_new_stock
  WHERE id = p_product_id;

  INSERT INTO stock_movements (
    product_id, type, quantity, previous_stock, new_stock,
    reason, reference_id, reference_type, user_id
  ) VALUES (
    p_product_id, p_type, p_quantity, v_previous_stock, v_new_stock,
    p_reason, p_reference_id, p_reference_type, p_user_id
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default categories
INSERT INTO categories (name) VALUES
  ('Peças de Motor'),
  ('Freios'),
  ('Suspensão'),
  ('Elétrica'),
  ('Transmissão'),
  ('Pneus'),
  ('Acessórios'),
  ('Lubrificantes'),
  ('Baterias'),
  ('Roupas e Equipamentos')
ON CONFLICT (name) DO NOTHING;

-- Insert default brands
INSERT INTO brands (name) VALUES
  ('Honda'),
  ('Yamaha'),
  ('Kawasaki'),
  ('Suzuki'),
  ('Dafra'),
  ('Shineray'),
  ('Triumph'),
  ('Ducati'),
  ('BMW'),
  ('Harley-Davidson')
ON CONFLICT (name) DO NOTHING;
