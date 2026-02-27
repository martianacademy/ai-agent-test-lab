"use client";

import { useState, useRef, useCallback } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AnalyticsPanel from "@/components/analytics/AnalyticsPanel";
import { TestStartModal, TestResultModal } from "@/components/test/TestModals";
import { Play, Square, X, CheckCircle, AlertCircle, AlertTriangle, Info, Check, Layers} from "lucide-react";

interface Toast { id: number; type: "success" | "error" | "warning" | "info"; message: string; }

export default function ModalsPage() {
    const { session, isRunning, startTest, endTest, track } = useAnalytics("Modals Test", "modals");
    const [showStart, setShowStart] = useState(true);
    const [showResult, setShowResult] = useState(false);
    const [completedSess, setCompletedSess] = useState<import("@/lib/analytics").TestSession | null>(null);
    const handleStart = () => { setShowStart(false); startTest(); };
    const handleEndTest = () => { const s = endTest(); if (s) { setCompletedSess(s); setShowResult(true); } };
    const handleRestart = () => { setShowResult(false); setCompletedSess(null); setShowStart(true); };

    const t = useCallback((label: string, meta?: Record<string, unknown>) => {
        track("modal", label, "success", 0, meta);
    }, [track]);

    // 1. Alert modal
    const [alertOpen, setAlertOpen] = useState(false);

    // 2. Confirmation
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmResult, setConfirmResult] = useState<"yes" | "no" | null>(null);

    // 3. Form modal
    const [formOpen, setFormOpen] = useState(false);
    const [formData, setFormData] = useState({ name: "", email: "" });
    const [formSubmitted, setFormSubmitted] = useState(false);

    // 4. Lightbox
    const [lightboxOpen, setLightboxOpen] = useState(false);

    // 5. Multi-step modal
    const [multiOpen, setMultiOpen] = useState(false);
    const [multiStep, setMultiStep] = useState(1);

    // 6. Nested modal
    const [nestedOuter, setNestedOuter] = useState(false);
    const [nestedInner, setNestedInner] = useState(false);

    // 7. Drawer
    const [drawerOpen, setDrawerOpen] = useState(false);

    // 8. Toasts
    const [toasts, setToasts] = useState<Toast[]>([]);
    const toastId = useRef(0);
    const addToast = (type: Toast["type"], message: string) => {
        const id = ++toastId.current;
        setToasts((ts) => [...ts, { id, type, message }]);
        track("modal", `Toast: ${type} — ${message}`, "success", 0, { type });
        setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), 3500);
    };

    // 9. Full-screen
    const [fullOpen, setFullOpen] = useState(false);

    // 10. Tooltip
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [tooltipPinned, setTooltipPinned] = useState(false);

    const TOAST_ICONS = { success: CheckCircle, error: AlertCircle, warning: AlertTriangle, info: Info };
    const TOAST_COLORS: Record<Toast["type"], string> = {
        success: "bg-green-50 border-green-300 text-green-800",
        error: "bg-red-50 border-red-300 text-red-800",
        warning: "bg-yellow-50 border-yellow-300 text-yellow-800",
        info: "bg-blue-50 border-blue-300 text-blue-800",
    };

    return (
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* ── Page Hero ── */}
      <div
        className="relative rounded-2xl overflow-hidden mb-6 p-5 lg:p-6"
        style={{ background: "linear-gradient(135deg, #831843 0%, #db2777 100%)", boxShadow: "0 12px 40px -8px rgba(219,39,119,0.45)" }}
      >
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10" style={{ background: "radial-gradient(circle, white, transparent 70%)", transform: "translate(30%,-30%)" }} />
        <div className="relative flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center w-11 h-11 rounded-xl flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
            >
              <Layers size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Modals & Overlays Test</h1>
              <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>Dialogs, drawers, toasts, lightboxes, and nested modals.</p>
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
                style={{ background: "rgba(255,255,255,0.92)", color: "#9d174d" }}
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

            {/* Toast container */}
            <div className="fixed top-4 right-4 z-[999] space-y-2 w-80">
                {toasts.map((toast) => {
                    const Icon = TOAST_ICONS[toast.type];
                    return (
                        <div key={toast.id} className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg animate-slide-in-right ${TOAST_COLORS[toast.type]}`}>
                            <Icon size={16} className="mt-0.5 shrink-0" />
                            <span className="text-sm flex-1">{toast.message}</span>
                            <button onClick={() => setToasts((ts) => ts.filter((t) => t.id !== toast.id))} className="opacity-60 hover:opacity-100">
                                <X size={14} />
                            </button>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. Alert */}
                <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">1. Alert Modal</CardTitle></CardHeader>
                    <CardContent>
                        <Dialog.Root open={alertOpen} onOpenChange={(v) => { setAlertOpen(v); t(v ? "Alert Modal: Open" : "Alert Modal: Close"); }}>
                            <Dialog.Trigger asChild>
                                <Button data-testid="open-alert-btn" size="sm" variant="outline" disabled={!isRunning}>Open Alert</Button>
                            </Dialog.Trigger>
                            <Dialog.Portal>
                                <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm" />
                                <Dialog.Content className="fixed z-[101] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-6 w-[90vw] max-w-md animate-fade-in">
                                    <div className="flex items-start gap-3 mb-4">
                                        <Info size={22} className="text-blue-500 mt-0.5 shrink-0" />
                                        <div>
                                            <Dialog.Title className="font-semibold text-slate-900">Information</Dialog.Title>
                                            <Dialog.Description className="text-sm text-slate-600 mt-1">This is a standard alert modal. It conveys an informational message to the user.</Dialog.Description>
                                        </div>
                                    </div>
                                    <Button data-testid="alert-ok-btn" className="w-full" onClick={() => { setAlertOpen(false); t("Alert Modal: OK Clicked"); }}>OK</Button>
                                </Dialog.Content>
                            </Dialog.Portal>
                        </Dialog.Root>
                    </CardContent>
                </Card>

                {/* 2. Confirmation */}
                <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">2. Confirmation Dialog</CardTitle></CardHeader>
                    <CardContent>
                        <Dialog.Root open={confirmOpen} onOpenChange={(v) => { setConfirmOpen(v); t(v ? "Confirm Modal: Open" : "Confirm Modal: Close"); }}>
                            <Dialog.Trigger asChild>
                                <Button data-testid="open-confirm-btn" size="sm" variant="outline" disabled={!isRunning}>Open Confirm</Button>
                            </Dialog.Trigger>
                            <Dialog.Portal>
                                <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm" />
                                <Dialog.Content className="fixed z-[101] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-6 w-[90vw] max-w-md animate-fade-in">
                                    <AlertTriangle size={28} className="text-yellow-500 mb-3" />
                                    <Dialog.Title className="font-semibold text-slate-900 mb-1">Are you sure?</Dialog.Title>
                                    <Dialog.Description className="text-sm text-slate-600 mb-5">This action cannot be undone. Please confirm your choice.</Dialog.Description>
                                    <div className="flex gap-3">
                                        <Button data-testid="confirm-yes-btn" className="flex-1 bg-red-600 hover:bg-red-700" onClick={() => { setConfirmResult("yes"); setConfirmOpen(false); t("Confirm: YES"); }}>Yes, proceed</Button>
                                        <Button data-testid="confirm-no-btn" variant="outline" className="flex-1" onClick={() => { setConfirmResult("no"); setConfirmOpen(false); t("Confirm: NO"); }}>Cancel</Button>
                                    </div>
                                </Dialog.Content>
                            </Dialog.Portal>
                        </Dialog.Root>
                        {confirmResult && <Badge className={`mt-2 text-xs ${confirmResult === "yes" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"}`}>Last: {confirmResult}</Badge>}
                    </CardContent>
                </Card>

                {/* 3. Form modal */}
                <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">3. Form Modal</CardTitle></CardHeader>
                    <CardContent>
                        <Dialog.Root open={formOpen} onOpenChange={(v) => { setFormOpen(v); if (v) setFormSubmitted(false); t(v ? "Form Modal: Open" : "Form Modal: Close"); }}>
                            <Dialog.Trigger asChild>
                                <Button data-testid="open-form-modal-btn" size="sm" variant="outline" disabled={!isRunning}>Open Form</Button>
                            </Dialog.Trigger>
                            <Dialog.Portal>
                                <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm" />
                                <Dialog.Content className="fixed z-[101] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-6 w-[90vw] max-w-md animate-fade-in">
                                    <div className="flex items-center justify-between mb-4">
                                        <Dialog.Title className="font-semibold text-slate-900">Edit Profile</Dialog.Title>
                                        <Dialog.Close asChild><button className="text-slate-400 hover:text-slate-600"><X size={18} /></button></Dialog.Close>
                                    </div>
                                    {formSubmitted ? (
                                        <div className="text-center py-6">
                                            <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
                                            <p className="font-medium text-slate-800">Profile updated!</p>
                                            <Button size="sm" className="mt-4" onClick={() => setFormOpen(false)}>Close</Button>
                                        </div>
                                    ) : (
                                        <form onSubmit={(e) => { e.preventDefault(); setFormSubmitted(true); t("Form Modal: Submitted", { name: formData.name, email: formData.email }); }} className="space-y-3">
                                            <div>
                                                <label className="text-sm font-medium text-slate-700 block mb-1">Name</label>
                                                <input data-testid="modal-name-input" type="text" required value={formData.name} onChange={(e) => setFormData((d) => ({ ...d, name: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Your name" />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-slate-700 block mb-1">Email</label>
                                                <input data-testid="modal-email-input" type="email" required value={formData.email} onChange={(e) => setFormData((d) => ({ ...d, email: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="you@example.com" />
                                            </div>
                                            <div className="flex gap-2 pt-2">
                                                <Button data-testid="modal-submit-btn" type="submit" className="flex-1">Save Changes</Button>
                                                <Dialog.Close asChild><Button type="button" variant="outline" className="flex-1">Cancel</Button></Dialog.Close>
                                            </div>
                                        </form>
                                    )}
                                </Dialog.Content>
                            </Dialog.Portal>
                        </Dialog.Root>
                    </CardContent>
                </Card>

                {/* 4. Lightbox */}
                <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">4. Image Lightbox</CardTitle></CardHeader>
                    <CardContent>
                        <div
                            data-testid="lightbox-trigger"
                            onClick={() => { if (isRunning) { setLightboxOpen(true); t("Lightbox: Open"); } }}
                            className="cursor-pointer rounded-xl overflow-hidden border border-slate-100 hover:border-blue-400 transition-colors"
                            style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", height: 80, display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                            <span className="text-white text-sm font-medium">Click to expand</span>
                        </div>
                        {lightboxOpen && (
                            <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center animate-fade-in" onClick={() => { setLightboxOpen(false); t("Lightbox: Close"); }}>
                                <div className="relative w-[90vw] max-w-2xl aspect-video rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()} style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-white text-2xl font-bold">Lightbox Preview</span>
                                    </div>
                                    <button data-testid="lightbox-close-btn" onClick={() => { setLightboxOpen(false); t("Lightbox: Close Button"); }} className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-sm"><X size={18} /></button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 5. Multi-step modal */}
                <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">5. Multi-step Modal</CardTitle></CardHeader>
                    <CardContent>
                        <Dialog.Root open={multiOpen} onOpenChange={(v) => { setMultiOpen(v); if (v) setMultiStep(1); t(v ? "Multi-step Modal: Open" : "Multi-step Modal: Close"); }}>
                            <Dialog.Trigger asChild>
                                <Button data-testid="open-multistep-btn" size="sm" variant="outline" disabled={!isRunning}>Open Wizard</Button>
                            </Dialog.Trigger>
                            <Dialog.Portal>
                                <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm" />
                                <Dialog.Content className="fixed z-[101] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-6 w-[90vw] max-w-md animate-fade-in">
                                    <div className="flex items-center justify-between mb-4">
                                        <Dialog.Title className="font-semibold text-slate-900">Setup Wizard — Step {multiStep}/3</Dialog.Title>
                                        <div className="flex gap-1">{[1, 2, 3].map((s) => <div key={s} className={`w-2.5 h-2.5 rounded-full ${s <= multiStep ? "bg-blue-500" : "bg-slate-200"}`} />)}</div>
                                    </div>
                                    <div className="min-h-[80px] mb-4 text-sm text-slate-600 bg-slate-50 rounded-xl p-4">
                                        {multiStep === 1 && <><strong className="text-slate-800 block mb-1">Step 1: Welcome</strong>This wizard will guide you through the setup process. Click Next to continue.</>}
                                        {multiStep === 2 && <><strong className="text-slate-800 block mb-1">Step 2: Configure</strong>Review your settings. All defaults are pre-configured for optimal performance.</>}
                                        {multiStep === 3 && <><strong className="text-slate-800 block mb-1">Step 3: Complete</strong><Check size={16} className="inline text-green-500 mr-1" />Setup is complete! You can now close this dialog.</>}
                                    </div>
                                    <div className="flex gap-2">
                                        {multiStep > 1 && <Button data-testid="multistep-back-btn" variant="outline" size="sm" onClick={() => { setMultiStep((s) => s - 1); t(`Multi-step: Back to Step ${multiStep - 1}`); }}>Back</Button>}
                                        {multiStep < 3 ? (
                                            <Button data-testid="multistep-next-btn" size="sm" className="flex-1" onClick={() => { setMultiStep((s) => s + 1); t(`Multi-step: Next to Step ${multiStep + 1}`); }}>Next</Button>
                                        ) : (
                                            <Button data-testid="multistep-finish-btn" size="sm" className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => { setMultiOpen(false); t("Multi-step: Finished"); }}>Finish</Button>
                                        )}
                                    </div>
                                </Dialog.Content>
                            </Dialog.Portal>
                        </Dialog.Root>
                    </CardContent>
                </Card>

                {/* 6. Nested modals */}
                <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">6. Nested Modals</CardTitle></CardHeader>
                    <CardContent>
                        <Dialog.Root open={nestedOuter} onOpenChange={(v) => { setNestedOuter(v); if (!v) setNestedInner(false); t(v ? "Nested Modal: Outer Open" : "Nested Modal: Outer Close"); }}>
                            <Dialog.Trigger asChild>
                                <Button data-testid="open-nested-outer-btn" size="sm" variant="outline" disabled={!isRunning}>Open Outer Modal</Button>
                            </Dialog.Trigger>
                            <Dialog.Portal>
                                <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm" />
                                <Dialog.Content className="fixed z-[101] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-6 w-[90vw] max-w-sm animate-fade-in">
                                    <Dialog.Title className="font-semibold text-slate-900 mb-2">Outer Modal</Dialog.Title>
                                    <Dialog.Description className="text-sm text-slate-600 mb-4">This is the outer modal. Open the inner one!</Dialog.Description>
                                    <div className="flex gap-2">
                                        <Button data-testid="open-nested-inner-btn" size="sm" onClick={() => { setNestedInner(true); t("Nested Modal: Inner Open"); }}>Open Inner Modal</Button>
                                        <Dialog.Close asChild><Button size="sm" variant="outline">Close</Button></Dialog.Close>
                                    </div>
                                </Dialog.Content>
                            </Dialog.Portal>
                        </Dialog.Root>
                        {nestedInner && (
                            <div className="fixed inset-0 z-[200] bg-black/30 flex items-center justify-center animate-fade-in">
                                <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 animate-fade-in">
                                    <h3 className="font-semibold text-slate-900 mb-2">Inner Modal</h3>
                                    <p className="text-sm text-slate-600 mb-4">You opened a nested modal! This sits on top of the outer dialog.</p>
                                    <Button data-testid="close-nested-inner-btn" size="sm" className="w-full" onClick={() => { setNestedInner(false); t("Nested Modal: Inner Close"); }}>Close Inner</Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 7. Drawer */}
                <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">7. Slide-in Drawer</CardTitle></CardHeader>
                    <CardContent>
                        <Button data-testid="open-drawer-btn" size="sm" variant="outline" disabled={!isRunning} onClick={() => { setDrawerOpen(true); t("Drawer: Open"); }}>Open Drawer</Button>
                        {drawerOpen && (
                            <>
                                <div className="fixed inset-0 z-[100] bg-black/40" onClick={() => { setDrawerOpen(false); t("Drawer: Backdrop Close"); }} />
                                <div className="fixed right-0 top-0 h-full z-[101] w-80 bg-white shadow-2xl flex flex-col animate-slide-in-right">
                                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                                        <h3 className="font-semibold text-slate-900">Notification Drawer</h3>
                                        <button data-testid="close-drawer-btn" onClick={() => { setDrawerOpen(false); t("Drawer: Close Button"); }} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                        {["Deployment complete", "New test session started", "Analytics exported", "Build failed — check logs", "User signed in"].map((msg, i) => (
                                            <div key={i} className="px-3 py-2.5 bg-slate-50 rounded-lg text-sm text-slate-700 border border-slate-100">{msg}</div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* 8. Toasts */}
                <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">8. Toast Notifications</CardTitle></CardHeader>
                    <CardContent className="flex flex-col gap-2">
                        {(["success", "error", "warning", "info"] as const).map((type) => {
                            const Icon = TOAST_ICONS[type];
                            const msgs: Record<string, string> = { success: "Action completed!", error: "Something failed.", warning: "Check your inputs.", info: "New update available." };
                            return (
                                <Button key={type} data-testid={`toast-${type}-btn`} size="sm" variant="outline" disabled={!isRunning}
                                    className="gap-2 justify-start"
                                    onClick={() => addToast(type, msgs[type])}>
                                    <Icon size={14} /> {type.charAt(0).toUpperCase() + type.slice(1)} Toast
                                </Button>
                            );
                        })}
                    </CardContent>
                </Card>

                {/* 9. Full-screen */}
                <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">9. Full-Screen Overlay</CardTitle></CardHeader>
                    <CardContent>
                        <Button data-testid="open-fullscreen-btn" size="sm" variant="outline" disabled={!isRunning} onClick={() => { setFullOpen(true); t("Full-screen Modal: Open"); }}>Open Full-Screen</Button>
                        {fullOpen && (
                            <div className="fixed inset-0 z-[200] bg-gray-900 flex flex-col items-center justify-center animate-fade-in">
                                <div className="text-white text-center">
                                    <div className="text-6xl mb-4">🔬</div>
                                    <h2 className="text-3xl font-bold mb-2">Full-Screen Mode</h2>
                                    <p className="text-slate-400 mb-8 max-w-md">Full-screen overlay is active. This covers the entire viewport for immersive views.</p>
                                    <Button data-testid="close-fullscreen-btn" variant="outline" className="border-white text-white hover:bg-white hover:text-slate-900" onClick={() => { setFullOpen(false); t("Full-screen Modal: Close"); }}>
                                        <X size={16} className="mr-2" /> Close Full-Screen
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 10. Tooltip */}
                <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">10. Tooltip (Hover + Pin)</CardTitle></CardHeader>
                    <CardContent>
                        <div className="relative inline-block">
                            <button
                                data-testid="tooltip-target"
                                disabled={!isRunning}
                                onMouseEnter={() => { if (!tooltipPinned) { setTooltipVisible(true); t("Tooltip: Hover Show"); } }}
                                onMouseLeave={() => { if (!tooltipPinned) setTooltipVisible(false); }}
                                onClick={() => { const p = !tooltipPinned; setTooltipPinned(p); setTooltipVisible(true); t(p ? "Tooltip: Pinned" : "Tooltip: Unpinned"); if (!p) setTooltipVisible(false); }}
                                className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors"
                            >
                                {tooltipPinned ? "Click to unpin" : "Hover or click"}
                            </button>
                            {tooltipVisible && (
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-lg animate-fade-in z-10">
                                    {tooltipPinned ? "📌 Pinned tooltip!" : "Hover tooltip"}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {showStart && (
                <TestStartModal testName="Modals & Overlays Test" category="modals" description="Alert dialogs, confirmation modals, form modals, lightboxes, multi-step wizards, nested modals, drawers, toasts, and tooltips." onStart={handleStart} />
            )}
            {showResult && completedSess && (
                <TestResultModal session={completedSess} onClose={() => setShowResult(false)} onRestart={handleRestart} />
            )}
            <AnalyticsPanel session={session} isRunning={isRunning} />
        </div>
    );
}
