import { Router } from "express";
import multer from "multer";
import pdfParse from "pdf-parse";
import { randomUUID } from "node:crypto";
import { db, requireAuth, storage } from "../lib/supabase";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024, files: 1 }, fileFilter: (_req, file, cb) => cb(null, file.mimetype === "application/pdf") });
router.use(requireAuth);

type GeneratedContent = {
  title?: string;
  content?: string;
  key_points?: string[];
  flashcards?: Array<{ question: string; answer: string; difficulty?: string }>;
  quiz?: Array<{ question: string; options: string[]; answer: string; explanation?: string }>;
  plan?: Array<{ title: string; type?: string; duration_minutes?: number }>;
};
async function generate(text: string): Promise<GeneratedContent> {
  const key = process.env.AI_INTEGRATIONS_OPENAI_API_KEY ?? process.env.AI_API_KEY;
  const base = (process.env.AI_INTEGRATIONS_OPENAI_BASE_URL ?? process.env.AI_API_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, "");
  if (!key) throw new Error("KI-Zugang ist nicht konfiguriert.");
  const model = process.env.AI_INTEGRATIONS_OPENAI_MODEL ?? process.env.AI_MODEL ?? "gpt-5-mini";
  const r = await fetch(`${base}/chat/completions`, { method: "POST", headers: { authorization: `Bearer ${key}`, "content-type": "application/json" }, body: JSON.stringify({ model, max_completion_tokens: 8192, response_format: { type: "json_object" }, messages: [{ role: "system", content: "Erzeuge gültiges JSON mit title, content, key_points (string[]), flashcards ({question,answer,difficulty}[]), quiz ({question,options:string[],answer:string,explanation}[]) und plan ({title,type,duration_minutes}[]). Die Quiz-Antwort muss exakt einer Option entsprechen. Antworte auf Deutsch." }, { role: "user", content: text.slice(0, 100000) }] }) });
  if (!r.ok) throw new Error("KI-Generierung fehlgeschlagen.");
  const payload = await r.json() as { choices?: Array<{ message?: { content?: string } }> }; return JSON.parse(payload.choices?.[0]?.message?.content ?? "{}") as GeneratedContent;
}
router.get("/courses/:courseId/documents", async (req, res) => {
  try { res.json(await db("documents", { query: `course_id=eq.${encodeURIComponent(req.params.courseId)}&user_id=eq.${encodeURIComponent(res.locals.user.id)}&select=id,name,mime_type,size_bytes,status,error_message,created_at&order=created_at.desc` })); } catch (e) { res.status(500).json({ error: e instanceof Error ? e.message : "Dokumente konnten nicht geladen werden." }); }
});
router.post("/courses/:courseId/documents", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Bitte eine PDF-Datei bis 10 MB hochladen." });
  const courseId = String(req.params.courseId);
  const id = randomUUID(); const path = `${res.locals.user.id}/${courseId}/${id}.pdf`;
  try {
    const course = await db<any[]>("courses", { query: `id=eq.${encodeURIComponent(courseId)}&user_id=eq.${encodeURIComponent(res.locals.user.id)}&select=id` });
    if (!course[0]) return res.status(404).json({ error: "Kurs nicht gefunden." });
    const parsed = await pdfParse(req.file.buffer);
    if (!parsed.text.trim()) return res.status(422).json({ error: "Aus dieser PDF konnte kein Text extrahiert werden." });
    await storage(path, "POST", req.file.buffer);
    const rows = await db<any[]>("documents", { method: "POST", body: { id, user_id: res.locals.user.id, course_id: req.params.courseId, name: req.file.originalname, storage_path: path, mime_type: req.file.mimetype, size_bytes: req.file.size, extracted_text: parsed.text, status: "processing" }, prefer: "return=representation" });
    try {
      const ai = await generate(parsed.text);
      await db("summaries", { method: "POST", body: { user_id: res.locals.user.id, document_id: id, title: ai.title ?? "Zusammenfassung", content: ai.content ?? "", key_points: ai.key_points ?? [] } });
      if (Array.isArray(ai.flashcards) && ai.flashcards.length) await db("flashcards", { method: "POST", body: ai.flashcards.map((x) => ({ ...x, user_id: res.locals.user.id, document_id: id })) });
      if (Array.isArray(ai.quiz) && ai.quiz.length) await db("quizzes", { method: "POST", body: ai.quiz.map((x) => ({ question: x.question, options: x.options ?? [], answer: x.answer, explanation: x.explanation ?? "", user_id: res.locals.user.id, document_id: id })) });
      if (Array.isArray(ai.plan) && ai.plan.length) await db("study_plan_items", { method: "POST", body: ai.plan.map((x) => ({ title: x.title, type: x.type ?? "review", duration_minutes: x.duration_minutes ?? 15, scheduled_for: new Date().toISOString().slice(0, 10), course_id: req.params.courseId, document_id: id, user_id: res.locals.user.id })) });
      await db("documents", { method: "PATCH", query: `id=eq.${id}`, body: { status: "ready" } });
    } catch (e) { await db("documents", { method: "PATCH", query: `id=eq.${id}`, body: { status: "failed", error_message: e instanceof Error ? e.message : "Auswertung fehlgeschlagen." } }); throw e; }
    return res.status(201).json({ ...rows[0], status: "ready" });
  } catch (e) { return res.status(422).json({ error: e instanceof Error ? e.message : "PDF konnte nicht verarbeitet werden." }); }
});
router.get("/documents/:documentId/learning", async (req, res) => {
  try { const id = encodeURIComponent(req.params.documentId); const userId = encodeURIComponent(res.locals.user.id); const [summary, flashcards, quiz, plan] = await Promise.all([db("summaries", { query: `document_id=eq.${id}&user_id=eq.${userId}&select=*` }), db("flashcards", { query: `document_id=eq.${id}&user_id=eq.${userId}&select=*` }), db("quizzes", { query: `document_id=eq.${id}&user_id=eq.${userId}&select=*` }), db("study_plan_items", { query: `document_id=eq.${id}&user_id=eq.${userId}&select=*` })]); res.json({ summary: (summary as any[])[0] ?? null, flashcards, quiz, plan }); } catch (e) { res.status(500).json({ error: e instanceof Error ? e.message : "Lerninhalte konnten nicht geladen werden." }); }
});
router.get("/courses/:courseId/learning-content", async (req, res) => {
  try {
    const userId = encodeURIComponent(res.locals.user.id);
    const courseId = encodeURIComponent(req.params.courseId);
    const documents = await db<any[]>("documents", { query: `course_id=eq.${courseId}&user_id=eq.${userId}&select=id&status=eq.ready&order=created_at.desc` });
    if (!documents.length) return res.json({ summary: null, flashcards: [], quiz: [], plan: [] });
    const ids = documents.map((document) => document.id).join(",");
    const [summaries, flashcards, quiz, plan] = await Promise.all([
      db<any[]>("summaries", { query: `user_id=eq.${userId}&document_id=in.(${ids})&select=*&order=created_at.desc` }),
      db<any[]>("flashcards", { query: `user_id=eq.${userId}&document_id=in.(${ids})&select=question,answer,difficulty&order=created_at.asc` }),
      db<any[]>("quizzes", { query: `user_id=eq.${userId}&document_id=in.(${ids})&select=question,options,answer,explanation&order=created_at.asc` }),
      db<any[]>("study_plan_items", { query: `user_id=eq.${userId}&course_id=eq.${courseId}&select=*&order=scheduled_for.asc` }),
    ]);
    return res.json({
      summary: summaries[0] ? { title: summaries[0].title, content: summaries[0].content, keyPoints: summaries[0].key_points } : null,
      flashcards: flashcards.map((card) => ({ question: card.question, answer: card.answer, difficulty: card.difficulty })),
      quiz: quiz.map((item) => ({ question: item.question, options: item.options, correct: Math.max(0, item.options.indexOf(item.answer)), explanation: item.explanation })),
      plan,
    });
  } catch (e) { return res.status(500).json({ error: e instanceof Error ? e.message : "Lerninhalte konnten nicht geladen werden." }); }
});
export default router;