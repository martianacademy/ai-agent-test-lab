"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AnalyticsPanel from "@/components/analytics/AnalyticsPanel";
import { TestStartModal, TestResultModal } from "@/components/test/TestModals";
import { Play, Square, Plus, RefreshCw, X, Zap } from "lucide-react";

// Mock data
const ALL_ITEMS = Array.from({ length: 100 }, (_, i) => ({ id: i + 1, name: `Item #${String(i + 1).padStart(3, "0")}`, category: ["Alpha", "Beta", "Gamma", "Delta"][i % 4] }));
const SEARCH_LIST = ["React", "Next.js", "TypeScript", "Tailwind CSS", "GraphQL", "Node.js", "PostgreSQL", "Redis", "Docker", "Kubernetes", "AWS", "Vercel", "Prisma", "tRPC", "Zustand", "SWR", "Framer Motion", "Zod", "Vitest", "Playwright"];
const SUGGESTIONS = ["apple", "application", "apply", "approach", "approve", "april", "banana", "band", "banner", "base", "basic", "batch", "batch-test", "browser", "button"];
const IMG_PLACEHOLDERS = Array.from({ length: 12 }, (_, i) => ({ id: i, loaded: false, color: ["#e0f2fe", "#fce7f3", "#dcfce7", "#fef9c3", "#f3e8ff", "#fee2e2"][i % 6] }));

