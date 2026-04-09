import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, AlertTriangle, FileText, CalendarDays,
  CheckSquare, MessageSquare, GraduationCap, Menu, X
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/", label: "대시보드", icon: LayoutDashboard },
  { href: "/deficiencies", label: "미흡·권고사항", icon: AlertTriangle },
  { href: "/evidence", label: "증빙자료 관리", icon: FileText },
  { href: "/schedule", label: "TFT 일정", icon: CalendarDays },
  { href: "/checklist", label: "체크리스트", icon: CheckSquare },
  { href: "/meetings", label: "회의록", icon: MessageSquare },
];

export default function Sidebar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <>
      {/* Logo area */}
      <div className="px-4 py-5 border-b border-[hsl(var(--sidebar-border))]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "hsl(196 60% 40%)" }}>
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[13px] font-700 leading-tight text-[hsl(var(--sidebar-text))]">
              한영대학교 간호학과
            </p>
            <p className="text-[10px] text-[hsl(var(--sidebar-muted))] leading-tight mt-0.5">
              5주기 인증평가 관리
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-600 uppercase tracking-wider text-[hsl(var(--sidebar-muted))] px-3 mb-2">
          메뉴
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = location === href;
          return (
            <Link
              key={href}
              href={href}
              className={`sidebar-link ${isActive ? "active" : ""}`}
              data-testid={`nav-${href.replace("/", "") || "home"}`}
              onClick={() => setMobileOpen(false)}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[hsl(var(--sidebar-border))]">
        <p className="text-[10px] text-[hsl(var(--sidebar-muted))]">
          인증기간: 2025.6.12~2028.6.11
        </p>
        <p className="text-[10px] text-[hsl(var(--sidebar-muted))] mt-0.5">
          목표: 5년 인증 (2028)
        </p>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card border border-border shadow-sm"
        onClick={() => setMobileOpen(!mobileOpen)}
        data-testid="button-mobile-menu"
      >
        {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-40 w-60 sidebar flex flex-col transition-transform duration-200
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 sidebar flex-col shrink-0">
        <SidebarContent />
      </aside>
    </>
  );
}
