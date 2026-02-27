"use client";

import { useState, useRef } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import {
    DndContext,
    closestCenter,
    DragEndEvent,
    DragStartEvent,
    DragOverEvent,
    PointerSensor,
    useSensor,
    useSensors,
    useDroppable,
    DragOverlay,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AnalyticsPanel from "@/components/analytics/AnalyticsPanel";
import { TestStartModal, TestResultModal } from "@/components/test/TestModals";
import { Play, Square, GripVertical, Trash2, X, Move } from "lucide-react";

// 1. Sortable list
const INITIAL_LIST = ["Task: Write unit tests", "Task: Review PR #42", "Task: Update documentation", "Task: Fix CSS regression", "Task: Deploy to staging", "Task: Run smoke tests", "Task: Update dependencies", "Task: Refactor auth module"];

// 2. Kanban
const INITIAL_KANBAN = {
    todo: [{ id: "k1", text: "Design mockups" }, { id: "k2", text: "Write API docs" }, { id: "k3", text: "Add dark mode" }],
    inprogress: [{ id: "k4", text: "Build dashboard" }, { id: "k5", text: "Set up CI/CD" }, { id: "k6", text: "Database schema" }],
    done: [{ id: "k7", text: "Initial scaffolding" }, { id: "k8", text: "Auth system" }, { id: "k9", text: "Landing page" }],
};

type KanbanColumn = "todo" | "inprogress" | "done";
interface KanbanCard { id: string; text: string; }
interface KanbanState { todo: KanbanCard[]; inprogress: KanbanCard[]; done: KanbanCard[]; }

// 3. Trash items
const TRASH_ITEMS = Array.from({ length: 6 }, (_, i) => ({ id: `trash-${i}`, label: `Delete me #${i + 1}` }));

// 5. Grid tiles
const TILE_COLORS = ["#fca5a5", "#fdba74", "#fde047", "#86efac", "#67e8f9", "#a5b4fc", "#f9a8d4", "#99f6e4"];
const INITIAL_GRID = TILE_COLORS.map((color, i) => ({ id: `tile-${i}`, color }));

function SortableItem({ id, label }: { id: string; label: string }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
    return (
        <div ref={setNodeRef} style={style} {...attributes} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-100 rounded-lg text-sm text-slate-700 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
            <span {...listeners} className="text-slate-400 hover:text-slate-600"><GripVertical size={15} /></span>
            {label}
        </div>
    );
}

function KanbanCardItem({ id, text }: { id: string; text: string }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="px-3 py-2 bg-white border border-slate-100 rounded-lg text-sm text-slate-700 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow">
            {text}
        </div>
    );
}

function KanbanColumnDroppable({ id, children, label, color }: { id: string; children: React.ReactNode; label: string; color: string }) {
    const { setNodeRef, isOver } = useDroppable({ id });
    return (
        <div ref={setNodeRef} className={`flex-1 flex flex-col rounded-xl border-2 p-3 min-h-[160px] transition-colors ${isOver ? "border-blue-400 bg-blue-50" : "border-slate-100 bg-slate-50"}`}>
            <div className="flex items-center gap-2 mb-3">
                <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                <span className="text-sm font-semibold text-slate-700">{label}</span>
            </div>
            <div className="flex flex-col gap-2 flex-1">{children}</div>
        </div>
    );
}

function TrashDraggable({ id, label }: { id: string; label: string }) {
    const { attributes, listeners, setNodeRef, isDragging } = useSortable({ id });
    return (
        <div ref={setNodeRef} {...attributes} {...listeners} className={`px-3 py-2 bg-white border border-slate-100 rounded-lg text-sm cursor-grab active:cursor-grabbing transition-all ${isDragging ? "opacity-30 scale-95" : "hover:border-red-300 hover:bg-red-50"}`}>
            {label}
        </div>
    );
}

function TrashZone({ isOver }: { isOver: boolean }) {
    const { setNodeRef } = useDroppable({ id: "trash-zone" });
    return (
        <div ref={setNodeRef} data-testid="trash-zone" className={`flex flex-col items-center justify-center h-20 rounded-xl border-2 border-dashed transition-all ${isOver ? "border-red-500 bg-red-100 scale-105" : "border-red-300 bg-red-50"}`}>
            <Trash2 size={22} className={`text-red-400 mb-1 ${isOver ? "text-red-600" : ""}`} />
            <span className="text-xs text-red-500 font-medium">{isOver ? "Release to delete!" : "Drop here to delete"}</span>
        </div>
    );
}

