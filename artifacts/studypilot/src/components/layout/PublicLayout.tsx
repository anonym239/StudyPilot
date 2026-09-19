import React from 'react';
import { Link } from 'wouter';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  const user = getCurrentUser();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary/20 selection:text-primary">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="bg-primary p-1.5 rounded-lg text-primary-foreground shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="font-serif text-2xl font-medium tracking-tight text-foreground">StudyPilot</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Preise</Link>
            <Link href="/terms" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Methodik</Link>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <Button asChild variant="default" className="rounded-full px-6 shadow-sm hover-elevate">
                <Link href="/app">Zum Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" className="hidden sm:inline-flex">
                  <Link href="/login">Anmelden</Link>
                </Button>
                <Button asChild variant="default" className="rounded-full px-6 shadow-sm hover-elevate">
                  <Link href="/signup">Loslegen</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-primary" />
                <span className="font-serif text-xl font-medium text-foreground">StudyPilot</span>
              </Link>
              <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
                Verwandle dein Kursmaterial in eine ruhige, fokussierte tägliche Lernroutine. Entwickelt für Studierende, die intelligenter, nicht härter lernen wollen.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Produkt</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="/pricing" className="hover:text-foreground transition-colors">Preise</Link></li>
                <li><Link href="/login" className="hover:text-foreground transition-colors">Anmelden</Link></li>
                <li><Link href="/signup" className="hover:text-foreground transition-colors">Registrieren</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Rechtliches</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground transition-colors">Datenschutzerklärung</Link></li>
                <li><Link href="/terms" className="hover:text-foreground transition-colors">Nutzungsbedingungen</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} StudyPilot Inc. Alle Rechte vorbehalten.
          </div>
        </div>
      </footer>
    </div>
  );
}
