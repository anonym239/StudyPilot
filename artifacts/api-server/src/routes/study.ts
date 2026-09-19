import { Router } from "express";
import { z } from "zod";
import { db, requireAuth } from "../lib/supabase";
import { CompleteStudySessionResponse, GetDashboardResponse } from "@workspace/api-zod";

const router = Router();
router.use(requireAuth);
const courseShape = (c: any) => ({ ...c, examDate: c.exam_date ?? null, documents: Number(c.documents ?? 0), progress: Number(c.progress ?? 0), difficultTopics: Number(c.difficult_topics ?? 0) });

router.get("/courses", async (_req, res) => {
  try {
    const userId = encodeURIComponent(res.locals.user.id);
    const rows = await db<any[]>("courses", { query: `user_id=eq.${userId}&select=*&order=created_at.desc` });
    const ids = rows.map((x) => x.id);
    const docs = ids.length ? await db<any[]>("documents", { query: `user_id=eq.${userId}&select=course_id&course_id=in.(${ids.join(",")})` }) : [];
    res.json(rows.map((x) => courseShape({ ...x, documents: docs.filter((d) => d.course_id === x.id).length })));
  } catch (e) { res.status(500).json({ error: e instanceof Error ? e.message : "Kurse konnten nicht geladen werden." }); }
});
router.post("/courses", async (req, res) => {
  const p = z.object({ name: z.string().trim().min(1).max(200), description: z.string().max(5000).optional(), examDate: z.string().nullable().optional() }).safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: "Bitte gib dem Kurs einen Namen." });
  try {
    const row = await db<any[]>("courses", { method: "POST", body: { name: p.data.name, description: p.data.description ?? "", exam_date: p.data.examDate ?? null, user_id: res.locals.user.id }, prefer: "return=representation" });
    return res.status(201).json(courseShape(row[0]));
  } catch (e) { return res.status(500).json({ error: e instanceof Error ? e.message : "Kurs konnte nicht erstellt werden." }); }
});
router.get("/courses/:courseId", async (req, res) => {
  try { const rows = await db<any[]>("courses", { query: `id=eq.${encodeURIComponent(String(req.params.courseId))}&user_id=eq.${encodeURIComponent(res.locals.user.id)}&select=*` }); if (!rows[0]) return res.status(404).json({ error: "Kurs nicht gefunden." }); return res.json(courseShape(rows[0])); }
  catch (e) { return res.status(500).json({ error: e instanceof Error ? e.message : "Kurs konnte nicht geladen werden." }); }
});
router.delete("/courses/:courseId", async (req, res) => {
  try { await db("courses", { method: "DELETE", query: `id=eq.${encodeURIComponent(req.params.courseId)}&user_id=eq.${encodeURIComponent(res.locals.user.id)}` }); res.sendStatus(204); } catch (e) { res.status(500).json({ error: e instanceof Error ? e.message : "Kurs konnte nicht gelöscht werden." }); }
});
router.post("/study/sessions", async (req, res) => {
  const p = z.object({ courseId: z.string().uuid(), duration: z.number().int().positive() }).safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: "Die Lernsession ist unvollständig." });
  try { const row = await db<any[]>("study_sessions", { method: "POST", body: { user_id: res.locals.user.id, course_id: p.data.courseId, duration_minutes: p.data.duration }, prefer: "return=representation" }); return res.status(201).json(CompleteStudySessionResponse.parse({ id: row[0].id, courseId: row[0].course_id, duration: row[0].duration_minutes, completedAt: row[0].completed_at })); }
  catch (e) { return res.status(500).json({ error: e instanceof Error ? e.message : "Session konnte nicht gespeichert werden." }); }
});
router.get("/study-plan", async (_req, res) => {
  try {
    const rows = await db<any[]>("study_plan_items", { query: `user_id=eq.${encodeURIComponent(res.locals.user.id)}&select=id,title,type,duration_minutes,completed,course_id,scheduled_for&order=scheduled_for.asc,created_at.asc` });
    res.json(rows.map((row) => ({ id: row.id, title: row.title, type: row.type, duration: row.duration_minutes, completed: row.completed, courseId: row.course_id, scheduledFor: row.scheduled_for })));
  } catch (e) { res.status(500).json({ error: e instanceof Error ? e.message : "Lernplan konnte nicht geladen werden." }); }
});
router.get("/dashboard", async (_req, res) => {
  try { const userId = encodeURIComponent(res.locals.user.id); const [sessions, plans] = await Promise.all([db<any[]>("study_sessions", { query: `user_id=eq.${userId}&select=duration_minutes,completed_at&order=completed_at.desc&limit=100` }), db<any[]>("study_plan_items", { query: `user_id=eq.${userId}&select=*&completed=eq.false&order=scheduled_for.asc&limit=10` })]); const minutes = sessions.reduce((a, s) => a + Number(s.duration_minutes), 0); res.json(GetDashboardResponse.parse({ user: { name: res.locals.user.email?.split("@")[0] ?? "Lernende", initials: "SP" }, todayMinutes: sessions.filter((s) => s.completed_at?.slice(0, 10) === new Date().toISOString().slice(0, 10)).reduce((a, s) => a + Number(s.duration_minutes), 0), weeklyMinutes: minutes, streak: 0, completedTasks: 0, tasks: plans.map((p) => ({ id: p.id, title: p.title, subject: "", duration: p.duration_minutes, progress: 0, type: p.type, completed: p.completed })), exams: [] })); }
  catch (e) { res.status(500).json({ error: e instanceof Error ? e.message : "Dashboard konnte nicht geladen werden." }); }
});
export default router;