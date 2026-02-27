"use client";

import { useState, useRef } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AnalyticsPanel from "@/components/analytics/AnalyticsPanel";
import { TestStartModal, TestResultModal } from "@/components/test/TestModals";
import { Play, Square, ChevronDown, ChevronRight, ChevronLeft, ArrowLeft, ArrowRight, Check, Navigation } from "lucide-react";

const TABS = [
    { id: "overview", label: "Overview", content: "This is the overview panel with general information about the test suite." },
    { id: "details", label: "Details", content: "Detailed configuration and settings for the navigation test scenarios." },
    { id: "results", label: "Results", content: "Test results and performance metrics will appear here after running tests." },
    { id: "settings", label: "Settings", content: "Configure test parameters, timeouts, and notification preferences here." },
    { id: "help", label: "Help", content: "Documentation, guides, and support resources for using the testing platform." },
];

const ACCORDION_ITEMS = [
    { id: "a1", title: "What is web automation testing?", body: "Web automation testing uses scripts to automatically interact with web browsers, simulating user actions to verify application behavior." },
    { id: "a2", title: "How does the AI agent use these tests?", body: "AI agents navigate and interact with these components through their test IDs, tracking timing and outcomes for each interaction." },
    { id: "a3", title: "Supported interaction types", body: "Click, input, hover, drag, keyboard events, navigation, form submission, file upload, and more." },
    { id: "a4", title: "Exporting analytics data", body: "Use the Analytics page to view all sessions, export JSON, and analyze performance across test runs." },
];

const STEPS = [
    { id: 1, label: "Start", desc: "Initialize the test session and configure settings." },
    { id: 2, label: "Configure", desc: "Set up test parameters, selectors, and assertions." },
    { id: 3, label: "Review", desc: "Preview test plan before execution." },
    { id: 4, label: "Complete", desc: "Review results and download report." },
];

const SIDE_NAV = ["Overview", "Details", "Settings", "Help"];
const TOTAL_ITEMS = 50;
const PAGE_SIZE = 5;

