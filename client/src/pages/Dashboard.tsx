import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle, FileText, CalendarDays, CheckSquare,
  TrendingUp, Clock, CheckCircle2, Circle, Target
} from "lucide-react";
import { Link } from "wouter";

const AREA_NAMES: Record<string, string> = {
  "영역1": "프로그램 운영 및 개선",
  "영역2": "교육과정",
  "영역3": "학생",
  "영역4": "교수",
  "영역5": "교육자원",
  "영역6": "대학 지원 및 재정",
};

const AREA_COLORS = [
  "hsl(196 78% 28%)",
  "hsl(160 60% 30%)",
  "hsl(220 70% 45%)",
  "hsl(280 55% 45%)",
  "hsl(35 80% 42%)",
  "hsl(0 65% 45%)",
];

function StatCard({
  title, value, sub, icon: Icon, color, href
}: {
  title: string; value: number | string; sub: string;
  icon: React.ComponentType<any>; color: string; href?: string;
}) {
  const content = (
    <Card className="card-hover cursor-pointer" data-testid={`stat-card-${title}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold mt-1" style={{ color }}>{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{sub}</p>
          </div>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${color}18` }}>
            <Icon className="w-4.5 h-4.5" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
  if (href) return <Link href={href} className="block">{content}</Link>;
  return content;
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: () => apiRequest("GET", "/api/dashboard/stats").then(r => r.json()),
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  const { defStats, recStats, evStats, checkStats, schedStats, areaStats } = stats || {};
  const defProgress = defStats ? Math.round((defStats.completed / defStats.total) * 100) : 0;
  const evProgress = evStats ? Math.round((evStats.completed / evStats.total) * 100) : 0;
  const checkProgress = checkStats ? Math.round((checkStats.checked / checkStats.total) * 100) : 0;

  const today = new Date();
  const targetDate = new Date("2028-06-11");
  const daysLeft = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="p-5 lg:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">5주기 인증평가 현황</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            한영대학교 간호학과 · 목표: 5년 인증 (2028)
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">인증 만료까지</div>
          <div className="text-2xl font-bold text-primary">{daysLeft}일</div>
          <div className="text-xs text-muted-foreground">2028.6.11 기준</div>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="미흡사항 개선"
          value={`${defStats?.completed ?? 0}/${defStats?.total ?? 8}`}
          sub={`진행중 ${defStats?.inProgress ?? 0}건`}
          icon={AlertTriangle}
          color="hsl(0 65% 48%)"
          href="/deficiencies"
        />
        <StatCard
          title="증빙자료 수집"
          value={`${evStats?.completed ?? 0}/${evStats?.total ?? 0}`}
          sub={`수집중 ${evStats?.inProgress ?? 0}건`}
          icon={FileText}
          color="hsl(196 78% 28%)"
          href="/evidence"
        />
        <StatCard
          title="체크리스트"
          value={`${checkStats?.checked ?? 0}/${checkStats?.total ?? 0}`}
          sub={`${checkProgress}% 완료`}
          icon={CheckSquare}
          color="hsl(160 60% 30%)"
          href="/checklist"
        />
        <StatCard
          title="일정 진행"
          value={`${schedStats?.completed ?? 0}/${schedStats?.total ?? 0}`}
          sub={`진행중 ${schedStats?.inProgress ?? 0}건`}
          icon={CalendarDays}
          color="hsl(280 55% 45%)"
          href="/schedule"
        />
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">미흡사항 D1~D8</span>
              <span className="text-sm font-bold text-primary">{defProgress}%</span>
            </div>
            <Progress value={defProgress} className="h-2" />
            <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-600" />완료 {defStats?.completed}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-blue-600" />진행중 {defStats?.inProgress}</span>
              <span className="flex items-center gap-1"><Circle className="w-3 h-3 text-gray-400" />미착수 {defStats?.notStarted}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">증빙자료 수집률</span>
              <span className="text-sm font-bold text-primary">{evProgress}%</span>
            </div>
            <Progress value={evProgress} className="h-2" />
            <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-600" />완료 {evStats?.completed}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-blue-600" />수집중 {evStats?.inProgress}</span>
              <span className="flex items-center gap-1"><Circle className="w-3 h-3 text-gray-400" />미제출 {evStats?.notSubmitted}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">체크리스트 진행률</span>
              <span className="text-sm font-bold text-primary">{checkProgress}%</span>
            </div>
            <Progress value={checkProgress} className="h-2" />
            <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-600" />완료 {checkStats?.checked}</span>
              <span className="flex items-center gap-1"><Circle className="w-3 h-3 text-gray-400" />미완료 {(checkStats?.total ?? 0) - (checkStats?.checked ?? 0)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 6 Areas Grid */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          6개 인증 영역별 현황
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {(areaStats || []).map((area: any, idx: number) => {
            const checkPct = area.checkTotal > 0 ? Math.round((area.checkDone / area.checkTotal) * 100) : 0;
            const evPct = area.evTotal > 0 ? Math.round((area.evDone / area.evTotal) * 100) : 0;
            const defPct = area.defTotal > 0 ? Math.round((area.defDone / area.defTotal) * 100) : 100;
            const color = AREA_COLORS[idx];
            return (
              <Card key={area.area} className="card-hover overflow-hidden">
                <div className="h-1" style={{ backgroundColor: color }} />
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs font-semibold" style={{ color }}>{area.area}</p>
                      <p className="text-xs text-muted-foreground leading-tight mt-0.5">
                        {AREA_NAMES[area.area]}
                      </p>
                    </div>
                    {area.defTotal > 0 && (
                      <Badge variant="outline" className="text-[10px] px-1.5">
                        D {area.defTotal}건
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1.5 mt-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground w-14">체크리스트</span>
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${checkPct}%`, backgroundColor: color }} />
                      </div>
                      <span className="text-[10px] font-medium w-8 text-right">{checkPct}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground w-14">증빙자료</span>
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${evPct}%`, backgroundColor: color }} />
                      </div>
                      <span className="text-[10px] font-medium w-8 text-right">{evPct}%</span>
                    </div>
                    {area.defTotal > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground w-14">미흡개선</span>
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${defPct}%`, backgroundColor: color }} />
                        </div>
                        <span className="text-[10px] font-medium w-8 text-right">{defPct}%</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Phase Timeline */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            준비 로드맵 (Phase별)
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { phase: "Phase 1", period: "2026.04~2026.06", title: "기반 구축", items: ["TFT 구성·킥오프", "미흡사항 개선착수", "D6 규정 제정"], status: "진행중" },
              { phase: "Phase 2", period: "2026.07~2026.12", title: "체계 강화", items: ["교과목 매핑", "D4/D5 교원 충족", "D7 전자저널 구독"], status: "예정" },
              { phase: "Phase 3", period: "2027.01~2027.09", title: "자체평가 작성", items: ["보고서 초안", "모의 현장방문", "증빙자료 완비"], status: "예정" },
              { phase: "Phase 4", period: "2027.10~2028.06", title: "최종 제출", items: ["보고서 제출", "현장방문 대응", "5년 인증 목표"], status: "예정" },
            ].map((ph, i) => (
              <div key={ph.phase} className="relative">
                <div className={`p-3 rounded-lg border ${ph.status === "진행중" ? "border-primary/30 bg-primary/5" : "border-border bg-muted/30"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white`}
                      style={{ backgroundColor: ph.status === "진행중" ? "hsl(196 78% 28%)" : "hsl(215 15% 60%)" }}>
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold">{ph.phase}</p>
                      <p className="text-[9px] text-muted-foreground">{ph.period}</p>
                    </div>
                  </div>
                  <p className="text-xs font-medium mb-1.5">{ph.title}</p>
                  <ul className="space-y-0.5">
                    {ph.items.map(item => (
                      <li key={item} className="text-[10px] text-muted-foreground flex items-start gap-1">
                        <span className="text-primary mt-0.5">·</span>{item}
                      </li>
                    ))}
                  </ul>
                  {ph.status === "진행중" && (
                    <Badge className="mt-2 text-[9px] h-4 bg-primary/10 text-primary hover:bg-primary/10 border-0 px-1.5">
                      진행중
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
