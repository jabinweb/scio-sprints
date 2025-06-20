import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey
  });
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Simple connection test without complex queries
const testConnection = async () => {
  try {
    // Just test basic connectivity
    const { error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('Supabase connection test result:', error.message);
      // Don't throw error, just log it
    } else {
      console.log('Supabase connected successfully');
    }
  } catch (err) {
    console.log('Supabase connection test failed, but continuing:', err);
    // Don't throw error, just log it
  }
};

// Run test on client side only
if (typeof window !== 'undefined') {
  testConnection();
}

