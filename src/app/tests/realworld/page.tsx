"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AnalyticsPanel from "@/components/analytics/AnalyticsPanel";
import { TestStartModal, TestResultModal } from "@/components/test/TestModals";
import { Play, Square, ShoppingCart, Trash2, Plus, Minus, Send, Search, ChevronUp, ChevronDown, Check, Globe} from "lucide-react";

// --- Mock data ---
const PRODUCTS = [
    { id: 1, name: "Mechanical Keyboard", price: 149.99, category: "Hardware" },
    { id: 2, name: "4K Monitor", price: 599.99, category: "Hardware" },
    { id: 3, name: "USB-C Hub", price: 49.99, category: "Accessories" },
    { id: 4, name: "Wireless Mouse", price: 79.99, category: "Accessories" },
    { id: 5, name: "Webcam HD", price: 129.99, category: "Hardware" },
];

const ITEMS_20 = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1, name: `Record #${String(i + 1).padStart(3, "0")}`,
    status: ["Active", "Inactive", "Pending"][i % 3] as "Active" | "Inactive" | "Pending",
    value: Math.round(Math.random() * 1000) + 100,
    date: new Date(Date.now() - i * 86400000).toLocaleDateString(),
}));

const FILTER_ITEMS = Array.from({ length: 15 }, (_, i) => ({
    id: i, name: ["React", "Next.js", "TypeScript", "Tailwind", "Node.js", "GraphQL", "Docker", "Kubernetes", "AWS", "Redis", "Prisma", "tRPC", "Vitest", "Playwright", "Storybook"][i],
    category: ["Frontend", "Frontend", "Frontend", "Frontend", "Backend", "Backend", "DevOps", "DevOps", "Cloud", "Backend", "Backend", "Backend", "Testing", "Testing", "Frontend"][i],
}));

interface CartItem { id: number; name: string; price: number; qty: number; }
interface ChatMsg { id: number; text: string; sent: boolean; time: string; }
interface SortConfig { key: string; dir: "asc" | "desc" }

