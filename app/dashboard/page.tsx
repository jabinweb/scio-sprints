"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { PaymentDialog } from "@/components/dashboard/PaymentDialog";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;

    const checkSubscription = async () => {
      try {
        const { data: subscription, error } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("userId", user.id)
          .eq("status", "ACTIVE")
          .gte("endDate", new Date().toISOString())
          .maybeSingle();

        if (error) {
          console.error("Detailed subscription check error:", {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
          });
          setHasSubscription(false);
        } else {
          setHasSubscription(!!subscription);
        }
      } catch (error) {
        console.error("Unexpected error checking subscription:", error);
        setHasSubscription(false);
      }
    };

    checkSubscription();
  }, [user]);

  if (loading || hasSubscription === null) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <div>Please log in to access the dashboard.</div>;
  }

  if (!hasSubscription) {
    return <PaymentDialog defaultOpen />;
  }

  return <DashboardContent />;
}
