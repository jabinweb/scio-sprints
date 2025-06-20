import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface DatabaseSubscription {
  id: string;
  status: string;
  amount?: number;
  planType: string;
  startDate: string;
  endDate?: string;
  created_at: string;
  userId: string;
}

interface DatabasePayment {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  userId: string;
}

interface DatabaseUser {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
  last_login_at: string | null;
  role: string;
  is_active: boolean;
}

export async function GET() {
  try {
    // Get ALL users first
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (usersError) throw usersError;

    // Get all subscriptions separately using snake_case column names (actual database columns)
    const { data: allSubscriptions, error: subscriptionsError } = await supabase
      .from('subscriptions')
      .select(`
        id,
        status,
        amount,
        planType,
        startDate,
        endDate,
        created_at,
        userId
      `);

    if (subscriptionsError) throw subscriptionsError;

    // Get all payments separately using snake_case column names
    const { data: allPayments, error: paymentsError } = await supabase
      .from('payments')
      .select(`
        id,
        amount,
        status,
        created_at,
        userId
      `);

    if (paymentsError) throw paymentsError;

    // Transform data to match expected format
    const usersWithSubscriptions = (allUsers || []).map((user: DatabaseUser) => {
      // Find user's subscriptions
      const userSubscriptions = (allSubscriptions || []).filter((sub: DatabaseSubscription) => sub.userId === user.id);
      const activeSubscription = userSubscriptions.find((sub: DatabaseSubscription) => sub.status === 'ACTIVE');
      
      // Find user's payments
      const userPayments = (allPayments || []).filter((payment: DatabasePayment) => payment.userId === user.id);
      
      return {
        uid: user.id,
        email: user.email,
        displayName: user.display_name,
        creationTime: user.created_at,
        lastSignInTime: user.last_login_at,
        subscription: activeSubscription ? {
          id: activeSubscription.id,
          status: activeSubscription.status,
          amount: activeSubscription.amount,
          planType: activeSubscription.planType,
          startDate: activeSubscription.startDate,
          endDate: activeSubscription.endDate,
          created_at: activeSubscription.created_at
        } : null,
        hasActiveSubscription: !!activeSubscription,
        totalPayments: userPayments.length,
        totalAmountPaid: userPayments.reduce((sum: number, payment: DatabasePayment) => 
          payment.status === 'COMPLETED' ? sum + payment.amount : sum, 0) || 0
      };
    });

    return NextResponse.json(usersWithSubscriptions);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Delete user and cascade will handle related records
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId, role, isActive } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const updateData: { role?: string; is_active?: boolean; updated_at?: string } = {};
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.is_active = isActive;
    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

