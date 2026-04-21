import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

export type UserPlan = Database["public"]["Enums"]["user_plan"];

const PLAN_RANK: Record<UserPlan, number> = { basico: 1, pro: 2, premium: 3 };

export function planAllows(userPlan: UserPlan | null, required: UserPlan | null) {
  if (!required) return true;
  if (!userPlan) return false;
  return PLAN_RANK[userPlan] >= PLAN_RANK[required];
}

export function useUserPlan() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<UserPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    (async () => {
      if (!user) {
        setPlan(null);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("user_plans")
        .select("plan")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!cancel) {
        setPlan((data?.plan as UserPlan) ?? null);
        setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [user]);

  return { plan, loading };
}
