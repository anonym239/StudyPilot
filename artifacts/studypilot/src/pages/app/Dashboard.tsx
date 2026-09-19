import React from 'react';
import { useGetDashboard } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Flame, Clock, CheckCircle2, ChevronRight, BookOpen, AlertCircle, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function Dashboard() {
  const { data: dashboard, isLoading, isError } = useGetDashboard();
  if (isLoading) return <div className="py-20 text-center text-muted-foreground">Übersicht wird geladen…</div>;
  if (isError || !dashboard) return <div className="py-20 text-center text-destructive">Die Übersicht konnte nicht geladen werden.</div>;

  const activeTasks = dashboard.tasks.filter(t => !t.completed);
  const completedTasks = dashboard.tasks.filter(t => t.completed);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-foreground mb-2">Guten Morgen, {dashboard.user.name.split(' ')[0]}</h1>
          <p className="text-muted-foreground">Du hast heute {activeTasks.length} Aufgaben geplant. Lass uns einen guten Tag daraus machen.</p>
        </div>
        <Button asChild className="rounded-full shrink-0">
          <Link href="/app/plan">Gesamten Plan ansehen</Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Flame} label="Tage in Folge" value={dashboard.streak.toString()} suffix="Tage" color="text-accent" />
        <StatCard icon={Clock} label="Heute" value={dashboard.todayMinutes.toString()} suffix="Min" color="text-primary" />
        <StatCard icon={Clock} label="Diese Woche" value={dashboard.weeklyMinutes.toString()} suffix="Min" color="text-primary" />
        <StatCard icon={CheckCircle2} label="Abgeschlossen" value={dashboard.completedTasks.toString()} suffix="Aufgaben" color="text-primary" />
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Left Column: Today's Plan */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-medium">Als Nächstes</h2>
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
              <Link href="/app/plan">Alle ansehen <ChevronRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>

          <div className="space-y-3">
            {activeTasks.length > 0 ? (
              activeTasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))
            ) : (
              <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-card/50">
                <Sparkles className="w-8 h-8 text-primary mx-auto mb-3 opacity-50" />
                <h3 className="font-medium mb-1">Alles erledigt!</h3>
                <p className="text-sm text-muted-foreground">Du hast deinen Plan für heute beendet.</p>
              </div>
            )}

            {completedTasks.length > 0 && (
              <div className="pt-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">Heute abgeschlossen</h3>
                {completedTasks.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Upcoming Exams */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-medium">Anstehende Prüfungen</h2>
          </div>

          <div className="space-y-4">
            {dashboard.exams.length > 0 ? (
              dashboard.exams.map(exam => (
                <Card key={exam.id} className="border-border shadow-sm">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start mb-1">
                      <div className="bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-full">
                        {exam.course}
                      </div>
                      <div className="flex items-center text-accent text-sm font-medium">
                        <AlertCircle className="w-3.5 h-3.5 mr-1" />
                        {exam.daysLeft} Tage verbleibend
                      </div>
                    </div>
                    <CardTitle className="text-base">{exam.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                      <span>Bereitschaft</span>
                      <span>{exam.progress}%</span>
                    </div>
                    <Progress value={exam.progress} className="h-1.5" />
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-border shadow-sm border-dashed">
                <CardContent className="p-6 text-center text-muted-foreground text-sm">
                  Keine anstehenden Prüfungen erfasst.
                </CardContent>
              </Card>
            )}

            <Button asChild variant="outline" className="w-full bg-card">
              <Link href="/app/courses">Kurse verwalten</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, suffix, color }: { icon: any, label: string, value: string, suffix: string, color: string }) {
  return (
    <Card className="border-border shadow-sm bg-card overflow-hidden">
      <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full relative">
        <Icon className={`w-5 h-5 ${color} mb-3 opacity-80`} />
        <div>
          <p className="text-2xl font-serif font-medium leading-none mb-1 text-foreground">{value} <span className="text-sm font-sans font-normal text-muted-foreground">{suffix}</span></p>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        </div>
        <div className="absolute right-0 bottom-0 p-4 opacity-5 pointer-events-none">
          <Icon className="w-16 h-16" />
        </div>
      </CardContent>
    </Card>
  );
}

function TaskCard({ task }: { task: any }) {
  const isCompleted = task.completed;
  
  return (
    <div className={`group flex items-center justify-between p-4 rounded-xl border ${isCompleted ? 'bg-secondary/50 border-transparent opacity-70' : 'bg-card border-border hover:border-primary/30 shadow-sm hover-elevate transition-all'}`}>
      <div className="flex items-start gap-4">
        <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isCompleted ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/30'}`}>
          {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
        </div>
        <div>
          <h4 className={`font-medium text-sm sm:text-base ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{task.title}</h4>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-muted-foreground font-medium">{task.subject}</span>
            <span className="text-xs text-muted-foreground flex items-center"><Clock className="w-3 h-3 mr-1" /> {task.duration}m</span>
          </div>
        </div>
      </div>
      {!isCompleted && (
        <Button variant="ghost" size="icon" asChild className="opacity-0 group-hover:opacity-100 transition-opacity">
          <Link href={task.type === 'flashcard' ? '/app/flashcards' : '/app/quiz'}>
            <ChevronRight className="w-5 h-5" />
          </Link>
        </Button>
      )}
    </div>
  );
}
