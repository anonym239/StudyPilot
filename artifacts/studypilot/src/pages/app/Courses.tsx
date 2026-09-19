import React, { useState } from 'react';
import { useListCourses, useCreateCourse, useDeleteCourse } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Link, useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Book, FileText, ChevronRight, Calendar, BrainCircuit, MoreVertical, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

export default function Courses() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useListCourses();
  const createCourse = useCreateCourse();
  const deleteCourse = useDeleteCourse();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  
  const courses = data ?? [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCourse.mutateAsync({ data: { name: newCourseName, description: newCourseDesc } });
      await queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
      toast({ title: 'Kurs erstellt', description: `${newCourseName} wurde zu deinem Arbeitsbereich hinzugefügt.` });
      setIsCreateOpen(false);
      setNewCourseName('');
      setNewCourseDesc('');
    } catch {
      toast({ title: 'Kurs konnte nicht erstellt werden', description: 'Bitte prüfe deine Verbindung und versuche es erneut.', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteCourse.mutateAsync({ courseId: id });
      await queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
      toast({ title: 'Kurs gelöscht', description: `${name} wurde entfernt.` });
    } catch {
      toast({ title: 'Kurs konnte nicht gelöscht werden', description: 'Bitte versuche es erneut.', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-foreground mb-2">Meine Kurse</h1>
          <p className="text-muted-foreground">Verwalte deine Lernmaterialien und verfolge den Fortschritt nach Fach.</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="shrink-0 rounded-full shadow-sm hover-elevate gap-2">
              <Plus className="w-4 h-4" /> Kurs hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Einen neuen Kurs erstellen</DialogTitle>
                <DialogDescription>
                  Füge ein neues Fach hinzu, um deine Lernmaterialien und deinen Fortschritt zu verfolgen.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Kursname</Label>
                  <Input 
                    id="name" 
                    value={newCourseName} 
                    onChange={e => setNewCourseName(e.target.value)} 
                    placeholder="z.B. Biologie 101" 
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="desc">Beschreibung (Optional)</Label>
                  <Textarea 
                    id="desc" 
                    value={newCourseDesc} 
                    onChange={e => setNewCourseDesc(e.target.value)} 
                    placeholder="Kurze Beschreibung des Fachs..." 
                    className="resize-none"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={!newCourseName || createCourse.isPending}>
                  {createCourse.isPending ? 'Erstelle...' : 'Kurs erstellen'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && <p className="py-12 text-center text-muted-foreground">Kurse werden geladen…</p>}
      {isError && <p className="py-12 text-center text-destructive">Kurse konnten nicht geladen werden.</p>}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <Card key={course.id} className="flex flex-col border-border shadow-sm hover:border-primary/30 transition-colors group cursor-pointer" onClick={() => setLocation(`/app/courses/${course.id}`)}>
            <CardHeader className="pb-4 relative">
              <div className="absolute right-4 top-4" onClick={e => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => handleDelete(course.id, course.name)}>
                      <Trash2 className="h-4 w-4 mr-2" /> Löschen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${course.color || 'bg-primary/10 text-primary'}`}>
                <Book className="w-6 h-6" />
              </div>
              <CardTitle className="text-xl">{course.name}</CardTitle>
              <CardDescription className="line-clamp-1">{course.description}</CardDescription>
            </CardHeader>
            <CardContent className="pb-4 flex-1">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">Beherrschung</span>
                    <span className="font-medium text-foreground">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>
                
                <div className="flex gap-4 pt-2">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <FileText className="w-4 h-4" /> {course.documents} Dok.
                  </div>
                  {course.difficultTopics > 0 && (
                    <div className="flex items-center gap-1.5 text-sm text-accent">
                      <BrainCircuit className="w-4 h-4" /> {course.difficultTopics} zu wiederholen
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 pb-4">
              <div className="w-full flex items-center justify-end text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Arbeitsbereich öffnen <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {courses.length === 0 && !isLoading && (
        <div className="text-center py-20 border border-dashed rounded-2xl bg-card/50">
          <Book className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Noch keine Kurse</h3>
          <p className="text-muted-foreground mb-6">Erstelle deinen ersten Kurs, um mit dem Lernen zu beginnen.</p>
          <Button onClick={() => setIsCreateOpen(true)}>Kurs hinzufügen</Button>
        </div>
      )}
    </div>
  );
}
