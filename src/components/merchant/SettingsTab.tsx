import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { Save } from "lucide-react";

interface Props {
  merchant: { id: string; name: string; website_url: string | null; contact_email: string | null };
  onSaved: () => void;
}

export default function SettingsTab({ merchant, onSaved }: Props) {
  const [name, setName] = useState(merchant.name);
  const [site, setSite] = useState(merchant.website_url || "");
  const [email, setEmail] = useState(merchant.contact_email || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim()) { toast.error("Business name is required"); return; }
    setSaving(true);
    const { error } = await supabase.from("merchants").update({
      name: name.trim(), website_url: site.trim() || null, contact_email: email.trim() || null,
    }).eq("id", merchant.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Settings saved");
    onSaved();
  };

  return (
    <Card className="p-6 border-border/60 bg-card/70 backdrop-blur-xl max-w-xl space-y-4">
      <h3 className="font-semibold text-sm">Business settings</h3>
      <div><label className="text-sm font-medium">Business name</label><Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" /></div>
      <div><label className="text-sm font-medium">Website URL</label><Input value={site} onChange={(e) => setSite(e.target.value)} placeholder="https://store.com" className="mt-1" /></div>
      <div><label className="text-sm font-medium">Billing contact email</label><Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="billing@store.com" type="email" className="mt-1" /></div>
      <Button onClick={save} disabled={saving}><Save className="w-4 h-4 mr-1" />{saving ? "Saving…" : "Save changes"}</Button>
    </Card>
  );
}