import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import {
  deficiencies, insertDeficiencySchema,
  recommendations, insertRecommendationSchema,
  evidences, insertEvidenceSchema,
  schedules, insertScheduleSchema,
  checklists, insertChecklistSchema,
  meetings, insertMeetingSchema,
  type Deficiency, type InsertDeficiency,
  type Recommendation, type InsertRecommendation,
  type Evidence, type InsertEvidence,
  type Schedule, type InsertSchedule,
  type Checklist, type InsertChecklist,
  type Meeting, type InsertMeeting,
} from "@shared/schema";

export interface IStorage {
  // Deficiencies
  getDeficiencies(): Deficiency[];
  getDeficiency(id: number): Deficiency | undefined;
  createDeficiency(data: InsertDeficiency): Deficiency;
  updateDeficiency(id: number, data: Partial<InsertDeficiency>): Deficiency | undefined;

  // Recommendations
  getRecommendations(): Recommendation[];
  createRecommendation(data: InsertRecommendation): Recommendation;
  updateRecommendation(id: number, data: Partial<InsertRecommendation>): Recommendation | undefined;

  // Evidences
  getEvidences(): Evidence[];
  getEvidencesByArea(area: string): Evidence[];
  createEvidence(data: InsertEvidence): Evidence;
  updateEvidence(id: number, data: Partial<InsertEvidence>): Evidence | undefined;
  deleteEvidence(id: number): void;

  // Schedules
  getSchedules(): Schedule[];
  createSchedule(data: InsertSchedule): Schedule;
  updateSchedule(id: number, data: Partial<InsertSchedule>): Schedule | undefined;
  deleteSchedule(id: number): void;

  // Checklists
  getChecklists(): Checklist[];
  getChecklistsByArea(area: string): Checklist[];
  createChecklist(data: InsertChecklist): Checklist;
  updateChecklist(id: number, data: Partial<InsertChecklist>): Checklist | undefined;

  // Meetings
  getMeetings(): Meeting[];
  getMeeting(id: number): Meeting | undefined;
  createMeeting(data: InsertMeeting): Meeting;
  updateMeeting(id: number, data: Partial<InsertMeeting>): Meeting | undefined;
  deleteMeeting(id: number): void;
}

export class DatabaseStorage implements IStorage {
  // Deficiencies
  getDeficiencies(): Deficiency[] {
    return db.select().from(deficiencies).all();
  }
  getDeficiency(id: number): Deficiency | undefined {
    return db.select().from(deficiencies).where(eq(deficiencies.id, id)).get();
  }
  createDeficiency(data: InsertDeficiency): Deficiency {
    return db.insert(deficiencies).values(data).returning().get();
  }
  updateDeficiency(id: number, data: Partial<InsertDeficiency>): Deficiency | undefined {
    return db.update(deficiencies).set(data).where(eq(deficiencies.id, id)).returning().get();
  }

  // Recommendations
  getRecommendations(): Recommendation[] {
    return db.select().from(recommendations).all();
  }
  createRecommendation(data: InsertRecommendation): Recommendation {
    return db.insert(recommendations).values(data).returning().get();
  }
  updateRecommendation(id: number, data: Partial<InsertRecommendation>): Recommendation | undefined {
    return db.update(recommendations).set(data).where(eq(recommendations.id, id)).returning().get();
  }

  // Evidences
  getEvidences(): Evidence[] {
    return db.select().from(evidences).all();
  }
  getEvidencesByArea(area: string): Evidence[] {
    return db.select().from(evidences).where(eq(evidences.area, area)).all();
  }
  createEvidence(data: InsertEvidence): Evidence {
    return db.insert(evidences).values(data).returning().get();
  }
  updateEvidence(id: number, data: Partial<InsertEvidence>): Evidence | undefined {
    return db.update(evidences).set(data).where(eq(evidences.id, id)).returning().get();
  }
  deleteEvidence(id: number): void {
    db.delete(evidences).where(eq(evidences.id, id)).run();
  }

  // Schedules
  getSchedules(): Schedule[] {
    return db.select().from(schedules).all();
  }
  createSchedule(data: InsertSchedule): Schedule {
    return db.insert(schedules).values(data).returning().get();
  }
  updateSchedule(id: number, data: Partial<InsertSchedule>): Schedule | undefined {
    return db.update(schedules).set(data).where(eq(schedules.id, id)).returning().get();
  }
  deleteSchedule(id: number): void {
    db.delete(schedules).where(eq(schedules.id, id)).run();
  }

  // Checklists
  getChecklists(): Checklist[] {
    return db.select().from(checklists).all();
  }
  getChecklistsByArea(area: string): Checklist[] {
    return db.select().from(checklists).where(eq(checklists.area, area)).all();
  }
  createChecklist(data: InsertChecklist): Checklist {
    return db.insert(checklists).values(data).returning().get();
  }
  updateChecklist(id: number, data: Partial<InsertChecklist>): Checklist | undefined {
    return db.update(checklists).set(data).where(eq(checklists.id, id)).returning().get();
  }

  // Meetings
  getMeetings(): Meeting[] {
    return db.select().from(meetings).orderBy(desc(meetings.date)).all();
  }
  getMeeting(id: number): Meeting | undefined {
    return db.select().from(meetings).where(eq(meetings.id, id)).get();
  }
  createMeeting(data: InsertMeeting): Meeting {
    return db.insert(meetings).values(data).returning().get();
  }
  updateMeeting(id: number, data: Partial<InsertMeeting>): Meeting | undefined {
    return db.update(meetings).set(data).where(eq(meetings.id, id)).returning().get();
  }
  deleteMeeting(id: number): void {
    db.delete(meetings).where(eq(meetings.id, id)).run();
  }
}

export const storage = new DatabaseStorage();
