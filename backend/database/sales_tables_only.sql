-- =====================================================
-- SALES REPORTING TABLES ONLY
-- =====================================================
-- This file contains only the sales reporting system tables
-- Run this after your main database setup to add sales functionality
-- Updated: November 2025

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- SALES REPORTING SYSTEM
-- =====================================================

-- Sales Reports Table (Comprehensive single table approach)
CREATE TABLE public.sales_reports (
    report_id uuid NOT NULL DEFAULT uuid_generate_v4(),
    farmer_id uuid NOT NULL,
    report_month character varying NOT NULL, -- Format: YYYY-MM
    
    -- 1. Basic Transaction Info
    transaction_reference character varying, -- Transaction ID / Reference Number
    sale_date date NOT NULL,
    buyer_company_name character varying NOT NULL,
    
    -- 2. Product Details
    abaca_type character varying NOT NULL DEFAULT 'Tuxy' CHECK (abaca_type IN ('Tuxy', 'Superior', 'Medium', 'Low Grade')),
    quantity_sold numeric(10,2) NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    total_amount numeric(12,2) NOT NULL,
    
    -- 3. Payment Details
    payment_method character varying DEFAULT 'cash' CHECK (payment_method IN ('cash', 'bank_transfer', 'check', 'credit')),
    payment_status character varying DEFAULT 'paid' CHECK (payment_status IN ('paid', 'pending', 'partial')),
    
    -- 4. Logistics / Delivery
    delivery_location character varying,
    shipping_fee numeric(10,2) DEFAULT 0,
    
    -- 5. Remarks / Notes
    quality_notes text,
    other_comments text,
    
    -- Administrative fields
    status character varying DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    rejection_reason text,
    submitted_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT sales_reports_pkey PRIMARY KEY (report_id),
    CONSTRAINT fk_sales_reports_farmer FOREIGN KEY (farmer_id) REFERENCES public.farmers(farmer_id) ON DELETE CASCADE,
    CONSTRAINT fk_sales_reports_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES public.organization(officer_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =====================================================

-- Sales Reports indexes
CREATE INDEX IF NOT EXISTS idx_sales_reports_farmer_id ON public.sales_reports(farmer_id);
CREATE INDEX IF NOT EXISTS idx_sales_reports_month ON public.sales_reports(report_month);
CREATE INDEX IF NOT EXISTS idx_sales_reports_status ON public.sales_reports(status);
CREATE INDEX IF NOT EXISTS idx_sales_reports_submitted_at ON public.sales_reports(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_reports_sale_date ON public.sales_reports(sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_reports_abaca_type ON public.sales_reports(abaca_type);
CREATE INDEX IF NOT EXISTS idx_sales_reports_payment_status ON public.sales_reports(payment_status);
CREATE INDEX IF NOT EXISTS idx_sales_reports_buyer_company ON public.sales_reports(buyer_company_name);

-- =====================================================
-- SALES ANALYTICS VIEW
-- =====================================================

-- Sales Analytics View
-- Provides aggregated analytics data for farmer performance tracking
CREATE OR REPLACE VIEW public.sales_analytics AS
SELECT 
    f.farmer_id,
    f.full_name as farmer_name,
    COUNT(DISTINCT sr.report_id) as total_reports,
    COALESCE(SUM(sr.total_amount), 0) as total_revenue,
    COALESCE(SUM(sr.quantity_sold), 0) as total_quantity,
    COUNT(sr.report_id) as total_transactions,
    COALESCE(AVG(sr.unit_price), 0) as average_price_per_kg,
    MAX(sr.submitted_at) as last_report_date,
    (
        SELECT sr2.abaca_type 
        FROM public.sales_reports sr2 
        WHERE sr2.farmer_id = f.farmer_id AND sr2.status = 'approved'
        GROUP BY sr2.abaca_type 
        ORDER BY SUM(sr2.quantity_sold) DESC 
        LIMIT 1
    ) as top_abaca_type,
    COALESCE(AVG(sr.shipping_fee), 0) as average_shipping_fee
FROM public.farmers f
LEFT JOIN public.sales_reports sr ON f.farmer_id = sr.farmer_id AND sr.status = 'approved'
GROUP BY f.farmer_id, f.full_name
ORDER BY total_revenue DESC;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$ 
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'SALES REPORTING SYSTEM SETUP COMPLETED';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Sales tables created successfully:';
    RAISE NOTICE '- sales_reports table with proper foreign keys';
    RAISE NOTICE '- Performance optimized indexes';
    RAISE NOTICE '- Sales analytics view for reporting';
    RAISE NOTICE '';
    RAISE NOTICE 'Features included:';
    RAISE NOTICE '- Comprehensive transaction details (5 sections)';
    RAISE NOTICE '- Proper farmer relationship with CASCADE delete';
    RAISE NOTICE '- MAO officer verification tracking';
    RAISE NOTICE '- Status management (pending/approved/rejected)';
    RAISE NOTICE '- Payment and delivery tracking';
    RAISE NOTICE '- Quality notes and comments';
    RAISE NOTICE '';
    RAISE NOTICE 'Sales reporting system is ready for use!';
    RAISE NOTICE '==============================================';
END $$;
