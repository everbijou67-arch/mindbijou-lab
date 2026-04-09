import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageSquare, Plus, ChevronDown, ChevronUp, Trash2 } from "lucide-react";

type Meeting = {
  id: number; title: string; date: string; attendees?: string;
  agenda?: string; minutes?: string; actionItems?: string; createdAt?: string;
};

function MeetingDialog({
  item, open, onClose
}: { item: Meeting | null; open: boolean; onClose: () => void }) {
  const isEdit = !!item;
  const [form, setForm] = useState({
    title: item?.title || "",
    date: item?.date || new Date().toISOString().split("T")[0],
    attendees: item?.attendees || "",
    agenda: item?.agenda || "",
    minutes: item?.minutes || "",
    actionItems: item?.actionItems || "",
  });
  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const createMut = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/meetings", data).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/meetings"] }); onClose(); },
  });
  const updateMut = useMutation({
    mutationFn: (data: any) => apiRequest("PATCH", `/api/meetings/${item?.id}`, data).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/meetings"] }); onClose(); },
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm">{isEdit ? "회의록 수정" : "회의록 작성"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div>
            <Label className="text-xs">회의 제목 <span className="text-red-500">*</span></Label>
            <Input value={form.title} onChange={set("title")} className="mt-1 h-8 text-sm" placeholder="회의 제목" data-testid="input-meeting-title" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">날짜</Label>
              <Input type="date" value={form.date} onChange={set("date")} className="mt-1 h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">참석자</Label>
              <Input value={form.attendees} onChange={set("attendees")} className="mt-1 h-8 text-sm" placeholder="예: 학과장, 교수 전원" />
            </div>
          </div>
          <div>
            <Label className="text-xs">안건</Label>
            <Textarea value={form.agenda} onChange={set("agenda")} className="mt-1 text-sm resize-none" rows={2} placeholder="회의 안건..." />
          </div>
          <div>
            <Label className="text-xs">회의록</Label>
            <Textarea value={form.minutes} onChange={set("minutes")} className="mt-1 text-sm resize-none" rows={4} placeholder="회의 내용..." />
          </div>
          <div>
            <Label className="text-xs">액션 아이템</Label>
            <Textarea value={form.actionItems} onChange={set("actionItems")} className="mt-1 text-sm resize-none" rows={3} placeholder="결정사항 및 후속 조치..." />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={onClose}>취소</Button>
            <Button size="sm"
              onClick={() => isEdit ? updateMut.mutate(form) : createMut.mutate(form)}
              disabled={!form.title || createMut.isPending || updateMut.isPending}
              data-testid="btn-save-meeting">
              {createMut.isPending || updateMut.isPending ? "저장중..." : "저장"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MeetingCard({ meeting, onEdit }: { meeting: Meeting; onEdit: (m: Meeting) => void }) {
  const [expanded, setExpanded] = useState(false);
  const deleteMut = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/meetings/${meeting.id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/meetings"] }),
  });

  return (
    <Card data-testid={`meeting-card-${meeting.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-sm font-medium">{meeting.title}</p>
            <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
              <span>{meeting.date}</span>
              {meeting.attendees && <span>참석: {meeting.attendees}</span>}
            </div>
            {meeting.agenda && !expanded && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{meeting.agenda}</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(meeting)}
              className="text-xs text-muted-foreground hover:text-foreground p-1"
              data-testid={`btn-edit-meeting-${meeting.id}`}
            >
              수정
            </button>
            <button
              onClick={() => deleteMut.mutate()}
              className="text-xs text-muted-foreground hover:text-red-500 p-1"
              data-testid={`btn-delete-meeting-${meeting.id}`}
            >
              <Trash2 className="w-3 h-3" />
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-muted-foreground hover:text-foreground p-1"
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {expanded && (
          <div className="mt-3 space-y-2 border-t border-border pt-3">
            {meeting.agenda && (
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground mb-0.5">안건</p>
                <p className="text-xs whitespace-pre-line">{meeting.agenda}</p>
              </div>
            )}
            {meeting.minutes && (
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground mb-0.5">회의록</p>
                <p className="text-xs whitespace-pre-line">{meeting.minutes}</p>
              </div>
            )}
            {meeting.actionItems && (
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground mb-0.5">액션 아이템</p>
                <p className="text-xs whitespace-pre-line">{meeting.actionItems}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Meetings() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Meeting | null>(null);

  const { data: meetings = [], isLoading } = useQuery<Meeting[]>({
    queryKey: ["/api/meetings"],
    queryFn: () => apiRequest("GET", "/api/meetings").then(r => r.json()),
  });

  return (
    <div className="p-5 lg:p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">회의록</h1>
          <p className="text-sm text-muted-foreground mt-0.5">TFT 회의 및 위원회 회의 기록</p>
        </div>
        <Button size="sm" onClick={() => { setEditItem(null); setDialogOpen(true); }} data-testid="btn-add-meeting">
          <Plus className="w-3.5 h-3.5 mr-1" />회의록 작성
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />)}
        </div>
      ) : meetings.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">회의록이 없습니다</p>
          <p className="text-xs mt-1">위 버튼을 눌러 첫 회의록을 작성하세요</p>
        </div>
      ) : (
        <div className="space-y-3">
          {meetings.map(m => (
            <MeetingCard
              key={m.id}
              meeting={m}
              onEdit={(meeting) => { setEditItem(meeting); setDialogOpen(true); }}
            />
          ))}
        </div>
      )}

      <MeetingDialog
        item={dialogOpen ? editItem : null}
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditItem(null); }}
      />
    </div>
  );
}
