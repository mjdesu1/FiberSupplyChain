-- =====================================================
-- Activity Logs and IP/MAC Blocking System
-- For Super Admin monitoring and security
-- =====================================================

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  log_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  user_type character varying CHECK (user_type::text = ANY (ARRAY[
    'farmer'::character varying, 
    'buyer'::character varying, 
    'officer'::character varying, 
    'association_officer'::character varying
  ]::text[])),
  user_email character varying,
  user_name character varying,
  action character varying NOT NULL,
  action_type character varying CHECK (action_type::text = ANY (ARRAY[
    'auth'::character varying,
    'create'::character varying,
    'read'::character varying,
    'update'::character varying,
    'delete'::character varying,
    'system'::character varying
  ]::text[])),
  resource character varying,
  resource_id uuid,
  description text,
  ip_address character varying,
  mac_address character varying,
  user_agent text,
  request_method character varying,
  request_path character varying,
  status_code integer,
  success boolean DEFAULT true,
  error_message text,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT activity_logs_pkey PRIMARY KEY (log_id)
);

-- Blocked IPs Table
CREATE TABLE IF NOT EXISTS public.blocked_ips (
  block_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  ip_address character varying NOT NULL UNIQUE,
  reason text NOT NULL,
  blocked_by uuid NOT NULL,
  blocked_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  expires_at timestamp with time zone,
  is_permanent boolean DEFAULT false,
  is_active boolean DEFAULT true,
  notes text,
  unblocked_by uuid,
  unblocked_at timestamp with time zone,
  unblock_reason text,
  CONSTRAINT blocked_ips_pkey PRIMARY KEY (block_id),
  CONSTRAINT blocked_ips_blocked_by_fkey FOREIGN KEY (blocked_by) REFERENCES public.organization(officer_id),
  CONSTRAINT blocked_ips_unblocked_by_fkey FOREIGN KEY (unblocked_by) REFERENCES public.organization(officer_id)
);

-- Blocked MAC Addresses Table
CREATE TABLE IF NOT EXISTS public.blocked_macs (
  block_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  mac_address character varying NOT NULL UNIQUE,
  reason text NOT NULL,
  blocked_by uuid NOT NULL,
  blocked_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  expires_at timestamp with time zone,
  is_permanent boolean DEFAULT false,
  is_active boolean DEFAULT true,
  notes text,
  unblocked_by uuid,
  unblocked_at timestamp with time zone,
  unblock_reason text,
  CONSTRAINT blocked_macs_pkey PRIMARY KEY (block_id),
  CONSTRAINT blocked_macs_blocked_by_fkey FOREIGN KEY (blocked_by) REFERENCES public.organization(officer_id),
  CONSTRAINT blocked_macs_unblocked_by_fkey FOREIGN KEY (unblocked_by) REFERENCES public.organization(officer_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_type ON public.activity_logs(user_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action_type ON public.activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_ip_address ON public.activity_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_activity_logs_mac_address ON public.activity_logs(mac_address);

CREATE INDEX IF NOT EXISTS idx_blocked_ips_ip_address ON public.blocked_ips(ip_address);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_is_active ON public.blocked_ips(is_active);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_expires_at ON public.blocked_ips(expires_at);

CREATE INDEX IF NOT EXISTS idx_blocked_macs_mac_address ON public.blocked_macs(mac_address);
CREATE INDEX IF NOT EXISTS idx_blocked_macs_is_active ON public.blocked_macs(is_active);
CREATE INDEX IF NOT EXISTS idx_blocked_macs_expires_at ON public.blocked_macs(expires_at);

-- Function to automatically expire blocks
CREATE OR REPLACE FUNCTION expire_blocks()
RETURNS void AS $$
BEGIN
  -- Expire IP blocks
  UPDATE public.blocked_ips
  SET is_active = false
  WHERE is_active = true
    AND is_permanent = false
    AND expires_at IS NOT NULL
    AND expires_at < CURRENT_TIMESTAMP;

  -- Expire MAC blocks
  UPDATE public.blocked_macs
  SET is_active = false
  WHERE is_active = true
    AND is_permanent = false
    AND expires_at IS NOT NULL
    AND expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL ON public.activity_logs TO authenticated;
GRANT ALL ON public.blocked_ips TO authenticated;
GRANT ALL ON public.blocked_macs TO authenticated;

-- Comments for documentation
COMMENT ON TABLE public.activity_logs IS 'Comprehensive activity logging for all user actions';
COMMENT ON TABLE public.blocked_ips IS 'IP addresses blocked by super admin';
COMMENT ON TABLE public.blocked_macs IS 'MAC addresses blocked by super admin';
COMMENT ON COLUMN public.activity_logs.action_type IS 'Type of action: auth, create, read, update, delete, system';
COMMENT ON COLUMN public.blocked_ips.is_permanent IS 'If true, block never expires';
COMMENT ON COLUMN public.blocked_macs.is_permanent IS 'If true, block never expires';