export default function NavigationPage() {
    const { session, isRunning, startTest, endTest, track } = useAnalytics("Navigation Test", "navigation");
    const [showStart, setShowStart] = useState(true);
    const [showResult, setShowResult] = useState(false);
    const [completedSess, setCompletedSess] = useState<import("@/lib/analytics").TestSession | null>(null);
    const handleStart = () => { setShowStart(false); startTest(); };
    const handleEndTest = () => { const s = endTest(); if (s) { setCompletedSess(s); setShowResult(true); } };
    const handleRestart = () => { setShowResult(false); setCompletedSess(null); setShowStart(true); };

    const [activeTab, setActiveTab] = useState("overview");
    const [breadcrumb, setBreadcrumb] = useState(["Home"]);
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);
    const [step, setStep] = useState(1);
    const [sideNavActive, setSideNavActive] = useState("Overview");
    const [historyStack] = useState(["Home", "Tests", "Navigation"]);
    const [historyIdx, setHistoryIdx] = useState(2);
    const [page, setPage] = useState(1);

    const t = (label: string, type: "navigation" | "click" = "navigation") => {
        const start = Date.now();
        track(type, label, "success", Date.now() - start);
    };

    const breadcrumbLevels = ["Home", "Tests", "Navigation", "Details", "Sub-item"];

    const totalPages = Math.ceil(TOTAL_ITEMS / PAGE_SIZE);

    return (
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
            {/* ── Page Hero ── */}
            <div
                className="relative rounded-2xl overflow-hidden mb-6 p-5 lg:p-6"
                style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)", boxShadow: "0 12px 40px -8px rgba(67,56,202,0.45)" }}
            >
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10" style={{ background: "radial-gradient(circle, white, transparent 70%)", transform: "translate(30%,-30%)" }} />
                <div className="relative flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                        <div
                            className="flex items-center justify-center w-11 h-11 rounded-xl flex-shrink-0"
                            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
                        >
                            <Navigation size={22} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Navigation Test</h1>
                            <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>Tabs, breadcrumbs, accordions, steppers, and pagination.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                        {isRunning && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }}>
                                <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse-dot" />
                                <span className="text-xs text-white font-medium">Running</span>
                            </div>
                        )}
                        {!isRunning ? (
                            <button
                                data-testid="start-test-btn"
                                onClick={handleStart}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-95"
                                style={{ background: "rgba(255,255,255,0.92)", color: "#3730a3" }}
                            >
                                <Play size={14} /> Start Test
                            </button>
                        ) : (
                            <button
                                data-testid="stop-test-btn"
                                onClick={handleEndTest}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-95"
                                style={{ background: "rgba(239,68,68,0.9)", color: "white" }}
                            >
                                <Square size={14} /> Stop Test
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {/* 1. Tabs */}
                <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">1. Tabs Navigation</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex overflow-x-auto border-b border-slate-100 mb-4 gap-1">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.id}
                                    data-testid={`tab-${tab.id}`}
                                    onClick={() => { setActiveTab(tab.id); t(`Tab: ${tab.label}`); }}
                                    className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-px ${activeTab === tab.id ? "border-blue-500 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-200"}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <div className="text-sm text-slate-600 p-2 bg-slate-50 rounded-lg min-h-[40px]">
                            {TABS.find((t) => t.id === activeTab)?.content}
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Breadcrumbs */}
                <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">2. Breadcrumb Navigation</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-1 text-sm flex-wrap mb-3">
                            {breadcrumb.map((crumb, i) => (
                                <span key={i} className="flex items-center gap-1">
                                    {i > 0 && <ChevronRight size={14} className="text-slate-400" />}
                                    <button
                                        data-testid={`breadcrumb-${i}`}
                                        onClick={() => {
                                            setBreadcrumb(breadcrumb.slice(0, i + 1));
                                            t(`Breadcrumb: ${crumb}`);
                                        }}
                                        className={`hover:text-blue-600 transition-colors ${i === breadcrumb.length - 1 ? "text-slate-800 font-medium" : "text-blue-500"}`}
                                    >
                                        {crumb}
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {breadcrumbLevels.slice(breadcrumb.length).slice(0, 1).map((level) => (
                                <Button
                                    key={level}
                                    size="sm"
                                    variant="outline"
                                    data-testid={`breadcrumb-add-${level.toLowerCase()}`}
                                    disabled={!isRunning}
                                    onClick={() => { setBreadcrumb((b) => [...b, level]); t(`Breadcrumb Navigate to: ${level}`); }}
                                    className="gap-1 text-xs"
                                >
                                    Go to {level} <ChevronRight size={12} />
                                </Button>
                            ))}
                            {breadcrumb.length > 1 && (
                                <Button size="sm" variant="ghost" disabled={!isRunning}
                                    onClick={() => { setBreadcrumb(["Home"]); t("Breadcrumb: Reset to Home"); }}
                                    className="text-xs text-slate-500"
                                >Reset</Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Accordion */}
                <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">3. Accordion</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        {ACCORDION_ITEMS.map((item) => (
                            <div key={item.id} className="border border-slate-100 rounded-lg overflow-hidden">
                                <button
                                    data-testid={`accordion-${item.id}`}
                                    disabled={!isRunning}
                                    className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-800 hover:bg-slate-50 transition-colors"
                                    onClick={() => {
                                        const next = openAccordion === item.id ? null : item.id;
                                        setOpenAccordion(next);
                                        t(`Accordion ${next ? "Open" : "Close"}: ${item.title}`);
                                    }}
                                >
                                    {item.title}
                                    <ChevronDown
                                        size={16}
                                        className={`text-slate-400 transition-transform ${openAccordion === item.id ? "rotate-180" : ""}`}
                                    />
                                </button>
                                {openAccordion === item.id && (
                                    <div className="px-4 pb-3 text-sm text-slate-600 border-t border-slate-100 bg-slate-50 animate-fade-in">
                                        {item.body}
                                    </div>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* 4. Stepper */}
                <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">4. Stepper Wizard</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between mb-6">
                            {STEPS.map((s, i) => (
                                <div key={s.id} className="flex-1 flex items-center">
                                    <div className="flex flex-col items-center flex-1">
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all ${step > s.id ? "bg-green-500 border-green-500 text-white" :
                                                step === s.id ? "bg-blue-600 border-blue-600 text-white" :
                                                    "bg-white border-slate-200 text-slate-400"
                                                }`}
                                        >
                                            {step > s.id ? <Check size={14} /> : s.id}
                                        </div>
                                        <span className={`text-xs mt-1 font-medium ${step >= s.id ? "text-slate-700" : "text-slate-400"}`}>{s.label}</span>
                                    </div>
                                    {i < STEPS.length - 1 && (
                                        <div className={`h-0.5 flex-1 mx-1 transition-colors ${step > s.id ? "bg-green-500" : "bg-slate-200"}`} />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 mb-4 text-sm text-slate-600">
                            <strong className="text-slate-800">Step {step}: {STEPS[step - 1].label}</strong>
                            <p className="mt-1">{STEPS[step - 1].desc}</p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                data-testid="step-back-btn"
                                variant="outline" size="sm" disabled={step === 1 || !isRunning}
                                onClick={() => { setStep((s) => s - 1); t(`Stepper Back to Step ${step - 1}`); }}
                                className="gap-1"
                            >
                                <ArrowLeft size={14} /> Back
                            </Button>
                            <Button
                                data-testid="step-next-btn"
                                size="sm" disabled={step === STEPS.length || !isRunning}
                                onClick={() => { setStep((s) => s + 1); t(`Stepper Next to Step ${step + 1}`); }}
                                className="gap-1"
                            >
                                Next <ArrowRight size={14} />
                            </Button>
                            {step === STEPS.length && (
                                <Button data-testid="step-restart-btn" variant="ghost" size="sm" onClick={() => { setStep(1); t("Stepper Restart"); }} disabled={!isRunning}>
                                    Restart
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 5. Sidebar mini-nav */}
                <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">5. Sidebar Mini-Nav</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex gap-4">
                            <div className="w-40 flex flex-col gap-0.5 border-r border-slate-100 pr-4">
                                {SIDE_NAV.map((item) => (
                                    <button
                                        key={item}
                                        data-testid={`sidenav-${item.toLowerCase()}`}
                                        disabled={!isRunning}
                                        onClick={() => { setSideNavActive(item); t(`Side Nav: ${item}`); }}
                                        className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${sideNavActive === item ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                            <div className="flex-1 bg-slate-50 rounded-lg p-3 text-sm text-slate-600">
                                <strong className="text-slate-800">{sideNavActive}</strong>
                                <p className="mt-1">Content for the <em>{sideNavActive}</em> section of the side navigation.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 6. Back/Forward */}
                <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">6. Back / Forward History</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-3 mb-3">
                            <Button
                                data-testid="history-back-btn"
                                variant="outline" size="icon" disabled={historyIdx === 0 || !isRunning}
                                onClick={() => { const i = historyIdx - 1; setHistoryIdx(i); t(`History Back: ${historyStack[i]}`); }}
                            >
                                <ChevronLeft size={16} />
                            </Button>
                            <Badge className="bg-blue-50 text-blue-700 border border-blue-200 font-mono text-xs px-3">
                                {historyStack[historyIdx]}
                            </Badge>
                            <Button
                                data-testid="history-forward-btn"
                                variant="outline" size="icon" disabled={historyIdx === historyStack.length - 1 || !isRunning}
                                onClick={() => { const i = historyIdx + 1; setHistoryIdx(i); t(`History Forward: ${historyStack[i]}`); }}
                            >
                                <ChevronRight size={16} />
                            </Button>
                        </div>
                        <div className="flex gap-2 text-xs text-slate-400">
                            {historyStack.map((item, i) => (
                                <span key={i} className={`px-2 py-0.5 rounded ${i === historyIdx ? "bg-blue-100 text-blue-700 font-medium" : "text-slate-400"}`}>{item}</span>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* 7. Pagination */}
                <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">7. Pagination</CardTitle></CardHeader>
                    <CardContent>
                        <div className="mb-3 space-y-1">
                            {Array.from({ length: PAGE_SIZE }, (_, i) => {
                                const itemNum = (page - 1) * PAGE_SIZE + i + 1;
                                return (
                                    <div key={itemNum} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg text-sm text-slate-700">
                                        <span className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{itemNum}</span>
                                        Mock item #{itemNum} — Sample data row
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex items-center gap-1 flex-wrap">
                            <Button data-testid="page-prev-btn" variant="outline" size="sm" disabled={page === 1 || !isRunning} className="gap-1"
                                onClick={() => { setPage((p) => p - 1); t(`Pagination: Page ${page - 1}`); }}>
                                <ChevronLeft size={14} /> Prev
                            </Button>
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                const p = i + 1;
                                return (
                                    <button
                                        key={p}
                                        data-testid={`page-${p}-btn`}
                                        disabled={!isRunning}
                                        onClick={() => { setPage(p); t(`Pagination: Page ${p}`); }}
                                        className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${page === p ? "bg-blue-600 text-white" : "border border-slate-100 text-slate-600 hover:bg-slate-50"}`}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                            {totalPages > 5 && <span className="text-slate-400 text-sm">…{totalPages}</span>}
                            <Button data-testid="page-next-btn" variant="outline" size="sm" disabled={page === totalPages || !isRunning} className="gap-1"
                                onClick={() => { setPage((p) => p + 1); t(`Pagination: Page ${page + 1}`); }}>
                                Next <ChevronRight size={14} />
                            </Button>
                            <span className="ml-2 text-xs text-slate-400">Page {page} of {totalPages} ({TOTAL_ITEMS} items)</span>
                        </div>
                    </CardContent>
                </Card>

                {/* 8. Anchor links */}
                <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">8. Anchor / Scroll Links</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {["section-a", "section-b", "section-c"].map((id) => (
                                <a
                                    key={id}
                                    href={`#${id}`}
                                    data-testid={`anchor-${id}`}
                                    onClick={() => t(`Anchor Link: #${id}`)}
                                    className="px-4 py-2 bg-slate-100 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors"
                                >
                                    #{id}
                                </a>
                            ))}
                        </div>
                        <div className="space-y-3 max-h-40 overflow-y-auto border border-slate-100 rounded-lg p-3">
                            {["section-a", "section-b", "section-c"].map((id, i) => (
                                <div key={id} id={id} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                                    <h4 className="font-semibold text-slate-700 text-sm capitalize">{id.replace("-", " ").toUpperCase()}</h4>
                                    <p className="text-xs text-slate-500 mt-1">Section {i + 1} content area. Clicking the anchor link above scrolls to this section.</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {showStart && (
                <TestStartModal testName="Navigation Test" category="navigation" description="Tabs, accordions, breadcrumbs, stepper wizard, pagination, anchor scrolling, and back/forward history — all tracked." onStart={handleStart} />
            )}
            {showResult && completedSess && (
                <TestResultModal session={completedSess} onClose={() => setShowResult(false)} onRestart={handleRestart} />
            )}
            <AnalyticsPanel session={session} isRunning={isRunning} />
        </div>
    );
}
