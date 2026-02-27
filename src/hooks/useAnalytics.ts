"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getEngine, TestSession, OperationType, OperationStatus } from "@/lib/analytics";

export function useAnalytics(testName: string, category: string) {
    const engine = getEngine();
    const [session, setSession] = useState<TestSession | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const sessionRef = useRef<TestSession | null>(null);

    useEffect(() => {
        const unsub = engine.subscribe(() => {
            const current = engine.getCurrentSession();
            setSession(current ? { ...current } : sessionRef.current);
        });
        return unsub;
    }, [engine]);

    const startTest = useCallback(() => {
        const s = engine.startSession(testName, category);
        sessionRef.current = s;
        setSession({ ...s });
        setIsRunning(true);
    }, [engine, testName, category]);

    const endTest = useCallback((): import("@/lib/analytics").TestSession | null => {
        const s = engine.endSession();
        if (s) sessionRef.current = s;
        setSession(sessionRef.current);
        setIsRunning(false);
        return s;
    }, [engine]);

    const track = useCallback(
        (
            type: OperationType,
            label: string,
            status: OperationStatus = "success",
            durationMs?: number,
            meta?: Record<string, unknown>
        ) => {
            return engine.track(type, label, status, durationMs, meta);
        },
        [engine]
    );

    const recordOp = useCallback(
        (type: OperationType, label: string, fn: () => void | Promise<void>, meta?: Record<string, unknown>) => {
            return engine.recordOperation(type, label, fn, meta);
        },
        [engine]
    );

    return { session, isRunning, startTest, endTest, track, recordOp };
}
