-- Create fiber_deliveries table for tracking deliveries from farmers to buyers
CREATE TABLE IF NOT EXISTS fiber_deliveries (
  delivery_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- References
  farmer_id UUID NOT NULL REFERENCES farmers(farmer_id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES buyers(buyer_id) ON DELETE CASCADE,
  harvest_id UUID NOT NULL REFERENCES harvests(harvest_id) ON DELETE CASCADE,
  
  -- Delivery Information
  delivery_date DATE NOT NULL,
  delivery_time TIME,
  
  -- Fiber Details (from harvest)
  variety VARCHAR(100) NOT NULL,
  quantity_kg DECIMAL(10, 2) NOT NULL,
  grade VARCHAR(50) NOT NULL, -- Class A, Class B, Class C
  municipality VARCHAR(255),
  barangay VARCHAR(255),
  
  -- Pricing
  price_per_kg DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  
  -- Delivery Details
  pickup_location TEXT NOT NULL,
  delivery_location TEXT NOT NULL,
  delivery_method VARCHAR(100), -- Self-delivery, Buyer Pickup, Third-party
  
  -- Contact Information
  farmer_contact VARCHAR(20) NOT NULL,
  buyer_contact VARCHAR(20) NOT NULL,
  
  -- Status Tracking
  status VARCHAR(50) DEFAULT 'In Transit' CHECK (status IN ('In Transit', 'Delivered', 'Completed', 'Cancelled')),
  
  -- Additional Information
  notes TEXT,
  delivery_proof_image TEXT, -- Photo of delivered fiber
  receipt_image TEXT, -- Photo of receipt/payment proof
  
  -- Payment Status
  payment_status VARCHAR(50) DEFAULT 'Unpaid' CHECK (payment_status IN ('Unpaid', 'Partial', 'Paid')),
  payment_method VARCHAR(100),
  payment_date DATE,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP,
  delivered_at TIMESTAMP,
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  cancellation_reason TEXT
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_fiber_deliveries_farmer_id ON fiber_deliveries(farmer_id);
CREATE INDEX IF NOT EXISTS idx_fiber_deliveries_buyer_id ON fiber_deliveries(buyer_id);
CREATE INDEX IF NOT EXISTS idx_fiber_deliveries_harvest_id ON fiber_deliveries(harvest_id);
CREATE INDEX IF NOT EXISTS idx_fiber_deliveries_status ON fiber_deliveries(status);
CREATE INDEX IF NOT EXISTS idx_fiber_deliveries_delivery_date ON fiber_deliveries(delivery_date DESC);
CREATE INDEX IF NOT EXISTS idx_fiber_deliveries_payment_status ON fiber_deliveries(payment_status);
CREATE INDEX IF NOT EXISTS idx_fiber_deliveries_grade ON fiber_deliveries(grade);
CREATE INDEX IF NOT EXISTS idx_fiber_deliveries_municipality ON fiber_deliveries(municipality);
CREATE INDEX IF NOT EXISTS idx_fiber_deliveries_created_at ON fiber_deliveries(created_at DESC);

-- Disable RLS
ALTER TABLE fiber_deliveries DISABLE ROW LEVEL SECURITY;

-- Add comments
COMMENT ON TABLE fiber_deliveries IS 'Tracks fiber deliveries from farmers to buyers managed by CUSAFA with status updates and payment tracking';
COMMENT ON COLUMN fiber_deliveries.status IS 'Delivery status managed by CUSAFA: In Transit (on the way), Delivered (received by buyer), Completed (payment done), Cancelled';
COMMENT ON COLUMN fiber_deliveries.payment_status IS 'Payment status: Unpaid (not paid), Partial (partially paid), Paid (fully paid)';
COMMENT ON COLUMN fiber_deliveries.grade IS 'Fiber quality grade: Class A (Premium), Class B (Standard), Class C (Basic)';
COMMENT ON COLUMN fiber_deliveries.delivery_method IS 'How fiber will be delivered: CUSAFA Delivery (CUSAFA coordinates), Buyer Pickup (buyer collects), Third-party (courier/logistics)';
COMMENT ON COLUMN fiber_deliveries.delivery_proof_image IS 'Photo evidence of delivered fiber for verification';
COMMENT ON COLUMN fiber_deliveries.receipt_image IS 'Photo of payment receipt or proof of payment';