export default function DynamicPage() {
    const { session, isRunning, startTest, endTest, track } = useAnalytics("Dynamic Content Test", "dynamic");
    const [showStart, setShowStart] = useState(true);
    const [showResult, setShowResult] = useState(false);
    const [completedSess, setCompletedSess] = useState<import("@/lib/analytics").TestSession | null>(null);
    const handleStart = () => { setShowStart(false); startTest(); };
    const handleEndTest = () => { const s = endTest(); if (s) { setCompletedSess(s); setShowResult(true); } };
    const handleRestart = () => { setShowResult(false); setCompletedSess(null); setShowStart(true); };

    // 1. Infinite scroll
    const [visibleCount, setVisibleCount] = useState(10);
    const scrollTriggerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = scrollTriggerRef.current;
        if (!el || !isRunning) return;
        const obs = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && visibleCount < ALL_ITEMS.length) {
                const start = Date.now();
                setVisibleCount((c) => Math.min(c + 10, ALL_ITEMS.length));
                track("scroll", `Infinite Scroll: Load more (${visibleCount + 10})`, "success", Date.now() - start);
            }
        }, { threshold: 0.1 });
        obs.observe(el);
        return () => obs.disconnect();
    }, [visibleCount, isRunning, track]);

    // 2. Live search
    const [searchQuery, setSearchQuery] = useState("");
    const searchResults = SEARCH_LIST.filter((item) => item.toLowerCase().includes(searchQuery.toLowerCase()));

    // 3. Autocomplete
    const [acInput, setAcInput] = useState("");
    const [acOpen, setAcOpen] = useState(false);
    const acSuggestions = acInput.length > 0 ? SUGGESTIONS.filter((s) => s.startsWith(acInput.toLowerCase())).slice(0, 6) : [];

    // 4. Lazy images
    const [loadedImgs, setLoadedImgs] = useState<Set<number>>(new Set());
    const imgRefs = useRef<(HTMLDivElement | null)[]>([]);
    useEffect(() => {
        const obs = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const id = parseInt(entry.target.getAttribute("data-img-id") || "0");
                    setLoadedImgs((prev) => new Set([...prev, id]));
                }
            });
        }, { threshold: 0.1 });
        imgRefs.current.forEach((ref) => ref && obs.observe(ref));
        return () => obs.disconnect();
    }, []);

    // 5. Real-time counter
    const [rtCounter, setRtCounter] = useState(0);
    const [rtRunning, setRtRunning] = useState(false);
    const rtTimer = useRef<ReturnType<typeof setInterval> | null>(null);
    const startRtCounter = () => {
        setRtRunning(true);
        rtTimer.current = setInterval(() => setRtCounter((c) => c + 1), 1000);
        track("click", "Real-time Counter: Start", "success", 0);
    };
    const stopRtCounter = () => {
        setRtRunning(false);
        if (rtTimer.current) clearInterval(rtTimer.current);
        track("click", "Real-time Counter: Stop", "success", 0, { value: rtCounter });
    };
    const resetRtCounter = () => {
        setRtRunning(false);
        if (rtTimer.current) clearInterval(rtTimer.current);
        setRtCounter(0);
        track("click", "Real-time Counter: Reset", "success", 0);
    };

    // 6. Polling
    const [pollData, setPollData] = useState<{ value: number; time: string } | null>(null);
    const [polling, setPolling] = useState(false);
    const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
    const fetchPoll = useCallback(() => {
        const start = Date.now();
        setPollData({ value: Math.floor(Math.random() * 1000), time: new Date().toLocaleTimeString() });
        track("custom", "Polling: API Fetch", "success", Date.now() - start);
    }, [track]);
    const startPolling = () => {
        setPolling(true);
        fetchPoll();
        pollTimer.current = setInterval(fetchPoll, 3000);
        track("click", "Polling: Start", "success", 0);
    };
    const stopPolling = () => {
        setPolling(false);
        if (pollTimer.current) clearInterval(pollTimer.current);
        track("click", "Polling: Stop", "success", 0);
    };

    // 7. Optimistic UI
    const [optimisticList, setOptimisticList] = useState<{ id: number; text: string; saving: boolean }[]>([]);
    const optId = useRef(0);
    const addOptimistic = () => {
        const start = Date.now();
        const id = ++optId.current;
        const newItem = { id, text: `Optimistic item #${id}`, saving: true };
        setOptimisticList((l) => [newItem, ...l]);
        track("click", `Optimistic Add Item #${id}`, "success", 0);
        setTimeout(() => {
            setOptimisticList((l) => l.map((item) => item.id === id ? { ...item, saving: false } : item));
            track("custom", `Optimistic Save Item #${id}`, "success", Date.now() - start);
        }, 1000);
    };

    // 8. Skeleton
    const [skeletonState, setSkeletonState] = useState<"idle" | "loading" | "loaded">("idle");
    const triggerSkeleton = () => {
        const start = Date.now();
        setSkeletonState("loading");
        track("click", "Skeleton: Trigger Load", "success", 0);
        setTimeout(() => {
            setSkeletonState("loaded");
            track("custom", "Skeleton: Content Revealed", "success", Date.now() - start);
        }, 1500);
    };

    return (
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
            {/* ── Page Hero ── */}
            <div
                className="relative rounded-2xl overflow-hidden mb-6 p-5 lg:p-6"
                style={{ background: "linear-gradient(135deg, #78350f 0%, #d97706 100%)", boxShadow: "0 12px 40px -8px rgba(217,119,6,0.45)" }}
            >
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10" style={{ background: "radial-gradient(circle, white, transparent 70%)", transform: "translate(30%,-30%)" }} />
                <div className="relative flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                        <div
                            className="flex items-center justify-center w-11 h-11 rounded-xl flex-shrink-0"
                            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
                        >
                            <Zap size={22} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Dynamic Content Test</h1>
                            <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>Lazy loading, infinite scroll, polling, and optimistic UI.</p>
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
                                style={{ background: "rgba(255,255,255,0.92)", color: "#92400e" }}
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
                {/* 1. Infinite scroll */}
                <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">1. Infinite Scroll ({visibleCount}/{ALL_ITEMS.length} items)</CardTitle></CardHeader>
                    <CardContent>
                        <div className="max-h-48 overflow-y-auto space-y-1 border border-slate-100 rounded-lg p-2">
                            {ALL_ITEMS.slice(0, visibleCount).map((item) => (
                                <div key={item.id} className="flex items-center justify-between px-3 py-1.5 bg-slate-50 rounded-md text-sm">
                                    <span className="text-slate-700">{item.name}</span>
                                    <Badge variant="outline" className="text-xs">{item.category}</Badge>
                                </div>
                            ))}
                            {visibleCount < ALL_ITEMS.length && (
                                <div ref={scrollTriggerRef} className="text-center py-2 text-xs text-slate-400">Loading more…</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Live search */}
                <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">2. Live Search Filter</CardTitle></CardHeader>
                    <CardContent>
                        <input
                            data-testid="live-search-input"
                            type="text"
                            placeholder="Search technologies..."
                            value={searchQuery}
                            disabled={!isRunning}
                            onChange={(e) => {
                                const start = Date.now();
                                setSearchQuery(e.target.value);
                                track("search", `Search: "${e.target.value}" (${searchResults.length} results)`, "success", Date.now() - start, { query: e.target.value, results: searchResults.length });
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex flex-wrap gap-2 min-h-[2rem]">
                            {(searchQuery ? searchResults : SEARCH_LIST).map((item) => (
                                <Badge key={item} className="bg-blue-50 text-blue-700 border border-blue-200">{item}</Badge>
                            ))}
                            {searchQuery && searchResults.length === 0 && (
                                <p className="text-sm text-slate-400">No results for "{searchQuery}"</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Autocomplete */}
                <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">3. Autocomplete Input</CardTitle></CardHeader>
                    <CardContent className="relative">
                        <input
                            data-testid="autocomplete-input"
                            type="text"
                            placeholder="Type a letter..."
                            value={acInput}
                            disabled={!isRunning}
                            onChange={(e) => {
                                const start = Date.now();
                                setAcInput(e.target.value);
                                setAcOpen(true);
                                track("input", `Autocomplete: "${e.target.value}"`, "success", Date.now() - start);
                            }}
                            onBlur={() => setTimeout(() => setAcOpen(false), 150)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {acOpen && acSuggestions.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-100 rounded-lg shadow-lg overflow-hidden">
                                {acSuggestions.map((s) => (
                                    <button
                                        key={s}
                                        data-testid={`autocomplete-option-${s}`}
                                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                                        onMouseDown={(e) => { e.preventDefault(); setAcInput(s); setAcOpen(false); track("click", `Autocomplete Select: ${s}`, "success", 0); }}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 4. Lazy images */}
                <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">4. Lazy Image Loading ({loadedImgs.size}/12 loaded)</CardTitle></CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {IMG_PLACEHOLDERS.map((img) => (
                                <div
                                    key={img.id}
                                    data-img-id={img.id}
                                    ref={(el) => { imgRefs.current[img.id] = el; }}
                                    className="aspect-square rounded-lg overflow-hidden border border-slate-100 flex items-center justify-center"
                                    style={{ backgroundColor: img.color }}
                                >
                                    {loadedImgs.has(img.id) ? (
                                        <span className="text-xs text-slate-500 font-mono">#{img.id + 1}</span>
                                    ) : (
                                        <div className="skeleton w-full h-full" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* 5. Real-time counter */}
                <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">5. Real-time Counter</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <div className="text-5xl font-bold text-slate-800 w-24 text-center tabular-nums">{rtCounter}</div>
                            <div className="flex gap-2">
                                {!rtRunning ? (
                                    <Button data-testid="rt-counter-start" size="sm" variant="success" disabled={!isRunning} onClick={startRtCounter} className="gap-1">
                                        <Play size={14} /> Start
                                    </Button>
                                ) : (
                                    <Button data-testid="rt-counter-stop" size="sm" variant="destructive" onClick={stopRtCounter} className="gap-1">
                                        <Square size={14} /> Stop
                                    </Button>
                                )}
                                <Button data-testid="rt-counter-reset" size="sm" variant="outline" disabled={!isRunning} onClick={resetRtCounter}>Reset</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 6. Polling */}
                <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">6. API Polling Simulation (3s interval)</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            {pollData ? (
                                <div className="flex-1 bg-slate-50 px-4 py-3 rounded-lg">
                                    <div className="text-2xl font-bold text-slate-800">{pollData.value}</div>
                                    <div className="text-xs text-slate-400 mt-1">Last fetched: {pollData.time}</div>
                                </div>
                            ) : (
                                <div className="flex-1 bg-slate-50 px-4 py-3 rounded-lg text-sm text-slate-400">No data — start polling</div>
                            )}
                            {!polling ? (
                                <Button data-testid="polling-start-btn" size="sm" variant="success" disabled={!isRunning} onClick={startPolling} className="gap-1">
                                    <RefreshCw size={14} /> Start Polling
                                </Button>
                            ) : (
                                <Button data-testid="polling-stop-btn" size="sm" variant="destructive" onClick={stopPolling} className="gap-1">
                                    <Square size={14} /> Stop
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 7. Optimistic UI */}
                <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">7. Optimistic UI Update</CardTitle></CardHeader>
                    <CardContent>
                        <Button data-testid="add-optimistic-btn" size="sm" disabled={!isRunning} onClick={addOptimistic} className="gap-1.5 mb-3">
                            <Plus size={14} /> Add Item (Optimistic)
                        </Button>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                            {optimisticList.map((item) => (
                                <div key={item.id} className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm border ${item.saving ? "border-yellow-200 bg-yellow-50" : "border-green-200 bg-green-50"}`}>
                                    <span className={item.saving ? "text-yellow-700" : "text-green-700"}>{item.text}</span>
                                    <Badge className={`text-xs ${item.saving ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>{item.saving ? "Saving…" : "Saved"}</Badge>
                                </div>
                            ))}
                            {optimisticList.length === 0 && <p className="text-xs text-slate-400">No items yet.</p>}
                        </div>
                    </CardContent>
                </Card>

                {/* 8. Skeleton */}
                <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">8. Skeleton Loading</CardTitle></CardHeader>
                    <CardContent>
                        <Button data-testid="trigger-skeleton-btn" size="sm" disabled={!isRunning || skeletonState === "loading"} onClick={triggerSkeleton} className="mb-3 gap-1.5">
                            <RefreshCw size={14} className={skeletonState === "loading" ? "animate-spin" : ""} />
                            {skeletonState === "loading" ? "Loading…" : "Trigger Load"}
                        </Button>
                        {skeletonState === "idle" && (
                            <p className="text-sm text-slate-400">Click "Trigger Load" to see skeleton loading.</p>
                        )}
                        {skeletonState === "loading" && (
                            <div className="space-y-3">
                                <div className="skeleton h-5 w-3/4" />
                                <div className="skeleton h-4 w-full" />
                                <div className="skeleton h-4 w-5/6" />
                                <div className="skeleton h-4 w-2/3" />
                                <div className="flex gap-3">
                                    <div className="skeleton h-8 w-20" />
                                    <div className="skeleton h-8 w-20" />
                                </div>
                            </div>
                        )}
                        {skeletonState === "loaded" && (
                            <div className="space-y-2 animate-fade-in">
                                <h4 className="font-semibold text-slate-800">Content Loaded!</h4>
                                <p className="text-sm text-slate-600">This content was revealed after a 1.5 second simulated load. The skeleton was shown during loading.</p>
                                <p className="text-sm text-slate-600">The transition timing was tracked in the analytics panel below.</p>
                                <div className="flex gap-2 mt-2">
                                    <Badge className="bg-green-100 text-green-700">Success</Badge>
                                    <Badge variant="outline">~1.5s load</Badge>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {showStart && (
                <TestStartModal testName="Dynamic Content Test" category="dynamic" description="Infinite scroll, live search, autocomplete, lazy image loading, real-time counters, polling, optimistic UI, and skeleton loaders." onStart={handleStart} />
            )}
            {showResult && completedSess && (
                <TestResultModal session={completedSess} onClose={() => setShowResult(false)} onRestart={handleRestart} />
            )}
            <AnalyticsPanel session={session} isRunning={isRunning} />
        </div>
    );
}
