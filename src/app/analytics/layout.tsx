import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Analytics Dashboard",
    description:
        "Aggregate metrics and performance insights across all 7 AgentTest Lab test suites. Track scores, operation counts, timing, and session history.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
