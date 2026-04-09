import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { sql } from "drizzle-orm";
import {
  deficiencies, recommendations, evidences, schedules, checklists, meetings
} from "@shared/schema";
import {
  insertDeficiencySchema, insertRecommendationSchema, insertEvidenceSchema,
  insertScheduleSchema, insertChecklistSchema, insertMeetingSchema,
} from "@shared/schema";

// Initialize DB tables
function initDB() {
  db.run(sql`CREATE TABLE IF NOT EXISTS deficiencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL,
    area TEXT NOT NULL,
    title TEXT NOT NULL,
    severity TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT '미착수',
    owner TEXT,
    description TEXT,
    action_plan TEXT,
    due_date TEXT,
    completed_date TEXT,
    notes TEXT
  )`);
  db.run(sql`CREATE TABLE IF NOT EXISTS recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT '미착수',
    owner TEXT,
    description TEXT,
    due_date TEXT,
    notes TEXT
  )`);
  db.run(sql`CREATE TABLE IF NOT EXISTS evidences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    area TEXT NOT NULL,
    criterion TEXT,
    title TEXT NOT NULL,
    doc_type TEXT,
    status TEXT NOT NULL DEFAULT '미제출',
    owner TEXT,
    due_date TEXT,
    file_url TEXT,
    notes TEXT,
    deficiency_code TEXT,
    uploaded_at TEXT
  )`);
  db.run(sql`CREATE TABLE IF NOT EXISTS schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phase TEXT NOT NULL,
    title TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    owner TEXT,
    status TEXT NOT NULL DEFAULT '예정',
    area TEXT,
    priority TEXT DEFAULT '보통',
    notes TEXT
  )`);
  db.run(sql`CREATE TABLE IF NOT EXISTS checklists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    area TEXT NOT NULL,
    category TEXT,
    item TEXT NOT NULL,
    checked INTEGER DEFAULT 0,
    owner TEXT,
    notes TEXT,
    due_date TEXT
  )`);
  db.run(sql`CREATE TABLE IF NOT EXISTS meetings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    attendees TEXT,
    agenda TEXT,
    minutes TEXT,
    action_items TEXT,
    created_at TEXT
  )`);

  // Seed initial data if empty
  const defCount = db.select().from(deficiencies).all().length;
  if (defCount === 0) {
    seedData();
  }
}

