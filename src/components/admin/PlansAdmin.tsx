import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/sonner";
import { Check } from "lucide-react";

interface Plan {
  id: string; name: string; slug: string; price_cents: number; interval: string;
  monthly_quota: number; rate_limit_per_min: number; features: string[]; is_active: boolean; sort_order: number;
}

export default function PlansAdmin() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("subscription_plans").select("*").order("sort_order");
    setPlans((data ?? []) as Plan[]);
  };
  useEffect(() => { load(); }, []);

  const update = async (id: string, patch: Partial<Plan>) => {
    setBusy(id);
    const { error } = await supabase.from("subscription_plans").update(patch).eq("id", id);
    setBusy(null);
    if (error) { toast.error(error.message); return; }
    toast.success("Plan updated");
    load();
  };

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {plans.map((p) => (
        <Card key={p.id} className="p-5 border-border/60 bg-card/70 backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">{p.name}</h3>
            <Badge variant={p.is_active ? "default" : "secondary"}>{p.is_active ? "Active" : "Hidden"}</Badge>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">${(p.price_cents / 100).toFixed(0)}</span>
            <span className="text-sm text-muted-foreground">/{p.interval}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">Price (USD)</label>
              <Input type="number" defaultValue={(p.price_cents / 100).toString()}
                onBlur={(e) => { const v = Math.round(Number(e.target.value) * 100); if (v !== p.price_cents) update(p.id, { price_cents: v }); }} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Quota / mo</label>
              <Input type="number" defaultValue={p.monthly_quota}
                onBlur={(e) => { const v = Number(e.target.value); if (v !== p.monthly_quota) update(p.id, { monthly_quota: v }); }} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Rate /min</label>
              <Input type="number" defaultValue={p.rate_limit_per_min}
                onBlur={(e) => { const v = Number(e.target.value); if (v !== p.rate_limit_per_min) update(p.id, { rate_limit_per_min: v }); }} />
            </div>
            <div className="flex items-end gap-2 pb-1">
              <Switch checked={p.is_active} disabled={busy === p.id} onCheckedChange={(v) => update(p.id, { is_active: v })} />
              <span className="text-xs text-muted-foreground">Visible</span>
            </div>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1 pt-1">
            {(p.features || []).map((f) => <li key={f} className="flex gap-1.5"><Check className="w-3.5 h-3.5 text-primary shrink-0" />{f}</li>)}
          </ul>
        </Card>
      ))}
    </div>
  );
}