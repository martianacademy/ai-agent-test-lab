"use client";

import { useEffect, useState } from "react";
import { TestSession } from "@/lib/analytics";
import { formatDuration, cn } from "@/lib/utils";
import {
    CheckCircle, XCircle, Clock, Zap, Activity, TrendingUp,
    Play, Trophy, X, BarChart2, AlertTriangle, Target, Sparkles
} from "lucide-react";

/* ─── Start Modal ──────────────────────────────────────────────── */
interface StartModalProps {
    testName: string;
    category: string;
    description: string;
    onStart: () => void;
}

export function TestStartModal({ testName, category, description, onStart }: StartModalProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 80);
        return () => clearTimeout(t);
    }, []);

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/75 backdrop-blur-sm" />
            <div
                className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
                style={{ animation: "fade-up 0.3s cubic-bezier(0.16,1,0.3,1) forwards" }}
            >
                {/* Gradient hero header */}
                <div
                    className="relative p-8 pb-10 text-center overflow-hidden"
                    style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)" }}
                >
                    {/* Decorative glow circles */}
                    <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #818cf8, transparent 70%)" }} />
                    <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #c084fc, transparent 70%)" }} />

                    {/* Icon with glow ring */}
                    <div className="relative inline-flex items-center justify-center mb-5">
                        <div className="absolute w-20 h-20 rounded-full opacity-20 animate-pulse" style={{ background: "radial-gradient(circle, #818cf8, transparent)" }} />
                        <div
                            className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
                            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}
                        >
                            <Target size={28} className="text-white" />
                        </div>
                    </div>

                    <div
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3"
                        style={{ background: "rgba(255,255,255,0.15)", color: "#c7d2fe" }}
                    >
                        <Sparkles size={10} />
                        {category}
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">{testName}</h2>
                    <p className="text-sm leading-relaxed" style={{ color: "#a5b4fc" }}>{description}</p>
                </div>

                {/* Body */}
                <div className="p-6">
                    {/* Info tiles */}
                    <div className="grid grid-cols-3 gap-2.5 mb-6">
                        {[
                            { icon: Activity, label: "Operations", desc: "All tracked", color: "#3b82f6", bg: "#eff6ff" },
                            { icon: Clock, label: "Timing", desc: "Per action", color: "#8b5cf6", bg: "#f5f3ff" },
                            { icon: BarChart2, label: "Analytics", desc: "Live feed", color: "#06b6d4", bg: "#ecfeff" },
                        ].map(({ icon: Icon, label, desc, color, bg }) => (
                            <div key={label} className="rounded-xl p-3 text-center" style={{ background: bg }}>
                                <Icon size={16} className="mx-auto mb-1" style={{ color }} />
                                <div className="text-xs font-semibold" style={{ color: "#1e293b" }}>{label}</div>
                                <div className="text-xs" style={{ color: "#94a3b8" }}>{desc}</div>
                            </div>
                        ))}
                    </div>

                    <button
                        data-testid="start-test-btn"
                        onClick={onStart}
                        className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl text-white font-semibold text-sm transition-all active:scale-[0.98]"
                        style={{ background: "linear-gradient(135deg, #4338ca, #6d28d9)", boxShadow: "0 6px 20px rgba(67,56,202,0.4)" }}
                    >
                        <Play size={16} fill="white" />
                        Start Test
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Result Modal ─────────────────────────────────────────────── */
interface ResultModalProps {
    session: TestSession;
    onClose: () => void;
    onRestart: () => void;
}

function scoreFromRate(rate: number): {
    grade: string; gradeColor: string;
    headerFrom: string; headerTo: string;
    tagBg: string; tagColor: string;
} {
    if (rate >= 95) return { grade: "S", gradeColor: "#7c3aed", headerFrom: "#2e1065", headerTo: "#5b21b6", tagBg: "rgba(167,139,250,0.2)", tagColor: "#ddd6fe" };
    if (rate >= 85) return { grade: "A", gradeColor: "#059669", headerFrom: "#022c22", headerTo: "#065f46", tagBg: "rgba(52,211,153,0.2)", tagColor: "#a7f3d0" };
    if (rate >= 70) return { grade: "B", gradeColor: "#2563eb", headerFrom: "#0f172a", headerTo: "#1e3a8a", tagBg: "rgba(96,165,250,0.2)", tagColor: "#bfdbfe" };
    if (rate >= 55) return { grade: "C", gradeColor: "#d97706", headerFrom: "#1c1007", headerTo: "#78350f", tagBg: "rgba(251,191,36,0.2)", tagColor: "#fde68a" };
    return { grade: "F", gradeColor: "#dc2626", headerFrom: "#1f0707", headerTo: "#7f1d1d", tagBg: "rgba(252,165,165,0.2)", tagColor: "#fecaca" };
}

