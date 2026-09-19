import React from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen } from 'lucide-react';
import { signIn } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");
    try {
      await signIn(email, password);
    } catch (error) {
      toast({ title: "Anmeldung fehlgeschlagen", description: error instanceof Error ? error.message : "Bitte prüfe deine Angaben.", variant: "destructive" });
      return;
    }
    toast({
      title: "Willkommen zurück",
      description: "Du bist erfolgreich angemeldet."
    });
    setLocation('/app');
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-background">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="bg-primary/10 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-6">
          <BookOpen className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-serif font-medium text-foreground tracking-tight">Willkommen zurück</h2>
        <p className="mt-3 text-muted-foreground">
          Noch kein Konto? <Link href="/signup" className="text-primary hover:underline font-medium">Kostenlos registrieren</Link>
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[400px]">
        <div className="bg-card py-8 px-4 shadow-xl shadow-primary/5 sm:rounded-3xl sm:px-10 border border-border/60">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <Label htmlFor="email">E-Mail-Adresse</Label>
              <div className="mt-2">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@hochschule.de"
                  required
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
                  autoComplete="current-password"
                  placeholder="Dein Passwort"
                  required
                  className="bg-background"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded border-input text-primary focus:ring-primary bg-background"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-foreground">
                  Angemeldet bleiben
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-primary hover:text-primary/80">
                  Passwort vergessen?
                </a>
              </div>
            </div>

            <div>
              <Button type="submit" className="w-full rounded-xl h-11 text-base shadow-sm">
                Anmelden
              </Button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
