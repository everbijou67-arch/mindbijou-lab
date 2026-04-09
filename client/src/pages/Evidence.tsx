import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Plus, CheckCircle2, Clock, Circle, Filter } from "lucide-react";

type Evidence = {
  id: number; area: string; criterion?: string; title: string; docType?: string;
  status: string; owner?: string; dueDate?: string; fileUrl?: string;
  notes?: string; deficiencyCode?: string; uploadedAt?: string;
};

const AREAS = ["전체", "영역1", "영역2", "영역3", "영역4", "영역5", "영역6"];
const STATUS_OPTIONS = ["미제출", "수집중", "완료"];
const statusColors: Record<string, string> = {
  "완료": "badge-completed",
  "수집중": "badge-inprogress",
  "미제출": "badge-notstarted",
};

function EvidenceDialog({
  item, open, onClose
}: {
  item: Evidence | null; open: boolean; onClose: () => void;
}) {
  const isEdit = !!item;
  const [form, setForm] = useState({
    area: item?.area || "영역1",
    criterion: item?.criterion || "",
    title: item?.title || "",
    docType: item?.docType || "",
    status: item?.status || "미제출",
    owner: item?.owner || "",
    dueDate: item?.dueDate || "",
    notes: item?.notes || "",
    deficiencyCode: item?.deficiencyCode || "",
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const createMut = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/evidences", data).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/evidences"] }); queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] }); onClose(); },
  });
  const updateMut = useMutation({
    mutationFn: (data: any) => apiRequest("PATCH", `/api/evidences/${item?.id}`, data).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/evidences"] }); queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] }); onClose(); },
  });

  const handleSave = () => {
    if (!form.title) return;
    if (isEdit) updateMut.mutate(form);
    else createMut.mutate(form);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm">{isEdit ? "증빙자료 수정" : "증빙자료 추가"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">인증영역</Label>
              <Select value={form.area} onValueChange={v => setForm(f => ({ ...f, area: v }))}>
                <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AREAS.slice(1).map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
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
            <Label className="text-xs">자료 제목 <span className="text-red-500">*</span></Label>
            <Input value={form.title} onChange={set("title")} className="mt-1 h-8 text-sm" placeholder="자료 제목" data-testid="input-ev-title" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">문서 유형</Label>
              <Input value={form.docType} onChange={set("docType")} className="mt-1 h-8 text-sm" placeholder="예: 보고서, 회의록" />
            </div>
            <div>
              <Label className="text-xs">담당자</Label>
              <Input value={form.owner} onChange={set("owner")} className="mt-1 h-8 text-sm" placeholder="담당자" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">연계 미흡사항</Label>
              <Input value={form.deficiencyCode} onChange={set("deficiencyCode")} className="mt-1 h-8 text-sm" placeholder="예: D1" />
            </div>
            <div>
              <Label className="text-xs">제출 기한</Label>
              <Input type="date" value={form.dueDate} onChange={set("dueDate")} className="mt-1 h-8 text-sm" />
            </div>
          </div>
          <div>
            <Label className="text-xs">메모</Label>
            <Textarea value={form.notes} onChange={set("notes")} className="mt-1 text-sm resize-none" rows={2} />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={onClose}>취소</Button>
            <Button size="sm" onClick={handleSave} disabled={createMut.isPending || updateMut.isPending} data-testid="btn-save-evidence">
              {createMut.isPending || updateMut.isPending ? "저장중..." : "저장"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Evidence() {
  const [activeArea, setActiveArea] = useState("전체");
  const [filterStatus, setFilterStatus] = useState("전체");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Evidence | null>(null);

  const { data: evidences = [], isLoading } = useQuery<Evidence[]>({
    queryKey: ["/api/evidences"],
    queryFn: () => apiRequest("GET", "/api/evidences").then(r => r.json()),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/evidences/${id}`).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evidences"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
  });

  const filtered = evidences.filter(e => {
    const areaMatch = activeArea === "전체" || e.area === activeArea;
    const statusMatch = filterStatus === "전체" || e.status === filterStatus;
    return areaMatch && statusMatch;
  });

  const completed = evidences.filter(e => e.status === "완료").length;
  const inProgress = evidences.filter(e => e.status === "수집중").length;
  const notSubmitted = evidences.filter(e => e.status === "미제출").length;

  const groupedByArea = AREAS.slice(1).map(area => ({
    area,
    items: filtered.filter(e => e.area === area),
    total: evidences.filter(e => e.area === area).length,
    done: evidences.filter(e => e.area === area && e.status === "완료").length,
  })).filter(g => activeArea === "전체" || g.area === activeArea);

  return (
    <div className="p-5 lg:p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">증빙자료 관리</h1>
          <p className="text-sm text-muted-foreground mt-0.5">6개 인증 영역별 증빙자료 수집 현황</p>
        </div>
        <Button size="sm" onClick={() => { setEditItem(null); setDialogOpen(true); }} data-testid="btn-add-evidence">
          <Plus className="w-3.5 h-3.5 mr-1" />자료 추가
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className={`cursor-pointer ${filterStatus === "완료" ? "ring-1 ring-green-500" : ""}`}
          onClick={() => setFilterStatus(filterStatus === "완료" ? "전체" : "완료")}>
          <CardContent className="p-3 flex items-center gap-3">
            <CheckCircle2 className="w-7 h-7 text-green-600 shrink-0" />
            <div>
              <p className="text-xl font-bold text-green-700">{completed}</p>
              <p className="text-xs text-muted-foreground">수집 완료</p>
            </div>
          </CardContent>
        </Card>
        <Card className={`cursor-pointer ${filterStatus === "수집중" ? "ring-1 ring-blue-500" : ""}`}
          onClick={() => setFilterStatus(filterStatus === "수집중" ? "전체" : "수집중")}>
          <CardContent className="p-3 flex items-center gap-3">
            <Clock className="w-7 h-7 text-blue-600 shrink-0" />
            <div>
              <p className="text-xl font-bold text-blue-700">{inProgress}</p>
              <p className="text-xs text-muted-foreground">수집 중</p>
            </div>
          </CardContent>
        </Card>
        <Card className={`cursor-pointer ${filterStatus === "미제출" ? "ring-1 ring-gray-400" : ""}`}
          onClick={() => setFilterStatus(filterStatus === "미제출" ? "전체" : "미제출")}>
          <CardContent className="p-3 flex items-center gap-3">
            <Circle className="w-7 h-7 text-gray-400 shrink-0" />
            <div>
              <p className="text-xl font-bold text-gray-600">{notSubmitted}</p>
              <p className="text-xs text-muted-foreground">미제출</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Area filter tabs */}
      <div className="flex gap-1 flex-wrap">
        {AREAS.map(area => (
          <button
            key={area}
            onClick={() => setActiveArea(area)}
            className={`px-3 py-1 text-xs rounded-full font-medium transition-all border
              ${activeArea === area
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary/30"}`}
            data-testid={`filter-area-${area}`}
          >
            {area}
          </button>
        ))}
      </div>

      {/* Evidence by area */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {groupedByArea.map(({ area, items, total, done }) => (
            items.length > 0 ? (
              <div key={area}>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-sm font-semibold">{area}</h3>
                  <span className="text-xs text-muted-foreground">{done}/{total} 완료</span>
                  <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden ml-1">
                    <div className="h-full bg-primary/60 rounded-full transition-all"
                      style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }} />
                  </div>
                </div>
                <div className="space-y-2">
                  {items.map(ev => (
                    <Card key={ev.id} data-testid={`ev-item-${ev.id}`}>
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                              <p className="text-sm font-medium">{ev.title}</p>
                              {ev.deficiencyCode && (
                                <Badge variant="outline" className="text-[9px] px-1 h-3.5">
                                  {ev.deficiencyCode}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              {ev.docType && <span className="text-xs text-muted-foreground">{ev.docType}</span>}
                              {ev.owner && <span className="text-xs text-muted-foreground">담당: {ev.owner}</span>}
                              {ev.dueDate && <span className="text-xs text-muted-foreground">기한: {ev.dueDate}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${statusColors[ev.status]}`}>
                              {ev.status}
                            </span>
                            <button
                              onClick={() => { setEditItem(ev); setDialogOpen(true); }}
                              className="text-xs text-muted-foreground hover:text-foreground"
                              data-testid={`btn-edit-ev-${ev.id}`}
                            >
                              수정
                            </button>
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
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">해당 조건의 증빙자료가 없습니다</p>
            </div>
          )}
        </div>
      )}

      <EvidenceDialog
        item={dialogOpen ? editItem : null}
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditItem(null); }}
      />
    </div>
  );
}
