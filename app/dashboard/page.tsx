"use client";

import { useSession } from 'next-auth/react';
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const loading = status === 'loading';

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    return <div>Please log in to access the dashboard.</div>;
  }

  return <DashboardContent />;
}