export function TestResultModal({ session, onClose, onRestart }: ResultModalProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 40);
        return () => clearTimeout(t);
    }, []);

    const successRate = session.totalOps > 0
        ? (session.successOps / session.totalOps) * 100
        : 0;
    const { grade, gradeColor, headerFrom, headerTo, tagBg, tagColor } = scoreFromRate(successRate);
    const duration = session.duration ?? (Date.now() - session.startTime);
    const allPassed = session.failureOps === 0 && session.totalOps > 0;

    const breakdown: Record<string, { success: number; fail: number }> = {};
    for (const op of session.operations) {
        if (!breakdown[op.type]) breakdown[op.type] = { success: 0, fail: 0 };
        if (op.status === "success") breakdown[op.type].success++;
        else if (op.status === "failure") breakdown[op.type].fail++;
    }

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/75 backdrop-blur-sm" />
            <div
                className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
                style={{ animation: "fade-up 0.3s cubic-bezier(0.16,1,0.3,1) forwards" }}
            >
                {/* Gradient hero header */}
                <div
                    className="relative p-6 overflow-hidden flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${headerFrom} 0%, ${headerTo} 100%)` }}
                >
                    <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10" style={{ background: "radial-gradient(circle, white, transparent 70%)" }} />

                    <button
                        data-testid="close-result-btn"
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors"
                        style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}
                    >
                        <X size={16} />
                    </button>

                    <div className="flex items-center gap-4">
                        {/* Grade circle */}
                        <div
                            className="flex items-center justify-center w-16 h-16 rounded-2xl font-black text-3xl flex-shrink-0"
                            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", color: "white" }}
                        >
                            {grade}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <Trophy size={14} style={{ color: tagColor }} />
                                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: tagColor }}>Results</span>
                            </div>
                            <h2 className="text-lg font-bold text-white truncate">{session.testName}</h2>
                            <span
                                className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize"
                                style={{ background: tagBg, color: tagColor }}
                            >
                                {session.category}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Scrollable content */}
                <div className="overflow-y-auto flex-1 p-5">
                    {/* Stat grid */}
                    <div className="grid grid-cols-2 gap-2.5 mb-5">
                        <StatCard icon={Activity} iconColor="#3b82f6" bg="#eff6ff" label="Total Operations" value={String(session.totalOps)} />
                        <StatCard icon={CheckCircle} iconColor="#10b981" bg="#ecfdf5" label="Passed" value={String(session.successOps)}
                            sub={session.totalOps > 0 ? `${((session.successOps / session.totalOps) * 100).toFixed(1)}%` : "—"} />
                        <StatCard icon={XCircle} iconColor="#ef4444" bg="#fef2f2" label="Failed" value={String(session.failureOps)}
                            sub={session.totalOps > 0 ? `${((session.failureOps / session.totalOps) * 100).toFixed(1)}%` : "—"} />
                        <StatCard icon={Clock} iconColor="#8b5cf6" bg="#f5f3ff" label="Total Duration" value={formatDuration(duration)} />
                        <StatCard icon={Zap} iconColor="#f59e0b" bg="#fffbeb" label="Avg Response"
                            value={session.avgResponseTime > 0 ? formatDuration(session.avgResponseTime) : "—"} />
                        <StatCard icon={TrendingUp} iconColor="#14b8a6" bg="#f0fdfa" label="Min / Max"
                            value={session.minResponseTime < Infinity
                                ? `${formatDuration(session.minResponseTime)} / ${formatDuration(session.maxResponseTime)}`
                                : "—"} />
                    </div>

                    {/* Success rate bar */}
                    <div className="mb-5">
                        <div className="flex justify-between text-xs font-semibold mb-2" style={{ color: "#64748b" }}>
                            <span>Success Rate</span>
                            <span style={{ color: successRate >= 70 ? "#059669" : successRate >= 50 ? "#d97706" : "#dc2626" }}>
                                {successRate.toFixed(1)}%
                            </span>
                        </div>
                        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "#f1f5f9" }}>
                            <div
                                className="h-full rounded-full transition-all duration-1000"
                                style={{
                                    width: `${successRate}%`,
                                    background: successRate >= 70
                                        ? "linear-gradient(90deg, #10b981, #059669)"
                                        : successRate >= 50
                                            ? "linear-gradient(90deg, #f59e0b, #d97706)"
                                            : "linear-gradient(90deg, #ef4444, #dc2626)"
                                }}
                            />
                        </div>
                    </div>

                    {/* Op breakdown */}
                    {Object.keys(breakdown).length > 0 && (
                        <div className="mb-5">
                            <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#94a3b8" }}>Operations by Type</div>
                            <div className="space-y-2">
                                {Object.entries(breakdown).map(([type, counts]) => {
                                    const total = counts.success + counts.fail;
                                    const pct = total > 0 ? (counts.success / total) * 100 : 0;
                                    return (
                                        <div key={type} className="flex items-center gap-3">
                                            <span className="text-xs w-24 capitalize truncate" style={{ color: "#64748b" }}>{type.replace(/_/g, " ")}</span>
                                            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#f1f5f9" }}>
                                                <div
                                                    className="h-full rounded-full"
                                                    style={{
                                                        width: `${pct}%`,
                                                        background: pct >= 70 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444"
                                                    }}
                                                />
                                            </div>
                                            <span className="text-xs w-10 text-right" style={{ color: "#94a3b8" }}>{counts.success}/{total}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Summary pill */}
                    <div
                        className="rounded-xl p-3.5 flex items-center gap-3"
                        style={{
                            background: allPassed ? "#f0fdf4" : "#fffbeb",
                            border: `1px solid ${allPassed ? "#bbf7d0" : "#fde68a"}`
                        }}
                    >
                        {allPassed
                            ? <CheckCircle size={16} style={{ color: "#10b981", flexShrink: 0 }} />
                            : <AlertTriangle size={16} style={{ color: "#f59e0b", flexShrink: 0 }} />}
                        <p className="text-xs leading-relaxed" style={{ color: "#475569" }}>
                            {allPassed
                                ? "All operations passed. This test suite is fully compatible with your AI agent."
                                : `${session.failureOps} operation${session.failureOps > 1 ? "s" : ""} failed. Review the breakdown above to improve agent reliability.`}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-4 flex-shrink-0" style={{ borderTop: "1px solid #f1f5f9" }}>
                    <button
                        data-testid="restart-test-btn"
                        onClick={onRestart}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all hover:bg-slate-50"
                        style={{ border: "1px solid #e2e8f0", color: "#475569" }}
                    >
                        <Play size={13} />
                        Run Again
                    </button>
                    <button
                        data-testid="close-result-btn-footer"
                        onClick={onClose}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-white text-sm font-semibold transition-all"
                        style={{ background: "linear-gradient(135deg, #4338ca, #6d28d9)", boxShadow: "0 4px 12px rgba(67,56,202,0.3)" }}
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── StatCard helper ──────────────────────────────────────────── */
function StatCard({
    icon: Icon, iconColor, bg, label, value, sub
}: {
    icon: React.ElementType; iconColor: string; bg: string;
    label: string; value: string; sub?: string;
}) {
    return (
        <div className="rounded-xl p-3.5 flex items-center gap-3" style={{ border: "1px solid #f1f5f9", background: "#fafafa" }}>
            <div className="p-2 rounded-lg flex-shrink-0" style={{ background: bg }}>
                <Icon size={14} style={{ color: iconColor }} />
            </div>
            <div className="min-w-0">
                <div className="text-xs leading-tight" style={{ color: "#94a3b8" }}>{label}</div>
                <div className="text-sm font-bold truncate" style={{ color: "#0f172a" }}>{value}</div>
                {sub && <div className="text-xs" style={{ color: "#94a3b8" }}>{sub}</div>}
            </div>
        </div>
    );
}
