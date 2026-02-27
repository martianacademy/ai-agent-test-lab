"use client";

import { TestSession } from "@/lib/analytics";
import { formatDuration, formatNumber, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Activity, CheckCircle, XCircle, Clock, Zap, MousePointer,
    Navigation, Move, Square, FileText, Search, Keyboard, Upload,
    ToggleLeft, Bot
} from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from "recharts";

interface AnalyticsPanelProps {
    session: TestSession | null;
    isRunning: boolean;
}

const OP_ICONS: Record<string, React.ElementType> = {
    click: MousePointer,
    input: FileText,
    navigation: Navigation,
    drag: Move,
    modal: Square,
    form_submit: CheckCircle,
    hover: Zap,
    keyboard: Keyboard,
    select: ToggleLeft,
    checkbox: CheckCircle,
    file_upload: Upload,
    search: Search,
    scroll: Activity,
    assertion: CheckCircle,
    custom: Activity,
};

const OP_COLORS: Record<string, string> = {
    click: "#3b82f6",
    input: "#8b5cf6",
    navigation: "#6366f1",
    drag: "#f97316",
    modal: "#ec4899",
    form_submit: "#10b981",
    hover: "#f59e0b",
    keyboard: "#14b8a6",
    select: "#84cc16",
    checkbox: "#22c55e",
    file_upload: "#0ea5e9",
    search: "#a855f7",
    scroll: "#64748b",
    assertion: "#10b981",
    custom: "#94a3b8",
};

export default function AnalyticsPanel({ session, isRunning }: AnalyticsPanelProps) {
    if (!session) {
        return (
            <Card className="border border-gray-200 mt-6">
                <CardContent className="py-12 text-center">
                    <Bot size={40} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-400 font-medium">No test running</p>
                    <p className="text-gray-300 text-sm mt-1">Click "Start Test" to begin tracking analytics.</p>
                </CardContent>
            </Card>
        );
    }

    const ops = session.operations || [];
    const byType: Record<string, number> = {};
    ops.forEach((op) => { byType[op.type] = (byType[op.type] || 0) + 1; });
    const chartData = Object.entries(byType).map(([type, count]) => ({ type, count, fill: OP_COLORS[type] || "#94a3b8" }));

    const successRate = session.totalOps > 0 ? (session.successOps / session.totalOps) * 100 : 0;
    const duration = session.endTime
        ? session.duration ?? 0
        : Date.now() - session.startTime;

    return (
        <div className="mt-6 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
                <div className={cn("w-2.5 h-2.5 rounded-full", isRunning ? "bg-green-500 animate-pulse-dot" : "bg-gray-400")} />
                <h3 className="font-semibold text-gray-800">
                    Analytics — {session.testName}
                </h3>
                {isRunning && <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Live</Badge>}
                {!isRunning && session.endTime && <Badge variant="outline" className="text-xs text-gray-500">Completed</Badge>}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                    { label: "Total Ops", value: formatNumber(session.totalOps), icon: Activity, color: "text-blue-600" },
                    { label: "Success", value: formatNumber(session.successOps), icon: CheckCircle, color: "text-green-600" },
                    { label: "Failures", value: formatNumber(session.failureOps), icon: XCircle, color: "text-red-500" },
                    { label: "Avg Time", value: session.avgResponseTime > 0 ? formatDuration(session.avgResponseTime) : "—", icon: Clock, color: "text-orange-500" },
                    { label: "Min Time", value: session.minResponseTime !== Infinity && session.minResponseTime > 0 ? formatDuration(session.minResponseTime) : "—", icon: Zap, color: "text-yellow-500" },
                    { label: "Duration", value: formatDuration(duration), icon: Clock, color: "text-purple-600" },
                ].map((stat) => (
                    <Card key={stat.label} className="border border-gray-100">
                        <CardContent className="p-3">
                            <div className="flex items-center gap-1.5 mb-1">
                                <stat.icon size={13} className={stat.color} />
                                <span className="text-xs text-gray-400">{stat.label}</span>
                            </div>
                            <div className="text-base font-bold text-gray-800">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Operations log */}
                <Card className="border border-gray-200">
                    <CardHeader className="pb-2 pt-4 px-4">
                        <CardTitle className="text-sm text-gray-700">Operations Log ({ops.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                        <div className="max-h-56 overflow-y-auto space-y-1">
                            {ops.length === 0 ? (
                                <p className="text-xs text-gray-400 py-4 text-center">No operations yet.</p>
                            ) : (
                                [...ops].reverse().map((op) => {
                                    const Icon = OP_ICONS[op.type] || Activity;
                                    return (
                                        <div key={op.id} className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-gray-50">
                                            <Icon size={13} style={{ color: OP_COLORS[op.type] || "#94a3b8" }} />
                                            <span className="flex-1 text-xs text-gray-700 truncate">{op.label}</span>
                                            <span
                                                className={cn("text-xs font-medium px-1.5 py-0.5 rounded-full", {
                                                    "bg-green-100 text-green-700": op.status === "success",
                                                    "bg-red-100 text-red-600": op.status === "failure",
                                                    "bg-yellow-100 text-yellow-700": op.status === "pending",
                                                })}
                                            >
                                                {op.status}
                                            </span>
                                            {op.duration !== undefined && (
                                                <span className="text-xs text-gray-400 ml-1">{formatDuration(op.duration)}</span>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Chart */}
                <Card className="border border-gray-200">
                    <CardHeader className="pb-2 pt-4 px-4">
                        <CardTitle className="text-sm text-gray-700">Ops by Type</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                        {chartData.length === 0 ? (
                            <div className="h-48 flex items-center justify-center text-gray-300 text-sm">No data yet</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={180}>
                                <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                    <XAxis dataKey="type" tick={{ fontSize: 10 }} />
                                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{ fontSize: 12, borderRadius: 8 }}
                                        formatter={(v: number | undefined) => [v ?? 0, "count"]}
                                    />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                        {chartData.map((entry, i) => (
                                            <Cell key={i} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                        {session.totalOps > 0 && (
                            <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                                    {successRate.toFixed(1)}% success
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                                    {(100 - successRate).toFixed(1)}% failure
                                </span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
