import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Check, Terminal, KeyRound, Webhook, AlertTriangle, Gauge, Package, Rocket, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

const BASE = typeof window !== "undefined" ? window.location.origin : "";
const API = "https://vonppkdllfzztpibtewy.supabase.co/functions/v1/tryon-api";

function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative group">
      <pre className="bg-muted/60 border border-border/60 rounded-lg p-4 text-xs overflow-x-auto"><code>{code}</code></pre>
      <Button size="icon" variant="ghost" className="absolute top-2 right-2 opacity-70" onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </Button>
    </div>
  );
}

function Section({ id, icon: Icon, title, children }: any) {
  return (
    <section id={id} className="scroll-mt-24 space-y-3">
      <h2 className="text-xl font-bold flex items-center gap-2"><Icon className="w-5 h-5 text-primary" />{title}</h2>
      {children}
    </section>
  );
}

export default function ApiDocs() {
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  const nav = [
    ["auth", "Authentication"], ["endpoint", "Try-On Endpoint"], ["sdk", "JavaScript SDK"],
    ["responses", "Responses"], ["errors", "Error Codes"], ["rate", "Rate Limits"],
    ["webhooks", "Webhooks"], ["categories", "Categories"],
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-16">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
          <div>
            <Badge className="mb-2">API v1</Badge>
            <h1 className="text-3xl font-bold">Tryvior API & SDK</h1>
            <p className="text-muted-foreground">Add AI virtual try-on to any fashion store. REST API + drop-in widget.</p>
          </div>
          {isSuperAdmin ? (
            <Button onClick={() => navigate("/super-admin")}>
              <ShieldCheck className="w-4 h-4 mr-1" />Manage merchants & keys
            </Button>
          ) : (
            <Button onClick={() => navigate("/merchant")}>
              <KeyRound className="w-4 h-4 mr-1" />Get API key
            </Button>
          )}
        </div>

        {isSuperAdmin && (
          <Card className="mb-8 p-4 border-primary/30 bg-primary/5 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold">You're viewing this as a developer (Super Admin).</p>
              <p className="text-muted-foreground">
                You don't generate keys for yourself here. Go to the{" "}
                <button onClick={() => navigate("/super-admin")} className="text-primary underline underline-offset-2">Super Admin → Merchants</button>{" "}
                tab to approve merchants, issue/revoke their API keys, adjust plans & rate limits, and suspend or reactivate access based on their subscription.
              </p>
            </div>
          </Card>
        )}

        <div className="grid lg:grid-cols-[200px_1fr] gap-8">
          <nav className="hidden lg:block sticky top-24 self-start space-y-1 text-sm">
            {nav.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="block px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60">{label}</a>
            ))}
          </nav>

          <div className="space-y-10 min-w-0">
            <Section id="auth" icon={KeyRound} title="Authentication">
              <p className="text-sm text-muted-foreground">All requests are authenticated with your secret API key, generated in the Merchant Dashboard. Send it in the <code>x-api-key</code> header. Never expose it in client-side code on untrusted pages — for browser use, the SDK proxies requests.</p>
              <CodeBlock code={`x-api-key: tk_live_xxxxxxxxxxxxxxxxxxxxxxxx`} />
            </Section>

            <Section id="endpoint" icon={Terminal} title="Try-On Endpoint">
              <p className="text-sm"><Badge variant="secondary" className="mr-2">POST</Badge><code className="text-xs">{API}</code></p>
              <p className="text-sm text-muted-foreground">Generates a realistic try-on by fitting the product garment onto the user's photo. The garment is preserved exactly — color, pattern, embroidery, logos, neckline, sleeves and fit are never redesigned.</p>
              <h4 className="font-semibold text-sm mt-3">Request body (JSON)</h4>
              <CodeBlock lang="json" code={`{
  "userImage": "data:image/jpeg;base64,...",   // required — user photo (base64 or data URL)
  "productImage": "https://store.com/dress.jpg", // required — product image URL or data URL
  "productId": "SKU-123",                        // optional
  "productName": "Anarkali Kurti",               // optional
  "productCategory": "kurti",                    // optional
  "selectedColor": "maroon",                     // optional
  "merchantId": "merchant001",                   // optional
  "sessionId": "abc-123",                        // optional
  "dontSave": true                               // optional — don't retain the image
}`} />
              <h4 className="font-semibold text-sm mt-3">cURL example</h4>
              <CodeBlock code={`curl -X POST '${API}' \\
  -H 'x-api-key: YOUR_API_KEY' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "userImage": "data:image/jpeg;base64,...",
    "productImage": "https://store.com/dress.jpg",
    "productId": "SKU-123",
    "productName": "Anarkali Kurti"
  }'`} />
            </Section>

            <Section id="sdk" icon={Rocket} title="JavaScript SDK">
              <p className="text-sm text-muted-foreground">The fastest way to integrate. Customers never leave your site — the try-on opens in an overlay popup with upload, camera capture, progress, result, download and share.</p>
              <CodeBlock code={`<script src="${BASE}/sdk/tryonme.js"></script>
<script>
  TryOnMe.init({
    apiKey: "YOUR_API_KEY",
    merchantId: "merchant001",
    buttonText: "Try On"      // optional
  });
</script>`} />
              <p className="text-sm text-muted-foreground mt-2">Then tag any product image. A "Try On" button overlays it automatically (even for products added dynamically):</p>
              <CodeBlock code={`<img src="dress.jpg" data-tryon
     data-product-id="SKU-123"
     data-product-name="Anarkali Kurti"
     data-product-category="kurti" />`} />
              <p className="text-sm text-muted-foreground mt-2">Open the popup programmatically for full control:</p>
              <CodeBlock code={`TryOnMe.open({
  image: "https://store.com/dress.jpg",
  id: "SKU-123",
  name: "Anarkali Kurti",
  category: "kurti"
});`} />
            </Section>

            <Section id="responses" icon={Package} title="Responses">
              <h4 className="font-semibold text-sm">200 — Success</h4>
              <CodeBlock lang="json" code={`{
  "status": "success",
  "requestId": "a1b2c3...",
  "sessionId": "abc-123",
  "imageUrl": "data:image/png;base64,...",
  "processingTimeMs": 14230
}`} />
              <h4 className="font-semibold text-sm mt-3">4xx / 5xx — Failure</h4>
              <CodeBlock lang="json" code={`{
  "status": "failed",
  "requestId": "a1b2c3...",
  "error": "Invalid or revoked API key."
}`} />
            </Section>

            <Section id="errors" icon={AlertTriangle} title="Error Codes">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-border/60 rounded-lg overflow-hidden">
                  <thead className="bg-muted/60"><tr><th className="text-left p-2">Status</th><th className="text-left p-2">Meaning</th></tr></thead>
                  <tbody>
                    {[
                      ["400", "Bad request — missing userImage or productImage"],
                      ["401", "Missing, invalid, or revoked API key"],
                      ["403", "Merchant suspended or not active"],
                      ["422", "Validation failed — could not produce an accurate try-on"],
                      ["429", "Rate limit exceeded (30 req/min)"],
                      ["500", "Internal error during generation"],
                      ["502", "AI gateway error"],
                    ].map(([c, m]) => <tr key={c} className="border-t border-border/60"><td className="p-2 font-mono">{c}</td><td className="p-2 text-muted-foreground">{m}</td></tr>)}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section id="rate" icon={Gauge} title="Rate Limits">
              <p className="text-sm text-muted-foreground">Default plan: <b>30 requests/minute</b> per API key. Exceeding returns <code>429</code>. Need more throughput? Upgrade your plan or contact us for enterprise limits and async queue processing.</p>
            </Section>

            <Section id="webhooks" icon={Webhook} title="Webhooks">
              <p className="text-sm text-muted-foreground">Configure a webhook URL in your dashboard to receive events. Each delivery is signed with your webhook secret.</p>
              <CodeBlock lang="json" code={`// event: tryon.completed
{
  "event": "tryon.completed",
  "requestId": "a1b2c3...",
  "merchantId": "merchant001",
  "productId": "SKU-123",
  "status": "success",
  "imageUrl": "https://cdn.tryonme.ai/results/a1b2c3.png",
  "timestamp": "2025-01-01T00:00:00Z"
}`} />
            </Section>

            <Section id="categories" icon={Package} title="Supported Categories">
              <div className="flex flex-wrap gap-2">
                {["Sarees", "Kurtis", "Salwars", "Lehengas", "Blouses", "Dresses", "Shirts", "T-Shirts", "Pants", "Jeans", "Jackets", "Kids Wear"].map((c) => <Badge key={c} variant="secondary">{c}</Badge>)}
              </div>
              <p className="text-sm text-muted-foreground mt-3">Roadmap: Jewellery, Shoes, Bags, Watches.</p>
              <p className="text-sm text-muted-foreground mt-1">Future SDKs: React, Next.js, Flutter, Android, iOS · Plugins: Shopify, WooCommerce, Magento, WordPress.</p>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}