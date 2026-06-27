import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { Check, Loader2, Sparkles } from "lucide-react";

interface Plan {
  id: string; name: string; slug: string; price_cents: number; interval: string;
  monthly_quota: number; rate_limit_per_min: number; features: string[];
}
interface Invoice { id: string; amount_cents: number; status: string; created_at: string; }

export default function BillingTab({ merchantId, currentPlanId }: { merchantId: string; currentPlanId: string | null }) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [buying, setBuying] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("subscription_plans").select("*").eq("is_active", true).order("sort_order")
      .then(({ data }) => setPlans((data ?? []) as Plan[]));
    supabase.from("invoices").select("id, amount_cents, status, created_at").eq("merchant_id", merchantId)
      .order("created_at", { ascending: false }).limit(20)
      .then(({ data }) => setInvoices((data ?? []) as Invoice[]));
  }, [merchantId]);

  const buy = async (plan: Plan) => {
    setBuying(plan.slug);
    const { data, error } = await supabase.functions.invoke("merchant-checkout", {
      body: { merchantId, planSlug: plan.slug },
    });
    setBuying(null);
    if (error) { toast.error(error.message); return; }
    if (data?.checkoutUrl) { window.location.href = data.checkoutUrl; return; }
    if (data?.activated) { toast.success(`${plan.name} plan activated`); window.location.reload(); return; }
    if (data?.billingPending) { toast.info(data.message); return; }
    toast.error(data?.error || "Could not start checkout");
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        {plans.map((p) => {
          const current = p.id === currentPlanId;
          return (
            <Card key={p.id} className={`p-6 border bg-card/70 backdrop-blur-xl relative ${current ? "border-primary shadow-lg shadow-primary/10" : "border-border/60"}`}>
              {current && <Badge className="absolute top-4 right-4">Current</Badge>}
              <h3 className="font-bold text-xl flex items-center gap-2">{p.name}{p.slug === "growth" && <Sparkles className="w-4 h-4 text-primary" />}</h3>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold">${(p.price_cents / 100).toFixed(0)}</span>
                <span className="text-sm text-muted-foreground">/{p.interval}</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-2 mt-4 mb-6">
                <li className="flex gap-2"><Check className="w-4 h-4 text-primary shrink-0" />{p.monthly_quota.toLocaleString()} try-ons / mo</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-primary shrink-0" />{p.rate_limit_per_min} requests / min</li>
                {(p.features || []).map((f) => <li key={f} className="flex gap-2"><Check className="w-4 h-4 text-primary shrink-0" />{f}</li>)}
              </ul>
              <Button className="w-full" variant={current ? "outline" : "default"} disabled={current || buying === p.slug} onClick={() => buy(p)}>
                {buying === p.slug ? <Loader2 className="w-4 h-4 animate-spin" /> : current ? "Active plan" : p.price_cents === 0 ? "Switch to Free" : "Buy Now"}
              </Button>
            </Card>
          );
        })}
      </div>

      <Card className="p-5 border-border/60 bg-card/70 backdrop-blur-xl">
        <h3 className="font-semibold text-sm mb-3">Billing history</h3>
        {invoices.length === 0 ? (
          <p className="text-sm text-muted-foreground">No invoices yet.</p>
        ) : (
          <div className="space-y-2">
            {invoices.map((i) => (
              <div key={i.id} className="flex items-center justify-between text-sm py-2 border-b border-border/40 last:border-0">
                <span className="text-muted-foreground">{new Date(i.created_at).toLocaleDateString()}</span>
                <span className="font-medium">${(i.amount_cents / 100).toFixed(2)}</span>
                <Badge variant={i.status === "paid" ? "default" : "secondary"} className="capitalize">{i.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}