import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dynamic Content Test",
    description:
        "Test lazy loading, skeleton screens, infinite scroll, real-time data updates, streaming content, and dynamic DOM mutations for AI agent robustness.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
