"use client";

import { useState, useRef } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AnalyticsPanel from "@/components/analytics/AnalyticsPanel";
import { TestStartModal, TestResultModal } from "@/components/test/TestModals";
import { Eye, EyeOff, Upload, CheckCircle, AlertCircle, X, Play, Square, FileText} from "lucide-react";

const INTERESTS = ["TypeScript", "React", "Next.js", "Testing", "GraphQL", "DevOps", "AI/ML", "Design"];

interface FormData {
    name: string; email: string; phone: string; url: string;
    bio: string; password: string; country: string;
    interests: string[]; preference: string; range: number;
    date: string; time: string;
}

interface FormErrors {
    name?: string; email?: string; phone?: string;
    password?: string; bio?: string;
}

export default function FormsPage() {
    const { session, isRunning, startTest, endTest, track } = useAnalytics("Forms Test", "forms");
    const [showStart, setShowStart] = useState(true);
    const [showResult, setShowResult] = useState(false);
    const [completedSess, setCompletedSess] = useState<import("@/lib/analytics").TestSession | null>(null);
    const handleStart = () => { setShowStart(false); startTest(); };
    const handleEndTest = () => { const s = endTest(); if (s) { setCompletedSess(s); setShowResult(true); } };
    const handleRestart = () => { setShowResult(false); setCompletedSess(null); setShowStart(true); };
    const [form, setForm] = useState<FormData>({
        name: "", email: "", phone: "", url: "",
        bio: "", password: "", country: "",
        interests: [], preference: "email", range: 50,
        date: "", time: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [showPass, setShowPass] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [lastField, setLastField] = useState<string | null>(null);
    const [fileInfo, setFileInfo] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const t0 = useRef<number>(0);
    const startTimingField = () => { t0.current = Date.now(); };
    const endTimingField = (type: "input" | "click" | "select" | "checkbox", label: string) => {
        const dur = Date.now() - t0.current;
        track(type, label, "success", dur);
        setLastField(label);
    };

    const validate = (): boolean => {
        const errs: FormErrors = {};
        if (!form.name.trim()) errs.name = "Name is required.";
        if (!form.email.trim()) errs.email = "Email is required.";
        else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Invalid email format.";
        if (form.phone && !/^\+?[\d\s\-]{7,15}$/.test(form.phone)) errs.phone = "Invalid phone number.";
        if (!form.password) errs.password = "Password required.";
        else if (form.password.length < 8) errs.password = "Min 8 characters.";
        if (form.bio && form.bio.length > 200) errs.bio = "Max 200 characters.";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const t = Date.now();
        if (!validate()) {
            track("form_submit", "Form Submit (Validation Failed)", "failure", Date.now() - t, { errors: Object.keys(errors) });
            return;
        }
        setSubmitting(true);
        await new Promise((r) => setTimeout(r, 1200));
        setSubmitting(false);
        setSuccess(true);
        track("form_submit", "Form Submit (Success)", "success", Date.now() - t, { fields: Object.keys(form) });
        setTimeout(() => setSuccess(false), 3000);
    };

    const handleReset = () => {
        const t = Date.now();
        setForm({ name: "", email: "", phone: "", url: "", bio: "", password: "", country: "", interests: [], preference: "email", range: 50, date: "", time: "" });
        setErrors({});
        setSuccess(false);
        setFileInfo(null);
        track("click", "Reset Form", "success", Date.now() - t);
    };

    const toggleInterest = (interest: string) => {
        const t = Date.now();
        setForm((f) => ({
            ...f,
            interests: f.interests.includes(interest)
                ? f.interests.filter((i) => i !== interest)
                : [...f.interests, interest],
        }));
        track("checkbox", `Interest: ${interest}`, "success", Date.now() - t);
    };

    const handleFile = (files: FileList | null) => {
        if (!files || files.length === 0) return;
        const t = Date.now();
        const file = files[0];
        setFileInfo(`${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
        track("file_upload", `File Upload: ${file.name}`, "success", Date.now() - t, { size: file.size, type: file.type });
    };

    return (
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* ── Page Hero ── */}
      <div
        className="relative rounded-2xl overflow-hidden mb-6 p-5 lg:p-6"
        style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)", boxShadow: "0 12px 40px -8px rgba(37,99,235,0.45)" }}
      >
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10" style={{ background: "radial-gradient(circle, white, transparent 70%)", transform: "translate(30%,-30%)" }} />
        <div className="relative flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center w-11 h-11 rounded-xl flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
            >
              <FileText size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Forms Test</h1>
              <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>All form element types with real-time tracking.</p>
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
                style={{ background: "rgba(255,255,255,0.92)", color: "#1d4ed8" }}
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

            {/* Feedback banner */}
            {lastField && isRunning && (
                <div className="mb-4 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium animate-fade-in" style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1d4ed8" }}>
                    <CheckCircle size={14} className="text-blue-500" />
                    Tracked: <strong>{lastField}</strong>
                </div>
            )}

            {success && (
                <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 animate-fade-in">
                    <CheckCircle size={16} className="text-green-500" />
                    Form submitted successfully!
                </div>
            )}

            <Card>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} noValidate className="space-y-6">
                        {/* Text inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                                <input
                                    data-testid="name-input"
                                    type="text"
                                    value={form.name}
                                    onFocus={startTimingField}
                                    onBlur={() => endTimingField("input", "Name Input")}
                                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                    placeholder="Jane Doe"
                                    className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? "border-red-400 bg-red-50" : "border-slate-200"}`}
                                />
                                {errors.name && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} />{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                                <input
                                    data-testid="email-input"
                                    type="email"
                                    value={form.email}
                                    onFocus={startTimingField}
                                    onBlur={() => endTimingField("input", "Email Input")}
                                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                    placeholder="jane@example.com"
                                    className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? "border-red-400 bg-red-50" : "border-slate-200"}`}
                                />
                                {errors.email && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} />{errors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                                <input
                                    data-testid="phone-input"
                                    type="tel"
                                    value={form.phone}
                                    onFocus={startTimingField}
                                    onBlur={() => endTimingField("input", "Phone Input")}
                                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                                    placeholder="+1 555 123 4567"
                                    className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone ? "border-red-400 bg-red-50" : "border-slate-200"}`}
                                />
                                {errors.phone && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} />{errors.phone}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Website URL</label>
                                <input
                                    data-testid="url-input"
                                    type="url"
                                    value={form.url}
                                    onFocus={startTimingField}
                                    onBlur={() => endTimingField("input", "URL Input")}
                                    onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                                    placeholder="https://example.com"
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Textarea */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Bio <span className="text-slate-400 font-normal text-xs">(max 200 chars)</span></label>
                            <textarea
                                data-testid="bio-textarea"
                                value={form.bio}
                                onFocus={startTimingField}
                                onBlur={() => endTimingField("input", "Bio Textarea")}
                                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                                rows={3}
                                placeholder="Tell us about yourself..."
                                className={`w-full px-3 py-2 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.bio ? "border-red-400 bg-red-50" : "border-slate-200"}`}
                            />
                            <div className="flex justify-between mt-1">
                                {errors.bio && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} />{errors.bio}</p>}
                                <span className="text-xs text-slate-400 ml-auto">{form.bio.length}/200</span>
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
                            <div className="relative">
                                <input
                                    data-testid="password-input"
                                    type={showPass ? "text" : "password"}
                                    value={form.password}
                                    onFocus={startTimingField}
                                    onBlur={() => endTimingField("input", "Password Input")}
                                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                                    placeholder="Min 8 characters"
                                    className={`w-full px-3 py-2 pr-10 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? "border-red-400 bg-red-50" : "border-slate-200"}`}
                                />
                                <button
                                    type="button"
                                    data-testid="toggle-password-btn"
                                    onClick={() => {
                                        const t = Date.now();
                                        setShowPass((v) => !v);
                                        track("click", `Password ${!showPass ? "Shown" : "Hidden"}`, "success", Date.now() - t);
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} />{errors.password}</p>}
                        </div>

                        {/* Select */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                            <select
                                data-testid="country-select"
                                value={form.country}
                                onChange={(e) => {
                                    const t = Date.now();
                                    setForm((f) => ({ ...f, country: e.target.value }));
                                    track("select", `Country: ${e.target.value}`, "success", Date.now() - t);
                                }}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option value="">Select a country...</option>
                                {["United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Japan"].map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        {/* Checkboxes */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Interests</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {INTERESTS.map((interest) => (
                                    <label key={interest} className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            data-testid={`interest-${interest.toLowerCase().replace(/\//g, "-")}`}
                                            type="checkbox"
                                            checked={form.interests.includes(interest)}
                                            onChange={() => toggleInterest(interest)}
                                            className="w-4 h-4 rounded border-slate-200 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-slate-700 group-hover:text-blue-600 transition-colors">{interest}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Radio group */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Contact</label>
                            <div className="flex gap-4 flex-wrap">
                                {["email", "phone", "sms", "none"].map((pref) => (
                                    <label key={pref} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            data-testid={`pref-${pref}`}
                                            type="radio"
                                            name="preference"
                                            value={pref}
                                            checked={form.preference === pref}
                                            onChange={() => {
                                                const t = Date.now();
                                                setForm((f) => ({ ...f, preference: pref }));
                                                track("click", `Preference: ${pref}`, "success", Date.now() - t);
                                            }}
                                            className="w-4 h-4 text-blue-600"
                                        />
                                        <span className="text-sm text-slate-700 capitalize">{pref}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Range */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Skill Level: <span className="text-blue-600 font-semibold">{form.range}%</span>
                            </label>
                            <input
                                data-testid="range-slider"
                                type="range"
                                min={0} max={100} step={1}
                                value={form.range}
                                onMouseDown={startTimingField}
                                onMouseUp={() => endTimingField("input", `Range Slider (${form.range}%)`)}
                                onChange={(e) => setForm((f) => ({ ...f, range: +e.target.value }))}
                                className="w-full accent-blue-600"
                            />
                        </div>

                        {/* Date/Time */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                <input
                                    data-testid="date-input"
                                    type="date"
                                    value={form.date}
                                    onFocus={startTimingField}
                                    onBlur={() => endTimingField("input", "Date Picker")}
                                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                                <input
                                    data-testid="time-input"
                                    type="time"
                                    value={form.time}
                                    onFocus={startTimingField}
                                    onBlur={() => endTimingField("input", "Time Picker")}
                                    onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* File upload */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">File Upload</label>
                            <div
                                data-testid="file-drop-zone"
                                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${dragOver ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-400"}`}
                                onClick={() => fileRef.current?.click()}
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files); }}
                            >
                                <Upload size={24} className="mx-auto mb-2 text-slate-400" />
                                {fileInfo ? (
                                    <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                                        <CheckCircle size={14} />{fileInfo}
                                        <button type="button" onClick={(e) => { e.stopPropagation(); setFileInfo(null); }} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500">Drop a file here or <span className="text-blue-600 underline">click to browse</span></p>
                                )}
                            </div>
                            <input ref={fileRef} type="file" className="hidden" data-testid="file-input" onChange={(e) => handleFile(e.target.files)} />
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-wrap gap-3 pt-2">
                            <Button
                                data-testid="submit-btn"
                                type="submit"
                                disabled={submitting || !isRunning}
                                className="gap-2 min-w-[140px]"
                            >
                                {submitting ? (
                                    <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block" /> Submitting...</>
                                ) : "Submit Form"}
                            </Button>
                            <Button
                                data-testid="reset-btn"
                                type="button"
                                variant="outline"
                                onClick={handleReset}
                                disabled={!isRunning}
                                className="gap-2"
                            >
                                <X size={14} /> Reset
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {showStart && (
                <TestStartModal testName="Forms Test" category="forms" description="Input fields, validation, file upload, and form submission flows. Every interaction is tracked with timing." onStart={handleStart} />
            )}
            {showResult && completedSess && (
                <TestResultModal session={completedSess} onClose={() => setShowResult(false)} onRestart={handleRestart} />
            )}
            <AnalyticsPanel session={session} isRunning={isRunning} />
        </div>
    );
}
