"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Bot, LayoutDashboard, FileText, MousePointer, Navigation,
    Zap, Square, Move, Globe, BarChart2, Menu, X, Sparkles
} from "lucide-react";

const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard, color: "#6366f1" },
];

const suiteItems = [
    { href: "/tests/forms", label: "Forms", icon: FileText, color: "#3b82f6", dot: "#60a5fa" },
    { href: "/tests/interactions", label: "Interactions", icon: MousePointer, color: "#8b5cf6", dot: "#a78bfa" },
    { href: "/tests/navigation", label: "Navigation", icon: Navigation, color: "#6366f1", dot: "#818cf8" },
    { href: "/tests/dynamic", label: "Dynamic Content", icon: Zap, color: "#f59e0b", dot: "#fbbf24" },
    { href: "/tests/modals", label: "Modals & Overlays", icon: Square, color: "#ec4899", dot: "#f472b6" },
    { href: "/tests/dragdrop", label: "Drag & Drop", icon: Move, color: "#f97316", dot: "#fb923c" },
    { href: "/tests/realworld", label: "Real World", icon: Globe, color: "#10b981", dot: "#34d399" },
];

const analyticsItems = [
    { href: "/analytics", label: "Analytics", icon: BarChart2, color: "#06b6d4", dot: "#22d3ee" },
];

function NavLink({ href, label, icon: Icon, color, dot, active }: {
    href: string; label: string; icon: React.ElementType;
    color: string; dot?: string; active: boolean;
}) {
    return (
        <Link
            href={href}
            className={`group relative flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${active
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/6"
                }`}
        >
            {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full" style={{ backgroundColor: color }} />
            )}
            <span
                className={`flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0 transition-all ${active ? "" : "opacity-70 group-hover:opacity-100"
                    }`}
                style={{ backgroundColor: active ? color + "33" : "transparent" }}
            >
                <Icon size={15} style={{ color: active ? color : undefined }} />
            </span>
            <span className="flex-1 truncate">{label}</span>
            {dot && !active && (
                <span
                    className="w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-50 transition-opacity"
                    style={{ backgroundColor: dot }}
                />
            )}
        </Link>
    );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => { setSidebarOpen(false); }, [pathname]);

    return (
        <body className="flex min-h-screen" style={{ backgroundColor: "#f1f5f9" }}>
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-30 flex flex-col transition-transform duration-300 ease-out lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
                style={{
                    width: 256,
                    background: "linear-gradient(180deg, #0f172a 0%, #0d1527 100%)",
                    borderRight: "1px solid rgba(255,255,255,0.06)",
                }}
            >
                {/* Logo */}
                <div
                    className="flex items-center gap-3 px-4 pt-5 pb-4"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
                >
                    <div
                        className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0"
                        style={{
                            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                            boxShadow: "0 4px 12px rgba(59,130,246,0.4)",
                        }}
                    >
                        <Bot size={18} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white tracking-tight">AgentTest Lab</div>
                        <div className="text-xs mt-0.5" style={{ color: "#475569" }}>Web Automation</div>
                    </div>
                    <button
                        className="lg:hidden p-1 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
                    <div>
                        <div
                            className="px-3 mb-2 text-xs font-semibold uppercase tracking-widest"
                            style={{ color: "#334155" }}
                        >
                            Overview
                        </div>
                        <div className="space-y-0.5">
                            {navItems.map((item) => (
                                <NavLink key={item.href} {...item} active={pathname === item.href} />
                            ))}
                        </div>
                    </div>

                    <div>
                        <div
                            className="px-3 mb-2 text-xs font-semibold uppercase tracking-widest"
                            style={{ color: "#334155" }}
                        >
                            Test Suites
                        </div>
                        <div className="space-y-0.5">
                            {suiteItems.map((item) => (
                                <NavLink key={item.href} {...item} active={pathname === item.href} />
                            ))}
                        </div>
                    </div>

                    <div>
                        <div
                            className="px-3 mb-2 text-xs font-semibold uppercase tracking-widest"
                            style={{ color: "#334155" }}
                        >
                            Insights
                        </div>
                        <div className="space-y-0.5">
                            {analyticsItems.map((item) => (
                                <NavLink key={item.href} {...item} active={pathname === item.href} />
                            ))}
                        </div>
                    </div>
                </nav>

                {/* Footer badge */}
                <div className="px-4 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                    <div
                        className="flex items-center gap-2 px-3 py-2 rounded-xl"
                        style={{ background: "rgba(99,102,241,0.12)" }}
                    >
                        <Sparkles size={13} style={{ color: "#818cf8" }} />
                        <span className="text-xs font-medium" style={{ color: "#818cf8" }}>
                            AI-Optimised v1.0
                        </span>
                    </div>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile topbar */}
                <header
                    className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-10"
                    style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
                >
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                    >
                        <Menu size={20} />
                    </button>
                    <div className="flex items-center gap-2">
                        <div
                            className="w-6 h-6 rounded-md flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}
                        >
                            <Bot size={13} className="text-white" />
                        </div>
                        <span className="font-semibold text-slate-800 text-sm">AgentTest Lab</span>
                    </div>
                </header>

                <main className="flex-1 overflow-auto">{children}</main>
            </div>
        </body>
    );
}
