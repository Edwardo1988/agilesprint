import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = https://vbmbfnnwaestnqwzjzsm.supabase.co;
const supabaseAnonKey = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZibWJmbm53YWVzdG5xd3pqenNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNTY0NzgsImV4cCI6MjA4MzkzMjQ3OH0.Dcza6q-DpZNT47LQEE_1f1j-LDCE_lL0fxGCWxc7aUQ;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);