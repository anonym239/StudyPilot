import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAccessToken } from "./auth";

export type CourseDocument = { id: string; name: string; created_at?: string; status: "processing" | "ready" | "failed"; error_message?: string | null };
export type LearningContent = { summary?: { title: string; content: string; keyPoints?: string[] } | null; flashcards: Array<{ question: string; answer: string; difficulty?: string }>; quiz: Array<{ question: string; options: string[]; correct: number; explanation?: string }>; plan: StudyPlanItem[] };
export type StudyPlanItem = { id?: string; title: string; type?: string; duration?: number; completed?: boolean; courseId?: string };
const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(path, { ...init, headers: { ...(init?.headers ?? {}), ...(getAccessToken() ? { Authorization: `Bearer ${getAccessToken()}` } : {}) } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
};

export const useListCourseDocuments = (courseId: string) =>
  useQuery<CourseDocument[]>({ queryKey: ["/api/courses", courseId, "documents"], queryFn: () => request(`/api/courses/${courseId}/documents`) });

export const useGetCourseLearningContent = (courseId: string) =>
  useQuery<LearningContent>({ queryKey: ["/api/courses", courseId, "learning-content"], queryFn: () => request(`/api/courses/${courseId}/learning-content`) });

export const useUploadCourseDocument = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append("file", file);
      return request<CourseDocument>(`/api/courses/${courseId}/documents`, { method: "POST", body: form });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/courses", courseId, "documents"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/courses", courseId, "learning-content"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/study-plan"] }),
      ]);
    },
  });
};

export const useGetStudyPlan = () =>
  useQuery<StudyPlanItem[]>({ queryKey: ["/api/study-plan"], queryFn: () => request("/api/study-plan") });