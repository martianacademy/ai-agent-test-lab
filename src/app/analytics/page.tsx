"use client";

import { useState, useEffect } from "react";
import { getEngine, TestSession } from "@/lib/analytics";
import { formatDuration, formatNumber } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
} from "recharts";
import { Activity, CheckCircle, XCircle, Clock, Trash2, Download, TrendingUp, Award, AlertTriangle, BarChart2, Layers } from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
    forms: "#3b82f6",
    interactions: "#8b5cf6",
    navigation: "#6366f1",
    dynamic: "#f59e0b",
    modals: "#ec4899",
    dragdrop: "#f97316",
    realworld: "#10b981",
    other: "#94a3b8",
};

export default function AnalyticsPage() {
    const [sessions, setSessions] = useState<TestSession[]>([]);
    const [stats, setStats] = useState({ totalSessions: 0, totalOps: 0, successOps: 0, failureOps: 0, successRate: 0, globalAvgTime: 0, byCategory: {} as Record<string, number> });

    useEffect(() => {
        const engine = getEngine();
        const update = () => {
            setSessions(engine.getAllSessions());
            setStats(engine.getGlobalStats());
        };
        update();
        const unsub = engine.subscribe(update);
        return unsub;
    }, []);

    const handleClearAll = () => {
        if (confirm("Clear all session data? This cannot be undone.")) {
            getEngine().clearSessions();
        }
    };

    const handleExport = () => {
        const data = JSON.stringify(sessions, null, 2);
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `agenttest-sessions-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Prepare chart data
    const opsOverTime = sessions.slice(-20).map((s, i) => ({
        name: `S${i + 1}`,
        ops: s.totalOps,
        success: s.successOps,
        failure: s.failureOps,
    }));

    const catData = Object.entries(stats.byCategory).map(([cat, count]) => ({
        name: cat,
        sessions: count,
        fill: CATEGORY_COLORS[cat] || "#94a3b8",
    }));

    const pieData = stats.totalOps > 0
        ? [
            { name: "Success", value: stats.successOps, fill: "#10b981" },
            { name: "Failure", value: stats.failureOps, fill: "#ef4444" },
        ]
        : [{ name: "No Data", value: 1, fill: "#e5e7eb" }];

    const bestSession = sessions.length > 0
        ? sessions.reduce((best, s) => {
            const sr = s.totalOps > 0 ? s.successOps / s.totalOps : 0;
            const bestSr = best.totalOps > 0 ? best.successOps / best.totalOps : 0;
            return sr > bestSr ? s : best;
        })
        : null;

    const worstSession = sessions.length > 0
        ? sessions.reduce((worst, s) => {
            const sr = s.totalOps > 0 ? s.successOps / s.totalOps : 0;
            const worstSr = worst.totalOps > 0 ? worst.successOps / worst.totalOps : 0;
            return sr < worstSr ? s : worst;
        })
        : null;

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            {/* ── Page Hero ── */}
            <div
              className="relative rounded-2xl overflow-hidden mb-8 p-5 lg:p-6"
              style={{ background: "linear-gradient(135deg, #0c1a2e 0%, #0e3a5c 50%, #0c4a6e 100%)", boxShadow: "0 12px 40px -8px rgba(6,182,212,0.4)" }}
            >
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10" style={{ background: "radial-gradient(circle, white, transparent 70%)", transform: "translate(30%,-30%)" }} />
              <div className="relative flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <div
                    className="flex items-center justify-center w-11 h-11 rounded-xl flex-shrink-0"
                    style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
                  >
                    <BarChart2 size={22} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Analytics Dashboard</h1>
                    <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>Aggregate metrics across all test sessions.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    data-testid="export-btn"
                    onClick={handleExport}
                    disabled={sessions.length === 0}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] disabled:opacity-40"
                    style={{ background: "rgba(255,255,255,0.12)", color: "white", border: "1px solid rgba(255,255,255,0.2)" }}
                  >
                    <Download size={14} /> Export
                  </button>
                  <button
                    data-testid="clear-btn"
                    onClick={handleClearAll}
                    disabled={sessions.length === 0}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] disabled:opacity-40"
                    style={{ background: "rgba(239,68,68,0.8)", color: "white" }}
                  >
                    <Trash2 size={14} /> Clear All
                  </button>
                </div>
              </div>
            </div>

            {/* Global stats */}
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

            {sessions.length === 0 ? (
                <Card>
                    <CardContent className="py-20 text-center">
                        <Activity size={48} className="mx-auto mb-4 text-slate-200" />
                        <h3 className="font-semibold text-slate-500 mb-1">No Test Sessions Yet</h3>
                        <p className="text-sm text-slate-400">Run test suites to generate analytics data.</p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Area chart */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-700">Operations Over Sessions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={240}>
                                    <AreaChart data={opsOverTime} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                                        <Legend wrapperStyle={{ fontSize: 11 }} />
                                        <Area type="monotone" dataKey="success" stackId="1" stroke="#10b981" fill="#d1fae5" name="Success" />
                                        <Area type="monotone" dataKey="failure" stackId="1" stroke="#ef4444" fill="#fee2e2" name="Failure" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Bar chart by category */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-700">Sessions by Category</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {catData.length === 0 ? (
                                    <div className="h-[240px] flex items-center justify-center text-slate-300 text-sm">No data</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={240}>
                                        <BarChart data={catData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                                            <Bar dataKey="sessions" radius={[4, 4, 0, 0]} name="Sessions">
                                                {catData.map((entry, i) => (
                                                    <Cell key={i} fill={entry.fill} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Pie + performance */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Pie */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-700">Success vs Failure</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                                            {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                                        <Legend wrapperStyle={{ fontSize: 11 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                {stats.totalOps > 0 && (
                                    <div className="flex justify-center gap-4 text-xs mt-2">
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />{stats.successOps} ok</span>
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />{stats.failureOps} fail</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Best */}
                        <Card className="border border-slate-100 border-l-4 border-l-green-500">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-700 flex items-center gap-2">
                                    <Award size={15} className="text-green-600" /> Best Session
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {bestSession ? (
                                    <div>
                                        <p className="font-semibold text-slate-800 mb-1">{bestSession.testName}</p>
                                        <Badge className="bg-green-100 text-green-700 mb-3 capitalize">{bestSession.category}</Badge>
                                        <div className="space-y-1 text-sm text-slate-600">
                                            <div className="flex justify-between"><span>Success Rate</span><span className="font-semibold text-green-600">{bestSession.totalOps > 0 ? ((bestSession.successOps / bestSession.totalOps) * 100).toFixed(1) : 0}%</span></div>
                                            <div className="flex justify-between"><span>Total Ops</span><span>{bestSession.totalOps}</span></div>
                                            <div className="flex justify-between"><span>Avg Time</span><span>{bestSession.avgResponseTime > 0 ? formatDuration(bestSession.avgResponseTime) : "—"}</span></div>
                                        </div>
                                    </div>
                                ) : <p className="text-slate-400 text-sm">No data</p>}
                            </CardContent>
                        </Card>

                        {/* Worst */}
                        <Card className="border border-slate-100 border-l-4 border-l-red-500">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-700 flex items-center gap-2">
                                    <AlertTriangle size={15} className="text-red-500" /> Needs Improvement
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {worstSession ? (
                                    <div>
                                        <p className="font-semibold text-slate-800 mb-1">{worstSession.testName}</p>
                                        <Badge className="bg-red-100 text-red-700 mb-3 capitalize">{worstSession.category}</Badge>
                                        <div className="space-y-1 text-sm text-slate-600">
                                            <div className="flex justify-between"><span>Success Rate</span><span className="font-semibold text-red-500">{worstSession.totalOps > 0 ? ((worstSession.successOps / worstSession.totalOps) * 100).toFixed(1) : 0}%</span></div>
                                            <div className="flex justify-between"><span>Failures</span><span className="text-red-500">{worstSession.failureOps}</span></div>
                                            <div className="flex justify-between"><span>Avg Time</span><span>{worstSession.avgResponseTime > 0 ? formatDuration(worstSession.avgResponseTime) : "—"}</span></div>
                                        </div>
                                    </div>
                                ) : <p className="text-slate-400 text-sm">No data</p>}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sessions table */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Activity size={16} className="text-blue-600" />
                                All Sessions ({sessions.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100">
                                            {["Test Name", "Category", "Ops", "Success", "Failures", "Avg Time", "Duration", "Date"].map((h) => (
                                                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {[...sessions].reverse().map((s) => {
                                            const sr = s.totalOps > 0 ? (s.successOps / s.totalOps) * 100 : 0;
                                            return (
                                                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-4 py-3 font-medium text-slate-900">{s.testName}</td>
                                                    <td className="px-4 py-3">
                                                        <Badge variant="outline" className="capitalize text-xs" style={{ borderColor: CATEGORY_COLORS[s.category], color: CATEGORY_COLORS[s.category] }}>{s.category}</Badge>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600">{s.totalOps}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`font-medium ${sr >= 80 ? "text-green-600" : sr >= 50 ? "text-yellow-600" : "text-red-500"}`}>{s.successOps}</span>
                                                        <span className="text-slate-400 text-xs ml-1">({sr.toFixed(0)}%)</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-red-400">{s.failureOps}</td>
                                                    <td className="px-4 py-3 text-slate-600">{s.avgResponseTime > 0 ? formatDuration(s.avgResponseTime) : "—"}</td>
                                                    <td className="px-4 py-3 text-slate-500">{s.duration ? formatDuration(s.duration) : "—"}</td>
                                                    <td className="px-4 py-3 text-slate-400 text-xs">{new Date(s.startTime).toLocaleDateString()}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
