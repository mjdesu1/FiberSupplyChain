-- Create buyer_listings table for price postings with multi-type support
CREATE TABLE IF NOT EXISTS buyer_listings (
  listing_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES buyers(buyer_id) ON DELETE CASCADE,
  
  -- Company Information
  company_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  location TEXT NOT NULL,
  municipality VARCHAR(100) NOT NULL,
  barangay VARCHAR(100) NOT NULL,
  
  -- Multi-Type Pricing (Class A, B, C)
  class_a_enabled BOOLEAN DEFAULT false,
  class_a_price DECIMAL(10, 2),
  class_a_image TEXT,
  
  class_b_enabled BOOLEAN DEFAULT false,
  class_b_price DECIMAL(10, 2),
  class_b_image TEXT,
  
  class_c_enabled BOOLEAN DEFAULT false,
  class_c_price DECIMAL(10, 2),
  class_c_image TEXT,
  
  -- General Terms
  payment_terms VARCHAR(100) NOT NULL,
  requirements TEXT,
  availability VARCHAR(50) DEFAULT 'Available',
  valid_until DATE NOT NULL,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraint: At least one class must be enabled
  CONSTRAINT at_least_one_class_enabled CHECK (
    class_a_enabled = true OR class_b_enabled = true OR class_c_enabled = true
  )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_buyer_listings_buyer_id ON buyer_listings(buyer_id);
CREATE INDEX IF NOT EXISTS idx_buyer_listings_municipality ON buyer_listings(municipality);
CREATE INDEX IF NOT EXISTS idx_buyer_listings_availability ON buyer_listings(availability);
CREATE INDEX IF NOT EXISTS idx_buyer_listings_valid_until ON buyer_listings(valid_until);
CREATE INDEX IF NOT EXISTS idx_buyer_listings_created_at ON buyer_listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_buyer_listings_class_a_enabled ON buyer_listings(class_a_enabled) WHERE class_a_enabled = true;
CREATE INDEX IF NOT EXISTS idx_buyer_listings_class_b_enabled ON buyer_listings(class_b_enabled) WHERE class_b_enabled = true;
CREATE INDEX IF NOT EXISTS idx_buyer_listings_class_c_enabled ON buyer_listings(class_c_enabled) WHERE class_c_enabled = true;

-- Disable RLS
ALTER TABLE buyer_listings DISABLE ROW LEVEL SECURITY;

-- Add comments
COMMENT ON TABLE buyer_listings IS 'Public price listings posted by buyers with multi-class support (Class A, B, C) - visible to all farmers, MAO, and associations';
COMMENT ON COLUMN buyer_listings.class_a_enabled IS 'Whether Class A (Premium) abaca is being purchased';
COMMENT ON COLUMN buyer_listings.class_a_price IS 'Buying price per kilogram for Class A in Philippine Pesos';
COMMENT ON COLUMN buyer_listings.class_a_image IS 'Reference image URL for Class A quality standard';
COMMENT ON COLUMN buyer_listings.class_b_enabled IS 'Whether Class B (Standard) abaca is being purchased';
COMMENT ON COLUMN buyer_listings.class_b_price IS 'Buying price per kilogram for Class B in Philippine Pesos';
COMMENT ON COLUMN buyer_listings.class_b_image IS 'Reference image URL for Class B quality standard';
COMMENT ON COLUMN buyer_listings.class_c_enabled IS 'Whether Class C (Basic) abaca is being purchased';
COMMENT ON COLUMN buyer_listings.class_c_price IS 'Buying price per kilogram for Class C in Philippine Pesos';
COMMENT ON COLUMN buyer_listings.class_c_image IS 'Reference image URL for Class C quality standard';
COMMENT ON COLUMN buyer_listings.payment_terms IS 'Payment terms (Cash on Delivery, Cash on Pickup, 7/15/30 Days, Negotiable)';
COMMENT ON COLUMN buyer_listings.availability IS 'Current buying status (Available, Limited, Not Buying)';
COMMENT ON COLUMN buyer_listings.valid_until IS 'Date until which this price listing is valid';
