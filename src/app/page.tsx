"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getEngine, TestSession } from "@/lib/analytics";
import { formatDuration, formatNumber } from "@/lib/utils";
import {
  Bot, FileText, MousePointer, Navigation, Zap, Square, Move, Globe,
  BarChart2, Activity, CheckCircle, Clock, TrendingUp, ArrowRight,
  Layers, Sparkles
} from "lucide-react";

const suites = [
  { href: "/tests/forms", label: "Forms", icon: FileText, grad: "from-blue-500 to-blue-600", glow: "rgba(59,130,246,0.2)", description: "Input fields, validation, file upload, and form submission flows." },
  { href: "/tests/interactions", label: "Interactions", icon: MousePointer, grad: "from-violet-500 to-purple-600", glow: "rgba(139,92,246,0.2)", description: "Clicks, hovers, keyboard events, long press, and toggles." },
  { href: "/tests/navigation", label: "Navigation", icon: Navigation, grad: "from-indigo-500 to-indigo-600", glow: "rgba(99,102,241,0.2)", description: "Tabs, accordions, breadcrumbs, steppers, and pagination." },
  { href: "/tests/dynamic", label: "Dynamic Content", icon: Zap, grad: "from-amber-400 to-orange-500", glow: "rgba(251,191,36,0.2)", description: "Lazy loading, infinite scroll, polling, and optimistic UI." },
  { href: "/tests/modals", label: "Modals & Overlays", icon: Square, grad: "from-pink-500 to-rose-600", glow: "rgba(236,72,153,0.2)", description: "Dialogs, drawers, toasts, lightboxes, and nested modals." },
  { href: "/tests/dragdrop", label: "Drag & Drop", icon: Move, grad: "from-orange-500 to-red-500", glow: "rgba(249,115,22,0.2)", description: "Sortable lists, Kanban boards, grid rearrange, and file drop." },
  { href: "/tests/realworld", label: "Real World", icon: Globe, grad: "from-emerald-500 to-teal-600", glow: "rgba(16,185,129,0.2)", description: "Login, shopping cart, data tables, chat, and settings panel." },
];

