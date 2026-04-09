import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarDays, Plus, CheckCircle2, Clock, Circle, AlertCircle } from "lucide-react";

type Schedule = {
  id: number; phase: string; title: string; startDate: string; endDate: string;
  owner?: string; status: string; area?: string; priority?: string; notes?: string;
};

const PHASES = ["전체", "Phase 1", "Phase 2", "Phase 3", "Phase 4"];
const STATUS_OPTIONS = ["예정", "진행중", "완료", "지연"];
const statusColors: Record<string, string> = {
  "완료": "badge-completed",
  "진행중": "badge-inprogress",
  "예정": "badge-notstarted",
  "지연": "badge-delayed",
};
const priorityColors: Record<string, string> = {
  "높음": "badge-high",
  "보통": "badge-mid",
  "낮음": "badge-low",
};

const phaseColors: Record<string, string> = {
  "Phase 1": "hsl(196 78% 28%)",
  "Phase 2": "hsl(160 60% 30%)",
  "Phase 3": "hsl(280 55% 45%)",
  "Phase 4": "hsl(35 80% 42%)",
};

function ScheduleDialog({
  item, open, onClose
}: { item: Schedule | null; open: boolean; onClose: () => void; }) {
  const isEdit = !!item;
  const [form, setForm] = useState({
    phase: item?.phase || "Phase 1",
    title: item?.title || "",
    startDate: item?.startDate || "",
    endDate: item?.endDate || "",
    owner: item?.owner || "",
    status: item?.status || "예정",
    area: item?.area || "",
    priority: item?.priority || "보통",
    notes: item?.notes || "",
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const createMut = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/schedules", data).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/schedules"] }); queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] }); onClose(); },
  });
  const updateMut = useMutation({
    mutationFn: (data: any) => apiRequest("PATCH", `/api/schedules/${item?.id}`, data).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/schedules"] }); queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] }); onClose(); },
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm">{isEdit ? "일정 수정" : "일정 추가"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Phase</Label>
              <Select value={form.phase} onValueChange={v => setForm(f => ({ ...f, phase: v }))}>
                <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PHASES.slice(1).map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">상태</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs">일정 제목 <span className="text-red-500">*</span></Label>
            <Input value={form.title} onChange={set("title")} className="mt-1 h-8 text-sm" placeholder="일정 제목" data-testid="input-sched-title" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">시작일</Label>
              <Input type="date" value={form.startDate} onChange={set("startDate")} className="mt-1 h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">종료일</Label>
              <Input type="date" value={form.endDate} onChange={set("endDate")} className="mt-1 h-8 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">담당자</Label>
              <Input value={form.owner} onChange={set("owner")} className="mt-1 h-8 text-sm" placeholder="담당자" />
            </div>
            <div>
              <Label className="text-xs">우선순위</Label>
              <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["높음", "보통", "낮음"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs">메모</Label>
            <Textarea value={form.notes} onChange={set("notes")} className="mt-1 text-sm resize-none" rows={2} />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={onClose}>취소</Button>
            <Button size="sm"
              onClick={() => isEdit ? updateMut.mutate(form) : createMut.mutate(form)}
              disabled={createMut.isPending || updateMut.isPending}
              data-testid="btn-save-schedule">
              {createMut.isPending || updateMut.isPending ? "저장중..." : "저장"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Schedule() {
  const [activePhase, setActivePhase] = useState("전체");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Schedule | null>(null);

  const { data: schedules = [], isLoading } = useQuery<Schedule[]>({
    queryKey: ["/api/schedules"],
    queryFn: () => apiRequest("GET", "/api/schedules").then(r => r.json()),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/schedules/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/schedules"] }); queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] }); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiRequest("PATCH", `/api/schedules/${id}`, data).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/schedules"] }); queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] }); },
  });

  const filtered = activePhase === "전체" ? schedules : schedules.filter(s => s.phase === activePhase);
  const completed = schedules.filter(s => s.status === "완료").length;
  const inProgress = schedules.filter(s => s.status === "진행중").length;
  const delayed = schedules.filter(s => s.status === "지연").length;

  const phaseGroups = PHASES.slice(1).map(phase => ({
    phase,
    items: filtered.filter(s => s.phase === phase),
  })).filter(g => activePhase === "전체" || g.phase === activePhase);

  return (
    <div className="p-5 lg:p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">TFT 일정 관리</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Phase 1~4 단계별 실행 계획 추적</p>
        </div>
        <Button size="sm" onClick={() => { setEditItem(null); setDialogOpen(true); }} data-testid="btn-add-schedule">
          <Plus className="w-3.5 h-3.5 mr-1" />일정 추가
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-3 flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
          <div><p className="text-xl font-bold text-green-700">{completed}</p><p className="text-xs text-muted-foreground">완료</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-3 flex items-center gap-3">
          <Clock className="w-6 h-6 text-blue-600" />
          <div><p className="text-xl font-bold text-blue-700">{inProgress}</p><p className="text-xs text-muted-foreground">진행중</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-3 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <div><p className="text-xl font-bold text-red-600">{delayed}</p><p className="text-xs text-muted-foreground">지연</p></div>
        </CardContent></Card>
      </div>

      {/* Phase filter */}
      <div className="flex gap-1 flex-wrap">
        {PHASES.map(ph => (
          <button key={ph} onClick={() => setActivePhase(ph)}
            className={`px-3 py-1 text-xs rounded-full font-medium transition-all border
              ${activePhase === ph ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}
            data-testid={`filter-phase-${ph}`}>
            {ph}
          </button>
        ))}
      </div>

      {/* Schedule by phase */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />)}
        </div>
      ) : (
        <div className="space-y-5">
          {phaseGroups.map(({ phase, items }) => (
            items.length > 0 ? (
              <div key={phase}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: phaseColors[phase] || "hsl(196 78% 28%)" }} />
                  <h3 className="text-sm font-semibold">{phase}</h3>
                  <span className="text-xs text-muted-foreground">{items.filter(i => i.status === "완료").length}/{items.length}</span>
                </div>
                <div className="space-y-2 pl-4 border-l-2" style={{ borderColor: phaseColors[phase] || "hsl(196 78% 28%)" }}>
                  {items.map(sched => (
                    <Card key={sched.id} data-testid={`sched-item-${sched.id}`}>
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{sched.title}</p>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              <span className="text-xs text-muted-foreground">
                                {sched.startDate} ~ {sched.endDate}
                              </span>
                              {sched.owner && <span className="text-xs text-muted-foreground">담당: {sched.owner}</span>}
                              {sched.area && <span className="text-xs text-muted-foreground">{sched.area}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {sched.priority && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${priorityColors[sched.priority] || ""}`}>
                                {sched.priority}
                              </span>
                            )}
                            <Select
                              value={sched.status}
                              onValueChange={(v) => updateMut.mutate({ id: sched.id, data: { status: v } })}
                            >
                              <SelectTrigger className="h-6 text-[11px] w-20 px-1.5" data-testid={`select-status-${sched.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : null
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">해당 Phase의 일정이 없습니다</p>
            </div>
          )}
        </div>
      )}

      <ScheduleDialog
        item={dialogOpen ? editItem : null}
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditItem(null); }}
      />
    </div>
  );
}
