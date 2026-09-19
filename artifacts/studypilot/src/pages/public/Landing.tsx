import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { BookOpen, Sparkles, Target, Zap, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function Landing() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32 lg:pt-36 lg:pb-40">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/[0.08] via-background to-background" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            <span>KI-gestützte Lernroutinen</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-serif text-foreground max-w-4xl mx-auto leading-tight mb-8">
            Verwandle Überforderung in eine <span className="text-primary italic">ruhige tägliche Routine.</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Lade deine Kursmaterialien hoch. Wir erstellen Karteikarten, Übungsprüfungen und einen personalisierten täglichen Lernplan, damit du immer genau weißt, was als Nächstes zu tun ist.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="rounded-full px-8 text-base h-14 shadow-lg hover-elevate w-full sm:w-auto">
              <Link href="/signup">Kostenlos mit dem Lernen beginnen <ChevronRight className="ml-2 w-5 h-5" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="rounded-full px-8 text-base h-14 bg-white/50 backdrop-blur-sm border-border hover:bg-white/80 w-full sm:w-auto">
              <Link href="/signup">Kostenlos starten</Link>
            </Button>
          </div>
          
          <div className="mt-10 flex items-center justify-center gap-6 text-sm text-muted-foreground font-medium">
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-primary" /> Keine Kreditkarte erforderlich</div>
            <div className="hidden sm:flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-primary" /> In 2 Minuten eingerichtet</div>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="py-24 bg-card border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif mb-4">Alles, was du brauchst, um deine Prüfungen zu meistern</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Wir ersetzen ein Dutzend separate Lern-Apps durch einen einzigen schönen, fokussierten Arbeitsbereich.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Target}
              title="Personalisierte Pläne"
              desc="Nenne uns dein Prüfungsdatum und lade deinen Lehrplan hoch. Wir erstellen einen detaillierten Tagesplan, was genau du lernen musst."
            />
            <FeatureCard 
              icon={Zap}
              title="Sofortige Karteikarten"
              desc="Unsere KI liest deine Vorlesungsfolien und generiert automatisch Spaced-Repetition-Karteikarten für die schwierigsten Konzepte."
            />
            <FeatureCard 
              icon={BookOpen}
              title="Übungsprüfungen"
              desc="Simuliere die echte Testumgebung mit KI-generierten Quizfragen und Essay-Fragen, die auf deinen spezifischen Kurs zugeschnitten sind."
            />
          </div>
        </div>
      </section>
      
      {/* UI Preview Section */}
      <section className="py-24 md:py-32 overflow-hidden bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-border/50 bg-card/50 shadow-2xl p-2 md:p-4 backdrop-blur-xl">
            <div className="rounded-xl overflow-hidden border border-border/50 bg-background aspect-video relative flex items-center justify-center">
              {/* Fake UI mockup */}
              <div className="absolute inset-0 flex">
                <div className="w-64 bg-card border-r border-border p-4 hidden md:block">
                  <div className="h-6 w-32 bg-primary/10 rounded mb-8"></div>
                  <div className="space-y-3">
                    <div className="h-8 bg-muted rounded"></div>
                    <div className="h-8 bg-muted rounded"></div>
                    <div className="h-8 bg-primary/10 rounded"></div>
                    <div className="h-8 bg-muted rounded"></div>
                  </div>
                </div>
                <div className="flex-1 p-8">
                  <div className="h-10 w-64 bg-muted rounded mb-8"></div>
                  <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="h-24 bg-card border border-border rounded-xl"></div>
                    <div className="h-24 bg-card border border-border rounded-xl"></div>
                    <div className="h-24 bg-card border border-border rounded-xl"></div>
                  </div>
                  <div className="h-64 bg-card border border-border rounded-xl mb-6"></div>
                </div>
              </div>
              
              <div className="relative z-10 text-center bg-background/80 p-8 rounded-2xl backdrop-blur-md border border-border shadow-lg">
                <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-serif mb-2">Bereit, einen Blick hineinzuwerfen?</h3>
                <p className="text-muted-foreground mb-6 max-w-sm">Erlebe den ruhigen, fokussierten Arbeitsbereich, der dir zum Erfolg verhelfen soll.</p>
                <Button asChild>
                  <Link href="/signup">Lernbereich erstellen</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="bg-background p-8 rounded-2xl border border-border/60 hover-elevate transition-all duration-300">
      <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}
