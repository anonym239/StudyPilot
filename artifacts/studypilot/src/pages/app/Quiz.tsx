import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Target, Trophy, ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { useGetCourseLearningContent, type LearningContent } from '@/lib/generated-content';

export default function Quiz() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const courseId = new URLSearchParams(window.location.search).get("courseId") ?? "";
  const { data: content, isLoading, isError } = useGetCourseLearningContent(courseId);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const quiz = (content?.quiz ?? []).map((q: LearningContent["quiz"][number]) => ({ ...q, explanation: q.explanation ?? "" }));
  if (!courseId) return <EmptyState text="Wähle einen Kurs, um ein Quiz zu starten." />;
  if (isLoading) return <EmptyState text="Quiz wird geladen…" />;
  if (isError || !quiz.length) return <EmptyState text="Für diesen Kurs ist noch kein Quiz verfügbar." />;

  const handleSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);
    
    if (index === quiz[currentIndex].correct) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < quiz.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleFinish = () => {
    toast({ title: 'Quiz abgeschlossen', description: `Du hast ${score} von ${quiz.length} Punkten erreicht.` });
    setLocation('/app/plan');
  };

  if (quizCompleted) {
    const percentage = Math.round((score / quiz.length) * 100);
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Trophy className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-3xl font-serif mb-2">Quiz-Ergebnisse</h2>
        <p className="text-muted-foreground mb-8">Du hast {score} von {quiz.length} erreicht ({percentage}%)</p>
        <div className="flex gap-4">
          <Button onClick={handleFinish} className="px-8 rounded-full h-12 shadow-sm">Abschließen & Speichern</Button>
        </div>
      </div>
    );
  }

  const q = quiz[currentIndex];

  return (
    <div className="max-w-3xl mx-auto py-4">
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground hover:text-foreground">
          <Link href="/app/plan"><ChevronLeft className="w-4 h-4 mr-1" /> Quiz beenden</Link>
        </Button>
        <div className="flex items-center gap-4 w-1/3">
          <Progress value={((currentIndex) / quiz.length) * 100} className="h-2 flex-1" />
          <span className="text-sm font-medium text-muted-foreground w-12 text-right">
            {currentIndex + 1}/{quiz.length}
          </span>
        </div>
      </div>

      <div className="bg-card border border-border shadow-sm rounded-3xl p-8 sm:p-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold uppercase tracking-wider mb-6">
          <Target className="w-3.5 h-3.5" /> Frage {currentIndex + 1}
        </div>
        
        <h3 className="text-2xl font-serif leading-snug text-foreground mb-8">{q.question}</h3>
        
        <div className="space-y-3 mb-8">
           {q.options.map((opt: string, i: number) => {
            let stateClass = "bg-background border-border hover:border-primary/50 hover:bg-primary/5";
            if (isAnswered) {
              if (i === q.correct) stateClass = "bg-green-50 border-green-500 text-green-900 dark:bg-green-950/30 dark:border-green-800 dark:text-green-100";
              else if (i === selectedAnswer) stateClass = "bg-destructive/10 border-destructive text-destructive dark:text-red-200";
              else stateClass = "bg-background border-border opacity-50";
            }
            
            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={isAnswered}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${stateClass} flex items-center justify-between group`}
              >
                <span className="font-medium">{opt}</span>
                {!isAnswered && <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 group-hover:border-primary/50" />}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300 border-t border-border pt-6 mt-6">
            <h4 className="font-semibold text-sm mb-2 uppercase tracking-wider text-muted-foreground">Erklärung</h4>
            <p className="text-foreground leading-relaxed text-sm mb-6">{q.explanation}</p>
            <Button onClick={handleNext} className="w-full sm:w-auto h-12 px-8 rounded-full ml-auto flex">
              {currentIndex < quiz.length - 1 ? 'Nächste Frage' : 'Ergebnisse ansehen'} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">{text}</div>;
}
