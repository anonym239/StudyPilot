import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Sparkles } from 'lucide-react';
import { cancelSubscription, changePlan, getBillingState, openBillingPortal, startCheckout, type BillingState, type Plan } from '@/lib/billing';
import { useToast } from '@/hooks/use-toast';

const LABELS: Record<Plan, string> = { free: "Kostenlos", student: "Studierenden-Plan", pro: "Pro-Plan" };

export default function Subscription() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["billing"], queryFn: getBillingState, staleTime: 30_000 });
  const update = useMutation({
    mutationFn: (action: () => Promise<BillingState>) => action(),
    onSuccess: (state) => queryClient.setQueryData(["billing"], state),
    onError: (error) => toast({ title: "Änderung fehlgeschlagen", description: error instanceof Error ? error.message : "Bitte versuche es erneut.", variant: "destructive" }),
  });

  if (query.isLoading) return <div className="max-w-3xl mx-auto">Abonnement wird geladen…</div>;
  if (query.isError || !query.data) {
    return <div className="max-w-3xl mx-auto space-y-4"><h1 className="text-3xl font-serif">Abonnement</h1><p className="text-destructive">{query.error instanceof Error ? query.error.message : "Abonnement konnte nicht geladen werden."}</p><Button onClick={() => query.refetch()}>Erneut versuchen</Button></div>;
  }

  const state = query.data;
  const date = state.currentPeriodEnd ? new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(new Date(state.currentPeriodEnd)) : null;
  const amount = new Intl.NumberFormat("de-DE", { style: "currency", currency: state.currency.toUpperCase() }).format(state.amount / 100);

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div><h1 className="text-3xl font-serif text-foreground mb-2">Abonnement</h1><p className="text-muted-foreground">Verwalte deine Abrechnung und Planlimits.</p></div>
      <Card className="border-primary/20 shadow-md relative overflow-hidden bg-card">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><Sparkles className="w-32 h-32 text-primary" /></div>
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center gap-2">{LABELS[state.plan]} <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full uppercase tracking-wider font-bold">{state.status}</span></CardTitle>
          <CardDescription>{date ? `${state.cancelAtPeriodEnd ? "Endet" : "Nächste Abrechnung"} am ${date}` : "Kein kostenpflichtiges Abo aktiv"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-baseline gap-2"><span className="text-4xl font-serif font-medium">{state.plan === "free" ? "0 €" : amount}</span><span className="text-muted-foreground">/Monat</span></div>
          <div className="space-y-3 pt-4 border-t border-border text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Aktive Kurse</span><span>{state.entitlements.maxCourses ?? "Unbegrenzt"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">KI-Generierungen</span><span>{state.entitlements.monthlyAiGenerations ?? "Unbegrenzt"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Prüfungssimulation & Export</span><span>{state.entitlements.examSimulation ? "Enthalten" : "Nicht enthalten"}</span></div>
          </div>
          <div className="pt-6 flex flex-wrap gap-3">
            {state.plan === "free" && <><Button onClick={() => startCheckout("student")}>Student wählen</Button><Button variant="outline" onClick={() => startCheckout("pro")}>Pro wählen</Button></>}
            {state.plan === "student" && <Button disabled={update.isPending} onClick={() => update.mutate(() => changePlan("pro"))}>Auf Pro upgraden</Button>}
            {state.plan === "pro" && <Button variant="outline" disabled={update.isPending} onClick={() => update.mutate(() => changePlan("student"))}>Auf Student wechseln</Button>}
            {state.plan !== "free" && !state.cancelAtPeriodEnd && <Button variant="destructive" disabled={update.isPending} onClick={() => update.mutate(cancelSubscription)}>Zum Laufzeitende kündigen</Button>}
          </div>
        </CardContent>
      </Card>
      <Card className="border-border bg-card/50 border-dashed">
        <CardContent className="p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4"><div className="p-3 bg-secondary rounded-xl"><CreditCard className="w-6 h-6" /></div><div><p className="font-medium">Zahlungsdaten & Rechnungen</p><p className="text-sm text-muted-foreground">Sicher im Stripe Billing Portal verwalten</p></div></div>
          <Button variant="ghost" disabled={state.plan === "free"} onClick={() => openBillingPortal()}>Abrechnung verwalten</Button>
        </CardContent>
      </Card>
    </div>
  );
}