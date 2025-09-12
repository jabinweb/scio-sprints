/**
 * Admin Authentication Utilities
 * 
 * Provides server-side admin verification for API routes
 * 
 * @author Scio Sprints Team
 * @version 1.0.0
 */

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Verify admin authentication from request headers
 * @param request - NextRequest object containing authorization header
 * @returns Promise<boolean> - True if user is authenticated admin
 */
export async function verifyAdminAuth(request: NextRequest): Promise<boolean> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return false;
    }

    // Check if user has admin role in database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || userData?.role !== 'ADMIN') {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Admin auth verification failed:', error);
    return false;
  }
}

/**
 * Extract user ID from authenticated request
 * @param request - NextRequest object containing authorization header
 * @returns Promise<string | null> - User ID if authenticated, null otherwise
 */
export async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.replace('Bearer ', '');
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return null;
    }

    return user.id;
  } catch (error) {
    console.error('User ID extraction failed:', error);
    return null;
  }
}

/**
 * Verify cron secret for automated API calls
 * @param secret - Secret from request parameters
 * @returns boolean - True if valid cron secret
 */
export function verifyCronSecret(secret: string | null): boolean {
  if (!process.env.CRON_SECRET) {
    console.error('CRON_SECRET environment variable not configured');
    return false;
  }
  
  return secret === process.env.CRON_SECRET;
}

/**
 * Combined admin or cron authentication check
 * @param request - NextRequest object
 * @param cronSecret - Optional cron secret from query parameters
 * @returns Promise<{ isAuthorized: boolean, isAdmin: boolean, isCron: boolean }>
 */
export async function verifyAdminOrCron(
  request: NextRequest, 
  cronSecret?: string | null
): Promise<{ isAuthorized: boolean, isAdmin: boolean, isCron: boolean }> {
  // First check cron secret
  if (cronSecret && verifyCronSecret(cronSecret)) {
    return { isAuthorized: true, isAdmin: false, isCron: true };
  }
  
  // Then check admin authentication
  const isAdmin = await verifyAdminAuth(request);
  return { isAuthorized: isAdmin, isAdmin, isCron: false };
}