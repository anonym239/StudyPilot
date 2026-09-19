import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { BookOpen, LayoutDashboard, CheckSquare, GraduationCap, Calendar, Settings, CreditCard, ChevronLeft, Menu, LogOut, X, BrainCircuit, Library, TrendingUp } from 'lucide-react';
import { getCurrentUser, signOut } from '@/lib/auth';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const user = getCurrentUser();

  const handleLogout = () => {
    signOut();
    setLocation('/');
  };

  const navItems = [
    { label: 'Übersicht', href: '/app', icon: LayoutDashboard },
    { label: 'Meine Kurse', href: '/app/courses', icon: Library },
    { label: 'Tagesplan', href: '/app/plan', icon: CheckSquare },
    { label: 'Karteikarten', href: '/app/flashcards', icon: BrainCircuit },
    { label: 'Prüfungen', href: '/app/exams', icon: GraduationCap },
    { label: 'Fortschritt', href: '/app/progress', icon: TrendingUp },
  ];

  const bottomNavItems = [
    { label: 'Abonnement', href: '/app/subscription', icon: CreditCard },
    { label: 'Einstellungen', href: '/app/settings', icon: Settings },
  ];

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
        <Link href="/app" className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          <span className="font-serif text-xl font-medium text-foreground tracking-tight">StudyPilot</span>
        </Link>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-muted-foreground hover:bg-muted rounded-md transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between md:block">
          <Link href="/app" className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <span className="font-serif text-2xl font-medium text-foreground tracking-tight">StudyPilot</span>
          </Link>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-2 text-muted-foreground hover:bg-muted rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-3 mt-4 px-2">Lernen</div>
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== '/app' && location.startsWith(item.href));
            return (
              <Link 
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 group",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {item.label}
              </Link>
            );
          })}

          <div className="text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-3 mt-8 px-2">Konto</div>
          {bottomNavItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link 
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 group",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border mt-auto">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-primary font-medium text-sm">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
              title="Abmelden"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/[0.03] via-transparent to-transparent pointer-events-none" />
        <div className="flex-1 overflow-y-auto z-10 relative">
          <div className="max-w-5xl mx-auto p-4 md:p-8 pb-20">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