function GridTile({ id, color }: { id: string; color: string }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), transition, backgroundColor: color, opacity: isDragging ? 0.4 : 1 };
    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="aspect-square rounded-xl cursor-grab active:cursor-grabbing hover:scale-105 transition-transform shadow-sm border border-white/50" />
    );
}

export default function DragDropPage() {
    const { session, isRunning, startTest, endTest, track } = useAnalytics("Drag & Drop Test", "dragdrop");
    const [showStart, setShowStart] = useState(true);
    const [showResult, setShowResult] = useState(false);
    const [completedSess, setCompletedSess] = useState<import("@/lib/analytics").TestSession | null>(null);
    const handleStart = () => { setShowStart(false); startTest(); };
    const handleEndTest = () => { const s = endTest(); if (s) { setCompletedSess(s); setShowResult(true); } };
    const handleRestart = () => { setShowResult(false); setCompletedSess(null); setShowStart(true); };

    // 1. Sortable list
    const [sortList, setSortList] = useState(INITIAL_LIST.map((text, i) => ({ id: `item-${i}`, text })));

    // 2. Kanban
    const [kanban, setKanban] = useState<KanbanState>(INITIAL_KANBAN);
    const [activeKanbanId, setActiveKanbanId] = useState<string | null>(null);

    // 3. Trash items
    const [trashItems, setTrashItems] = useState(TRASH_ITEMS);
    const [trashIsOver, setTrashIsOver] = useState(false);
    const [deleted, setDeleted] = useState<string[]>([]);

    // 4. File drop
    const [droppedFiles, setDroppedFiles] = useState<{ name: string; size: number; type: string }[]>([]);
    const [fileDragOver, setFileDragOver] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    // 5. Grid
    const [grid, setGrid] = useState(INITIAL_GRID);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const handleSortEnd = (evt: DragEndEvent) => {
        const { active, over } = evt;
        if (!over || active.id === over.id) return;
        const start = Date.now();
        setSortList((items) => {
            const old = items.findIndex((i) => i.id === active.id);
            const newIdx = items.findIndex((i) => i.id === over.id);
            const reordered = arrayMove(items, old, newIdx);
            track("drag", `Sort List Reorder: ${items[old].text}`, "success", Date.now() - start, { from: old, to: newIdx });
            return reordered;
        });
    };

    const handleGridEnd = (evt: DragEndEvent) => {
        const { active, over } = evt;
        if (!over || active.id === over.id) return;
        const start = Date.now();
        setGrid((tiles) => {
            const oldIdx = tiles.findIndex((t) => t.id === active.id);
            const newIdx = tiles.findIndex((t) => t.id === over.id);
            track("drag", `Grid Rearrange: tile ${oldIdx} → ${newIdx}`, "success", Date.now() - start, { from: oldIdx, to: newIdx });
            return arrayMove(tiles, oldIdx, newIdx);
        });
    };

    // Kanban handlers
    const findKanbanColumn = (id: string): KanbanColumn | null => {
        for (const col of (["todo", "inprogress", "done"] as KanbanColumn[])) {
            if (kanban[col].some((card) => card.id === id)) return col;
        }
        return null;
    };

    const handleKanbanDragStart = (evt: DragStartEvent) => {
        setActiveKanbanId(evt.active.id as string);
        track("drag", `Kanban Drag Start: ${evt.active.id}`, "success", 0);
    };

    const handleKanbanDragEnd = (evt: DragEndEvent) => {
        const { active, over } = evt;
        setActiveKanbanId(null);
        if (!over) return;
        const fromCol = findKanbanColumn(active.id as string);
        const toCol = (["todo", "inprogress", "done"] as KanbanColumn[]).includes(over.id as KanbanColumn)
            ? (over.id as KanbanColumn)
            : findKanbanColumn(over.id as string);
        if (!fromCol || !toCol) return;
        const start = Date.now();
        if (fromCol === toCol) {
            setKanban((k) => {
                const items = k[fromCol];
                const oldIdx = items.findIndex((c) => c.id === active.id);
                const newIdx = items.findIndex((c) => c.id === over.id);
                if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) return k;
                return { ...k, [fromCol]: arrayMove(items, oldIdx, newIdx) };
            });
        } else {
            setKanban((k) => {
                const card = k[fromCol].find((c) => c.id === active.id);
                if (!card) return k;
                track("drag", `Kanban Move: "${card.text}" (${fromCol} → ${toCol})`, "success", Date.now() - start, { from: fromCol, to: toCol });
                return {
                    ...k,
                    [fromCol]: k[fromCol].filter((c) => c.id !== active.id),
                    [toCol]: [...k[toCol], card],
                };
            });
        }
    };

    const handleTrashDragEnd = (evt: DragEndEvent) => {
        const { active, over } = evt;
        setTrashIsOver(false);
        if (!over || over.id !== "trash-zone") return;
        const start = Date.now();
        const item = trashItems.find((i) => i.id === active.id);
        if (!item) return;
        setTrashItems((items) => items.filter((i) => i.id !== active.id));
        setDeleted((prev) => [...prev, item.label]);
        track("drag", `Trash Drop: "${item.label}"`, "success", Date.now() - start, { item: item.label });
    };

    const handleTrashDragOver = (evt: DragOverEvent) => {
        setTrashIsOver(evt.over?.id === "trash-zone");
    };

    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setFileDragOver(false);
        const start = Date.now();
        const files = Array.from(e.dataTransfer.files);
        const info = files.map((f) => ({ name: f.name, size: f.size, type: f.type || "unknown" }));
        setDroppedFiles((prev) => [...prev, ...info]);
        files.forEach((f) => track("file_upload", `File Drop: ${f.name}`, "success", Date.now() - start, { name: f.name, size: f.size }));
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const start = Date.now();
        const files = Array.from(e.target.files);
        const info = files.map((f) => ({ name: f.name, size: f.size, type: f.type || "unknown" }));
        setDroppedFiles((prev) => [...prev, ...info]);
        files.forEach((f) => track("file_upload", `File Pick: ${f.name}`, "success", Date.now() - start));
    };

    const KANBAN_COLS: { id: KanbanColumn; label: string; color: string }[] = [
        { id: "todo", label: "Todo", color: "bg-yellow-400" },
        { id: "inprogress", label: "In Progress", color: "bg-blue-400" },
        { id: "done", label: "Done", color: "bg-green-400" },
    ];

    const activeKanbanCard = activeKanbanId
        ? ([] as KanbanCard[]).concat(...Object.values(kanban)).find((c) => c.id === activeKanbanId)
        : null;

    return (
        <div className="p-6 lg:p-8 max-w-5xl mx-auto">
            {/* ── Page Hero ── */}
            <div
                className="relative rounded-2xl overflow-hidden mb-6 p-5 lg:p-6"
                style={{ background: "linear-gradient(135deg, #7c2d12 0%, #ea580c 100%)", boxShadow: "0 12px 40px -8px rgba(234,88,12,0.45)" }}
            >
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10" style={{ background: "radial-gradient(circle, white, transparent 70%)", transform: "translate(30%,-30%)" }} />
                <div className="relative flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                        <div
                            className="flex items-center justify-center w-11 h-11 rounded-xl flex-shrink-0"
                            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
                        >
                            <Move size={22} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Drag & Drop Test</h1>
                            <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>Sortable lists, Kanban boards, grid rearrange, and file drop.</p>
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
                                style={{ background: "rgba(255,255,255,0.92)", color: "#9a3412" }}
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
                {/* 1. Sortable list */}
                <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">1. Sortable List</CardTitle></CardHeader>
                    <CardContent>
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSortEnd}>
                            <SortableContext items={sortList.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                                <div data-testid="sortable-list" className="space-y-1.5">
                                    {sortList.map((item) => (
                                        <SortableItem key={item.id} id={item.id} label={item.text} />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    </CardContent>
                </Card>

                {/* 2. Kanban */}
                <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">2. Kanban Board</CardTitle></CardHeader>
                    <CardContent>
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleKanbanDragStart} onDragEnd={handleKanbanDragEnd}>
                            <div className="flex gap-3 flex-col sm:flex-row" data-testid="kanban-board">
                                {KANBAN_COLS.map((col) => (
                                    <KanbanColumnDroppable key={col.id} id={col.id} label={col.label} color={col.color}>
                                        <SortableContext items={kanban[col.id].map((c) => c.id)} strategy={verticalListSortingStrategy}>
                                            {kanban[col.id].map((card) => (
                                                <KanbanCardItem key={card.id} id={card.id} text={card.text} />
                                            ))}
                                        </SortableContext>
                                    </KanbanColumnDroppable>
                                ))}
                            </div>
                            <DragOverlay>
                                {activeKanbanCard && (
                                    <div className="px-3 py-2 bg-white border border-blue-400 rounded-lg text-sm shadow-xl rotate-2">
                                        {activeKanbanCard.text}
                                    </div>
                                )}
                            </DragOverlay>
                        </DndContext>
                    </CardContent>
                </Card>

                {/* 3. Drag to trash */}
                <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">3. Drag to Trash</CardTitle></CardHeader>
                    <CardContent>
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleTrashDragEnd} onDragOver={handleTrashDragOver}>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mb-3">
                                <SortableContext items={trashItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                                    {trashItems.map((item) => (
                                        <TrashDraggable key={item.id} id={item.id} label={item.label} />
                                    ))}
                                </SortableContext>
                            </div>
                            <TrashZone isOver={trashIsOver} />
                        </DndContext>
                        {deleted.length > 0 && (
                            <div className="mt-2 text-xs text-slate-500">Deleted: {deleted.join(", ")}</div>
                        )}
                    </CardContent>
                </Card>

                {/* 4. File drop */}
                <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">4. File Drop Zone</CardTitle></CardHeader>
                    <CardContent>
                        <div
                            data-testid="file-drop-zone"
                            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${fileDragOver ? "border-blue-500 bg-blue-50 scale-[1.02]" : "border-slate-200 hover:border-blue-400 hover:bg-slate-50"}`}
                            onDragOver={(e) => { e.preventDefault(); setFileDragOver(true); }}
                            onDragLeave={() => setFileDragOver(false)}
                            onDrop={handleFileDrop}
                            onClick={() => fileRef.current?.click()}
                        >
                            <Trash2 size={28} className="mx-auto mb-2 text-slate-400" />
                            <p className="text-sm text-slate-500 font-medium">Drop files here or <span className="text-blue-600">click to browse</span></p>
                            <input ref={fileRef} type="file" multiple className="hidden" onChange={handleFileInput} />
                        </div>
                        {droppedFiles.length > 0 && (
                            <div className="mt-3 space-y-1.5">
                                {droppedFiles.map((f, i) => (
                                    <div key={i} className="flex items-center justify-between px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-xs">
                                        <span className="text-green-800 font-medium truncate">{f.name}</span>
                                        <Badge className="bg-green-100 text-green-700 ml-2">{(f.size / 1024).toFixed(1)} KB</Badge>
                                    </div>
                                ))}
                                <Button size="sm" variant="ghost" className="text-xs text-slate-400" onClick={() => setDroppedFiles([])}>
                                    <X size={12} className="mr-1" /> Clear
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 5. Grid rearrange */}
                <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">5. Grid Rearrange (2×4)</CardTitle></CardHeader>
                    <CardContent>
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleGridEnd}>
                            <SortableContext items={grid.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                                <div data-testid="grid-rearrange" className="grid grid-cols-4 gap-3">
                                    {grid.map((tile) => (
                                        <GridTile key={tile.id} id={tile.id} color={tile.color} />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    </CardContent>
                </Card>
            </div>

            {showStart && (
                <TestStartModal testName="Drag & Drop Test" category="dragdrop" description="Sortable lists, Kanban board (3 columns), drag-to-trash zone, file drop area, and grid rearrangement — powered by @dnd-kit." onStart={handleStart} />
            )}
            {showResult && completedSess && (
                <TestResultModal session={completedSess} onClose={() => setShowResult(false)} onRestart={handleRestart} />
            )}
            <AnalyticsPanel session={session} isRunning={isRunning} />
        </div>
    );
}
