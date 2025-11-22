-- Add buyer-specific columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS contact_person VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS business_permit VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS requirements TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;

-- Create buyer_prices table
CREATE TABLE IF NOT EXISTS buyer_prices (
  price_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  quality VARCHAR(100) NOT NULL,
  price_per_kg DECIMAL(10, 2) NOT NULL DEFAULT 0,
  minimum_order INTEGER NOT NULL DEFAULT 0,
  availability VARCHAR(50) DEFAULT 'Available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_buyer_prices_buyer_id ON buyer_prices(buyer_id);
CREATE INDEX IF NOT EXISTS idx_buyer_prices_quality ON buyer_prices(quality);
CREATE INDEX IF NOT EXISTS idx_buyer_prices_availability ON buyer_prices(availability);

-- Disable RLS for service role access
ALTER TABLE buyer_prices DISABLE ROW LEVEL SECURITY;

-- Add comments
COMMENT ON TABLE buyer_prices IS 'Stores buyer pricing information for different abaca fiber qualities';
COMMENT ON COLUMN buyer_prices.quality IS 'Abaca fiber quality grade (e.g., Class A, Class B, Medium, Low)';
COMMENT ON COLUMN buyer_prices.price_per_kg IS 'Price per kilogram in Philippine Pesos';
COMMENT ON COLUMN buyer_prices.minimum_order IS 'Minimum order quantity in kilograms';
COMMENT ON COLUMN buyer_prices.availability IS 'Current buying status (Available, Limited, Not Buying)';
