'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  userRole: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  const getUserRole = useCallback(async (user: User, retryCount = 0) => {
    try {
      console.log('Getting user role for:', user.id, 'retry:', retryCount);

      // Wait longer on first attempt to let trigger complete
      if (retryCount === 0) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Try to get user role with simpler query
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error getting user role:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });

        if (error.code === 'PGRST116' && retryCount < 3) {
          // User not found, wait and retry
          console.log('User not found, retrying in 2 seconds...');
          setTimeout(() => getUserRole(user, retryCount + 1), 2000);
          return;
        }
        
        // If still not found after retries, try to create manually
        if (error.code === 'PGRST116' && retryCount >= 3) {
          console.log('Manual user creation attempt...');
          try {
            const { error: createError } = await supabase
              .from('users')
              .insert({
                id: user.id,
                email: user.email!,
                display_name: user.user_metadata?.full_name || user.email!.split('@')[0],
                photo_url: user.user_metadata?.avatar_url || null,
                role: 'USER',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });

            if (createError) {
              console.error('Manual user creation failed:', createError);
              setUserRole('USER');
            } else {
              console.log('User created manually');
              setUserRole('USER');
            }
            return;
          } catch (manualError) {
            console.error('Manual creation error:', manualError);
          }
        }
        
        // Set default role for any error
        console.log('Setting default role USER due to error');
        setUserRole('USER');
      } else if (data) {
        console.log('User role found:', data.role);
        setUserRole(data.role || 'USER');
      } else {
        // No data found, set default role
        console.log('User not found in database, setting default role USER');
        setUserRole('USER');
      }
    } catch (err) {
      console.error('Unexpected error getting user role:', err);
      setUserRole('USER');
    }
  }, []);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await getUserRole(session.user);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error getting session:', error);
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Wait a bit for the trigger to create the user profile
        if (event === 'SIGNED_IN') {
          setTimeout(() => getUserRole(session.user), 2000);
        } else {
          await getUserRole(session.user);
        }
      } else {
        setUserRole(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [getUserRole]);

  const signInWithGoogle = async () => {
    // Get the current origin dynamically (works for both localhost and production)
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${currentOrigin}/dashboard`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
    
    if (error) throw error;
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
  };

  const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
    // Get the current origin dynamically
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${currentOrigin}/dashboard`,
        data: {
          full_name: displayName || email.split('@')[0],
        }
      }
    });
    
    if (error) throw error;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    session,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logout,
    userRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


