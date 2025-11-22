-- Create buyer_purchases table
CREATE TABLE IF NOT EXISTS buyer_purchases (
  purchase_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES buyers(buyer_id) ON DELETE CASCADE,
  
  -- Purchase Details
  price DECIMAL(10, 2) NOT NULL, -- Price per kg in Pesos
  contact_number VARCHAR(20) NOT NULL, -- Buyer's contact number
  farmer_name VARCHAR(255) NOT NULL, -- Name of the farmer
  fiber_quality VARCHAR(50) NOT NULL CHECK (fiber_quality IN ('Class A', 'Class B', 'Class C')),
  quantity DECIMAL(10, 2) NOT NULL, -- Quantity in kg
  variety VARCHAR(100) NOT NULL, -- Abaca variety (manual input)
  total_price DECIMAL(10, 2) NOT NULL, -- Calculated: price × quantity
  
  -- Image
  image_url TEXT, -- Photo of the abaca fiber
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_buyer_purchases_buyer_id ON buyer_purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_buyer_purchases_fiber_quality ON buyer_purchases(fiber_quality);
CREATE INDEX IF NOT EXISTS idx_buyer_purchases_farmer_name ON buyer_purchases(farmer_name);
CREATE INDEX IF NOT EXISTS idx_buyer_purchases_created_at ON buyer_purchases(created_at DESC);

-- Disable RLS for service role access (backend handles authorization)
ALTER TABLE buyer_purchases DISABLE ROW LEVEL SECURITY;

-- Add comments for documentation
COMMENT ON TABLE buyer_purchases IS 'Stores buyer purchase requests for abaca fiber from farmers';
COMMENT ON COLUMN buyer_purchases.price IS 'Price per kilogram in Philippine Pesos';
COMMENT ON COLUMN buyer_purchases.farmer_name IS 'Name of the farmer supplying the abaca fiber';
COMMENT ON COLUMN buyer_purchases.fiber_quality IS 'Quality grade: Class A (Premium), Class B (Standard), Class C (Basic)';
COMMENT ON COLUMN buyer_purchases.quantity IS 'Quantity of abaca fiber in kilograms';
COMMENT ON COLUMN buyer_purchases.variety IS 'Abaca variety name (e.g., Inosa, Laylay, Musa Textilis)';
COMMENT ON COLUMN buyer_purchases.total_price IS 'Total purchase price calculated as price × quantity';