export default function RealWorldPage() {
    const { session, isRunning, startTest, endTest, track } = useAnalytics("Real World Test", "realworld");
    const [showStart, setShowStart] = useState(true);
    const [showResult, setShowResult] = useState(false);
    const [completedSess, setCompletedSess] = useState<import("@/lib/analytics").TestSession | null>(null);
    const handleStart = () => { setShowStart(false); startTest(); };
    const handleEndTest = () => { const s = endTest(); if (s) { setCompletedSess(s); setShowResult(true); } };
    const handleRestart = () => { setShowResult(false); setCompletedSess(null); setShowStart(true); };

    const t = useCallback((type: Parameters<typeof track>[0], label: string, dur?: number, meta?: Record<string, unknown>) => {
        track(type, label, "success", dur ?? 0, meta);
    }, [track]);

    // 1. Login
    const [loginForm, setLoginForm] = useState({ username: "", password: "" });
    const [loginState, setLoginState] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [loginError, setLoginError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const start = Date.now();
        setLoginState("loading");
        track("form_submit", "Login: Submit", "success", 0);
        await new Promise((r) => setTimeout(r, 1200));
        if (loginForm.username === "admin" && loginForm.password === "password") {
            setLoginState("success");
            t("form_submit", "Login: Success", Date.now() - start, { user: loginForm.username });
        } else {
            setLoginState("error");
            setLoginError("Invalid credentials. Try admin / password.");
            t("form_submit", "Login: Failed", Date.now() - start, { reason: "invalid credentials" });
        }
    };

    // 2. Shopping cart
    const [cart, setCart] = useState<CartItem[]>([]);
    const [checkoutDone, setCheckoutDone] = useState(false);
    const addToCart = (product: typeof PRODUCTS[0]) => {
        const start = Date.now();
        setCart((c) => {
            const existing = c.find((i) => i.id === product.id);
            if (existing) return c.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
            return [...c, { ...product, qty: 1 }];
        });
        t("click", `Cart: Add "${product.name}"`, Date.now() - start, { product: product.name, price: product.price });
    };
    const removeFromCart = (id: number) => { const start = Date.now(); const item = cart.find((i) => i.id === id); setCart((c) => c.filter((i) => i.id !== id)); t("click", `Cart: Remove "${item?.name}"`, Date.now() - start); };
    const updateQty = (id: number, delta: number) => {
        const start = Date.now();
        setCart((c) => c.map((i) => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
        t("click", `Cart: Qty ${delta > 0 ? "+" : ""}${delta}`, Date.now() - start, { id });
    };
    const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

    // 3. Search with filters
    const [filterQ, setFilterQ] = useState("");
    const [filterCat, setFilterCat] = useState("All");
    const [filterSort, setFilterSort] = useState("name");
    const filteredItems = FILTER_ITEMS
        .filter((i) => i.name.toLowerCase().includes(filterQ.toLowerCase()) && (filterCat === "All" || i.category === filterCat))
        .sort((a, b) => filterSort === "name" ? a.name.localeCompare(b.name) : a.category.localeCompare(b.category));

    // 4. Data table
    const [tableSort, setTableSort] = useState<SortConfig>({ key: "id", dir: "asc" });
    const [tableSelected, setTableSelected] = useState<Set<number>>(new Set());
    const [tablePage, setTablePage] = useState(1);
    const TABLE_PAGE_SIZE = 5;
    const sortedRows = [...ITEMS_20].sort((a, b) => {
        const av = a[tableSort.key as keyof typeof a] as string | number;
        const bv = b[tableSort.key as keyof typeof b] as string | number;
        const cmp = typeof av === "number" ? av - (bv as number) : String(av).localeCompare(String(bv));
        return tableSort.dir === "asc" ? cmp : -cmp;
    });
    const tableRows = sortedRows.slice((tablePage - 1) * TABLE_PAGE_SIZE, tablePage * TABLE_PAGE_SIZE);
    const totalTablePages = Math.ceil(ITEMS_20.length / TABLE_PAGE_SIZE);
    const sortTable = (key: string) => {
        const start = Date.now();
        setTableSort((prev) => ({ key, dir: prev.key === key && prev.dir === "asc" ? "desc" : "asc" }));
        t("click", `Table Sort: ${key}`, Date.now() - start);
    };

    // 5. Chat
    const [chatInput, setChatInput] = useState("");
    const [chatMessages, setChatMessages] = useState<ChatMsg[]>([
        { id: 0, text: "Hey! How can I help you with testing today?", sent: false, time: "10:00 AM" },
    ]);
    const chatRef = useRef<HTMLDivElement>(null);
    const chatId = useRef(1);
    const sendMessage = () => {
        if (!chatInput.trim() || !isRunning) return;
        const start = Date.now();
        const msg: ChatMsg = { id: chatId.current++, text: chatInput, sent: true, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
        setChatMessages((m) => [...m, msg]);
        t("input", `Chat Send: "${chatInput}"`, Date.now() - start, { length: chatInput.length });
        const inputText = chatInput;
        setChatInput("");
        setTimeout(() => {
            const replies = ["Great question!", "Let me check that for you.", "Got it! I'll look into it.", "That makes sense, thanks!", "I can help with that!"];
            const reply: ChatMsg = { id: chatId.current++, text: replies[Math.floor(Math.random() * replies.length)], sent: false, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
            setChatMessages((m) => [...m, reply]);
            t("custom", `Chat Reply Received`, 1500);
        }, 1500);
    };
    useEffect(() => { chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" }); }, [chatMessages]);

    // 6. Settings
    const [settings, setSettings] = useState({ notifications: true, darkMode: false, autoSave: true, language: "en", timezone: "UTC", theme: "blue" });
    const [settingsSaved, setSettingsSaved] = useState(false);

    const saveSettings = () => {
        const start = Date.now();
        setSettingsSaved(true);
        t("form_submit", "Settings: Save", Date.now() - start, { settings });
        setTimeout(() => setSettingsSaved(false), 2000);
    };

    return (
        <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* ── Page Hero ── */}
      <div
        className="relative rounded-2xl overflow-hidden mb-6 p-5 lg:p-6"
        style={{ background: "linear-gradient(135deg, #022c22 0%, #059669 100%)", boxShadow: "0 12px 40px -8px rgba(5,150,105,0.45)" }}
      >
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10" style={{ background: "radial-gradient(circle, white, transparent 70%)", transform: "translate(30%,-30%)" }} />
        <div className="relative flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center w-11 h-11 rounded-xl flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
            >
              <Globe size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Real World Test</h1>
              <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>Login, shopping cart, data tables, chat, and settings panel.</p>
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
                style={{ background: "rgba(255,255,255,0.92)", color: "#065f46" }}
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
                {/* 1. Login */}
                <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">1. Login Form</CardTitle></CardHeader>
                    <CardContent>
                        {loginState === "success" ? (
                            <div className="flex items-center gap-3 py-6 justify-center">
                                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                    <Check size={24} className="text-green-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800">Welcome, {loginForm.username}!</p>
                                    <p className="text-sm text-slate-500">Login successful.</p>
                                </div>
                                <Button size="sm" variant="outline" className="ml-4" onClick={() => { setLoginState("idle"); setLoginForm({ username: "", password: "" }); }}>Sign Out</Button>
                            </div>
                        ) : (
                            <form onSubmit={handleLogin} className="max-w-sm space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 block mb-1">Username</label>
                                    <input data-testid="login-username" type="text" value={loginForm.username} onChange={(e) => setLoginForm((f) => ({ ...f, username: e.target.value }))} disabled={!isRunning} placeholder="Try: admin" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 block mb-1">Password</label>
                                    <input data-testid="login-password" type="password" value={loginForm.password} onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))} disabled={!isRunning} placeholder="Try: password" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                </div>
                                {loginState === "error" && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-xl border border-red-200">{loginError}</p>}
                                <Button data-testid="login-submit-btn" type="submit" disabled={!isRunning || loginState === "loading"} className="w-full gap-2">
                                    {loginState === "loading" ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Logging in…</> : "Login"}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>

                {/* 2. Shopping cart */}
                <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2">2. Shopping Cart <Badge className="bg-blue-100 text-blue-700">{cart.reduce((s, i) => s + i.qty, 0)} items</Badge></CardTitle></CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 mb-2">PRODUCTS</p>
                                <div className="space-y-2">
                                    {PRODUCTS.map((p) => (
                                        <div key={p.id} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg">
                                            <div>
                                                <p className="text-sm font-medium text-slate-800">{p.name}</p>
                                                <p className="text-xs text-slate-500">${p.price}</p>
                                            </div>
                                            <Button data-testid={`add-to-cart-${p.id}`} size="sm" disabled={!isRunning} onClick={() => addToCart(p)} className="gap-1 text-xs h-7 px-2">
                                                <Plus size={12} /> Add
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 mb-2">CART</p>
                                {cart.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400">
                                        <ShoppingCart size={32} className="mx-auto mb-2 opacity-30" />
                                        <p className="text-sm font-semibold text-slate-800">Cart is empty</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-2 mb-3">
                                            {cart.map((item) => (
                                                <div key={item.id} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-medium text-slate-800 truncate">{item.name}</p>
                                                        <p className="text-xs text-slate-500">${(item.price * item.qty).toFixed(2)}</p>
                                                    </div>
                                                    <button data-testid={`cart-dec-${item.id}`} onClick={() => updateQty(item.id, -1)} disabled={!isRunning} className="w-6 h-6 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-100"><Minus size={10} /></button>
                                                    <span className="text-xs w-5 text-center font-medium">{item.qty}</span>
                                                    <button data-testid={`cart-inc-${item.id}`} onClick={() => updateQty(item.id, 1)} disabled={!isRunning} className="w-6 h-6 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-100"><Plus size={10} /></button>
                                                    <button data-testid={`cart-remove-${item.id}`} onClick={() => removeFromCart(item.id)} disabled={!isRunning} className="text-red-400 hover:text-red-600 ml-1"><Trash2 size={13} /></button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                                            <span className="font-semibold text-slate-800">Total: ${cartTotal.toFixed(2)}</span>
                                            {checkoutDone ? (
                                                <Badge className="bg-green-100 text-green-700">Order placed!</Badge>
                                            ) : (
                                                <Button data-testid="checkout-btn" size="sm" disabled={!isRunning} onClick={() => { const s = Date.now(); setCheckoutDone(true); t("form_submit", "Checkout", Date.now() - s, { total: cartTotal, items: cart.length }); setTimeout(() => { setCart([]); setCheckoutDone(false); }, 2000); }}>
                                                    Checkout
                                                </Button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Search + filters */}
                <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">3. Search with Filters</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-3 mb-3">
                            <div className="relative flex-1 min-w-[180px]">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input data-testid="filter-search-input" type="text" placeholder="Search..." value={filterQ} disabled={!isRunning}
                                    onChange={(e) => { const s = Date.now(); setFilterQ(e.target.value); t("search", `Filter Search: "${e.target.value}"`, Date.now() - s, { query: e.target.value }); }}
                                    className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                            </div>
                            <select data-testid="filter-category-select" value={filterCat} disabled={!isRunning} onChange={(e) => { const s = Date.now(); setFilterCat(e.target.value); t("select", `Filter Category: ${e.target.value}`, Date.now() - s); }} className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                {["All", "Frontend", "Backend", "DevOps", "Cloud", "Testing"].map((c) => <option key={c}>{c}</option>)}
                            </select>
                            <select data-testid="filter-sort-select" value={filterSort} disabled={!isRunning} onChange={(e) => { const s = Date.now(); setFilterSort(e.target.value); t("select", `Filter Sort: ${e.target.value}`, Date.now() - s); }} className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                <option value="name">Sort: Name</option>
                                <option value="category">Sort: Category</option>
                            </select>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {filteredItems.map((item) => (
                                <Badge key={item.id} className="bg-slate-100 text-slate-700 border border-slate-100 text-xs">{item.name} <span className="text-slate-400 ml-1">{item.category}</span></Badge>
                            ))}
                            {filteredItems.length === 0 && <p className="text-sm text-slate-400">No results.</p>}
                        </div>
                    </CardContent>
                </Card>

                {/* 4. Data table */}
                <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2">4. Sortable Data Table <Badge variant="outline" className="text-xs">{tableSelected.size} selected</Badge></CardTitle></CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="px-4 py-3 w-8">
                                            <input type="checkbox" className="w-4 h-4 rounded border-slate-200"
                                                checked={tableSelected.size === tableRows.length && tableRows.length > 0}
                                                onChange={(e) => {
                                                    const s = Date.now();
                                                    if (e.target.checked) { setTableSelected(new Set(tableRows.map((r) => r.id))); t("checkbox", "Table: Select All", Date.now() - s); }
                                                    else { setTableSelected(new Set()); t("checkbox", "Table: Deselect All", Date.now() - s); }
                                                }} />
                                        </th>
                                        {[["id", "#"], ["name", "Name"], ["status", "Status"], ["value", "Value"], ["date", "Date"]].map(([key, label]) => (
                                            <th key={key} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:bg-slate-50"
                                                onClick={() => sortTable(key)} data-testid={`sort-${key}-btn`}>
                                                <div className="flex items-center gap-1">
                                                    {label}
                                                    {tableSort.key === key ? (tableSort.dir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {tableRows.map((row) => (
                                        <tr key={row.id} className={`hover:bg-slate-50 transition-colors ${tableSelected.has(row.id) ? "bg-blue-50" : ""}`}>
                                            <td className="px-4 py-2.5">
                                                <input type="checkbox" className="w-4 h-4 rounded border-slate-200"
                                                    checked={tableSelected.has(row.id)}
                                                    onChange={(e) => {
                                                        const s = Date.now();
                                                        setTableSelected((prev) => { const next = new Set(prev); if (e.target.checked) next.add(row.id); else next.delete(row.id); return next; });
                                                        t("checkbox", `Table: Row ${row.id} ${e.target.checked ? "checked" : "unchecked"}`, Date.now() - s);
                                                    }} />
                                            </td>
                                            <td className="px-4 py-2.5 text-slate-500 text-xs font-mono">#{row.id}</td>
                                            <td className="px-4 py-2.5 font-medium text-slate-800">{row.name}</td>
                                            <td className="px-4 py-2.5">
                                                <Badge className={`text-xs ${row.status === "Active" ? "bg-green-100 text-green-700" : row.status === "Inactive" ? "bg-slate-100 text-slate-600" : "bg-yellow-100 text-yellow-700"}`}>{row.status}</Badge>
                                            </td>
                                            <td className="px-4 py-2.5 text-slate-600 font-mono">${row.value}</td>
                                            <td className="px-4 py-2.5 text-slate-400 text-xs">{row.date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                            <span className="text-xs text-slate-400">Page {tablePage} of {totalTablePages}</span>
                            <div className="flex gap-1">
                                <Button size="sm" variant="outline" className="h-7 px-2 text-xs" disabled={tablePage === 1} onClick={() => { setTablePage((p) => p - 1); t("navigation", `Table: Page ${tablePage - 1}`); }}>Prev</Button>
                                <Button size="sm" variant="outline" className="h-7 px-2 text-xs" disabled={tablePage === totalTablePages} onClick={() => { setTablePage((p) => p + 1); t("navigation", `Table: Page ${tablePage + 1}`); }}>Next</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 5. Chat */}
                <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">5. Chat Interface</CardTitle></CardHeader>
                    <CardContent>
                        <div ref={chatRef} className="h-52 overflow-y-auto mb-3 space-y-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                            {chatMessages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sent ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${msg.sent ? "bg-blue-600 text-white rounded-br-sm" : "bg-white border border-slate-100 text-slate-800 rounded-bl-sm"}`}>
                                        <p>{msg.text}</p>
                                        <p className={`text-xs mt-0.5 ${msg.sent ? "text-blue-200" : "text-slate-400"}`}>{msg.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
                            <input
                                data-testid="chat-input"
                                type="text"
                                placeholder="Type a message..."
                                value={chatInput}
                                disabled={!isRunning}
                                onChange={(e) => setChatInput(e.target.value)}
                                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                            <Button data-testid="chat-send-btn" type="submit" size="icon" disabled={!isRunning || !chatInput.trim()}>
                                <Send size={16} />
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* 6. Settings */}
                <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">6. Settings Panel</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-w-md">
                            {[
                                { key: "notifications", label: "Email Notifications" },
                                { key: "autoSave", label: "Auto-save Changes" },
                                { key: "darkMode", label: "Dark Mode" },
                            ].map((setting) => (
                                <div key={setting.key} className="flex items-center justify-between">
                                    <span className="text-sm text-slate-700">{setting.label}</span>
                                    <label className="toggle-switch">
                                        <input
                                            data-testid={`settings-${setting.key}`}
                                            type="checkbox"
                                            checked={settings[setting.key as keyof typeof settings] as boolean}
                                            disabled={!isRunning}
                                            onChange={(e) => {
                                                const s = Date.now();
                                                setSettings((prev) => ({ ...prev, [setting.key]: e.target.checked }));
                                                t("click", `Settings Toggle: ${setting.label} = ${e.target.checked}`, Date.now() - s);
                                            }}
                                        />
                                        <span className="toggle-slider" />
                                    </label>
                                </div>
                            ))}
                            <div className="flex flex-wrap gap-3">
                                <div>
                                    <label className="text-xs font-medium text-slate-500 block mb-1">Language</label>
                                    <select data-testid="settings-language" value={settings.language} disabled={!isRunning}
                                        onChange={(e) => { const s = Date.now(); setSettings((prev) => ({ ...prev, language: e.target.value })); t("select", `Settings Language: ${e.target.value}`, Date.now() - s); }}
                                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none">
                                        {[["en", "English"], ["es", "Spanish"], ["fr", "French"], ["de", "German"], ["ja", "Japanese"]].map(([v, l]) => (
                                            <option key={v} value={v}>{l}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-500 block mb-1">Theme</label>
                                    <select data-testid="settings-theme" value={settings.theme} disabled={!isRunning}
                                        onChange={(e) => { const s = Date.now(); setSettings((prev) => ({ ...prev, theme: e.target.value })); t("select", `Settings Theme: ${e.target.value}`, Date.now() - s); }}
                                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none">
                                        <option value="blue">Blue</option>
                                        <option value="purple">Purple</option>
                                        <option value="green">Green</option>
                                        <option value="orange">Orange</option>
                                    </select>
                                </div>
                            </div>
                            <Button data-testid="save-settings-btn" disabled={!isRunning || settingsSaved} onClick={saveSettings} className="gap-2">
                                {settingsSaved ? <><Check size={14} /> Saved!</> : "Save Settings"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {showStart && (
                <TestStartModal testName="Real World Test" category="realworld" description="Login flow, shopping cart, search & filters, data table, live chat, and settings panel — complete real-world mini-apps for AI agent testing." onStart={handleStart} />
            )}
            {showResult && completedSess && (
                <TestResultModal session={completedSess} onClose={() => setShowResult(false)} onRestart={handleRestart} />
            )}
            <AnalyticsPanel session={session} isRunning={isRunning} />
        </div>
    );
}
