"use client";

import { useAuth } from "@/contexts/AuthContext";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

export default function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        <div className="ml-4 text-gray-600">Authenticating...</div>
      </div>
    );
  }

  if (!user) {
    return <div>Please log in to access the dashboard.</div>;
  }

  return <DashboardContent />;
}
