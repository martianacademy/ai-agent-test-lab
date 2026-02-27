import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Interactions Test",
    description:
        "Test click targets, hover effects, keyboard events, focus management, double-click, right-click, long-press, and complex UI interaction patterns.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
