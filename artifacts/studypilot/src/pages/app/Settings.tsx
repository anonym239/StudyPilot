import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { getCurrentUser, setCurrentUser } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const user = getCurrentUser();
  const { toast } = useToast();

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    if (!user) return;
    setCurrentUser({
      name: formData.get('name') as string,
      email: formData.get('email') as string
    });
    toast({ title: 'Einstellungen gespeichert', description: 'Dein Profil wurde aktualisiert.' });
  };

  if (!user) return null;
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-serif text-foreground mb-2">Einstellungen</h1>
        <p className="text-muted-foreground">Verwalte deine Kontoeinstellungen und Benachrichtigungen.</p>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle>Profilinformationen</CardTitle>
          <CardDescription>Aktualisiere deine persönlichen Daten.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Vollständiger Name</Label>
                <Input id="name" name="name" defaultValue={user.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input id="email" name="email" type="email" defaultValue={user.email} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="school">Universität / Schule</Label>
              <Input id="school" name="school" defaultValue="Staatliche Universität" />
            </div>
            <Button type="submit">Änderungen speichern</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle>Lernpräferenzen</CardTitle>
          <CardDescription>Passe an, wie StudyPilot deine Routine plant.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Tägliche Ziel-Erinnerung</Label>
              <p className="text-sm text-muted-foreground">Erhalte eine E-Mail, wenn du bis 18 Uhr nicht gelernt hast.</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Wochenendplanung</Label>
              <p className="text-sm text-muted-foreground">Beziehe Samstag und Sonntag in deine täglichen Lernpläne ein.</p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Karteikarten: Schwerer Modus</Label>
              <p className="text-sm text-muted-foreground">Erfordere das Tippen genauer Antworten anstelle einer mentalen Bewertung.</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/20 shadow-sm">
        <CardHeader>
          <CardTitle className="text-destructive">Gefahrenzone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Sobald du dein Konto gelöscht hast, gibt es kein Zurück mehr. Bitte sei dir sicher.
          </p>
          <Button variant="destructive">Konto löschen</Button>
        </CardContent>
      </Card>
    </div>
  );
}
