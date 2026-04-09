import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, CheckCircle2, Clock, Circle, ChevronDown, ChevronUp, ListChecks } from "lucide-react";

type Deficiency = {
  id: number; code: string; area: string; title: string; severity: string;
  status: string; owner?: string; description?: string; actionPlan?: string;
  dueDate?: string; completedDate?: string; notes?: string;
};

type Recommendation = {
  id: number; code: string; title: string; status: string;
  owner?: string; description?: string; dueDate?: string; notes?: string;
};

const statusColors: Record<string, string> = {
  "완료": "badge-completed",
  "진행중": "badge-inprogress",
  "미착수": "badge-notstarted",
};

const severityColors: Record<string, string> = {
  "상": "badge-high",
  "중": "badge-mid",
  "하": "badge-low",
};

function DeficiencyCard({ def, onEdit }: { def: Deficiency; onEdit: (d: Deficiency) => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card className="overflow-hidden" data-testid={`def-card-${def.code}`}>
      <div className={`h-1 ${def.severity === "상" ? "bg-red-500" : def.severity === "중" ? "bg-yellow-500" : "bg-gray-300"}`} />
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-bold text-primary">{def.code}</span>
              <Badge variant="outline" className="text-[10px] px-1.5 h-4">{def.area}</Badge>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${severityColors[def.severity]}`}>
                심각도: {def.severity}
              </span>
            </div>
            <p className="text-sm font-medium leading-snug">{def.title}</p>
          </div>
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium shrink-0 ${statusColors[def.status]}`}>
            {def.status}
          </span>
        </div>

        {def.owner && (
          <p className="text-xs text-muted-foreground mt-2">
            담당: {def.owner} {def.dueDate && `· 기한: ${def.dueDate}`}
          </p>
        )}

        <button
          className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? "접기" : "상세보기"}
        </button>

        {expanded && (
          <div className="mt-3 space-y-2 border-t border-border pt-3">
            {def.description && (
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground mb-0.5">문제 설명</p>
                <p className="text-xs text-foreground">{def.description}</p>
              </div>
            )}
            {def.actionPlan && (
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground mb-0.5">개선 계획</p>
                <p className="text-xs text-foreground">{def.actionPlan}</p>
              </div>
            )}
            {def.notes && (
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground mb-0.5">메모</p>
                <p className="text-xs text-foreground">{def.notes}</p>
              </div>
            )}
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7"
              onClick={() => onEdit(def)}
              data-testid={`btn-edit-${def.code}`}
            >
              상태 업데이트
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EditDialog({
  item, type, open, onClose
}: {
  item: Deficiency | Recommendation | null; type: "deficiency" | "recommendation";
  open: boolean; onClose: () => void;
}) {
  const [status, setStatus] = useState(item?.status || "미착수");
  const [notes, setNotes] = useState(item?.notes || "");
  const [owner, setOwner] = useState(item?.owner || "");
  const [dueDate, setDueDate] = useState((item as any)?.dueDate || "");

  const endpoint = type === "deficiency" ? `/api/deficiencies/${item?.id}` : `/api/recommendations/${item?.id}`;
  const queryKey = type === "deficiency" ? ["/api/deficiencies"] : ["/api/recommendations"];

  const mutation = useMutation({
    mutationFn: (data: any) => apiRequest("PATCH", endpoint, data).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      onClose();
    },
  });

  const statusOptions = ["미착수", "진행중", "완료"];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm">
            {item && "code" in item ? item.code : ""} — 상태 업데이트
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div>
            <Label className="text-xs">진행 상태</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="mt-1 h-8 text-sm" data-testid="select-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">담당자</Label>
            <Input
              value={owner}
              onChange={e => setOwner(e.target.value)}
              className="mt-1 h-8 text-sm"
              placeholder="담당자 이름"
              data-testid="input-owner"
            />
          </div>
          <div>
            <Label className="text-xs">기한</Label>
            <Input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="mt-1 h-8 text-sm"
              data-testid="input-due-date"
            />
          </div>
          <div>
            <Label className="text-xs">메모</Label>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="mt-1 text-sm resize-none"
              rows={3}
              placeholder="진행 상황 메모..."
              data-testid="textarea-notes"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={onClose}>취소</Button>
            <Button
              size="sm"
              onClick={() => mutation.mutate({ status, notes, owner, dueDate })}
              disabled={mutation.isPending}
              data-testid="btn-save-status"
            >
              {mutation.isPending ? "저장중..." : "저장"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Deficiencies() {
  const [editItem, setEditItem] = useState<Deficiency | Recommendation | null>(null);
  const [editType, setEditType] = useState<"deficiency" | "recommendation">("deficiency");
  const [filterStatus, setFilterStatus] = useState("전체");
  const [activeTab, setActiveTab] = useState<"deficiency" | "recommendation">("deficiency");

  const { data: deficiencies = [], isLoading: defLoading } = useQuery<Deficiency[]>({
    queryKey: ["/api/deficiencies"],
    queryFn: () => apiRequest("GET", "/api/deficiencies").then(r => r.json()),
  });

  const { data: recommendations = [], isLoading: recLoading } = useQuery<Recommendation[]>({
    queryKey: ["/api/recommendations"],
    queryFn: () => apiRequest("GET", "/api/recommendations").then(r => r.json()),
  });

  const filteredDefs = filterStatus === "전체"
    ? deficiencies
    : deficiencies.filter(d => d.status === filterStatus);

  const filteredRecs = filterStatus === "전체"
    ? recommendations
    : recommendations.filter(r => r.status === filterStatus);

  const completedDefs = deficiencies.filter(d => d.status === "완료").length;
  const inProgressDefs = deficiencies.filter(d => d.status === "진행중").length;
  const notStartedDefs = deficiencies.filter(d => d.status === "미착수").length;

  return (
    <div className="p-5 lg:p-6 max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold">미흡·권고사항 관리</h1>
        <p className="text-sm text-muted-foreground mt-0.5">4주기 미흡사항 D1~D8 및 권고사항 R1~R7 개선 추적</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className={`cursor-pointer ${filterStatus === "완료" ? "border-green-500/50" : ""}`}
          onClick={() => setFilterStatus(filterStatus === "완료" ? "전체" : "완료")}>
          <CardContent className="p-3 text-center">
            <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-green-700">{completedDefs}</p>
            <p className="text-xs text-muted-foreground">완료</p>
          </CardContent>
        </Card>
        <Card className={`cursor-pointer ${filterStatus === "진행중" ? "border-blue-500/50" : ""}`}
          onClick={() => setFilterStatus(filterStatus === "진행중" ? "전체" : "진행중")}>
          <CardContent className="p-3 text-center">
            <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-blue-700">{inProgressDefs}</p>
            <p className="text-xs text-muted-foreground">진행중</p>
          </CardContent>
        </Card>
        <Card className={`cursor-pointer ${filterStatus === "미착수" ? "border-gray-500/50" : ""}`}
          onClick={() => setFilterStatus(filterStatus === "미착수" ? "전체" : "미착수")}>
          <CardContent className="p-3 text-center">
            <Circle className="w-5 h-5 text-gray-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-600">{notStartedDefs}</p>
            <p className="text-xs text-muted-foreground">미착수</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        {(["deficiency", "recommendation"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
              activeTab === tab ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
            }`}
            data-testid={`tab-${tab}`}
          >
            {tab === "deficiency" ? "미흡사항 (D1~D8)" : "권고사항 (R1~R7)"}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "deficiency" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {defLoading
            ? [...Array(4)].map((_, i) => <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />)
            : filteredDefs.map(def => (
              <DeficiencyCard
                key={def.id}
                def={def}
                onEdit={(d) => { setEditItem(d); setEditType("deficiency"); }}
              />
            ))
          }
        </div>
      )}

      {activeTab === "recommendation" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {recLoading
            ? [...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />)
            : filteredRecs.map(rec => (
              <Card key={rec.id} data-testid={`rec-card-${rec.code}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-primary">{rec.code}</span>
                      </div>
                      <p className="text-sm font-medium">{rec.title}</p>
                      {rec.description && <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>}
                      {rec.owner && (
                        <p className="text-xs text-muted-foreground mt-1.5">
                          담당: {rec.owner} {rec.dueDate && `· 기한: ${rec.dueDate}`}
                        </p>
                      )}
                    </div>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium shrink-0 ${statusColors[rec.status]}`}>
                      {rec.status}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 mt-2"
                    onClick={() => { setEditItem(rec); setEditType("recommendation"); }}
                    data-testid={`btn-edit-${rec.code}`}
                  >
                    업데이트
                  </Button>
                </CardContent>
              </Card>
            ))
          }
        </div>
      )}

      <EditDialog
        item={editItem}
        type={editType}
        open={!!editItem}
        onClose={() => setEditItem(null)}
      />
    </div>
  );
}
