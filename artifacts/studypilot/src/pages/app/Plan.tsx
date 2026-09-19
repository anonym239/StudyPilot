import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, PlayCircle, Lock } from 'lucide-react';
import { Link } from 'wouter';
import { useGetStudyPlan, type StudyPlanItem } from '@/lib/generated-content';

export default function Plan() {
  const { data: generatedPlan, isLoading } = useGetStudyPlan();
  const days = [
    { name: 'Mon', date: '15', active: false, status: 'completed' },
    { name: 'Tue', date: '16', active: false, status: 'completed' },
    { name: 'Wed', date: '17', active: true, status: 'current' },
    { name: 'Thu', date: '18', active: false, status: 'upcoming' },
    { name: 'Fri', date: '19', active: false, status: 'upcoming' },
    { name: 'Sat', date: '20', active: false, status: 'upcoming' },
    { name: 'Sun', date: '21', active: false, status: 'upcoming' },
  ];

  const todayPlan = generatedPlan?.length ? generatedPlan.map((task: StudyPlanItem) => ({
    title: task.title,
    type: task.type ?? "study",
    time: task.duration ? `${task.duration} min` : "—",
    completed: Boolean(task.completed),
    active: !task.completed,
    courseId: task.courseId,
  })) : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-3xl font-serif text-foreground mb-2">Daily Plan</h1>
        <p className="text-muted-foreground">Your AI-generated schedule to hit your exam goals.</p>
      </div>

      {/* Week calendar */}
      <div className="flex justify-between items-center gap-2 overflow-x-auto pb-4">
        {days.map((day, i) => (
          <div key={i} className={`flex flex-col items-center p-3 rounded-2xl min-w-[4rem] border transition-colors ${
            day.active ? 'bg-primary text-primary-foreground border-primary shadow-md scale-105' 
            : day.status === 'completed' ? 'bg-card border-border'
            : 'bg-transparent border-transparent opacity-60'
          }`}>
            <span className="text-xs font-medium mb-1 uppercase tracking-wider">{day.name}</span>
            <span className="text-xl font-serif">{day.date}</span>
            {day.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-1" />}
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-serif mb-1">Today's Focus</h2>
            <p className="text-muted-foreground">Estimated time: 1h 30m</p>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-primary">1 of 4 completed</div>
            <div className="w-32 h-2 bg-muted rounded-full mt-2 overflow-hidden">
              <div className="bg-primary h-full w-1/4 rounded-full" />
            </div>
          </div>
        </div>

        <div className="space-y-4 relative before:absolute before:inset-y-4 before:left-[19px] before:w-0.5 before:bg-border">
           {isLoading ? <p className="py-8 text-center text-muted-foreground">Dein Lernplan wird geladen…</p> : todayPlan.map((task: StudyPlanItem & { active?: boolean; time: string }, i: number) => (
            <div key={i} className={`relative flex items-start gap-6 p-4 rounded-2xl border transition-all ${
              task.active ? 'bg-background border-primary/30 shadow-md ring-1 ring-primary/20' 
              : task.completed ? 'bg-transparent border-transparent opacity-60'
              : 'bg-background border-border opacity-80'
            }`}>
              {/* Timeline dot */}
              <div className={`mt-1 relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-4 border-card ${
                task.completed ? 'bg-primary text-primary-foreground' 
                : task.active ? 'bg-background border-primary border-2 text-primary' 
                : 'bg-muted text-muted-foreground'
              }`}>
                {task.completed ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              
              <div className="flex-1 py-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className={`font-medium text-lg ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground">
                      <span className="uppercase tracking-wider font-semibold text-xs">{task.type}</span>
                      <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> {task.time}</span>
                    </div>
                  </div>
                  
                  {task.active && (
                    <Button asChild className="shrink-0 rounded-full hover-elevate">
                       <Link href={`${task.type === 'quiz' ? '/app/quiz' : '/app/flashcards'}${task.courseId ? `?courseId=${task.courseId}` : ''}`}>
                        Start <PlayCircle className="w-4 h-4 ml-1.5" />
                      </Link>
                    </Button>
                  )}
                  
                  {!task.active && !task.completed && (
                    <Button variant="ghost" size="icon" disabled className="shrink-0 text-muted-foreground">
                      <Lock className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            ))}
            {!isLoading && !todayPlan.length && <p className="py-8 text-center text-muted-foreground">Noch keine Lernaufgaben geplant.</p>}
        </div>
      </div>
    </div>
  );
}
