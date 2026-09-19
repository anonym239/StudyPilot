import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { startCheckout, type Plan } from '@/lib/billing';
import { getAccessToken } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export default function Pricing() {
  const { toast } = useToast();
  const choosePlan = async (plan: Exclude<Plan, "free">) => {
    if (!getAccessToken()) {
      window.location.assign(`${import.meta.env.BASE_URL}signup?plan=${plan}`);
      return;
    }
    try {
      await startCheckout(plan);
    } catch (error) {
      toast({ title: "Checkout nicht verfügbar", description: error instanceof Error ? error.message : "Bitte versuche es erneut.", variant: "destructive" });
    }
  };
  return (
    <div className="min-h-[80vh] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-serif mb-6">Einfache, transparente Preise</h1>
          <p className="text-xl text-muted-foreground">Investiere in deine Bildung mit einem Werkzeug, das dir wirklich Zeit spart.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <PricingCard 
            name="Kostenlos"
            price="0 €"
            desc="Für gelegentliches Lernen"
            features={[
              "2 Aktive Kurse",
              "Einfacher Tagesplan",
              "Manuelle Karteikartenerstellung",
              "Community-Support"
            ]}
            buttonText="Loslegen"
            buttonVariant="outline"
          />
          <PricingCard 
            name="Studierende"
            price="8 €"
            period="/Monat"
            desc="Für ernsthafte Studierende"
            features={[
              "Unbegrenzte Kurse",
              "KI-Karteikartengenerierung",
              "KI-Übungsquizze",
              "Intelligente tägliche Lernpläne",
              "Fortschrittsverfolgung",
              "Prüfungssimulationsmodus"
            ]}
            buttonText="Kostenlose Testversion starten"
            buttonVariant="default"
            popular
            onChoose={() => choosePlan("student")}
          />
          <PricingCard 
            name="Pro"
            price="15 €"
            period="/Monat"
            desc="Für Medizin-, Jura- und Masterstudierende"
            features={[
              "Unbegrenzte Kurse",
              "Erweiterte Aufsatzbewertung",
              "Bevorzugte KI-Generierung",
              "Prüfungssimulationsmodus",
              "Export als PDF/Anki"
            ]}
            buttonText="Auf Pro upgraden"
            buttonVariant="outline"
            onChoose={() => choosePlan("pro")}
          />
        </div>
      </div>
    </div>
  );
}

function PricingCard({ 
  name, 
  price, 
  period = "", 
  desc, 
  features, 
  buttonText, 
  buttonVariant,
  popular = false,
  onChoose,
}: { 
  name: string, price: string, period?: string, desc: string, features: string[], buttonText: string, buttonVariant: "default" | "outline", popular?: boolean, onChoose?: () => void
}) {
  return (
    <div className={`relative p-8 rounded-3xl border flex flex-col bg-card ${popular ? 'border-primary shadow-xl scale-105 z-10' : 'border-border'}`}>
      {popular && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          Am beliebtesten
        </div>
      )}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">{name}</h3>
        <p className="text-sm text-muted-foreground h-10">{desc}</p>
        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-4xl font-serif font-medium">{price}</span>
          <span className="text-muted-foreground">{period}</span>
        </div>
      </div>
      
      <ul className="space-y-4 mb-8 flex-1">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-primary shrink-0" />
            <span className="text-sm text-foreground">{feature}</span>
          </li>
        ))}
      </ul>
      
      {onChoose ? (
        <Button onClick={onChoose} variant={buttonVariant} className="w-full rounded-full h-12 text-base">{buttonText}</Button>
      ) : (
        <Button asChild variant={buttonVariant} className="w-full rounded-full h-12 text-base">
          <Link href="/signup">{buttonText}</Link>
        </Button>
      )}
    </div>
  );
}
