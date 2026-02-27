"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AnalyticsPanel from "@/components/analytics/AnalyticsPanel";
import { TestStartModal, TestResultModal } from "@/components/test/TestModals";
import { Play, Square, Copy, Check, ChevronUp, ChevronDown, Minus, Plus, MousePointer} from "lucide-react";

interface ActionEntry { id: number; label: string; time: string; }

export default function InteractionsPage() {
    const { session, isRunning, startTest, endTest, track } = useAnalytics("Interactions Test", "interactions");
    const [showStart, setShowStart] = useState(true);
    const [showResult, setShowResult] = useState(false);
    const [completedSess, setCompletedSess] = useState<import("@/lib/analytics").TestSession | null>(null);
    const handleStart = () => { setShowStart(false); startTest(); };
    const handleEndTest = () => { const s = endTest(); if (s) { setCompletedSess(s); setShowResult(true); } };
    const handleRestart = () => { setShowResult(false); setCompletedSess(null); setShowStart(true); };
    const [clickCount, setClickCount] = useState(0);
    const [dblClickCount, setDblClickCount] = useState(0);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
    const [hoverCard, setHoverCard] = useState(false);
    const hoverStart = useRef(0);
    const [focusField, setFocusField] = useState(false);
    const [longPressActive, setLongPressActive] = useState(false);
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [keysPressed, setKeysPressed] = useState<string[]>([]);
    const [copied, setCopied] = useState(false);
    const [toggleOn, setToggleOn] = useState(false);
    const [counter, setCounter] = useState(0);
    const [color, setColor] = useState("#3b82f6");
    const [actionFeed, setActionFeed] = useState<ActionEntry[]>([]);
    const actionId = useRef(0);
    const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

    const addAction = useCallback((label: string) => {
        setActionFeed((prev) => [
            { id: actionId.current++, label, time: new Date().toLocaleTimeString() },
            ...prev.slice(0, 19),
        ]);
    }, []);

    const t = useCallback((type: Parameters<typeof track>[0], label: string, dur?: number, meta?: Record<string, unknown>) => {
        track(type, label, "success", dur, meta);
        addAction(label);
    }, [track, addAction]);

    // Keyboard detection
    useEffect(() => {
        if (!isRunning) return;
        const handler = (e: KeyboardEvent) => {
            const key = e.key === " " ? "Space" : e.key;
            setKeysPressed([key]);
            t("keyboard", `Key: ${key}`, 0, { key, code: e.code });
            setTimeout(() => setKeysPressed([]), 800);
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [isRunning, t]);

    // Context menu close
    useEffect(() => {
        const close = () => setContextMenu(null);
        window.addEventListener("click", close);
        return () => window.removeEventListener("click", close);
    }, []);

    const handleRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const id = Date.now();
        setRipples((r) => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
        setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 600);
        const start = Date.now();
        t("click", "Ripple Button Click", Date.now() - start);
    };

    return (
        <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* ── Page Hero ── */}
      <div
        className="relative rounded-2xl overflow-hidden mb-6 p-5 lg:p-6"
        style={{ background: "linear-gradient(135deg, #2e1065 0%, #7c3aed 100%)", boxShadow: "0 12px 40px -8px rgba(124,58,237,0.45)" }}
      >
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10" style={{ background: "radial-gradient(circle, white, transparent 70%)", transform: "translate(30%,-30%)" }} />
        <div className="relative flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center w-11 h-11 rounded-xl flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
            >
              <MousePointer size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Interactions Test</h1>
              <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>All user interaction types with real-time tracking.</p>
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
                style={{ background: "rgba(255,255,255,0.92)", color: "#6d28d9" }}
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Interactions */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Click counter */}
                    <Card>
                        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">1. Click Counter</CardTitle></CardHeader>
                        <CardContent className="flex items-center gap-4">
                            <Button
                                data-testid="click-counter-btn"
                                onClick={() => {
                                    const start = Date.now();
                                    setClickCount((c) => c + 1);
                                    t("click", `Click Counter (#${clickCount + 1})`, Date.now() - start, { count: clickCount + 1 });
                                }}
                                disabled={!isRunning}
                            >
                                Click Me!
                            </Button>
                            <Badge className="text-base px-3 py-1 bg-blue-100 text-blue-700">{clickCount} clicks</Badge>
                        </CardContent>
                    </Card>

                    {/* Double click */}
                    <Card>
                        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">2. Double Click Detection</CardTitle></CardHeader>
                        <CardContent>
                            <div
                                data-testid="double-click-zone"
                                onDoubleClick={() => {
                                    const start = Date.now();
                                    setDblClickCount((c) => c + 1);
                                    t("click", `Double Click (#${dblClickCount + 1})`, Date.now() - start, { count: dblClickCount + 1 });
                                }}
                                className="flex items-center justify-center h-20 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-400 cursor-pointer bg-slate-50 hover:bg-blue-50 transition-colors select-none"
                            >
                                <span className="text-sm text-slate-500">Double-click here — <span className="font-semibold text-blue-600">{dblClickCount}</span> detected</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right-click context menu */}
                    <Card>
                        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">3. Right-Click Context Menu</CardTitle></CardHeader>
                        <CardContent className="relative">
                            <div
                                data-testid="context-menu-zone"
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    const start = Date.now();
                                    setContextMenu({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
                                    t("click", "Right Click (Context Menu)", Date.now() - start);
                                }}
                                className="flex items-center justify-center h-16 rounded-xl border-2 border-dashed border-slate-200 hover:border-purple-400 cursor-context-menu bg-slate-50 select-none"
                            >
                                <span className="text-sm text-slate-500">Right-click here</span>
                            </div>
                            {contextMenu && (
                                <div
                                    className="absolute z-50 bg-white border border-slate-100 rounded-lg shadow-lg py-1 min-w-[160px] animate-fade-in"
                                    style={{ left: contextMenu.x, top: contextMenu.y }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {["Copy", "Paste", "Select All", "Inspect"].map((item) => (
                                        <button
                                            key={item}
                                            data-testid={`context-${item.toLowerCase().replace(" ", "-")}`}
                                            className="w-full px-4 py-2 text-sm text-left text-slate-700 hover:bg-slate-100"
                                            onClick={() => { t("click", `Context Menu: ${item}`, 0); setContextMenu(null); }}
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Hover card */}
                    <Card>
                        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">4. Hover Card</CardTitle></CardHeader>
                        <CardContent>
                            <div className="relative inline-block">
                                <div
                                    data-testid="hover-zone"
                                    onMouseEnter={() => { hoverStart.current = Date.now(); setHoverCard(true); }}
                                    onMouseLeave={() => {
                                        const dur = Date.now() - hoverStart.current;
                                        setHoverCard(false);
                                        t("hover", `Hover (${dur}ms)`, dur);
                                    }}
                                    className="px-5 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg cursor-pointer font-medium select-none"
                                >
                                    Hover over me
                                </div>
                                {hoverCard && (
                                    <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-100 rounded-xl shadow-lg p-3 z-10 animate-fade-in">
                                        <p className="text-sm font-semibold text-slate-800">Hover Info Card</p>
                                        <p className="text-xs text-slate-500 mt-1">Hover duration is being tracked. Move mouse away to record.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Focus/blur */}
                    <Card>
                        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">5. Focus / Blur Tracking</CardTitle></CardHeader>
                        <CardContent>
                            <input
                                data-testid="focus-blur-input"
                                type="text"
                                placeholder="Click to focus, then blur..."
                                onFocus={() => { setFocusField(true); t("input", "Input Focused", 0); }}
                                onBlur={() => { setFocusField(false); t("input", "Input Blurred", 0); }}
                                className={`w-full px-3 py-2 rounded-xl border text-sm transition-all ${focusField ? "border-blue-500 ring-2 ring-blue-200" : "border-slate-200"}`}
                            />
                            <p className="mt-1 text-xs text-slate-400">State: <span className={`font-medium ${focusField ? "text-blue-600" : "text-slate-500"}`}>{focusField ? "Focused" : "Blurred"}</span></p>
                        </CardContent>
                    </Card>

                    {/* Long press */}
                    <Card>
                        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">6. Long Press (500ms)</CardTitle></CardHeader>
                        <CardContent>
                            <button
                                data-testid="long-press-btn"
                                disabled={!isRunning}
                                onMouseDown={() => {
                                    const start = Date.now();
                                    setLongPressActive(false);
                                    longPressTimer.current = setTimeout(() => {
                                        setLongPressActive(true);
                                        t("click", "Long Press Detected", Date.now() - start, { duration: 500 });
                                    }, 500);
                                }}
                                onMouseUp={() => { if (longPressTimer.current) clearTimeout(longPressTimer.current); }}
                                onMouseLeave={() => { if (longPressTimer.current) clearTimeout(longPressTimer.current); }}
                                className={`px-6 py-3 rounded-lg font-medium text-sm select-none transition-all border-2 ${longPressActive ? "bg-orange-500 text-white border-orange-500" : "bg-white text-slate-700 border-slate-200 hover:border-orange-400"}`}
                            >
                                {longPressActive ? "Long press detected!" : "Hold for 500ms"}
                            </button>
                        </CardContent>
                    </Card>

                    {/* Keyboard shortcuts */}
                    <Card>
                        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">7. Keyboard Detection</CardTitle></CardHeader>
                        <CardContent>
                            <div
                                data-testid="keyboard-zone"
                                className="flex items-center justify-center h-16 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500"
                                tabIndex={0}
                            >
                                {keysPressed.length > 0
                                    ? <Badge className="text-base px-3 bg-purple-100 text-purple-700">{keysPressed.join(" + ")}</Badge>
                                    : "Press any key (click page first)"}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Copy to clipboard */}
                    <Card>
                        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">8. Copy to Clipboard</CardTitle></CardHeader>
                        <CardContent className="flex items-center gap-3">
                            <code className="flex-1 bg-slate-100 px-3 py-2 rounded-lg text-sm text-slate-700 font-mono truncate">
                                agent-test-lab-token-abc123
                            </code>
                            <Button
                                data-testid="copy-btn"
                                size="sm"
                                variant="outline"
                                disabled={!isRunning}
                                className="gap-1.5"
                                onClick={() => {
                                    const start = Date.now();
                                    navigator.clipboard.writeText("agent-test-lab-token-abc123").then(() => {
                                        setCopied(true);
                                        t("click", "Copy to Clipboard", Date.now() - start);
                                        setTimeout(() => setCopied(false), 2000);
                                    });
                                }}
                            >
                                {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Toggle switch */}
                    <Card>
                        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">9. Animated Toggle Switch</CardTitle></CardHeader>
                        <CardContent className="flex items-center gap-4">
                            <label className="toggle-switch">
                                <input
                                    data-testid="toggle-switch"
                                    type="checkbox"
                                    checked={toggleOn}
                                    disabled={!isRunning}
                                    onChange={() => {
                                        const start = Date.now();
                                        setToggleOn((v) => !v);
                                        t("click", `Toggle ${!toggleOn ? "ON" : "OFF"}`, Date.now() - start, { state: !toggleOn });
                                    }}
                                />
                                <span className="toggle-slider" />
                            </label>
                            <span className={`text-sm font-medium ${toggleOn ? "text-blue-600" : "text-slate-500"}`}>{toggleOn ? "Enabled" : "Disabled"}</span>
                        </CardContent>
                    </Card>

                    {/* Counter */}
                    <Card>
                        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">10. Animated Counter</CardTitle></CardHeader>
                        <CardContent className="flex items-center gap-4">
                            <Button data-testid="counter-decrement" variant="outline" size="icon" disabled={!isRunning} onClick={() => { const s = Date.now(); setCounter((c) => c - 1); t("click", `Counter Dec (${counter - 1})`, Date.now() - s, { value: counter - 1 }); }}>
                                <Minus size={16} />
                            </Button>
                            <div className="text-3xl font-bold text-slate-800 w-16 text-center tabular-nums">{counter}</div>
                            <Button data-testid="counter-increment" variant="outline" size="icon" disabled={!isRunning} onClick={() => { const s = Date.now(); setCounter((c) => c + 1); t("click", `Counter Inc (${counter + 1})`, Date.now() - s, { value: counter + 1 }); }}>
                                <Plus size={16} />
                            </Button>
                            <Button data-testid="counter-reset" variant="ghost" size="sm" disabled={!isRunning} onClick={() => { const s = Date.now(); setCounter(0); t("click", "Counter Reset", Date.now() - s); }}>
                                Reset
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Color picker */}
                    <Card>
                        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">11. Color Picker</CardTitle></CardHeader>
                        <CardContent className="flex items-center gap-4">
                            <input
                                data-testid="color-picker"
                                type="color"
                                value={color}
                                disabled={!isRunning}
                                onChange={(e) => {
                                    const s = Date.now();
                                    setColor(e.target.value);
                                    t("input", `Color: ${e.target.value}`, Date.now() - s, { color: e.target.value });
                                }}
                                className="w-12 h-12 rounded-lg cursor-pointer border border-slate-100 p-0.5"
                            />
                            <div className="w-12 h-12 rounded-lg border border-slate-100 shadow-sm" style={{ backgroundColor: color }} />
                            <span className="font-mono text-sm text-slate-700">{color.toUpperCase()}</span>
                        </CardContent>
                    </Card>

                    {/* Ripple button */}
                    <Card>
                        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">12. Ripple Effect Button</CardTitle></CardHeader>
                        <CardContent>
                            <button
                                data-testid="ripple-btn"
                                disabled={!isRunning}
                                onClick={handleRipple}
                                className="relative overflow-hidden px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors select-none disabled:opacity-50"
                            >
                                Click for Ripple
                                {ripples.map((r) => (
                                    <span
                                        key={r.id}
                                        className="absolute rounded-full bg-white/30 pointer-events-none"
                                        style={{
                                            width: 10, height: 10,
                                            left: r.x - 5, top: r.y - 5,
                                            animation: "ripple 0.6s ease-out forwards",
                                        }}
                                    />
                                ))}
                            </button>
                        </CardContent>
                    </Card>
                </div>

                {/* Action feed */}
                <div className="lg:col-span-1">
                    <Card className="border border-slate-100 sticky top-4">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${isRunning ? "bg-green-500 animate-pulse-dot" : "bg-gray-300"}`} />
                                Action Feed
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3">
                            <div className="max-h-[600px] overflow-y-auto space-y-1">
                                {actionFeed.length === 0 ? (
                                    <p className="text-xs text-slate-400 p-2 text-center">No actions yet.</p>
                                ) : (
                                    actionFeed.map((a) => (
                                        <div key={a.id} className="flex items-start gap-2 px-2 py-1.5 rounded-md bg-slate-50 animate-fade-in">
                                            <span className="flex-1 text-xs text-slate-700">{a.label}</span>
                                            <span className="text-xs text-slate-400 whitespace-nowrap">{a.time}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {showStart && (
                <TestStartModal testName="Interactions Test" category="interactions" description="Clicks, hovers, keyboard events, long press, clipboard, toggles, ripple effects, and more. All tracked with precision timing." onStart={handleStart} />
            )}
            {showResult && completedSess && (
                <TestResultModal session={completedSess} onClose={() => setShowResult(false)} onRestart={handleRestart} />
            )}
            <AnalyticsPanel session={session} isRunning={isRunning} />
        </div>
    );
}
