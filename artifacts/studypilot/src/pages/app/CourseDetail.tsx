import React, { useRef, useState } from 'react';
import { useGetCourse } from '@workspace/api-client-react';
import { useGetCourseLearningContent, useListCourseDocuments, useUploadCourseDocument, type CourseDocument } from '@/lib/generated-content';
import { useParams, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, FileText, BrainCircuit, PlayCircle, Settings, UploadCloud, Plus, Calendar } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function CourseDetail() {
  const params = useParams();
  const courseId = params.id || '1';
  
  const { data, isLoading, isError } = useGetCourse(courseId);
  const { data: documents = [] } = useListCourseDocuments(courseId);
  const { data: content } = useGetCourseLearningContent(courseId);
  const upload = useUploadCourseDocument(courseId);
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  const course = data;
  if (isLoading) return <div className="py-20 text-center text-muted-foreground">Kurs wird geladen…</div>;
  if (isError || !course) return <div className="py-20 text-center text-destructive">Der Kurs konnte nicht geladen werden.</div>;
  const chooseFile = (file?: File) => {
    if (!file) return;
    if (file.type !== "application/pdf") return;
    upload.mutate(file);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Back button & Header */}
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2 text-muted-foreground hover:text-foreground">
          <Link href="/app/courses"><ChevronLeft className="w-4 h-4 mr-1" /> Zurück zu den Kursen</Link>
        </Button>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif text-foreground mb-2">{course.name}</h1>
            <p className="text-muted-foreground max-w-xl">{course.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="shadow-sm">
              <Calendar className="w-4 h-4 mr-2" /> Prüfungsdatum festlegen
            </Button>
            <Button className="shadow-sm hover-elevate">
              <PlayCircle className="w-4 h-4 mr-2" /> Jetzt lernen
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-8">
        <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent p-0 h-auto">
          <TabsTrigger value="overview" className="data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent rounded-none px-4 py-3">Übersicht</TabsTrigger>
           <TabsTrigger value="materials" className="data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent rounded-none px-4 py-3">Materialien ({documents.length})</TabsTrigger>
          <TabsTrigger value="flashcards" className="data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent rounded-none px-4 py-3">Karteikarten</TabsTrigger>
          <TabsTrigger value="quizzes" className="data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent rounded-none px-4 py-3">Übungsquizze</TabsTrigger>
        </TabsList>
        
        <div className="mt-8">
          <TabsContent value="overview" className="space-y-8 m-0">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Mastery Stats */}
              <div className="col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm">
                <h3 className="font-medium text-lg mb-6">Kursbeherrschung</h3>
                {content?.summary && <><h4 className="font-medium mb-2">{content.summary.title}</h4><p className="text-muted-foreground leading-relaxed mb-6">{content.summary.content}</p></>}
                <div className="flex items-end gap-4 mb-4">
                  <span className="text-5xl font-serif">{course.progress}%</span>
                  <span className="text-muted-foreground pb-1">Gesamtbereitschaft</span>
                </div>
                <Progress value={course.progress} className="h-2 mb-8" />
                
                <h4 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Themen, die wiederholt werden müssen</h4>
                <div className="space-y-3">
                  <TopicRow name="Zellatmung" progress={20} />
                  <TopicRow name="Mendelsche Genetik" progress={45} />
                  <TopicRow name="Mitosephasen" progress={85} />
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="space-y-4">
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                  <BrainCircuit className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-medium text-lg mb-2">Smarte Wiederholung</h3>
                  <p className="text-sm text-muted-foreground mb-4">KI-generierte Sitzung basierend auf deinen schwächsten Themen.</p>
                  <Button className="w-full" asChild>
                    <Link href={`/app/flashcards?courseId=${courseId}`}>Sitzung starten</Link>
                  </Button>
                </div>
                
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <FileText className="w-8 h-8 text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg mb-2">Material hochladen</h3>
                  <p className="text-sm text-muted-foreground mb-4">Füge Folien oder Notizen hinzu, um neue Lerninhalte zu generieren.</p>
                   <Button variant="outline" className="w-full" onClick={() => inputRef.current?.click()} disabled={upload.isPending}>
                    <UploadCloud className="w-4 h-4 mr-2" /> PDF hochladen
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="materials" className="m-0">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-medium text-lg">Quelldokumente</h3>
               <Button size="sm" onClick={() => inputRef.current?.click()} disabled={upload.isPending}><Plus className="w-4 h-4 mr-2" /> {upload.isPending ? "Wird hochgeladen…" : "Hochladen"}</Button>
              <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={e => chooseFile(e.target.files?.[0])} />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((document: CourseDocument) => <DocumentCard key={document.id} name={document.name} date={document.created_at ? new Date(document.created_at).toLocaleDateString("de-DE") : ""} status={document.status} isProcessing={document.status === "processing"} error={document.error_message ?? undefined} />)}
              {upload.isError && <p className="text-sm text-destructive col-span-full">Upload fehlgeschlagen. Bitte versuche es erneut.</p>}
              {!documents.length && !upload.isPending && <p className="text-muted-foreground col-span-full">Noch keine PDF-Dokumente hochgeladen.</p>}
            </div>
          </TabsContent>
          
          <TabsContent value="flashcards" className="m-0 text-center py-20 bg-card rounded-2xl border border-dashed">
            <BrainCircuit className="w-12 h-12 text-muted-foreground opacity-50 mx-auto mb-4" />
            <h3 className="font-medium text-lg mb-2">KI-Karteikarten</h3>
             <p className="text-muted-foreground mb-6 max-w-md mx-auto">{content?.flashcards?.length ?? 0} Schlüsselkonzepte aus deinen hochgeladenen Dokumenten.</p>
             <Button asChild><Link href={`/app/flashcards?courseId=${courseId}`}>Karteikarten lernen</Link></Button>
          </TabsContent>
          
          <TabsContent value="quizzes" className="m-0 text-center py-20 bg-card rounded-2xl border border-dashed">
            <PlayCircle className="w-12 h-12 text-muted-foreground opacity-50 mx-auto mb-4" />
            <h3 className="font-medium text-lg mb-2">Übungsprüfungen</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">Generiere ein benutzerdefiniertes Quiz, um deine Bereitschaft unter Prüfungsbedingungen zu testen.</p>
             <Button asChild><Link href={`/app/quiz?courseId=${courseId}`}>Quiz starten</Link></Button>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function TopicRow({ name, progress }: { name: string, progress: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="font-medium">{name}</span>
      <div className="flex items-center gap-3 w-1/3">
        <Progress value={progress} className="h-1.5 flex-1" />
        <span className="w-8 text-right text-muted-foreground">{progress}%</span>
      </div>
    </div>
  );
}

function DocumentCard({ name, date, status, isProcessing = false, error }: { name: string, date: string, status: string, isProcessing?: boolean, error?: string }) {
  return (
    <div className="p-4 rounded-xl border border-border bg-card flex items-start gap-3">
      <div className="bg-muted p-2 rounded-lg text-muted-foreground shrink-0">
        <FileText className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium truncate mb-1" title={name}>{name}</h4>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{date}</span>
           <span className={error ? 'text-destructive' : isProcessing ? 'text-accent animate-pulse' : 'text-primary'}>{error ? `Fehler: ${error}` : status}</span>
        </div>
      </div>
    </div>
  );
}