function seedData() {
  // Seed Deficiencies D1~D8
  const defData = [
    { code: "D1", area: "영역1", title: "운영 개선 체계 - 의견수렴 종합분석 환류 미흡", severity: "중", status: "진행중", owner: "학과발전위원회", description: "교육과정·교수·학생·졸업생·고용주로부터 수집한 의견에 대한 종합적 분석과 환류가 미흡함", actionPlan: "의견수렴 결과 분석 보고서 작성, 교육과정 편성위원회 검토 및 반영 근거 문서화", dueDate: "2026-12-31" },
    { code: "D2", area: "영역2", title: "모성간호학II 등 미달성자 재학습 실적 부족", severity: "상", status: "진행중", owner: "학습성과위원회", description: "프로그램 학습성과 미달성 학생에 대한 재학습 기회 제공 및 결과 기록이 부족함", actionPlan: "미달성자 재학습 프로그램 운영 지침 수립, 운영 일지 및 성과 기록 체계 구축", dueDate: "2026-08-31" },
    { code: "D3", area: "영역2", title: "건강사정실습 등 미성취 학생 관리 실적 미확인", severity: "상", status: "미착수", owner: "실습위원회", description: "교과목별 미성취 학생에 대한 체계적 관리 실적이 확인되지 않음", actionPlan: "교과목별 미성취 학생 관리 대장 작성, 지도 기록 및 성취 확인서 체계화", dueDate: "2026-06-30" },
    { code: "D4", area: "영역4", title: "박사학위+임상3년 전임교원 법정정원 61% 미충족", severity: "상", status: "진행중", owner: "학과장", description: "박사학위 소지 + 임상경력 3년 이상 전임교원이 법정정원(15명) 대비 61%에 불과함", actionPlan: "신규 전임교원 채용 계획 수립, 현 교원 자격 기준 충족 계획 작성, 단계적 정원 충족 로드맵", dueDate: "2027-12-31" },
    { code: "D5", area: "영역4", title: "일부 비전임교원 석사수료로 자격기준 미충족", severity: "상", status: "미착수", owner: "학과장", description: "비전임교원 일부가 석사 수료 상태로 간호교육인증 자격기준을 충족하지 못함", actionPlan: "해당 교원의 학위 취득 계획 확인 및 지원, 대체 교원 확보 방안 마련", dueDate: "2026-12-31" },
    { code: "D6", area: "영역5", title: "실습실/임상실습 인정시수 대학 규정 미비", severity: "상", status: "진행중", owner: "실습위원회", description: "실습실 실습 및 임상실습의 인정 시수 기준에 관한 대학 내 공식 규정이 마련되지 않음", actionPlan: "실습 시수 인정 기준 규정 제정, 학칙 또는 학과 규정 내 명문화", dueDate: "2026-06-30" },
    { code: "D7", area: "영역6", title: "국외 학술지(전자저널) 서비스 미확보", severity: "중", status: "미착수", owner: "행정조교", description: "간호학 관련 국외 전자저널 데이터베이스 구독 서비스가 확보되지 않음", actionPlan: "CINAHL, PubMed 등 간호학 전문 DB 구독 예산 확보 및 계약", dueDate: "2026-12-31" },
    { code: "D8", area: "영역2", title: "프로그램 학습성과 미달성자 관리 방안 미제시", severity: "상", status: "진행중", owner: "학습성과위원회", description: "프로그램 학습성과(PLO) 미달성자에 대한 공식적인 관리 방안이 제시되지 않음", actionPlan: "PLO 미달성자 관리 지침 수립, 재평가 체계 및 추적 관리 프로세스 문서화", dueDate: "2026-08-31" },
  ];
  for (const d of defData) {
    storage.createDeficiency(d as any);
  }

  // Seed Recommendations R1~R7
  const recData = [
    { code: "R1", title: "운영개선 환류 체계 고도화", status: "진행중", owner: "학과발전위원회", description: "교육과정 개선 환류의 근거 자료를 더욱 체계적으로 구축할 것을 권고", dueDate: "2027-06-30" },
    { code: "R2", title: "의학용어 이수구분 명확화", status: "미착수", owner: "교육과정편성위원회", description: "의학용어 교과목의 이수구분을 교양 또는 전공으로 명확히 구분하여 표기할 것을 권고", dueDate: "2026-12-31" },
    { code: "R3", title: "CQI 환류 체계 강화", status: "진행중", owner: "학습성과위원회", description: "교과목 CQI 결과가 교육과정 개편에 실질적으로 반영되는 체계를 강화할 것을 권고", dueDate: "2027-06-30" },
    { code: "R4", title: "전공 동아리 활성화", status: "미착수", owner: "학생지도위원회", description: "학생들의 전공 관련 동아리 활동을 활성화하고 지원 체계를 구축할 것을 권고", dueDate: "2027-06-30" },
    { code: "R5", title: "현장지도자 협의 체계 강화", status: "진행중", owner: "실습위원회", description: "임상실습 현장지도자와의 정기적 협의 체계를 더욱 강화할 것을 권고", dueDate: "2027-06-30" },
    { code: "R6", title: "교수 개발비 지원 확대", status: "미착수", owner: "학과장", description: "교수들의 전문성 개발을 위한 예산 지원을 확대할 것을 권고", dueDate: "2027-12-31" },
    { code: "R7", title: "설문조사 도구 표준화", status: "미착수", owner: "학과발전위원회", description: "교육 만족도 및 성과 평가를 위한 설문조사 도구의 표준화를 권고", dueDate: "2026-12-31" },
  ];
  for (const r of recData) {
    storage.createRecommendation(r as any);
  }

  // Seed Schedules
  const scheduleData = [
    { phase: "Phase 1", title: "TFT 구성 및 킥오프", startDate: "2026-04-01", endDate: "2026-05-31", owner: "학과장", status: "진행중", priority: "높음" },
    { phase: "Phase 1", title: "4주기 미흡사항 분석 및 개선계획 수립", startDate: "2026-04-01", endDate: "2026-06-30", owner: "전체 TFT", status: "진행중", priority: "높음" },
    { phase: "Phase 1", title: "D6 실습 규정 제정", startDate: "2026-04-01", endDate: "2026-06-30", owner: "실습위원회", status: "진행중", area: "영역5", priority: "높음" },
    { phase: "Phase 2", title: "5주기 인증기준 교과목 매핑", startDate: "2026-07-01", endDate: "2026-12-31", owner: "교육과정편성위원회", status: "예정", priority: "높음" },
    { phase: "Phase 2", title: "D7 전자저널 DB 구독 계약", startDate: "2026-07-01", endDate: "2026-12-31", owner: "행정조교", status: "예정", area: "영역6", priority: "보통" },
    { phase: "Phase 2", title: "D4/D5 교원 자격기준 충족 계획 실행", startDate: "2026-07-01", endDate: "2027-06-30", owner: "학과장", status: "예정", area: "영역4", priority: "높음" },
    { phase: "Phase 3", title: "자체평가 보고서 초안 작성", startDate: "2027-01-01", endDate: "2027-06-30", owner: "영역별 TFT팀장", status: "예정", priority: "높음" },
    { phase: "Phase 3", title: "모의 현장방문 평가", startDate: "2027-07-01", endDate: "2027-09-30", owner: "전체 TFT", status: "예정", priority: "높음" },
    { phase: "Phase 4", title: "자체평가 보고서 최종본 제출", startDate: "2027-10-01", endDate: "2028-03-31", owner: "학과장", status: "예정", priority: "높음" },
    { phase: "Phase 4", title: "현장방문 평가 대응", startDate: "2028-04-01", endDate: "2028-06-30", owner: "전체 TFT", status: "예정", priority: "높음" },
  ];
  for (const s of scheduleData) {
    storage.createSchedule(s as any);
  }

  // Seed Checklists
  const checklistData = [
    { area: "영역1", category: "사명·비전", item: "학과 사명 및 비전 선언문 최신화 확인", checked: false, owner: "학과발전위원회" },
    { area: "영역1", category: "사명·비전", item: "사명·비전·목적·목표 체계 문서화", checked: false },
    { area: "영역1", category: "운영개선", item: "의견수렴 결과 종합분석 보고서 작성 (D1)", checked: false, owner: "학과발전위원회" },
    { area: "영역1", category: "운영개선", item: "환류 결과 교육과정 반영 근거 문서화", checked: false },
    { area: "영역2", category: "학습성과", item: "PLO 미달성자 관리 지침 수립 (D8)", checked: false, owner: "학습성과위원회" },
    { area: "영역2", category: "학습성과", item: "모성간호학II 재학습 기회 제공 실적 문서화 (D2)", checked: false },
    { area: "영역2", category: "교과목 관리", item: "건강사정실습 미성취 학생 관리 대장 (D3)", checked: false, owner: "실습위원회" },
    { area: "영역2", category: "교과목 관리", item: "의학용어 이수구분 명확화 (R2)", checked: false, owner: "교육과정편성위원회" },
    { area: "영역2", category: "CQI", item: "교과목별 CQI 서식 표준화 (R3)", checked: false },
    { area: "영역2", category: "CQI", item: "CQI 환류 결과 교육과정 반영 증빙 (R3)", checked: false },
    { area: "영역4", category: "교원자격", item: "박사+임상3년 전임교원 채용 계획 수립 (D4)", checked: false, owner: "학과장" },
    { area: "영역4", category: "교원자격", item: "비전임교원 자격기준 충족 계획 문서화 (D5)", checked: false },
    { area: "영역4", category: "교수개발", item: "교수 개발비 지원 예산 계획 (R6)", checked: false },
    { area: "영역5", category: "임상실습", item: "실습 인정시수 규정 제정 완료 (D6)", checked: false, owner: "실습위원회" },
    { area: "영역5", category: "임상실습", item: "현장지도자 협의 체계 문서화 (R5)", checked: false },
    { area: "영역5", category: "임상실습", item: "임상실습 기관 협약 현황 최신화", checked: false },
    { area: "영역6", category: "교육자원", item: "국외 전자저널 DB 구독 계약 완료 (D7)", checked: false, owner: "행정조교" },
    { area: "영역6", category: "교육자원", item: "도서관 간호학 관련 장서 현황 업데이트", checked: false },
    { area: "영역6", category: "학생지원", item: "전공 동아리 운영 계획 수립 (R4)", checked: false, owner: "학생지도위원회" },
    { area: "영역6", category: "학생지원", item: "학생 상담 체계 운영 현황 문서화", checked: false },
  ];
  for (const c of checklistData) {
    storage.createChecklist(c as any);
  }

  // Seed Evidences
  const evidenceData = [
    { area: "영역1", criterion: "1-1", title: "학과 사명·비전·목적·목표 문서", docType: "공문/규정", status: "완료", owner: "학과발전위원회" },
    { area: "영역1", criterion: "1-2", title: "의견수렴 결과 분석 보고서", docType: "보고서", status: "수집중", owner: "학과발전위원회", deficiencyCode: "D1" },
    { area: "영역2", criterion: "2-1", title: "PLO 미달성자 관리 지침", docType: "지침/매뉴얼", status: "미제출", owner: "학습성과위원회", deficiencyCode: "D8" },
    { area: "영역2", criterion: "2-2", title: "모성간호학II 재학습 운영 실적", docType: "운영실적", status: "수집중", owner: "학습성과위원회", deficiencyCode: "D2" },
    { area: "영역2", criterion: "2-3", title: "건강사정실습 미성취 학생 관리 대장", docType: "관리대장", status: "미제출", owner: "실습위원회", deficiencyCode: "D3" },
    { area: "영역4", criterion: "4-1", title: "전임교원 자격 증빙 서류 일체", docType: "개인서류", status: "수집중", owner: "학과장", deficiencyCode: "D4" },
    { area: "영역4", criterion: "4-2", title: "비전임교원 자격기준 충족 계획서", docType: "계획서", status: "미제출", owner: "학과장", deficiencyCode: "D5" },
    { area: "영역5", criterion: "5-1", title: "실습 인정시수 기준 규정", docType: "공문/규정", status: "수집중", owner: "실습위원회", deficiencyCode: "D6" },
    { area: "영역5", criterion: "5-2", title: "현장지도자 협의 회의록", docType: "회의록", status: "수집중", owner: "실습위원회" },
    { area: "영역6", criterion: "6-1", title: "국외 전자저널 DB 구독 계약서", docType: "계약서", status: "미제출", owner: "행정조교", deficiencyCode: "D7" },
  ];
  for (const e of evidenceData) {
    storage.createEvidence(e as any);
  }
}

