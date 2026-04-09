import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ─── 미흡사항 (Deficiencies) ───────────────────────────────────────────────
export const deficiencies = sqliteTable("deficiencies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull(), // D1~D8
  area: text("area").notNull(), // 인증영역
  title: text("title").notNull(),
  severity: text("severity").notNull(), // 상/중/하
  status: text("status").notNull().default("미착수"), // 미착수/진행중/완료
  owner: text("owner"), // 담당자
  description: text("description"),
  actionPlan: text("action_plan"),
  dueDate: text("due_date"),
  completedDate: text("completed_date"),
  notes: text("notes"),
});

export const insertDeficiencySchema = createInsertSchema(deficiencies).omit({ id: true });
export type InsertDeficiency = z.infer<typeof insertDeficiencySchema>;
export type Deficiency = typeof deficiencies.$inferSelect;

// ─── 권고사항 (Recommendations) ───────────────────────────────────────────
export const recommendations = sqliteTable("recommendations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull(), // R1~R7
  title: text("title").notNull(),
  status: text("status").notNull().default("미착수"),
  owner: text("owner"),
  description: text("description"),
  dueDate: text("due_date"),
  notes: text("notes"),
});

export const insertRecommendationSchema = createInsertSchema(recommendations).omit({ id: true });
export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type Recommendation = typeof recommendations.$inferSelect;

// ─── 증빙자료 (Evidence Documents) ───────────────────────────────────────
export const evidences = sqliteTable("evidences", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  area: text("area").notNull(), // 인증영역 1~6
  criterion: text("criterion"), // 세부기준
  title: text("title").notNull(),
  docType: text("doc_type"), // 문서유형
  status: text("status").notNull().default("미제출"), // 미제출/수집중/완료
  owner: text("owner"),
  dueDate: text("due_date"),
  fileUrl: text("file_url"),
  notes: text("notes"),
  deficiencyCode: text("deficiency_code"), // 연계 미흡사항
  uploadedAt: text("uploaded_at"),
});

export const insertEvidenceSchema = createInsertSchema(evidences).omit({ id: true });
export type InsertEvidence = z.infer<typeof insertEvidenceSchema>;
export type Evidence = typeof evidences.$inferSelect;

// ─── TFT 일정 (Schedule) ──────────────────────────────────────────────────
export const schedules = sqliteTable("schedules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  phase: text("phase").notNull(), // Phase 1~4
  title: text("title").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  owner: text("owner"),
  status: text("status").notNull().default("예정"), // 예정/진행중/완료/지연
  area: text("area"), // 관련 인증영역
  priority: text("priority").default("보통"), // 높음/보통/낮음
  notes: text("notes"),
});

export const insertScheduleSchema = createInsertSchema(schedules).omit({ id: true });
export type InsertSchedule = z.infer<typeof insertScheduleSchema>;
export type Schedule = typeof schedules.$inferSelect;

// ─── 체크리스트 (Checklist) ──────────────────────────────────────────────
export const checklists = sqliteTable("checklists", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  area: text("area").notNull(), // 인증영역
  category: text("category"), // 세부항목
  item: text("item").notNull(),
  checked: integer("checked", { mode: "boolean" }).default(false),
  owner: text("owner"),
  notes: text("notes"),
  dueDate: text("due_date"),
});

export const insertChecklistSchema = createInsertSchema(checklists).omit({ id: true });
export type InsertChecklist = z.infer<typeof insertChecklistSchema>;
export type Checklist = typeof checklists.$inferSelect;

// ─── 회의록 (Meeting Notes) ──────────────────────────────────────────────
export const meetings = sqliteTable("meetings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  date: text("date").notNull(),
  attendees: text("attendees"), // JSON array as text
  agenda: text("agenda"),
  minutes: text("minutes"),
  actionItems: text("action_items"), // JSON array as text
  createdAt: text("created_at"),
});

export const insertMeetingSchema = createInsertSchema(meetings).omit({ id: true });
export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type Meeting = typeof meetings.$inferSelect;
