-- Allow authenticated users to create sales with their own user_id
DROP POLICY IF EXISTS "Users can create their own sales" ON sales;
CREATE POLICY "Users can create their own sales" ON sales
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    user_id = auth.uid()
  );

-- Allow authenticated users to create sale items for their own sales
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