export async function registerRoutes(httpServer: Server, app: Express) {
  // Initialize DB
  initDB();

  // ─── Dashboard Stats ───────────────────────────────────────────────────
  app.get("/api/dashboard/stats", (_req, res) => {
    const defs = storage.getDeficiencies();
    const recs = storage.getRecommendations();
    const evs = storage.getEvidences();
    const checks = storage.getChecklists();
    const scheds = storage.getSchedules();

    const defStats = {
      total: defs.length,
      completed: defs.filter(d => d.status === "완료").length,
      inProgress: defs.filter(d => d.status === "진행중").length,
      notStarted: defs.filter(d => d.status === "미착수").length,
    };
    const recStats = {
      total: recs.length,
      completed: recs.filter(r => r.status === "완료").length,
      inProgress: recs.filter(r => r.status === "진행중").length,
    };
    const evStats = {
      total: evs.length,
      completed: evs.filter(e => e.status === "완료").length,
      inProgress: evs.filter(e => e.status === "수집중").length,
      notSubmitted: evs.filter(e => e.status === "미제출").length,
    };
    const checkStats = {
      total: checks.length,
      checked: checks.filter(c => c.checked).length,
    };
    const schedStats = {
      total: scheds.length,
      completed: scheds.filter(s => s.status === "완료").length,
      inProgress: scheds.filter(s => s.status === "진행중").length,
    };

    // Area completion rates
    const areas = ["영역1", "영역2", "영역3", "영역4", "영역5", "영역6"];
    const areaStats = areas.map(area => {
      const areaChecks = checks.filter(c => c.area === area);
      const areaEvs = evs.filter(e => e.area === area);
      const areaDefs = defs.filter(d => d.area === area);
      return {
        area,
        checkTotal: areaChecks.length,
        checkDone: areaChecks.filter(c => c.checked).length,
        evTotal: areaEvs.length,
        evDone: areaEvs.filter(e => e.status === "완료").length,
        defTotal: areaDefs.length,
        defDone: areaDefs.filter(d => d.status === "완료").length,
      };
    });

    res.json({ defStats, recStats, evStats, checkStats, schedStats, areaStats });
  });

  // ─── Deficiencies ──────────────────────────────────────────────────────
  app.get("/api/deficiencies", (_req, res) => {
    res.json(storage.getDeficiencies());
  });
  app.get("/api/deficiencies/:id", (req, res) => {
    const item = storage.getDeficiency(parseInt(req.params.id));
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  });
  app.patch("/api/deficiencies/:id", (req, res) => {
    const updated = storage.updateDeficiency(parseInt(req.params.id), req.body);
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  });

  // ─── Recommendations ───────────────────────────────────────────────────
  app.get("/api/recommendations", (_req, res) => {
    res.json(storage.getRecommendations());
  });
  app.patch("/api/recommendations/:id", (req, res) => {
    const updated = storage.updateRecommendation(parseInt(req.params.id), req.body);
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  });

  // ─── Evidences ─────────────────────────────────────────────────────────
  app.get("/api/evidences", (req, res) => {
    const { area } = req.query;
    if (area) res.json(storage.getEvidencesByArea(area as string));
    else res.json(storage.getEvidences());
  });
  app.post("/api/evidences", (req, res) => {
    const parsed = insertEvidenceSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    res.json(storage.createEvidence(parsed.data));
  });
  app.patch("/api/evidences/:id", (req, res) => {
    const updated = storage.updateEvidence(parseInt(req.params.id), req.body);
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  });
  app.delete("/api/evidences/:id", (req, res) => {
    storage.deleteEvidence(parseInt(req.params.id));
    res.json({ success: true });
  });

  // ─── Schedules ─────────────────────────────────────────────────────────
  app.get("/api/schedules", (_req, res) => {
    res.json(storage.getSchedules());
  });
  app.post("/api/schedules", (req, res) => {
    const parsed = insertScheduleSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    res.json(storage.createSchedule(parsed.data));
  });
  app.patch("/api/schedules/:id", (req, res) => {
    const updated = storage.updateSchedule(parseInt(req.params.id), req.body);
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  });
  app.delete("/api/schedules/:id", (req, res) => {
    storage.deleteSchedule(parseInt(req.params.id));
    res.json({ success: true });
  });

  // ─── Checklists ────────────────────────────────────────────────────────
  app.get("/api/checklists", (req, res) => {
    const { area } = req.query;
    if (area) res.json(storage.getChecklistsByArea(area as string));
    else res.json(storage.getChecklists());
  });
  app.post("/api/checklists", (req, res) => {
    const parsed = insertChecklistSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    res.json(storage.createChecklist(parsed.data));
  });
  app.patch("/api/checklists/:id", (req, res) => {
    const updated = storage.updateChecklist(parseInt(req.params.id), req.body);
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  });

  // ─── Meetings ──────────────────────────────────────────────────────────
  app.get("/api/meetings", (_req, res) => {
    res.json(storage.getMeetings());
  });
  app.get("/api/meetings/:id", (req, res) => {
    const item = storage.getMeeting(parseInt(req.params.id));
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  });
  app.post("/api/meetings", (req, res) => {
    const data = { ...req.body, createdAt: new Date().toISOString() };
    res.json(storage.createMeeting(data));
  });
  app.patch("/api/meetings/:id", (req, res) => {
    const updated = storage.updateMeeting(parseInt(req.params.id), req.body);
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  });
  app.delete("/api/meetings/:id", (req, res) => {
    storage.deleteMeeting(parseInt(req.params.id));
    res.json({ success: true });
  });
}
