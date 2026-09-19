import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, RotateCcw, ThumbsDown, ThumbsUp, Brain } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useCompleteStudySession } from '@workspace/api-client-react';
import { useGetCourseLearningContent, type LearningContent } from '@/lib/generated-content';

export default function Flashcards() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const completeSession = useCompleteStudySession();
  const courseId = new URLSearchParams(window.location.search).get("courseId") ?? "";
  const { data: content, isLoading, isError } = useGetCourseLearningContent(courseId);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  const deck = (content?.flashcards ?? []).map((card: LearningContent["flashcards"][number]) => ({ front: card.question, back: card.answer })).filter((card) => card.front);
  if (!courseId) return <EmptyState text="Wähle einen Kurs, um deine Karteikarten zu laden." />;
  if (isLoading) return <EmptyState text="Karteikarten werden geladen…" />;
  if (isError || !deck.length) return <EmptyState text="Für diesen Kurs sind noch keine Karteikarten verfügbar." />;

  const handleNext = async (rating: 'hard' | 'easy') => {
    setIsFlipped(false);
    setTimeout(async () => {
      if (currentIndex < deck.length - 1) {
        setCurrentIndex(c => c + 1);
      } else {
        setSessionCompleted(true);
        try {
           await completeSession.mutateAsync({ data: { courseId, duration: 15 } });
        } catch (e) {
          toast({ title: "Fortschritt konnte nicht gespeichert werden", description: "Bitte versuche es später erneut.", variant: "destructive" });
        }
      }
    }, 150);
  };

  const handleFinish = () => {
    toast({ title: 'Sitzung aufgezeichnet', description: 'Dein Fortschritt wurde gespeichert.' });
    setLocation('/app/plan');
  };

  if (sessionCompleted) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Brain className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-serif mb-2">Sitzung abgeschlossen!</h2>
        <p className="text-muted-foreground mb-8">Du hast {deck.length} Karten in 15 Minuten wiederholt.</p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => { setSessionCompleted(false); setCurrentIndex(0); }}>Nochmal wiederholen</Button>
          <Button onClick={handleFinish}>Zurück zum Plan</Button>
        </div>
      </div>
    );
  }

  const card = deck[currentIndex];

  return (
    <div className="max-w-2xl mx-auto h-[80vh] flex flex-col pt-4">
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground hover:text-foreground">
          <Link href="/app/plan"><ChevronLeft className="w-4 h-4 mr-1" /> Zurück zum Plan</Link>
        </Button>
        <div className="text-sm font-medium text-muted-foreground">
          Karte {currentIndex + 1} von {deck.length}
        </div>
      </div>

      <div className="flex-1 flex flex-col relative" style={{ perspective: '1000px' }}>
        {/* Flashcard 3D container */}
        <div 
          className="flex-1 w-full relative transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
          style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)' }}
        >
          {/* Front */}
          <div 
            className="absolute inset-0 bg-card border border-border shadow-md rounded-3xl p-8 sm:p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/30 transition-colors"
            style={{ backfaceVisibility: 'hidden' }}
            onClick={() => setIsFlipped(true)}
          >
            <span className="absolute top-6 left-6 text-xs font-bold tracking-wider uppercase text-muted-foreground">Frage</span>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif text-foreground leading-snug">{card.front}</h3>
            <p className="absolute bottom-6 text-sm text-muted-foreground flex items-center gap-2">
              <RotateCcw className="w-4 h-4" /> Tippen zum Umdrehen
            </p>
          </div>
          
          {/* Back */}
          <div 
            className="absolute inset-0 bg-card border-2 border-primary/20 shadow-lg rounded-3xl p-8 sm:p-12 flex flex-col items-center justify-center text-center"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <span className="absolute top-6 left-6 text-xs font-bold tracking-wider uppercase text-primary">Antwort</span>
            <p className="text-xl sm:text-2xl text-foreground leading-relaxed">{card.back}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={`mt-8 flex justify-center gap-4 transition-all duration-300 ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <Button size="lg" variant="outline" className="w-32 h-14 rounded-2xl border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleNext('hard')}>
          <ThumbsDown className="w-5 h-5 mr-2" /> Schwer
        </Button>
        <Button size="lg" className="w-32 h-14 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 hover-elevate" onClick={() => handleNext('easy')}>
          <ThumbsUp className="w-5 h-5 mr-2" /> Einfach
        </Button>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">{text}</div>;
}
