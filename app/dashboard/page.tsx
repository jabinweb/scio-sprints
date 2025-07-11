"use client";

import { useAuth } from "@/contexts/AuthContext";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

export default function Dashboard() {
  const { user} = useAuth();


  if (!user) {
    return <div>Please log in to access the dashboard.</div>;
  }


  return <DashboardContent />;
}
