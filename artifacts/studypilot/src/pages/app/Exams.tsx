import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { GraduationCap, Calendar, Clock, AlertCircle, PlayCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function Exams() {
  const exams = [
    { id: 1, course: 'Biologie 101', name: 'Zwischenprüfung', date: '12. Nov 2023', daysLeft: 14, type: 'Multiple-Choice', duration: '120 Min.', readiness: 65, color: 'text-green-600', bg: 'bg-green-100' },
    { id: 2, course: 'Makroökonomie', name: 'Abschlussarbeit', date: '26. Nov 2023', daysLeft: 28, type: 'Aufsatz', duration: 'Hausarbeit', readiness: 20, color: 'text-blue-600', bg: 'bg-blue-100' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-foreground mb-2">Prüfungen & Ziele</h1>
          <p className="text-muted-foreground">Simuliere echte Testbedingungen, um Selbstvertrauen aufzubauen.</p>
        </div>
        <Button className="rounded-full shadow-sm">Prüfungsdatum hinzufügen</Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {exams.map(exam => (
          <Card key={exam.id} className="border-border shadow-sm overflow-hidden flex flex-col">
            <div className="h-2 w-full bg-muted">
              <div className={`h-full ${exam.bg}`} style={{ width: `${exam.readiness}%` }} />
            </div>
            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${exam.color}`}>{exam.course}</div>
                  <h3 className="text-2xl font-serif">{exam.name}</h3>
                </div>
                <div className="flex flex-col items-end text-right">
                  <span className="text-3xl font-serif text-accent leading-none mb-1">{exam.daysLeft}</span>
                  <span className="text-xs font-medium text-muted-foreground uppercase">Tage verbleibend</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-2" /> {exam.date}
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Clock className="w-4 h-4 mr-2" /> {exam.duration}
                </div>
                <div className="flex items-center text-muted-foreground">
                  <AlertCircle className="w-4 h-4 mr-2" /> {exam.type}
                </div>
              </div>

              <div className="mt-auto space-y-4 pt-4 border-t border-border">
                <div>
                  <div className="flex justify-between text-sm mb-1.5 font-medium">
                    <span>KI-Bereitschaftswert</span>
                    <span>{exam.readiness}%</span>
                  </div>
                  <Progress value={exam.readiness} className="h-2" />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1 bg-card">Plan ansehen</Button>
                  <Button className="flex-1 gap-2"><PlayCircle className="w-4 h-4" /> Prüfung simulieren</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-12 bg-primary/5 border border-primary/20 rounded-3xl p-8 text-center max-w-2xl mx-auto">
        <GraduationCap className="w-12 h-12 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-serif mb-2">Prüfungssimulationsmodus</h3>
        <p className="text-muted-foreground mb-6">
          Wenn du 7 Tage vor einer Prüfung stehst, schalten wir den Simulationsmodus frei. Dieser sperrt deinen Bildschirm und generiert einen zeitgesteuerten Test, der im Format identisch mit dem echten ist.
        </p>
        <Button variant="outline" disabled className="bg-card">Gesperrt bis 5. Nov.</Button>
      </div>
    </div>
  );
}
