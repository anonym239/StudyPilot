import React from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen } from 'lucide-react';
import { signUp } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { startCheckout, type Plan } from '@/lib/billing';

export default function Signup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = String(formData.get('name') ?? "").trim();
    const email = String(formData.get('email') ?? "").trim().toLowerCase();
    
    const password = String(formData.get("password") ?? "");
    try {
      const session = await signUp(name, email, password);
      if (!session) {
        toast({ title: "Bestätige deine E-Mail", description: "Wir haben dir einen Bestätigungslink gesendet." });
        setLocation("/login");
        return;
      }
    } catch (error) {
      toast({ title: "Registrierung fehlgeschlagen", description: error instanceof Error ? error.message : "Bitte versuche es erneut.", variant: "destructive" });
      return;
    }
    toast({
      title: "Konto erstellt",
      description: "Willkommen in deinem neuen Lern-Arbeitsbereich."
    });
    const plan = new URLSearchParams(window.location.search).get("plan") as Plan | null;
    if (plan === "student" || plan === "pro") {
      try {
        await startCheckout(plan);
        return;
      } catch (error) {
        toast({ title: "Checkout nicht verfügbar", description: error instanceof Error ? error.message : "Bitte versuche es später erneut.", variant: "destructive" });
      }
    }
    setLocation('/app');
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-background">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="bg-primary/10 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-6">
          <BookOpen className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-serif font-medium text-foreground tracking-tight">Konto erstellen</h2>
        <p className="mt-3 text-muted-foreground">
          Bereits ein Konto? <Link href="/login" className="text-primary hover:underline font-medium">Anmelden</Link>
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[400px]">
        <div className="bg-card py-8 px-4 shadow-xl shadow-primary/5 sm:rounded-3xl sm:px-10 border border-border/60">
          <form className="space-y-6" onSubmit={handleSignup}>
            <div>
              <Label htmlFor="name">Vollständiger Name</Label>
              <div className="mt-2">
                <Input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder="z.B. Alex Johnson"
                  className="bg-background"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">E-Mail-Adresse</Label>
              <div className="mt-2">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="du@universitaet.de"
                  className="bg-background"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Passwort</Label>
              <div className="mt-2">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="bg-background"
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Muss mindestens 8 Zeichen lang sein.</p>
            </div>

            <div>
              <Button type="submit" className="w-full rounded-xl h-11 text-base shadow-sm">
                Konto erstellen
              </Button>
            </div>
            
            <p className="text-xs text-center text-muted-foreground">
              Mit der Erstellung eines Kontos stimmst du unseren <Link href="/terms" className="underline">Nutzungsbedingungen</Link> und <Link href="/privacy" className="underline">Datenschutzerklärung</Link> zu.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