export default function DashboardPage() {
  const [stats, setStats] = useState({ totalSessions: 0, totalOps: 0, successRate: 0, globalAvgTime: 0 });
  const [sessions, setSessions] = useState<TestSession[]>([]);

  useEffect(() => {
    const engine = getEngine();
    const update = () => {
      setStats(engine.getGlobalStats());
      setSessions(engine.getAllSessions().slice(-5).reverse());
    };
    update();
    const unsub = engine.subscribe(update);
    return unsub;
  }, []);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">

      {/* Hero Banner */}
      <div
        className="relative rounded-2xl overflow-hidden mb-8 p-6 lg:p-8"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
          boxShadow: "0 20px 60px -10px rgba(99,102,241,0.35)"
        }}
      >
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #818cf8, transparent 70%)", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full opacity-8" style={{ background: "radial-gradient(circle, #c084fc, transparent 70%)", transform: "translateY(40%)" }} />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div
            className="flex items-center justify-center w-14 h-14 rounded-2xl flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", boxShadow: "0 8px 24px rgba(99,102,241,0.5)" }}
          >
            <Bot size={28} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl lg:text-2xl font-bold text-white">AI Agent Web Testing Lab</h1>
              <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "rgba(99,102,241,0.25)", color: "#a5b4fc" }}>
                <Sparkles size={10} /> v1.0
              </span>
            </div>
            <p className="text-sm" style={{ color: "#94a3b8" }}>Comprehensive web automation testing scenarios — built for AI agents to interact, measure and optimise.</p>
          </div>
          <Link href="/analytics" className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-[1.02]" style={{ background: "rgba(255,255,255,0.08)", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.12)" }}>
            <BarChart2 size={15} /> Analytics
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Sessions", value: formatNumber(stats.totalSessions), icon: Layers, from: "#3b82f6", to: "#6366f1", glow: "rgba(99,102,241,0.15)" },
          { label: "Operations", value: formatNumber(stats.totalOps), icon: TrendingUp, from: "#8b5cf6", to: "#a855f7", glow: "rgba(139,92,246,0.15)" },
          { label: "Success Rate", value: `${stats.successRate.toFixed(1)}%`, icon: CheckCircle, from: "#10b981", to: "#059669", glow: "rgba(16,185,129,0.15)" },
          { label: "Avg Response", value: stats.globalAvgTime > 0 ? formatDuration(stats.globalAvgTime) : "—", icon: Clock, from: "#f59e0b", to: "#f97316", glow: "rgba(245,158,11,0.15)" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl p-5 card-hover"
            style={{ boxShadow: `0 2px 8px ${s.glow}, 0 1px 3px rgba(0,0,0,0.05)`, border: "1px solid rgba(0,0,0,0.04)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>{s.label}</span>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${s.from}, ${s.to})` }}>
                <s.icon size={15} className="text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold" style={{ color: "#0f172a" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Suite Cards */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold" style={{ color: "#0f172a" }}>Test Suites</h2>
            <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>Click any suite to launch the test scenario</p>
          </div>
          <Link href="/analytics" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:scale-[1.02]" style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" }}>
            <BarChart2 size={13} /> View All Analytics
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {suites.map((suite) => (
            <Link key={suite.href} href={suite.href} className="group block">
              <div
                className="bg-white rounded-2xl overflow-hidden card-hover h-full"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.05)" }}
              >
                <div className={`h-1 w-full bg-gradient-to-r ${suite.grad}`} />
                <div className="p-5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${suite.grad}`}
                    style={{ boxShadow: `0 4px 12px ${suite.glow}` }}
                  >
                    <suite.icon size={18} className="text-white" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1.5" style={{ color: "#0f172a" }}>{suite.label}</h3>
                  <p className="text-xs leading-relaxed mb-4" style={{ color: "#64748b" }}>{suite.description}</p>
                  <div className="flex items-center gap-1 text-xs font-semibold group-hover:gap-2 transition-all" style={{ color: "#6366f1" }}>
                    Open Suite <ArrowRight size={12} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.05)" }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #f1f5f9" }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)" }}>
              <Activity size={13} className="text-white" />
            </div>
            <span className="font-semibold text-sm" style={{ color: "#0f172a" }}>Recent Sessions</span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#f1f5f9", color: "#64748b" }}>{sessions.length} of 5</span>
        </div>

        {sessions.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "#f8fafc" }}>
              <Bot size={24} style={{ color: "#cbd5e1" }} />
            </div>
            <p className="text-sm font-medium" style={{ color: "#94a3b8" }}>No sessions yet</p>
            <p className="text-xs mt-1" style={{ color: "#cbd5e1" }}>Start a test suite above to begin tracking</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid #f8fafc" }}>
                  {["Test Name", "Category", "Ops", "Success Rate", "Avg Time", "Date"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessions.map((s, i) => {
                  const sr = s.totalOps > 0 ? (s.successOps / s.totalOps) * 100 : 0;
                  return (
                    <tr key={s.id} className="transition-colors hover:bg-slate-50" style={{ borderBottom: i < sessions.length - 1 ? "1px solid #f8fafc" : "none" }}>
                      <td className="px-5 py-3.5 font-medium text-sm" style={{ color: "#0f172a" }}>{s.testName}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium capitalize" style={{ background: "#f1f5f9", color: "#475569" }}>{s.category}</span>
                      </td>
                      <td className="px-5 py-3.5 text-sm" style={{ color: "#475569" }}>{s.totalOps}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full" style={{ background: "#f1f5f9" }}>
                            <div className="h-full rounded-full" style={{ width: `${sr}%`, background: sr >= 80 ? "#10b981" : sr >= 50 ? "#f59e0b" : "#ef4444" }} />
                          </div>
                          <span className="text-xs font-semibold" style={{ color: sr >= 80 ? "#059669" : sr >= 50 ? "#d97706" : "#dc2626" }}>{sr.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm" style={{ color: "#64748b" }}>{s.avgResponseTime > 0 ? formatDuration(s.avgResponseTime) : "—"}</td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: "#94a3b8" }}>{new Date(s.startTime).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
