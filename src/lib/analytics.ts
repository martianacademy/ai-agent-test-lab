export type OperationType =
    | "click"
    | "input"
    | "navigation"
    | "scroll"
    | "drag"
    | "modal"
    | "form_submit"
    | "hover"
    | "keyboard"
    | "select"
    | "checkbox"
    | "file_upload"
    | "search"
    | "assertion"
    | "custom";

export type OperationStatus = "success" | "failure" | "pending";

export interface Operation {
    id: string;
    type: OperationType;
    label: string;
    status: OperationStatus;
    startTime: number;
    endTime?: number;
    duration?: number;
    meta?: Record<string, unknown>;
    error?: string;
}

export interface TestSession {
    id: string;
    testName: string;
    category: string;
    startTime: number;
    endTime?: number;
    duration?: number;
    operations: Operation[];
    totalOps: number;
    successOps: number;
    failureOps: number;
    avgResponseTime: number;
    minResponseTime: number;
    maxResponseTime: number;
}

const STORAGE_KEY = "ai_agent_test_sessions";

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export class AnalyticsEngine {
    private sessions: TestSession[] = [];
    private currentSession: TestSession | null = null;
    private listeners: Array<() => void> = [];

    constructor() {
        if (typeof window !== "undefined") {
            this.load();
        }
    }

    private load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) this.sessions = JSON.parse(raw);
        } catch {
            this.sessions = [];
        }
    }

    private save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.sessions.slice(-50)));
        } catch { }
    }

    private notify() {
        this.listeners.forEach((fn) => fn());
    }

    subscribe(fn: () => void) {
        this.listeners.push(fn);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== fn);
        };
    }

    startSession(testName: string, category: string): TestSession {
        this.currentSession = {
            id: generateId(),
            testName,
            category,
            startTime: Date.now(),
            operations: [],
            totalOps: 0,
            successOps: 0,
            failureOps: 0,
            avgResponseTime: 0,
            minResponseTime: Infinity,
            maxResponseTime: 0,
        };
        this.notify();
        return this.currentSession;
    }

    endSession(): TestSession | null {
        if (!this.currentSession) return null;
        this.currentSession.endTime = Date.now();
        this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime;
        this.sessions.push({ ...this.currentSession });
        this.save();
        const finished = this.currentSession;
        this.currentSession = null;
        this.notify();
        return finished;
    }

    recordOperation(
        type: OperationType,
        label: string,
        executeFn: () => void | Promise<void>,
        meta?: Record<string, unknown>
    ): Promise<Operation> {
        return new Promise(async (resolve) => {
            const op: Operation = {
                id: generateId(),
                type,
                label,
                status: "pending",
                startTime: Date.now(),
                meta,
            };

            if (this.currentSession) {
                this.currentSession.operations.push(op);
                this.notify();
            }

            try {
                await executeFn();
                op.status = "success";
            } catch (err) {
                op.status = "failure";
                op.error = String(err);
            } finally {
                op.endTime = Date.now();
                op.duration = op.endTime - op.startTime;

                if (this.currentSession) {
                    const session = this.currentSession;
                    session.totalOps++;
                    if (op.status === "success") session.successOps++;
                    else session.failureOps++;

                    const durations = session.operations
                        .filter((o) => o.duration !== undefined)
                        .map((o) => o.duration as number);

                    session.avgResponseTime =
                        durations.reduce((a, b) => a + b, 0) / durations.length;
                    session.minResponseTime = Math.min(...durations);
                    session.maxResponseTime = Math.max(...durations);
                    this.notify();
                }
                resolve(op);
            }
        });
    }

    /** Lightweight instant record — no async execution wrapping */
    track(
        type: OperationType,
        label: string,
        status: OperationStatus = "success",
        durationMs?: number,
        meta?: Record<string, unknown>
    ): Operation {
        const now = Date.now();
        const duration = durationMs ?? 0;
        const op: Operation = {
            id: generateId(),
            type,
            label,
            status,
            startTime: now - duration,
            endTime: now,
            duration,
            meta,
        };

        if (this.currentSession) {
            const session = this.currentSession;
            session.operations.push(op);
            session.totalOps++;
            if (status === "success") session.successOps++;
            else if (status === "failure") session.failureOps++;

            const durations = session.operations
                .filter((o) => o.duration !== undefined && o.duration > 0)
                .map((o) => o.duration as number);

            if (durations.length > 0) {
                session.avgResponseTime = durations.reduce((a, b) => a + b, 0) / durations.length;
                session.minResponseTime = Math.min(...durations);
                session.maxResponseTime = Math.max(...durations);
            }
            this.notify();
        }
        return op;
    }

    getCurrentSession(): TestSession | null {
        return this.currentSession;
    }

    getAllSessions(): TestSession[] {
        return [...this.sessions];
    }

    clearSessions() {
        this.sessions = [];
        this.save();
        this.notify();
    }

    getGlobalStats() {
        const all = this.sessions;
        const totalSessions = all.length;
        const totalOps = all.reduce((a, s) => a + s.totalOps, 0);
        const successOps = all.reduce((a, s) => a + s.successOps, 0);
        const failureOps = all.reduce((a, s) => a + s.failureOps, 0);
        const avgTimes = all.filter((s) => s.avgResponseTime > 0).map((s) => s.avgResponseTime);
        const globalAvgTime =
            avgTimes.length > 0 ? avgTimes.reduce((a, b) => a + b, 0) / avgTimes.length : 0;

        const byCategory: Record<string, number> = {};
        for (const s of all) {
            byCategory[s.category] = (byCategory[s.category] ?? 0) + 1;
        }

        return {
            totalSessions,
            totalOps,
            successOps,
            failureOps,
            successRate: totalOps > 0 ? (successOps / totalOps) * 100 : 0,
            globalAvgTime,
            byCategory,
        };
    }
}

// Singleton
let _engine: AnalyticsEngine | null = null;
export function getEngine(): AnalyticsEngine {
    if (!_engine) _engine = new AnalyticsEngine();
    return _engine;
}
