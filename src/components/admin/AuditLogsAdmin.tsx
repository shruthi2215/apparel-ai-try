import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";

interface Log {
  id: string; actor_email: string | null; action: string;
  target_type: string | null; target_id: string | null;
  metadata: Record<string, unknown>; created_at: string; merchant_id: string | null;
}

export default function AuditLogsAdmin() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(500)
      .then(({ data }) => setLogs((data ?? []) as Log[]));
  }, []);

  const filtered = useMemo(() => logs.filter((l) => {
    const q = search.toLowerCase();
    return !q || l.action.toLowerCase().includes(q) || (l.actor_email || "").toLowerCase().includes(q);
  }), [logs, search]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search actions or actor…" className="pl-9" />
      </div>
      <Card className="p-0 overflow-hidden border-border/60 bg-card/70 backdrop-blur-xl">
        <Table>
          <TableHeader>
            <TableRow><TableHead>Action</TableHead><TableHead>Actor</TableHead><TableHead>Target</TableHead><TableHead>Details</TableHead><TableHead>When</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((l) => (
              <TableRow key={l.id}>
                <TableCell><Badge variant="outline" className="font-mono text-xs">{l.action}</Badge></TableCell>
                <TableCell className="text-sm">{l.actor_email || "system"}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{l.target_type || "—"}</TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-[240px] truncate">{Object.keys(l.metadata || {}).length ? JSON.stringify(l.metadata) : "—"}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString()}</TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No audit events yet.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}