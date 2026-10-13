-- Add receipt_url column to expenses table
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS receipt_url TEXT;
