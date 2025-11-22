// supabase.ts - Supabase client configuration
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

// These will be set in environment variables
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('   SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_KEY:', supabaseKey ? '✓' : '✗');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);