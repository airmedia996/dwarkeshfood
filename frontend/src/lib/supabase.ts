import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://updshizpeheekxobbbxq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZHNoaXpwZWhlZWt4b2JiYnhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNTYyOTUsImV4cCI6MjA5MDgzMjI5NX0._zg24TvZIJ-e_Neenae42ayOAqZLnBDz9dgkATkQtQM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export default supabase;
