-- Create the missing association seedling distribution tables

-- Create association_seedling_distributions table
CREATE TABLE IF NOT EXISTS public.association_seedling_distributions (
  distribution_id uuid NOT NULL DEFAULT gen_random_uuid(),
  variety character varying NOT NULL,
  source_supplier character varying,
  quantity_distributed integer NOT NULL CHECK (quantity_distributed > 0),
  date_distributed date NOT NULL DEFAULT CURRENT_DATE,
  recipient_association_id uuid NOT NULL,
  recipient_association_name character varying NOT NULL,
  remarks text,
  status character varying DEFAULT 'distributed_to_association'::character varying 
    CHECK (status IN ('distributed_to_association', 'partially_distributed_to_farmers', 'fully_distributed_to_farmers', 'partially_planted', 'fully_planted', 'cancelled')),
  distributed_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Photo documentation
  seedling_photo text,
  packaging_photo text,
  quality_photo text,
  
  -- Constraints
  CONSTRAINT association_seedling_distributions_pkey PRIMARY KEY (distribution_id)
);

-- Create farmer_seedling_distributions table
CREATE TABLE IF NOT EXISTS public.farmer_seedling_distributions (
  distribution_id uuid NOT NULL DEFAULT gen_random_uuid(),
  association_distribution_id uuid NOT NULL,
  variety character varying NOT NULL,
  quantity_distributed integer NOT NULL CHECK (quantity_distributed > 0),
  date_distributed date NOT NULL DEFAULT CURRENT_DATE,
  recipient_farmer_id uuid NOT NULL,
  remarks text,
  status character varying DEFAULT 'distributed_to_farmer'::character varying 
    CHECK (status IN ('distributed_to_farmer', 'planted', 'damaged', 'replanted', 'lost', 'other')),
  distributed_by_association uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Photo documentation
  seedling_photo text,
  packaging_photo text,
  quality_photo text,
  
  -- Planting information (filled by farmers)
  planting_date date,
  planting_location text,
  planting_photo_1 text,
  planting_photo_2 text,
  planting_photo_3 text,
  planting_notes text,
  planted_by uuid,
  planted_at timestamp with time zone,
  
  -- Constraints
  CONSTRAINT farmer_seedling_distributions_pkey PRIMARY KEY (distribution_id)
);

-- Add foreign key constraints
DO $$
BEGIN
  -- Association distributions foreign keys
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organization') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'association_seedling_distributions' AND constraint_name = 'association_seedling_distributions_distributed_by_fkey') THEN
      ALTER TABLE public.association_seedling_distributions 
      ADD CONSTRAINT association_seedling_distributions_distributed_by_fkey 
      FOREIGN KEY (distributed_by) REFERENCES public.organization(officer_id) ON DELETE CASCADE;
    END IF;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'association_officers') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'association_seedling_distributions' AND constraint_name = 'association_seedling_distributions_recipient_association_id_fkey') THEN
      ALTER TABLE public.association_seedling_distributions 
      ADD CONSTRAINT association_seedling_distributions_recipient_association_id_fkey 
      FOREIGN KEY (recipient_association_id) REFERENCES public.association_officers(officer_id) ON DELETE CASCADE;
    END IF;
  END IF;

  -- Farmer distributions foreign keys
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'farmer_seedling_distributions' AND constraint_name = 'farmer_seedling_distributions_association_distribution_id_fkey') THEN
    ALTER TABLE public.farmer_seedling_distributions 
    ADD CONSTRAINT farmer_seedling_distributions_association_distribution_id_fkey 
    FOREIGN KEY (association_distribution_id) REFERENCES public.association_seedling_distributions(distribution_id) ON DELETE CASCADE;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'farmers') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'farmer_seedling_distributions' AND constraint_name = 'farmer_seedling_distributions_recipient_farmer_id_fkey') THEN
      ALTER TABLE public.farmer_seedling_distributions 
      ADD CONSTRAINT farmer_seedling_distributions_recipient_farmer_id_fkey 
      FOREIGN KEY (recipient_farmer_id) REFERENCES public.farmers(farmer_id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'farmer_seedling_distributions' AND constraint_name = 'farmer_seedling_distributions_planted_by_fkey') THEN
      ALTER TABLE public.farmer_seedling_distributions 
      ADD CONSTRAINT farmer_seedling_distributions_planted_by_fkey 
      FOREIGN KEY (planted_by) REFERENCES public.farmers(farmer_id) ON DELETE SET NULL;
    END IF;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'association_officers') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'farmer_seedling_distributions' AND constraint_name = 'farmer_seedling_distributions_distributed_by_association_fkey') THEN
      ALTER TABLE public.farmer_seedling_distributions 
      ADD CONSTRAINT farmer_seedling_distributions_distributed_by_association_fkey 
      FOREIGN KEY (distributed_by_association) REFERENCES public.association_officers(officer_id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_association_seedling_distributions_date ON public.association_seedling_distributions(date_distributed);
CREATE INDEX IF NOT EXISTS idx_association_seedling_distributions_recipient ON public.association_seedling_distributions(recipient_association_id);
CREATE INDEX IF NOT EXISTS idx_association_seedling_distributions_distributor ON public.association_seedling_distributions(distributed_by);
CREATE INDEX IF NOT EXISTS idx_association_seedling_distributions_variety ON public.association_seedling_distributions(variety);
CREATE INDEX IF NOT EXISTS idx_association_seedling_distributions_status ON public.association_seedling_distributions(status);

CREATE INDEX IF NOT EXISTS idx_farmer_seedling_distributions_date ON public.farmer_seedling_distributions(date_distributed);
CREATE INDEX IF NOT EXISTS idx_farmer_seedling_distributions_farmer ON public.farmer_seedling_distributions(recipient_farmer_id);
CREATE INDEX IF NOT EXISTS idx_farmer_seedling_distributions_association ON public.farmer_seedling_distributions(distributed_by_association);
CREATE INDEX IF NOT EXISTS idx_farmer_seedling_distributions_assoc_dist ON public.farmer_seedling_distributions(association_distribution_id);
CREATE INDEX IF NOT EXISTS idx_farmer_seedling_distributions_variety ON public.farmer_seedling_distributions(variety);
CREATE INDEX IF NOT EXISTS idx_farmer_seedling_distributions_status ON public.farmer_seedling_distributions(status);
CREATE INDEX IF NOT EXISTS idx_farmer_seedling_distributions_planting_date ON public.farmer_seedling_distributions(planting_date);