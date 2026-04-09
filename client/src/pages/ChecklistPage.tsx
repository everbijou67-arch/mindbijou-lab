import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { CheckSquare, Plus } from "lucide-react";

type Checklist = {
  id: number; area: string; category?: string; item: string;
  checked: boolean; owner?: string; notes?: string; dueDate?: string;
};

const AREAS = ["전체", "영역1", "영역2", "영역3", "영역4", "영역5", "영역6"];

const AREA_COLORS: Record<string, string> = {
  "영역1": "hsl(196 78% 28%)",
  "영역2": "hsl(160 60% 30%)",
  "영역3": "hsl(220 70% 45%)",
  "영역4": "hsl(280 55% 45%)",
  "영역5": "hsl(35 80% 42%)",
  "영역6": "hsl(0 65% 45%)",
};

function AddDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ area: "영역1", category: "", item: "", owner: "", dueDate: "" });
  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [field]: e.target.value }));

  const createMut = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/checklists", data).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checklists"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      onClose();
      setForm({ area: "영역1", category: "", item: "", owner: "", dueDate: "" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle className="text-sm">체크리스트 항목 추가</DialogTitle></DialogHeader>
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
              <Label className="text-xs">카테고리</Label>
              <Input value={form.category} onChange={set("category")} className="mt-1 h-8 text-sm" placeholder="예: 교원자격" />
            </div>
          </div>
          <div>
            <Label className="text-xs">체크리스트 항목 <span className="text-red-500">*</span></Label>
            <Input value={form.item} onChange={set("item")} className="mt-1 h-8 text-sm" placeholder="확인해야 할 항목" data-testid="input-checklist-item" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">담당자</Label>
              <Input value={form.owner} onChange={set("owner")} className="mt-1 h-8 text-sm" placeholder="담당자" />
            </div>
            <div>
              <Label className="text-xs">기한</Label>
              <Input type="date" value={form.dueDate} onChange={set("dueDate")} className="mt-1 h-8 text-sm" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={onClose}>취소</Button>
            <Button size="sm" onClick={() => createMut.mutate(form)} disabled={!form.item || createMut.isPending} data-testid="btn-save-checklist">
              {createMut.isPending ? "저장중..." : "추가"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ChecklistPage() {
  const [activeArea, setActiveArea] = useState("전체");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: checklists = [], isLoading } = useQuery<Checklist[]>({
    queryKey: ["/api/checklists"],
    queryFn: () => apiRequest("GET", "/api/checklists").then(r => r.json()),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, checked }: { id: number; checked: boolean }) =>
      apiRequest("PATCH", `/api/checklists/${id}`, { checked }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checklists"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
  });

  const filtered = activeArea === "전체" ? checklists : checklists.filter(c => c.area === activeArea);
  const checkedCount = filtered.filter(c => c.checked).length;
  const progress = filtered.length > 0 ? Math.round((checkedCount / filtered.length) * 100) : 0;

  // Group by area → category
  const areaGroups = AREAS.slice(1).map(area => {
    const items = filtered.filter(c => c.area === area);
    if (items.length === 0) return null;

    const categories = [...new Set(items.map(c => c.category || "일반"))];
    const catGroups = categories.map(cat => ({
      cat,
      items: items.filter(c => (c.category || "일반") === cat),
    }));

    return { area, items, catGroups };
  }).filter(Boolean);

  return (
    <div className="p-5 lg:p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">체크리스트</h1>
          <p className="text-sm text-muted-foreground mt-0.5">6개 인증 영역별 준비 사항 점검</p>
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)} data-testid="btn-add-checklist">
          <Plus className="w-3.5 h-3.5 mr-1" />항목 추가
        </Button>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {activeArea === "전체" ? "전체 진행률" : `${activeArea} 진행률`}
            </span>
            <span className="text-sm font-bold text-primary">{checkedCount}/{filtered.length} ({progress}%)</span>
          </div>
          <Progress value={progress} className="h-3" />
        </CardContent>
      </Card>

      {/* Area filter */}
      <div className="flex gap-1 flex-wrap">
        {AREAS.map(area => {
          const areaItems = area === "전체" ? checklists : checklists.filter(c => c.area === area);
          const areaChecked = areaItems.filter(c => c.checked).length;
          return (
            <button key={area} onClick={() => setActiveArea(area)}
              className={`px-3 py-1 text-xs rounded-full font-medium transition-all border
                ${activeArea === area ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}
              data-testid={`filter-cl-${area}`}>
              {area}
              {area !== "전체" && <span className="ml-1 opacity-60">{areaChecked}/{areaItems.length}</span>}
            </button>
          );
        })}
      </div>

      {/* Checklists */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {areaGroups.map((group: any) => (
            <Card key={group.area} className="overflow-hidden">
              <div className="h-1" style={{ backgroundColor: AREA_COLORS[group.area] || "hsl(196 78% 28%)" }} />
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-semibold" style={{ color: AREA_COLORS[group.area] }}>
                    {group.area}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {group.items.filter((i: Checklist) => i.checked).length}/{group.items.length} 완료
                  </span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden ml-1">
                    <div className="h-full rounded-full transition-all"
                      style={{
                        width: `${group.items.length > 0 ? (group.items.filter((i: Checklist) => i.checked).length / group.items.length) * 100 : 0}%`,
                        backgroundColor: AREA_COLORS[group.area],
                      }} />
                  </div>
                </div>

                {group.catGroups.map((cg: any) => (
                  <div key={cg.cat} className="mb-3 last:mb-0">
                    {cg.cat !== "일반" && (
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1">
                        <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground" />
                        {cg.cat}
                      </p>
                    )}
                    <div className="space-y-1.5">
                      {cg.items.map((item: Checklist) => (
                        <div
                          key={item.id}
                          className={`flex items-start gap-3 p-2 rounded-lg transition-colors
                            ${item.checked ? "bg-green-50 dark:bg-green-950/20" : "hover:bg-muted/50"}`}
                          data-testid={`checklist-item-${item.id}`}
                        >
                          <Checkbox
                            id={`cl-${item.id}`}
                            checked={item.checked}
                            onCheckedChange={(checked) => updateMut.mutate({ id: item.id, checked: !!checked })}
                            className="mt-0.5"
                            data-testid={`checkbox-${item.id}`}
                          />
                          <div className="flex-1 min-w-0">
                            <label
                              htmlFor={`cl-${item.id}`}
                              className={`text-sm cursor-pointer block ${item.checked ? "line-through text-muted-foreground" : ""}`}
                            >
                              {item.item}
                            </label>
                            {(item.owner || item.dueDate) && (
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {item.owner && `담당: ${item.owner}`}
                                {item.owner && item.dueDate && " · "}
                                {item.dueDate && `기한: ${item.dueDate}`}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <CheckSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">체크리스트 항목이 없습니다</p>
            </div>
          )}
        </div>
      )}

      <AddDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
